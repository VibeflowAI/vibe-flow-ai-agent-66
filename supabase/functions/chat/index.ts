
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

// Use a more reliable token - this is just a placeholder, real token is same
const HUGGING_FACE_TOKEN = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN") || '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';

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
    console.log("Hugging Face token available:", !!HUGGING_FACE_TOKEN);
    
    // Check if message is provided
    if (!message || message.trim() === '') {
      throw new Error("Message is required");
    }
    
    // If API credits are exceeded, return a fallback response
    try {
      console.log("Using Hugging Face API...");
      const result = await useHuggingFaceAPI(message, userContext);
      
      console.log("AI response (huggingface):", result.response.substring(0, 50) + "...");
      
      // Return the response
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in chat function:", error);
      
      // Create a fallback response when API fails
      const fallbackResponse = {
        response: "I'm sorry, the AI service is currently unavailable due to usage limits. Try asking a simpler question or try again later.",
        alternatives: [
          "How are you feeling today?",
          "Would you like some basic wellness tips instead?"
        ],
        provider: 'fallback'
      };
      
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 // Send 200 instead of 500 to keep the chat working
      });
    }
  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(
      JSON.stringify({
        response: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
        alternatives: [],
        provider: 'fallback'
      }),
      { 
        status: 200, // Send 200 instead of 500 to keep the chat working
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

// Function to interact with Hugging Face API
async function useHuggingFaceAPI(message: string, userContext: any) {
  try {
    console.log("Creating HfInference with token:", HUGGING_FACE_TOKEN.substring(0, 5) + "...");
    const hf = new HfInference(HUGGING_FACE_TOKEN);
    
    // Construct the prompt with user context
    const prompt = `
      You are VibeFlow AI, a friendly wellness assistant. You are helpful, empathetic, and focused on providing practical wellness advice.
      User context: ${JSON.stringify(userContext)}
      User's mood: ${userContext?.mood || "unknown"}
      User's energy level: ${userContext?.energy || "medium"}
      
      Please provide a thoughtful, personalized wellness response addressing this message: ${message}
      
      Keep your response concise (under 150 words) and focused on wellness, mental health, or lifestyle improvements.
      Your response should be encouraging and provide actionable suggestions.
    `;
    
    console.log("Sending request to Hugging Face with prompt length:", prompt.length);
    
    // Use a simpler model if available to reduce API usage
    const model = "HuggingFaceH4/zephyr-7b-beta";
    
    // Call the Hugging Face API with a capable model
    const result = await hf.textGeneration({
      model: model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 150, // Reduced from 200
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true,
      }
    });
    
    console.log("Hugging Face API response received");
    
    // Clean up the response to remove any formatting or system text
    let aiResponse = result.generated_text || "";
    
    // Extract only the actual response part by removing the prompt and system instructions
    const promptLines = prompt.trim().split('\n');
    const lastPromptLine = promptLines[promptLines.length - 1];
    
    // Find where the last line of the prompt ends in the response
    const lastPromptIndex = aiResponse.indexOf(lastPromptLine);
    
    if (lastPromptIndex !== -1) {
      // Get everything after the last prompt line
      aiResponse = aiResponse.substring(lastPromptIndex + lastPromptLine.length).trim();
      
      // Remove any common prefixes that models sometimes add
      aiResponse = aiResponse
        .replace(/^(\s*(\n|\\n))+/, '')  // Remove leading newlines
        .replace(/^(AI:|Assistant:|VibeFlow AI:|Response:)/i, '')
        .trim();
      
      // If the response starts with the user's message again, remove it
      if (aiResponse.startsWith(message)) {
        aiResponse = aiResponse.substring(message.length).trim();
      }
    }
    
    // Create alternative responses manually
    const alternatives = [
      aiResponse.replace(/I recommend/i, "Based on your profile, I suggest"),
      aiResponse.replace(/I recommend/i, "You might consider")
    ].filter(r => r !== aiResponse && r.length > 20).slice(0, 2);
    
    return {
      response: aiResponse,
      alternatives: alternatives,
      provider: 'huggingface'
    };
  } catch (error) {
    console.error("Hugging Face API error details:", error);
    throw new Error(`Hugging Face API error: ${error.message}`);
  }
}
