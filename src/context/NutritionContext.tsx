
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Food {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  servingSize: string;
  timestamp: Date;
  imageUrl?: string;
  unidentified?: boolean
}

export interface DailyGoals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface NutritionContextType {
  foods: Food[];
  addFood: (food: Food) => void;
  removeFood: (id: string) => void;
  clearFoods: () => void;
  dailyGoals: DailyGoals;
  updateDailyGoals: (goals: Partial<DailyGoals>) => void;
  dailyTotals: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };
  todaysFoods: Food[];
}

const defaultGoals: DailyGoals = {
  calories: 2000,
  carbs: 250,
  protein: 150,
  fat: 65,
};

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [foods, setFoods] = useState<Food[]>(() => {
    const savedFoods = localStorage.getItem("foods");
    return savedFoods ? JSON.parse(savedFoods).map((food: any) => ({
      ...food,
      timestamp: new Date(food.timestamp)
    })) : [];
  });
  
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>(() => {
    const savedGoals = localStorage.getItem("dailyGoals");
    return savedGoals ? JSON.parse(savedGoals) : defaultGoals;
  });

  // Save to localStorage whenever foods or goals change
  useEffect(() => {
    localStorage.setItem("foods", JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem("dailyGoals", JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter foods for today only
  const todaysFoods = foods.filter(food => {
    const foodDate = new Date(food.timestamp);
    foodDate.setHours(0, 0, 0, 0);
    return foodDate.getTime() === today.getTime();
  });

  // Calculate daily totals
  const dailyTotals = todaysFoods.reduce(
    (acc, food) => {
      return {
        calories: acc.calories + food.calories,
        carbs: acc.carbs + food.carbs,
        protein: acc.protein + food.protein,
        fat: acc.fat + food.fat,
      };
    },
    { calories: 0, carbs: 0, protein: 0, fat: 0 }
  );

  const addFood = (food: Food) => {
    setFoods(prev => [...prev, food]);
  };

  const removeFood = (id: string) => {
    setFoods(prev => prev.filter(food => food.id !== id));
  };

  const clearFoods = () => {
    setFoods([]);
  };

  const updateDailyGoals = (goals: Partial<DailyGoals>) => {
    setDailyGoals(prev => ({ ...prev, ...goals }));
  };

  return (
    <NutritionContext.Provider
      value={{
        foods,
        addFood,
        removeFood,
        clearFoods,
        dailyGoals,
        updateDailyGoals,
        dailyTotals,
        todaysFoods,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = (): NutritionContextType => {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error("useNutrition must be used within a NutritionProvider");
  }
  return context;
};
