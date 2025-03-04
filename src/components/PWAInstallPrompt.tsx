import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Store the install prompt event for later use
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsOpen(true);
    };

    // Only show the prompt if:
    // 1. User is on a web browser (not standalone)
    // 2. The app hasn't been installed yet
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    
    if (!isStandalone) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    await installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt since it can't be used again
    setInstallPrompt(null);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Maybe set a flag in localStorage to not show this prompt again for some time
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  // Don't render anything if there's no install prompt or if it's not open
  if (!installPrompt || !isOpen) {
    return null;
  }

  // Check if we've shown this prompt recently
  const lastPrompted = localStorage.getItem('pwaPromptDismissed');
  if (lastPrompted) {
    const daysSinceLastPrompt = (Date.now() - parseInt(lastPrompted)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastPrompt < 7) {
      return null; // Don't show if we prompted less than 7 days ago
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install Thryve Nutrition</DialogTitle>
          <DialogDescription>
            Add Thryve Nutrition to your home screen for quick access to your nutrition tracking!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-3 py-4">
          <div className="flex items-center space-x-2">
            <img src="/public/thryve.png" alt="Thryve Nutrition" className="h-12 w-12" />
            <div>
              <h4 className="font-medium">Thryve Nutrition</h4>
              <p className="text-sm text-muted-foreground">Food nutrition tracking and analysis app</p>
            </div>
          </div>
          <div className="rounded-lg border p-3 text-sm">
            <p>Install this app on your device:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Fast access without opening your browser</li>
              <li>Works offline or with poor connections</li>
              <li>Uses less storage space than traditional apps</li>
            </ul>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleClose}>
            Not now
          </Button>
          <Button onClick={handleInstallClick}>
            Install App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PWAInstallPrompt; 