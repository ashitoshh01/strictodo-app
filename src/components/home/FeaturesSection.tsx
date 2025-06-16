
import React from 'react';
import { Calendar, Bot, DollarSign, Gift, BarChart3, Bell } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Calendar,
      title: "Daily/Weekly Planner",
      description: "Organize your tasks with our intuitive calendar interface. Set deadlines, view upcoming commitments, and track your productivity over time.",
      color: "text-blue-500"
    },
    {
      icon: Bot,
      title: "AI Task Verification",
      description: "Submit proof through images, videos, or text. Our AI system automatically verifies task completion with 99.8% accuracy.",
      color: "text-green-500"
    },
    {
      icon: DollarSign,
      title: "Monetary Commitment",
      description: "Put your money where your mouth is. Choose your stake amount based on task importance and your motivation level.",
      color: "text-red-500"
    },
    {
      icon: Gift,
      title: "Rewards Integration",
      description: "Earn real rewards for completing tasks. Get gift cards, coupons, and exclusive deals from our partner brands.",
      color: "text-purple-500"
    },
    {
      icon: BarChart3,
      title: "Progress Dashboard",
      description: "Visualize your productivity with detailed analytics. Track completion rates, earnings, and identify your peak performance times.",
      color: "text-orange-500"
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Never miss a deadline with intelligent notifications via email, SMS, and push notifications. Customize your reminder preferences.",
      color: "text-teal-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to turn procrastination into productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-card border rounded-2xl p-8 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.color} bg-current/10 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Verification Highlight */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-2xl p-8">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-3">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold">Advanced AI Verification</h3>
                <p className="text-muted-foreground">
                  Our AI can verify various types of tasks - from workout photos to completed documents, 
                  code commits to creative projects. The system learns and adapts to ensure fair verification.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
                    99.8% Accuracy
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                    Multi-format Support
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards Highlight */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold">Exclusive Rewards Program</h3>
                <p className="text-muted-foreground">
                  Partner with top brands to offer exclusive rewards. The more consistent you are, 
                  the better rewards you unlock. Build streaks for bonus multipliers.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
                    50+ Partners
                  </span>
                  <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-3 py-1 rounded-full">
                    Streak Bonuses
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
