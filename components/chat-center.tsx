"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, X } from "lucide-react";

interface ChatMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  message: string;
  timestamp: number;
  isAdmin: boolean;
}

interface ChatCenterProps {
  userEmail: string;
  userName: string;
  isAdmin?: boolean;
}

export function ChatCenter({ userEmail, userName, isAdmin = false }: ChatCenterProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load messages from localStorage
    const messagesStr = localStorage.getItem("chatMessages");
    if (messagesStr) {
      try {
        const allMessages = JSON.parse(messagesStr);
        // Filter messages based on user role
        if (isAdmin) {
          // Admin sees all messages
          setMessages(allMessages);
        } else {
          // Users see only their conversations
          const userMessages = allMessages.filter(
            (m: ChatMessage) => m.senderEmail === userEmail || (m.isAdmin && m.message.includes(userEmail))
          );
          setMessages(userMessages);
        }
      } catch {
        setMessages([]);
      }
    }
  }, [userEmail, isAdmin]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderEmail: userEmail,
      senderName: userName,
      message: messageText,
      timestamp: Date.now(),
      isAdmin: isAdmin,
    };

    // Save to localStorage
    const messagesStr = localStorage.getItem("chatMessages");
    const allMessages = messagesStr ? JSON.parse(messagesStr) : [];
    allMessages.push(newMessage);
    localStorage.setItem("chatMessages", JSON.stringify(allMessages));

    setMessages([...messages, newMessage]);
    setMessageText("");

    // Create notification for admin if user sends message
    if (!isAdmin) {
      const notification = {
        id: Date.now().toString(),
        type: "chat",
        title: "New Chat Message",
        message: `${userName} sent you a message: "${messageText.substring(0, 50)}..."`,
        timestamp: Date.now(),
        read: false,
        userEmail: userEmail,
      };

      const adminNotificationsStr = localStorage.getItem("adminNotifications");
      const adminNotifications = adminNotificationsStr ? JSON.parse(adminNotificationsStr) : [];
      adminNotifications.push(notification);
      localStorage.setItem("adminNotifications", JSON.stringify(adminNotifications));
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen ? (
        <Card className="border-border bg-card w-96 max-h-96 flex flex-col shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-bold text-foreground">
              {isAdmin ? "User Messages" : "Chat with Admin"}
            </h3>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">
                {isAdmin ? "No messages yet" : "Start a conversation with admin"}
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderEmail === userEmail ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      msg.senderEmail === userEmail
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {isAdmin && msg.senderEmail !== userEmail && (
                      <p className="text-xs font-semibold mb-1">{msg.senderName}</p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                placeholder="Type message..."
                className="bg-input border-border text-foreground flex-1"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
        >
          💬
        </Button>
      )}
    </div>
  );
}
