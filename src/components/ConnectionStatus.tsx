import React from "react";
import { motion } from "framer-motion";

type ConnectionStatusProps = {
  status: "connected" | "disconnected" | "checking";
  message?: string;
};

export default function ConnectionStatus({ status, message }: ConnectionStatusProps) {
  const colors = {
    connected: "bg-green-500",
    disconnected: "bg-red-500",
    checking: "bg-yellow-500",
  };

  const statusText = {
    connected: "Connected to server",
    disconnected: "Disconnected from server",
    checking: "Checking connection...",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2 text-xs p-2 rounded-md bg-gray-100"
    >
      <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
      <span className="font-medium">{statusText[status]}</span>
      {message && <span className="text-gray-500">({message})</span>}
    </motion.div>
  );
}
