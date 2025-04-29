
import { serve } from 'https://deno.fresh.dev/std@1.0.0/http/server.ts';
import { OpenAI } from 'https://esm.sh/openai@4.32.0';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.2.0';

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

    let aiResponse;

    // Process with the selected AI provider
    if (aiProvider === 'gemini') {
      try {
        const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const prompt = `
          You are VibeFlow AI, a friendly wellness assistant. 
          You are helpful, empathetic, and focused on providing practical wellness advice.
          
          User context:
          ${userProfile}
          
          Please provide a thoughtful, personalized response addressing the user's message.
          Keep your response concise (under 150 words) and focused on wellness, mental health,
          or lifestyle improvements based on their current mood and context.
          
          Your response should be encouraging and provide actionable suggestions.
        `;
        
        console.log("Sending request to Gemini API");
        const result = await model.generateContent(prompt);
        console.log("Received response from Gemini API");
        const text = result.response.text();
        aiResponse = text;
      } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('Failed to get response from Gemini: ' + error.message);
      }
    } else {
      // Use OpenAI as fallback
      try {
        const openai = new OpenAI({
          apiKey: Deno.env.get('OPENAI_API_KEY') || '',
        });
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are VibeFlow AI, a friendly wellness assistant. You are helpful, empathetic, 
                        and focused on providing practical wellness advice. Keep responses concise 
                        (under 150 words) and focused on wellness, mental health, or lifestyle improvements.`
            },
            {
              role: 'user',
              content: `Based on this user context, provide a thoughtful, personalized response:
                      ${userProfile}`
            }
          ],
          temperature: 0.7,
          max_tokens: 300,
        });
        
        aiResponse = completion.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw new Error('Failed to get response from OpenAI: ' + error.message);
      }
    }

    // Return the response
    return new Response(
      JSON.stringify({ response: aiResponse || "I'm sorry, I couldn't process your request right now. Please try again later." }),
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
