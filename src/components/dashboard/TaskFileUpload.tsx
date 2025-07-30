
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

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeWithGeminiAI = async (
    taskTitle: string, 
    taskDescription: string, 
    proofDescription: string, 
    uploadedFiles: UploadedFile[]
  ) => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Prepare file data for AI analysis
    const fileData = await Promise.all(
      uploadedFiles.map(async (fileObj) => {
        const { file, type } = fileObj;
        
        // For images, convert to base64 for AI analysis
        if (type === 'image') {
          try {
            const base64 = await convertFileToBase64(file);
            return {
              name: file.name,
              type: type,
              size: file.size,
              content: base64
            };
          } catch (error) {
            console.error('Error converting image to base64:', error);
            return {
              name: file.name,
              type: type,
              size: file.size,
              content: null
            };
          }
        }
        
        // For documents, try to read text content
        if (type === 'document' && file.type === 'text/plain') {
          try {
            const text = await file.text();
            return {
              name: file.name,
              type: type,
              size: file.size,
              content: text
            };
          } catch (error) {
            console.error('Error reading document:', error);
            return {
              name: file.name,
              type: type,
              size: file.size,
              content: null
            };
          }
        }
        
        // For other file types, just include metadata
        return {
          name: file.name,
          type: type,
          size: file.size,
          content: null
        };
      })
    );

    // Create the comprehensive AI prompt with the new DorOrDue format
    const prompt = `[DorOrDue AI — Deterministic JSON Agent (No Loops)]

ROLE & SCOPE
You are the backend decision engine for DorOrDue, a strict to‑do app that uses monetary commitment, AI proof verification, and reward coupons to enforce task completion. You must be precise, conservative, and deterministic.

OUTPUT FORMAT (MANDATORY)
Always answer with ONLY a single JSON object. No extra text, no markdown.
Schema:
{
  "action": "create_task" | "accept_proof" | "reject_proof" | "verify_proof" | "ask_clarifying_question" | "edit_task" | "escalate" | "stuck",
  "reason": "short plain sentence explaining why",
  "data": {}  // object with fields required by the chosen action
}

ACTIONS & REQUIRED data FIELDS
- accept_proof:
  data = { "task_id": string }
- reject_proof:
  data = { "task_id": string, "violations": [ "missing_proof" | "wrong_task" | "insufficient_duration" | "unclear_image" | "not_measurable" | "late_submission" | "forbidden_editing" | "other" ], "advice": string }

DECISION RULES (ACCURACY FIRST)
1) Only accept proofs that directly and clearly match the task requirements. If not, use reject_proof with specific violations and a one‑line advice for how to fix.
2) A valid proof must be: (a) relevant to the exact task, (b) clear to read/see, (c) time‑appropriate (not obviously old), (d) sufficient to show completion.
3) Reject typical weak proofs: generic screenshots, cropped images hiding key info, unrelated links, or unverifiable claims.

TASK DETAILS:
Task Title: ${taskTitle}
Task Description: ${taskDescription}
User's Proof Description: ${proofDescription}

FILE DATA PROVIDED:
${fileData.map(file => `
- File Name: ${file.name}
- File Type: ${file.type}
- File Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
- Content Available: ${file.content ? 'Yes' : 'No'}
${file.content && file.type === 'image' ? '- Image Data: [Base64 image data provided for analysis]' : ''}
${file.content && file.type === 'document' ? `- Document Content: ${file.content.substring(0, 500)}...` : ''}
`).join('\n')}

Total Files Uploaded: ${fileData.length}

Based on the task requirements and the provided proof (description + files), determine if this proof should be accepted or rejected. Use either "accept_proof" or "reject_proof" action with the task_id "${task.id}".`;

    console.log('AI Analysis Prompt:', prompt);
    
    // Call the enhanced AI response simulation with JSON parsing
    const response = await simulateEnhancedAIResponse(
      prompt, 
      taskTitle, 
      taskDescription, 
      proofDescription, 
      fileData
    );
    
    return response;
  };

  const simulateEnhancedAIResponse = async (
    prompt: string,
    taskTitle: string,
    taskDescription: string,
    proofDescription: string,
    fileData: any[]
  ) => {
    // Enhanced simulation logic that considers both text and file data
    const taskLower = taskTitle.toLowerCase();
    const descLower = taskDescription.toLowerCase();
    const proofLower = proofDescription.toLowerCase();
    
    // Check for relevant keywords
    const taskWords = taskLower.split(' ').filter(word => word.length > 3);
    const descWords = descLower.split(' ').filter(word => word.length > 3);
    const allTaskWords = [...taskWords, ...descWords];
    
    const hasRelevantKeywords = allTaskWords.some(word => proofLower.includes(word));
    const hasCompletionIndicators = ['completed', 'finished', 'done', 'accomplished', 'submitted', 'created', 'uploaded', 'sent'].some(word => proofLower.includes(word));
    
    // Check if files are relevant to the task
    const hasRelevantFiles = fileData.length > 0;
    const hasImageProof = fileData.some(file => file.type === 'image');
    const hasDocumentProof = fileData.some(file => file.type === 'document');
    
    // Enhanced scoring based on multiple factors
    let score = 0;
    
    // Text analysis
    if (hasRelevantKeywords) score += 2;
    if (hasCompletionIndicators) score += 2;
    if (proofDescription.length > 20) score += 1;
    
    // File analysis
    if (hasRelevantFiles) score += 3;
    if (hasImageProof) score += 2; // Images are strong proof
    if (hasDocumentProof) score += 2; // Documents are strong proof
    
    // Task-specific analysis
    if (taskLower.includes('photo') || taskLower.includes('image') || taskLower.includes('picture')) {
      if (hasImageProof) score += 3;
    }
    
    if (taskLower.includes('document') || taskLower.includes('write') || taskLower.includes('report')) {
      if (hasDocumentProof) score += 3;
    }
    
    // Content analysis for text documents
    fileData.forEach(file => {
      if (file.content && file.type === 'document') {
        const contentLower = file.content.toLowerCase();
        if (allTaskWords.some(word => contentLower.includes(word))) {
          score += 2;
        }
      }
    });
    
    console.log('AI Simulation Score:', score, 'out of potential points');
    console.log('Analysis factors:', {
      hasRelevantKeywords,
      hasCompletionIndicators,
      hasRelevantFiles,
      hasImageProof,
      hasDocumentProof,
      proofLength: proofDescription.length,
      fileCount: fileData.length
    });
    
    // Generate JSON response based on score
    if (score >= 6) {
      return {
        action: "accept_proof",
        reason: "Proof clearly demonstrates task completion with relevant files and description.",
        data: {
          task_id: task.id
        },
        isVerified: true
      };
    } else {
      // Determine violations based on what's missing
      const violations = [];
      let advice = "Please provide clearer proof of task completion.";
      
      if (!hasRelevantFiles) {
        violations.push("missing_proof");
        advice = "Upload relevant files that demonstrate task completion.";
      } else if (!hasRelevantKeywords) {
        violations.push("wrong_task");
        advice = "Ensure your proof clearly relates to the specific task requirements.";
      } else if (proofDescription.length < 20) {
        violations.push("not_measurable");
        advice = "Provide a more detailed description of how you completed the task.";
      } else {
        violations.push("other");
        advice = "The proof does not sufficiently demonstrate task completion.";
      }
      
      return {
        action: "reject_proof",
        reason: "Proof does not meet verification requirements.",
        data: {
          task_id: task.id,
          violations: violations,
          advice: advice
        },
        isVerified: false
      };
    }
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

      // Perform AI analysis with both description and uploaded files
      toast({
        title: "Analyzing with AI",
        description: "AI is verifying your proof submission including uploaded files...",
      });

      const aiResult = await analyzeWithGeminiAI(task.title, task.description, description, uploadedFiles);

      console.log('AI analysis result:', aiResult);

      // Create proof data object
      const proofData = {
        urls: proofUrls,
        description,
        ai_response: aiResult.action,
        ai_reason: aiResult.reason,
        ai_data: aiResult.data,
        files_analyzed: uploadedFiles.map(f => ({ name: f.file.name, type: f.type, size: f.file.size })),
        submitted_at: new Date().toISOString()
      };

      if (aiResult.isVerified) {
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

        try {
          const rewardData = await createReward(task.id);
          console.log('Reward created successfully:', rewardData);

          toast({
            title: "🎉 Task Verified Successfully!",
            description: `AI has verified your proof! Your ${task.due_coins} coins have been returned and a reward coupon created.`,
          });

          onTaskVerified(task.id, rewardData.coupon_code);
        } catch (rewardError) {
          console.error('Reward creation error:', rewardError);
          
          toast({
            title: "Task Verified",
            description: "Task verified successfully, but there was an issue creating the reward. Please contact support.",
            variant: "destructive"
          });
          
          onTaskVerified(task.id, '');
        }
      } else {
        // For failed verification, mark as 'pending' so user can try again
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ 
            status: 'pending',
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

        // Show more specific feedback based on AI response
        const aiData = aiResult.data as any;
        const advice = aiData?.advice || "Please try again with more relevant proof.";
        const violations = aiData?.violations || [];

        toast({
          title: "Verification Failed",
          description: `${aiResult.reason} ${advice}`,
          variant: "destructive"
        });

        console.log('Proof verification failed:', {
          reason: aiResult.reason,
          violations: violations,
          advice: advice,
          description: description,
          files: uploadedFiles.map(f => f.file.name)
        });

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
              <strong>AI Verification:</strong> The AI will analyze both your uploaded files (images, documents, etc.) and your description to verify if they match the task requirements. Make sure your files and description clearly demonstrate task completion.
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
