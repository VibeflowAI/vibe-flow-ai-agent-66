
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useMood } from '@/contexts/MoodContext';
import { MessageSquare, Send, Bot } from 'lucide-react';
import { useVoiceChat } from '@/hooks/useVoiceChat';

const Chat = () => {
  const { messages, inputText, setInputText, handleSendMessage, isProcessing } = useVoiceChat();
  const { moodEmojis } = useMood();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center gap-2 bg-vibe-primary/5">
          <Bot className="w-6 h-6 text-vibe-primary" />
          <div>
            <h1 className="text-xl font-semibold">VibeFlow Assistant</h1>
            <p className="text-sm text-gray-600">I can help with activities, food, and wellness suggestions</p>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-vibe-primary opacity-50" />
                <p className="font-medium mb-2">Welcome to VibeFlow Assistant!</p>
                <p className="text-sm mb-4">I can help you with:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-vibe-primary rounded-full"></span>
                    Activity recommendations
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-vibe-primary rounded-full"></span>
                    Food suggestions
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-vibe-primary rounded-full"></span>
                    Wellness tips
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-vibe-primary rounded-full"></span>
                    Mood improvement strategies
                  </li>
                </ul>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
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

        <form onSubmit={onSubmit} className="p-4 border-t bg-white">
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
