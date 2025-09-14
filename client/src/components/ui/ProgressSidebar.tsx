import { CheckCircle, Loader2, Rocket, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

interface ProgressSidebarProps {
  steps: ProgressStep[];
  currentStep?: string;
  isIdle?: boolean;
  isCompleted?: boolean;
  onDownloadZip?: () => void;
  onDownloadApk?: () => void;
}

export function ProgressSidebar({ 
  steps, 
  currentStep, 
  isIdle = false, 
  isCompleted = false,
  onDownloadZip,
  onDownloadApk
}: ProgressSidebarProps) {
  
  if (isIdle) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">Ready to Build</h3>
          <p className="text-sm text-muted-foreground">
            Fill out the form and click generate to start building your app!
          </p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="font-semibold mb-2">App Generated!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your Flutter app is ready for download
          </p>
          <div className="space-y-2">
            <button 
              onClick={onDownloadZip}
              className="w-full btn-primary py-2 rounded-lg font-medium"
              data-testid="button-download-zip"
            >
              Download ZIP
              <i className="fas fa-download ml-2"></i>
            </button>
            <button 
              onClick={onDownloadApk}
              className="w-full border border-border py-2 rounded-lg font-medium hover:bg-muted transition-colors"
              data-testid="button-download-apk"
            >
              Download APK
              <i className="fas fa-mobile-alt ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
      <h3 className="font-semibold mb-4">Generating Your App</h3>
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center p-3 rounded-lg border transition-colors",
              step.status === 'active' && "bg-primary text-primary-foreground border-primary",
              step.status === 'completed' && "bg-green-500 text-white border-green-500",
              step.status === 'pending' && "border-border"
            )}
            data-testid={`progress-step-${step.id}`}
          >
            <div className="mr-3">
              {step.status === 'completed' && <CheckCircle className="w-4 h-4" />}
              {step.status === 'active' && <Loader2 className="w-4 h-4 animate-spin" />}
              {step.status === 'pending' && <div className="w-2 h-2 bg-muted-foreground rounded-full" />}
            </div>
            <span className="text-sm">{step.label}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <Coffee className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Relax and have a coffee while we work our magic!
        </p>
      </div>
    </div>
  );
}
