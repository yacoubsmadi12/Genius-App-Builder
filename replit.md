# Genius App Builder

## Overview

Genius App Builder is an AI-powered platform that generates complete Flutter mobile applications based on natural language prompts. Users can describe their app vision, select backend preferences (Firebase, Supabase, or Node.js), and receive fully functional Flutter projects with source code and optional APK files. The platform features a modern React frontend with TypeScript, Express.js backend, PostgreSQL database with Drizzle ORM, and Firebase authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern component-based UI using functional components and hooks
- **Vite Build System**: Fast development and optimized production builds with hot module replacement
- **Wouter Router**: Lightweight client-side routing for single-page application navigation
- **Shadcn/UI Components**: Pre-built accessible UI components with Radix UI primitives and Tailwind CSS styling
- **TanStack Query**: Server state management for API calls, caching, and data synchronization
- **Theme System**: Light/dark mode toggle with CSS custom properties for consistent theming

### Backend Architecture
- **Express.js Server**: RESTful API with middleware for logging, error handling, and file uploads
- **TypeScript**: Full type safety across server-side code with shared schemas
- **Modular Route Structure**: Organized API endpoints for authentication, app generation, and file management
- **Memory Storage Implementation**: In-memory data persistence with interface for future database integration
- **Middleware Pipeline**: Authentication, file upload (Multer), and request logging middleware

### Authentication System
- **Firebase Authentication**: Primary authentication provider supporting email/password and Google OAuth
- **JWT Token Management**: Client-side token storage and server-side validation
- **Protected Routes**: Route-level authentication guards for dashboard and generation features
- **User Context**: React context for global authentication state management

### App Generation Engine
- **OpenAI Integration**: GPT-based code generation for Flutter applications
- **Progress Tracking**: Real-time generation status updates with step-by-step progress indicators
- **Multi-Backend Support**: Template generation for Firebase, Supabase, and custom Node.js backends
- **File Management**: ZIP archive creation and download functionality for generated projects
- **Icon Generation**: AI-powered app icon creation or user upload support

### Database Schema
- **Users Table**: User profiles with Firebase UID mapping, email, name, and provider information
- **App Generations Table**: Generation requests with status tracking, prompts, backend choices, and result URLs
- **Subscriptions Table**: User subscription plans with usage limits and generation quotas
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect and migration support

### UI/UX Design Patterns
- **Component Composition**: Reusable UI components with consistent styling and behavior
- **Form Validation**: Client-side validation with error handling and user feedback
- **Loading States**: Progress indicators, skeletons, and loading animations throughout the application
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## External Dependencies

### Core Services
- **Firebase**: Authentication service for user management and OAuth providers
- **OpenAI API**: GPT model integration for Flutter code generation and app icon creation
- **PostgreSQL**: Primary database for user data, app generations, and subscriptions (configured via Neon)

### Development Tools
- **Vite**: Frontend build tool with React plugin and development server
- **Drizzle Kit**: Database migrations and schema management
- **TypeScript Compiler**: Type checking and transpilation across frontend and backend

### UI Libraries
- **Radix UI**: Accessible component primitives for modals, dropdowns, and form elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form state management with validation

### Utility Libraries
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing for single-page application navigation
- **Archiver**: ZIP file creation for downloadable Flutter projects
- **Multer**: File upload handling for app icons and assets
- **Date-fns**: Date manipulation and formatting utilities