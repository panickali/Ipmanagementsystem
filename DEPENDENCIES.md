# Dependencies Documentation

This document lists all dependencies used in the IP Management Web Application with their versions and purposes.

## Core Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| express | ^4.18.2 | Web framework for Node.js |
| react | ^18.2.0 | UI library |
| react-dom | ^18.2.0 | React DOM bindings |
| typescript | ^5.3.3 | TypeScript language support |
| vite | ^5.0.12 | Frontend build tool and dev server |

## Database

| Dependency | Version | Purpose |
|------------|---------|---------|
| @neondatabase/serverless | ^0.6.0 | PostgreSQL client optimized for serverless |
| drizzle-orm | ^0.29.0 | TypeScript ORM |
| drizzle-zod | ^0.5.1 | Zod schema generator for Drizzle |
| zod | ^3.22.4 | TypeScript-first schema validation |
| drizzle-kit | ^0.20.4 | Drizzle CLI for migrations |

## Authentication & Session Management

| Dependency | Version | Purpose |
|------------|---------|---------|
| passport | ^0.7.0 | Authentication middleware for Node.js |
| passport-local | ^1.0.0 | Username/password authentication strategy |
| express-session | ^1.17.3 | Session middleware for Express |
| connect-pg-simple | ^9.0.0 | PostgreSQL session store for Express |
| memorystore | ^1.6.7 | In-memory session store (for development) |

## Routing & Client-Side Data Fetching

| Dependency | Version | Purpose |
|------------|---------|---------|
| wouter | ^2.12.1 | Tiny router for React |
| @tanstack/react-query | ^5.14.1 | Data fetching and state management |

## UI Components & Styling

| Dependency | Version | Purpose |
|------------|---------|---------|
| tailwindcss | ^3.4.1 | Utility-first CSS framework |
| @tailwindcss/typography | ^0.5.10 | Typography plugin for Tailwind |
| tailwindcss-animate | ^1.0.7 | Animation utilities for Tailwind |
| clsx | ^2.0.0 | Utility for constructing className strings |
| class-variance-authority | ^0.7.0 | Create UI component variants |
| tailwind-merge | ^2.2.0 | Merge Tailwind CSS classes |
| @radix-ui/* | Various | Unstyled, accessible UI component primitives |
| lucide-react | ^0.299.0 | Icon library |
| react-icons | ^4.12.0 | Icon library |
| framer-motion | ^10.16.16 | Animation library |
| date-fns | ^2.30.0 | Date utility library |
| react-day-picker | ^8.9.1 | Date picker component |
| recharts | ^2.10.3 | Charting library |

## Form Handling

| Dependency | Version | Purpose |
|------------|---------|---------|
| react-hook-form | ^7.49.2 | Form handling |
| @hookform/resolvers | ^3.3.2 | Validation resolver for react-hook-form |

## Blockchain Integration

| Dependency | Version | Purpose |
|------------|---------|---------|
| ethers | ^6.9.0 | Ethereum library |

## IPFS Integration

| Dependency | Version | Purpose |
|------------|---------|---------|
| ipfs-http-client | ^60.0.1 | IPFS HTTP client |

## File Handling

| Dependency | Version | Purpose |
|------------|---------|---------|
| multer | ^1.4.5-lts.1 | Middleware for handling multipart/form-data |

## Development Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| @types/express | ^4.17.21 | TypeScript types for Express |
| @types/express-session | ^1.17.10 | TypeScript types for express-session |
| @types/node | ^20.10.5 | TypeScript types for Node.js |
| @types/passport | ^1.0.16 | TypeScript types for Passport |
| @types/passport-local | ^1.0.38 | TypeScript types for passport-local |
| @types/react | ^18.2.45 | TypeScript types for React |
| @types/react-dom | ^18.2.18 | TypeScript types for React DOM |
| @types/ws | ^8.5.10 | TypeScript types for WebSockets |
| @types/connect-pg-simple | ^7.0.3 | TypeScript types for connect-pg-simple |
| @vitejs/plugin-react | ^4.2.1 | Vite plugin for React |
| tsx | ^4.7.0 | TypeScript execution environment |
| esbuild | ^0.19.10 | JavaScript bundler |
| postcss | ^8.4.32 | CSS transformation tool |
| autoprefixer | ^10.4.16 | PostCSS plugin for vendor prefixes |

## Container Dependencies

The Docker setup uses the following images:

- **Node.js**: 20-alpine
- **PostgreSQL**: 14-alpine
- **IPFS**: ipfs/kubo:latest
- **Ethereum**: trufflesuite/ganache:latest

## Installation

All JavaScript dependencies are listed in `package.json` and can be installed with:

```bash
npm install
```

Docker dependencies are automatically pulled when running:

```bash
docker-compose up
```

## Dependency Graph

The major dependency relationships in the application:

```
Application
├── Frontend (React)
│   ├── UI (TailwindCSS, Radix UI)
│   ├── Routing (Wouter)
│   ├── Data Fetching (React Query)
│   ├── Forms (React Hook Form + Zod)
│   └── API Clients
│       ├── Blockchain Client (ethers.js)
│       └── IPFS Client (ipfs-http-client)
│
├── Backend (Express)
│   ├── Authentication (Passport.js)
│   ├── Session Management (express-session)
│   ├── File Handling (Multer)
│   ├── Database Access (Drizzle ORM)
│   └── External Services
│       ├── Blockchain Service (ethers.js)
│       └── IPFS Service (ipfs-http-client)
│
└── Infrastructure (Docker)
    ├── Application Server (Node.js)
    ├── Database (PostgreSQL)
    ├── Blockchain Node (Ganache)
    └── IPFS Node (Kubo)
```