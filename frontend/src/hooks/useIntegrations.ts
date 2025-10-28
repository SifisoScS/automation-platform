import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Integration, CreateIntegrationRequest } from '@/lib/types'

const INTEGRATIONS_KEY = ['integrations']

export const useIntegrations = (skip: number = 0, limit: number = 100) => {
  return useQuery({
    queryKey: [...INTEGRATIONS_KEY, skip, limit],
    queryFn: async () => {
      return apiClient.get<Integration[]>(
        `/integrations?skip=${skip}&limit=${limit}`
      )
    },
  })
}

export const useIntegration = (integrationId: string) => {
  return useQuery({
    queryKey: [...INTEGRATIONS_KEY, integrationId],
    queryFn: async () => {
      return apiClient.get<Integration>(`/integrations/${integrationId}`)
    },
    enabled: !!integrationId,
  })
}

export const useCreateIntegration = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateIntegrationRequest) => {
      return apiClient.post<Integration>('/integrations', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_KEY })
    },
  })
}

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      integrationId,
      data,
    }: {
      integrationId: string
      data: Record<string, any>
    }) => {
      return apiClient.put<Integration>(`/integrations/${integrationId}`, data)
    },
    onSuccess: (_, { integrationId }) => {
      queryClient.invalidateQueries({ queryKey: [...INTEGRATIONS_KEY, integrationId] })
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_KEY })
    },
  })
}

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (integrationId: string) => {
      return apiClient.delete(`/integrations/${integrationId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_KEY })
    },
  })
}

