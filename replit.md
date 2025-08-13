# Overview

This is a RAG (Retrieval Augmented Generation) application that enables users to upload documents, process them into searchable chunks with vector embeddings, and query them using natural language. The system combines document processing, vector similarity search, and OpenAI's language models to provide intelligent answers based on uploaded content.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Dashboard-based single page application with modular components for document upload, query interface, analytics, and document library

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for document upload, querying, and analytics
- **File Processing**: Multer for handling file uploads with support for PDF and TXT files
- **Document Processing**: Text extraction and chunking with configurable chunk sizes and overlap
- **Vector Store**: In-memory vector similarity search using cosine similarity
- **Storage**: Dual storage implementation with in-memory storage as default and database schema ready for PostgreSQL

## Data Storage
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Design**: Three main entities - documents, document chunks, and queries
- **Vector Storage**: Embeddings stored as arrays in the database with in-memory similarity search
- **File Storage**: Local file system for uploaded documents

## AI/ML Integration
- **Embedding Model**: OpenAI's text-embedding-3-small for generating vector representations
- **Language Model**: GPT-4o for generating contextual answers
- **Vector Search**: Custom cosine similarity implementation for finding relevant document chunks
- **Context Assembly**: Retrieval of top-K similar chunks to provide context for answer generation

## Authentication & Security
- **File Validation**: Strict file type checking (PDF/TXT only) and size limits (10MB)
- **Input Sanitization**: Basic validation through Zod schemas
- **CORS**: Configured for cross-origin requests with credentials

## Development & Build
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **TypeScript**: Strict type checking across the entire codebase
- **Path Mapping**: Configured aliases for clean imports (@, @shared, @assets)
- **Hot Reload**: Development server with HMR for rapid iteration

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for Neon
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **express**: Web application framework for Node.js
- **multer**: Middleware for handling multipart/form-data file uploads

## AI/ML Services
- **OpenAI API**: Text embedding generation and language model inference
- **Custom Vector Store**: In-memory cosine similarity search implementation

## UI Component Libraries
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **cmdk**: Command palette component

## Development Tools
- **tsx**: TypeScript execution for Node.js
- **vite**: Frontend build tool and development server
- **esbuild**: Fast JavaScript bundler for backend compilation
- **drizzle-kit**: Database migration and introspection tool

## Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: URL-safe unique string ID generator
- **zod**: Runtime type validation and schema definition