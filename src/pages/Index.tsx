
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import WhyItWorksSection from '@/components/home/WhyItWorksSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PricingSection from '@/components/home/PricingSection';
import CTASection from '@/components/home/CTASection';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemTheme);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        onToggleTheme={toggleTheme} 
        isDarkMode={isDarkMode} 
      />
      
      <main>
        <HeroSection />
        <HowItWorksSection />
        <WhyItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
