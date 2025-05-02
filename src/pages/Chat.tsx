import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useMood } from '@/contexts/MoodContext';
import { Bot, Send, Volume2, VolumeX, RotateCcw, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Chat = () => {
  const {
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
  } = useVoiceChat();
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  // Helper function to get a display name for the AI provider
  const getAIProviderDisplayName = (providerId: string | undefined) => {
    switch (providerId) {
      case 'gemini':
        return 'Google Gemini';
      case 'huggingface':
        return 'Hugging Face';
      case 'openai':
        return 'OpenRouter GPT';
      default:
        return 'AI';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="h-[80vh] flex flex-col shadow-lg border-vibe-primary/20">
        <div className="p-4 border-b flex items-center gap-2 bg-gradient-to-r from-vibe-primary/10 to-vibe-light/10">
          <Bot className="w-6 h-6 text-vibe-primary" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">VibeFlow AI Assistant</h1>
            <p className="text-sm text-gray-600">
              Your personal wellness companion powered by AI
            </p>
          </div>
          <div className="w-48">
            <Select value={aiProvider} onValueChange={(value) => setAiProvider(value as 'gemini' | 'openai' | 'huggingface')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select AI Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="openai">OpenRouter GPT-4o</SelectItem>
                <SelectItem value="huggingface">Hugging Face</SelectItem>
              </SelectContent>
            </Select>
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
                <div className="mt-4 text-sm">
                  <p>Currently using: <span className="font-medium">{aiProvider === 'gemini' ? 'Google Gemini AI' : 'OpenRouter GPT'}</span></p>
                  <p className="mt-1">Change the AI model using the selector above</p>
                </div>
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
                      {msg.text.startsWith("I'm sorry") && !msg.isUser ? (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{msg.text}</span>
                        </div>
                      ) : (
                        msg.text
                      )}
                      {!msg.isUser && (
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <div className="flex gap-2 items-center">
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
                            
                            {msg.provider && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs flex items-center gap-1"
                                    >
                                      <Info className="h-3 w-3" />
                                      {getAIProviderDisplayName(msg.provider)}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>This response was generated using {getAIProviderDisplayName(msg.provider)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
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
                    Thinking using {aiProvider === 'gemini' ? 'Google Gemini' : 'OpenRouter GPT'}...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <audio ref={audioRef} className="hidden" />

        <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
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
