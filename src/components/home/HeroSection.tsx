
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Target, DollarSign } from 'lucide-react';
import ThreeBackground from './ThreeBackground';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
      <ThreeBackground />
      <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                  DoOrDue
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground">
                Bet on your productivity. Complete tasks or pay the price.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg px-8 py-6">
                  Get Started Free
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto text-lg px-8 py-6 text-foreground hover:text-foreground"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See how it works
              </Button>
            </div>

            {/* Stats - Removed Numbers */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-lg font-bold text-green-500">High</div>
                <div className="text-sm text-muted-foreground">Task Completion</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-500">Major</div>
                <div className="text-sm text-muted-foreground">Rewards Earned</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-500">Growing</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </div>

          {/* Image Content */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop"
                alt="Productive workspace with laptop"
                className="rounded-2xl shadow-2xl w-full object-cover"
              />
              
              {/* Floating task cards overlay */}
              <div className="absolute -bottom-4 -left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <div className="font-semibold text-sm">Task Completed!</div>
                    <div className="text-xs text-muted-foreground">Reward earned</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-blue-500" />
                  <div>
                    <div className="font-semibold text-sm">New Challenge</div>
                    <div className="text-xs text-muted-foreground">Ready to start</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
