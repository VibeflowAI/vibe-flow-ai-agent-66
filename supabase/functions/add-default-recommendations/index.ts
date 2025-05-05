
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
        title: 'Write a gratitude list', 
        description: 'Enhance your happy mood by noting what you\'re thankful for.',
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
        title: 'Practice mindful tea drinking', 
        description: 'Focus fully on the experience of preparing and drinking tea.',
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
        title: 'Try a 5 senses check-in', 
        description: 'Notice what you can see, hear, smell, taste and feel right now.',
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
        title: 'Take a long walk', 
        description: 'Use your energy while maintaining your calm state with sustained activity.',
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
      
      // Tired + Low Energy
      { 
        title: 'Have a bowl of soup', 
        description: 'Easy-to-digest nourishment when you\'re tired with low energy.',
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
        title: 'Practice 4-7-8 breathing', 
        description: 'A breathing technique that can help both calm and energize.',
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
        title: 'Do light cardio', 
        description: 'Movement that may help shake off tiredness without exhausting you.',
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
      
      // Tired + High Energy
      { 
        title: 'Make a protein shake', 
        description: 'Quick nutrition to help focus your energy when feeling tired.',
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
        title: 'Practice energizing affirmations', 
        description: 'Mental exercise to align your mindset with your available energy.',
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
        title: 'Practice deep breathing', 
        description: 'Simple technique to reduce stress that works even with low energy.',
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
      
      // Stressed + Medium Energy
      { 
        title: 'Have a piece of dark chocolate', 
        description: 'A small treat that may help reduce stress hormones.',
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
        title: 'Try guided meditation', 
        description: 'Let someone else lead you through stress reduction when you have some energy.',
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
        title: 'Do a HIIT workout', 
        description: 'Channel stress and high energy into intense exercise for relief.',
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
      
      // Sad + Low Energy
      { 
        title: 'Have lentil soup', 
        description: 'Comforting, nourishing food that\'s easy to prepare when feeling down.',
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
        title: 'Practice self-compassion meditation', 
        description: 'Kindness toward yourself during difficult emotions.',
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
        title: 'Do a home workout', 
        description: 'Movement that can help release mood-boosting endorphins.',
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
      
      // Sad + High Energy
      { 
        title: 'Eat sweet potatoes', 
        description: 'Complex carbs that may help support stable mood with high energy.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      { 
        title: 'Do cardio bursts', 
        description: 'Channel energy into short, intense movement that may improve mood.',
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
