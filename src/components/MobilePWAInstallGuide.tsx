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

const MobilePWAInstallGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    // Check if user is on mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      if (/android/i.test(userAgent)) {
        setIsMobile(true);
        setPlatform("android");
      } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
        setIsMobile(true);
        setPlatform("ios");
      }
    };

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;

    // Check if we've shown this prompt recently
    const lastPrompted = localStorage.getItem('pwaPromptDismissed');
    const daysSinceLastPrompt = lastPrompted 
      ? (Date.now() - parseInt(lastPrompted)) / (1000 * 60 * 60 * 24)
      : null;

    checkMobile();
    
    // Show the modal if:
    // 1. On mobile
    // 2. Not in standalone mode
    // 3. Haven't prompted in the last 7 days (or never prompted)
    if (isMobile && !isStandalone && (!daysSinceLastPrompt || daysSinceLastPrompt > 7)) {
      // Show after a short delay to not interrupt initial page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const handleClose = () => {
    setIsOpen(false);
    // Store dismissal time
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  if (!isMobile || !isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Thryve Nutrition App</DialogTitle>
          <DialogDescription>
            Add Thryve Nutrition to your home screen for quick access!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <img src="/thryve.png" alt="Thryve Nutrition" className="h-12 w-12 rounded-xl" />
            <div>
              <h4 className="font-medium">Thryve Nutrition</h4>
              <p className="text-sm text-muted-foreground">Food nutrition tracking and analysis app</p>
            </div>
          </div>
          
          {platform === "ios" ? (
            <div className="space-y-3">
              <p>First, tap the share icon at the bottom of the screen.</p>
              <div className="flex justify-center">
                <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 20V4M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 20H22M4 28H20C21.1046 28 22 27.1046 22 26V20H2V26C2 27.1046 2.89543 28 4 28Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p>Next, scroll down and tap "Add to Home Screen"</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p>First, click on the 3 dots on the right side of the screen in Chrome.</p>
              <div className="flex justify-center mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="6" r="2" fill="currentColor"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  <circle cx="12" cy="18" r="2" fill="currentColor"/>
                </svg>
              </div>
              <p>Next, click "Add to Home Screen"</p>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md py-2 px-4 flex items-center space-x-3 my-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 16L12 9L19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Add to Home screen</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleClose}>
            Not now
          </Button>
          <Button onClick={handleClose}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MobilePWAInstallGuide; 