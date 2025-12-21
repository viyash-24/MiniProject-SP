import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, registerWithEmail } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  // Error state for displaying registration errors
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerWithEmail(form.name, form.email, form.password, form.phone);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Failed to create account');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-card rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col md:flex-row"
      >
        
        <div className="w-full md:w-1/2 p-8 lg:p-12">
          <div className="text-left mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Create account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join Smart Parking to find and reserve spots faster.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <button
              onClick={onGoogle}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-input rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors font-medium text-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or register with email</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={onChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={onChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={onChange}
                    required
                    className="block w-full pl-10 pr-10 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 mt-2"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      
        <div className="hidden md:block w-1/2 relative bg-muted">
          <img 
            src="https://images.unsplash.com/photo-1590674899505-1c5c41959359?q=80&w=1600&auto=format&fit=crop" 
            alt="Parking" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Smart Parking System</h3>
            <p className="text-lg text-white/80">Experience the future of urban parking. Seamless, secure, and smart.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
