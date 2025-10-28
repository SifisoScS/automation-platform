import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Execution, ExecutionLog } from '@/lib/types'

const EXECUTIONS_KEY = ['executions']

export const useExecutions = (workflowId: string, skip: number = 0, limit: number = 100) => {
  return useQuery({
    queryKey: [...EXECUTIONS_KEY, workflowId, skip, limit],
    queryFn: async () => {
      return apiClient.get<Execution[]>(
        `/executions/workflow/${workflowId}?skip=${skip}&limit=${limit}`
      )
    },
    enabled: !!workflowId,
  })
}

export const useExecution = (executionId: string) => {
  return useQuery({
    queryKey: [...EXECUTIONS_KEY, executionId],
    queryFn: async () => {
      return apiClient.get<Execution>(`/executions/${executionId}`)
    },
    enabled: !!executionId,
    refetchInterval: (data) => {
      // Stop refetching if execution is completed
      if (data?.status && ['success', 'failed', 'cancelled'].includes(data.status)) {
        return false
      }
      return 2000 // Refetch every 2 seconds while running
    },
  })
}

export const useExecutionLogs = (executionId: string) => {
  return useQuery({
    queryKey: [...EXECUTIONS_KEY, executionId, 'logs'],
    queryFn: async () => {
      return apiClient.get<ExecutionLog[]>(`/executions/${executionId}/logs`)
    },
    enabled: !!executionId,
    refetchInterval: 2000, // Refetch every 2 seconds
  })
}

export const useCreateExecution = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workflowId: string) => {
      return apiClient.post<Execution>('/executions', {
        workflow_id: workflowId,
        trigger_type: 'manual',
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EXECUTIONS_KEY })
      queryClient.setQueryData([...EXECUTIONS_KEY, data.id], data)
    },
  })
}

