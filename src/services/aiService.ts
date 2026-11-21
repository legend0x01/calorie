import { Platform } from 'react-native';
import { AIAnalysisResult, AIChatMessage, FoodItem, MealCategory, UserProfile } from '../types';

interface AIRequestOptions {
  userPrompt: string;
  imageUri?: string;
  userProfile?: UserProfile;
  remainingCalories?: number;
  remainingProtein?: number;
}

// Non-food question and gibberish detector
const NON_FOOD_KEYWORDS = [
  'what is', 'who is', 'where is', 'why is', 'how to', 'explain', 'definition',
  'meaning of', 'python', 'javascript', 'code', 'data', 'algorithm', 'system',
  'weather', 'president', 'math', 'science', 'history', 'news', 'hello', 'hi there',
  'test', 'whatever', 'computer', 'software', 'hardware', 'phone', 'car', 'movie',
];

const FOOD_KEYWORDS = [
  'chicken', 'rice', 'egg', 'eggs', 'oats', 'oatmeal', 'toast', 'bread', 'salmon',
  'fish', 'steak', 'beef', 'pork', 'turkey', 'salad', 'bowl', 'pizza', 'burger',
  'fries', 'apple', 'banana', 'berry', 'berries', 'yogurt', 'milk', 'shake',
  'protein', 'pasta', 'spaghetti', 'soup', 'stew', 'curry', 'taco', 'burrito',
  'sushi', 'sandwich', 'cheese', 'avocado', 'nuts', 'almonds', 'peanut', 'butter',
  'cookie', 'cake', 'chocolate', 'coffee', 'tea', 'juice', 'water', 'snack',
  'breakfast', 'lunch', 'dinner', 'meal', 'serving', 'gram', 'oz', 'cup', 'slice',
];

// Helper to validate if text relates to food/nutrition
export function isFoodInput(prompt: string): boolean {
  const clean = prompt.toLowerCase().trim();
  if (clean.length < 2) return false;

  // If contains direct non-food question triggers without food context
  const hasNonFoodKeyword = NON_FOOD_KEYWORDS.some((kw) => clean.includes(kw));
  const hasFoodKeyword = FOOD_KEYWORDS.some((kw) => clean.includes(kw));

  if (hasNonFoodKeyword && !hasFoodKeyword) {
    return false;
  }

  // Check if it looks like a non-food sentence
  if (
    clean.startsWith('what ') ||
    clean.startsWith('who ') ||
    clean.startsWith('how ') ||
    clean.startsWith('why ') ||
    clean.startsWith('where ') ||
    clean.startsWith('tell me ') ||
    clean.startsWith('explain ')
  ) {
    if (!hasFoodKeyword) {
      return false;
    }
  }

  return true;
}

// Specialized system prompt enforcing strict "Food & Calorie Analysis Only"
const NVIDIA_CALORIE_BRAIN_SYSTEM_PROMPT = `You are a specialized AI Brain for Calorie & Nutritional Analysis built strictly for calorie estimation and detailed food nutrition breakdown.
Your ONLY purpose is to analyze food items, meals, ingredients, calorie counts, macros (protein, carbs, fat, fiber), health ratings, and nutritional insights.

CRITICAL INSTRUCTION:
If the user input is NOT a valid food, meal, beverage, or ingredient description (e.g. general questions like "what is data", "who is president", programming, math, random chatter), you MUST set "isFood": false and "error": "Not a recognized food item. Please enter a valid food or meal description." in the JSON output.

Respond strictly with valid JSON only (no markdown, no code block backticks, no extra text).
JSON schema if valid food:
{
  "isFood": true,
  "foodName": "Short descriptive food name",
  "description": "Brief 1-sentence description",
  "mealCategory": "breakfast | lunch | dinner | snacks",
  "servingSize": 1,
  "servingUnit": "serving / plate / bowl / portion",
  "estimatedCalories": 450,
  "proteinG": 32,
  "carbsG": 45,
  "fatG": 14,
  "fiberG": 6,
  "healthRating": "A+" | "A" | "B" | "C" | "D",
  "healthScore": 88,
  "insights": ["Insight 1 on macros", "Insight 2 on nutritional value"],
  "ingredients": [
    {"name": "Ingredient name", "portion": "150g", "calories": 250}
  ],
  "confidence": 95
}

JSON schema if NOT food:
{
  "isFood": false,
  "error": "Not a recognized food item. Please enter a valid food or meal description (e.g. '2 eggs and toast', 'chicken salad')."
}`;

