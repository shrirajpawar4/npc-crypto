## Features

- Real-time transaction monitoring via WebSocket
- Historical transaction retrieval and processing
- Account information fetching
- Transaction normalization and classification
- Robust error handling and logging

- Support for various transaction types
  - SOL transfers
  - Token transfers
  - NFT operations (mints, sales, transfers)

## Technologies

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Helius API](https://docs.helius.xyz/)

# Getting Started

### Prerequisites
- npm or yarn
- Helius API key
- Solana wallet address to monitor


### Installation
1. Clone the repository:
```bash
git clone https://github.com/shrirajpawar4/npc-crypto
cd npc-crypto
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
SOLANA_RPC_URL=your_helius_rpc_url
SOLANA_WEBSOCKET_URL=your_helius_websocket_url
WALLET_ADDRESS=your_wallet_address
LOG_LEVEL=debug
```

5. Start the service:
```bash
# Development mode
npm run dev

# Production mode
npm run build && npm start


## Configuration

The application can be configured through environment variables and the config file located at `src/config/config.ts`. Key configuration options include:

- RPC endpoint
- WebSocket connection settings
- Transaction processing parameters
- Logging levels

## Transaction Processing

The service handles various types of Solana transactions:
- SOL transfers
- Token transfers
- NFT mints
- NFT sales
- NFT transfers

Each transaction is normalized into a consistent format with detailed information including:
- Transaction signature
- Block time and slot
- Transaction type
- Status
- Sender and receiver
- Amount and fees
- Program ID

## Error Handling and Logging

The service includes a robust logging system with different log levels:
- DEBUG
- INFO
- WARN
- ERROR

Logs include timestamps, context, and formatted JSON data for better debugging.

## Design Considerations & Architecture

### Challenges in Real-time Transaction Processing

#### 1. Network and Connection Issues
- **Challenge**: WebSocket disconnections, network latency, and RPC node failures
- **Solutions**:
  - Implement automatic WebSocket reconnection with exponential backoff
  - Maintain multiple RPC node connections for redundancy
  - Cache last processed block/transaction for gap detection
  - Implement a "catch-up" mechanism to process missed transactions

#### 2. Data Consistency and Ordering
- **Challenge**: Out-of-order transactions, duplicate processing, race conditions
- **Solutions**:
  - Implement idempotency checks using transaction signatures
  - Maintain a transaction processing queue with ordering guarantees
  - Implement version control for transaction states

#### 3. High Transaction Volume
- **Challenge**: Processing bottlenecks, resource constraints, backpressure
- **Solutions**:
  - Implement message queuing (RabbitMQ/Redis) for transaction processing
  - Use worker pools for parallel processing
  - Implement rate limiting and throttling

#### 4. Data Integrity and Validation
- **Challenge**: Invalid transactions, chain reorganizations, malformed data
- **Solutions**:
  - Implement validation for all transaction types
  - Handle chain reorganizations with rollback capabilities
  - Maintain transaction state machine for complex processing


### Recommended Technical Architecture
#### Core Components
1. **Processing Layer**
   - Node.js/TypeScript for main application
   - Express.js for REST API endpoints
   - WebSocket servers for real-time updates
   - Worker processes for transaction processing

2. **Data Storage**
   - PostgreSQL for transaction and account data
   - Redis for:
     - Caching frequently accessed data
     - Message queue for transaction processing
     - Rate limiting and temporary storage

3. **Infrastructure**
   - Docker containers for service components
   - Kubernetes for orchestration and scaling
   - Load balancer for traffic distribution
   - Multiple RPC nodes for redundancy

#### Scaling Strategy
1. **Vertical Scaling**
   - Increase resources for individual components
   - Optimize database queries and indexes
   - Implement caching strategies

2. **Horizontal Scaling**
   - Deploy multiple API and WebSocket servers
   - Distribute transaction processing across workers
   - Implement database read replicas
   - Use sharding for high-volume data

3. **Performance Optimization**
   - Batch processing for high-volume periods
   - Implement database connection pooling
   - Optimize WebSocket connections with heartbeats
