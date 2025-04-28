# Deployment Guide

This document provides detailed information on deploying the IP Management Web Application in various environments.

## Docker Containerization

The application is fully containerized using Docker, making it easy to deploy in any environment that supports Docker and Docker Compose.

### Container Architecture

The application uses a multi-container architecture with the following services:

1. **App Service**: The main application container running both frontend and backend
2. **PostgreSQL**: Database service for persistent storage
3. **IPFS Node**: Decentralized storage for IP asset files
4. **Ganache**: Local Ethereum blockchain for development and testing

### Network Configuration

The Docker Compose setup creates an isolated network for all services to communicate securely:

- All services connect via the `app-network` bridge network
- Only necessary ports are exposed to the host machine
- Internal service discovery is handled via container names as hostnames

### Data Persistence

The following volumes are configured for data persistence:

- **postgres-data**: PostgreSQL database files
- **ipfs-data**: IPFS repository data
- **ipfs-staging**: IPFS staging area for uploads
- **blockchain-data**: Blockchain state and transaction history
- **logs**: Application logs

## Local Deployment

### Prerequisites

- Docker Engine (20.10+)
- Docker Compose (2.0+)
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space

### Steps

1. Clone the repository to your local machine
2. Create an `.env` file from the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Update the environment variables in `.env` as needed
4. Start the services in production mode:
   ```bash
   docker-compose up -d
   ```
   Or for development mode:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```
5. Monitor the logs:
   ```bash
   docker-compose logs -f app
   ```
6. Access the application at `http://localhost:5000`

### Environment Variables

The following environment variables are required:

| Variable | Description | Default |
|----------|-------------|---------|
| `PGUSER` | PostgreSQL username | `ipchain` |
| `PGPASSWORD` | PostgreSQL password | `ipchain_password` |
| `PGDATABASE` | PostgreSQL database name | `ipchain_db` |
| `PGHOST` | PostgreSQL hostname | `postgres` |
| `PGPORT` | PostgreSQL port | `5432` |
| `DATABASE_URL` | PostgreSQL connection URL | Generated from above variables |
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Application port | `5000` |
| `SESSION_SECRET` | Secret for session encryption | `ipchain_session_secret` |
| `IPFS_API_URL` | IPFS API endpoint | `http://ipfs:5001` |
| `IPFS_GATEWAY_URL` | IPFS Gateway URL | `http://ipfs:8080` |
| `BLOCKCHAIN_NODE_URL` | Ethereum node URL | `http://ganache:8545` |
| `BLOCKCHAIN_PRIVATE_KEY` | Private key for contract deployment | Example key (for development only) |

## Production Deployment Considerations

For production environments, consider the following additional steps:

### Security

1. **Strong Passwords**: Change all default passwords in the `.env` file
2. **HTTPS**: Configure a reverse proxy (like Nginx) with SSL/TLS certificates
3. **Firewalls**: Restrict access to only necessary ports
4. **Ethereum Node**: Connect to a trusted Ethereum node instead of local Ganache

### Scaling

1. **Database**: Consider using a managed PostgreSQL service
2. **IPFS**: Connect to an IPFS cluster or pinning service for reliability
3. **Load Balancing**: Add a load balancer for horizontal scaling

### Monitoring

1. Configure monitoring tools to track system health
2. Set up alerts for any service disruptions
3. Regularly check the application health endpoint at `/api/health`

### Backups

1. Configure regular database backups
2. Ensure IPFS data is properly replicated
3. Back up blockchain private keys securely

## Cloud Deployment Options

### AWS

1. Use ECS or EKS for container orchestration
2. Store environment variables in AWS Secrets Manager
3. Use RDS for PostgreSQL database
4. Consider using Infura or AWS Managed Blockchain for Ethereum connectivity

### Azure

1. Deploy using Azure Container Instances or AKS
2. Use Azure Key Vault for secrets
3. Azure Database for PostgreSQL for database services
4. Connect to Azure Blockchain Service for Ethereum

### Google Cloud

1. Deploy using Google Cloud Run or GKE
2. Use Secret Manager for environment variables
3. Cloud SQL for PostgreSQL database
4. Connect to a managed Ethereum node service

## Troubleshooting

### Container Startup Issues

Check container logs:
```bash
docker-compose logs -f <service-name>
```

Verify environment variables:
```bash
docker-compose config
```

### Database Connection Issues

Check database logs:
```bash
docker-compose logs -f postgres
```

Verify database credentials in `.env` file.

### Blockchain Connection Issues

Check Ganache logs:
```bash
docker-compose logs -f ganache
```

Verify blockchain connection by accessing Ganache JSON-RPC API:
```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545
```

### IPFS Connection Issues

Check IPFS logs:
```bash
docker-compose logs -f ipfs
```

Verify IPFS is running correctly:
```bash
curl http://localhost:5001/api/v0/version
```