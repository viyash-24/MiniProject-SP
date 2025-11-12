import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });
  const onSubmit = (e) => {
    e.preventDefault();
    // Placeholder for email/password registration; recommend Firebase createUserWithEmailAndPassword.
    setError('Use Continue with Google for now.');
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
    <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-12">
      <div className="w-full max-w-4xl bg-white border shadow-xl rounded-2xl overflow-hidden grid md:grid-cols-2">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="text-sm text-gray-600 mt-1">Join Smart Parking to find and reserve spots faster.</p>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
          <button onClick={onGoogle} className="mt-4 w-full inline-flex items-center justify-center gap-2 border rounded-md py-2.5 hover:bg-gray-50">
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input id="name" type="text" value={form.name} onChange={onChange} required className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary" placeholder="Full name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input id="email" type="email" value={form.email} onChange={onChange} required className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input id="phone" type="tel" value={form.phone} onChange={onChange} required className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary" placeholder="+91 00000 00000" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input id="password" type="password" value={form.password} onChange={onChange} required className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary" placeholder="Create a strong password" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-md font-medium">Create account</button>
          </form>
          <p className="text-sm text-gray-600 text-center mt-4">Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link></p>
        </div>
        <div className="hidden md:block bg-gray-50 p-8">
          <div className="h-full rounded-xl bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1578859695220-856a4f5edd39?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}} />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
