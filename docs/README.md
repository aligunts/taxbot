# TaxTalkie - AI Tax Assistant

TaxTalkie is an AI-powered chatbot that helps users with tax-related questions. It provides instant, accurate responses while maintaining a professional and helpful demeanor.

## Features

- Real-time AI responses to tax-related questions
- Modern, responsive user interface
- Smooth animations and transitions
- Professional and accurate tax information
- Fallback recommendations for complex cases

## Prerequisites

- Node.js 18+ installed
- OpenAI API key

## Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd taxtalkie
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Repository Structure

This repository contains multiple applications. For details about the codebase structure and recent cleanup efforts, please see [CODEBASE_STRUCTURE.md](./CODEBASE_STRUCTURE.md).

## Technology Stack

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- OpenAI API
- Framer Motion for animations
- React Hot Toast for notifications

## Usage

Simply type your tax-related question in the chat input and press Enter or click the Send button. The AI will respond with relevant information and guidance.

## Important Note

This AI assistant provides general tax information and guidance. For specific tax situations or legal advice, please consult with a qualified tax professional or legal advisor.

## License

MIT

## Code Organization and Optimizations

### Recent Optimizations

- **Removed Debug Statements**: Debug console.log statements have been removed from production code to improve performance.
- **Organized Test Files**: Moved development test files to `src/tests/legacy` to reduce root directory clutter.
- **Enhanced Code Structure**: Improved VAT exemption detection with better pattern matching and confidence scoring.
- **Code Cleanliness**: Removed redundant code patterns and improved structure without affecting functionality.

### Code Structure

- **Main Application**: The main application code is in the `src` directory.
- **Components**: React components are located in `src/components`.
- **Tests**: Organized test files in `src/tests` with legacy tests in `src/tests/legacy`.
- **Documentation**: Documentation files are in the project root.

### Development Notes

When working on this project, please follow these practices:

- Keep the root directory clean by placing test files in appropriate test directories
- Remove debug console.log statements before committing code to production
- Use typescript types consistently throughout the codebase
- Update documentation when making significant changes
- Run code formatting before committing using `npm run format`

### Code Formatting

This project uses Prettier for code formatting. The configuration is in `.prettierrc`.

To format the code manually, run:

```bash
npm run format
```

To check if files are formatted without changing them:

```bash
npm run format:check
```

Formatting will automatically run on Git commits thanks to Husky and lint-staged.
