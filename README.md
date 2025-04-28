# IP Management Web Application with GDPR-Compliant Blockchain Integration

A secure, scalable web application for managing intellectual property assets with blockchain technology for immutable timestamping, proof of existence, ownership tracking, and licensing via smart contracts.

## Project Overview

This application provides creators, inventors, and organizations with a reliable, transparent, and user-friendly platform to register intellectual property, manage ownership records, track history, and securely license their assets while ensuring GDPR compliance.

## Key Features

- **User Authentication & Role Management**: Secure user accounts with role-based permissions
- **IP Registration**: Register new IP assets with file handling and blockchain timestamping
- **IP Dashboard & Viewing**: Browse, search, and visualize IP assets and their status
- **Proof of Existence & Ownership**: Verify IP authenticity through blockchain integration
- **Ownership Transfer**: Transfer IP ownership with secure blockchain-backed records
- **Licensing Module**: Create and manage licensing agreements for IP assets
- **GDPR Compliance**: Data protection features including right to be forgotten

## Technical Architecture

The application is built with a modern full-stack JavaScript architecture:

- **Frontend**: React with TailwindCSS and shadcn/ui components
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Blockchain**: Ethereum-compatible network (local development via Ganache)
- **Decentralized Storage**: IPFS for distributed file storage
- **Authentication**: Passport.js with session-based auth
- **Containerization**: Docker and Docker Compose

## File Structure

```
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # React UI components
│   │   ├── contracts/      # Smart contract source code and ABIs
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and services
│   │   ├── pages/          # Application pages
│   │   ├── App.tsx         # Main React component
│   │   ├── index.css       # Global styles
│   │   └── main.tsx        # Application entry point
│   └── index.html          # HTML template
├── server/                 # Backend application
│   ├── auth.ts             # Authentication implementation
│   ├── blockchain.ts       # Blockchain integration services
│   ├── db.ts               # Database connection and configuration
│   ├── index.ts            # Server entry point
│   ├── ipfs.ts             # IPFS integration services
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data access layer
│   └── vite.ts             # Vite server configuration
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema and type definitions
├── docker-compose.yml      # Production Docker configuration
├── docker-compose.dev.yml  # Development Docker configuration
├── Dockerfile              # Production Docker build
├── Dockerfile.dev          # Development Docker build
└── .env.example            # Example environment variables
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 14.x or higher
- Docker and Docker Compose (for containerized setup)

### Local Development Setup

1. Clone the repository
2. Copy the `.env.example` file to `.env` and configure the environment variables:
   ```
   cp .env.example .env
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Access the application at http://localhost:5000

### Docker Development Environment

1. Clone the repository
2. Copy the `.env.example` file to `.env` and configure the environment variables
3. Start the docker development environment:
   ```
   docker-compose -f docker-compose.dev.yml up
   ```
4. Access the application at http://localhost:5000

### Production Deployment

1. Configure the environment variables in `.env`
2. Build and start the production services:
   ```
   docker-compose up -d
   ```
3. Access the application at http://localhost:5000

## System Architecture

The application follows a layered architecture:

1. **Presentation Layer** (client): React components and pages
2. **API Layer** (server/routes.ts): RESTful endpoints
3. **Service Layer** (server/*.ts): Business logic and external service integration
4. **Data Access Layer** (server/storage.ts): Database operations
5. **Database Layer**: PostgreSQL with Drizzle ORM for persistent storage
6. **Blockchain Layer**: Smart contracts deployed on Ethereum-compatible network
7. **Decentralized Storage**: IPFS for file storage

## Smart Contract Architecture

The system uses four main smart contracts:

1. **Registry Contract**: Maps asset IDs to metadata and ownership information
2. **Ownership Contract**: Manages ownership records and transfers
3. **GDPR Compliance Module**: Handles data minimization and right to be forgotten
4. **Licensing Contract**: Manages template-based licensing agreements

## GDPR Compliance Features

- **Data Minimization**: Only stores hashes on the blockchain
- **Right to be Forgotten**: Logical deletion preserving chain integrity
- **Data Portability**: Export personal data in structured format
- **Consent Management**: Explicit consent for all data processing
- **Privacy by Design**: Access controls and pseudonymization

## Health Monitoring

The application includes a health endpoint at `/api/health` that monitors:
- Database connection
- IPFS connection
- Blockchain connection

## License

This project is licensed under the MIT License - see the LICENSE file for details.