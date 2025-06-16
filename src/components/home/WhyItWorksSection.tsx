
import React from 'react';
import { Brain, Users, TrendingUp, Shield } from 'lucide-react';

const WhyItWorksSection = () => {
  const reasons = [
    {
      icon: Brain,
      title: "Loss Aversion Psychology",
      description: "Research shows people are 2x more motivated to avoid losses than to acquire gains. By putting money at stake, you tap into this powerful psychological principle.",
      stat: "2x",
      statLabel: "More Effective"
    },
    {
      icon: Users,
      title: "Social Accountability",
      description: "Join a community of goal-achievers. Share your progress, celebrate wins, and learn from others who are also betting on themselves.",
      stat: "94%",
      statLabel: "Success Rate"
    },
    {
      icon: TrendingUp,
      title: "Proven Results",
      description: "Our users complete 94% of their committed tasks compared to just 23% completion rate for traditional to-do lists.",
      stat: "4x",
      statLabel: "Better Results"
    },
    {
      icon: Shield,
      title: "Smart Verification",
      description: "AI-powered task verification ensures fairness. Upload photos, videos, or text proof, and our system validates completion automatically.",
      stat: "99.8%",
      statLabel: "Accuracy Rate"
    }
  ];

  const useCases = [
    {
      title: "Students",
      description: "Finish assignments, study for exams, complete research projects",
      color: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
    },
    {
      title: "Professionals",
      description: "Meet deadlines, learn new skills, complete certifications",
      color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
    },
    {
      title: "Freelancers",
      description: "Deliver client work on time, build portfolio, network effectively",
      color: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
    },
    {
      title: "Everyone",
      description: "Exercise regularly, read more books, learn new hobbies",
      color: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
    }
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">Why It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Backed by psychology research and proven by thousands of successful users
          </p>
        </div>

        {/* Psychological Backing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {reasons.map((reason, index) => (
            <div key={index} className="bg-background rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg mb-4">
                <reason.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{reason.stat}</div>
              <div className="text-sm text-muted-foreground mb-3">{reason.statLabel}</div>
              <h3 className="font-semibold mb-2">{reason.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>

        {/* Use Cases */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Perfect For</h3>
            <p className="text-muted-foreground">Real-world use cases from our community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((useCase, index) => (
              <div key={index} className={`rounded-xl p-6 ${useCase.color}`}>
                <h4 className="font-bold text-lg mb-2">{useCase.title}</h4>
                <p className="text-sm opacity-90">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Research Backing */}
        <div className="mt-16 bg-background rounded-2xl p-8 border">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">Research-Backed Approach</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Our platform is built on decades of behavioral psychology research, including studies from 
              Harvard Business School on commitment devices and Nobel Prize-winning work on loss aversion 
              by Daniel Kahneman and Amos Tversky.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">200+</div>
                <div className="text-sm text-muted-foreground">Studies Referenced</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">15+</div>
                <div className="text-sm text-muted-foreground">Universities Collaborated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">5</div>
                <div className="text-sm text-muted-foreground">Years of Research</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyItWorksSection;
