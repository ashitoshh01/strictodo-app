
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ScratchCard from '@/components/ui/scratch-card';
import { Clock, CheckCircle, ArrowLeft, Upload, X, FileText, Image, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';
import { useRewards } from '@/hooks/useRewards';
import { supabase } from '@/integrations/supabase/client';
import { CoinIcon } from '@/components/ui/coin-icon';

interface UploadedFile {
  file: File;
  url: string;
  type: 'image' | 'video' | 'document';
}

const SubmitProof = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tasks, updateTask } = useTasks();
  const { createReward } = useRewards();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [proofDescription, setProofDescription] = useState('');
  const [rewardCoupon, setRewardCoupon] = useState<string>('');
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [showReward, setShowReward] = useState(false);

  const task = tasks.find(t => t.id === taskId);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'verified': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - uploadedFiles.length);
    
    newFiles.forEach(file => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        });
        return;
      }

      const url = URL.createObjectURL(file);
      const type = getFileType(file);
      
      setUploadedFiles(prev => [...prev, { file, url, type }]);
    });

    // Reset the input
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one file as proof",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const proofUrls: string[] = [];

      // Upload all files to storage
      for (const { file } of uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${task?.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('task-proofs')
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('task-proofs')
          .getPublicUrl(fileName);

        proofUrls.push(urlData.publicUrl);
      }

      // Update task with proof URLs and description, and mark as verified
      const proofData = {
        urls: proofUrls,
        description: proofDescription,
        submitted_at: new Date().toISOString()
      };

      await updateTask(taskId!, { 
        status: 'pending-verification' as const,
        proof_url: JSON.stringify(proofData)
      });

      toast({
        title: "Proof Submitted!",
        description: "Your proof has been submitted and is pending verification.",
      });

      // Navigate back to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit proof. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Task not found</div>
          </div>
        </main>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Processing your submission...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
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
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Submit Proof</h1>
            <p className="text-muted-foreground">
              Upload proof that you completed your task
            </p>
          </div>

          {/* Task Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{task?.title}</span>
                <Badge className={`${getStatusColor(task?.status || 'pending')} text-white`}>
                  {getStatusIcon(task?.status || 'pending')}
                  <span className="ml-1 capitalize">{task?.status}</span>
                </Badge>
              </CardTitle>
              <CardDescription>{task?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span>Due coins at stake:</span>
                <span className="font-semibold text-green-600 flex items-center">
                  <CoinIcon className="h-4 w-4 mr-1 text-yellow-500" />
                  {task?.due_coins}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span>Due date:</span>
                <span>{task && new Date(task.due_date).toLocaleDateString()} at {task && new Date(task.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </CardContent>
          </Card>

          {/* Reward Section */}
          {showReward && (
            <div className="text-center space-y-4">
              <ScratchCard 
                couponCode={rewardCoupon}
                amount={rewardAmount}
                onReveal={() => {
                  setTimeout(() => {
                    navigate('/dashboard');
                  }, 3000);
                }}
              />
            </div>
          )}

          {/* Submit Proof Form */}
          {!showReward && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Proof</CardTitle>
                <CardDescription>
                  Upload up to 5 files (images, videos, or documents) that prove you completed the task
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="proofFiles">Upload Files (up to 5)</Label>
                    <Input
                      id="proofFiles"
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      disabled={uploadedFiles.length >= 5}
                    />
                    <p className="text-sm text-muted-foreground">
                      Max 10MB per file. Supported: Images, Videos, PDFs, Documents
                    </p>
                  </div>

                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Files ({uploadedFiles.length}/5)</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getFileIcon(file.type)}
                              <div className="flex-1">
                                <p className="text-sm font-medium truncate">{file.file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="proofDescription">Description (Optional)</Label>
                    <Textarea
                      id="proofDescription"
                      placeholder="Describe how you completed the task..."
                      value={proofDescription}
                      onChange={(e) => setProofDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    disabled={isSubmitting || uploadedFiles.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Processing Submission...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Proof & Get Verified
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubmitProof;
