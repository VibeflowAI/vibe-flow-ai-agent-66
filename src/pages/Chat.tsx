
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useMood } from '@/contexts/MoodContext';
import { MessageSquare } from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [inputText, setInputText] = useState('');
  const { moodEmojis } = useMood();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessages = [
      ...messages,
      { text: inputText, isUser: true },
      { 
        text: "I understand you're interested in activities or food. I can help recommend options based on your current mood and preferences. Would you like me to suggest something specific?",
        isUser: false 
      }
    ];
    setMessages(newMessages);
    setInputText('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-vibe-primary" />
          <h1 className="text-xl font-semibold">VibeFlow Assistant</h1>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>Welcome to VibeFlow Assistant! Ask me about:</p>
                <ul className="mt-2">
                  <li>• Activity recommendations</li>
                  <li>• Food suggestions</li>
                  <li>• Wellness tips</li>
                  <li>• Mood improvement strategies</li>
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
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" className="bg-vibe-primary hover:bg-vibe-dark">
              Send
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Chat;
