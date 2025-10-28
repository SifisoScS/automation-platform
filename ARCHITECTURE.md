# Architecture Documentation

## System Overview

The Automation Platform is a self-hosted business process automation system built with a modern, scalable architecture. It enables users to create, manage, and execute automated workflows without writing code.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  - React components with TypeScript                          │
│  - React Query for data management                           │
│  - Tailwind CSS for styling                                  │
│  - React Flow for workflow visualization (future)            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                          │
│  - RESTful API endpoints                                     │
│  - JWT authentication                                        │
│  - Workflow execution engine                                 │
│  - Service layer for business logic                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌──────────┐
    │Database│  │ Redis  │  │  Celery  │
    │(PG)    │  │ Cache  │  │  Worker  │
    └────────┘  └────────┘  └──────────┘
```

## Component Architecture

### Frontend Layer

**Technology Stack:**
- Next.js 14+ with App Router
- TypeScript for type safety
- React Query for server state management
- Tailwind CSS for styling
- React Hook Form for form handling

**Key Components:**
- **Pages**: Authentication, Dashboard, Workflows, Executions, Integrations
- **Components**: Reusable UI components, Workflow editor, Execution monitor
- **Hooks**: Custom React hooks for API integration
- **Services**: API client, Authentication utilities

**Directory Structure:**
```
frontend/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and types
│   └── styles/           # Global styles
├── public/               # Static assets
└── package.json
```

### Backend Layer

**Technology Stack:**
- FastAPI for REST API
- SQLAlchemy for ORM
- Pydantic for data validation
- PostgreSQL for data persistence
- Redis for caching and message broker
- Celery for asynchronous task processing

**Key Modules:**

#### Core Module (`core/`)
- **config.py**: Configuration management
- **database.py**: Database connection and session management
- **security.py**: JWT authentication and password hashing
- **dependencies.py**: FastAPI dependency injection

#### Models Module (`models/`)
- **user.py**: User model
- **workflow.py**: Workflow model
- **execution.py**: Execution model
- **execution_log.py**: Execution logging
- **integration.py**: Integration model

#### Schemas Module (`schemas/`)
- Pydantic models for request/response validation
- Separate schemas for create, update, and read operations

#### Services Module (`services/`)
- **auth_service.py**: User authentication and JWT token management
- **workflow_service.py**: Workflow CRUD operations
- **execution_service.py**: Execution management and logging
- **integration_service.py**: Integration management

#### Routes Module (`routes/`)
- **auth.py**: Authentication endpoints
- **workflows.py**: Workflow endpoints
- **executions.py**: Execution endpoints
- **integrations.py**: Integration endpoints

#### Workflows Module (`workflows/`)
- **context.py**: Execution context for storing node outputs
- **engine.py**: Main workflow execution engine
- **executor.py**: Node executor factory
- **validator.py**: Workflow definition validation
- **nodes/**: Node implementations
  - **base_node.py**: Base class for all nodes
  - **http_node.py**: HTTP request node
  - **delay_node.py**: Delay node
  - **conditional_node.py**: Conditional logic node

#### Workers Module (`workers/`)
- **celery_app.py**: Celery configuration
- **tasks.py**: Asynchronous workflow execution tasks

**Directory Structure:**
```
backend/
├── core/                 # Core configuration
├── models/               # Database models
├── schemas/              # Pydantic schemas
├── services/             # Business logic
├── routes/               # API endpoints
├── workflows/            # Workflow engine
├── workers/              # Celery tasks
├── utils/                # Utilities
├── alembic/              # Database migrations
├── main.py               # FastAPI entry point
└── requirements.txt
```

## Data Flow

### User Authentication Flow

```
1. User submits credentials
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT token
   ↓
5. Frontend stores token in localStorage
   ↓
6. Frontend includes token in Authorization header for subsequent requests
```

### Workflow Execution Flow

```
1. User creates/edits workflow definition
   ↓
2. Frontend sends POST /api/workflows
   ↓
3. Backend validates workflow definition
   ↓
4. Backend stores workflow in database
   ↓
5. User triggers workflow execution
   ↓
6. Frontend sends POST /api/executions
   ↓
7. Backend creates execution record
   ↓
8. Backend enqueues Celery task
   ↓
9. Celery worker picks up task
   ↓
10. WorkflowEngine executes nodes sequentially
    ↓
11. Each node executes and stores output in ExecutionContext
    ↓
12. Execution logs are written to database
    ↓
13. Final result is stored in execution record
    ↓
14. Frontend polls for execution status updates
```

### Node Execution Flow

```
1. WorkflowEngine gets next node from execution order
   ↓
2. NodeExecutorFactory creates node instance
   ↓
3. Node validates configuration
   ↓
4. Node resolves variables from ExecutionContext
   ↓
5. Node executes (async)
   ↓
6. Node returns result
   ↓
7. Result stored in ExecutionContext
   ↓
8. Execution log created
   ↓
