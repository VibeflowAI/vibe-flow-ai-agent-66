
import { useState } from 'react';
import { useMood } from '@/contexts/MoodContext';

interface Message {
  text: string;
  isUser: boolean;
}

export const useVoiceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentMood, moodEmojis } = useMood();

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { text, isUser: true };
    setMessages(prev => [...prev, userMessage]);

    setIsProcessing(true);
    try {
      // For now, we'll use a simple response. Later we'll integrate with ElevenLabs
      const botResponse = {
        text: `I understand you're interested in activities or food. Based on your current mood ${
          currentMood ? `(${currentMood.mood} - ${moodEmojis[currentMood.mood]})` : ''
        }, I can suggest some options. Would you like specific recommendations?`,
        isUser: false
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
    
    setInputText('');
  };

  return {
    messages,
    inputText,
    setInputText,
    handleSendMessage,
    isProcessing
  };
};
