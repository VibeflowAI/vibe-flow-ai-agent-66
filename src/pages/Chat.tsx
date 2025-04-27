
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useMood } from '@/contexts/MoodContext';
import { Bot, Send, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { moodEmojis, currentMood } = useMood();
  const { user } = useAuth();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create an audio element once the component mounts
    const audioElement = new Audio();
    audioRef.current = audioElement;

    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Load past messages when component mounts
    const loadMessages = () => {
      if (user) {
        const savedMessages = localStorage.getItem(`vibeflow_chat_${user.id}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      }
    };
    
    loadMessages();
  }, [user]);
  
  const saveMessages = (updatedMessages: Message[]) => {
    if (user) {
      localStorage.setItem(`vibeflow_chat_${user.id}`, JSON.stringify(updatedMessages));
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setInputText('');
    setIsProcessing(true);

    try {
      // Call Gemini API through our own endpoint
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          currentMood: currentMood?.mood,
          moodEmoji: currentMood ? moodEmojis[currentMood.mood] : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Gemini AI');
      }

      const data = await response.json();
      
      // Add AI response to chat
      const botMessage = {
        id: Date.now().toString(),
        text: data.response || "I'm sorry, I couldn't process your request.",
        isUser: false,
        timestamp: new Date(),
      };
      
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
      
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center gap-2 bg-vibe-primary/5">
          <Bot className="w-6 h-6 text-vibe-primary" />
          <div>
            <h1 className="text-xl font-semibold">VibeFlow AI Assistant</h1>
            <p className="text-sm text-gray-600">
              Your personal wellness companion powered by Gemini AI
            </p>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-vibe-primary opacity-50" />
                <p className="font-medium mb-2">Welcome to VibeFlow AI Assistant!</p>
                <p className="text-sm mb-4">Ask me anything about:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-vibe-primary rounded-full"></span>
                    Mental health and wellness
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-vibe-primary rounded-full"></span>
                    Exercise and physical activity
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-vibe-primary rounded-full"></span>
                    Nutrition and healthy eating
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-vibe-primary rounded-full"></span>
                    Sleep improvement tips
                  </li>
                </ul>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.isUser
                        ? 'bg-vibe-primary text-white rounded-br-none'
                        : 'bg-gray-100 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                    {!msg.isUser && (
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0" 
                          onClick={() => isPlaying ? stopAudio() : null}
                        >
                          {isPlaying ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg rounded-bl-none p-3 max-w-[80%]">
                  <div className="flex gap-2 items-center text-sm text-gray-500">
                    <Bot className="w-4 h-4 animate-pulse" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isProcessing}
            />
            <Button 
              type="submit" 
              className="bg-vibe-primary hover:bg-vibe-dark"
              disabled={isProcessing || !inputText.trim()}
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Chat;
