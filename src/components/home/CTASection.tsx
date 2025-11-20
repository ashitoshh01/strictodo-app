
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Trophy } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-green-500 to-blue-500 text-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to Take Control of Your Time?
            </h2>
            <p className="text-xl lg:text-2xl opacity-90">
              Join 50,000+ achievers who've turned their procrastination into productivity
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-gray-900 hover:bg-gray-100">
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-gray-900"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-white/20 rounded-full p-4">
                <Target className="h-8 w-8" />
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">2 Free Tasks</div>
                <div className="text-sm opacity-80">No credit card required</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-white/20 rounded-full p-4">
                <Trophy className="h-8 w-8" />
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">Instant Verification</div>
                <div className="text-sm opacity-80">AI-powered task checking</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-white/20 rounded-full p-4">
                <ArrowRight className="h-8 w-8" />
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">Start Winning</div>
                <div className="text-sm opacity-80">Complete tasks, earn rewards</div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20">
            <p className="text-sm opacity-80">
              "The best productivity app I've ever used. It actually works!" - Sarah M.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
