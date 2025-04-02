"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Message } from "@/types";
import { motion } from "framer-motion";

// Import chat components individually to avoid case sensitivity issues
import MessageList from "./chat/MessageList";
import ChatInput from "./chat/ChatInput";

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /**
   * Handle sending a message to the API
   */
  const handleApiMessage = useCallback(
    async (messageText: string, retryCount = 0) => {
      setIsLoading(true);

      try {
        // Create a new messages array that includes the current conversation history
        const currentMessages = [...messages, { role: "user", content: messageText }];

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: currentMessages,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to get response from API");
        }

        // Add the user message and the response to the messages state
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "user", content: messageText },
          { role: "assistant", content: data.content },
        ]);

        // Reset error state on successful response
        setHasError(false);
      } catch (error) {
        console.error("Error sending message:", error);

        // Set error state
        setHasError(true);

        // Add the user message with an error response
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "user", content: messageText },
          {
            role: "assistant",
            content:
              "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try a different question or try again later.",
          },
        ]);

        // Show error toast
        toast.error("Connection error. Please try again.", {
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
        setInput("");
      }
    },
    [messages]
  );

  /**
   * Handle sending a message
   */
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;
      handleApiMessage(messageText);
    },
    [isLoading, handleApiMessage]
  );

  /**
   * Handle form submit
   */
  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSendMessage(input);
    },
    [input, handleSendMessage]
  );

  /**
   * Handle input change
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const setInputValue = useCallback((value: string) => {
    setInput(value);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-[600px] md:h-[600px] h-[95vh] rounded-lg overflow-hidden bg-white shadow-md border border-gray-200 mx-auto"
    >
      <motion.div
        className="bg-gradient-to-r from-primary-500 to-primary-600 px-2 sm:px-6 py-2 sm:py-3 text-white flex items-center justify-center sm:justify-between"
        initial={{ backgroundColor: "#4A4A4A" }}
        animate={{ backgroundColor: "#3d3d3d" }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-base font-medium tracking-wide">Tax Assistant</h2>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-0.5 sm:px-6 py-1.5 sm:py-4 bg-gray-50">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          hasError={hasError}
          onRetry={() => setHasError(false)}
          setInputValue={setInputValue}
        />
        <div ref={messagesEndRef} />
      </div>

      <motion.div
        className="p-1.5 sm:p-4 border-t border-gray-200 bg-white"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
      >
        <ChatInput
          onSubmit={handleFormSubmit}
          value={input}
          onChange={handleInputChange}
          isLoading={isLoading}
          disabled={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}
