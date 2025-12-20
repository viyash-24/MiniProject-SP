import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { Facebook, Twitter, Instagram, MapPin, Mail, Phone, ArrowRight } from 'lucide-react';

const Footer = () => {
  const { isAdmin } = useAuth();
  const { setLoading } = useLoading();

  const handleNavClick = () => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  
// Footer component with company info, quick links, and contact details
  return (
    <footer className="bg-slate-950 text-slate-200 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                <span className="font-bold text-lg">SP</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Smart Parking</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Revolutionizing urban parking with smart technology. Find, reserve, and pay for parking in seconds with our seamless platform.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {!isAdmin && (
                <>
                  <li><Link to="/" onClick={handleNavClick} className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm"><ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Home</Link></li>
                  <li><Link to="/dashboard" onClick={handleNavClick} className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm"><ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Find Parking</Link></li>
                  <li><Link to="/payment" onClick={handleNavClick} className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm"><ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Payments</Link></li>
                </>
              )}
              {isAdmin && (
                <li><Link to="/admin" onClick={handleNavClick} className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm"><ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Admin Dashboard</Link></li>
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" onClick={handleNavClick} className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm"><ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" /> About Us</Link></li>
              <li><Link to="/contact" onClick={handleNavClick} className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm"><ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Contact Us</Link></li>
              <li><Link to="/faqs" onClick={handleNavClick} className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm"><ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" /> FAQs</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Contact Info</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <span>123 Parking St, City Center<br />Tech District, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span>support@smartparking.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span>+94 (555) 050 4326</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Smart Parking System. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
