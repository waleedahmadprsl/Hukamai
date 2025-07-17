# Hukam Image Generations

## Overview

Hukam Image Generations is a full-stack AI image generation web application that leverages the Together AI Flux model to create high-quality images from text prompts. The application features a modern glassmorphism design with soft colors, built using React for the frontend and Node.js/Express for the backend. The application is configured for deployment on Render.com with external PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query (@tanstack/react-query) for server state and React hooks for local state
- **File Handling**: JSZip for creating ZIP archives and file-saver for downloads
- **HTTP Client**: Axios for API requests with custom query client wrapper

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Render PostgreSQL (external database with SSL support)
- **API Structure**: RESTful API with JSON responses
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Development**: Hot reload with Vite middleware integration
- **CORS**: Global CORS configuration for development and production deployment

## Key Components

### Database Schema
- **Users**: User authentication and management
- **Generated Images**: Storage of generated image metadata and URLs
- **API Key Status**: Tracking of Together AI API key health and usage
- **Prompt History**: Historical record of user prompts

### Together AI Service
- **Multi-key Management**: Round-robin rotation across 4 API keys
- **Failure Handling**: Automatic failover with cooldown periods
- **Rate Limiting**: Built-in retry logic for rate-limited requests
- **Model Configuration**: Uses FLUX.1-schnell-Free model with optimized parameters (768x768, 4 steps)

### Frontend Features
- **Prompt Input**: Multi-line text input with template suggestions and file upload
- **Batch Generation**: Support for generating up to 500 images with configurable delays
- **Progress Tracking**: Real-time progress indicators with time estimates
- **Image Gallery**: Grid and list view modes for generated images
- **Download System**: Individual image downloads and bulk ZIP downloads
- **Settings Panel**: Custom API key configuration and preferences

## Data Flow

1. **Image Generation Request**: User submits prompt through frontend
2. **API Processing**: Backend receives request and adds to prompt history
3. **AI Service Call**: Together AI service selects available API key and makes request
4. **Response Handling**: Image URL returned and stored in database
5. **Frontend Update**: New image displayed in gallery with download options
6. **Bulk Operations**: Multiple images can be processed sequentially with delays

## External Dependencies

### Third-Party Services
- **Together AI**: Primary image generation service using Flux model
- **Neon Database**: Serverless PostgreSQL hosting

### Key Libraries
- **Frontend**: React, Vite, Tailwind CSS, Radix UI, React Query, JSZip
- **Backend**: Express, Drizzle ORM, Axios, CORS
- **Database**: PostgreSQL driver (@neondatabase/serverless)

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Production bundling for server code
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` script

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string - now configured for Render PostgreSQL database
- **NODE_ENV**: Environment mode (development/production)
- **TOGETHER_AI_KEY_1 to TOGETHER_AI_KEY_4**: Together AI API keys (fallback to hardcoded keys if not provided)
- **Frontend Domain**: Configurable CORS origins for production deployment on Render

### Production Setup
- **Server**: Node.js serving both API routes and static frontend
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Sessions**: PostgreSQL-backed session storage
- **CORS**: Configured for cross-origin requests

### Development Features
- **Hot Reload**: Vite middleware for instant frontend updates
- **Error Handling**: Runtime error overlay in development
- **Logging**: Request/response logging for API endpoints
- **Type Safety**: Shared schema types between frontend and backend

The application is designed to be easily deployable on platforms like Replit, with automatic database provisioning and minimal configuration required.