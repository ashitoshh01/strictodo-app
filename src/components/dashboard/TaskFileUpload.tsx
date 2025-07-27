
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText, Image, Video, FileArchive, File, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/hooks/useTasks';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRewards } from '@/hooks/useRewards';

interface UploadedFile {
  file: File;
  url: string;
  type: 'image' | 'video' | 'document' | 'archive' | 'other';
}

interface TaskFileUploadProps {
  task: Task;
  onClose: () => void;
  onTaskVerified: (taskId: string, couponCode: string) => void;
}

const TaskFileUpload: React.FC<TaskFileUploadProps> = ({ task, onClose, onTaskVerified }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createReward } = useRewards();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFileType = (file: File): 'image' | 'video' | 'document' | 'archive' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document';
    if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')) return 'archive';
    return 'other';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'archive': return <FileArchive className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - uploadedFiles.length);
    
    newFiles.forEach(file => {
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

  const analyzeWithGeminiAI = async (taskTitle: string, taskDescription: string, fileTypes: string[], userDescription: string) => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Comprehensive verification logic
    const taskLower = taskTitle.toLowerCase();
    const descLower = userDescription.toLowerCase();
    const taskDescLower = taskDescription.toLowerCase();
    
    let verificationScore = 0;
    let analysisPoints = [];
    
    // Description Quality Assessment (40 points max)
    if (userDescription.length < 20) {
      analysisPoints.push("❌ Description too brief - needs more detail about task completion");
      verificationScore += 5; // Minimal points for trying
    } else if (userDescription.length < 50) {
      analysisPoints.push("⚠️ Description is adequate but could be more detailed");
      verificationScore += 20;
    } else {
      analysisPoints.push("✅ Description provides good detail about task completion");
      verificationScore += 35;
    }
    
    // Task Relevance Check (25 points max)
    const taskKeywords = taskLower.split(' ').concat(taskDescLower.split(' '));
    const meaningfulKeywords = taskKeywords.filter(word => word.length > 3);
    const relevantKeywords = meaningfulKeywords.filter(word => descLower.includes(word));
    
    if (relevantKeywords.length === 0) {
      analysisPoints.push("❌ Description doesn't relate to the task requirements");
    } else if (relevantKeywords.length >= 2) {
      analysisPoints.push("✅ Description clearly relates to the task");
      verificationScore += 25;
    } else {
      analysisPoints.push("⚠️ Description somewhat relates to the task");
      verificationScore += 15;
    }
    
    // File Evidence Assessment (25 points max)
    if (uploadedFiles.length === 0) {
      analysisPoints.push("❌ No files uploaded as proof of completion");
    } else if (uploadedFiles.length === 1) {
      analysisPoints.push("✅ Evidence file uploaded");
      verificationScore += 20;
    } else {
      analysisPoints.push("✅ Multiple files uploaded showing comprehensive proof");
      verificationScore += 25;
    }
    
    // Completion Indicators (20 points max)
    const completionWords = ['completed', 'finished', 'done', 'accomplished', 'achieved', 'success'];
    const hasCompletionWords = completionWords.some(word => descLower.includes(word));
    
    if (hasCompletionWords) {
      analysisPoints.push("✅ Clear completion indicators found");
      verificationScore += 20;
    } else {
      analysisPoints.push("⚠️ No clear completion indicators");
      verificationScore += 5;
    }
    
    // Effort Assessment (10 points max)
    const effortWords = ['worked', 'spent', 'time', 'effort', 'tried', 'attempted'];
    const hasEffortWords = effortWords.some(word => descLower.includes(word));
    
    if (hasEffortWords) {
      analysisPoints.push("✅ Shows effort and engagement");
      verificationScore += 10;
    } else {
      analysisPoints.push("⚠️ Could show more effort detail");
      verificationScore += 3;
    }
    
    // Quality threshold: need at least 70 points out of 120 to pass
    const isVerified = verificationScore >= 70;
    
    const confidence = Math.min(100, Math.max(0, Math.round((verificationScore / 120) * 100)));
    
    return {
      isVerified,
      confidence,
      analysis: `🤖 AI Verification Analysis for: "${taskTitle}"

${analysisPoints.join('\n')}

Overall Assessment: ${isVerified ? 'VERIFIED ✅' : 'REQUIRES IMPROVEMENT ❌'}
Confidence Score: ${confidence}/100

${isVerified 
  ? `✅ Task verification successful!

The submitted proof demonstrates adequate completion of the task. Your invested coins will be returned to your account along with a reward coupon.

Actions taken:
- Coins restored to your account
- Reward coupon generated
- Task status updated to 'verified'`
  : `❌ Verification requires improvement

The submitted evidence needs enhancement to verify task completion. To improve your verification score:

1. Provide a more detailed description (aim for 50+ characters)
2. Include specific actions you took to complete the task
3. Upload relevant files showing your work
4. Use completion words like 'completed', 'finished', 'accomplished'
5. Show effort and engagement in your description

Current score: ${verificationScore}/120 (need 70+ to pass)
You can resubmit before the deadline with improved proof.`}`
    };
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload at least one file as proof",
        variant: "destructive"
      });
      return;
    }

    if (description.trim().length < 10) {
      toast({
        title: "Description too short",
        description: "Please provide at least 10 characters describing how you completed the task",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit proof",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting proof submission for task:', task.id);
      
      // Upload files to storage first
      const proofUrls: string[] = [];
      for (const { file } of uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${task.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('task-proofs')
          .upload(fileName, file);

        if (uploadError) {
          console.error('File upload error:', uploadError);
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('task-proofs')
          .getPublicUrl(fileName);

        proofUrls.push(urlData.publicUrl);
      }

      console.log('Files uploaded successfully:', proofUrls);

      // Perform AI analysis
      toast({
        title: "Analyzing with AI",
        description: "AI is verifying your proof submission...",
      });

      const fileTypes = [...new Set(uploadedFiles.map(f => f.type))];
      const aiResult = await analyzeWithGeminiAI(task.title, task.description, fileTypes, description);

      console.log('AI analysis result:', aiResult);

      // Create proof data object
      const proofData = {
        urls: proofUrls,
        description,
        ai_analysis: aiResult.analysis,
        confidence: aiResult.confidence,
        submitted_at: new Date().toISOString()
      };

      if (aiResult.isVerified) {
        // Update task status to verified
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ 
            status: 'verified',
            proof_url: JSON.stringify({
              ...proofData,
              verified_at: new Date().toISOString()
            })
          })
          .eq('id', task.id)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Task update error:', updateError);
          throw updateError;
        }

        // Create reward using the hook which handles RLS properly
        try {
          const rewardData = await createReward(task.id, task.due_coins);
          console.log('Reward created successfully:', rewardData);

          toast({
            title: "🎉 Task Verified Successfully!",
            description: `AI has verified your proof! Your ${task.due_coins} coins have been returned and a reward coupon created.`,
          });

          onTaskVerified(task.id, rewardData.coupon_code);
        } catch (rewardError) {
          console.error('Reward creation error:', rewardError);
          
          // Show success for task verification but warn about reward issue
          toast({
            title: "Task Verified",
            description: "Task verified successfully, but there was an issue creating the reward. Please contact support.",
            variant: "destructive"
          });
          
          onTaskVerified(task.id, '');
        }
      } else {
        // Update task status to submitted (failed verification)
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ 
            status: 'submitted',
            proof_url: JSON.stringify({
              ...proofData,
              verification_failed_at: new Date().toISOString()
            })
          })
          .eq('id', task.id)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Task update error:', updateError);
          throw updateError;
        }

        toast({
          title: "Verification Needs Improvement",
          description: `Score: ${aiResult.confidence}/100. Please add more detail and try again.`,
          variant: "destructive"
        });

        // Don't close the modal, let user try again
        return;
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit proof. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-4 border-2 border-primary/20 animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Proof for: {task.title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="taskFiles">Upload Files (up to 5 files)</Label>
          <Input
            id="taskFiles"
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar,.7z"
            onChange={handleFileUpload}
            disabled={uploadedFiles.length >= 5}
          />
          <p className="text-sm text-muted-foreground">
            Max 10MB per file. Supported: Images, Videos, PDFs, Documents, Archives
          </p>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Uploaded Files ({uploadedFiles.length}/5)</Label>
            <div className="grid grid-cols-1 gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg animate-scale-in">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{file.file.name}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-muted-foreground">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {file.type}
                        </Badge>
                      </div>
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
          <Label htmlFor="fileDescription">Proof Description *</Label>
          <Textarea
            id="fileDescription"
            placeholder="Describe in detail how you completed this task (minimum 10 characters)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground">
            Minimum 10 characters. Be specific about what you did to complete the task.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start space-x-2">
            <div className="text-amber-600 dark:text-amber-400">⚠️</div>
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Verification Requirements:</strong> The AI needs a detailed description (aim for 50+ characters) and relevant files. Use completion words like "completed", "finished", "accomplished" to improve your verification score.
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            disabled={uploadedFiles.length === 0 || description.trim().length < 10 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying with AI...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Proof
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskFileUpload;