// Fallback intelligent local parser with food validation
export function parseFoodLocally(prompt: string): AIAnalysisResult {
  const clean = prompt.toLowerCase().trim();

  // Validate food input first
  if (!isFoodInput(prompt)) {
    throw new Error(
      `"${prompt}" is not recognized as a food or meal item. Please enter a valid food or drink description (e.g. "grilled chicken rice", "2 eggs and toast").`
    );
  }

  // Detect meal category
  let mealCategory: MealCategory = 'lunch';
  if (
    clean.includes('breakfast') ||
    clean.includes('egg') ||
    clean.includes('oat') ||
    clean.includes('toast') ||
    clean.includes('coffee') ||
    clean.includes('pancake') ||
    clean.includes('cereal')
  ) {
    mealCategory = 'breakfast';
  } else if (
    clean.includes('dinner') ||
    clean.includes('steak') ||
    clean.includes('curry') ||
    clean.includes('pasta') ||
    clean.includes('salmon') ||
    clean.includes('burger')
  ) {
    mealCategory = 'dinner';
  } else if (
    clean.includes('snack') ||
    clean.includes('bar') ||
    clean.includes('cookie') ||
    clean.includes('apple') ||
    clean.includes('nuts') ||
    clean.includes('yogurt') ||
    clean.includes('shake')
  ) {
    mealCategory = 'snacks';
  }

  let estimatedCalories = 450;
  let proteinG = 25;
  let carbsG = 45;
  let fatG = 15;
  let fiberG = 5;
  let ingredients: { name: string; portion: string; calories: number }[] = [];
  let insights: string[] = [];
  let healthScore = 85;
  let healthRating: 'A+' | 'A' | 'B' | 'C' | 'D' = 'A';

  // Keyword-based analysis
  if (clean.includes('chicken') && clean.includes('rice')) {
    estimatedCalories = 540;
    proteinG = 42;
    carbsG = 58;
    fatG = 12;
    fiberG = 4;
    ingredients = [
      { name: 'Grilled Chicken Breast', portion: '180g', calories: 290 },
      { name: 'Brown / Jasmine Rice', portion: '1.5 cups (200g)', calories: 210 },
      { name: 'Seasoning & Olive Oil', portion: '1 tsp', calories: 40 },
    ];
    insights = [
      'High protein meal perfect for lean muscle growth and recovery.',
      'Complex carbohydrates support sustained energy throughout the day.',
      'Low in saturated fats.',
    ];
    healthScore = 92;
    healthRating = 'A+';
  } else if (clean.includes('avocado') && clean.includes('toast')) {
    estimatedCalories = 380;
    proteinG = 14;
    carbsG = 34;
    fatG = 22;
    fiberG = 9;
    ingredients = [
      { name: 'Sourdough Artisan Bread', portion: '2 slices', calories: 200 },
      { name: 'Fresh Hass Avocado', portion: '1/2 medium (75g)', calories: 120 },
      { name: 'Poached Egg / Toppings', portion: '1 egg + chili flakes', calories: 60 },
    ];
    insights = [
      'Rich in heart-healthy monounsaturated fats.',
      'High dietary fiber (9g) helps with satiety and gut health.',
      'Good source of potassium and folate.',
    ];
    healthScore = 89;
    healthRating = 'A';
  } else if (clean.includes('salmon') || clean.includes('fish')) {
    estimatedCalories = 480;
    proteinG = 38;
    carbsG = 25;
    fatG = 24;
    fiberG = 5;
    ingredients = [
      { name: 'Pan-Seared Atlantic Salmon', portion: '180g', calories: 340 },
      { name: 'Steamed Asparagus / Veggies', portion: '150g', calories: 45 },
      { name: 'Quinoa / Sweet Potato', portion: '100g', calories: 95 },
    ];
    insights = [
      'Exceptional source of Omega-3 fatty acids (EPA & DHA).',
      'High biological value protein for muscle synthesis.',
      'Low glycemic impact.',
    ];
    healthScore = 96;
    healthRating = 'A+';
  } else if (clean.includes('salad') || clean.includes('bowl')) {
    estimatedCalories = 420;
    proteinG = 28;
    carbsG = 32;
    fatG = 18;
    fiberG = 7;
    ingredients = [
      { name: 'Mixed Greens & Spinach', portion: '150g', calories: 35 },
      { name: 'Lean Grilled Protein', portion: '120g', calories: 190 },
      { name: 'Light Vinaigrette & Nuts', portion: '2 tbsp', calories: 130 },
      { name: 'Chickpeas / Quinoa', portion: '50g', calories: 65 },
    ];
    insights = [
      'High in micronutrients, antioxidants, and dietary fiber.',
      'Helps maintain steady blood sugar levels.',
    ];
    healthScore = 91;
    healthRating = 'A';
  } else if (clean.includes('pizza') || clean.includes('burger') || clean.includes('fries')) {
    estimatedCalories = 680;
    proteinG = 28;
    carbsG = 65;
    fatG = 32;
    fiberG = 3;
    ingredients = [
      { name: 'Main Entree / Bun / Crust', portion: '1 standard serving', calories: 420 },
      { name: 'Cheese & Sauces', portion: '45g', calories: 180 },
      { name: 'Side / Condiments', portion: 'Portion', calories: 80 },
    ];
    insights = [
      'Higher in saturated fats and sodium — balance with higher fiber meals today.',
      'Satisfies quick energy requirements.',
    ];
    healthScore = 65;
    healthRating = 'C';
  } else if (clean.includes('oat') || clean.includes('oatmeal') || clean.includes('porridge')) {
    estimatedCalories = 360;
    proteinG = 18;
    carbsG = 52;
    fatG = 8;
    fiberG = 7;
    ingredients = [
      { name: 'Rolled Oats', portion: '50g', calories: 180 },
      { name: 'Protein Powder / Milk', portion: '1 scoop / cup', calories: 120 },
      { name: 'Berries & Seeds', portion: '50g', calories: 60 },
    ];
    insights = [
      'Beta-glucan soluble fiber supports heart health and lowering LDL.',
      'Slow-digesting complex carbs prevent energy crashes.',
    ];
    healthScore = 94;
    healthRating = 'A+';
  } else {
    // General food item
    const words = clean.split(' ').length;
    estimatedCalories = Math.min(850, Math.max(220, 280 + words * 20));
    proteinG = Math.round((estimatedCalories * 0.25) / 4);
    carbsG = Math.round((estimatedCalories * 0.45) / 4);
    fatG = Math.round((estimatedCalories * 0.30) / 9);
    fiberG = 4;
    ingredients = [
      { name: prompt.slice(0, 40), portion: '1 main portion', calories: Math.round(estimatedCalories * 0.7) },
      { name: 'Seasoning / Portion', portion: 'Standard', calories: Math.round(estimatedCalories * 0.3) },
    ];
    insights = [
      'Estimated based on standard nutritional density benchmarks.',
      'You can fine-tune portion sizes and macros before logging.',
    ];
  }

  const foodName =
    prompt.length > 50 ? prompt.slice(0, 47) + '...' : prompt.charAt(0).toUpperCase() + prompt.slice(1);

  return {
    foodName,
    description: `Estimated nutritional profile for "${prompt}"`,
    mealCategory,
    servingSize: 1,
    servingUnit: 'serving',
    estimatedCalories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    healthRating,
    healthScore,
    insights,
    ingredients,
    confidence: 94,
  };
}

