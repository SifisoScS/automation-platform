import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Workflow, CreateWorkflowRequest, UpdateWorkflowRequest } from '@/lib/types'

const WORKFLOWS_KEY = ['workflows']

export const useWorkflows = (skip: number = 0, limit: number = 100) => {
  return useQuery({
    queryKey: [...WORKFLOWS_KEY, skip, limit],
    queryFn: async () => {
      return apiClient.get<Workflow[]>(
        `/workflows?skip=${skip}&limit=${limit}`
      )
    },
  })
}

export const useWorkflow = (workflowId: string) => {
  return useQuery({
    queryKey: [...WORKFLOWS_KEY, workflowId],
    queryFn: async () => {
      return apiClient.get<Workflow>(`/workflows/${workflowId}`)
    },
    enabled: !!workflowId,
  })
}

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateWorkflowRequest) => {
      return apiClient.post<Workflow>('/workflows', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOWS_KEY })
    },
  })
}

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      workflowId,
      data,
    }: {
      workflowId: string
      data: UpdateWorkflowRequest
    }) => {
      return apiClient.put<Workflow>(`/workflows/${workflowId}`, data)
    },
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: [...WORKFLOWS_KEY, workflowId] })
      queryClient.invalidateQueries({ queryKey: WORKFLOWS_KEY })
    },
  })
}

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workflowId: string) => {
      return apiClient.delete(`/workflows/${workflowId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOWS_KEY })
    },
  })
}

