import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NutritionProvider } from "@/context/NutritionContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import CameraCapture from "./pages/CameraCapture";
import FoodDetail from "./pages/FoodDetail";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NutritionProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/camera" element={<CameraCapture />} />
                <Route path="/food/:id" element={<FoodDetail />} />
                <Route path="/history" element={<History />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </NutritionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
