"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Message } from "@/types";
import { motion } from "framer-motion";
import { sendChatMessage, checkApiAvailability } from "@/utils/apiHelpers";

// Import chat components individually to avoid case sensitivity issues
import MessageList from "./chat/MessageList";
import ChatInput from "./chat/ChatInput";

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [apiStatus, setApiStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
    missingKeys?: string[];
  }>({
    checked: false,
    available: true,
    message: "",
  });

  // Check API availability on mount
  useEffect(() => {
    const checkApi = async () => {
      try {
        const status = await checkApiAvailability();
        setApiStatus({
          checked: true,
          available: status.available,
          message: status.message,
          missingKeys: status.missingKeys,
        });

        if (!status.available) {
          setMessages([
            {
              role: "assistant",
              content: `API configuration issue: ${status.message}. Please check your environment variables.`,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to check API availability:", error);
        setApiStatus({
          checked: true,
          available: false,
          message: "Could not connect to API service",
        });
      }
    };

    checkApi();
  }, []);

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
    async (messageText: string) => {
      setIsLoading(true);

      // Show error if API is not available
      if (!apiStatus.available && apiStatus.checked) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "user", content: messageText },
          {
            role: "assistant",
            content: `API configuration issue: ${apiStatus.message}. Missing environment variables: ${
              apiStatus.missingKeys?.join(", ") || "unknown"
            }. Please check your Vercel environment variables.`,
          },
        ]);
        setIsLoading(false);
        setInput("");
        return;
      }

      try {
        // Add user message immediately for better UX
        setMessages((prevMessages) => [...prevMessages, { role: "user", content: messageText }]);

        // Send message to API
        const data = await sendChatMessage(messageText);

        // Add the API response to messages
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: data.content },
        ]);

        // Reset error state on successful response
        setHasError(false);
      } catch (error) {
        console.error("Error sending message:", error);

        // Set error state
        setHasError(true);

        // Add error message
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content:
              "I'm having trouble connecting to the server. This might be due to missing API keys in the environment. Please check your Vercel environment variables.",
          },
        ]);

        // Show error toast
        toast.error("Connection error. Please check API keys in Vercel settings.", {
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
        setInput("");
      }
    },
    [apiStatus]
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
