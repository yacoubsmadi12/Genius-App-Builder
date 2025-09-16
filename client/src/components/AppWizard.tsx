import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Wand2, ChevronLeft, ChevronRight, RefreshCw, Check, AlertCircle } from "lucide-react";
import { type ParsedAppStructure } from "@shared/schema";

interface WizardProps {
  onGenerate: (data: {
    appName: string;
    prompt: string;
    backend: string;
    iconFile: File | null;
    generatedIconUrl?: string | null;
  }) => void;
  isGenerating: boolean;
}

export function AppWizard({ onGenerate, isGenerating }: WizardProps) {
  const { toast } = useToast();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [appName, setAppName] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconGenerating, setIconGenerating] = useState(false);
  const [iconGenerated, setIconGenerated] = useState(false);
  const [generatedIconUrl, setGeneratedIconUrl] = useState<string | null>(null);
  const [iconRetries, setIconRetries] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [parsedApp, setParsedApp] = useState<ParsedAppStructure | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [backend, setBackend] = useState("firebase");

  const steps = [
    {
      id: 'name',
      title: 'App Name',
      description: 'Choose a name for your mobile app'
    },
    {
      id: 'icon',
      title: 'App Icon',
      description: 'Upload or generate an AI-powered icon'
    },
    {
      id: 'description',
      title: 'App Description',
      description: 'Describe your app features and requirements'
    },
    {
      id: 'review',
      title: 'Review & Generate',
      description: 'Review your app details and start generation'
    }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return appName.trim().length > 0;
      case 1: return iconFile || iconGenerated;
      case 2: return prompt.trim().length > 0 && (parsedApp || parseError); // Can proceed if parsed or user chooses to skip
      case 3: return true;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 2 && prompt.trim() && !parsedApp && !parseError) {
      // Parse the description before moving to review
      await parseDescription();
      return; // Don't advance until parse is complete
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const parseDescription = async () => {
    setParsing(true);
    setParseError(null);
    try {
      const response = await apiRequest("POST", "/api/parse-description", {
        description: prompt,
        appName: appName
      });
      setParsedApp(response);
      toast({
        title: "Description parsed successfully!",
        description: "AI has analyzed your app requirements"
      });
      // Automatically advance to next step on successful parse
      setTimeout(() => {
        if (currentStep === 2) {
          setCurrentStep(3);
        }
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to parse description";
      setParseError(errorMessage);
      toast({
        title: "Parsing failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setParsing(false);
    }
  };

  const handleGenerateIcon = async () => {
    if (!appName.trim()) {
      toast({
        title: "App name required",
        description: "Please enter an app name before generating an icon",
        variant: "destructive"
      });
      return;
    }

    setIconGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/generate-icon", {
        appName,
        description: prompt || "Modern mobile application icon"
      });

      setIconGenerated(true);
      // Capture generated icon URL if provided
      if (response.iconUrl) {
        setGeneratedIconUrl(response.iconUrl);
      }
      toast({
        title: "Icon generated successfully!",
        description: "AI has created a custom icon for your app"
      });
    } catch (error) {
      toast({
        title: "Icon generation failed",
        description: error instanceof Error ? error.message : "Failed to generate icon",
        variant: "destructive"
      });
    } finally {
      setIconGenerating(false);
    }
  };

  const handleRetryIcon = async () => {
    if (iconRetries >= 2) {
      toast({
        title: "Maximum retries reached",
        description: "Please upload a custom icon or continue without one",
        variant: "destructive"
      });
      return;
    }

    setIconRetries(iconRetries + 1);
    await handleGenerateIcon();
  };

  const handleGenerate = () => {
    onGenerate({
      appName,
      prompt,
      backend,
      iconFile: iconFile || null, // Use uploaded icon or null if AI-generated
      generatedIconUrl // Pass the AI-generated icon URL
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                App Name
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="appName">What would you like to name your app?</Label>
                <Input
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="My Amazing App"
                  className="text-lg h-12"
                  data-testid="input-app-name"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Choose a memorable name that reflects your app's purpose
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                App Icon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Upload your own icon or let AI generate one for you
                </p>
                
                {iconGenerated && (
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <Check className="h-4 w-4" />
                      <span>AI icon generated successfully!</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="icon">Upload Icon (PNG, JPG)</Label>
                  <Input
                    id="icon"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                    data-testid="input-icon"
                  />
                </div>
                
                <div className="text-center">
                  <span className="text-muted-foreground">or</span>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    type="button" 
                    variant={iconGenerated ? "outline" : "default"}
                    onClick={handleGenerateIcon}
                    disabled={!appName.trim() || iconGenerating}
                    className="w-full"
                    data-testid="button-generate-icon"
                  >
                    {iconGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating Icon...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                  
                  {iconGenerated && iconRetries < 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRetryIcon}
                      className="w-full"
                      data-testid="button-retry-icon"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Different Icon ({2 - iconRetries} retries left)
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                App Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">Describe your app in detail</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={8}
                  placeholder="Describe your app:

• What pages should it have? (Login, Home, Profile, Settings...)
• What features do you need? (Authentication, Dark Mode, Notifications...)
• What colors and design style?
• Any specific functionality?

Example: Create a fitness tracking app with a dark theme and blue accents. Include pages for workout logging, progress charts, user profile, and settings."
                  data-testid="textarea-prompt"
                />
              </div>
              
              {parsing && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>AI is analyzing your description...</span>
                </div>
              )}
              
              {parsedApp && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                    AI Analysis Results:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Detected Language:</span> {parsedApp.language === 'ar' ? 'Arabic' : 'English'}
                    </div>
                    <div>
                      <span className="font-medium">Screens ({parsedApp.screens.length}):</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parsedApp.screens.map((screen, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {screen.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Features ({parsedApp.features.length}):</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parsedApp.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                Review & Generate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">App Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {appName}</div>
                    <div><span className="font-medium">Icon:</span> {iconFile ? 'Custom uploaded' : iconGenerated ? 'AI generated' : 'Default'}</div>
                    <div><span className="font-medium">Description:</span> {prompt.substring(0, 100)}...</div>
                  </div>
                </div>
                
                {parsedApp && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">AI Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Screens:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parsedApp.screens.map((screen, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {screen.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Features:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parsedApp.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label>Backend Choice</Label>
                  <RadioGroup value={backend} onValueChange={setBackend} className="grid md:grid-cols-1 gap-2 mt-2">
                    <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                      <RadioGroupItem value="firebase" id="firebase" data-testid="radio-firebase" />
                      <Label htmlFor="firebase" className="flex-1 cursor-pointer">
                        <div className="font-medium">Firebase</div>
                        <div className="text-sm text-muted-foreground">Google's Backend-as-a-Service (Fully Supported)</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 border border-muted rounded-lg opacity-50">
                      <RadioGroupItem value="supabase" id="supabase" disabled data-testid="radio-supabase" />
                      <Label htmlFor="supabase" className="flex-1 cursor-not-allowed">
                        <div className="font-medium">Supabase</div>
                        <div className="text-sm text-muted-foreground">Coming Soon</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 border border-muted rounded-lg opacity-50">
                      <RadioGroupItem value="nodejs" id="nodejs" disabled data-testid="radio-nodejs" />
                      <Label htmlFor="nodejs" className="flex-1 cursor-not-allowed">
                        <div className="font-medium">Node.js Custom</div>
                        <div className="text-sm text-muted-foreground">Coming Soon</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerate}
                size="lg"
                className="w-full btn-primary text-lg"
                disabled={isGenerating}
                data-testid="button-generate-app"
              >
                {isGenerating ? "Starting Generation..." : "Generate My App"}
                <Wand2 className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${index <= currentStep 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {index + 1}
            </div>
            <div className="ml-2 hidden sm:block">
              <div className={`text-sm font-medium ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-px mx-2 sm:mx-4 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Current step */}
      <div className="min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      {currentStep < steps.length - 1 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            data-testid="button-back"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed() || parsing}
            data-testid="button-next"
          >
            {currentStep === 2 && !parsedApp ? 'Parse & Continue' : 'Next'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
      
      {currentStep === steps.length - 1 && (
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isGenerating}
            data-testid="button-back"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      )}
    </div>
  );
}