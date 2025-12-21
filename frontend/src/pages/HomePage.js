import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import useStats from '../hooks/useStats';
import ParkingChargesDisplay from '../components/ParkingChargesDisplay';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Shield, Clock, MapPin, Smartphone, CreditCard } from 'lucide-react';

// HomePage component serving as the landing page for the Smart Parking application
const features = [
  { 
    icon: Clock,
    title: 'Live Availability', 
    desc: 'See real-time free slots across nearby parking areas.' 
  },
  { 
    icon: Shield,
    title: 'Secure Payments', 
    desc: 'Pay online via UPI, cards, and wallets with instant receipts.' 
  },
  { 
    icon: MapPin,
    title: 'Admin Controls', 
    desc: 'Manage vehicles, slots, and payments from a powerful dashboard.' 
  },
];

const steps = [
  { icon: MapPin, title: 'Find', desc: 'Search for parking near your destination.' },
  { icon: CreditCard, title: 'Pay', desc: 'Pay securely via UPI or Card.' },
  { icon: Smartphone, title: 'Park', desc: 'Navigate to the spot and park hassle-free.' },
];

const HomePage = () => {
  const { stats, loading, error } = useStats();
  
  const heroMetrics = [
    { label: 'Parking Areas', value: stats.totalParkingAreas },
    { label: 'Daily Active Users', value: stats.dailyActiveUsers },
    { label: 'Total Users', value: stats.totalUsers },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-32 lg:pt-17 lg:pb-40 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Live in {loading ? '...' : (stats?.totalParkingAreas || 0)}+ Cities
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                Park smarter in <span className="text-primary">busy cities</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Stop circling for spots. Find nearby parking, view live slot availability, and pay seamlessly. All in one place.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button asChild size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1">
                  <Link to="/dashboard">
                    Find Parking <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg border-2 hover:bg-accent/50">
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>

              {/* Stats Row */}
              <div className="mt-12 grid grid-cols-3 gap-8 border-t border-border/50 pt-8">
                {heroMetrics.map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">
                      {loading ? '-' : (stat.value || '0')}+
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative lg:h-[600px] w-full hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-purple-500/30 rounded-[2rem] blur-3xl -z-10 transform rotate-3"></div>
              <img 
                src="https://images.unsplash.com/photo-1578859695220-856a4f5edd39?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1000&auto=format&fit=crop" 
                alt="Smart Parking App" 
                className="w-full h-full object-cover rounded-[2rem] shadow-2xl border-4 border-white dark:border-slate-800 transform -rotate-2 hover:rotate-0 transition-transform duration-500"
              />
              
              
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">How it works</h2>
            <p className="text-muted-foreground mt-2">Get parked in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            {steps.map((step, i) => (
              <div key={i} className="relative z-10 text-center group">
                <div className="h-24 w-24 mx-auto bg-white dark:bg-slate-900 rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-lg flex items-center justify-center mb-6 group-hover:border-primary/20 transition-colors">
                  <step.icon className="h-10 w-10 text-primary" />
                  <div className="absolute -top-2 -right-2 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-white dark:border-slate-900">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Transparent Pricing</h2>
            <p className="text-muted-foreground mt-2">Rates auto-update whenever the admin adds or edits vehicle charges.</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800">
            <ParkingChargesDisplay compact={false} showHeading={false} />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything you need to park</h2>
            <p className="text-lg text-muted-foreground">We combine cutting-edge technology with user-centric design to solve the urban parking crisis.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <div className="h-14 w-14 rounded-xl bg-slate-50 dark:bg-slate-900 text-primary shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-primary rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute -top-24 -right-24 h-64 w-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-black/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to park smarter?</h2>
              <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
                Join thousands of users who are saving time and money every day with our smart parking solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="h-14 px-8 rounded-full font-bold text-lg">
                  <Link to="/register">Get Started Now</Link>
                </Button>
                <Button asChild size="lg" className="h-14 px-8 rounded-full font-bold text-lg bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm">
                  <Link to="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
