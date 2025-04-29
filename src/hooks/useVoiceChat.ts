
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
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini');
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
      
      console.log('Sending message to AI:', { text, userContext, aiProvider });
      
      // Call Edge Function with user context and AI provider choice
      const response = await fetch('https://unparnunixbhxizmfvmc.supabase.co/functions/v1/mood-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          currentMood: currentMood?.mood,
          moodEmoji: currentMood ? moodEmojis[currentMood.mood] : null,
          userContext: userContext,
          aiProvider: aiProvider
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get response from agent: ${response.status}${errorData.details ? ' - ' + errorData.details : ''}`);
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error("Received empty response from the AI");
      }
      
      // Generate 2 alternative responses with slight variations
      const mainResponse = data.response;
      const alternativeResponses = [
        mainResponse.replace(/I recommend/i, "Based on your profile, I suggest"),
        mainResponse.replace(/I recommend/i, "You might consider"),
        mainResponse.replace(/try/i, "consider trying")
      ].filter(r => r !== mainResponse).slice(0, 2);
      
      const botMessage = {
        id: Date.now().toString(),
        text: mainResponse,
        isUser: false,
        timestamp: new Date(),
        alternativeResponses: alternativeResponses
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Save chat history to Supabase
      if (user) {
        saveToHistory(text, mainResponse);
      }
      
      // Generate and play audio response if needed
      if (audioRef.current) {
        try {
          const audioUrl = await generateSpeech(data.response);
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

      // Call Supabase Edge Function to get agent response
      const response = await fetch('https://unparnunixbhxizmfvmc.supabase.co/functions/v1/mood-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          currentMood: currentMood?.mood,
          moodEmoji: currentMood ? moodEmojis[currentMood.mood] : null,
          userContext: userContext,
          aiProvider: aiProvider
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get response from agent: ${response.status}${errorData.details ? ' - ' + errorData.details : ''}`);
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error("Received empty response from the AI");
      }
      
      // Generate alternative responses
      const mainResponse = data.response;
      const alternativeResponses = [
        mainResponse.replace(/I recommend/i, "Based on your profile, I suggest"),
        mainResponse.replace(/I recommend/i, "You might consider"),
        mainResponse.replace(/try/i, "consider trying")
      ].filter(r => r !== mainResponse).slice(0, 2);
      
      setMessages(prev => {
        return prev.map(message => {
          if (message.id === messageId) {
            return {
              id: Date.now().toString(),
              text: data.response,
              isUser: false,
              timestamp: new Date(),
              alternativeResponses: alternativeResponses
            };
          }
          return message;
        });
      });
      
      // Save chat history to Supabase
      if (user) {
        saveToHistory(prompt, mainResponse);
      }
      
      // Generate and play audio response if needed
      if (audioRef.current) {
        try {
          const audioUrl = await generateSpeech(data.response);
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
