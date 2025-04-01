# Taxbot - Tax Assistant Chatbot

## Overview

Taxbot is a modern, responsive web application that serves as a tax assistant chatbot, focusing on Nigerian tax regulations. The application is built with Next.js and React, utilizing TypeScript for type safety and TailwindCSS for styling.

## Technology Stack

- **Frontend Framework**: Next.js 14.0.0
- **UI Library**: React 18.2.0
- **Styling**: TailwindCSS with custom configurations
- **Language**: TypeScript
- **Animation**: Framer Motion
- **AI Integration**: MistralAI API
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Component Structure**: Modular React components

## Project Structure

```
src/
├── app/                   # Next.js app directory (app router)
│   ├── api/               # API routes
│   │   ├── chat/          # Chat API endpoint
│   │   ├── test/          # Test endpoints
│   │   └── ...
│   ├── globals.css        # Global CSS
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── chat/              # Chat-related components
│   │   ├── ChatInput.tsx  # Chat input box
│   │   ├── MessageList.tsx# Message display component
│   │   └── ...
│   ├── Chat.tsx           # Main chat container
│   ├── ErrorBoundary.tsx  # Error handling component
│   └── TaxCalculator.tsx  # Tax calculation component
├── services/              # Service layers
│   └── chatService.ts     # Chat API service
├── utils/                 # Utility functions
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
└── shared/                # Shared resources
```

## Core Features

### 1. Chat Interface

The application provides a modern chat interface where users can interact with the tax assistant. Key components include:

- **Chat.tsx**: Main chat container that manages message state and API interactions
- **ChatInput.tsx**: User input component with features like auto-resizing and keyboard shortcuts
- **MessageList.tsx**: Component that displays the conversation history

### 2. AI Integration

The app integrates with MistralAI's API to provide intelligent responses to tax-related questions:

- Route handler in `src/app/api/chat/route.ts` manages API communication
- Fallback responses are provided when the API is unavailable
- System prompt focuses the AI on Nigerian tax regulations

### 3. Error Handling

The application includes comprehensive error handling:

- **ErrorBoundary** component to catch and display UI errors
- Graceful degradation when API calls fail
- User-friendly error messages with toast notifications

### 4. Tax Calculation Utilities

The app includes utility functions for extracting and processing tax-relevant information:

- `extractNumbersFromMessage`: Extracts numeric values from chat messages
- `extractPriceAndQuantityFromMessage`: Parses more complex pricing and quantity patterns

## Development Setup

The project uses:
- ESLint and Prettier for code quality
- Husky for Git hooks
- PostCSS for CSS processing
- TailwindCSS plugins for enhanced styling capabilities

## API Integration

The chat functionality connects to MistralAI's API:
- Endpoint: `https://api.mistral.ai/v1/chat/completions`
- Model: `mistral-tiny`
- Authentication via API key stored in environment variables
- System prompt tailoring the assistant for Nigerian tax knowledge
- Request timeout handling and fallback responses

## UI/UX Features

- Responsive design that works on mobile and desktop
- Smooth animations using Framer Motion
- Clear visual feedback for loading states
- Modern gradient styling for headers
- Auto-scrolling chat interface

## Security Considerations

- Environment variables for API key management
- Client-side data validation
- Error handling to prevent exposing internal details

This documentation provides an overview of the Taxbot application structure and features. The codebase follows modern React patterns and best practices, making it maintainable and extensible. 