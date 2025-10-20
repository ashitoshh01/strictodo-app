
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const toggleNav = () => setIsOpen(!isOpen);

  if (!user) return null;

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleNav}
        className="w-9 h-9 p-0"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg z-50">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link 
              to="/dashboard" 
              className={`block hover:text-primary transition-colors ${location.pathname === '/dashboard' ? 'text-primary' : ''}`}
              onClick={toggleNav}
            >
              Dashboard
            </Link>
            <Link 
              to="/add-task" 
              className={`block hover:text-primary transition-colors ${location.pathname === '/add-task' ? 'text-primary' : ''}`}
              onClick={toggleNav}
            >
              Add Task
            </Link>
            <Link 
              to="/shop" 
              className={`block hover:text-primary transition-colors ${location.pathname.startsWith('/shop') ? 'text-primary' : ''}`}
              onClick={toggleNav}
            >
              Shop
            </Link>
            <Link 
              to="/rewards" 
              className={`block hover:text-primary transition-colors ${location.pathname === '/rewards' ? 'text-primary' : ''}`}
              onClick={toggleNav}
            >
              Rewards
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
