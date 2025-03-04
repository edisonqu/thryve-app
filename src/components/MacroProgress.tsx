
import React from "react";
import { useNutrition } from "@/context/NutritionContext";
import { calculatePercentage, formatNumber, getProgressColor } from "@/utils/macroCalculation";

interface MacroProgressProps {
  compact?: boolean;
}

const MacroProgress: React.FC<MacroProgressProps> = ({ compact = false }) => {
  const { dailyTotals, dailyGoals } = useNutrition();
  
  const macros = [
    {
      name: "Calories",
      current: dailyTotals.calories,
      target: dailyGoals.calories,
      unit: "kcal",
      color: "bg-blue-400",
    },
    {
      name: "Carbs",
      current: dailyTotals.carbs,
      target: dailyGoals.carbs,
      unit: "g",
      color: "bg-green-400",
    },
    {
      name: "Protein",
      current: dailyTotals.protein,
      target: dailyGoals.protein,
      unit: "g",
      color: "bg-purple-400",
    },
    {
      name: "Fat",
      current: dailyTotals.fat,
      target: dailyGoals.fat,
      unit: "g",
      color: "bg-yellow-400",
    },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-4 gap-2 w-full">
        {macros.map((macro) => {
          const percentage = calculatePercentage(macro.current, macro.target);
          return (
            <div key={macro.name} className="flex flex-col items-center">
              <div className="relative w-12 h-12 mb-1">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-muted"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className={`${macro.color} transition-all duration-1000 ease-out`}
                    strokeWidth="3"
                    strokeDasharray="100"
                    strokeDashoffset={100 - percentage}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {percentage}%
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{macro.name}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full animate-slide-up">
      {macros.map((macro) => {
        const percentage = calculatePercentage(macro.current, macro.target);
        const progressColor = getProgressColor(percentage);
        
        return (
          <div key={macro.name} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-medium">{macro.name}</span>
              <span className="text-sm text-muted-foreground">
                {formatNumber(macro.current)}/{formatNumber(macro.target)} {macro.unit}
              </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${progressColor} rounded-full transition-all duration-1000 ease-out animate-progress-fill`}
                style={{ "--progress-value": `${percentage}%` } as React.CSSProperties}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MacroProgress;
