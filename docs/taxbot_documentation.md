# Taxbot Technical Documentation

## Overview

Taxbot is a specialized AI assistant focused on Nigerian tax regulations and policies, built using Next.js, TypeScript, and the Mistral AI API. The application provides real-time tax information, calculations, and guidance while ensuring accuracy through multiple validation layers.

## Core Components

### 1. Main Chat Interface (`Chat.tsx`)

- Built as a React functional component using TypeScript
- Uses React hooks for state management:
  - `useState` for messages and input handling
  - `useRef` for automatic scrolling
  - `useEffect` for scroll behavior

### 2. Message Handling

```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
}
```

- Messages are stored in state as an array of Message objects
- Each message has a role ('user' or 'assistant') and content

### 3. Key Features

#### A. VAT Exemption Checking

- Implements a pre-processing check for VAT-exempt items
- Uses a comprehensive list of exempted items including:
  - Basic food items (rice, beans, etc.)
  - Medical products
  - Educational materials
  - Baby products
  - Agricultural equipment

#### B. Response Processing System

The processAIResponse function provides multiple layers of validation:

1. Exemption validation
2. Calculation verification
3. Monetary value formatting
4. Generic response enhancement
5. Markdown formatting preservation

#### C. Non-Tax Query Filtering

- Maintains a list of non-tax keywords
- Prevents non-tax queries from reaching the API
- Provides appropriate rejection messages

### 4. User Interface Elements

#### A. Welcome Section

- Greeting message
- Purpose statement
- Example questions for user guidance

#### B. Message Display

- Distinct styling for user and assistant messages
- Markdown rendering for assistant responses
- Automatic scrolling to latest messages

#### C. Input Section

- Text input field
- Submit button with icon
- Example buttons for common queries

### 5. API Integration

#### A. Request Handling

- POST requests to '/api/chat'
- JSON payload with message history
- Error handling for various response types

#### B. Response Processing

- JSON parsing
- Content-type verification
- Error state management

### 6. Error Handling

#### A. Client-side Errors

- Input validation
- Non-tax query detection
- Network error handling
- Response format validation

#### B. Response Processing Errors

- Calculation verification
- Format correction
- Fallback responses

### 7. Formatting Features

#### A. Monetary Values

- Consistent Naira (₦) symbol usage
- Proper decimal formatting
- Thousands separators
- Special handling for list items

#### B. Markdown Support

- Headers for sections
- Lists for steps and items
- Bold text for emphasis
- Code blocks for calculations

### 8. Performance Optimizations

#### A. Client-side Processing

- Local exemption checking
- Response formatting
- Immediate feedback for known cases

#### B. State Management

- Efficient message updates
- Optimized rendering
- Controlled input handling

## Implementation Best Practices

### 1. Type Safety

- TypeScript interfaces for messages
- Strict type checking
- Proper error typing

### 2. Code Organization

- Modular function structure
- Clear separation of concerns
- Consistent naming conventions

### 3. User Experience

- Loading states
- Error feedback
- Smooth scrolling
- Responsive design

### 4. Maintainability

- Well-commented code
- Consistent formatting
- Modular structure
- Clear function purposes

## Future Enhancement Possibilities

1. **Expanded Exemption Database**

   - More comprehensive item list
   - Regular updates from tax authorities
   - Category-based organization

2. **Advanced Calculation Features**

   - Complex tax scenarios
   - Multiple tax type handling
   - Historical rate comparison

3. **Enhanced User Interface**

   - More interactive examples
   - Visual aids for calculations
   - Progressive disclosure of features

4. **Improved Error Handling**
   - More specific error messages
   - Guided error recovery
   - Better feedback mechanisms

## Conclusion

Taxbot represents a sophisticated implementation of an AI-powered tax assistant, combining modern web technologies with specialized domain knowledge. Its architecture ensures accuracy, usability, and maintainability while providing a robust platform for future enhancements.
