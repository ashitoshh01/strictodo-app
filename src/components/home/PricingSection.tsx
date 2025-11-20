
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Zap, Crown, Rocket } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: "Free Trial",
      price: 0,
      period: "2 tasks",
      description: "Perfect for trying out the platform",
      icon: Zap,
      features: [
        "2 free tasks to get started",
        "Basic AI verification",
        "Email reminders",
        "Progress tracking",
        "Community access"
      ],
      buttonText: "Start Free",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Monthly",
      price: 9.99,
      period: "per month",
      description: "Pay only when you succeed",
      icon: Crown,
      features: [
        "Unlimited task creation",
        "Advanced AI verification",
        "All reminder types (Email, SMS, Push)",
        "Detailed analytics dashboard",
        "Priority customer support",
        "Exclusive reward partners",
        "Streak bonuses & multipliers"
      ],
      buttonText: "Get Started",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Yearly",
      price: 79.99,
      period: "per year",
      description: "Best value - 33% savings",
      icon: Rocket,
      features: [
        "Everything in Monthly plan",
        "33% cost savings",
        "Premium reward tiers",
        "Advanced goal coaching",
        "Custom verification rules",
        "Team collaboration features",
        "Early access to new features"
      ],
      buttonText: "Save 33%",
      buttonVariant: "default" as const,
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-background w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">Simple, Fair Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Only pay when you succeed. The more you achieve, the more you save.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative rounded-2xl border-2 p-8 ${
              plan.popular 
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20' 
                : 'border-border bg-card'
            } hover:shadow-lg transition-all duration-300`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center space-y-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${
                  plan.popular ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-muted'
                }`}>
                  <plan.icon className={`h-6 w-6 ${plan.popular ? 'text-white' : 'text-muted-foreground'}`} />
                </div>

                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  {plan.name === "Yearly" && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Save $40 per year
                    </p>
                  )}
                </div>

                <Link to="/signup" className="block">
                  <Button 
                    variant={plan.buttonVariant} 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600' : ''}`}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>

              <div className="mt-8 space-y-4">
                <h4 className="font-semibold">Everything included:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Unique Value Proposition */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Only Pay When You Succeed</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Unlike other productivity apps, we only charge when you actually complete your tasks. 
              The subscription fee is our way of keeping the platform running while you focus on winning.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-500">No Hidden Fees</div>
                <div className="text-sm text-muted-foreground">What you see is what you pay</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-500">Cancel Anytime</div>
                <div className="text-sm text-muted-foreground">No long-term commitments</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-500">Money Back</div>
                <div className="text-sm text-muted-foreground">If you complete tasks on time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
