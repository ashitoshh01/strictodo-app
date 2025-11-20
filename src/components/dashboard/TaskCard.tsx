import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Upload, X, ChevronDown, ChevronUp, Calendar, Target, Search } from 'lucide-react';
import { CoinIcon } from '@/components/ui/coin-icon';
import { Task } from '@/hooks/useTasks';
import { useRewards } from '@/hooks/useRewards';
import TaskFileUpload from './TaskFileUpload';
import ScratchCard from '@/components/ui/scratch-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { getRewardByTask } = useRewards();

  useEffect(() => {
    if (task.status === 'verified' && !showReward) {
      const fetchReward = async () => {
        const reward = await getRewardByTask(task.id);
        if (reward) {
          setCouponCode(reward.coupon_code);
          setShowReward(true);
        }
      };
      fetchReward();
    }
  }, [task.status, showReward, getRewardByTask, task.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'submitted': return 'bg-blue-500';
      case 'pending-verification': return 'bg-blue-500';
      case 'verified': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCardBorderColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-yellow-200 hover:border-yellow-300';
      case 'submitted': return 'border-blue-200 hover:border-blue-300';
      case 'pending-verification': return 'border-blue-200 hover:border-blue-300';
      case 'verified': return 'border-green-200 hover:border-green-300 bg-green-50/30';
      case 'failed': return 'border-red-200 hover:border-red-300 bg-red-50/30';
      default: return 'border-gray-200 hover:border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'submitted': return <Upload className="h-4 w-4" />;
      case 'pending-verification': return <Search className="h-4 w-4" />;
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isOverdue = () => {
    const now = new Date();
    const dueDate = new Date(task.due_date);
    return now > dueDate && task.status === 'pending';
  };

  const canSubmitProof = () => {
    const now = new Date();
    const dueDate = new Date(task.due_date);
    return now <= dueDate && task.status === 'pending';
  };

  const { date, time } = formatDate(task.due_date);

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 ${getCardBorderColor(task.status)}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                  {getStatusIcon(task.status)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {task.status.toUpperCase()}
                    </Badge>
                    {isOverdue() && (
                      <Badge variant="destructive" className="text-xs">
                        OVERDUE
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-green-600 font-semibold">
                  <CoinIcon className="h-4 w-4 mr-1 text-yellow-500" />
                  {task.due_coins}
                </div>
              </div>
              <div className="transition-transform duration-200">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up">
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="text-gray-600">
                <p className="mb-3">{task.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Due: {date} at {time}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Target className="h-4 w-4 mr-1" />
                    Coins at stake: {task.due_coins}
                  </div>
                </div>
              </div>

              {canSubmitProof() && !showUpload && (
                <Button
                  onClick={() => setShowUpload(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {task.verification_feedback ? 'Resubmit Proof' : 'Submit Proof'}
                </Button>
              )}

              {isOverdue() && task.status === 'pending' && (
                <div className="text-center py-4 text-red-600">
                  <p className="font-semibold">This task is overdue and will be marked as failed automatically.</p>
                </div>
              )}

              {task.verification_feedback && task.status === 'pending' && (
                <div className="text-center py-4 text-orange-600 bg-orange-50 dark:bg-orange-950/30 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                  <p className="font-semibold">💭 AI Feedback:</p>
                  <p className="text-sm mt-1">{task.verification_feedback}</p>
                  <p className="text-xs mt-2 text-muted-foreground">Please review and resubmit with better proof</p>
                </div>
              )}

              {task.status === 'failed' && (
                <div className="text-center py-4 text-red-600 bg-red-50 rounded-lg">
                  <p className="font-semibold">Task Failed</p>
                  <p className="text-sm">The deadline has passed and your coins have been forfeited.</p>
                </div>
              )}

              {task.status === 'verified' && (
                <div className="text-center py-4 text-green-600 bg-green-50 dark:bg-green-950/30 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <p className="font-semibold">✅ Task Verified Successfully!</p>
                  {task.verification_feedback && (
                    <p className="text-sm mt-1 italic">"{task.verification_feedback}"</p>
                  )}
                  <p className="text-sm mt-2">Your coins + reward have been added to your account!</p>
                </div>
              )}

              {task.status === 'pending-verification' && (
                <div className="text-center py-4 text-blue-600 bg-blue-50 dark:bg-blue-950/30 rounded-lg animate-pulse">
                  <p className="font-semibold">🤖 AI Verification in Progress...</p>
                  <p className="text-sm">Your proof is being analyzed. Results will appear in seconds!</p>
                </div>
              )}

              {showUpload && !showReward && (
                <TaskFileUpload
                  task={task}
                  onClose={() => setShowUpload(false)}
                  onTaskVerified={() => {
                    setShowUpload(false);
                    // The reward will be shown automatically via the useEffect
                  }}
                />
              )}

              {showReward && (
                <div className="flex justify-center animate-fade-in">
                  <ScratchCard 
                    couponCode={couponCode}
                    amount={task.due_coins}
                    onReveal={() => {
                      setTimeout(() => {
                        setShowReward(false);
                      }, 5000);
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default TaskCard;
