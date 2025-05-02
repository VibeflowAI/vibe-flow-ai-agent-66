import { useState, useRef } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  alternativeResponses?: string[];
  provider?: string;
}

// Define types for user profile data
interface HealthProfile {
  healthGoals?: string[];
  sleepHours?: string;
  activityLevel?: string;
  conditions?: string[];
}

interface UserPreferences {
  dietaryRestrictions?: string[];
}

// ElevenLabs API key - In production, this should be in an environment variable
const ELEVENLABS_API_KEY = 'sk_ac5a8f880ba45f9f6e18b1621e1ae55fb9c8841babe5613e';
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah's voice ID
const OPENROUTER_API_KEY = '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';

export const useVoiceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'huggingface'>('gemini');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentMood, moodEmojis } = useMood();
  const { user } = useAuth();
  const { toast } = useToast();

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const generateSpeech = async (text: string): Promise<string> => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  };

  const playAudio = async (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        console.error('Error playing audio');
        setIsPlaying(false);
      };
      await audioRef.current.play().catch(err => {
        console.error('Failed to play audio:', err);
        setIsPlaying(false);
      });
    }
  };

  const saveToHistory = async (message: string, response: string) => {
    if (!user) return;
    
    try {
      // For now, we'll just log to console instead of saving to Supabase
      // This avoids TypeScript errors while you set up proper database types
      console.log('Would save chat history:', { user_id: user.id, message, response });
      
      // Uncomment when database is properly set up
      // const { error } = await supabase
      //   .from('chat_history')
      //   .insert({
      //     user_id: user.id,
      //     message,
      //     response
      //   });
        
      // if (error) {
      //   console.error('Error saving chat history:', error);
      // }
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  };

  // Update to use Supabase edge function for Gemini API
  const processWithGemini = async (prompt: string, userContextData: any): Promise<{ response: string, alternatives: string[], provider: string }> => {
    try {
      const response = await supabase.functions.invoke('chat', {
        body: {
          message: prompt,
          userContext: userContextData
        }
      });

      if (response.error) {
        throw new Error(`AI API error via edge function: ${response.error.message}`);
      }

      return {
        response: response.data.response || "I'm sorry, I couldn't process your request at the moment.",
        alternatives: response.data.alternatives || [],
        provider: response.data.provider || 'unknown'
      };
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error('Failed to get response from AI: ' + error.message);
    }
  };

  const processWithOpenAI = async (prompt: string): Promise<string> => {
    try {
      // Using OpenRouter.ai API with the format you provided
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'VibeFlow AI Assistant'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are VibeFlow AI, a friendly wellness assistant. You are helpful, empathetic, 
                        and focused on providing practical wellness advice. Keep responses concise 
                        (under 150 words) and focused on wellness, mental health, or lifestyle improvements.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 300,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status}${errorData.error ? ' - ' + errorData.error.message : ''}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw new Error('Failed to get response from OpenRouter: ' + error.message);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { 
      id: Date.now().toString(),
      text, 
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    
    try {
      // Safely access user health profile and preferences with default empty objects
      const userHealthProfile = (user?.healthProfile as HealthProfile) || {};
      const userPreferences = (user?.preferences as UserPreferences) || {};
      
      // Prepare user context for AI with safe property access
      const userContext = {
        mood: currentMood?.mood || 'unknown',
        energy: currentMood?.energy || 'medium',
        healthGoals: userHealthProfile.healthGoals || [],
        sleepHours: userHealthProfile.sleepHours || '7',
        activityLevel: userHealthProfile.activityLevel || 'moderate',
        conditions: userHealthProfile.conditions || [],
        dietaryRestrictions: userPreferences.dietaryRestrictions || []
      };
      
      // Create user profile text for non-Gemini providers
      const userProfile = `
        User's message: ${text}
        Current mood: ${userContext.mood}
        Mood emoji: ${currentMood ? moodEmojis[currentMood.mood] : '😐'}
        Energy level: ${userContext.energy}
        Sleep hours: ${userContext.sleepHours}
        Activity level: ${userContext.activityLevel}
        Health goals: ${userContext.healthGoals.join(', ') || 'general wellness'}
        Health conditions: ${userContext.conditions.join(', ') || 'none reported'}
        Dietary restrictions: ${userContext.dietaryRestrictions.join(', ') || 'none reported'}
      `;
      
      console.log('Sending message to AI:', { text, userContext, aiProvider });
      
      // Get response from selected AI provider
      let aiResponse;
      let alternativeResponses = [];
      let responseProvider = '';
      
      if (aiProvider === 'gemini' || aiProvider === 'huggingface') {
        // We'll use the edge function for both Gemini and Hugging Face
        const geminiResponse = await processWithGemini(text, userContext);
        aiResponse = geminiResponse.response;
        alternativeResponses = geminiResponse.alternatives;
        responseProvider = geminiResponse.provider;
      } else {
        // For OpenRouter, we'll build the prompt manually
        const aiPrompt = `
          You are VibeFlow AI, a friendly wellness assistant. 
          You are helpful, empathetic, and focused on providing practical wellness advice.
          
          User context:
          ${userProfile}
          
          Please provide a thoughtful, personalized response addressing the user's message.
          Keep your response concise (under 150 words) and focused on wellness, mental health,
          or lifestyle improvements based on their current mood and context.
          
          Your response should be encouraging and provide actionable suggestions.
        `;
        
        aiResponse = await processWithOpenAI(aiPrompt);
        responseProvider = 'openai';
        
        // Generate alternative responses manually for OpenRouter
        alternativeResponses = [
          aiResponse.replace(/I recommend/i, "Based on your profile, I suggest"),
          aiResponse.replace(/I recommend/i, "You might consider"),
          aiResponse.replace(/try/i, "consider trying")
        ].filter(r => r !== aiResponse).slice(0, 2);
      }
      
      if (!aiResponse) {
        throw new Error("Received empty response from the AI");
      }
      
      const botMessage = {
        id: Date.now().toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
        alternativeResponses: alternativeResponses,
        provider: responseProvider
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Save chat history to Supabase
      if (user) {
        saveToHistory(text, aiResponse);
      }
      
      // Generate and play audio response if needed
      if (audioRef.current) {
        try {
          const audioUrl = await generateSpeech(aiResponse);
          playAudio(audioUrl);
        } catch (error) {
          console.error('Error generating speech:', error);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: `Failed to get a response. ${error.message}`,
        variant: "destructive"
      });
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectAlternativeResponse = (messageId: string, index: number) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId && msg.alternativeResponses && msg.alternativeResponses[index]) {
          const alternativeResponses = [
            msg.text, 
            ...(msg.alternativeResponses.filter((_: string, i: number) => i !== index))
          ];
          return {
            ...msg,
            text: msg.alternativeResponses[index],
            alternativeResponses: alternativeResponses,
          };
        }
        return msg;
      })
    );
  };

  const regenerateResponse = async (messageId: string, prompt: string) => {
    setIsProcessing(true);

    try {
      // Find the message that needs regeneration
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex < 0) {
        throw new Error("Message not found");
      }
      
      // Safely access user health profile and preferences with default empty objects
      const userHealthProfile = (user?.healthProfile as HealthProfile) || {};
      const userPreferences = (user?.preferences as UserPreferences) || {};
      
      // Prepare user context for AI with safe property access
      const userContext = {
        mood: currentMood?.mood || 'unknown',
        energy: currentMood?.energy || 'medium',
        healthGoals: userHealthProfile.healthGoals || [],
        sleepHours: userHealthProfile.sleepHours || '7',
        activityLevel: userHealthProfile.activityLevel || 'moderate',
        conditions: userHealthProfile.conditions || [],
        dietaryRestrictions: userPreferences.dietaryRestrictions || []
      };

      // Create user profile text for non-Gemini providers
      const userProfile = `
        User's message: ${prompt}
        Current mood: ${userContext.mood}
        Mood emoji: ${currentMood ? moodEmojis[currentMood.mood] : '😐'}
        Energy level: ${userContext.energy}
        Sleep hours: ${userContext.sleepHours}
        Activity level: ${userContext.activityLevel}
        Health goals: ${Array.isArray(userContext.healthGoals) ? userContext.healthGoals.join(', ') : 'general wellness'}
        Health conditions: ${Array.isArray(userContext.conditions) ? userContext.conditions.join(', ') : 'none reported'}
        Dietary restrictions: ${Array.isArray(userContext.dietaryRestrictions) ? userContext.dietaryRestrictions.join(', ') : 'none reported'}
      `;
      
      // Get response from selected AI provider
      let aiResponse;
      let alternativeResponses = [];
      let responseProvider = '';
      
      if (aiProvider === 'gemini' || aiProvider === 'huggingface') {
        const geminiResponse = await processWithGemini(prompt, userContext);
        aiResponse = geminiResponse.response;
        alternativeResponses = geminiResponse.alternatives;
        responseProvider = geminiResponse.provider;
      } else {
        // For OpenRouter, we'll build the prompt manually
        const aiPrompt = `
          You are VibeFlow AI, a friendly wellness assistant. 
          You are helpful, empathetic, and focused on providing practical wellness advice.
          
          User context:
          ${userProfile}
          
          Please provide a thoughtful, personalized response addressing the user's message.
          Keep your response concise (under 150 words) and focused on wellness, mental health,
          or lifestyle improvements based on their current mood and context.
          
          Your response should be encouraging and provide actionable suggestions.
        `;
        
        aiResponse = await processWithOpenAI(aiPrompt);
        responseProvider = 'openai';
        
        // Generate alternative responses manually for OpenRouter
        alternativeResponses = [
          aiResponse.replace(/I recommend/i, "Based on your profile, I suggest"),
          aiResponse.replace(/I recommend/i, "You might consider"),
          aiResponse.replace(/try/i, "consider trying")
        ].filter(r => r !== aiResponse).slice(0, 2);
      }
      
      setMessages(prev => {
        return prev.map(message => {
          if (message.id === messageId) {
            return {
              ...message,
              text: aiResponse,
              alternativeResponses: alternativeResponses,
              provider: responseProvider
            };
          }
          return message;
        });
      });
      
      // Save chat history to Supabase
      if (user) {
        saveToHistory(prompt, aiResponse);
      }
      
      // Generate and play audio response if needed
      if (audioRef.current) {
        try {
          const audioUrl = await generateSpeech(aiResponse);
          playAudio(audioUrl);
        } catch (error) {
          console.error('Error generating speech:', error);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    handleSendMessage,
    isProcessing,
    isPlaying,
    stopAudio,
    audioRef,
    selectAlternativeResponse,
    regenerateResponse,
    aiProvider,
    setAiProvider
  };
};
