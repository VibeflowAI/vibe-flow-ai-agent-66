
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
