
import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Graduate Student",
      image: "https://images.unsplash.com/photo-1494790108755-2616b25f8e0e?w=150&h=150&fit=crop&crop=face",
      content: "I went from procrastinating on my thesis for months to finishing 3 chapters in 2 weeks. The money I put at stake was the perfect motivation I needed!",
      rating: 5,
      achievement: "Completed 15 tasks • Earned $340"
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Developer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "As a freelancer, missing deadlines was costing me clients. Do or Due helped me build discipline and now I deliver everything on time.",
      rating: 5,
      achievement: "98% completion rate • 45-day streak"
    },
    {
      name: "Emily Johnson",
      role: "Marketing Manager",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "The AI verification is incredible. I love how it holds me accountable for my fitness goals. Lost 15 pounds in 3 months thanks to this app!",
      rating: 5,
      achievement: "50+ workouts completed • $200 in rewards"
    }
  ];

  return (
    <section className="py-20 bg-muted/50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">Success Stories</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who've transformed their productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="relative">
              <div className="bg-background rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                {/* Quote Icon */}
                <div className="absolute -top-4 -left-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full p-3">
                  <Quote className="h-6 w-6 text-white" />
                </div>

                {/* Stars */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>

                {/* Achievement */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg p-3 mb-6">
                  <p className="text-sm font-medium text-center text-green-700 dark:text-green-300">
                    {testimonial.achievement}
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Stats */}
        <div className="mt-16 bg-background rounded-2xl p-8 border">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold">Trusted by Achievers Worldwide</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-500">50,000+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-500">94%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-500">500k+</div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-orange-500">$2.1M</div>
                <div className="text-sm text-muted-foreground">Rewards Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
