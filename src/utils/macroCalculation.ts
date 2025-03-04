
import { Food } from "@/context/NutritionContext";

/**
 * Calculates the percentage of a current value against a target
 */
export const calculatePercentage = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

/**
 * Calculates the remaining macros for the day
 */
export const calculateRemaining = (current: number, target: number): number => {
  return Math.max(target - current, 0);
};

/**
 * Formats a number with comma thousands separators
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString("en-US");
};

/**
 * Formats a decimal number to a specific precision
 */
export const formatDecimal = (value: number, precision: number = 1): string => {
  return value.toFixed(precision);
};

/**
 * Calculates macro distribution (carbs/protein/fat) as percentages
 */
export const calculateMacroDistribution = (
  carbs: number,
  protein: number,
  fat: number
): { carbsPercentage: number; proteinPercentage: number; fatPercentage: number } => {
  const total = carbs + protein + fat;
  
  if (total === 0) {
    return {
      carbsPercentage: 0,
      proteinPercentage: 0,
      fatPercentage: 0,
    };
  }
  
  return {
    carbsPercentage: Math.round((carbs / total) * 100),
    proteinPercentage: Math.round((protein / total) * 100),
    fatPercentage: Math.round((fat / total) * 100),
  };
};

/**
 * Groups foods by meal time based on the timestamp
 */
export const groupFoodsByMeal = (foods: Food[]): Record<string, Food[]> => {
  const meals: Record<string, Food[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  };
  
  foods.forEach(food => {
    const hour = new Date(food.timestamp).getHours();
    
    if (hour >= 5 && hour < 11) {
      meals.breakfast.push(food);
    } else if (hour >= 11 && hour < 15) {
      meals.lunch.push(food);
    } else if (hour >= 17 && hour < 22) {
      meals.dinner.push(food);
    } else {
      meals.snacks.push(food);
    }
  });
  
  return meals;
};

/**
 * Gets a color for a progress bar based on the percentage
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage <= 25) return "bg-blue-400";
  if (percentage <= 60) return "bg-green-400";
  if (percentage <= 85) return "bg-yellow-400";
  return "bg-red-400";
};
