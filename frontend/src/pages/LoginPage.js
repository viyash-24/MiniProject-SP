import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, loginWithEmailPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmailPassword(email, password);
      const isHardcodedAdmin = email.toLowerCase().trim() === 'admin@gmail.com' && password === 'admin';
      navigate(isHardcodedAdmin ? '/admin' : from, { replace: true });
    } catch (err) {
      const msg = err?.message || 'Failed to sign in';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-12">
      <div className="w-full max-w-md bg-white border shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Welcome back</h2>
        <p className="text-sm text-gray-600 text-center mt-1">Login to continue to Smart Parking</p>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        <button onClick={onGoogle} className="mt-6 w-full inline-flex items-center justify-center gap-2 border rounded-md py-2.5 hover:bg-gray-50">
          <img alt="Google" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" />
          Continue with Google
        </button>
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px bg-gray-200 flex-1" />
          <div className="text-xs text-gray-500">or</div>
          <div className="h-px bg-gray-200 flex-1" />
        </div>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary" placeholder="you@example.com" />
          </div>

          {/* Password with toggle */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"} // Toggle here
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-7 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 select-none">
              <input type="checkbox" className="rounded text-primary focus:ring-primary" />
              Remember me
            </label>
            <a href="#" className="text-primary hover:underline">Forgot password?</a>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-md font-medium disabled:opacity-60">{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p className="text-sm text-gray-600 text-center mt-4">New here? <Link to="/register" className="text-primary hover:underline">Create an account</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;
