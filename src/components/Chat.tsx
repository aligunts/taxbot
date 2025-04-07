"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Message } from "@/types";
import { motion } from "framer-motion";
import { sendChatMessage, checkApiAvailability } from "@/utils/apiHelpers";
import getFallbackResponse from "@/utils/fallbackResponses";

// Import chat components individually to avoid case sensitivity issues
import MessageList from "./chat/MessageList";
import ChatInput from "./chat/ChatInput";
import ConnectionStatus from "./ConnectionStatus";

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

  // Add this function just before handleApiMessage
  const retryWithBackoff = async (
    fn: () => Promise<any>,
    retries = 2,
    delay = 1000,
    backoffFactor = 2
  ): Promise<any> => {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }

      console.log(`Retrying operation. Retries left: ${retries}. Waiting ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));

      return retryWithBackoff(fn, retries - 1, delay * backoffFactor, backoffFactor);
    }
  };

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

        // Send message to API with retry mechanism
        const responseData = await retryWithBackoff(
          () => sendChatMessage(messageText),
          2, // Number of retries
          1000 // Initial delay in ms
        );

        // Add the API response to messages
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: responseData.content },
        ]);

        // Reset error state on successful response
        setHasError(false);
      } catch (error) {
        console.error("Error sending message:", error);

        // Set error state
        setHasError(true);

        // Create a user-friendly error message
        let errorMessage = "I'm having trouble connecting to the server.";

        // Add more specific details based on the error
        if (error.message && error.message.includes("timeout")) {
          errorMessage = "The request timed out. The server took too long to respond.";
        } else if (error.message && error.message.includes("NetworkError")) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (error.message && error.message.includes("API key")) {
          errorMessage = "Server configuration issue: Missing API key. Please contact support.";
        } else {
          errorMessage =
            "I'm having trouble processing your request. This might be a temporary issue.";
        }

        // Try to generate a fallback response
        const fallbackContent = getFallbackResponse(messageText);

        // Add error message and fallback response to chat
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content: `${errorMessage}\n\n${fallbackContent}`,
          },
        ]);

        // Show error toast with troubleshooting steps
        toast.error(
          "Connection issue. Please try refreshing the page or checking your internet connection.",
          {
            duration: 5000,
          }
        );
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
        <div className="hidden sm:block">
          <ConnectionStatus
            status={
              apiStatus.checked ? (apiStatus.available ? "connected" : "disconnected") : "checking"
            }
            message={apiStatus.message}
          />
        </div>
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
