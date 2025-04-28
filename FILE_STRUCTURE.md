# File Structure Documentation

This document provides a detailed explanation of the file structure in the IP Management Web Application.

## Overview

The application follows a modern full-stack JavaScript architecture with clear separation of concerns:

- `/client`: Frontend React application
- `/server`: Backend Express API and services
- `/shared`: Shared code between frontend and backend
- Docker configuration files in the root directory

## Root Directory

```
/
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore configuration
├── Dockerfile                 # Production Docker build configuration
├── Dockerfile.dev             # Development Docker build configuration
├── README.md                  # Project overview and setup instructions
├── DEPLOYMENT.md              # Detailed deployment guide
├── FILE_STRUCTURE.md          # This file structure documentation
├── components.json            # shadcn/ui components configuration
├── docker-compose.dev.yml     # Development Docker Compose configuration
├── docker-compose.yml         # Production Docker Compose configuration
├── drizzle.config.ts          # Drizzle ORM configuration
├── package.json               # Project dependencies and scripts
├── package-lock.json          # Locked dependencies
├── postcss.config.js          # PostCSS configuration for Tailwind
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite bundler configuration
```

## Client Directory

```
/client/
├── index.html                 # HTML entry point
└── src/                       # Source code
    ├── components/            # Reusable React components
    │   ├── AppFooter.tsx      # Application footer component
    │   ├── AppHeader.tsx      # Application header with navigation
    │   ├── BlockchainStatus.tsx  # Blockchain connection status component
    │   ├── DashboardStats.tsx # Dashboard statistics component
    │   ├── GDPRCompliance.tsx # GDPR compliance information component
    │   ├── IPAssetsList.tsx   # IP assets listing component
    │   ├── QuickActions.tsx   # Dashboard quick action buttons
    │   ├── SmartContractPanel.tsx # Smart contract interaction panel
    │   ├── modals/            # Modal dialog components
    │   │   ├── CreateLicenseModal.tsx   # License creation modal
    │   │   ├── RegisterIPModal.tsx      # IP registration modal
    │   │   └── TransferOwnershipModal.tsx # Ownership transfer modal
    │   └── ui/                # shadcn/ui components (imported from library)
    ├── contracts/             # Smart contract code and ABIs
    │   ├── IPRegistry.sol     # IP Registry smart contract
    │   ├── LicensingContract.sol # Licensing smart contract
    │   ├── OwnershipContract.sol # Ownership management contract
    │   └── GDPRCompliance.sol # GDPR compliance contract
    ├── hooks/                 # Custom React hooks
    │   ├── use-auth.tsx       # Authentication hook
    │   ├── use-mobile.tsx     # Responsive design hook
    │   └── use-toast.ts       # Toast notification hook
    ├── lib/                   # Utility and service functions
    │   ├── blockchain.ts      # Blockchain integration services
    │   ├── ipfs.ts            # IPFS integration services
    │   ├── protected-route.tsx # Route protection component
    │   ├── queryClient.ts     # React Query configuration
    │   └── utils.ts           # General utility functions
    ├── pages/                 # Application pages
    │   ├── auth-page.tsx      # Authentication page (login/register)
    │   ├── home-page.tsx      # Dashboard/home page
    │   ├── ip-details-page.tsx # IP asset details page
    │   └── not-found.tsx      # 404 page
    ├── App.tsx                # Main React component with routing
    ├── index.css              # Global styles and Tailwind imports
    └── main.tsx               # Application entry point
```

## Server Directory

```
/server/
├── auth.ts                    # Authentication implementation
├── blockchain.ts              # Blockchain interaction services
├── db.ts                      # Database connection configuration
├── index.ts                   # Server entry point
├── ipfs.ts                    # IPFS interaction services
├── routes.ts                  # API route definitions
├── storage.ts                 # Data access layer
└── vite.ts                    # Vite server configuration
```

## Shared Directory

```
/shared/
└── schema.ts                  # Database schema and shared types
```

## Key File Descriptions

### Backend (Server) Files

- **index.ts**: The main entry point for the Express server, configures middleware and starts the HTTP server.
- **auth.ts**: Implements authentication using Passport.js with local strategy, session management, and secure password handling.
- **blockchain.ts**: Provides services for interacting with blockchain smart contracts including registering IP, transferring ownership, creating licenses, and verifying ownership.
- **db.ts**: Configures the database connection using Drizzle ORM with PostgreSQL.
- **ipfs.ts**: Implements IPFS integration services for decentralized file storage.
- **routes.ts**: Defines all API endpoints with proper authentication and request validation.
- **storage.ts**: Implements the data access layer following the repository pattern, with methods for CRUD operations on all entities.
- **vite.ts**: Configures the Vite development server for serving the frontend application.

### Frontend (Client) Files

- **App.tsx**: The main React component that sets up routing using Wouter.
- **main.tsx**: The application entry point that renders the root React component with all required providers.
- **index.css**: Global styles and Tailwind CSS imports.

#### Components
- **AppHeader.tsx**: The application header with navigation menu and user information.
- **BlockchainStatus.tsx**: Displays the current status of blockchain and IPFS connections.
- **DashboardStats.tsx**: Shows summary statistics of IP assets and transactions.
- **IPAssetsList.tsx**: Displays a list of IP assets with filtering and sorting.
- **modals/*.tsx**: Modal components for various actions like registering IP, transferring ownership, and creating licenses.

#### Hooks
- **use-auth.tsx**: Custom hook for authentication state and operations.
- **use-mobile.tsx**: Hook for responsive design detection.
- **use-toast.ts**: Hook for displaying toast notifications.

#### Library Files
- **blockchain.ts**: Client-side services for blockchain interactions.
- **ipfs.ts**: Client-side services for IPFS interactions.
- **protected-route.tsx**: Higher-order component for route protection.
- **queryClient.ts**: Configures React Query for data fetching.

#### Pages
- **auth-page.tsx**: Authentication page with login and registration forms.
- **home-page.tsx**: Dashboard page showing IP assets, statistics, and actions.
- **ip-details-page.tsx**: Detailed view of an IP asset with history and actions.

### Shared Files

- **schema.ts**: Defines the database schema using Drizzle ORM and creates shared TypeScript types that are used in both frontend and backend.

## Docker Configuration Files

- **Dockerfile**: Multi-stage production build configuration for the application.
- **Dockerfile.dev**: Development build configuration with hot-reloading.
- **docker-compose.yml**: Production container orchestration with proper networking and volume configuration.
- **docker-compose.dev.yml**: Development container orchestration with volume mounts for live code changes.

## Configuration Files

- **drizzle.config.ts**: Configures Drizzle ORM database schema migrations.
- **components.json**: Configuration for shadcn/ui components.
- **tailwind.config.ts**: Tailwind CSS configuration with theme settings.
- **vite.config.ts**: Configures the Vite bundler with plugins and alias paths.
- **tsconfig.json**: TypeScript compiler configuration with path aliases.