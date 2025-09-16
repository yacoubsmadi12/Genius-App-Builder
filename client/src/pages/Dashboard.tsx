import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressSidebar } from "@/components/ui/ProgressSidebar";
import { AppWizard } from "@/components/AppWizard";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { type AppGeneration, type Subscription } from "@shared/schema";

const GENERATION_STEPS = [
  { id: 'project', label: 'Creating Flutter project' },
  { id: 'pages', label: 'Generating pages' },
  { id: 'images', label: 'Creating images' },
  { id: 'navigation', label: 'Linking navigation' },
  { id: 'backend', label: 'Setting up backend' },
  { id: 'zip', label: 'Building ZIP file' }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentGeneration, setCurrentGeneration] = useState<AppGeneration | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  // Fetch user generations
  const { data: generations } = useQuery<{ generations: AppGeneration[] }, Error, AppGeneration[]>({
    queryKey: ["/api/generations"],
    enabled: !!user,
    refetchInterval: currentGeneration?.status === "generating" ? 2000 : false,
    select: (d) => d.generations,
  });

  // Fetch user subscription
  const { data: subscription } = useQuery<{ subscription: Subscription | null }, Error, Subscription | null>({
    queryKey: ["/api/user/subscription"],
    enabled: !!user,
    select: (d) => d.subscription,
  });

  // Create generation mutation
  const createGenerationMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const token = getAuthToken();
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create generation");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentGeneration(data.generation);
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      toast({
        title: "Generation started!",
        description: "Your app is being generated. This may take a few minutes.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = async (data: {
    appName: string;
    prompt: string;
    backend: string;
    iconFile: File | null;
    generatedIconUrl?: string | null;
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate apps",
        variant: "destructive",
      });
      return;
    }

    // Check subscription limits
    if (subscription) {
      const used = parseInt(subscription.generationsUsed);
      const limit = parseInt(subscription.generationsLimit);
      
      if (used >= limit && subscription.plan === "free") {
        toast({
          title: "Generation limit reached",
          description: "Please upgrade your plan to generate more apps",
          variant: "destructive",
        });
        return;
      }
    }

    const formData = new FormData();
    formData.append("appName", data.appName);
    formData.append("prompt", data.prompt);
    formData.append("backend", data.backend);
    if (data.iconFile) {
      formData.append("icon", data.iconFile);
    }
    // Pass AI-generated icon URL if available
    if (data.generatedIconUrl) {
      formData.append("iconUrl", data.generatedIconUrl);
    }

    createGenerationMutation.mutate(formData);
  };

  const handleDownloadZip = async () => {
    if (!currentGeneration?.resultUrl) return;

    try {
      toast({
        title: "Starting download",
        description: "Preparing your Flutter app ZIP file...",
      });

      const { getAuthToken } = await import("@/lib/auth");
      const token = getAuthToken();
      
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(currentGeneration.resultUrl, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentGeneration.appName || 'flutter-app'}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download complete!",
        description: "Your Flutter app has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download ZIP file",
        variant: "destructive",
      });
    }
  };

  const handleDownloadApk = async () => {
    if (!currentGeneration?.apkUrl) return;

    try {
      toast({
        title: "Starting download",
        description: "Preparing your Flutter APK file...",
      });

      const { getAuthToken } = await import("@/lib/auth");
      const token = getAuthToken();
      
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(currentGeneration.apkUrl, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentGeneration.appName || 'flutter-app'}.apk`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download complete!",
        description: "Your Flutter APK has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download APK file",
        variant: "destructive",
      });
    }
  };


  // Update current generation from API
  useEffect(() => {
    if (generations?.length && generations.length > 0) {
      const latest = generations[0];
      if (latest.status === "generating" || latest.status === "completed") {
        setCurrentGeneration(latest);
      }
    }
  }, [generations]);

  const getProgressSteps = () => {
    if (!currentGeneration?.progress) return GENERATION_STEPS.map(step => ({ ...step, status: 'pending' as const }));
    
    return GENERATION_STEPS.map(step => {
      const progress = currentGeneration.progress as any;
      const completed = progress?.completed || [];
      const current = progress?.current || '';
      
      if (completed.includes(step.label)) {
        return { ...step, status: 'completed' as const };
      } else if (current === step.label) {
        return { ...step, status: 'active' as const };
      } else {
        return { ...step, status: 'pending' as const };
      }
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Your App</h1>
        <p className="text-muted-foreground">Describe your vision and let AI build your Flutter app</p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Enhanced App Creation Wizard */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8">
              <AppWizard
                onGenerate={handleGenerate}
                isGenerating={createGenerationMutation.isPending || currentGeneration?.status === "generating"}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Progress Sidebar */}
        <div className="lg:col-span-1">
          <ProgressSidebar
            steps={getProgressSteps()}
            isIdle={!currentGeneration || currentGeneration.status === "pending"}
            isCompleted={currentGeneration?.status === "completed"}
            onDownloadZip={handleDownloadZip}
            onDownloadApk={handleDownloadApk}
          />
        </div>
      </div>
    </div>
  );
}
