# Testing Guide for Business Process Automation Platform

This guide provides instructions for testing the Automation Platform application.

## Prerequisites

- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3000`
- PostgreSQL database configured
- Redis running for Celery

## Manual Testing

### 1. User Registration and Authentication

**Test Case 1.1: Register New User**
1. Navigate to `http://localhost:3000/auth/register`
2. Fill in the form:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "testpass123"
   - Confirm Password: "testpass123"
3. Click "Create Account"
4. Expected: Redirected to dashboard with user logged in

**Test Case 1.2: Login**
1. Navigate to `http://localhost:3000/auth/login`
2. Enter email: "test@example.com"
3. Enter password: "testpass123"
4. Click "Sign In"
5. Expected: Redirected to dashboard

**Test Case 1.3: Invalid Credentials**
1. Navigate to `http://localhost:3000/auth/login`
2. Enter email: "test@example.com"
3. Enter password: "wrongpassword"
4. Click "Sign In"
5. Expected: Error message displayed

### 2. Workflow Management

**Test Case 2.1: Create Workflow**
1. From dashboard, click "Create New Workflow"
2. Fill in the form:
   - Workflow Name: "Test HTTP Workflow"
   - Description: "A test workflow that makes HTTP requests"
3. Click "Create Workflow"
4. Expected: Workflow created and editor opens

**Test Case 2.2: List Workflows**
1. Navigate to `http://localhost:3000/workflows`
2. Expected: List of all user's workflows displayed

**Test Case 2.3: Update Workflow**
1. From workflows list, click "Edit" on a workflow
2. Modify the workflow definition
3. Click "Save Workflow"
4. Expected: Workflow updated successfully

**Test Case 2.4: Delete Workflow**
1. From workflows list, click "Delete" on a workflow
2. Confirm deletion
3. Expected: Workflow removed from list

### 3. Workflow Execution

**Test Case 3.1: Execute Workflow**
1. From dashboard, click "Create New Workflow"
2. Create a simple workflow with an HTTP node
3. Configure the HTTP node:
   - Method: GET
   - URL: `https://jsonplaceholder.typicode.com/posts/1`
4. Save the workflow
5. Click "Execute" (if available in UI)
6. Expected: Execution starts and status updates

**Test Case 3.2: View Execution History**
1. Navigate to `http://localhost:3000/executions`
2. Expected: List of all executions displayed

**Test Case 3.3: View Execution Details**
1. From executions list, click on an execution
2. Expected: Execution details, logs, and results displayed

### 4. API Testing

Use curl or Postman to test API endpoints:

**Register User**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
  }'
```

**Login**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

**Create Workflow**
```bash
curl -X POST http://localhost:8000/api/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Workflow",
    "description": "A test workflow",
    "definition": {
      "nodes": [
        {
          "id": "node_1",
          "type": "http_request",
          "position": {"x": 100, "y": 100},
          "config": {
            "method": "GET",
            "url": "https://api.example.com/data"
          }
        }
      ],
      "edges": []
    }
  }'
```

**List Workflows**
```bash
curl -X GET http://localhost:8000/api/workflows \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Execution**
```bash
curl -X POST http://localhost:8000/api/executions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "workflow_id": "WORKFLOW_ID",
    "trigger_type": "manual"
  }'
```

**Get Execution Details**
```bash
curl -X GET http://localhost:8000/api/executions/EXECUTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Execution Logs**
```bash
curl -X GET http://localhost:8000/api/executions/EXECUTION_ID/logs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Automated Testing

### Backend Tests

Create test files in `backend/tests/`:

**tests/test_auth.py**
```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_user():
    # First register
    client.post(
        "/api/auth/register",
        json={
            "email": "test2@example.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
    )
    
    # Then login
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test2@example.com",
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_invalid_login():
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "wrongpass"
        }
    )
    assert response.status_code == 401
```

**tests/test_workflows.py**
```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

@pytest.fixture
def auth_token():
    # Register and login
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
    )
    
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpass123"
        }
    )
    return response.json()["access_token"]

def test_create_workflow(auth_token):
    response = client.post(
        "/api/workflows",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "name": "Test Workflow",
            "definition": {
                "nodes": [
                    {
                        "id": "node_1",
                        "type": "http_request",
                        "position": {"x": 100, "y": 100},
                        "config": {
                            "method": "GET",
                            "url": "https://api.example.com"
                        }
                    }
                ],
                "edges": []
            }
        }
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Workflow"

def test_list_workflows(auth_token):
    response = client.get(
        "/api/workflows",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

### Running Tests

```bash
# Install pytest
pip install pytest pytest-asyncio

# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v

# Run with coverage
pip install pytest-cov
pytest --cov=. --cov-report=html
```

## Performance Testing

### Load Testing with Locust

Create `locustfile.py`:

```python
from locust import HttpUser, task, between

class AutomationPlatformUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login
        response = self.client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpass123"
            }
        )
        self.token = response.json()["access_token"]
    
    @task
    def list_workflows(self):
        self.client.get(
            "/api/workflows",
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task
    def list_executions(self):
        self.client.get(
            "/api/executions",
            headers={"Authorization": f"Bearer {self.token}"}
        )
```

Run load test:
```bash
pip install locust
locust -f locustfile.py --host=http://localhost:8000
```

## Debugging

### Backend Debugging

1. **Check logs:**
   ```bash
   tail -f logs/automation_platform.log
   ```

2. **Enable debug mode in .env:**
   ```
   DEBUG=True
   ```

3. **Use Python debugger:**
   ```python
   import pdb; pdb.set_trace()
   ```

4. **Check database:**
   ```bash
   psql -U automation_user -d automation_platform
   \dt  # List tables
   SELECT * FROM users;  # Query data
   ```

### Frontend Debugging

1. **Browser DevTools:**
   - Open Chrome DevTools (F12)
   - Check Console for errors
   - Check Network tab for API calls

2. **React DevTools:**
   - Install React DevTools extension
   - Inspect component state and props

3. **Check logs:**
   ```bash
   # Terminal where frontend is running
   # Look for error messages
   ```

## Common Issues and Solutions

### Issue: Database Connection Error
**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U automation_user -d automation_platform -c "SELECT 1"

# Recreate database if needed
dropdb -U automation_user automation_platform
createdb -U automation_user automation_platform
```

### Issue: Redis Connection Error
**Solution:**
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Start Redis if not running
redis-server
```

### Issue: Celery Worker Not Processing Tasks
**Solution:**
```bash
# Check Celery worker is running
ps aux | grep celery

# Restart Celery worker
celery -A workers.celery_app worker --loglevel=info

# Check Redis connection
redis-cli
> KEYS *  # Should show task keys
```

### Issue: Frontend Not Connecting to Backend
**Solution:**
```bash
# Check backend is running
curl http://localhost:8000/api/health

# Check CORS configuration in backend
# Verify ALLOWED_ORIGINS in .env includes frontend URL

# Check API URL in frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Checklist for Release

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] No console errors in browser
- [ ] No errors in backend logs
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Security: Change SECRET_KEY in production
- [ ] Security: Update ALLOWED_ORIGINS for production
- [ ] Documentation updated
- [ ] README reviewed
- [ ] SETUP.md reviewed

