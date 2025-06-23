
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, IndianRupee, Sparkles, ArrowLeft } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';
import { useToast } from '@/hooks/use-toast';
import ScratchCard from '@/components/ui/scratch-card';

const Rewards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rewards, loading, scratchReward } = useRewards();
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

  const handleScratchCard = async (rewardId: string) => {
    try {
      console.log('Scratching reward with ID:', rewardId);
      await scratchReward(rewardId);
      toast({
        title: "Coupon Revealed!",
        description: "Your coupon code has been revealed and saved!",
      });
    } catch (error: any) {
      console.error('Error scratching reward:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reveal coupon",
        variant: "destructive"
      });
    }
  };

  const totalEarned = rewards.reduce((sum, reward) => sum + reward.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Loading your rewards...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="absolute top-20 left-4 p-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Your Rewards</h1>
            <p className="text-muted-foreground">
              Congratulations! Here are the coupons you've earned by completing tasks
            </p>
          </div>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IndianRupee className="h-5 w-5 mr-2" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₹{totalEarned}</div>
              <p className="text-sm text-muted-foreground">
                From {rewards.length} completed {rewards.length === 1 ? 'task' : 'tasks'}
              </p>
            </CardContent>
          </Card>

          {/* Rewards List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Coupons</h2>
            {rewards.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No rewards yet</h3>
                  <p className="text-muted-foreground mb-4">Complete tasks to earn reward coupons</p>
                  <Button onClick={() => navigate('/dashboard')}>
                    View Tasks
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <Card 
                    key={reward.id} 
                    className={`relative overflow-hidden ${
                      !reward.is_scratched 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800' 
                        : ''
                    }`}
                  >
                    {!reward.is_scratched && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-yellow-500 text-white">
                          <Sparkles className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Gift className="h-5 w-5 mr-2" />
                        Reward Coupon
                      </CardTitle>
                      <CardDescription>
                        Earned on {new Date(reward.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {reward.is_scratched ? (
                        <div className="text-center space-y-4">
                          <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
                            <IndianRupee className="h-6 w-6 mr-1" />
                            ₹{reward.amount}
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Coupon Code:</p>
                            <div className="font-mono text-lg font-bold bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border-2 border-dashed">
                              {reward.coupon_code}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Save this coupon code for future use
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <ScratchCard
                            couponCode={reward.coupon_code}
                            amount={reward.amount}
                            onReveal={() => handleScratchCard(reward.id)}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Rewards;
