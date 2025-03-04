
// This implements both mock food recognition and Google Gemini AI for image analysis

import { Food } from "@/context/NutritionContext";

// Sample food database for mock recognition and fallback
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
 * Uses Google Gemini to analyze food images and estimate nutrition
 */
async function analyzeImageWithGemini(imageFile: File): Promise<Food | null> {
  try {
    // Convert the image file to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Prepare the API request to Gemini
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=AIzaSyAsWmAGsRyEEbvHbJ8KESaQYBaFkFuJB68', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Please analyze this food image and provide the following information in JSON format only: name of the food, estimated calories, estimated carbohydrates (g), estimated protein (g), estimated fat (g), and an appropriate serving size. Do not include any explanation or additional text, just return valid JSON with these fields: name, calories, carbs, protein, fat, servingSize. Your response should be valid JSON that can be directly parsed."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return null;
    }

    const data = await response.json();
    console.log('Gemini API response:', data);
    
    // Extract the text response
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      console.error('No text response from Gemini');
      return null;
    }
    
    // Try to extract JSON from the response
    // Sometimes the model returns markdown-formatted JSON, so we need to clean it
    const jsonString = textResponse.replace(/```json|```/g, '').trim();
    
    try {
      const foodData = JSON.parse(jsonString);
      
      // Validate the parsed data has all required fields
      if (foodData.name && 
          typeof foodData.calories === 'number' && 
          typeof foodData.carbs === 'number' &&
          typeof foodData.protein === 'number' &&
          typeof foodData.fat === 'number' &&
          foodData.servingSize) {
        
        // Create a unique ID and add timestamp
        const food: Food = {
          ...foodData,
          id: `food_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date(),
          imageUrl: URL.createObjectURL(imageFile),
        };
        
        return food;
      } else {
        console.error('Invalid food data format from Gemini:', foodData);
        return null;
      }
    } catch (err) {
      console.error('Error parsing Gemini response as JSON:', err);
      console.log('Raw response:', textResponse);
      return null;
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

/**
 * Helper function to convert File to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Recognizes food from an image, using Gemini AI with fallback to mock data
 */
export const recognizeFoodFromImage = async (imageFile: File): Promise<Food | null> => {
  try {
    // First try with Gemini AI
    const geminiResult = await analyzeImageWithGemini(imageFile);
    
    if (geminiResult) {
      console.log('Successfully recognized food with Gemini:', geminiResult);
      return geminiResult;
    }
    
    console.log('Gemini recognition failed, falling back to mock data');
    
    // Fallback to mock implementation if Gemini fails
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
  } catch (error) {
    console.error('Error in food recognition:', error);
    return null;
  }
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
  let filteredFoods: Array<(typeof foodDatabase)[0]> = [];
  
  // Morning suggestions
  if (hour >= 5 && hour < 11) {
    filteredFoods = foodDatabase.filter(food => 
      ["Oatmeal", "Greek Yogurt", "Egg", "Banana"].includes(food.name)
    );
  } 
  // Lunch suggestions
  else if (hour >= 11 && hour < 15) {
    filteredFoods = foodDatabase.filter(food => 
      ["Grilled Chicken Breast", "Salad Bowl", "Brown Rice", "Salmon Fillet"].includes(food.name)
    );
  } 
  // Dinner suggestions
  else if (hour >= 17 && hour < 22) {
    filteredFoods = foodDatabase.filter(food => 
      ["Salmon Fillet", "Steak", "Brown Rice", "Avocado"].includes(food.name)
    );
  } 
  // Snack suggestions
  else {
    filteredFoods = foodDatabase.filter(food => 
      ["Apple", "Banana", "Greek Yogurt", "Protein Shake"].includes(food.name)
    );
  }
  
  // Map to include ids and timestamps to make them proper Food objects
  return filteredFoods.map(food => ({
    ...food,
    id: `suggestion_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date(),
  }));
};
