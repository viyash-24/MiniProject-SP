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

      // ---------------------------------------------
      // Update User Profile Information (Name + Photo)
      // ---------------------------------------------


      if ((displayName !== user.displayName) || (photoUrl !== user.photoURL)) {

        await updateProfile(auth.currentUser, { 
          displayName: displayName || null, 
          photoURL: photoUrl || null 
        });

      }










      // ---------------------------------------------
      // Update User Email Address
      // ---------------------------------------------


      if (email !== user.email) {

        await updateEmail(auth.currentUser, email);

      }










      // ---------------------------------------------
      // Update User Password If Provided
      // ---------------------------------------------


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

    <div className="min-h-[70vh] bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-12 page-fade-in">

      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-2xl rounded-2xl p-8 card-elevated">

        <div className="mb-6">

          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-50">Edit Profile</h1>

          <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
            Update your personal information and account details.
          </p>

        </div>








        <form onSubmit={handleSubmit} className="space-y-4">






          <div>

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
              Display name
            </label>

            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:border-primary focus:ring-primary px-3 py-2"
            />

          </div>








          <div>

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
              Email
            </label>

            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:border-primary focus:ring-primary px-3 py-2"
            />

            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Changing your email may require re-authentication for security.
            </p>

          </div>








          <div>

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
              Photo URL
            </label>

            <input
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:border-primary focus:ring-primary px-3 py-2"
            />

          </div>








          <div>

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
              New password
            </label>

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:border-primary focus:ring-primary px-3 py-2"
            />

            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Leave blank to keep your current password. Updating password may require recent login.
            </p>

          </div>








          <div>

            <button
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-70 text-white rounded-md text-sm font-medium transition-colors btn-soft"
            >
              {loading ? 'Saving...' : 'Save changes'}
            </button>

          </div>






        </form>

      </div>

    </div>

  );

};









export default ProfilePage;
