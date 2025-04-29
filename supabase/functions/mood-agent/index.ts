
// Replace the incorrect import with the correct Deno standard library URL
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
  healthSurveyData?: any;  // Added health survey data
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
    const { 
      message, 
      currentMood, 
      moodEmoji, 
      userContext = {}, 
      aiProvider = 'gemini',
      healthSurveyData = {}
    } = await req.json() as RequestBody;

    // Validate input
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }), 
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    console.log("Processing request with data:", { message, currentMood, aiProvider, healthSurveyData });

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

    // Process health survey data
    const healthSurveyInfo = healthSurveyData ? `
      Health goals: ${healthSurveyData.healthGoals?.join(', ') || 'not specified'}
      Sleep hours: ${healthSurveyData.sleepHours || 'not specified'}
      Activity level: ${healthSurveyData.activityLevel || 'not specified'}
      Health conditions: ${healthSurveyData.conditions?.join(', ') || 'none'}
      Dietary restrictions: ${healthSurveyData.dietaryRestrictions?.join(', ') || 'none'}
    ` : '';

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
      ${healthSurveyInfo}
    `;

    console.log("Processing request with profile:", userProfile);

    // Choose AI provider based on request
    if (aiProvider === 'openai') {
      return await handleOpenAIRequest(message, userProfile);
    } else {
      return await handleGeminiRequest(message, userProfile);
    }
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

// Handle request using Google Gemini API
async function handleGeminiRequest(message: string, userProfile: string) {
  const googleADKApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!googleADKApiKey) {
    console.log('Google ADK API key not configured');
    throw new Error('Missing Google Gemini API key');
  }

  // Make request to Google Gemini API
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
            ${userProfile}
            
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
    throw new Error(`Google Gemini API error: ${response.status}`);
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
}

// Handle request using OpenAI API
async function handleOpenAIRequest(message: string, userProfile: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.log('OpenAI API key not configured');
    throw new Error('Missing OpenAI API key');
  }

  // Make request to OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAIApiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            You are a wellness recommendation agent. Provide personalized responses 
            with specific wellness recommendations based on the user's profile.
            Be empathetic, actionable, and tailor your responses to their unique situation.
            Vary your response style and always include a specific recommendation for food,
            exercise, or mental wellness based on their current mood and health goals.
            Keep it conversational and natural.
          `
        },
        {
          role: "user",
          content: `
            Here's the user's profile:
            ${userProfile}

            Please provide a personalized response based on this information.
          `
        }
      ],
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const agentResponse = data.choices[0].message.content;

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
}
