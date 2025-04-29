
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
    const { message, currentMood, moodEmoji, userContext = {} } = await req.json() as RequestBody;

    // Validate input
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Google ADK client
    const googleADKApiKey = Deno.env.get('GOOGLE_ADK_API_KEY');
    if (!googleADKApiKey) {
      console.log('Google ADK API key not configured, using fallback responses');
      
      // Fallback to local responses if API key not available
      try {
        // Fetch predefined responses from Gemini JSON
        const resp = await fetch(new URL('../../gemini.json', import.meta.url).href);
        const { responses } = await resp.json();
        
        if (!responses || responses.length === 0) {
          throw new Error('No fallback responses available');
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
        
        // Find appropriate response based on context and message
        let responseType = 'default';
        const messageLower = message.toLowerCase();
        
        if (messageLower.includes('tired') || messageLower.includes('exhausted')) {
          responseType = 'tired';
        } else if (messageLower.includes('stress') || messageLower.includes('anxiety')) {
          responseType = 'stressed';
        } else if (messageLower.includes('sad') || messageLower.includes('unhappy')) {
          responseType = 'sad';
        } else if (messageLower.includes('happy') || messageLower.includes('good')) {
          responseType = 'happy';
        } else if (messageLower.includes('calm') || messageLower.includes('relaxed')) {
          responseType = 'calm';
        } else if (messageLower.includes('sleep')) {
          responseType = 'sleep';
        } else if (energy === 'low') {
          responseType = 'low_energy';
        } else if (energy === 'high') {
          responseType = 'high_energy';
        }
        
        if (dietaryRestrictions?.includes('vegetarian') && 
            (messageLower.includes('food') || messageLower.includes('eat') || messageLower.includes('meal'))) {
          responseType = 'vegetarian';
        }
        
        if (conditions?.includes('diabetes') || conditions?.includes('blood sugar')) {
          responseType = 'conditions_diabetes';
        }
        
        if (conditions?.includes('insomnia') && messageLower.includes('sleep')) {
          responseType = 'conditions_insomnia';
        }
        
        // Find the matching response or use default
        let response = responses.find(r => r.type === responseType)?.response;
        if (!response) {
          response = responses.find(r => r.type === 'default')?.response;
        }
        
        // Personalize the response by replacing placeholders
        response = response
          .replace(/\${sleepHours}/g, sleepHours || '7')
          .replace(/\${activityLevel}/g, activityLevel || 'moderate')
          .replace(/\${healthGoals}/g, healthGoals?.join(', ') || 'improve wellness');
        
        return new Response(
          JSON.stringify({ response }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      } catch (error) {
        console.error('Error in fallback response:', error);
        throw new Error('Failed to generate a fallback response');
      }
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

    // Make request to Google ADK API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': googleADKApiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `
              As a wellness recommendation agent, consider the following context:
              User's message: ${message}
              Current mood: ${mood}
              Mood emoji: ${moodEmoji || '😐'}
              Energy level: ${energy}
              Sleep hours: ${sleepHours}
              Activity level: ${activityLevel}
              Health goals: ${healthGoals.join(', ') || 'general wellness'}
              Health conditions: ${conditions.join(', ') || 'none reported'}
              Dietary restrictions: ${dietaryRestrictions.join(', ') || 'none reported'}
              
              Based on this comprehensive user profile, provide a personalized response with specific wellness recommendations.
              Make it empathetic, actionable, and tailored to their unique situation.
              Vary your response style to avoid sounding repetitive. If they're asking about specific health concerns, acknowledge their conditions.
              Include a specific recommendation for either food, exercise, or mental wellness based on their current mood and health goals.
              
              Keep it conversational and natural. Don't sound like you're following a template.
            `
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google ADK API error: ${response.status}`);
    }

    const data = await response.json();
    const agentResponse = data.candidates[0].content.parts[0].text;

    // Return the response
    return new Response(
      JSON.stringify({ response: agentResponse }),
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
