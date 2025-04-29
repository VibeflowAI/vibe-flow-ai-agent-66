
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
      // Fetch predefined responses from Gemini JSON file
      try {
        // In production, we'd call the Gemini API here
        // For now, generate a response based on user context
        const { mood, energy, healthGoals, sleepHours, activityLevel, conditions, dietaryRestrictions } = userContext;
        
        let response = `Based on your mood (${mood || 'neutral'}) and energy level (${energy || 'medium'}), `;
        
        if (message.toLowerCase().includes('sleep') || conditions?.includes('insomnia')) {
          response += `I understand sleep is important to you. With your typical ${sleepHours || '7'} hours of sleep, I'd recommend creating a consistent bedtime routine and avoiding screens an hour before bed.`;
        } else if (message.toLowerCase().includes('food') || message.toLowerCase().includes('eat') || dietaryRestrictions?.includes('vegetarian')) {
          response += `considering your dietary preferences${dietaryRestrictions?.length ? ' (' + dietaryRestrictions.join(', ') + ')' : ''}, I'd suggest focusing on nutrient-dense foods that provide sustained energy throughout the day.`;
        } else if (message.toLowerCase().includes('exercise') || message.toLowerCase().includes('workout')) {
          response += `with your ${activityLevel || 'moderate'} activity level, mixing cardio and strength training could be beneficial. Start with 20-30 minute sessions 3-4 times a week.`;
        } else {
          response += `I'd recommend focusing on your health goals${healthGoals?.length ? ' (' + healthGoals.join(', ') + ')' : ''}. Would you like specific advice on nutrition, exercise, mental well-being, or sleep?`;
        }
        
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
        'Authorization': `Bearer ${googleADKApiKey}`
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
              Health goals: ${healthGoals.join(', ')}
              Health conditions: ${conditions.join(', ')}
              Dietary restrictions: ${dietaryRestrictions.join(', ')}
              
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
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
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
      JSON.stringify({ error: 'Failed to process request' }),
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
