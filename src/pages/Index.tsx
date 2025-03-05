
import React, { useState } from "react";
import Layout from "@/components/Layout";
import MacroProgress from "@/components/MacroProgress";
import FoodCard from "@/components/FoodCard";
import CameraButton from "@/components/CameraButton";
import { useNutrition } from "@/context/NutritionContext";
import { getSuggestedFoods } from "@/utils/foodRecognition";
import { groupFoodsByMeal } from "@/utils/macroCalculation";
import { useNavigate } from "react-router-dom";
import { PieChart, Search, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const Index = () => {
  const { todaysFoods, dailyTotals, dailyGoals, removeFood } = useNutrition();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedFoods, setSuggestedFoods] = useState(getSuggestedFoods());
  
  const foodsByMeal = groupFoodsByMeal(todaysFoods);
  
  const handleRemoveFood = (id: string) => {
    removeFood(id);
    toast.success("Food removed from your diary");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning from Thryve";
    if (hour < 18) return "Good Afternoon from Thryve";
    return "Good Evening from Thryve";
  };
  
  // Calculate remaining calories
  const remainingCalories = dailyGoals.calories - dailyTotals.calories;
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{getGreeting()}</h1>
          {/* <div className="flex space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => navigate("/search")}
            >
              <Search size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => navigate("/progress")}  
            >
              <PieChart size={20} />
            </Button>
          </div> */}
        </div>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex justify-between items-center">
              Today's Summary
              <span className={`text-base ${remainingCalories >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {remainingCalories >= 0 ? `${remainingCalories} cal left` : `${Math.abs(remainingCalories)} cal over`}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MacroProgress />
          </CardContent>
        </Card>
        
        {Object.entries(foodsByMeal).map(([meal, foods]) => {
          if (foods.length === 0) return null;
          
          return (
            <div key={meal} className="space-y-3 animate-slide-up">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium capitalize">{meal}</h2>
                <span className="text-sm text-muted-foreground">
                  {foods.reduce((total, food) => total + food.calories, 0)} cal
                </span>
              </div>
              
              <div className="space-y-3">
                {foods.map((food) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onRemove={() => handleRemoveFood(food.id)}
                    onClick={() => navigate(`/food/${food.id}`)}
                  />
                ))}
              </div>
            </div>
          );
        })}
        
        {todaysFoods.length === 0 && (
          <div className="text-center py-8 animate-fade-in">
            <h2 className="text-xl font-medium mb-2">No foods logged today</h2>
            <p className="text-muted-foreground mb-4">
              Take a photo of your food or add items manually
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate("/camera")}>
                <Camera size={18} className="mr-2" />
                Take Photo
              </Button>
              <Button variant="outline" onClick={() => {
                // Navigate to camera page and immediately open file upload
                navigate("/camera?action=upload");
              }}>
                <Upload size={18} className="mr-2" />
                Upload Manually
              </Button>
            </div>
          </div>
        )}
        
        <CameraButton />
      </div>
    </Layout>
  );
};

export default Index;
