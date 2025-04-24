import { useState, useRef } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  text: string;
  isUser: boolean;
}

// ElevenLabs API key - In production, this should be in an environment variable
const ELEVENLABS_API_KEY = 'sk_ac5a8f880ba45f9f6e18b1621e1ae55fb9c8841babe5613e';
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah's voice ID

export const useVoiceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentMood, moodEmojis } = useMood();
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

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { text, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Call Supabase Edge Function to get agent response
      const response = await fetch('/api/edge/mood-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          currentMood: currentMood?.mood,
          moodEmoji: currentMood ? moodEmojis[currentMood.mood] : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }

      const data = await response.json();
      const botResponse = {
        text: data.response,
        isUser: false
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Generate and play audio response if needed
      if (audioRef.current) {
        const audioUrl = await generateSpeech(data.response);
        playAudio(audioUrl);
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
      setInputText('');
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
    audioRef
  };
};
