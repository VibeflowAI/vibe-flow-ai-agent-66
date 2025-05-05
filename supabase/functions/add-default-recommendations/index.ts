
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
      
      // New Happy + Low energy recommendations
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
        title: 'Banana Snack',
        description: 'A simple, easy-to-digest fruit that provides gentle energy while maintaining mood.',
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
        title: 'Foam Rolling',
        description: 'A gentle self-massage technique that helps relax muscles without requiring much energy.',
        category: 'activity',
        mood_types: ['happy'],
        energy_levels: ['low']
      },
      {
        title: 'Slow-Paced Walk',
        description: 'A leisurely stroll that keeps you moving without depleting your limited energy.',
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
      {
        title: 'Short Reflection',
        description: 'A brief moment to appreciate your positive state and the good things in your life.',
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
        title: 'Dark Chocolate Square',
        description: 'A small piece of quality dark chocolate to enhance your already positive mood.',
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
        title: 'Light Cardio Session',
        description: 'A moderate exercise session that uses your energy while maintaining your good mood.',
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
      {
        title: 'Moment of Reflection',
        description: 'A short period of mindful awareness to appreciate your current positive state.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['medium']
      },
      {
        title: 'Mindful Breathing',
        description: 'Focus on your breath to enhance your present awareness while feeling good.',
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
        title: 'Grilled Chicken Wrap',
        description: 'A protein-rich meal to fuel your high energy while maintaining your good mood.',
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
        title: 'HIIT Workout',
        description: 'A high-intensity interval training session to make the most of your energy and mood.',
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
      {
        title: 'Music Engagement',
        description: 'Actively listen to or play music that matches and enhances your positive energy.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      {
        title: 'Laughter Meditation',
        description: 'A practice of intentional laughter that amplifies your already positive mood.',
        category: 'mindfulness',
        mood_types: ['happy'],
        energy_levels: ['high']
      },
      
      // New Calm + Low energy recommendations
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
        title: 'Apple Slices',
        description: 'A simple, wholesome snack that provides gentle nutrition without disruption.',
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
        title: 'Soft Walk',
        description: 'A very gentle, mindful walk that maintains your peaceful mood.',
        category: 'activity',
        mood_types: ['calm'],
        energy_levels: ['low']
      },
      {
        title: 'Gentle Foam Rolling',
        description: 'Soft self-massage that enhances your relaxed physical state.',
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
      {
        title: 'Gentle Journaling',
        description: 'Writing down thoughts and feelings in a relaxed, non-judgmental way.',
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
        title: 'Whole Grain Crackers',
        description: 'A simple snack that provides steady energy without disrupting your calm state.',
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
        title: 'Stretching Flow',
        description: 'A sequence of gentle stretches that use your energy while maintaining calm.',
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
        title: 'Focused Breathing',
        description: 'Intentional breathing patterns to maintain and deepen your calm state.',
        category: 'mindfulness',
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
      {
        title: 'Calm Music Listening',
        description: 'Engage with music that complements and enhances your peaceful state.',
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
        title: 'Roasted Almonds',
        description: 'A protein-rich snack that provides sustained energy without disrupting calm.',
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
        title: 'Calm Cycling Session',
        description: 'A bike ride at a comfortable pace that uses energy while maintaining tranquility.',
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
      {
        title: 'Mindful Cooking',
        description: 'Prepare a meal with complete presence and attention to the process.',
        category: 'mindfulness',
        mood_types: ['calm'],
        energy_levels: ['high']
      },
      {
        title: 'Breath-Focused Meditation',
        description: 'A longer meditation practice centered on breath awareness to maintain calm with high energy.',
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
        title: 'Banana',
        description: 'A simple fruit with natural sugars for a gentle energy boost when very tired.',
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
        title: 'Gentle Foam Rolling',
        description: 'A soft self-massage technique that helps increase blood flow without much exertion.',
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
        title: '4-7-8 Breathing Technique',
        description: 'A specific breathing pattern that can help reset your energy system when depleted.',
        category: 'mindfulness',
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
      {
        title: 'Ambient Sound Focus',
        description: 'Listen to gentle background sounds like rainfall or waves to rest your mind.',
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
        title: 'Green Tea',
        description: 'A beverage with moderate caffeine that can provide a gentle energy boost.',
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
        title: 'Indoor Cycling',
        description: 'A stationary bike session at a comfortable pace to raise energy without overtaxing your system.',
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
      {
        title: 'Tea Meditation',
        description: 'Focus completely on preparing and drinking tea to bring mindful awareness.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['medium']
      },
      {
        title: 'Mindful Stretching',
        description: 'Gentle stretches with complete awareness of bodily sensations to increase energy flow.',
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
        title: 'Orange Slices',
        description: 'Quick natural sugars and vitamin C to help maintain energy when fatigued.',
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
        title: 'Brisk Walking',
        description: 'A faster-paced walk that gets blood flowing to help combat tiredness.',
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
      {
        title: 'Breath Reset',
        description: 'A short, intense breathing pattern designed to quickly increase energy and alertness.',
        category: 'mindfulness',
        mood_types: ['tired'],
        energy_levels: ['high']
      },
      {
        title: 'Music Focus',
        description: 'Listen to upbeat, energizing music to help overcome fatigue and maintain focus.',
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
        title: 'Oatmeal',
        description: 'A gentle complex carbohydrate that can help regulate stress hormones.',
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
        title: 'Gentle Foam Rolling',
        description: 'Soft pressure on tense muscles to help release physical stress with little energy required.',
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
      {
        title: 'Gratitude Journaling',
        description: 'Writing down things you're thankful for to shift focus away from stressors.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['low']
      },
      {
        title: 'Calming Sounds',
        description: 'Listen to nature sounds or white noise to help calm an overactive stress response.',
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
        title: 'Walnuts',
        description: 'Omega-3 rich nuts that may help manage stress and support brain health.',
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
        title: 'Stretching with Holds',
        description: 'Gentle stretches where you hold positions to release deeper tension.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      {
        title: 'Guided Meditation',
        description: 'A led meditation practice specifically designed to reduce anxiety and stress.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['medium']
      },
      {
        title: '4-7-8 Breathing',
        description: 'A specific breathing pattern that helps activate the relaxation response.',
        category: 'mindfulness',
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
        title: 'Grilled Salmon',
        description: 'Omega-3 rich fish that provides protein and supports brain health during stress.',
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
        title: 'HIIT Workout',
        description: 'High-intensity interval training that helps release intense stress energy.',
        category: 'activity',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      {
        title: 'Cooldown Meditation',
        description: 'A calming practice specifically designed to follow intense physical activity.',
        category: 'mindfulness',
        mood_types: ['stressed'],
        energy_levels: ['high']
      },
      {
        title: 'Body Awareness Practice',
        description: 'A focused attention on physical sensations to reconnect mind and body.',
        category: 'mindfulness',
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
        title: 'Warming Lentil Soup',
        description: 'A comforting, nutritious meal that's easy to prepare when feeling down.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      {
        title: 'Herbal Tea',
        description: 'A comforting beverage that can provide gentle comfort when feeling down.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      {
        title: 'Banana',
        description: 'A simple fruit containing tryptophan which can help with mood regulation.',
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
        title: 'Slow Walk',
        description: 'A very gentle, short walk to get minimal movement without overwhelming yourself.',
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
      {
        title: 'Emotional Check-in',
        description: 'A brief moment to acknowledge your feelings without judgment.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['low']
      },
      {
        title: 'Deep Breathing',
        description: 'Simple breath awareness that can help regulate emotions when feeling down.',
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
        title: 'Pumpkin Seeds',
        description: 'Rich in magnesium and zinc which can help support mood regulation.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      {
        title: 'Dark Chocolate',
        description: 'A small amount of quality dark chocolate that may help improve mood.',
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
        title: 'Dancing',
        description: 'Moving to music that can help shift emotional states through physical expression.',
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
        title: 'Gratitude Journaling',
        description: 'Writing down things you appreciate to help counterbalance sad feelings.',
        category: 'mindfulness',
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
      {
        title: 'Mindful Breathing',
        description: 'Focusing on your breath to help regulate emotions and create space.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['medium']
      },
      
      // Sad + High energy recommendations
      {
        title: 'Sweet Potatoes',
        description: 'Complex carbohydrates that can help regulate blood sugar and stabilize mood.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      {
        title: 'Turkey Sandwich',
        description: 'Lean protein containing tryptophan which can help with serotonin production.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      {
        title: 'Spinach Salad',
        description: 'Leafy greens rich in folate which may help alleviate depressed mood.',
        category: 'food',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      {
        title: 'Cardio Burst',
        description: 'A short, intense exercise session to help release endorphins.',
        category: 'activity',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      {
        title: 'Jump Squats',
        description: 'A high-energy movement that can help channel emotional energy physically.',
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
      },
      {
        title: 'Breathwork',
        description: 'Structured breathing exercises designed to help shift emotional states.',
        category: 'mindfulness',
        mood_types: ['sad'],
        energy_levels: ['high']
      },
      {
        title: 'Meditation with Affirmations',
        description: 'A practice incorporating positive statements to help reframe negative thoughts.',
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
