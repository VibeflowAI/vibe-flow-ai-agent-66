
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

export const useVoiceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiLimitReached, setApiLimitReached] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentMood } = useMood();
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
      console.log('Would save chat history:', { user_id: user.id, message, response });
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  };

  // Update to use Supabase edge function for AI chat
  const processWithAI = async (prompt: string, userContextData: any): Promise<{ response: string, alternatives: string[], provider: string, error?: string }> => {
    try {
      // Use the Supabase edge function
      const response = await supabase.functions.invoke('chat', {
        body: {
          message: prompt,
          userContext: userContextData
        }
      });

      if (response.error) {
        console.error("AI API error via edge function:", response.error);
        throw new Error(`AI API error via edge function: ${response.error.message}`);
      }

      // Check if we're using fallback due to API limits
      if (response.data.error === 'API limit exceeded') {
        setApiLimitReached(true);
      }

      return {
        response: response.data.response || "I'm sorry, I couldn't process your request at the moment.",
        alternatives: response.data.alternatives || [],
        provider: response.data.provider || 'huggingface',
        error: response.data.error
      };
    } catch (error) {
      console.error('AI API Error:', error);
      setApiLimitReached(true);
      
      // Provide a fallback response when the API fails
      return {
        response: "I'm sorry, the AI service is currently unavailable. Please try again later.",
        alternatives: [],
        provider: 'fallback',
        error: 'connection_error'
      };
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
      
      console.log('Sending message to AI:', { text, userContext });
      
      // Get response from AI
      const aiResult = await processWithAI(text, userContext);
      
      const botMessage = {
        id: Date.now().toString(),
        text: aiResult.response,
        isUser: false,
        timestamp: new Date(),
        alternativeResponses: aiResult.alternatives,
        provider: aiResult.provider
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Save chat history to Supabase
      if (user) {
        saveToHistory(text, aiResult.response);
      }
      
      // Generate and play audio response if needed and not using fallback
      if (audioRef.current && aiResult.response && !apiLimitReached) {
        try {
          const audioUrl = await generateSpeech(aiResult.response);
          playAudio(audioUrl);
        } catch (error) {
          console.error('Error generating speech:', error);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Our AI service is temporarily unavailable. Please try again later.",
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
    if (!prompt) {
      toast({
        title: "Error",
        description: "Unable to regenerate response. Missing original message.",
        variant: "destructive"
      });
      return;
    }
    
    if (apiLimitReached) {
      toast({
        title: "API Limit Reached",
        description: "Cannot regenerate response while API limit is reached.",
        variant: "warning"
      });
      return;
    }
    
    setIsProcessing(true);

    try {
      // Prepare user context for AI with safe property access
      const userHealthProfile = (user?.healthProfile as HealthProfile) || {};
      const userPreferences = (user?.preferences as UserPreferences) || {};
      
      const userContext = {
        mood: currentMood?.mood || 'unknown',
        energy: currentMood?.energy || 'medium',
        healthGoals: userHealthProfile.healthGoals || [],
        sleepHours: userHealthProfile.sleepHours || '7',
        activityLevel: userHealthProfile.activityLevel || 'moderate',
        conditions: userHealthProfile.conditions || [],
        dietaryRestrictions: userPreferences.dietaryRestrictions || []
      };

      // Get response from AI
      const aiResult = await processWithAI(prompt, userContext);
      
      setMessages(prev => {
        return prev.map(message => {
          if (message.id === messageId) {
            return {
              ...message,
              text: aiResult.response,
              alternativeResponses: aiResult.alternatives,
              provider: aiResult.provider
            };
          }
          return message;
        });
      });
      
      // Save chat history to Supabase
      if (user) {
        saveToHistory(prompt, aiResult.response);
      }
      
      // Generate and play audio response if needed
      if (audioRef.current && aiResult.response && !apiLimitReached) {
        try {
          const audioUrl = await generateSpeech(aiResult.response);
          playAudio(audioUrl);
        } catch (error) {
          console.error('Error generating speech:', error);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate response. Please try again.",
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
    apiLimitReached
  };
};
