
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNutrition } from "@/context/NutritionContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculateMacroDistribution } from "@/utils/macroCalculation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

const FoodDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { foods, removeFood } = useNutrition();
  
  const food = foods.find(f => f.id === id);
  
  if (!food) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h1 className="text-xl font-semibold mb-4">Food not found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </Layout>
    );
  }
  
  const { carbsPercentage, proteinPercentage, fatPercentage } = calculateMacroDistribution(
    food.carbs,
    food.protein,
    food.fat
  );
  
  const formattedDate = new Date(food.timestamp).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  
  const formattedTime = new Date(food.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const handleDelete = () => {
    removeFood(food.id);
    toast.success(`${food.name} removed from your diary`);
    navigate(-1);
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-semibold">Food Details</h1>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 size={20} className="text-red-500" />
          </Button>
        </div>
        
        {food.imageUrl && (
          <div className="rounded-lg overflow-hidden h-48 bg-black animate-scale-in">
            <img
              src={food.imageUrl}
              alt={food.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">{food.name}</h2>
          <p className="text-muted-foreground">{food.servingSize}</p>
          <p className="text-sm text-muted-foreground">
            Added on {formattedDate} at {formattedTime}
          </p>
        </div>
        
        <Card className="glass-card p-4">
          <h3 className="text-lg font-medium mb-4">Nutrition Facts</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="font-medium">Calories</span>
              <span>{food.calories} kcal</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Carbs</span>
                <div className="flex items-center">
                  <span className="mr-2">{food.carbs}g</span>
                  <span className="text-muted-foreground text-sm">({carbsPercentage}%)</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Protein</span>
                <div className="flex items-center">
                  <span className="mr-2">{food.protein}g</span>
                  <span className="text-muted-foreground text-sm">({proteinPercentage}%)</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Fat</span>
                <div className="flex items-center">
                  <span className="mr-2">{food.fat}g</span>
                  <span className="text-muted-foreground text-sm">({fatPercentage}%)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="glass-card overflow-hidden">
          <div className="flex h-10">
            <div
              className="bg-green-400 h-full"
              style={{ width: `${carbsPercentage}%` }}
            />
            <div
              className="bg-purple-400 h-full"
              style={{ width: `${proteinPercentage}%` }}
            />
            <div
              className="bg-yellow-400 h-full"
              style={{ width: `${fatPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between p-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-400 mr-2" />
              <span>Carbs</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-400 mr-2" />
              <span>Protein</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2" />
              <span>Fat</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default FoodDetail;
