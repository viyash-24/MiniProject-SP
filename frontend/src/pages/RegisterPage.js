import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, registerWithEmail } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerWithEmail(form.name, form.email, form.password, form.phone);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Failed to create account');
    }
  };

  const onGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to continue with Google');
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12 page-fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden grid md:grid-cols-2 card-elevated">

        {/* Left Side */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">Create your account</h2>
          <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
            Join Smart Parking to find and reserve spots faster.
          </p>

          {error && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          {/* Google Login */}
          <button
            onClick={onGoogle}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-slate-700 rounded-md py-2.5 bg-white/60 dark:bg-slate-900/60 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors btn-soft"
          >
            <img
              alt="Google"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="h-5 w-5"
            />
            Continue with Google
          </button>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px bg-gray-200 dark:bg-slate-700 flex-1" />
            <div className="text-xs text-gray-500 dark:text-slate-400">or</div>
            <div className="h-px bg-gray-200 dark:bg-slate-700 flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="mt-6 space-y-4">

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:border-primary focus:ring-primary"
                placeholder="Full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="+94 00 0000 000"
              />
            </div>

            {/* Password (with eye toggle) */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                Password
              </label>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:border-primary focus:ring-primary pr-11"
                placeholder="Create a strong password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-3/4 -translate-y-1/2 text-gray-600 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-md font-medium shadow-sm shadow-blue-500/40 transition-colors btn-soft"
            >
              Create account
            </button>
          </form>

          <p className="text-sm text-gray-600 dark:text-slate-300 text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* Right Image */}
        <div className="hidden md:block bg-gray-50 dark:bg-slate-900 p-8">
          <div
            className="h-full rounded-xl bg-cover bg-center shadow-inner soft-zoom"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1578859695220-856a4f5edd39?q=80&w=1974&auto=format&fit=crop')"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
