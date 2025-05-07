
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
    
    // Fallback wellness responses based on common topics
    const fallbackResponses = [
      {
        response: "I notice you're looking for wellness advice. For better mental health, try practicing mindfulness meditation for just 5 minutes daily. It can help reduce stress and improve focus.",
        alternatives: [
          "Have you tried deep breathing exercises? Just 10 deep breaths can help reset your nervous system when you're feeling stressed.",
          "Regular short walks, even just 10 minutes, can significantly improve your mood and energy levels."
        ]
      },
      {
        response: "While I can't access the AI service right now, I can suggest that staying hydrated is fundamental to wellness. Try drinking a glass of water first thing each morning.",
        alternatives: [
          "Consider creating a consistent sleep schedule - going to bed and waking up at the same time daily helps regulate your body's natural rhythm.",
          "Taking short breaks throughout your day to stretch can help prevent physical tension and mental fatigue."
        ]
      },
      {
        response: "For nutrition wellness, consider adding more colorful vegetables to your meals. The variety of colors represents different nutrients your body needs.",
        alternatives: [
          "Meal prepping on weekends can help you make healthier food choices throughout the week when you're busy.",
          "Small changes like replacing sugary drinks with water or herbal tea can have significant health benefits over time."
        ]
      },
      {
        response: "To improve your physical wellness, try incorporating short bursts of activity throughout your day - take the stairs, do quick stretches, or go for a brief walk.",
        alternatives: [
          "Strength training doesn't require a gym - bodyweight exercises like push-ups, squats, and lunges are effective and can be done anywhere.",
          "Balance your exercise routine with both cardio and strength training for overall fitness benefits."
        ]
      },
      {
        response: "For better mental health, try the 5-4-3-2-1 grounding technique when feeling anxious: identify 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
        alternatives: [
          "Journaling for just 5 minutes daily can help process emotions and reduce mental stress.",
          "Setting boundaries with technology, like phone-free meals or no screens an hour before bed, can improve mental wellbeing."
        ]
      },
      {
        response: "Social wellness is important too. Consider scheduling regular check-ins with friends or family, even if it's just a quick video call.",
        alternatives: [
          "Volunteering for a cause you care about can provide a sense of purpose and community connection.",
          "Joining local clubs or groups related to your interests can help build meaningful relationships."
        ]
      }
    ];
    
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
      
      // Select a random fallback response that doesn't repeat recent ones
      const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
      const fallbackResponse = fallbackResponses[randomIndex];
      
      return new Response(JSON.stringify({
        response: fallbackResponse.response,
        alternatives: fallbackResponse.alternatives,
        provider: 'fallback',
        error: 'API limit exceeded'
      }), {
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
    
    // Create unique alternative responses
    const alternatives = [
      "Remember that small daily habits often lead to the biggest wellness improvements.",
      "It might help to focus on one wellness goal at a time rather than trying to change everything at once."
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
