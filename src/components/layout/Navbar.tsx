
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import MobileNav from './MobileNav';

const Navbar = () => {
  const location = useLocation();
  const { user, signOut, userProfile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0]; // Use part before @ if no full name
    }
    return 'User';
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="text-xl font-bold">Do or Due</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={`hover:text-primary transition-colors ${location.pathname === '/dashboard' ? 'text-primary' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/add-task" 
                className={`hover:text-primary transition-colors ${location.pathname === '/add-task' ? 'text-primary' : ''}`}
              >
                Add Task
              </Link>
              <Link 
                to="/shop" 
                className={`hover:text-primary transition-colors ${location.pathname.startsWith('/shop') ? 'text-primary' : ''}`}
              >
                Shop
              </Link>
              <Link 
                to="/rewards" 
                className={`hover:text-primary transition-colors ${location.pathname === '/rewards' ? 'text-primary' : ''}`}
              >
                Rewards
              </Link>
            </>
          ) : (
            <>
              <a href="#how-it-works" className="hover:text-primary transition-colors">
                How it Works
              </a>
              <a href="#features" className="hover:text-primary transition-colors">
                Features
              </a>
              <a href="#pricing" className="hover:text-primary transition-colors">
                Pricing
              </a>
            </>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Mobile Navigation */}
          <MobileNav />

          {user ? (
            /* User Menu */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/shop/orders" className="cursor-pointer">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/rewards" className="cursor-pointer">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Rewards</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Auth Buttons */
            <div className="flex items-center space-x-2">
              <Link to="/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
