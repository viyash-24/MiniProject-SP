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

  const [fieldErrors, setFieldErrors] = useState({});

  // Validation helpers
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidHttpUrl = (url) => {
    if (!url || !url.trim()) return true; // Optional field
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };









  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!auth.currentUser) return toast.error('No authenticated user');

    // Validate all fields
    const errors = {};
    
    if (!displayName.trim()) {
      errors.displayName = 'Display name is required';
    }
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (photoUrl.trim() && !isValidHttpUrl(photoUrl)) {
      errors.photoUrl = 'Please enter a valid URL (http:// or https://)';
    }
    
    if (password && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setFieldErrors({});
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
              onChange={e => {
                setDisplayName(e.target.value);
                setFieldErrors(prev => ({ ...prev, displayName: '' }));
              }}
              className={`mt-1 block w-full rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-primary px-3 py-2 ${
                fieldErrors.displayName
                  ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-slate-700 focus:border-primary'
              }`}
            />
            {fieldErrors.displayName && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.displayName}</p>
            )}

          </div>








          <div>

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
              Email
            </label>

            <input
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setFieldErrors(prev => ({ ...prev, email: '' }));
              }}
              className={`mt-1 block w-full rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-primary px-3 py-2 ${
                fieldErrors.email
                  ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-slate-700 focus:border-primary'
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}

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
              onChange={e => {
                setPhotoUrl(e.target.value);
                setFieldErrors(prev => ({ ...prev, photoUrl: '' }));
              }}
              className={`mt-1 block w-full rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-primary px-3 py-2 ${
                fieldErrors.photoUrl
                  ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-slate-700 focus:border-primary'
              }`}
            />
            {fieldErrors.photoUrl && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.photoUrl}</p>
            )}

          </div>








          <div>

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
              New password
            </label>

            <input
              type="password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setFieldErrors(prev => ({ ...prev, password: '' }));
              }}
              className={`mt-1 block w-full rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-primary px-3 py-2 ${
                fieldErrors.password
                  ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-slate-700 focus:border-primary'
              }`}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            )}

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
