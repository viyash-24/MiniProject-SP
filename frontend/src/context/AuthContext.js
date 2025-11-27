import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { auth, googleProvider, db } from "../firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  getAdditionalUserInfo,
} from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
// AuthContext to provide user and admin state
const AuthContext = createContext({ user: null, isAdmin: false });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);

  // Listen to the Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Firestore-based admin role check OR hardcoded admin override
  useEffect(() => {
    setIsAdmin(false);
    setAdminLoading(true);

    const email = user?.email?.toLowerCase();
    const hardcodedAdmin = email === "admin@gmail.com";

    if (!email) {
      setAdminLoading(false);
      return;
    }

    // If hardcoded admin email, grant admin immediately without subscribing
    if (hardcodedAdmin) {
      setIsAdmin(true);
      setAdminLoading(false);
      return;
    }

    const ref = doc(db, "admins", email);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const exists = snap.exists();
        const data = exists ? snap.data() : {};
        setIsAdmin(!!exists && (data.active ?? true));
        setAdminLoading(false);
      },
      () => {
        setIsAdmin(false);
        setAdminLoading(false);
      }
    );

    return () => unsub();
  }, [user?.email]);

  const googlePromiseRef = useRef(null);
  const loginWithGoogle = async () => {
    if (googlePromiseRef.current) return googlePromiseRef.current;
    const API_URL =
      process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    const p = (async () => {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result?.user;
      const info = getAdditionalUserInfo(result);
      const email = (u?.email || u?.providerData?.[0]?.email || "")
        .toLowerCase()
        .trim();
      const name = u?.displayName || (email ? email.split("@")[0] : "User");

      if (info?.isNewUser && u?.uid && email) {
        await setDoc(
          doc(db, "users", u.uid),
          {
            uid: u.uid,
            name: name || "",
            email,
            phone: "",
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );

        try {
          await fetch(`${API_URL}/auth/enroll-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: email, name }),
          });
        } catch (_) {}
      }
      return u;
    })();
    googlePromiseRef.current = p.finally(() => {
      googlePromiseRef.current = null;
    });
    return p;
  };

  // Register using email/password and create a Firestore user document
  const registerWithEmail = async (name, email, password, phone) => {
    const e = (email || "").toLowerCase().trim();
    const userCred = await createUserWithEmailAndPassword(auth, e, password);
    const u = userCred.user;
    // set display name on user profile
    try {
      await updateProfile(u, { displayName: name });
    } catch (err) {
      // non-fatal if updateProfile fails
    }

    // Create a basic user document in Firestore
    await setDoc(doc(db, "users", u.uid), {
      uid: u.uid,
      name: name || "",
      email: e,
      phone: phone || "",
      createdAt: new Date().toISOString(),
    });
  };

  // Email/password login with special-case support for admin@gmail.com/admin
  const loginWithEmailPassword = async (email, password) => {
    const e = (email || "").toLowerCase().trim();
    const p = password || "";

    try {
      await signInWithEmailAndPassword(auth, e, p);
    } catch (err) {
      // If the admin hardcoded user doesn't exist yet, create it on the fly
      if (
        e === "admin@gmail.com" &&
        p === "admin123" &&
        err?.code === "auth/user-not-found"
      ) {
        await createUserWithEmailAndPassword(auth, e, p);
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const loading = authLoading || adminLoading;
  const value = {
    user,
    isAdmin,
    loading,
    loginWithGoogle,
    loginWithEmailPassword,
    registerWithEmail,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
