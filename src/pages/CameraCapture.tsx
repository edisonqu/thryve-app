
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recognizeFoodFromImage } from "@/utils/foodRecognition";
import { useNutrition } from "@/context/NutritionContext";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import FoodCard from "@/components/FoodCard";

const CameraCapture = () => {
  const navigate = useNavigate();
  const { addFood } = useNutrition();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [recognizedFood, setRecognizedFood] = useState<any | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setPhoto(null);
      setRecognizedFood(null);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoData = canvas.toDataURL("image/jpeg");
        setPhoto(photoData);
        
        // Stop camera stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }
  };

  const recognizeFood = async () => {
    if (!canvasRef.current) return;
    
    setRecognizing(true);
    
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob((blob) => {
          if (blob) resolve(blob);
          else throw new Error("Failed to create blob from canvas");
        }, "image/jpeg");
      });
      
      // Create a file from the blob
      const file = new File([blob], "food.jpg", { type: "image/jpeg" });
      
      // Recognize food from image
      const food = await recognizeFoodFromImage(file);
      
      if (food) {
        setRecognizedFood(food);
      } else {
        toast.error("Could not recognize food. Please try again.");
        resetCamera();
      }
    } catch (error) {
      console.error("Error recognizing food:", error);
      toast.error("Failed to process image. Please try again.");
      resetCamera();
    } finally {
      setRecognizing(false);
    }
  };

  const resetCamera = () => {
    startCamera();
  };

  const confirmFood = () => {
    if (recognizedFood) {
      addFood(recognizedFood);
      toast.success(`Added ${recognizedFood.name} to your food diary`);
      navigate("/");
    }
  };

  return (
    <Layout>
      <div className="relative h-full animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-semibold">Food Recognition</h1>
          <div className="w-10" />
        </div>

        <div className="relative rounded-lg overflow-hidden bg-black aspect-[3/4] mb-4 animate-scale-in">
          {!photo && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          
          {photo && (
            <img
              src={photo}
              alt="Captured food"
              className="w-full h-full object-cover"
            />
          )}
          
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </div>

        {recognizedFood ? (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-lg font-medium">Recognized Food</h2>
            <FoodCard food={recognizedFood} />
            
            <div className="flex space-x-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetCamera}
              >
                <RotateCcw size={18} className="mr-2" />
                Try Again
              </Button>
              <Button
                className="flex-1"
                onClick={confirmFood}
              >
                Add to Diary
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {photo ? (
              <div className="flex space-x-3 animate-slide-up">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={resetCamera}
                  disabled={recognizing}
                >
                  <RotateCcw size={18} className="mr-2" />
                  Retake
                </Button>
                <Button
                  className="flex-1"
                  onClick={recognizeFood}
                  disabled={recognizing}
                >
                  {recognizing ? "Analyzing..." : "Identify Food"}
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full"
                onClick={takePhoto}
              >
                <Camera size={18} className="mr-2" />
                Take Photo
              </Button>
            )}
            
            {recognizing && (
              <Card className="p-4 animate-pulse-subtle">
                <CardContent className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Analyzing your food...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CameraCapture;
