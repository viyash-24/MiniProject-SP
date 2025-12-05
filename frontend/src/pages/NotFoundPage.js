import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '../components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-card border border-border rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 text-destructive mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Go back home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
