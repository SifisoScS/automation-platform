# Business Process Automation Platform

A self-hosted business process automation platform that enables users to create, manage, and execute automated workflows without writing code.

## Features

- **Visual Workflow Editor**: Drag-and-drop interface for creating workflows
- **Node-Based Architecture**: Extensible system for adding custom nodes
- **Async Execution**: Asynchronous workflow execution using Celery
- **Real-time Monitoring**: Track workflow execution in real-time
- **Integration Support**: Connect to external services and databases
- **User Authentication**: Secure JWT-based authentication
- **REST API**: Comprehensive API for workflow management

## Technology Stack

### Frontend
- **Next.js 14+** - React framework with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Flow** - Visual workflow editor
- **Zustand** - State management
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **Celery** - Asynchronous task queue
- **Redis** - Message broker and caching
- **Pydantic** - Data validation

## Project Structure

```
automation-platform/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities and types
│   │   └── hooks/           # Custom hooks
│   └── package.json
│
└── backend/                  # FastAPI application
    ├── core/                # Configuration and database
    ├── models/              # SQLAlchemy models
    ├── schemas/             # Pydantic schemas
    ├── routes/              # API endpoints
    ├── services/            # Business logic
    ├── workflows/           # Workflow engine
    ├── workers/             # Celery tasks
    ├── utils/               # Utilities
    └── main.py              # FastAPI entry point
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 6+

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Create database and run migrations:
```bash
# Create database (if not exists)
createdb automation_platform

# Run migrations (when Alembic is set up)
# alembic upgrade head
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

## Running the Application

### Backend

Start the FastAPI server:
```bash
cd backend
python main.py
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

Start the Celery worker (in a separate terminal):
```bash
cd backend
celery -A workers.celery_app worker --loglevel=info
```

### Frontend

Start the Next.js development server:
```bash
cd frontend
pnpm dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows` - List workflows
- `GET /api/workflows/{id}` - Get workflow
- `PUT /api/workflows/{id}` - Update workflow
- `DELETE /api/workflows/{id}` - Delete workflow

### Executions
- `POST /api/executions` - Trigger workflow execution
- `GET /api/executions/{id}` - Get execution details
- `GET /api/executions/{id}/logs` - Get execution logs
- `GET /api/executions/workflow/{workflow_id}` - List workflow executions

### Integrations
- `POST /api/integrations` - Create integration
- `GET /api/integrations` - List integrations
- `GET /api/integrations/{id}` - Get integration
- `PUT /api/integrations/{id}` - Update integration
- `DELETE /api/integrations/{id}` - Delete integration

## Workflow Definition Format

Workflows are defined as JSON with nodes and edges:

```json
{
  "nodes": [
    {
      "id": "node_1",
      "type": "http_request",
      "position": {"x": 100, "y": 100},
      "config": {
        "method": "GET",
        "url": "https://api.example.com/data",
        "headers": {"Authorization": "Bearer {{token}}"}
      }
    }
  ],
  "edges": [
    {"from": "node_1", "to": "node_2"}
  ]
}
```

## Supported Node Types

- **http_request** - Make HTTP requests
- **delay** - Delay execution
- **conditional** - Conditional logic (if/else)
- **email** - Send emails (coming soon)
- **database** - Execute database queries (coming soon)

## Development

### Adding a Custom Node

1. Create a new node class in `backend/workflows/nodes/`:

```python
from workflows.nodes.base_node import BaseNode
from workflows.context import ExecutionContext

class CustomNode(BaseNode):
    async def execute(self, context: ExecutionContext):
        # Implementation
        return result
    
    def validate_config(self) -> bool:
        return True
```

2. Register the node in `NodeExecutorFactory`:

```python
NodeExecutorFactory.register_node_type('custom', CustomNode)
```

## Deployment

### Non-Docker Deployment

1. **Install system dependencies:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql redis-server python3.11 nodejs npm

# macOS
brew install postgresql redis python@3.11 node
```

2. **Start services:**
```bash
# PostgreSQL
sudo systemctl start postgresql

# Redis
redis-server

# Or use brew services on macOS
brew services start postgresql
brew services start redis
```

3. **Configure and run backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

4. **Run Celery worker:**
```bash
cd backend
celery -A workers.celery_app worker --loglevel=info
```

5. **Build and run frontend:**
```bash
cd frontend
pnpm build
pnpm start
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch
2. Make your changes
3. Write tests if applicable
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on the GitHub repository.

## Roadmap

- [ ] Email node implementation
- [ ] Database query node implementation
- [ ] Webhook triggers
- [ ] Workflow scheduling UI
- [ ] Advanced error handling and retries
- [ ] Workflow versioning
- [ ] Team collaboration features
- [ ] Workflow templates
- [ ] Advanced monitoring and analytics

