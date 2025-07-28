
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

  const analyzeWithGeminiAI = async (taskTitle: string, taskDescription: string, proofDescription: string) => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create the AI prompt
    const prompt = `You are a verification agent. Your task is to check if the provided proof matches the given title and title description. You will receive three inputs: a Title, a Title Description, and a Proof (which may be text, image, document). Based on your analysis, respond with a single word only: "Yes" if the proof clearly supports or matches the title and description, or "No" if it does not. Do not include any explanation—just reply with Yes or No.

Title: ${taskTitle}
Title Description: ${taskDescription}
Proof: ${proofDescription}`;

    // Simulate AI response - for demo purposes, we'll do a simple check
    // In a real implementation, this would call an actual AI service
    const response = await simulateAIResponse(prompt, taskTitle, taskDescription, proofDescription);
    
    return {
      isVerified: response.toLowerCase() === 'yes',
      response: response.toLowerCase()
    };
  };

  const simulateAIResponse = async (prompt: string, taskTitle: string, taskDescription: string, proofDescription: string) => {
    // Simple simulation logic for demo - in production, replace with actual AI API call
    const taskLower = taskTitle.toLowerCase();
    const descLower = taskDescription.toLowerCase();
    const proofLower = proofDescription.toLowerCase();
    
    // Basic keyword matching simulation
    const taskWords = taskLower.split(' ').filter(word => word.length > 3);
    const descWords = descLower.split(' ').filter(word => word.length > 3);
    const allTaskWords = [...taskWords, ...descWords];
    
    const hasRelevantKeywords = allTaskWords.some(word => proofLower.includes(word));
    const hasCompletionIndicators = ['completed', 'finished', 'done', 'accomplished'].some(word => proofLower.includes(word));
    
    // Simple logic: if proof has relevant keywords and completion indicators, it's likely valid
    if (hasRelevantKeywords && hasCompletionIndicators && proofDescription.length > 20) {
      return 'Yes';
    }
    
    return 'No';
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

      const aiResult = await analyzeWithGeminiAI(task.title, task.description, description);

      console.log('AI analysis result:', aiResult);

      // Create proof data object
      const proofData = {
        urls: proofUrls,
        description,
        ai_response: aiResult.response,
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
          title: "Verification Failed",
          description: `The proof doesn't match the task description. Please try again with more precise proof.`,
          variant: "destructive"
        });

        // Show the proof description in the error
        console.log('Proof description that failed:', description);

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
            placeholder="Describe how you completed this task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground">
            Minimum 10 characters. Be specific about what you did to complete the task.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-2">
            <div className="text-blue-600 dark:text-blue-400">ℹ️</div>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>AI Verification:</strong> The AI will check if your proof matches the task title and description. Make sure your description clearly explains how you completed the task.
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
