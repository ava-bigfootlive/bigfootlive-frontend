# BigfootLive Backend

A scalable live streaming platform backend with enterprise-grade authentication built with Node.js, TypeScript, and SRS (Simple Realtime Server) integration. Features a single unit of compute event container architecture for optimal resource utilization, real-time streaming capabilities, and comprehensive SSO/MFA authentication for enterprise clients.

## 🏗️ Architecture Overview

### Streaming Platform
- **Event Containers**: Each live stream gets its own containerized environment
- **Real-time Processing**: Analytics, chat, and health monitoring per container
- **Auto-scaling**: Containers spin up/down based on demand
- **Cost Efficient**: Only pay for compute during live events

### Enterprise Authentication
- **Multi-tenant Architecture**: Isolated tenant data with role-based access control
- **Single Sign-On (SSO)**: Support for SAML, OIDC, OAuth2, and LDAP protocols
- **Multi-Factor Authentication (MFA)**: TOTP, SMS, email, and backup codes
- **Enterprise Security**: Advanced password policies, session management, and audit logging
- **Self-Service Management**: Tenant admins can configure their own SSO providers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Redis 6.2+
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Setup environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start databases (using Docker):**
```bash
# MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:6.0

# Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

4. **Start development server:**
```bash
npm run dev
```

The server will start at `http://localhost:3001`

## 🏗️ Architecture

### Single Unit of Compute
- **Event Containers**: Each live stream gets its own containerized environment
- **Real-time Processing**: Analytics, chat, and health monitoring per container
- **Auto-scaling**: Containers spin up/down based on demand
- **Cost Efficient**: Only pay for compute during live events

### Core Components
- **Event Container Manager**: Orchestrates container lifecycle
- **Event Service**: Manages stream events and integrations
- **WebSocket Service**: Real-time communication
- **Queue Manager**: Background job processing
- **Analytics System**: Real-time and historical data

## 📡 API Endpoints

### Authentication & SSO
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Traditional username/password login
- `POST /api/auth/sso/initiate` - Initiate SSO login flow
- `POST /api/auth/sso/callback` - Handle SSO callback
- `POST /api/auth/mfa/setup` - Set up MFA for user
- `POST /api/auth/mfa/verify` - Verify MFA token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT tokens
- `GET /api/auth/sessions` - List user sessions
- `DELETE /api/auth/sessions/:id` - Terminate session
- `GET /api/auth/audit` - Get user audit events

### Tenant Management (Enterprise)
- `GET /api/tenant/info` - Get current tenant information
- `PUT /api/tenant/info` - Update tenant settings
- `GET /api/tenant/sso/provider` - Get SSO provider configuration
- `POST /api/tenant/sso/provider` - Create/update SSO provider
- `POST /api/tenant/sso/test` - Test SSO provider connection
- `DELETE /api/tenant/sso/provider` - Disable SSO provider
- `GET /api/tenant/sso/templates` - Get SSO provider templates
- `GET /api/tenant/users` - List tenant users
- `POST /api/tenant/users` - Create tenant user
- `PUT /api/tenant/users/:id` - Update user roles/permissions

### Events
- `POST /api/events` - Create event
- `GET /api/events` - List live events
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/start` - Start stream
- `POST /api/events/:id/stop` - Stop stream

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `POST /api/users/:id/follow` - Follow user

### Analytics
- `GET /api/analytics/events/:id` - Event analytics
- `GET /api/analytics/dashboard` - User dashboard
- `GET /api/analytics/platform` - Platform stats (admin)

### Streaming
- `GET /api/streaming/events/:id/stream` - Stream config
- `POST /api/streaming/events/:id/webhook` - RTMP webhooks
- `GET /api/streaming/events/:id/health` - Stream health

## 🔧 Configuration

### Environment Variables
```bash
# Server
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/bigfootlive
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key

# Streaming
RTMP_PORT=1935
CDN_BASE_URL=https://cdn.bigfootlive.com

# Storage
AWS_REGION=us-west-2
S3_BUCKET_RECORDINGS=recordings-bucket
```

## 🐳 Docker Deployment

### Build and run:
```bash
# Build image
docker build -t bigfootlive-backend .

# Run with docker-compose
docker-compose up -d
```

### Production deployment:
```bash
# With environment variables
docker run -d \
  --name bigfootlive-backend \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://mongo:27017/bigfootlive \
  -e REDIS_URL=redis://redis:6379 \
  bigfootlive-backend
```

## 📊 Monitoring

### Health Checks
- `GET /health` - Server health
- `GET /api/containers/stats` - Container stats
- `GET /api/platform/stats` - Platform metrics

### Logging
- Structured JSON logs via Winston
- Performance metrics
- Security event logging
- Container lifecycle tracking

### Queue Monitoring
- Event cleanup processing
- Analytics data processing  
- Email notifications
- Background job stats

## 🔒 Security

### Authentication
- JWT tokens with refresh mechanism
- Password hashing with bcrypt
- Account lockout protection
- Rate limiting on sensitive endpoints

### Authorization
- Role-based access control (viewer/streamer/moderator/admin)
- Resource ownership verification
- API key authentication for webhooks

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

## 🚦 Performance

### Caching Strategy
- Redis for session data
- Event metadata caching
- Real-time metrics storage
- Queue job persistence

### Database Optimization
- Indexed queries
- Aggregation pipelines
- Connection pooling
- Read/write separation ready

### Real-time Features
- WebSocket connections
- Event-based architecture
- Horizontal scaling support
- Load balancer ready

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --testNamePattern="EventService"
```

## 📈 Scaling

### Horizontal Scaling
- Stateless server design
- Redis session storage
- Load balancer compatible
- Container orchestration ready

### Database Scaling
- MongoDB replica sets
- Read replicas for analytics
- Sharding strategy included
- Backup and restore procedures

### Queue Scaling
- Multiple queue workers
- Priority-based processing
- Dead letter queues
- Job retry mechanisms

## 🔄 Development

### Scripts
```bash
npm run dev          # Development server with hot reload
npm run build        # Build TypeScript
npm start            # Production server
npm run lint         # ESLint checking
npm run test         # Run test suite
```

### Project Structure
```
src/
├── server.ts              # Main server entry
├── types/                 # TypeScript definitions
├── models/               # Database models
├── routes/               # API routes
├── services/             # Business logic
├── middleware/           # Express middleware
├── utils/                # Utilities (config, logger, etc.)
└── event-container/      # Container management
```

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Update environment variables
- [ ] Configure database connections
- [ ] Set up Redis cluster
- [ ] Configure AWS credentials
- [ ] Set up monitoring (Sentry, etc.)

### Production Setup
- [ ] Enable HTTPS/SSL
- [ ] Configure reverse proxy (nginx)
- [ ] Set up container orchestration
- [ ] Configure backup systems
- [ ] Set up log aggregation

## 📞 Support

- Documentation: `/docs`
- API Reference: `/api-docs`
- Health Status: `/health`
- Platform Stats: `/api/platform/stats`

## 🎯 Next Steps

1. **Container Integration**: Connect to Kubernetes/Docker Swarm
2. **RTMP Server**: Deploy media server (nginx-rtmp, Node Media Server)
3. **CDN Setup**: Configure HLS delivery network
4. **Payment Integration**: Add subscription and donation processing
5. **Admin Dashboard**: Build platform management interface
