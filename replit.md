# Adam Fedorowicz Photography - Portfolio Website

## Overview

This is a full-stack photography portfolio website for Adam Fedorowicz Photography. The application features a public-facing portfolio site with gallery displays and an admin portal for content management. The system is built with modern web technologies including React, TypeScript, Express.js, and PostgreSQL with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom color scheme (white, black, gold accents)
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **File Uploads**: Multer middleware for photo upload handling
- **Storage**: In-memory storage with interface for future database integration
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Three main tables - galleries, photos, admin_settings
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Public Website Features
1. **Landing Page**: Full-screen hero image with overlay navigation
2. **Gallery Grid**: Four-column responsive grid displaying gallery previews
3. **Individual Galleries**: Full-screen photo display with vertical scrolling
4. **About Section**: Photography journey and career information
5. **Contact Form**: Inquiry form with project type selection
6. **Responsive Navigation**: Transforms from overlay to hamburger menu on scroll

### Admin Portal Features
1. **Password Protection**: Simple password authentication (default: 100301)
2. **Password Management**: Change admin password from within the portal
3. **Gallery Management**: Create, delete, and reorder galleries
4. **Photo Management**: Upload photos (single/bulk), delete, and drag-drop reordering
5. **Hero Image Selection**: Set any uploaded photo as the gallery's hero image for main page display
6. **File Upload System**: Supports JPEG, PNG, GIF, WebP with 50MB limit per file

### Gallery Structure
- Pre-configured galleries: Fashion, Beauty, Travel, Portrait, Conceptual
- Each gallery has name, slug, description, cover image, and order
- Photos are linked to galleries with order management

## Data Flow

1. **Public Access**: Users browse galleries and photos through REST API endpoints
2. **Admin Access**: Password-protected routes for content management
3. **File Upload**: Photos uploaded to `/uploads` directory, served statically
4. **Database Operations**: CRUD operations through storage interface
5. **Real-time Updates**: React Query invalidation for immediate UI updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component library
- **multer**: File upload handling
- **wouter**: Lightweight React router

### Development Tools
- **Vite**: Development server and build tool
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Production bundling for server code

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: ESBuild bundles server code to `dist/index.js`
- Static Assets: Uploaded photos served from `/uploads` directory

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)
- File system permissions for uploads directory

### Production Requirements
- Node.js runtime for Express server
- PostgreSQL database for data persistence
- File storage for uploaded photos
- Static file serving for built frontend assets

### Development Setup
- Single command development: `npm run dev`
- Database schema push: `npm run db:push`
- TypeScript checking: `npm run check`
- Hot module replacement via Vite integration