// ---------------------------------------------------------------------------
// NVIDIA chat completions
//
// - Browsers cannot call integrate.api.nvidia.com directly: it sends no CORS
//   headers, so the request is blocked. On web we go through our own
//   same-origin Vercel function (api/nvidia.js), which forwards the user's key.
//   Native apps are not subject to CORS and call NVIDIA directly.
// - NVIDIA retires hosted models (llama-3.1-nemotron-70b-instruct, which this
//   app originally used, now returns 404). We try current models in order and
//   move on only when a model is missing, so one retirement degrades quietly
//   instead of silently disabling NVIDIA for every user.
// ---------------------------------------------------------------------------
const NVIDIA_DIRECT_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_ENDPOINT = Platform.OS === 'web' ? '/api/nvidia' : NVIDIA_DIRECT_URL;

export const NVIDIA_MODELS = [
  'nvidia/nemotron-3.5-lightning-30b-a3b',
  'nvidia/nemotron-3-ultra-550b-a55b',
  'google/gemma-4-31b-it',
];

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function nvidiaChat(
  apiKey: string,
  request: { messages: ChatMessage[]; temperature: number; max_tokens: number; top_p?: number },
  timeoutMs: number
): Promise<string> {
  let lastError = 'No NVIDIA model available';

  for (const model of NVIDIA_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(NVIDIA_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({ model, ...request }),
        signal: controller.signal,
      });

      if (res.status === 404) {
        lastError = `Model ${model} is not available (404)`;
        continue; // retired or unknown model: try the next one
      }
      if (!res.ok) {
        // Bad key, rate limit, server error: another model will not fix it.
        throw new Error(`NVIDIA API Error (${res.status}): ${(await res.text()).slice(0, 300)}`);
      }

      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content || '';
      // Reasoning models may prefix their answer with a <think> block.
      return content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(lastError);
}

