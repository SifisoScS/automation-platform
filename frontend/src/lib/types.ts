// User types
export interface User {
  id: string
  email: string
  full_name: string
  is_active: boolean
  is_superuser: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

// Workflow types
export interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  config: Record<string, any>
  data?: Record<string, any>
}

export interface WorkflowEdge {
  from: string
  to: string
  id?: string
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface Workflow {
  id: string
  user_id: string
  name: string
  description?: string
  definition: WorkflowDefinition
  is_active: boolean
  schedule?: string
  created_at: string
  updated_at: string
}

export interface CreateWorkflowRequest {
  name: string
  description?: string
  definition: WorkflowDefinition
  schedule?: string
}

export interface UpdateWorkflowRequest {
  name?: string
  description?: string
  definition?: WorkflowDefinition
  is_active?: boolean
  schedule?: string
}

// Execution types
export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
export type TriggerType = 'manual' | 'scheduled' | 'webhook'

export interface Execution {
  id: string
  workflow_id: string
  status: ExecutionStatus
  trigger_type: TriggerType
  triggered_by: string
  started_at?: string
  completed_at?: string
  error_message?: string
  result_data?: Record<string, any>
  created_at: string
}

export interface ExecutionLog {
  id: string
  execution_id: string
  node_id: string
  level: 'info' | 'warning' | 'error'
  message: string
  metadata?: Record<string, any>
  timestamp: string
}

// Integration types
export interface Integration {
  id: string
  user_id: string
  name: string
  type: string
  config: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateIntegrationRequest {
  name: string
  type: string
  config: Record<string, any>
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  detail: string | { [key: string]: string[] }
}

