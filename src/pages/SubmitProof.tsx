
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, XCircle, FileImage, Loader2, ArrowLeft, IndianRupee, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';
import { useRewards } from '@/hooks/useRewards';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SubmitProof = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tasks, updateTask } = useTasks();
  const { createReward } = useRewards();
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 100MB",
          variant: "destructive"
        });
        return;
      }

      // Check file type (allow images and PDFs)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Please upload an image file (JPEG, PNG, WebP) or PDF",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      setVerificationResult(null);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('task-proofs')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('task-proofs')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const verifyWithGemini = async (file: File) => {
    if (!task) throw new Error('Task not found');

    try {
      const base64Data = await convertFileToBase64(file);
      
      const prompt = `You are a strict task verification AI. Analyze this ${file.type === 'application/pdf' ? 'PDF document' : 'image'} very carefully and determine if it provides clear, direct evidence of completing this SPECIFIC task:

TASK TO VERIFY:
Title: "${task.title}"
Description: "${task.description}"

CRITICAL VERIFICATION RULES:
1. The ${file.type === 'application/pdf' ? 'document' : 'image'} must contain DIRECT, SPECIFIC evidence related to the exact task described above
2. Generic, unrelated, or vague content should be REJECTED
3. The proof must clearly demonstrate completion of the SPECIFIC task, not just related activities
4. For PDFs: Read and analyze the text content, check for specific task-related information, dates, completion evidence
5. For images: Look for visual evidence that directly shows the task being completed
6. Be extremely strict - only approve if there is unmistakable, clear evidence of this exact task being completed

RESPONSE FORMAT:
Respond with either:
- "SUCCESS: [Detailed explanation of exactly how this ${file.type === 'application/pdf' ? 'document' : 'image'} proves the specific task '${task.title}' was completed, including specific details you found]"
- "FAILURE: [Detailed explanation of why this ${file.type === 'application/pdf' ? 'document' : 'image'} does not prove the specific task '${task.title}' was completed, and what evidence is missing]"

Analyze the content thoroughly and be very strict in your verification. Only approve if you are absolutely certain the task was completed based on the evidence provided.`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDWu4shuPSzsRJwse81Ig1m-9f5UJPktm8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64Data
                }
              }
            ]
          }]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to verify with AI');
      }

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      console.log('Gemini AI Response:', aiResponse);

      const isSuccess = aiResponse.toUpperCase().startsWith('SUCCESS');
      const message = aiResponse.replace(/^(SUCCESS|FAILURE):\s*/, '');

      return {
        success: isSuccess,
        message: message
      };
    } catch (error) {
      console.error('Gemini verification error:', error);
      throw new Error('Failed to verify proof with AI. Please try again.');
    }
  };

  const handleSubmitProof = async () => {
    if (!selectedFile || !task) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Upload file to storage
      const proofUrl = await uploadFile(selectedFile);
      
      // Update task with proof URL and set status to submitted
      await updateTask(task.id, {
        proof_url: proofUrl,
        status: 'submitted'
      });

      // Verify with Gemini
      const result = await verifyWithGemini(selectedFile);
      setVerificationResult(result);

      if (result.success) {
        // Update task status to verified
        await updateTask(task.id, {
          status: 'verified'
        });

        // Create reward
        try {
          const reward = await createReward(task.id, task.money_at_stake);
          console.log('Reward created successfully:', reward);
          
          toast({
            title: "Success!",
            description: "Task verified successfully! You've earned a reward coupon. Check your rewards page!",
          });
        } catch (rewardError) {
          console.error('Failed to create reward:', rewardError);
          toast({
            title: "Task Verified",
            description: "Task completed but there was an issue creating your reward. Please contact support.",
            variant: "destructive"
          });
        }
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        // Update task status to failed
        await updateTask(task.id, {
          status: 'failed'
        });

        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Submit proof error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit proof",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Task not found</h1>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
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
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Submit Proof</h1>
            <p className="text-muted-foreground">
              Upload evidence that you completed your task
            </p>
          </div>

          {/* Task Info */}
          <Card>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span>Money at stake:</span>
                <span className="font-semibold text-green-600 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  ₹{task.money_at_stake}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Proof</CardTitle>
              <CardDescription>
                Upload an image or PDF document that clearly shows you completed the task. Our AI will analyze your submission carefully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="proof-file">Choose File</Label>
                <Input
                  id="proof-file"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, WebP, PDF (max 100MB)
                </p>
              </div>

              {/* File Preview */}
              {selectedFile && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    {selectedFile.type === 'application/pdf' ? (
                      <FileText className="h-8 w-8 text-red-500" />
                    ) : (
                      <FileImage className="h-8 w-8 text-blue-500" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  {/* Preview Image (not for PDF) */}
                  {selectedFile.type !== 'application/pdf' && (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Proof preview"
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Verification Result */}
              {verificationResult && (
                <div className={`p-4 rounded-lg border ${
                  verificationResult.success 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                    : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                }`}>
                  <div className="flex items-start space-x-3">
                    {verificationResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        verificationResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                      }`}>
                        {verificationResult.success ? 'Verification Successful!' : 'Verification Failed'}
                      </p>
                      <p className={`text-sm ${
                        verificationResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                      }`}>
                        {verificationResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                onClick={handleSubmitProof}
                disabled={!selectedFile || isVerifying}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  'Submit Proof'
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Our AI will thoroughly analyze your submission to verify task completion. Make sure your file clearly shows evidence of completing the specific task.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SubmitProof;