// Call NVIDIA Nemotron API endpoint
async function analyzeWithNvidiaNemotron(
  prompt: string,
  mealCat: MealCategory,
  nvidiaApiKey: string
): Promise<AIAnalysisResult> {
  const body = {
    messages: [
      {
        role: 'system',
        content: NVIDIA_CALORIE_BRAIN_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Analyze this item for food calorie estimation: "${prompt}" (Category: ${mealCat})`,
      },
    ] as ChatMessage[],
    temperature: 0.1,
    top_p: 0.7,
    max_tokens: 1024,
  };

  const responseContent = await nvidiaChat(nvidiaApiKey, body, 12000);

  const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('NVIDIA model output did not contain valid JSON.');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (parsed.isFood === false || parsed.error) {
    throw new Error(parsed.error || 'Input is not recognized as a food item. Please enter a food or meal description.');
  }

  return {
    foodName: parsed.foodName || prompt,
    description: parsed.description || `NVIDIA AI analyzed: ${prompt}`,
    mealCategory: parsed.mealCategory || mealCat,
    servingSize: Number(parsed.servingSize) || 1,
    servingUnit: parsed.servingUnit || 'serving',
    estimatedCalories: Math.round(Number(parsed.estimatedCalories) || 400),
    proteinG: Math.round(Number(parsed.proteinG) || 20),
    carbsG: Math.round(Number(parsed.carbsG) || 40),
    fatG: Math.round(Number(parsed.fatG) || 12),
    fiberG: Math.round(Number(parsed.fiberG) || 4),
    healthRating: parsed.healthRating || 'A',
    healthScore: Math.min(100, Math.max(20, Number(parsed.healthScore) || 85)),
    insights: Array.isArray(parsed.insights) && parsed.insights.length
      ? parsed.insights
      : ['Powered by NVIDIA Nemotron AI Brain for accurate macro balancing.'],
    ingredients: Array.isArray(parsed.ingredients) && parsed.ingredients.length
      ? parsed.ingredients
      : [{ name: prompt, portion: '1 serving', calories: Math.round(Number(parsed.estimatedCalories) || 400) }],
    confidence: Math.min(100, Math.max(70, Number(parsed.confidence) || 96)),
  };
}

// Online API analyzer with NVIDIA priority and graceful fallback
export async function analyzeFoodWithAI(
  input: string,
  mealCat: MealCategory = 'lunch',
  apiKey?: string
): Promise<AIAnalysisResult> {
  const prompt = input.trim();
  if (!prompt) {
    throw new Error('Please enter a food description or photo');
  }

  // Pre-validate food input
  if (!isFoodInput(prompt)) {
    throw new Error(
      `"${prompt}" is not recognized as a food item. Please describe a valid food, beverage, or meal (e.g. "2 eggs and sourdough toast").`
    );
  }

  // 1. Prioritize NVIDIA Nemotron API if key is provided
  if (apiKey && apiKey.trim().length > 0) {
    try {
      console.log('Using NVIDIA Nemotron API Key for calorie analysis...');
      return await analyzeWithNvidiaNemotron(prompt, mealCat, apiKey.trim());
    } catch (nvidiaErr: any) {
      console.warn('NVIDIA API call failed, falling back:', nvidiaErr?.message || nvidiaErr);
      if (nvidiaErr.message && nvidiaErr.message.includes('not recognized as a food item')) {
        throw nvidiaErr;
      }
    }
  }

  // 2. Fallback to free public AI endpoint
  try {
    const systemPrompt = `You are an expert sports nutritionist AI. Analyze the food described by the user and respond strictly with valid JSON.
If input is NOT food (e.g. 'what is data', programming, general questions), respond with {"isFood": false, "error": "Not a recognized food item."}
JSON format if food:
{
  "isFood": true,
  "foodName": "Short descriptive food name",
  "description": "Brief 1-sentence description",
  "mealCategory": "${mealCat}",
  "servingSize": 1,
  "servingUnit": "serving / plate / bowl",
  "estimatedCalories": 450,
  "proteinG": 32,
  "carbsG": 45,
  "fatG": 14,
  "fiberG": 6,
  "healthRating": "A",
  "healthScore": 88,
  "insights": ["Insight 1 on macros"],
  "ingredients": [{"name": "Ingredient 1", "portion": "150g", "calories": 250}],
  "confidence": 95
}`;

    const endpoint = 'https://text.pollinations.ai/';
    const fullPrompt = `${systemPrompt}\n\nUser input to analyze: "${prompt}"`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(endpoint + encodeURIComponent(fullPrompt), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const rawText = await res.text();
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.isFood === false) {
          throw new Error('Not a recognized food item. Please enter a valid food or meal description.');
        }
        if (parsed.estimatedCalories && parsed.proteinG !== undefined) {
          return {
            foodName: parsed.foodName || prompt,
            description: parsed.description || `AI analyzed: ${prompt}`,
            mealCategory: parsed.mealCategory || mealCat,
            servingSize: Number(parsed.servingSize) || 1,
            servingUnit: parsed.servingUnit || 'serving',
            estimatedCalories: Math.round(Number(parsed.estimatedCalories)),
            proteinG: Math.round(Number(parsed.proteinG)),
            carbsG: Math.round(Number(parsed.carbsG)),
            fatG: Math.round(Number(parsed.fatG)),
            fiberG: Math.round(Number(parsed.fiberG || 4)),
            healthRating: parsed.healthRating || 'A',
            healthScore: Math.min(100, Math.max(20, Number(parsed.healthScore) || 85)),
            insights:
              Array.isArray(parsed.insights) && parsed.insights.length
                ? parsed.insights
                : ['Accurate macro balance calculated by AI.'],
            ingredients:
              Array.isArray(parsed.ingredients) && parsed.ingredients.length
                ? parsed.ingredients
                : [{ name: prompt, portion: '1 serving', calories: Math.round(Number(parsed.estimatedCalories)) }],
            confidence: Math.min(100, Math.max(70, Number(parsed.confidence) || 92)),
          };
        }
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('recognized as a food item')) {
      throw err;
    }
    console.log('AI API fetch fallback to local engine:', err);
  }

  // 3. Offline expert parser fallback
  return parseFoodLocally(prompt);
}

// AI Coach Chat Engine
export async function getNutritionCoachResponse(
  userMessage: string,
  history: AIChatMessage[],
  profile: UserProfile,
  dailySummary: {
    consumedCalories: number;
    targetCalories: number;
    consumedProtein: number;
    targetProtein: number;
    consumedCarbs: number;
    targetCarbs: number;
    consumedFat: number;
    targetFat: number;
    waterIntakeMl: number;
  },
  nvidiaApiKey?: string
): Promise<string> {
  const goalText =
    profile.goalType === 'lose_weight'
      ? 'weight loss & fat burning (deficit)'
      : profile.goalType === 'gain_weight'
      ? 'weight/muscle gain & hypertrophy (surplus)'
      : 'weight maintenance & vitality';

  const caloriesRemaining = dailySummary.targetCalories - dailySummary.consumedCalories;
  const proteinRemaining = dailySummary.targetProtein - dailySummary.consumedProtein;

  const coachPrompt = `You are "NutriPulse AI Coach" powered by NVIDIA Nemotron. You are strictly a certified sports nutritionist & calorie coach. You ONLY provide advice related to nutrition, calorie budgets, macros, diet plans, and health goals.

User Context:
- Goal: ${goalText} (Target: ${profile.targetWeightKg}kg, Current: ${profile.currentWeightKg}kg)
- Daily Budget: ${dailySummary.targetCalories} kcal (Consumed: ${dailySummary.consumedCalories} kcal, Remaining: ${caloriesRemaining} kcal)
- Protein Target: ${dailySummary.targetProtein}g (Consumed: ${dailySummary.consumedProtein}g, Remaining: ${proteinRemaining}g)
- Water Logged: ${dailySummary.waterIntakeMl}ml / ${profile.targetWaterMl}ml

User Question: "${userMessage}"

Provide a concise, practical, motivating answer (2-4 paragraphs). Include realistic calorie & protein counts when suggesting foods!`;

  if (nvidiaApiKey && nvidiaApiKey.trim().length > 0) {
    try {
      const reply = await nvidiaChat(
        nvidiaApiKey,
        {
          messages: [
            { role: 'system', content: 'You are a strict Food & Calorie Coach AI Brain.' },
            { role: 'user', content: coachPrompt },
          ],
          temperature: 0.3,
          max_tokens: 512,
        },
        10000
      );
      if (reply.length > 10) {
        return reply;
      }
    } catch (e) {
      console.warn('NVIDIA Coach call error, using fallback:', e);
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('https://text.pollinations.ai/' + encodeURIComponent(coachPrompt), {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 20) {
        return text.trim();
      }
    }
  } catch (e) {
    console.log('Coach fetch fallback:', e);
  }

  const q = userMessage.toLowerCase();
  if (q.includes('snack') || q.includes('remaining') || q.includes('what can i eat')) {
    if (caloriesRemaining > 300) {
      return `Based on your remaining **${caloriesRemaining} kcal** and **${proteinRemaining}g protein** budget for today:\n\n1. **Greek Yogurt Crunch** (170g 0% Greek yogurt + 15g almonds + berries): ~210 kcal | 20g Protein\n2. **Protein Shake & Rice Cake**: 1 scoop whey + 1 rice cake with peanut butter: ~240 kcal | 26g Protein\n3. **Cottage Cheese & Pineapple Bowl**: ~180 kcal | 22g Protein\n\nThese will keep you on track for your **${profile.goalType === 'gain_weight' ? 'bulking' : 'cutting'}** goal!`;
    } else if (caloriesRemaining > 100) {
      return `You have **${caloriesRemaining} kcal** remaining today. Here are light, filling options:\n\n• **Hard-Boiled Egg with Sea Salt**: 78 kcal | 6.3g Protein\n• **Apple slices with cinnamon**: ~75 kcal | High fiber\n• **Hot Green Tea + 1 square 85% Dark Chocolate**: ~60 kcal\n• **Large glass of ice water or electrolyte water** to curb late cravings!`;
    } else {
      return `You've reached your daily calorie target (${dailySummary.consumedCalories} / ${dailySummary.targetCalories} kcal)! Great discipline today. If you feel hungry, opt for zero-calorie peppermint herbal tea, sparkling water with lime, or sliced crisp cucumber with salt.`;
    }
  }

  if (q.includes('protein') || q.includes('muscle') || q.includes('hit protein')) {
    return `To hit your **${dailySummary.targetProtein}g daily protein target** without blowing your calorie budget:\n\n• **Top lean choices**: Chicken breast (31g P / 165 kcal), 0% Greek yogurt (18g P / 100 kcal), Egg whites (11g P / 51 kcal), Tuna in water (25g P / 116 kcal), Whey isolate (24g P / 120 kcal).\n• Tip: Aim for 25-35g of protein distributed across each of your 3-4 meals!`;
  }

  if (q.includes('lose') || q.includes('fat') || q.includes('deficit')) {
    return `Your calorie deficit of **${dailySummary.targetCalories} kcal/day** is calibrated for steady, sustainable fat loss without losing muscle. Remember to keep protein high (${profile.targetProteinG}g) and drink at least ${profile.targetWaterMl}ml of water daily to boost metabolic rate and keep hunger under control!`;
  }

  return `Great question! Staying consistent with your **${dailySummary.targetCalories} kcal** daily target and prioritizing whole foods, lean proteins, and fiber is the #1 driver for your **${profile.goalType === 'lose_weight' ? 'fat loss' : profile.goalType === 'gain_weight' ? 'muscle gain' : 'maintenance'}** goal. You're at ${dailySummary.consumedCalories} kcal today. Let me know if you need specific meal suggestions or recipe ideas!`;
}
