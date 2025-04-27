
import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useMood } from '@/contexts/MoodContext';
import { Bot, Send, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  alternativeResponses?: string[];
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedResponseIndex, setSelectedResponseIndex] = useState<number | null>(null);
  const { moodEmojis, currentMood } = useMood();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    // Create an audio element once the component mounts
    const audioElement = new Audio();
    audioRef.current = audioElement;

    // Load the responses
    fetch('/api/gemini.json')
      .then(res => res.json())
      .then(data => {
        if (data.responses) {
          setResponses(data.responses);
        }
      })
      .catch(err => {
        console.error('Error loading responses:', err);
      });

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

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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

  const generateAlternativeResponses = (baseResponse: string): string[] => {
    const alternativeResponses = [
      baseResponse.replace(
        "I recommend", 
        "Based on your mood patterns, I suggest"
      ),
      baseResponse.replace(
        "I recommend", 
        "You might benefit from"
      ),
    ];
    return alternativeResponses.filter(r => r !== baseResponse);
  };

  const getPersonalizedResponse = (inputText: string): string => {
    // Determine which response to use based on the user's health profile and input
    if (!user || !responses.length) return "I'm processing your request...";
    
    // Check for keywords in the input text
    const inputLower = inputText.toLowerCase();
    
    if (inputLower.includes('tired') || inputLower.includes('exhausted') || inputLower.includes('no energy')) {
      return responses.find((r) => r.type === 'tired')?.response || responses.find((r) => r.type === 'default').response;
    }
    
    if (inputLower.includes('stress') || inputLower.includes('anxious') || inputLower.includes('overwhelmed')) {
      return responses.find((r) => r.type === 'stressed')?.response || responses.find((r) => r.type === 'default').response;
    }
    
    if (inputLower.includes('sad') || inputLower.includes('depressed') || inputLower.includes('unhappy')) {
      return responses.find((r) => r.type === 'sad')?.response || responses.find((r) => r.type === 'default').response;
    }
    
    if (inputLower.includes('happy') || inputLower.includes('great') || inputLower.includes('good mood')) {
      return responses.find((r) => r.type === 'happy')?.response || responses.find((r) => r.type === 'default').response;
    }
    
    if (inputLower.includes('calm') || inputLower.includes('relaxed') || inputLower.includes('peaceful')) {
      return responses.find((r) => r.type === 'calm')?.response || responses.find((r) => r.type === 'default').response;
    }
    
    if (inputLower.includes('sleep') || inputLower.includes('insomnia') || inputLower.includes('rest')) {
      return responses.find((r) => r.type === 'sleep')?.response || responses.find((r) => r.type === 'default').response;
    }
    
    // Check user preferences and health profile
    if (user.preferences?.dietaryRestrictions?.includes('vegetarian')) {
      if (inputLower.includes('food') || inputLower.includes('eat') || inputLower.includes('meal') || inputLower.includes('diet')) {
        return responses.find((r) => r.type === 'vegetarian')?.response || responses.find((r) => r.type === 'default').response;
      }
    }
    
    if (user.healthProfile?.conditions?.some(c => c.toLowerCase().includes('diabetes') || c.toLowerCase().includes('blood pressure'))) {
      if (inputLower.includes('food') || inputLower.includes('diet') || inputLower.includes('health')) {
        return "Based on your health conditions in your profile, I'd recommend focusing on low-glycemic foods and regular monitoring of your levels. Small, frequent meals might help maintain stable blood sugar. Have you checked with your healthcare provider about specific dietary guidelines?";
      }
    }
    
    // Check current mood
    if (currentMood) {
      if (currentMood.energy === 'low') {
        return responses.find((r) => r.type === 'low_energy')?.response || responses.find((r) => r.type === 'default').response;
      }
      if (currentMood.energy === 'high') {
        return responses.find((r) => r.type === 'high_energy')?.response || responses.find((r) => r.type === 'default').response;
      }
      
      // Use mood-based responses
      const moodType = currentMood.mood;
      return responses.find((r) => r.type === moodType)?.response || responses.find((r) => r.type === 'default').response;
    }
    
    // Default response
    return responses.find((r) => r.type === 'default')?.response || "I'd be happy to provide personalized wellness recommendations based on your needs. Could you tell me a bit more about how you're feeling or what specific help you're looking for?";
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
      // Get a personalized response based on user profile and input
      const baseResponse = getPersonalizedResponse(inputText);
      const alternativeResponses = generateAlternativeResponses(baseResponse);
      
      // Add a slight delay to simulate AI thinking
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Add AI response to chat
      const botMessage = {
        id: Date.now().toString(),
        text: baseResponse,
        isUser: false,
        timestamp: new Date(),
        alternativeResponses: alternativeResponses
      };
      
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
      setSelectedResponseIndex(null);
      
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

    // Also update in storage
    if (user) {
      const updatedMessages = messages.map(msg => {
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
      });
      saveMessages(updatedMessages);
    }
  };

  const regenerateResponse = async (messageId: string, prompt: string) => {
    setIsProcessing(true);

    try {
      // Get a new personalized response
      const baseResponse = getPersonalizedResponse(prompt);
      const alternativeResponses = generateAlternativeResponses(baseResponse);
      
      // Add a slight delay to simulate AI thinking
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              text: baseResponse,
              alternativeResponses: alternativeResponses,
            };
          }
          return msg;
        })
      );
      
      // Also update in storage
      const updatedMessages = messages.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg, 
            text: baseResponse,
            alternativeResponses: alternativeResponses,
          };
        }
        return msg;
      });
      saveMessages(updatedMessages);
      
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="h-[80vh] flex flex-col shadow-lg border-vibe-primary/20">
        <div className="p-4 border-b flex items-center gap-2 bg-gradient-to-r from-vibe-primary/10 to-vibe-light/10">
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
                <div key={msg.id}>
                  <div
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
                          <div className="flex gap-2">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                // Find the user message that prompted this response
                                const msgIndex = messages.findIndex(m => m.id === msg.id);
                                const userPrompt = msgIndex > 0 ? messages[msgIndex-1].text : '';
                                regenerateResponse(msg.id, userPrompt);
                              }}
                              disabled={isProcessing}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!msg.isUser && msg.alternativeResponses && msg.alternativeResponses.length > 0 && (
                    <div className="ml-4 mt-1 mb-4">
                      <p className="text-xs text-gray-500 ml-1 mb-1">Alternative responses:</p>
                      <div className="flex flex-col gap-1">
                        {msg.alternativeResponses.map((alternative, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            size="sm" 
                            className="text-left justify-start h-auto py-1 px-2 text-xs border-gray-200 hover:bg-vibe-primary/5"
                            onClick={() => selectAlternativeResponse(msg.id, index)}
                          >
                            {alternative.length > 100 ? 
                              alternative.substring(0, 100) + '...' : 
                              alternative}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
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
            <div ref={messagesEndRef} />
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
