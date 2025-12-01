import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import SelectSlotPopup from "../components/SelectSlotPopup";
import MapPicker from "../components/MapPicker";
import useStats from "../hooks/useStats";
import StatsCard from "../components/StatsCard";

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
      active
        ? "bg-primary/10 text-primary shadow-sm dark:bg-primary/20 dark:text-primary-light"
        : "text-gray-600 hover:text-primary hover:bg-gray-50/70 dark:text-slate-300 dark:hover:text-primary-light dark:hover:bg-slate-800/70"
    }`}
  >
    {children}
  </button>
);

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { stats, loading: statsLoading, error: statsError } = useStats();

  // Add page fade-in animation
  useEffect(() => {
    document.body.classList.add('page-fade-in');
    return () => document.body.classList.remove('page-fade-in');
  }, []);

  const [tab, setTab] = useState("vehicles");
  const [showAddForm, setShowAddForm] = useState(false);
  const [q, setQ] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [usersList, setUsersList] = useState([]);
 // const [slots, setSlots] = useState([]);
  const [payments, setPayments] = useState([]);
  const [parkingAreas, setParkingAreas] = useState([]);
  const [parkingCharges, setParkingCharges] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "" });
  const [newVehicle, setNewVehicle] = useState({
    plate: "",
    slotName: "",
    vehicleType: "Car",
  });
  const [newSlot, setNewSlot] = useState({ name: "", total: 50 });
  const [selectedParkingArea, setSelectedParkingArea] = useState("");
  const [newCharge, setNewCharge] = useState({
    vehicleType: "Car",
    amount: "",
    duration: "per hour",
    description: "",
  });
  const [editingCharge, setEditingCharge] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showSlotPopup, setShowSlotPopup] = useState(false);
  const [selectedSlotNumber, setSelectedSlotNumber] = useState(null);
  const [newParkingArea, setNewParkingArea] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    slotAmount: 20,
    photo: "",
  });

  const vehicleTypes = [
    "Car",
    "Bike",
    "Van",
    "Auto",
    "SUV",
    "Scooter",
    "Other",
  ];

  const tabs = [
    { id: "vehicles", name: "Vehicles" },
    { id: "users", name: "Users" },
    { id: "payments", name: "Payments" },
    { id: "parking-areas", name: "Parking Areas" },
    { id: "parking-charges", name: "Parking Charges" },
  ];

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const authHeader = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-admin-email": user?.email || "",
    }),
    [user?.email]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          vehiclesRes,
          usersRes,
          slotsRes,
          paymentsRes,
          parkingAreasRes,
          parkingChargesRes,
        ] = await Promise.all([
          fetch(`${API_URL}/vehicles`, { headers: authHeader }),
          fetch(`${API_URL}/users`, { headers: authHeader }),
          fetch(`${API_URL}/slots`, { headers: authHeader }),
          fetch(`${API_URL}/payments`, { headers: authHeader }),
          fetch(`${API_URL}/parking-areas`, { headers: authHeader }),
          fetch(`${API_URL}/parking-charges`, { headers: authHeader }),
        ]);

        setVehicles((await vehiclesRes.json()).vehicles || []);
        setUsersList((await usersRes.json()).users || []);
       // setSlots((await slotsRes.json()).slots || []);
        setPayments((await paymentsRes.json()).payments || []);
        setParkingAreas((await parkingAreasRes.json()).parkingAreas || []);
        setParkingCharges((await parkingChargesRes.json()).charges || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data");
      }
    };
    if (user?.email) fetchData();
  }, [user?.email, authHeader, API_URL]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) =>
      [v.userEmail, v.plate, v.slotName, v.status, v.userPhone, v.userName]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase())
    );
  }, [vehicles, q]);

  const filteredParkingAreas = useMemo(() => {
    return parkingAreas.filter((area) =>
      [area.name, area.address, area.status]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase())
    );
  }, [parkingAreas, q]);

  const fetchAvailableSlotsForArea = async (parkingAreaId) => {
    if (!parkingAreaId) {
      setAvailableSlots([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/slot-management/parking-areas/${parkingAreaId}/available-slots`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch available slots");
      }
      setAvailableSlots(data.availableSlots || []);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error(error.message || "Failed to fetch available slots");
      setAvailableSlots([]);
    }
  };

  const createUserAndVehicle = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newVehicle.plate) return;

    const promise = async () => {
      // create user
      const userRes = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify(newUser),
      });
      const userData = await userRes.json();
      if (!userRes.ok)
        throw new Error(userData.error || "Failed to create user");

      // Update users list with the returned user data
      if (userData.user) {
        setUsersList((prev) => {
          const existingUserIndex = prev.findIndex(
            (u) => u.email === userData.user.email
          );
          if (existingUserIndex >= 0) {
            // Update existing user
            const updated = [...prev];
            updated[existingUserIndex] = userData.user;
            return updated;
          } else {
            // Add new user to the system
            return [userData.user, ...prev];
          }
        });
      }

      if (selectedParkingArea && selectedSlotNumber !== null) {
        const slotRes = await fetch(`${API_URL}/slot-management/register-user`, {
          method: "POST",
          headers: authHeader,
          body: JSON.stringify({
            plate: newVehicle.plate,
            userEmail: newUser.email,
            userName: newUser.name,
            userPhone: newUser.phone,
            vehicleType: newVehicle.vehicleType,
            parkingAreaId: selectedParkingArea,
            slotNumber: selectedSlotNumber,
            createdBy: user?.email || "admin",
          }),
        });
        const slotData = await slotRes.json();
        if (!slotRes.ok)
          throw new Error(slotData.error || "Failed to create vehicle");

        const vehicleFromApi = slotData.vehicle;
        const normalizedVehicle = vehicleFromApi
          ? {
              ...vehicleFromApi,
              parkingAreaId:
                vehicleFromApi.parkingAreaId && vehicleFromApi.parkingAreaId._id
                  ? vehicleFromApi.parkingAreaId._id
                  : vehicleFromApi.parkingAreaId,
            }
          : null;

        if (normalizedVehicle) {
          setVehicles((prev) => [normalizedVehicle, ...prev]);
        }

        const updatedArea = slotData.parkingArea;
        if (updatedArea && updatedArea._id) {
          setParkingAreas((prev) =>
            prev.map((area) =>
              area._id === updatedArea._id ? { ...area, ...updatedArea } : area
            )
          );
        }
      } else {
        const vehicleRes = await fetch(`${API_URL}/vehicles`, {
          method: "POST",
          headers: authHeader,
          body: JSON.stringify({
            plate: newVehicle.plate,
            slotName: newVehicle.slotName || "",
            userEmail: newUser.email,
            userName: newUser.name,
            userPhone: newUser.phone,
            vehicleType: newVehicle.vehicleType,
            parkingAreaId: selectedParkingArea || undefined,
          }),
        });
        const vehicleData = await vehicleRes.json();
        if (!vehicleRes.ok)
          throw new Error(vehicleData.error || "Failed to create vehicle");
        setVehicles((prev) => [vehicleData.vehicle, ...prev]);
      }

      setNewUser({ name: "", email: "", phone: "" });
      setNewVehicle({ plate: "", slotName: "", vehicleType: "Car" });
      setSelectedParkingArea("");
      setSelectedSlotNumber(null);
      setAvailableSlots([]);
      setShowAddForm(false);

      // Return success message based on whether user was re-registered or new
      return userData.message || "User and vehicle created successfully!";
    };

    toast.promise(promise(), {
      loading: "Creating user and vehicle...",
      success: (message) => message,
      error: (err) => err.message || "An error occurred.",
    });
  };

  const markPaid = async (vehicle) => {
    const promise = async () => {
      // First mark as paid
      const res = await fetch(`${API_URL}/vehicles/${vehicle._id}/pay`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ method: "Cash" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark as paid");
      }

      const data = await res.json();

      // Update the vehicle in the UI
      setVehicles((prev) =>
        prev.map((v) => (v._id === vehicle._id ? data.vehicle : v))
      );

      // Show success message with receipt info
      return `Payment marked as paid. Receipt sent to ${
        vehicle.userPhone ? "phone" : "email"
      }`;
    };

    toast.promise(promise(), {
      loading: "Processing payment and generating receipt...",
      success: (message) => message,
      error: (err) => err.message || "Failed to process payment",
    });
  };

  const exitVehicle = async (v) => {
    const promise = async () => {
      // Always prefer the slot-management exit to keep slots[] in sync.
      // If it fails for any reason, fall back to the legacy vehicles exit.
      let usedFallback = false;
      let data;
      try {
        const res = await fetch(
          `${API_URL}/slot-management/exit-user/${v._id}`,
          {
            method: "PUT",
            headers: authHeader,
            body: JSON.stringify({ exitTime: new Date().toISOString() }),
          }
        );
        data = await res.json();
        if (!res.ok) throw new Error(data.error || "Slot-managed exit failed");
      } catch (err) {
        usedFallback = true;
        const res = await fetch(`${API_URL}/vehicles/${v._id}/exit`, {
          method: "POST",
          headers: authHeader,
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to exit vehicle");
      }

      // Update the vehicle status locally
      setVehicles((prev) =>
        prev.map((item) =>
          item._id === v._id
            ? {
                ...item,
                status: data.vehicle?.status || "Exited",
                exitTime: data.vehicle?.exitTime || item.exitTime,
              }
            : item
        )
      );

      // If slot-management responded with updated area, sync counts
      const updatedArea = data.parkingArea;
      if (!usedFallback && updatedArea && updatedArea._id) {
        setParkingAreas((prev) =>
          prev.map((area) =>
            area._id === updatedArea._id ? { ...area, ...updatedArea } : area
          )
        );
      }
    };

    toast.promise(promise(), {
      loading: "Processing exit...",
      success: "Vehicle exited!",
      error: (err) => err.message || "An error occurred.",
    });
  };

  {/*const updateSlot = async (s, next) => {
    try {
      const res = await fetch(`${API_URL}/slots/${s._id}`, {
        method: "PUT",
        headers: authHeader,
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update slot");
      setSlots((prev) =>
        prev.map((item) => (item._id === s._id ? data.slot : item))
      );
      toast.success("Slot updated!");
    } catch (error) {
      toast.error(error.message || "Failed to update slot");
    }
  };

  const createSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.name || !newSlot.total) return;

    const promise = async () => {
      const res = await fetch(`${API_URL}/slots`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ ...newSlot, free: newSlot.total }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create slot");
      setSlots((prev) => [data.slot, ...prev]);
      setNewSlot({ name: "", total: 50 }); // reset form
    };

    toast.promise(promise(), {
      loading: "Creating slot...",
      success: "Slot created!",
      error: (err) => err.message || "An error occurred.",
    });
  };
*/}

  const resetParkingAreaForm = () =>
    setNewParkingArea({
      name: "",
      address: "",
      latitude: "",
      longitude: "",
      slotAmount: "",
      photo: "",
    });

  const createParkingArea = async (e) => {
    e.preventDefault();
    const { name, address, latitude, longitude, slotAmount, photo } =
      newParkingArea;

    if (!name.trim() || !address.trim() || !latitude || !longitude) {
      toast.error("Please fill in name, address, and coordinates");
      return;
    }

    const parsedLat = Number(latitude);
    const parsedLng = Number(longitude);
    const parsedSlots = Number(slotAmount);

    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
      toast.error("Latitude and longitude must be valid numbers");
      return;
    }

    if (!Number.isFinite(parsedSlots) || parsedSlots <= 0) {
      toast.error("Total slots must be greater than 0");
      return;
    }

    const promise = async () => {
      const res = await fetch(`${API_URL}/parking-areas`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          slotAmount: parsedSlots,
          photo: photo?.trim() || undefined,
          location: {
            latitude: parsedLat,
            longitude: parsedLng,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create area");

      setParkingAreas((prev) => [data.parkingArea, ...prev]);
      resetParkingAreaForm();
      return "Parking area created!";
    };

    toast.promise(promise(), {
      loading: "Creating parking area...",
      success: (msg) => msg,
      error: (err) => err.message || "Failed to create parking area",
    });
  };

  const updateParkingAreaDetails = async (areaId, payload, successMsg) => {
    const res = await fetch(`${API_URL}/parking-areas/${areaId}`, {
      method: "PUT",
      headers: authHeader,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update area");
    setParkingAreas((prev) =>
      prev.map((area) => (area._id === areaId ? data.parkingArea : area))
    );
    if (successMsg) toast.success(successMsg);
  };

  const toggleParkingAreaStatus = async (area) => {
    const promise = async () => {
      await updateParkingAreaDetails(area._id, { active: !area.active });
      return area.active ? "Parking area deactivated" : "Parking area activated";
    };

    toast.promise(promise(), {
      loading: "Updating status...",
      success: (msg) => msg,
      error: (err) => err.message || "Failed to update status",
    });
  };

  const deleteParkingAreaEntry = async (areaId) => {
    if (
      !window.confirm(
        "Delete this parking area? This cannot be undone and may impact active slots."
      )
    ) {
      return;
    }

    const promise = async () => {
      const res = await fetch(`${API_URL}/parking-areas/${areaId}`, {
        method: "DELETE",
        headers: authHeader,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete area");
      setParkingAreas((prev) => prev.filter((area) => area._id !== areaId));
      return "Parking area deleted";
    };

    toast.promise(promise(), {
      loading: "Deleting area...",
      success: (msg) => msg,
      error: (err) => err.message || "Failed to delete parking area",
    });
  };

  const resetChargeForm = () => {
    setNewCharge({
      vehicleType: "Car",
      amount: "",
      duration: "per hour",
      description: "",
    });
    setEditingCharge(null);
  };

  // Parking Charges Management Functions
  const createOrUpdateParkingCharge = async (e) => {
    e.preventDefault();
    if (!newCharge.vehicleType || !newCharge.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const parsedAmount = Number(newCharge.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }

    const promise = async () => {
      const url = editingCharge
        ? `${API_URL}/parking-charges/${editingCharge._id}`
        : `${API_URL}/parking-charges`;

      const res = await fetch(url, {
        method: editingCharge ? "PUT" : "POST",
        headers: authHeader,
        body: JSON.stringify({
          vehicleType: newCharge.vehicleType,
          amount: parsedAmount,
          duration: newCharge.duration,
          description: newCharge.description,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to save parking charge");

      if (editingCharge) {
        setParkingCharges((prev) =>
          prev.map((c) => (c._id === data.charge._id ? data.charge : c))
        );
      } else {
        setParkingCharges((prev) => [data.charge, ...prev]);
      }

      resetChargeForm();

      return editingCharge
        ? "Parking charge updated!"
        : "Parking charge created!";
    };

    toast.promise(promise(), {
      loading: editingCharge ? "Updating charge..." : "Creating charge...",
      success: (msg) => msg,
      error: (err) => err.message || "An error occurred.",
    });
  };

  const deleteParkingCharge = async (chargeId) => {
    if (!window.confirm("Are you sure you want to delete this parking charge?"))
      return;

    const promise = async () => {
      const res = await fetch(`${API_URL}/parking-charges/${chargeId}`, {
        method: "DELETE",
        headers: authHeader,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete parking charge");
      }

      setParkingCharges((prev) => prev.filter((c) => c._id !== chargeId));
    };

    toast.promise(promise(), {
      loading: "Deleting charge...",
      success: "Parking charge deleted!",
      error: (err) => err.message || "An error occurred.",
    });
  };

  const editParkingCharge = (charge) => {
    setNewCharge({
      vehicleType: charge.vehicleType,
      amount: charge.amount,
      duration: charge.duration || "per hour",
      description: charge.description || "",
    });
    setEditingCharge(charge);
  };

  const toggleChargeStatus = async (charge) => {
    const promise = async () => {
      const res = await fetch(`${API_URL}/parking-charges/${charge._id}`, {
        method: "PUT",
        headers: authHeader,
        body: JSON.stringify({ isActive: !charge.isActive }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update charge");

      setParkingCharges((prev) =>
        prev.map((c) => (c._id === data.charge._id ? data.charge : c))
      );
      return charge.isActive ? "Charge deactivated" : "Charge activated";
    };

    toast.promise(promise(), {
      loading: "Updating charge...",
      success: (msg) => msg,
      error: (err) => err.message || "Failed to update charge",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-slate-300">
              Welcome, <span className="font-medium text-primary dark:text-primary-light">{user?.displayName || 'Admin'}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Statistics */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 text-center mb-6">System Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Parking Areas"
              value={stats.totalParkingAreas}
              loading={statsLoading}
              color="blue"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
            <StatsCard
              title="Current Active Users"
              value={stats.dailyActiveUsers}
              loading={statsLoading}
              color="green"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
            />
            <StatsCard
              title="Total Vehicles"
              value={stats.totalVehicles}
              loading={statsLoading}
              color="purple"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              }
            />
            <StatsCard
              title="Total Revenue"
              value={`RS. ${stats.totalRevenue.toLocaleString()}`}
              loading={statsLoading}
              color="orange"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
            />
          </div>

          {statsError && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-300 text-sm">Failed to load statistics: {statsError}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Management Console</h1>
            <p className="text-gray-600 dark:text-slate-400">
              Manage Users, Vehicles, ParkingArea, ParkingCharges and payments.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20 transition-colors btn-soft"
              onClick={() => setShowAddForm(true)}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add User & Vehicle
              </span>
            </button>
           
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex space-x-4 border-b mb-6 overflow-x-auto">
            {tabs.map(({ id, name }) => (
              <TabButton
                key={id}
                active={tab === id}
                onClick={() => {
                  setTab(id);
                  setShowAddForm(false);
                }}
              >
                {name}
                {id === "vehicles" && `(${vehicles.length})`}
                {id === "users" && `(${usersList.length})`}
                {/*{id === "slots" && `(${slots.length})`}*/}
                {id === "payments" && `(${payments.length})`}
                {id === "parking-areas" && `(${parkingAreas.length})`}
                {id === "parking-charges" && `(${parkingCharges.length})`}
              </TabButton>
            ))}
          </div>

          {showAddForm && (
            <div className="p-4">
              <form
                onSubmit={createUserAndVehicle}
                className="grid sm:grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">User Details</h3>
                  <input
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((u) => ({ ...u, name: e.target.value }))
                    }
                    className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  />
                  <input
                    placeholder="Email"
                    required
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((u) => ({ ...u, email: e.target.value }))
                    }
                    className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  />
                  <input
                    placeholder="Phone"
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser((u) => ({ ...u, phone: e.target.value }))
                    }
                    className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Vehicle Details</h3>
                  <input
                    placeholder="Plate (e.g. ABC-2234)"
                    required
                    value={newVehicle.plate}
                    onChange={(e) =>
                      setNewVehicle((v) => ({ ...v, plate: e.target.value }))
                    }
                    className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  />

                  <select
                    value={newVehicle.vehicleType}
                    onChange={(e) =>
                      setNewVehicle((v) => ({
                        ...v,
                        vehicleType: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  >
                    {vehicleTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedParkingArea}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedParkingArea(value);
                      setSelectedSlotNumber(null);
                      setAvailableSlots([]);
                      setNewVehicle((v) => ({ ...v, slotName: "" }));
                    }}
                    className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  >
                    <option value="">Select Parking Area (Optional)</option>
                    {parkingAreas
                      .filter((area) => area.active)
                      .map((area) => (
                        <option key={area._id} value={area._id}>
                          {area.name} ({area.availableSlots || 0}/
                          {area.totalSlots || area.slotAmount} slots available)
                        </option>
                      ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      placeholder="Slot (optional)"
                      value={newVehicle.slotName}
                      readOnly
                      className="flex-1 rounded-md border-gray-300 focus:border-primary focus:ring-primary bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      disabled={!selectedParkingArea}
                      onClick={async () => {
                        if (!selectedParkingArea) {
                          toast.error("Please select a parking area first");
                          return;
                        }
                        await fetchAvailableSlotsForArea(selectedParkingArea);
                        setShowSlotPopup(true);
                      }}
                      className="px-3 py-2 rounded-md bg-primary text-white disabled:bg-gray-400 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      Select Slot
                    </button>
                  </div>
                  <button className="w-full px-4 py-2 rounded-md bg-gray-900 text-white h-10 hover:bg-gray-800 dark:bg-primary dark:text-white dark:hover:bg-primary/90">
                    Add User & Vehicle
                  </button>
                </div>
              </form>
            </div>
          )}

          {tab === "vehicles" && (
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search vehicles, users, status..."
                  className="w-72 border border-gray-300 bg-white text-gray-900 rounded-lg focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                />
                <div className="text-sm text-gray-600 dark:text-slate-400">
                  Total: {filteredVehicles.length}
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b border-gray-100 bg-gray-50/80 dark:text-slate-300 dark:border-slate-800 dark:bg-slate-900/80">
                      <th className="py-3 pr-4">Plate</th>
                      <th className="py-3 pr-4">Vehicle Type</th>
                      <th className="py-3 pr-4">User</th>
                      <th className="py-3 pr-4">Phone</th>
                      <th className="py-3 pr-4 text-center">Parking Area</th>
                      <th className="py-3 pr-4 text-center">Status</th>
                      <th className="py-3 pr-4 text-center">Payment</th>
                      <th className="py-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map((v) => (
                      <tr
                        key={v._id}
                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                      >
                        <td className="py-3 pr-4 whitespace-nowrap text-gray-900 dark:text-slate-50">{v.plate}</td>
                        <td className="py-3 pr-4 text-gray-700 dark:text-slate-300">{v.vehicleType || "-"}</td>
                        <td className="py-3 pr-4 text-gray-900 dark:text-slate-100">
                          {v.userName || v.userEmail || "-"}
                        </td>
                        <td className="py-3 pr-4 text-gray-700 dark:text-slate-300">{v.userPhone || "-"}</td>
                        <td className="py-3 pr-4 text-center">
                          {v.parkingAreaId
                            ? parkingAreas.find(
                                (area) => area._id === v.parkingAreaId
                              )?.name || "Unknown Area"
                            : v.slotName || "-"}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              v.status === "Parked"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                                : v.status === "Paid"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                : v.status === "Exited"
                                ? "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            }`}
                          >
                            {v.status || "-"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-center text-gray-800 dark:text-slate-200">
                          {v.paymentStatus || "Unpaid"}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <div className="inline-flex gap-2">
                            {v.paymentStatus !== "Paid" && (
                              <button
                                className="px-2 py-1 rounded-md border text-xs border-gray-300 text-gray-800 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                                onClick={() => markPaid(v)}
                              >
                                Mark as Paid
                              </button>
                            )}
                            {v.status !== "Exited" && (
                              <button
                                className="px-2 py-1 rounded-md bg-gray-900 text-white text-xs hover:bg-gray-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-60"
                                onClick={() => exitVehicle(v)}
                                disabled={v.paymentStatus !== "Paid"}
                              >
                                Exit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="p-4">
              <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b border-gray-100 bg-gray-50/80 dark:text-slate-300 dark:border-slate-800 dark:bg-slate-900/80">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Phone</th>
                      <th className="py-3 pr-4">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr
                        key={u._id}
                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                      >
                        <td className="py-3 pr-4 whitespace-nowrap text-gray-900 dark:text-slate-50">
                          {u.name || "-"}
                        </td>
                        <td className="py-3 pr-4 text-gray-800 dark:text-slate-200">{u.email}</td>
                        <td className="py-3 pr-4 text-gray-700 dark:text-slate-300">{u.phone || "-"}</td>
                        <td className="py-3 pr-4 text-gray-700 dark:text-slate-300">{u.role || "user"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

         {/* {tab === "slots" && (
            <div className="p-4">
              <form
                onSubmit={createSlot}
                className="mb-6 p-4 border rounded-lg flex items-end gap-3 bg-white shadow-sm border-gray-200 dark:bg-slate-900/80 dark:border-slate-800"
              >
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                    Area Name
                  </label>
                  <input
                    placeholder="e.g. Basement A"
                    value={newSlot.name}
                    onChange={(e) =>
                      setNewSlot((s) => ({ ...s, name: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                    Total Spots
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSlot.total}
                    onChange={(e) =>
                      setNewSlot((s) => ({ ...s, total: Number(e.target.value) }))
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                    required
                  />
                </div>
                <button className="px-4 py-2 rounded-md bg-gray-900 text-white h-10 hover:bg-gray-800 dark:bg-primary dark:text-white dark:hover:bg-primary/90">
                  Create Slot
                </button>
              </form>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((s) => (
                  <div
                    key={s._id}
                    className="p-5 border rounded-xl bg-white shadow-sm border-gray-200 dark:bg-slate-900/80 dark:border-slate-800"
                  >
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {s.area || s.name || "Area"}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-slate-50">
                      {s.free ?? 0} / {s.total ?? 0} free
                    </div>
                    <div className="mt-3 h-2 bg-gray-100 rounded dark:bg-slate-800">
                      <div
                        className="h-2 bg-green-500 rounded dark:bg-green-400"
                        style={{
                          width: `${
                            Math.max(
                              0,
                              Math.min(1, (s.free || 0) / (s.total || 1))
                            ) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="0"
                        defaultValue={s.total ?? 0}
                        onBlur={(e) =>
                          updateSlot(s, {
                            total: Number(e.target.value),
                            free: s.free ?? 0,
                          })
                        }
                        className="rounded-md border-gray-300 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                      />
                      <input
                        type="number"
                        min="0"
                        defaultValue={s.free ?? 0}
                        onBlur={(e) =>
                          updateSlot(s, {
                            total: s.total ?? 0,
                            free: Number(e.target.value),
                          })
                        }
                        className="rounded-md border-gray-300 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          */}

          {tab === "payments" && (
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-50">
                  Payment History
                </h2>
                <p className="text-sm text-gray-600 mt-1 dark:text-slate-400">
                  Complete payment records from all transactions (View Only)
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b border-gray-100 bg-gray-50 dark:text-slate-300 dark:border-slate-800 dark:bg-slate-900/80">
                      <th className="py-3 px-4 font-medium">
                        Vehicle Number Plate
                      </th>
                      <th className="py-3 px-4 font-medium">Vehicle Type</th>
                      <th className="py-3 px-4 font-medium">User Name</th>
                      <th className="py-3 px-4 font-medium">User Email</th>
                      <th className="py-3 px-4 font-medium">Payment Amount</th>
                      <th className="py-3 px-4 font-medium">
                        Payment Date & Time
                      </th>
                      <th className="py-3 px-4 font-medium">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr
                        key={p._id}
                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-slate-50">
                            {p.vehiclePlate || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-100">
                            {p.vehicleType || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-900 dark:text-slate-100">
                            {p.userName || "N/A"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600 dark:text-slate-400">
                            {p.userEmail || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            RS.{p.amount || 0}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900 dark:text-slate-100">
                            {p.paymentDate
                              ? new Date(p.paymentDate).toLocaleDateString()
                              : p.createdAt
                              ? new Date(p.createdAt).toLocaleDateString()
                              : "-"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            {p.paymentDate
                              ? new Date(p.paymentDate).toLocaleTimeString()
                              : p.createdAt
                              ? new Date(p.createdAt).toLocaleTimeString()
                              : "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              p.status === "Success" || p.status === "Paid"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                : p.status === "Failed"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                : p.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                                : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {p.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {payments.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4 dark:bg-slate-800">
                    <svg
                      className="h-6 w-6 text-gray-400 dark:text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2 dark:text-slate-100">
                    No payment records yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Payment records will appear here once users make payments.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === "parking-areas" && (
            <div className="p-4 space-y-6">
              <form
                onSubmit={createParkingArea}
                className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:grid-cols-2"
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
                      Area Name
                    </label>
                    <input
                      value={newParkingArea.name}
                      onChange={(e) =>
                        setNewParkingArea((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                      placeholder="e.g., Basement Block A"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
                      Address / Notes
                    </label>
                    <textarea
                      value={newParkingArea.address}
                      onChange={(e) =>
                        setNewParkingArea((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      required
                      rows={3}
                      placeholder="Full address or quick directions"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={newParkingArea.latitude}
                        onChange={(e) =>
                          setNewParkingArea((prev) => ({
                            ...prev,
                            latitude: e.target.value,
                          }))
                        }
                        required
                        placeholder="12.9716"
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={newParkingArea.longitude}
                        onChange={(e) =>
                          setNewParkingArea((prev) => ({
                            ...prev,
                            longitude: e.target.value,
                          }))
                        }
                        required
                        placeholder="77.5946"
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
                      Photo URL (optional)
                    </label>
                    <input
                      value={newParkingArea.photo}
                      onChange={(e) =>
                        setNewParkingArea((prev) => ({
                          ...prev,
                          photo: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/photo.jpg"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
                      Total Slots
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newParkingArea.slotAmount}
                      onChange={(e) =>
                        setNewParkingArea((prev) => ({
                          ...prev,
                          slotAmount: e.target.value,
                        }))
                      }
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <MapPicker
                    latitude={
                      newParkingArea.latitude
                        ? Number(newParkingArea.latitude)
                        : undefined
                    }
                    longitude={
                      newParkingArea.longitude
                        ? Number(newParkingArea.longitude)
                        : undefined
                    }
                    onLocationChange={(lat, lng) =>
                      setNewParkingArea((prev) => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                      }))
                    }
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-white shadow-primary/30 transition hover:bg-primary-dark"
                    >
                      Add Parking Area
                    </button>
                    <button
                      type="button"
                      onClick={resetParkingAreaForm}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </form>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search parking areas..."
                  className="w-full flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:w-72"
                />
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  Total: {filteredParkingAreas.length}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredParkingAreas.map((area) => {
                  const totalSlots =
                    area.totalSlots ?? area.slotAmount ?? area.slots?.length ?? 0;
                  const availableSlots = area.availableSlots ?? 0;
                  const occupiedSlots =
                    area.occupiedSlots ??
                    Math.max(0, totalSlots - availableSlots);

                  return (
                    <div
                      key={area._id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">
                            {area.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            {area.address}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            area.active
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-gray-200 text-gray-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {area.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-slate-300">
                        <div className="flex justify-between">
                          <span>Total Slots</span>
                          <span className="font-semibold text-gray-900 dark:text-slate-50">
                            {totalSlots}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Occupied</span>
                          <span>{occupiedSlots}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Available</span>
                          <span>{availableSlots}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleParkingAreaStatus(area)}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {area.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => deleteParkingAreaEntry(area._id)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredParkingAreas.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                  No parking areas yet. Use the form above to add your first
                  area.
                </div>
              )}
            </div>
          )}

          {tab === "parking-charges" && (
            <div className="p-4 space-y-6">
              <form
                onSubmit={createOrUpdateParkingCharge}
                className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:grid-cols-2"
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
                      Vehicle Type
                    </label>
                    <select
                      value={newCharge.vehicleType}
                      onChange={(e) =>
                        setNewCharge((prev) => ({
                          ...prev,
                          vehicleType: e.target.value,
                        }))
                      }
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      {vehicleTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
                        Amount (RS)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newCharge.amount}
                        onChange={(e) =>
                          setNewCharge((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        required
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
                        Duration
                      </label>
                      <select
                        value={newCharge.duration}
                        onChange={(e) =>
                          setNewCharge((prev) => ({
                            ...prev,
                            duration: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <option value="per hour">Per hour</option>
                        <option value="per day">Per day</option>
                        <option value="per entry">Per entry</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={newCharge.description}
                      onChange={(e) =>
                        setNewCharge((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Optional note shown to users"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-white shadow-primary/30 transition hover:bg-primary-dark"
                    >
                      {editingCharge ? "Update Charge" : "Add Charge"}
                    </button>
                    {editingCharge && (
                      <button
                        type="button"
                        onClick={resetChargeForm}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {parkingCharges.map((charge) => (
                  <div
                    key={charge._id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          Vehicle Type
                        </p>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
                          {charge.vehicleType}
                        </h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          charge.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-gray-200 text-gray-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {charge.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-4 text-sm text-gray-600 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>Amount</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-slate-50">
                          RS.{charge.amount}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span>Duration</span>
                        <span>{charge.duration}</span>
                      </div>
                      {charge.description && (
                        <p className="mt-3 text-xs text-gray-500 dark:text-slate-400">
                          {charge.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => editParkingCharge(charge)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleChargeStatus(charge)}
                        className="rounded-lg border border-blue-200 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:border-blue-500/40 dark:text-blue-300 dark:hover:bg-blue-500/10"
                      >
                        {charge.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => deleteParkingCharge(charge._id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {parkingCharges.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                  No parking charges configured yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SelectSlotPopup
        isOpen={showSlotPopup}
        slots={availableSlots}
        onClose={() => setShowSlotPopup(false)}
        onSelect={(slotNumber) => {
          setSelectedSlotNumber(slotNumber);
          setNewVehicle((prev) => ({ ...prev, slotName: `Slot ${slotNumber}` }));
          setShowSlotPopup(false);
          toast.success(`Slot ${slotNumber} selected`);
        }}
      />
    </div>
  );
};

export default AdminDashboardPage;