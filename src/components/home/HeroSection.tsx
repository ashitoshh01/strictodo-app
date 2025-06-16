
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Target, DollarSign } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Stop Procrastinating.{' '}
                <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                  Start Winning.
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
                className="w-full sm:w-auto text-lg px-8 py-6"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                How it Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">94%</div>
                <div className="text-sm text-muted-foreground">Task Completion</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">$2.1M</div>
                <div className="text-sm text-muted-foreground">Rewards Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </div>

          {/* Visual Content */}
          <div className="relative">
            <div className="relative z-10 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-black/40 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <div className="font-semibold">Finish Project Proposal</div>
                      <div className="text-sm text-muted-foreground">Due: Today, 6 PM</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-500">$50</div>
                    <div className="text-xs text-muted-foreground">at stake</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-black/40 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="h-6 w-6 text-blue-500" />
                    <div>
                      <div className="font-semibold">Exercise for 30 mins</div>
                      <div className="text-sm text-muted-foreground">Due: Tomorrow, 8 AM</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-500">$25</div>
                    <div className="text-xs text-muted-foreground">at stake</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-6 w-6 text-green-500" />
                    <div>
                      <div className="font-semibold text-green-700 dark:text-green-300">Completed: Read 20 pages</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Earned $30 + Bonus!</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-500">+$35</div>
                    <div className="text-xs text-green-600 dark:text-green-400">earned</div>
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
