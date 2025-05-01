
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { message, userContext } = await req.json();
    
    console.log("Received message:", message);
    console.log("User context:", userContext);
    console.log("API key available:", !!GOOGLE_API_KEY);
    
    // Check if API key is available
    if (!GOOGLE_API_KEY) {
      throw new Error("Google API key is not configured");
    }
    
    // Construct the prompt with user context
    const prompt = `
      You are VibeFlow AI, a friendly wellness assistant. 
      You are helpful, empathetic, and focused on providing practical wellness advice.
      
      User context:
      ${JSON.stringify(userContext)}
      
      Please provide a thoughtful, personalized response addressing the user's message.
      Keep your response concise (under 150 words) and focused on wellness, mental health,
      or lifestyle improvements based on their current mood and context.
      
      Your response should be encouraging and provide actionable suggestions.
      
      User's message: ${message}
    `;
    
    // Check if the message is in Arabic and adjust the prompt
    const isArabic = /[\u0600-\u06FF]/.test(message);
    let finalPrompt = prompt;
    
    if (isArabic) {
      finalPrompt += "\n\nThe user's message appears to be in Arabic. Please respond in Arabic.";
      console.log("Arabic message detected, will request Arabic response");
    }
    
    // Updated to use Gemini API
    console.log("Calling Gemini API...");
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: finalPrompt
            }]
          }]
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log("Gemini API response received:", data);
    
    // Process Gemini API response
    let aiResponse;
    if (data?.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
      aiResponse = data.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected API response format:", data);
      aiResponse = "I'm sorry, I couldn't process your request at the moment. Please try again later.";
    }
    
    console.log("AI response:", aiResponse);
    
    // Generate alternative responses
    const alternativeResponses = [
      aiResponse.replace(/I recommend/i, "Based on your profile, I suggest"),
      aiResponse.replace(/I recommend/i, "You might consider"),
      aiResponse.replace(/try/i, "consider trying")
    ].filter(r => r !== aiResponse).slice(0, 2);
    
    // Return the response and alternatives
    const responseObj = {
      response: aiResponse,
      alternatives: alternativeResponses
    };
    
    return new Response(JSON.stringify(responseObj), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process your request",
        details: error.message,
        response: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
        alternatives: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
