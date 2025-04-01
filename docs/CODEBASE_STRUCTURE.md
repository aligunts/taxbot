# Codebase Structure Documentation

## Overview

This repository contains two main applications:

1. **Main App (TaxTalkie/Taxbot)**: A Next.js application for an AI-powered tax chatbot.
2. **Project App**: A Vite-based React application for tax management with multiple features.

## Main App (Root Directory)

- **Technology**: Next.js, TypeScript, Tailwind CSS
- **Purpose**: AI-powered chatbot for tax-related questions
- **Key Features**:
  - Real-time AI responses to tax questions
  - Modern, responsive user interface
  - Professional tax information delivery

## Project App (project/ Directory)

- **Technology**: Vite, React, TypeScript, Tailwind CSS
- **Purpose**: Comprehensive tax management application
- **Key Features**:
  - Dashboard
  - Tax Calculator
  - Document Upload
  - Tax Assistance
  - Payment Portal
  - ChatBot integration

## Codebase Cleanup

- **Removed Directories**:
  - `taxtalkie/`: This directory contained a duplicate implementation of the main app with just a default Next.js template. It was removed to simplify the codebase and avoid confusion.

## Development Guidelines

- The main application in the root directory is the primary focus for the TaxTalkie/Taxbot development.
- The project/ directory contains a separate application that serves related but distinct purposes.
- Consider whether these applications should eventually be merged or kept as separate projects.

## Next Steps

1. Continue to evaluate whether the Project application should remain in this repository or be moved to its own.
2. Ensure documentation remains up-to-date with any structural changes.
3. Consider implementing shared libraries if both applications need similar functionality. 