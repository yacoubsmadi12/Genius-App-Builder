import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProgressSidebar } from "@/components/ui/ProgressSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getAuthToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Upload } from "lucide-react";
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
  
  const [appName, setAppName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [backend, setBackend] = useState("firebase");
  const [iconFile, setIconFile] = useState<File | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    formData.append("appName", appName);
    formData.append("prompt", prompt);
    formData.append("backend", backend);
    if (iconFile) {
      formData.append("icon", iconFile);
    }

    createGenerationMutation.mutate(formData);
  };

  const handleDownloadZip = () => {
    if (currentGeneration?.resultUrl) {
      window.open(currentGeneration.resultUrl, '_blank');
    }
  };

  const handleDownloadApk = () => {
    if (currentGeneration?.apkUrl) {
      window.open(currentGeneration.apkUrl, '_blank');
    }
  };

  const handleGenerateIcon = async () => {
    if (!appName.trim()) {
      toast({
        title: "App name required",
        description: "Please enter an app name before generating an icon",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Icon generation started",
        description: "Generating an AI-powered icon for your app...",
      });

      const response = await apiRequest("POST", "/api/generate-icon", {
        appName,
        description: prompt || "Modern mobile application icon"
      });

      if (response.iconUrl) {
        toast({
          title: "Icon generated successfully!",
          description: "Your app icon has been generated and applied",
        });
        // Here you could set the generated icon URL if the API returned one
      } else {
        toast({
          title: "Icon generation not available",
          description: "Icon generation is currently not supported with Gemini. Please upload your own icon.",
        });
      }
    } catch (error) {
      toast({
        title: "Icon generation failed",
        description: error instanceof Error ? error.message : "Failed to generate icon",
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
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <Label htmlFor="appName">App Name</Label>
                  <Input
                    id="appName"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="My Amazing App"
                    required
                    data-testid="input-app-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="icon">App Icon</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        id="icon"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                        data-testid="input-icon"
                      />
                    </div>
                    <span className="text-muted-foreground">or</span>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleGenerateIcon}
                      disabled={!appName.trim()}
                      data-testid="button-generate-icon"
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate with AI
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="prompt">App Description & Requirements</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={8}
                    placeholder="Describe your app in detail:

• What pages should it have?
• What features do you need?
• What colors and design style?
• Any specific functionality?
• What images or content should be included?

Example: Create a fitness tracking app with a dark theme and blue accents. Include pages for workout logging, progress charts, user profile, and settings. Add features for tracking exercises, setting goals, and viewing statistics. Use modern, clean design with card layouts."
                    required
                    data-testid="textarea-prompt"
                  />
                </div>
                
                <div>
                  <Label>Backend Choice</Label>
                  <RadioGroup value={backend} onValueChange={setBackend} className="grid md:grid-cols-3 gap-4 mt-2">
                    <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                      <RadioGroupItem value="firebase" id="firebase" data-testid="radio-firebase" />
                      <Label htmlFor="firebase" className="flex-1 cursor-pointer">
                        <div className="font-medium">Firebase</div>
                        <div className="text-sm text-muted-foreground">Google's BaaS</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                      <RadioGroupItem value="supabase" id="supabase" data-testid="radio-supabase" />
                      <Label htmlFor="supabase" className="flex-1 cursor-pointer">
                        <div className="font-medium">Supabase</div>
                        <div className="text-sm text-muted-foreground">Open source alternative</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                      <RadioGroupItem value="nodejs" id="nodejs" data-testid="radio-nodejs" />
                      <Label htmlFor="nodejs" className="flex-1 cursor-pointer">
                        <div className="font-medium">Node.js Custom</div>
                        <div className="text-sm text-muted-foreground">Express.js API</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full btn-primary text-lg"
                  disabled={createGenerationMutation.isPending || currentGeneration?.status === "generating"}
                  data-testid="button-generate-app"
                >
                  {createGenerationMutation.isPending ? "Starting Generation..." : "Generate My App"}
                  <Wand2 className="ml-2 h-5 w-5" />
                </Button>
              </form>
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
