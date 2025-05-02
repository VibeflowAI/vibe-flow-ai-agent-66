
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY")!;
const HUGGING_FACE_TOKEN = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN")!;

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
    console.log("Gemini API key available:", !!GOOGLE_API_KEY);
    console.log("Hugging Face token available:", !!HUGGING_FACE_TOKEN);
    
    // Check if message is provided
    if (!message || message.trim() === '') {
      throw new Error("Message is required");
    }
    
    let aiResponse;
    let alternativeResponses = [];
    let usedProvider = '';
    
    // Try with Gemini first if API key is available
    if (GOOGLE_API_KEY) {
      try {
        console.log("Attempting to use Gemini API...");
        const geminiResult = await useGeminiAPI(message, userContext);
        aiResponse = geminiResult.response;
        alternativeResponses = geminiResult.alternatives || [];
        usedProvider = 'gemini';
        console.log("Successfully used Gemini API");
      } catch (geminiError) {
        console.error("Gemini API error:", geminiError.message);
        // Fall back to Hugging Face if Gemini fails
        if (HUGGING_FACE_TOKEN) {
          console.log("Falling back to Hugging Face API");
        } else {
          throw geminiError; // Re-throw if no fallback available
        }
      }
    }
    
    // Use Hugging Face if Gemini wasn't used successfully
    if (!aiResponse && HUGGING_FACE_TOKEN) {
      try {
        console.log("Using Hugging Face API...");
        const hfResult = await useHuggingFaceAPI(message, userContext);
        aiResponse = hfResult.response;
        usedProvider = 'huggingface';
        
        // Generate some alternative responses manually since HF doesn't provide them
        alternativeResponses = [
          aiResponse.replace(/I recommend/i, "Based on your profile, I suggest"),
          aiResponse.replace(/I recommend/i, "You might consider")
        ].filter(r => r !== aiResponse && r !== aiResponse).slice(0, 2);
        
        console.log("Successfully used Hugging Face API");
      } catch (hfError) {
        console.error("Hugging Face API error:", hfError.message);
        throw hfError;
      }
    }
    
    // If we still don't have a response, throw error
    if (!aiResponse) {
      throw new Error("No AI provider available. Please configure Gemini API key or Hugging Face token.");
    }
    
    console.log(`AI response (${usedProvider}):", ${aiResponse.substring(0, 50)}...`);
    
    // Return the response and alternatives
    const responseObj = {
      response: aiResponse,
      alternatives: alternativeResponses,
      provider: usedProvider
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

// Function to interact with Gemini API
async function useGeminiAPI(message: string, userContext: any) {
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
    console.error("Gemini API error:", JSON.stringify(errorData, null, 2));
    throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }
  
  const data = await response.json();
  console.log("Gemini API response received");
  
  // Process Gemini API response
  let aiResponse;
  if (data?.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
    aiResponse = data.candidates[0].content.parts[0].text;
  } else {
    console.error("Unexpected API response format:", JSON.stringify(data, null, 2));
    throw new Error("Invalid response format from Gemini API");
  }
  
  // Generate alternative responses
  const alternativeResponses = [
    aiResponse.replace(/I recommend/i, "Based on your profile, I suggest"),
    aiResponse.replace(/I recommend/i, "You might consider"),
    aiResponse.replace(/try/i, "consider trying")
  ].filter(r => r !== aiResponse).slice(0, 2);
  
  return {
    response: aiResponse,
    alternatives: alternativeResponses
  };
}

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
    
    console.log("Sending request to Hugging Face with prompt:", prompt.substring(0, 50) + "...");
    
    // Call the Hugging Face API with a capable model
    // Using text generation instead of chat completion for more reliable results
    const result = await hf.textGeneration({
      model: "HuggingFaceH4/zephyr-7b-beta",
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
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
    
    console.log("Processed response:", aiResponse.substring(0, 100) + "...");
    
    return {
      response: aiResponse
    };
  } catch (error) {
    console.error("Hugging Face API error details:", error);
    throw new Error(`Hugging Face API error: ${error.message}`);
  }
}
