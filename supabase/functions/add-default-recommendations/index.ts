
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gets the service_role key from environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('Adding default recommendations');
    
    // Default recommendations - already formatted for database insertion
    const defaultRecommendations = [
      // Original recommendations
      {
        title: 'Take a 10-minute walk',
        description: 'Even a short walk can boost your mood and energy levels.',
        category: 'activity',
        mood_types: ['tired', 'stressed', 'sad'],
        energy_levels: ['low', 'medium']
      },
      {
        title: 'Drink a glass of water',
        description: 'Staying hydrated is essential for maintaining energy levels.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['low', 'medium', 'high']
      },
      {
        title: 'Practice deep breathing',
        description: 'Take 5 deep breaths, inhaling for 4 counts and exhaling for 6.',
        category: 'mindfulness',
        mood_types: ['stressed', 'sad'],
        energy_levels: ['low', 'medium', 'high']
      },
      {
        title: 'Have a fruit snack',
        description: 'Natural sugars in fruits provide a gentle energy boost.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['low', 'medium']
      },
      {
        title: 'Quick meditation session',
        description: 'A 5-minute meditation can help reset your stress levels.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['medium', 'high']
      },
      
      // New Food recommendations
      {
        title: 'Chamomile Tea',
        description: 'A calming beverage that can help reduce stress and promote relaxation.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['low', 'medium', 'high']
      },
      {
        title: 'Avocado Toast',
        description: 'Rich in healthy fats that can help reduce stress and anxiety levels.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['medium', 'high']
      },
      {
        title: 'Grilled Salmon',
        description: 'Omega-3 fatty acids in salmon can help improve mood and reduce symptoms of depression.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['medium', 'high']
      },
      {
        title: 'Banana Smoothie',
        description: 'Bananas contain tryptophan which helps produce serotonin, improving mood and reducing sadness.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['low', 'medium', 'high']
      },
      {
        title: 'Oatmeal with Honey',
        description: 'Complex carbohydrates that help stabilize blood sugar and improve irritability.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['low', 'medium']
      },
      {
        title: 'Pumpkin Seeds Snack',
        description: 'Rich in magnesium which can help regulate emotions and reduce irritability.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['medium', 'high']
      },
      {
        title: 'Greek Yogurt Parfait',
        description: 'Protein-rich food that can help improve cognitive function and reduce brain fog.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['medium', 'high']
      },
      {
        title: 'Blueberry Snack',
        description: 'Antioxidant-rich berries that can improve brain function and memory.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['low', 'medium', 'high']
      },
      {
        title: 'Scrambled Eggs',
        description: 'Rich in choline which can help improve focus and cognitive function.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['medium', 'high']
      },
      {
        title: 'Turmeric Golden Milk',
        description: 'Anti-inflammatory drink that can help improve brain function and focus.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['low', 'medium']
      },
      {
        title: 'Lentil Soup',
        description: 'Comforting and nutritious meal that provides steady energy and protein.',
        category: 'food',
        mood_types: ['sad', 'tired'],
        energy_levels: ['low', 'medium']
      },
      {
        title: 'Baked Sweet Potato',
        description: 'Comforting and nutritious food rich in vitamins and complex carbohydrates.',
        category: 'food',
        mood_types: ['sad', 'tired'],
        energy_levels: ['medium', 'high']
      },
      {
        title: 'Cucumber-Mint Water',
        description: 'Refreshing drink that improves hydration and provides a mild energy boost.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['low', 'medium', 'high']
      },
      {
        title: 'Fresh Watermelon',
        description: 'Hydrating fruit that can help boost energy levels and improve mood.',
        category: 'food',
        mood_types: ['tired', 'stressed'],
        energy_levels: ['low', 'medium', 'high']
      },
      
      // New Exercise recommendations
      {
        title: 'Stretching Flow',
        description: 'A gentle 10-20 minute stretching routine to help reduce anxiety and tension.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['low', 'medium', 'high']
      },
      {
        title: 'Outdoor Nature Walk',
        description: 'A 20-30 minute walk outdoors to improve mood and reduce feelings of sadness.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['low', 'medium']
      },
      {
        title: 'HIIT Workout',
        description: 'A 15-minute high-intensity interval training session to help release tension and anger.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['medium', 'high']
      },
      {
        title: 'Dance Break',
        description: 'A 20-minute dance session to boost energy and improve mood when feeling fatigued.',
        category: 'activity',
        mood_types: ['tired', 'sad'],
        energy_levels: ['low', 'medium']
      },
      {
        title: 'Morning Jog',
        description: 'A 25-minute light jog to clear brain fog and improve mental clarity.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['medium', 'high']
      },
      {
        title: 'Foam Rolling and Breathwork',
        description: 'A 15-minute session of foam rolling combined with deep breathing to release physical tension.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['low', 'medium']
      },
      
      // New Mindfulness recommendations
      {
        title: '4-7-8 Breathing Exercise',
        description: 'A 5-minute breathing technique to calm overthinking: inhale for 4, hold for 7, exhale for 8 counts.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['low', 'medium', 'high']
      },
      {
        title: 'Body Scan Meditation',
        description: 'A 10-minute progressive relaxation technique to prepare for sleep or reduce tension.',
        category: 'mindfulness',
        mood_types: ['stressed', 'tired'],
        energy_levels: ['low', 'medium']
      },
      {
        title: 'Gratitude Journaling',
        description: 'Spend 5-10 minutes writing down things you're grateful for to improve your mood.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['low', 'medium', 'high']
      },
      {
        title: 'Nature Sounds Meditation',
        description: 'Listen to 10 minutes of nature sounds to improve focus and concentration.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['low', 'medium', 'high']
      },
      {
        title: 'Guided Anxiety Meditation',
        description: 'Follow a 5-15 minute guided meditation specifically designed to reduce anxiety.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['low', 'medium', 'high']
      },
      {
        title: '1-Minute Morning Centering',
        description: 'Start your day with a quick 1-minute mindfulness practice to set a positive tone.',
        category: 'mindfulness',
        mood_types: ['stressed', 'tired', 'sad'],
        energy_levels: ['low', 'medium', 'high']
      }
    ];
    
    // Using service role key to bypass RLS
    const { data, error } = await supabase
      .from('recommendations')
      .insert(defaultRecommendations)
      .select();
      
    if (error) {
      console.error('Error adding default recommendations:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      count: data ? data.length : 0,
      message: 'Default recommendations added successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (err) {
    console.error('Error in add-default-recommendations function:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

