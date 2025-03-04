
// This is a mock implementation - in a real app, this would connect to a food recognition API

import { Food } from "@/context/NutritionContext";

// Sample food database for mock recognition
const foodDatabase = [
  {
    name: "Apple",
    calories: 95,
    carbs: 25,
    protein: 0.5,
    fat: 0.3,
    servingSize: "1 medium (182g)",
  },
  {
    name: "Banana",
    calories: 105,
    carbs: 27,
    protein: 1.3,
    fat: 0.4,
    servingSize: "1 medium (118g)",
  },
  {
    name: "Grilled Chicken Breast",
    calories: 165,
    carbs: 0,
    protein: 31,
    fat: 3.6,
    servingSize: "100g",
  },
  {
    name: "Salmon Fillet",
    calories: 206,
    carbs: 0,
    protein: 22,
    fat: 13,
    servingSize: "100g",
  },
  {
    name: "Brown Rice",
    calories: 216,
    carbs: 45,
    protein: 5,
    fat: 1.8,
    servingSize: "1 cup cooked (195g)",
  },
  {
    name: "Avocado",
    calories: 240,
    carbs: 12,
    protein: 3,
    fat: 22,
    servingSize: "1 medium (150g)",
  },
  {
    name: "Greek Yogurt",
    calories: 100,
    carbs: 3.6,
    protein: 17,
    fat: 0.4,
    servingSize: "170g container",
  },
  {
    name: "Egg",
    calories: 68,
    carbs: 0.6,
    protein: 5.5,
    fat: 4.8,
    servingSize: "1 large (50g)",
  },
  {
    name: "Salad Bowl",
    calories: 180,
    carbs: 10,
    protein: 8,
    fat: 12,
    servingSize: "1 bowl (250g)",
  },
  {
    name: "Protein Shake",
    calories: 150,
    carbs: 5,
    protein: 25,
    fat: 3,
    servingSize: "1 scoop in water (300ml)",
  },
  {
    name: "Oatmeal",
    calories: 158,
    carbs: 27,
    protein: 6,
    fat: 3.2,
    servingSize: "1 cup cooked (234g)",
  },
  {
    name: "Steak",
    calories: 271,
    carbs: 0,
    protein: 26,
    fat: 18,
    servingSize: "100g",
  },
];

/**
 * Simulates food recognition from an image
 * In a real app, this would call an image recognition API
 */
export const recognizeFoodFromImage = async (imageFile: File): Promise<Food | null> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, we would send the image to an API
      // For mock, we'll just return a random food from our database
      const randomFoodIndex = Math.floor(Math.random() * foodDatabase.length);
      const recognizedFood = foodDatabase[randomFoodIndex];
      
      // Create a unique ID and add timestamp
      const food: Food = {
        ...recognizedFood,
        id: `food_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date(),
        imageUrl: URL.createObjectURL(imageFile),
      };
      
      resolve(food);
    }, 1500); // Simulate 1.5 second delay
  });
};

/**
 * Searches for foods by name
 */
export const searchFoods = (query: string): Food[] => {
  if (!query) return [];
  
  const lowercaseQuery = query.toLowerCase();
  
  return foodDatabase
    .filter(food => food.name.toLowerCase().includes(lowercaseQuery))
    .map(food => ({
      ...food,
      id: `food_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
    }));
};

/**
 * Gets suggested foods based on time of day
 */
export const getSuggestedFoods = (): Food[] => {
  const hour = new Date().getHours();
  let suggestions: Food[] = [];
  
  // Morning suggestions
  if (hour >= 5 && hour < 11) {
    suggestions = foodDatabase.filter(food => 
      ["Oatmeal", "Greek Yogurt", "Egg", "Banana"].includes(food.name)
    );
  } 
  // Lunch suggestions
  else if (hour >= 11 && hour < 15) {
    suggestions = foodDatabase.filter(food => 
      ["Grilled Chicken Breast", "Salad Bowl", "Brown Rice", "Salmon Fillet"].includes(food.name)
    );
  } 
  // Dinner suggestions
  else if (hour >= 17 && hour < 22) {
    suggestions = foodDatabase.filter(food => 
      ["Salmon Fillet", "Steak", "Brown Rice", "Avocado"].includes(food.name)
    );
  } 
  // Snack suggestions
  else {
    suggestions = foodDatabase.filter(food => 
      ["Apple", "Banana", "Greek Yogurt", "Protein Shake"].includes(food.name)
    );
  }
  
  // Map to include ids and timestamps
  return suggestions.map(food => ({
    ...food,
    id: `suggestion_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date(),
  }));
};
