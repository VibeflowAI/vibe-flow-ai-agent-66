
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
      },
      
      // Happy + Low energy recommendations
      {
        title: 'Yogurt with Honey',
        description: 'A gentle, sweet treat that maintains your good mood without overloading your system.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      {
        title: 'Herbal Tea Break',
        description: 'A calming cup of herbal tea to help you relax while maintaining your positive mood.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      {
        title: 'Gentle Stretching Session',
        description: 'Easy stretching that honors your low energy while maintaining your happy state.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      {
        title: 'Music Appreciation',
        description: 'Simply listen to your favorite uplifting songs while resting to maintain your positive mood.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      {
        title: 'Mindful Smiling Practice',
        description: 'A simple exercise where you consciously smile and notice how it affects your mood and body.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      
      // Happy + Medium energy recommendations
      {
        title: 'Nutrient-Rich Smoothie Bowl',
        description: 'A colorful smoothie bowl that maintains your positive mood and provides sustained energy.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      {
        title: 'Mixed Nuts Snack',
        description: 'A handful of mixed nuts for protein and healthy fats to maintain your energy and mood.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      {
        title: 'Brisk Walk Outside',
        description: 'A moderate-paced walk to make the most of your positive mood and medium energy.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      {
        title: 'Dance Workout',
        description: 'A fun dance session to express your positive mood through movement.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      {
        title: 'Gratitude List',
        description: 'Take a few minutes to write down what you're grateful for to amplify your positive mood.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      
      // Happy + High energy recommendations
      {
        title: 'Colorful Fruit Salad',
        description: 'A vibrant mix of fruits to complement your happy mood and high energy with natural sugars.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      {
        title: 'Hummus with Fresh Veggies',
        description: 'A balanced snack with protein and fiber to sustain your positive energy.',
        category: 'food',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      {
        title: 'Energetic Jog',
        description: 'A higher-intensity run to make excellent use of your happy mood and abundant energy.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      {
        title: 'Cycling Adventure',
        description: 'Explore your area by bike to channel your happy energy into an enjoyable activity.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      {
        title: 'Mindful Nature Walk',
        description: 'A walk in nature with complete presence - notice colors, textures, sounds, and smells.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      
      // Calm + Low energy recommendations
      {
        title: 'Warm Oatmeal with Cinnamon',
        description: 'A comforting bowl of oatmeal that complements your calm state without demanding energy.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      {
        title: 'Calming Chamomile Tea',
        description: 'A gentle, caffeine-free tea that supports your tranquil mood.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      {
        title: 'Light Stretching',
        description: 'Gentle movement that respects your low energy while maintaining your calm state.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      {
        title: 'Mindful Tea Drinking',
        description: 'Focus completely on the experience of drinking your tea - temperature, flavor, aroma.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      {
        title: 'Breath Focus Practice',
        description: 'A simple meditation focusing on your natural breath to deepen your calm state.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      
      // Calm + Medium energy recommendations
      {
        title: 'Avocado Toast',
        description: 'Nutritious, satisfying food with healthy fats to sustain your balanced energy.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      {
        title: 'Fresh Berries Bowl',
        description: 'Antioxidant-rich berries that provide gentle energy while maintaining your calm.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      {
        title: 'Casual Neighborhood Walk',
        description: 'A leisurely walk that complements your calm mood and medium energy level.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      {
        title: 'Organized Home Space',
        description: 'Channel your calm energy into creating an organized, peaceful environment.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      {
        title: '5 Senses Check-In',
        description: 'Take a moment to notice what you see, hear, smell, taste, and feel to ground yourself.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['medium']
      },
      
      // Calm + High energy recommendations
      {
        title: 'Green Tea',
        description: 'A beverage with a small amount of caffeine to complement your calm but energized state.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      {
        title: 'Quinoa Vegetable Salad',
        description: 'A nutrient-dense meal that provides sustained energy while maintaining balance.',
        category: 'food',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      {
        title: 'Extended Nature Walk',
        description: 'A longer walk in a park or natural area to channel your calm energy productively.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      {
        title: 'Bodyweight Exercise Circuit',
        description: 'Simple strength movements that use your higher energy while maintaining focus and calm.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      {
        title: 'Forest Bathing',
        description: 'Immerse yourself in nature with all your senses to deepen your calm, centered state.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      
      // Tired + Low energy recommendations
      {
        title: 'Warming Vegetable Soup',
        description: 'An easy-to-digest meal that provides nutrients without requiring much energy to consume.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      {
        title: 'Herbal Energy Tea',
        description: 'A caffeine-free tea like ginger or peppermint that can gently wake up your system.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      {
        title: 'Slow-Paced Walk',
        description: 'A very gentle walk that respects your fatigue while providing light movement.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      {
        title: 'Deep Breathing Session',
        description: 'Simple breath work that can help restore some energy without physical exertion.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      {
        title: 'Short Power Nap',
        description: 'A 15-20 minute nap that can help restore alertness when you're feeling tired.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['low']
      },
      
      // Tired + Medium energy recommendations
      {
        title: 'Greek Yogurt with Fruit',
        description: 'Protein-rich yogurt with natural fruit sugars to provide a sustainable energy boost.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      {
        title: 'Peanut Butter Toast',
        description: 'A balance of complex carbs and protein to help sustain your limited energy reserves.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      {
        title: 'Light Cardio Session',
        description: 'A short, gentle aerobic workout that can help increase energy without exhaustion.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      {
        title: 'Productive Home Tasks',
        description: 'Complete a few simple chores that require movement to help wake up your body.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      {
        title: 'Progressive Muscle Relaxation',
        description: 'Systematically tense and release muscle groups to reduce fatigue and increase awareness.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      
      // Tired + High energy recommendations
      {
        title: 'Protein-Rich Smoothie',
        description: 'A nutritious shake with protein powder to support your body when tired but needing to perform.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      {
        title: 'Hard-Boiled Eggs',
        description: 'Easily digestible protein to help sustain focus when tired but still active.',
        category: 'food',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      {
        title: 'Jump Rope Session',
        description: 'A quick, high-intensity activity that can help wake you up when needed.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      {
        title: 'Resistance Training',
        description: 'Light strength exercises to help focus and engage your body despite feeling tired.',
        category: 'activity',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      {
        title: 'Energizing Affirmations',
        description: 'Positive statements focused on energy and vitality to shift your mindset.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      
      // Stressed + Low energy recommendations
      {
        title: 'Warm Milk with Honey',
        description: 'A soothing drink that can help calm your nervous system when stressed and low on energy.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      {
        title: 'Blueberries and Yogurt',
        description: 'Antioxidant-rich berries with protein to support your body during stress.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      {
        title: 'Deep Breathing Exercises',
        description: 'Simple breathing techniques that activate your parasympathetic nervous system.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      {
        title: 'Self-Administered Foot Massage',
        description: 'Gentle pressure on your feet that can help release tension with minimal energy.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      {
        title: 'Body Scan Practice',
        description: 'A guided meditation where you progressively relax each part of your body.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      
      // Stressed + Medium energy recommendations
      {
        title: 'Dark Chocolate Square',
        description: 'A small amount of dark chocolate that can help reduce stress hormones.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      {
        title: 'Green Smoothie',
        description: 'Nutrient-dense vegetables and fruits that support your body's stress response.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      {
        title: 'Mindful Walking',
        description: 'A walk where you focus completely on each step, helping to break the stress cycle.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      {
        title: 'Light Dancing',
        description: 'Free movement to music that can help release physical tension from stress.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      {
        title: 'Stress Journaling',
        description: 'Writing down your stressors and potential solutions to gain perspective.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      
      // Stressed + High energy recommendations
      {
        title: 'Leafy Green Salad',
        description: 'Nutrient-dense greens that support your body while processing stress.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      {
        title: 'Brown Rice Bowl',
        description: 'Complex carbohydrates that help stabilize mood when stressed.',
        category: 'food',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      {
        title: 'Boxing or Punching Exercises',
        description: 'Physical activity that channels stress-induced energy into controlled movement.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      {
        title: 'Fast-Paced Walk',
        description: 'A brisk walking pace to help process stress hormones through movement.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      {
        title: 'Nature Grounding Practice',
        description: 'Connect with natural elements to shift focus away from stressors.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      
      // Sad + Low energy recommendations
      {
        title: 'Warming Herbal Tea',
        description: 'A comforting beverage that can provide gentle comfort when feeling down.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      {
        title: 'Whole Grain Toast',
        description: 'Simple complex carbohydrates that can help stabilize mood.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      {
        title: 'Very Gentle Movement',
        description: 'Simple stretches or tai chi that honor your low energy while still providing movement.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      {
        title: 'Light Household Tasks',
        description: 'Simple, achievable chores that can provide a sense of accomplishment.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      {
        title: 'Self-Compassion Practice',
        description: 'Gentle words and actions toward yourself acknowledging your difficult emotions.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      
      // Sad + Medium energy recommendations
      {
        title: 'Baked Tofu with Vegetables',
        description: 'A balanced meal with protein and nutrients to support emotional regulation.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      {
        title: 'Trail Mix with Dark Chocolate',
        description: 'Nuts, seeds, and a bit of dark chocolate to boost mood and provide energy.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      {
        title: 'Home Workout Video',
        description: 'Following along with a workout video to get beneficial movement.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      {
        title: 'Social Walk with a Friend',
        description: 'Combining gentle exercise with social connection to help lift your mood.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      {
        title: 'Uplifting Playlist',
        description: 'Listening to music that brings back positive memories or emotions.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      
      // Sad + High energy recommendations
      {
        title: 'Colorful Vegetable Stir Fry',
        description: 'A nutritious meal with a variety of vegetables to support your mood.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      {
        title: 'Lean Protein Sandwich',
        description: 'A balanced meal with protein to help stabilize mood and provide energy.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      {
        title: 'Cardio Exercise',
        description: 'A higher-intensity workout that can help release endorphins to improve mood.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      {
        title: 'Park Run or Jog',
        description: 'Combining nature exposure with physical activity for mood benefits.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      {
        title: 'Emotional Release Journaling',
        description: 'Writing out difficult emotions with the intent to process and release them.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['high']
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
