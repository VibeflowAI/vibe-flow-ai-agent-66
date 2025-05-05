
// Follow Deno runtime API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Adding default recommendations");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // First check if recommendations already exist
    const { count, error: countError } = await supabaseClient
      .from('recommendations')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // If recommendations already exist, return success without adding more
    if (count && count > 0) {
      console.log(`Found ${count} existing recommendations, skipping addition of defaults`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Recommendations already exist", 
          count: count 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // If no recommendations exist, add the defaults
    console.log("No recommendations found, adding defaults");

    // The complete set of recommendations based on mood and energy levels
    const recommendations = [
      // Happy + Low Energy
      { 
        title: 'Enjoy yogurt with honey', 
        description: 'A gentle sweet treat that provides energy without being overwhelming.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      { 
        title: 'Sip herbal tea', 
        description: 'A calming warm beverage to maintain your positive mood.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      { 
        title: 'Eat a banana', 
        description: 'Natural energy boost that works gently with your current energy level.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      { 
        title: 'Gentle stretching session', 
        description: 'Keep your happy mood while respecting your low energy with gentle movement.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      { 
        title: 'Try foam rolling', 
        description: 'Self-massage that feels good and requires minimal energy.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      { 
        title: 'Take a slow-paced walk', 
        description: 'Enjoy your good mood with a leisurely stroll that won\'t tax your energy.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      { 
        title: 'Music appreciation moment', 
        description: 'Listen to your favorite songs mindfully while resting.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      { 
        title: 'Practice mindful smiling', 
        description: 'Enhance your happy mood by consciously smiling and feeling the sensation.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      { 
        title: 'Short reflection period', 
        description: 'Take a moment to appreciate your positive mood even with low energy.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      
      // Happy + Medium Energy
      { 
        title: 'Prepare a smoothie bowl', 
        description: 'A nutritious treat that matches your upbeat mood and moderate energy.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      { 
        title: 'Snack on mixed nuts', 
        description: 'Sustained energy to complement your positive mood.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      { 
        title: 'Enjoy dark chocolate', 
        description: 'A mood-boosting treat that provides antioxidants and pleasure.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      { 
        title: 'Take a brisk walk', 
        description: 'Match your happy mood with some moderately energetic movement.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      { 
        title: 'Do a dance workout', 
        description: 'Express your happiness through movement that matches your energy level.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      { 
        title: 'Try light cardio', 
        description: 'Get your heart pumping while enjoying your positive mood.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      { 
        title: 'Write a gratitude list', 
        description: 'Enhance your happy mood by noting what you\'re thankful for.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      { 
        title: 'Moment of reflection', 
        description: 'Take time to appreciate your current positive state of mind.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      { 
        title: 'Practice mindful breathing', 
        description: 'Center yourself with conscious breathing to enhance your mood.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      
      // Happy + High Energy
      { 
        title: 'Prepare a fruit salad', 
        description: 'Fresh, vibrant foods to match your high energy and happy mood.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      { 
        title: 'Enjoy hummus with veggies', 
        description: 'Nutritious snack to sustain your energy and good mood.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      { 
        title: 'Try a grilled chicken wrap', 
        description: 'Balanced protein and carbs to fuel your energetic happy state.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      { 
        title: 'Go for a jog', 
        description: 'Use your high energy and good mood for an invigorating run.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      { 
        title: 'Hop on a bicycle', 
        description: 'Channel your happiness and energy into an enjoyable ride.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      { 
        title: 'Try a HIIT workout', 
        description: 'Make the most of your high energy with an intense, mood-boosting exercise.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      { 
        title: 'Take a mindful nature walk', 
        description: 'Be fully present in nature while enjoying your positive state.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      { 
        title: 'Engage deeply with music', 
        description: 'Channel your energy into really experiencing your favorite songs.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      { 
        title: 'Practice laughter meditation', 
        description: 'Use your happy energy for conscious joyful expression.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      
      // Calm + Low Energy
      { 
        title: 'Have a bowl of oatmeal', 
        description: 'Comforting food that sustains your calm state without requiring much energy.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      { 
        title: 'Sip chamomile tea', 
        description: 'A soothing beverage that complements your calm, low-energy state.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      { 
        title: 'Enjoy apple slices', 
        description: 'A gentle, sweet snack that maintains your peaceful energy.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      { 
        title: 'Try light stretching', 
        description: 'Gentle movement that maintains your calm state while respecting low energy.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      { 
        title: 'Take a soft walk', 
        description: 'A gentle stroll to maintain your peaceful mood without exertion.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      { 
        title: 'Do some foam rolling', 
        description: 'Gentle self-massage that complements your calm, low-energy state.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      { 
        title: 'Practice mindful tea drinking', 
        description: 'Focus fully on the experience of preparing and drinking tea.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      { 
        title: 'Focus on your breath', 
        description: 'A simple mindfulness practice that suits your calm, low-energy state.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      { 
        title: 'Try gentle journaling', 
        description: 'Write a few thoughts without pressure to produce anything specific.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      
      // Calm + Medium Energy
      { 
        title: 'Make avocado toast', 
        description: 'Nutritious food that supports your balanced mood and energy.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      { 
        title: 'Try whole grain crackers', 
        description: 'A satisfying snack that maintains your calm, moderate energy.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      { 
        title: 'Enjoy a bowl of berries', 
        description: 'Light, nutritious fruit that complements your balanced state.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      { 
        title: 'Take a casual walk', 
        description: 'Moderate activity that maintains your calm state.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      { 
        title: 'Do a stretching flow', 
        description: 'Fluid movement that complements your calm, moderately energetic state.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      { 
        title: 'Organize your space', 
        description: 'Productive activity that matches your calm focus and moderate energy.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      { 
        title: 'Practice focused breathing', 
        description: 'A slightly more engaged breath practice to match your energy level.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      { 
        title: 'Try a 5 senses check-in', 
        description: 'Notice what you can see, hear, smell, taste and feel right now.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      { 
        title: 'Listen to calm music', 
        description: 'Enhance your peaceful state with complementary sounds.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      
      // Calm + High Energy
      { 
        title: 'Drink green tea', 
        description: 'Maintains your calm focus while supporting your high energy.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      { 
        title: 'Snack on roasted almonds', 
        description: 'Protein-rich food that sustains your energy without disturbing calm.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      { 
        title: 'Enjoy a quinoa salad', 
        description: 'Balanced nutrition to support your calm but energetic state.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      { 
        title: 'Take a long walk', 
        description: 'Use your energy while maintaining your calm state with sustained activity.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      { 
        title: 'Do bodyweight exercises', 
        description: 'Channel your energy into focused, controlled movement.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      { 
        title: 'Go cycling', 
        description: 'Rhythmic exercise that uses your energy while maintaining calm focus.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      { 
        title: 'Try forest bathing', 
        description: 'Immerse yourself in nature to channel your energy into peaceful awareness.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      { 
        title: 'Practice mindful cooking', 
        description: 'Use your energy for focused food preparation with full attention.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      { 
        title: 'Do breath-focused meditation', 
        description: 'A more intensive breath practice that matches your energy level.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      
      // Tired + Low Energy
      { 
        title: 'Have a bowl of soup', 
        description: 'Easy-to-digest nourishment when you\'re tired with low energy.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      { 
        title: 'Eat a banana', 
        description: 'Simple fruit that provides gentle energy with minimal effort.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      { 
        title: 'Sip herbal tea', 
        description: 'Soothing, hydrating beverage that requires little preparation.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      { 
        title: 'Take a slow-paced walk', 
        description: 'Gentle movement that might help with fatigue without overexertion.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      { 
        title: 'Try foam rolling', 
        description: 'Low-effort self-massage that may help with tiredness.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      { 
        title: 'Do deep breathing exercises', 
        description: 'Simple activity that requires minimal energy but may help refresh you.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      { 
        title: 'Practice 4-7-8 breathing', 
        description: 'A breathing technique that can help both calm and energize.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      { 
        title: 'Take a short nap', 
        description: 'Brief rest period (20 minutes) that might refresh your energy.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      { 
        title: 'Listen to ambient sounds', 
        description: 'Passive activity that might help you relax or reset when tired.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      
      // Tired + Medium Energy
      { 
        title: 'Eat Greek yogurt', 
        description: 'Protein-rich food to help sustain your moderate energy despite tiredness.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      { 
        title: 'Have peanut butter toast', 
        description: 'Balanced snack that might help maintain your available energy.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      { 
        title: 'Drink green tea', 
        description: 'Gentle caffeine boost that might help with tiredness.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      { 
        title: 'Do light cardio', 
        description: 'Movement that may help shake off tiredness without exhausting you.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      { 
        title: 'Try indoor cycling', 
        description: 'Seated exercise that uses your available energy effectively.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      { 
        title: 'Complete active chores', 
        description: 'Productive movement that makes use of your moderate energy.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      { 
        title: 'Try progressive muscle relaxation', 
        description: 'Tension and release exercise to address tiredness in the body.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      { 
        title: 'Practice tea meditation', 
        description: 'Focus on the experience of tea to shift attention from fatigue.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      { 
        title: 'Do mindful stretching', 
        description: 'Gentle stretching with full awareness to work with your tiredness.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      
      // Tired + High Energy
      { 
        title: 'Make a protein shake', 
        description: 'Quick nutrition to help focus your energy when feeling tired.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      { 
        title: 'Eat boiled eggs', 
        description: 'Protein-rich food that might help balance your tiredness.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      { 
        title: 'Have orange slices', 
        description: 'Refreshing fruit that provides vitamins and hydration.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      { 
        title: 'Try jump rope', 
        description: 'Channel your surprising energy into an activity that might help reset tiredness.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      { 
        title: 'Take a brisk walk', 
        description: 'Use your available energy for movement that might help with fatigue.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      { 
        title: 'Do resistance training', 
        description: 'Focus your energy into strength building that might help reset your system.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      { 
        title: 'Practice energizing affirmations', 
        description: 'Mental exercise to align your mindset with your available energy.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      { 
        title: 'Try breath of fire', 
        description: 'Energizing breath technique that might help address tiredness.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      { 
        title: 'Use music for focus', 
        description: 'Leverage your energy with rhythm to overcome mental tiredness.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      
      // Stressed + Low Energy
      { 
        title: 'Have warm milk', 
        description: 'Soothing beverage that may help reduce stress while requiring little energy.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      { 
        title: 'Eat oatmeal', 
        description: 'Comforting food that provides steady energy when stressed.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      { 
        title: 'Try berries', 
        description: 'Simple fruit with antioxidants that may help with stress response.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      { 
        title: 'Practice deep breathing', 
        description: 'Simple technique to reduce stress that works even with low energy.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      { 
        title: 'Get a foot massage', 
        description: 'Passive activity that might help reduce stress with minimal exertion.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      { 
        title: 'Use a foam roller', 
        description: 'Self-massage tool that can help release physical tension with low energy.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      { 
        title: 'Do a body scan meditation', 
        description: 'Mindfulness practice to release tension without requiring much energy.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      { 
        title: 'Practice gratitude journaling', 
        description: 'Shift focus to positive aspects to help reduce stress hormone production.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      { 
        title: 'Listen to calming sounds', 
        description: 'Passive activity that may help reduce stress response.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      
      // Stressed + Medium Energy
      { 
        title: 'Have a piece of dark chocolate', 
        description: 'A small treat that may help reduce stress hormones.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      { 
        title: 'Eat walnuts', 
        description: 'Nutrient-dense food that may support stress response.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      { 
        title: 'Drink a green smoothie', 
        description: 'Nutrient-rich beverage that may help with stress response.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      { 
        title: 'Take a mindful walk', 
        description: 'Movement combined with awareness to help process stress.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      { 
        title: 'Do light dancing', 
        description: 'Expressive movement that may help release stress with moderate energy.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      { 
        title: 'Try stretch and hold poses', 
        description: 'Focused physical activity that may help with stress response.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      { 
        title: 'Try guided meditation', 
        description: 'Let someone else lead you through stress reduction when you have some energy.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      { 
        title: 'Practice 4-7-8 breathing', 
        description: 'Structured breathing exercise that may help activate relaxation response.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      { 
        title: 'Journal about your stressors', 
        description: 'Processing stress through writing when you have energy to engage.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      
      // Stressed + High Energy
      { 
        title: 'Eat grilled salmon', 
        description: 'Omega-3s may help reduce stress while providing sustaining nutrition.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      { 
        title: 'Have a leafy green salad', 
        description: 'Nutritious food that may support stress response systems.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      { 
        title: 'Try brown rice bowl', 
        description: 'Complex carbs that may help with stress hormone management.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      { 
        title: 'Do a HIIT workout', 
        description: 'Channel stress and high energy into intense exercise for relief.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      { 
        title: 'Try boxing drills', 
        description: 'Use punching movements to release stress with available energy.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      { 
        title: 'Take a fast walk', 
        description: 'Use your high energy to move quickly and process stress.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      { 
        title: 'Practice cooldown meditation', 
        description: 'Guided winding down to help process stress when energy is high.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      { 
        title: 'Try body awareness practices', 
        description: 'Focused attention on physical sensations to process stress response.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      { 
        title: 'Do nature grounding', 
        description: 'Connect with natural environment to help regulate stress response.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      
      // Sad + Low Energy
      { 
        title: 'Have lentil soup', 
        description: 'Comforting, nourishing food that\'s easy to prepare when feeling down.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      { 
        title: 'Sip herbal tea', 
        description: 'Gentle, warming beverage that requires minimal preparation.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      { 
        title: 'Eat a banana', 
        description: 'Simple fruit with mood-supporting nutrients.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      { 
        title: 'Take a slow walk', 
        description: 'Gentle activity that may help with mood without requiring much energy.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      { 
        title: 'Do light chores', 
        description: 'Simple tasks that can provide a sense of accomplishment despite low mood.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      { 
        title: 'Try gentle movement', 
        description: 'Basic stretching or slow movement that requires minimal energy.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      { 
        title: 'Practice self-compassion meditation', 
        description: 'Kindness toward yourself during difficult emotions.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      { 
        title: 'Do an emotional check-in', 
        description: 'Gentle awareness of feelings without judgment.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      { 
        title: 'Practice deep breathing', 
        description: 'Simple technique that may help regulate mood with minimal effort.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      
      // Sad + Medium Energy
      { 
        title: 'Try baked tofu', 
        description: 'Protein-rich food that may help stabilize mood.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      { 
        title: 'Eat pumpkin seeds', 
        description: 'Nutrient-dense food with mood-supporting minerals.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      { 
        title: 'Have a piece of dark chocolate', 
        description: 'Small treat that may temporarily boost mood.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      { 
        title: 'Do a home workout', 
        description: 'Movement that can help release mood-boosting endorphins.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      { 
        title: 'Try dancing', 
        description: 'Expressive movement that may help shift emotional state.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      { 
        title: 'Walk with a friend', 
        description: 'Combining social connection with gentle movement.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      { 
        title: 'Write in a gratitude journal', 
        description: 'Shifting focus to positive aspects even during sadness.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      { 
        title: 'Create an uplifting playlist', 
        description: 'Curate music that might help shift your mood.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      { 
        title: 'Practice mindful breathing', 
        description: 'Focused breath work that may help regulate emotional state.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      
      // Sad + High Energy
      { 
        title: 'Eat sweet potatoes', 
        description: 'Complex carbs that may help support stable mood with high energy.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      { 
        title: 'Make a turkey sandwich', 
        description: 'Protein with tryptophan that may support mood regulation.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      { 
        title: 'Have a spinach salad', 
        description: 'Nutrient-dense food with minerals that support mood.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      { 
        title: 'Do cardio burst exercises', 
        description: 'Channel energy into short, intense movement that may improve mood.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      { 
        title: 'Try jump squats', 
        description: 'Use your available energy for movement that releases endorphins.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      { 
        title: 'Go for a park run', 
        description: 'Combining nature exposure with endorphin-releasing exercise.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      { 
        title: 'Practice emotional journaling', 
        description: 'Process feelings through writing when you have energy to engage with them.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      { 
        title: 'Try energizing breathwork', 
        description: 'Breath techniques that might help shift your emotional state.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      { 
        title: 'Do meditation with affirmations', 
        description: 'Combining focus with positive statements to support mood.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['high']
      }
    ];
    
    // Insert all the recommendations
    const { error: insertError } = await supabaseClient
      .from('recommendations')
      .insert(recommendations);
      
    if (insertError) {
      throw insertError;
    }
    
    console.log(`Successfully added ${recommendations.length} recommendations`);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Default recommendations added", 
        count: recommendations.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error adding default recommendations:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
