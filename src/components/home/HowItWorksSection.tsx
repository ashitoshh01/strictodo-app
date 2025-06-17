
import React from 'react';
import { Target, CheckCircle, Trophy } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Target,
      title: "Set a Task",
      description: "Create a task with a deadline and put money on the line. The higher the stakes, the stronger your motivation.",
      color: "text-blue-500"
    },
    {
      icon: CheckCircle,
      title: "Do the Task",
      description: "Complete your task and submit proof. Our AI verifies completion through images, videos, or text submissions.",
      color: "text-green-500"
    },
    {
      icon: Trophy,
      title: "Win or Lose",
      description: "Complete on time? Get your money back plus rewards! Miss the deadline? Your stake goes to our reward pool.",
      color: "text-purple-500"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple 3-step process that turns your procrastination into productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 transform -translate-y-1/2"></div>
          <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-green-500 to-purple-500 transform -translate-y-1/2"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-card border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300 relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${
                  index === 0 ? 'from-blue-500 to-blue-600' :
                  index === 1 ? 'from-green-500 to-green-600' :
                  'from-purple-500 to-purple-600'
                } mb-6`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Success Story */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-2xl p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 text-green-600 dark:text-green-400">
              <Trophy className="h-5 w-5" />
              <span className="font-semibold">Success Story</span>
            </div>
            <p className="text-lg font-medium text-foreground">
              "I bet money on finishing my thesis chapter. Not only did I complete it early, 
              but I also earned a bonus reward!"
            </p>
            <p className="text-muted-foreground">- Sarah M., Graduate Student</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
