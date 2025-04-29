
// Replace the incorrect import with the correct Deno standard library URL
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface UserContext {
  mood?: string;
  energy?: string;
}

interface RequestBody {
  message: string;
  currentMood?: string;
  moodEmoji?: string;
  userContext?: UserContext;
  aiProvider?: 'gemini' | 'openai';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Execute Python code using Deno's subprocess API
async function runPythonAgent(message: string, userContext: UserContext) {
  try {
    // Create a temporary Python file with our agent code
    const pythonCode = `
import sys
import json
import requests

# Get input from stdin
input_data = json.loads(sys.stdin.read())
message = input_data.get('message', '')
mood = input_data.get('mood', 'neutral')
energy = input_data.get('energy', 'medium')

# Define our agent system
class MoodAgent:
    def __init__(self, mood, energy):
        self.mood = mood
        self.energy = energy
        self.gemini_api_key = "${Deno.env.get('GEMINI_API_KEY')}"
    
    def process_message(self, message):
        # Create context for the AI based on the user's mood and energy
        prompt = f"""
        As an AI wellness assistant, respond to this message: "{message}"
        
        Consider that the user's current mood is {self.mood} and their energy level is {self.energy}.
        Be empathetic and supportive. Provide specific advice tailored to their current state.
        
        If they're feeling low energy, suggest energizing activities.
        If they're feeling high energy, suggest ways to channel that energy productively.
        If they're feeling positive, build on that positivity.
        If they're feeling negative, offer comfort and practical steps to improve their mood.
        
        Include one specific recommendation for either:
        - A healthy food or drink
        - A physical activity
        - A mindfulness exercise
        
        Keep your response concise, friendly, and personalized.
        """
        
        # Call Gemini API
        response = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": self.gemini_api_key
            },
            json={
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 1024,
                }
            }
        )
        
        # Process the response
        if response.status_code != 200:
            return {"error": f"Gemini API error: {response.status_code}"}
        
        result = response.json()
        try:
            response_text = result['candidates'][0]['content']['parts'][0]['text']
            return {"response": response_text}
        except (KeyError, IndexError):
            return {"error": "Failed to parse Gemini response"}

# Create agent and process message
agent = MoodAgent(mood, energy)
result = agent.process_message(message)

# Return the result as JSON
print(json.dumps(result))
    `;
    
    // Write the Python code to a temporary file
    const encoder = new TextEncoder();
    const pythonFile = await Deno.makeTempFile({suffix: ".py"});
    await Deno.writeFile(pythonFile, encoder.encode(pythonCode));
    
    // Prepare the input data
    const inputData = {
      message: message,
      mood: userContext.mood || 'neutral',
      energy: userContext.energy || 'medium'
    };
    
    // Execute the Python code
    const process = Deno.run({
      cmd: ["python3", pythonFile],
      stdin: "piped",
      stdout: "piped",
      stderr: "piped"
    });
    
    // Send input data to the Python script
    const inputString = JSON.stringify(inputData);
    await process.stdin.write(new TextEncoder().encode(inputString));
    process.stdin.close();
    
    // Get the output
    const outputBuffer = await process.output();
    const errorBuffer = await process.stderrOutput();
    
    // Clean up the temporary file
    await Deno.remove(pythonFile);
    
    // Check for errors
    const errorString = new TextDecoder().decode(errorBuffer);
    if (errorString) {
      console.error("Python error:", errorString);
      return { error: "Error executing Python agent: " + errorString };
    }
    
    // Parse the output
    const output = new TextDecoder().decode(outputBuffer);
    return JSON.parse(output);
  } catch (error) {
    console.error("Error running Python agent:", error);
    return { error: "Failed to execute Python agent: " + error.message };
  }
}

serve(async (req) => {
  try {
    // Enable CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: corsHeaders
      });
    }

    // Parse request body
    const { 
      message, 
      currentMood, 
      moodEmoji,
      userContext = {}
    } = await req.json() as RequestBody;

    // Validate input
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }), 
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    console.log("Processing request with data:", { message, currentMood });

    // Prepare user context for the agent
    const agentContext = {
      mood: currentMood || userContext.mood || 'neutral',
      energy: userContext.energy || 'medium',
    };
    
    console.log("Sending to Python agent with context:", agentContext);
    
    // Execute Python agent
    const agentResult = await runPythonAgent(message, agentContext);
    
    if (agentResult.error) {
      console.error("Agent error:", agentResult.error);
      throw new Error(agentResult.error);
    }

    // Return the response from the agent
    return new Response(
      JSON.stringify({ response: agentResult.response }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
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
          ...corsHeaders
        }
      }
    );
  }
});
