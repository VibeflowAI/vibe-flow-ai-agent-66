
import { serve } from 'https://deno.fresh.dev/std@1.0.0/http/server.ts';

interface RequestBody {
  message: string;
  currentMood?: string;
  moodEmoji?: string;
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
    const { message, currentMood, moodEmoji } = await req.json() as RequestBody;

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
      throw new Error('Google ADK API key not configured');
    }

    // Prepare context for the agent
    const context = {
      userMessage: message,
      mood: currentMood || 'neutral',
      moodEmoji: moodEmoji || '😐'
    };

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
              User's message: ${context.userMessage}
              Current mood: ${context.mood}
              Mood emoji: ${context.moodEmoji}
              
              Provide a short, empathetic response with a specific recommendation for either:
              - A meal suggestion
              - An exercise activity
              - A mental wellness activity
              
              Keep the response under 100 words and make it conversational.
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
