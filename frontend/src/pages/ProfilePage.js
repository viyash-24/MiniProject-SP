import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoURL || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return toast.error('No authenticated user');
    setLoading(true);
    try {
      // Update displayName / photoURL
      if ((displayName !== user.displayName) || (photoUrl !== user.photoURL)) {
        await updateProfile(auth.currentUser, { displayName: displayName || null, photoURL: photoUrl || null });
      }

      // Update email if changed
      if (email !== user.email) {
        await updateEmail(auth.currentUser, email);
      }

      
      if (password) {
        await updatePassword(auth.currentUser, password);
      }

      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Profile update error', err);
      if (err?.code === 'auth/requires-recent-login') {
        toast.error('Please sign in again and retry to update sensitive info (email/password).');
      } else {
        toast.error(err?.message || 'Unable to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Display name</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
          <p className="text-xs text-gray-500 mt-1">Changing your email may require re-authentication for security.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Photo URL</label>
          <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">New password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
          <p className="text-xs text-gray-500 mt-1">Leave blank to keep your current password. Updating password may require recent login.</p>
        </div>

        <div>
          <button disabled={loading} className="px-4 py-2 bg-primary text-white rounded-md">{loading ? 'Saving...' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  );
};
export default ProfilePage;