9. Next node executes
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### Workflows Table
```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    definition JSON NOT NULL,
    is_active BOOLEAN DEFAULT true,
    schedule VARCHAR(100),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### Executions Table
```sql
CREATE TABLE executions (
    id UUID PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    status VARCHAR(50) DEFAULT 'pending',
    trigger_type VARCHAR(50) NOT NULL,
    triggered_by UUID REFERENCES users(id),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    result_data JSON,
    created_at TIMESTAMP DEFAULT now()
);
```

### Execution Logs Table
```sql
CREATE TABLE execution_logs (
    id UUID PRIMARY KEY,
    execution_id UUID NOT NULL REFERENCES executions(id),
    node_id VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    metadata JSON,
    timestamp TIMESTAMP DEFAULT now()
);
```

### Integrations Table
```sql
CREATE TABLE integrations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    config JSON NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

## Security Architecture

### Authentication
- **JWT Tokens**: Stateless authentication using JSON Web Tokens
- **Token Expiration**: Tokens expire after configured duration
- **Refresh Tokens**: Support for token refresh (future implementation)
- **Password Hashing**: bcrypt for secure password storage

### Authorization
- **User Isolation**: Users can only access their own workflows and executions
- **Role-Based Access**: Support for admin and regular users (future)
- **API Key Authentication**: For integrations (future)

### Data Protection
- **HTTPS**: Enforce HTTPS in production
- **CORS**: Configure allowed origins
- **SQL Injection Prevention**: SQLAlchemy parameterized queries
- **XSS Prevention**: React automatic escaping
- **CSRF Protection**: CORS configuration

## Scalability Considerations

### Horizontal Scaling
- **Stateless Backend**: FastAPI can be scaled horizontally
- **Celery Workers**: Multiple workers can process tasks in parallel
- **Database**: PostgreSQL can be replicated and sharded
- **Redis**: Can be clustered for high availability

### Performance Optimization
- **Caching**: Redis for caching frequently accessed data
- **Database Indexing**: Indexes on frequently queried columns
- **Async Processing**: Celery for long-running tasks
- **Pagination**: API endpoints support pagination

### Monitoring and Logging
- **Application Logging**: Structured logging for debugging
- **Execution Logging**: Detailed logs for each workflow execution
- **Error Tracking**: Centralized error logging (future)
- **Performance Metrics**: Monitor API response times (future)

## Extension Points

### Custom Nodes
Create custom node types by extending `BaseNode`:

```python
from workflows.nodes.base_node import BaseNode

class CustomNode(BaseNode):
    async def execute(self, context: ExecutionContext):
        # Implementation
        return result
    
    def validate_config(self) -> bool:
        return True

# Register node
NodeExecutorFactory.register_node_type('custom', CustomNode)
```

### Custom Integrations
Implement integration handlers for external services:

```python
class CustomIntegration:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
    
    async def execute(self, action: str, params: Dict):
        # Implementation
        return result
```

### Webhooks
Support for webhook triggers (future):
- Incoming webhooks to trigger workflows
- Outgoing webhooks to notify external systems

## Deployment Architecture

### Non-Docker Deployment
- **Web Server**: Gunicorn for WSGI server
- **Reverse Proxy**: Nginx for load balancing and SSL
- **Process Manager**: systemd for service management
- **Database**: PostgreSQL on separate server
- **Cache**: Redis on separate server

### Future: Docker Deployment
- Docker containers for each service
- Docker Compose for local development
- Kubernetes for production orchestration

## Technology Decisions

### Why FastAPI?
- Modern, fast Python framework
- Built-in async support
- Automatic API documentation
- Type hints and validation with Pydantic
- Easy to learn and maintain

### Why Next.js?
- Server-side rendering for better SEO
- Built-in API routes
- Excellent developer experience
- Large ecosystem and community
- TypeScript support

### Why PostgreSQL?
- Reliable and mature
- ACID compliance
- JSON support for flexible data
- Excellent for complex queries
- Good for scalability

### Why Celery?
- Distributed task queue
- Support for multiple brokers (Redis, RabbitMQ)
- Flexible scheduling
- Retry mechanisms
- Well-established in Python ecosystem

## Future Enhancements

1. **Advanced Workflow Features**
   - Parallel node execution
   - Conditional branching
   - Loop constructs
   - Error handling and retries

2. **Additional Node Types**
   - Email notifications
   - Database queries
   - File operations
   - Webhook triggers

3. **Monitoring and Analytics**
   - Workflow execution metrics
   - Performance dashboards
   - Error tracking and alerts
   - Audit logs

4. **Collaboration Features**
   - Team workspaces
   - Workflow sharing
   - Version control
   - Comments and annotations

5. **Advanced Security**
   - OAuth2 integration
   - API key management
   - Encryption at rest
   - Audit logging

6. **Deployment Options**
   - Docker and Docker Compose
   - Kubernetes support
   - Cloud platform integrations (AWS, GCP, Azure)

