
import { serve } from 'https://deno.fresh.dev/std@1.0.0/http/server.ts';

interface UserContext {
  mood?: string;
  energy?: string;
  healthGoals?: string[];
  sleepHours?: string;
  activityLevel?: string;
  conditions?: string[];
  dietaryRestrictions?: string[];
}

interface RequestBody {
  message: string;
  currentMood?: string;
  moodEmoji?: string;
  userContext?: UserContext;
  aiProvider?: 'gemini' | 'openai';
}

serve(async (req) => {
  try {
    // Enable CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      });
    }

    // Parse request body
    const { message, currentMood, moodEmoji, userContext = {}, aiProvider = 'gemini' } = await req.json() as RequestBody;

    // Validate input
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract user context for personalization
    const {
      mood = currentMood || 'neutral',
      energy = 'medium',
      healthGoals = [],
      sleepHours = '7',
      activityLevel = 'moderate',
      conditions = [],
      dietaryRestrictions = []
    } = userContext;

    // Create user profile text
    const userProfile = `
      User's message: ${message}
      Current mood: ${mood}
      Mood emoji: ${moodEmoji || '😐'}
      Energy level: ${energy}
      Sleep hours: ${sleepHours}
      Activity level: ${activityLevel}
      Health goals: ${healthGoals.join(', ') || 'general wellness'}
      Health conditions: ${conditions.join(', ') || 'none reported'}
      Dietary restrictions: ${dietaryRestrictions.join(', ') || 'none reported'}
    `;

    // For now, just return a placeholder response to test if the function works
    // This helps us avoid the Deno.makeTempFile error from the previous implementation
    const sampleResponse = `Hi there! I see you're feeling ${mood}. Based on your message "${message}", I'd suggest focusing on your wellness today. Remember to stay hydrated, take short breaks, and maybe try a quick stretching session to boost your energy.`;

    // Return the response
    return new Response(
      JSON.stringify({ response: sampleResponse }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request', details: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});
