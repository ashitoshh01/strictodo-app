
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Settings, Crown } from 'lucide-react';
import { CoinIcon } from '@/components/ui/coin-icon';
import { useAuth } from '@/contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { userProfile, user, claimWelcomeBonus } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Profile Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={userProfile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg">
              {getInitials(userProfile?.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold">
                {userProfile?.full_name || 'User'}
              </h2>
              <Badge variant="secondary" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                Member
              </Badge>
            </div>
            
            <p className="text-muted-foreground text-sm mb-3">
              {userProfile?.email || user?.email}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center text-green-600 font-semibold">
                  <CoinIcon className="h-5 w-5 mr-1 text-yellow-500" />
                  <span className="text-lg">{userProfile?.due_coins || 0}</span>
                  <span className="text-sm ml-1">Coins</span>
                </div>
                
                {!userProfile?.welcome_bonus_claimed && (
                  <Button
                    onClick={claimWelcomeBonus}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    Claim Bonus
                  </Button>
                )}
              </div>
              
              <Button variant="outline" size="sm" onClick={handleSettingsClick}>
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
