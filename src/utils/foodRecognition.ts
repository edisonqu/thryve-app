// This implements both mock food recognition and Google Gemini AI for image analysis

import { Food } from "@/context/NutritionContext";

// Rate limiting implementation
let requestCount = 0;
let lastResetTime = Date.now();

// Environment variables - using Vite's import.meta.env instead of process.env
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const RATE_LIMIT_MAX_REQUESTS = Number(import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS || '50');
const RATE_LIMIT_WINDOW_MS = Number(import.meta.env.VITE_RATE_LIMIT_WINDOW_MS || '60000');
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS || '30000');
const MAX_RETRIES = Number(import.meta.env.VITE_MAX_RETRIES || '3');
const RETRY_DELAY_MS = Number(import.meta.env.VITE_RETRY_DELAY_MS || '1000');

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
 * Check if we've hit the rate limit
 */
function checkRateLimit(): boolean {
  const now = Date.now();
  
  // Reset counter if we're in a new time window
  if (now - lastResetTime > RATE_LIMIT_WINDOW_MS) {
    requestCount = 0;
    lastResetTime = now;
  }
  
  // Check if we've hit the limit
  if (requestCount >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  // Increment the counter and allow the request
  requestCount++;
  return true;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Uses Google Gemini to analyze food images and estimate nutrition
 */
async function analyzeImageWithGemini(imageFile: File): Promise<Food | null> {
  // Check if API key is available
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key is not configured in environment variables');
    throw new Error('API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
  }
  
  try {
    const base64Image = await fileToBase64(imageFile);
    
    // Check rate limiting
    if (!checkRateLimit()) {
      throw new Error(`Rate limit exceeded. Please try again after ${RATE_LIMIT_WINDOW_MS/1000} seconds.`);
    }
    
    // Implement retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} of ${MAX_RETRIES}...`);
        // Wait before retrying
        await sleep(RETRY_DELAY_MS * attempt); // Exponential backoff
      }
      
      try {
        // Set up AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a food and nutrition expert. Analyze this food image and provide nutritional information in the following JSON format:
                    {
                      "name": "The specific food identified",
                      "calories": number in kcal (example: 150),
                      "carbs": grams of carbohydrates (example: 25),
                      "protein": grams of protein (example: 5),
                      "fat": grams of fat (example: 3),
                      "servingSize": "description of the portion"
                    }
                    
                    Important rules:
                    1. Only identify what you can clearly see in the image
                    2. Don't make guesses about foods that aren't visible
                    3. All nutritional values MUST be specific numbers (not null, not ranges, not estimates)
                    4. Use typical serving sizes and standard nutritional values
                    5. Be specific about portion size
                    6. Return ONLY the JSON object, no other text
                    7. If you cannot determine exact values, use typical values for that food type
                    8. All numbers should be rounded to 1 decimal place
                    
                    Example response for a banana:
                    {
                      "name": "Banana",
                      "calories": 105,
                      "carbs": 27,
                      "protein": 1.3,
                      "fat": 0.4,
                      "servingSize": "1 medium (118g)"
                    }`
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
              temperature: 0.1,
              topK: 32,
              topP: 1,
              maxOutputTokens: 1024,
            }
          }),
          signal: controller.signal
        });
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Gemini API error:', errorText);
          throw new Error(`API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Gemini API response:', data);
        
        // Extract the JSON response
        const candidatePart = data.candidates?.[0]?.content?.parts?.[0];
        
        if (!candidatePart) {
          throw new Error('No response from Gemini');
        }
        
        // With responseSchema, the response should be structured
        try {
          let foodData;
          
          // Check if the response is already structured
          if (candidatePart.functionResponse) {
            foodData = candidatePart.functionResponse.outputs;
          } else if (candidatePart.text) {
            // Try to extract JSON if it's in text format
            const jsonString = candidatePart.text.replace(/```json|```/g, '').trim();
            foodData = JSON.parse(jsonString);
          }
          
          if (!foodData) {
            throw new Error('Could not extract food data from response');
          }
          
          // Validate the parsed data has all required fields
          if (foodData.name && 
              typeof foodData.calories === 'number' && 
              typeof foodData.carbs === 'number' &&
              typeof foodData.protein === 'number' &&
              typeof foodData.fat === 'number' &&
              foodData.servingSize &&
              foodData.calories >= 0 &&
              foodData.carbs >= 0 &&
              foodData.protein >= 0 &&
              foodData.fat >= 0) {
            
            // Create a unique ID and add timestamp
            const food: Food = {
              ...foodData,
              id: `food_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              timestamp: new Date(),
              imageUrl: URL.createObjectURL(imageFile),
            };
            
            return food;
          } else {
            throw new Error('Invalid food data format from Gemini');
          }
        } catch (err) {
          console.error('Error processing Gemini response:', err);
          console.log('Raw response:', candidatePart);
          throw err;
        }
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If this is not the last attempt, continue to the next iteration
        if (attempt < MAX_RETRIES) {
          continue;
        }
        
        // On last attempt, throw the error
        throw lastError;
      }
    }
    
    // This should never be reached due to the throw in the last iteration
    return null;
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
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
    
    // Instead of falling back, throw the error
    throw new Error('Failed to recognize food with Gemini AI. Please try again later.');
    
  } catch (error) {
    console.error('Error in food recognition:', error);
    // Re-throw the error to be handled by the UI
    throw error;
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
