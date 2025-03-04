
import React from "react";
import { Card } from "@/components/ui/card";
import { Food } from "@/context/NutritionContext";
import { formatDecimal } from "@/utils/macroCalculation";

interface FoodCardProps {
  food: Food;
  onRemove?: () => void;
  onClick?: () => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, onRemove, onClick }) => {
  const formattedTime = new Date(food.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-md animate-scale-in glass-card"
      onClick={onClick}
    >
      <div className="flex">
        {food.imageUrl && (
          <div className="w-24 h-24 shrink-0">
            <img 
              src={food.imageUrl} 
              alt={food.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        <div className="flex-1 p-3">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium">{food.name}</h3>
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">{food.servingSize}</p>
          
          <div className="flex justify-between text-sm">
            <div className="flex space-x-2">
              <span className="font-medium">{food.calories} cal</span>
              <span className="text-green-600">C: {formatDecimal(food.carbs)}g</span>
              <span className="text-purple-600">P: {formatDecimal(food.protein)}g</span>
              <span className="text-yellow-600">F: {formatDecimal(food.fat)}g</span>
            </div>
            
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FoodCard;
