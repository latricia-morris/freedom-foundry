import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';

export function useDriveFiles(profileId, folderId) {
  return useQuery({
    queryKey: ['drive-files', profileId, folderId],
    queryFn: () => apiClient.driveFiles.browse({ profileId, folderId }),
    enabled: !!profileId,
  });
}

export function useDriveFilePreview(profileId, fileId, versionId, page = 1) {
  return useQuery({
    queryKey: ['drive-file-preview', profileId, fileId, versionId, page],
    queryFn: async () => {
      const { blob, pageCount } = await apiClient.driveFiles.preview({ profileId, fileId, page });
      return { url: URL.createObjectURL(blob), pageCount };
    },
    enabled: !!profileId && !!fileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDriveFileComments(profileId, fileId) {
  return useQuery({
    queryKey: ['drive-file-comments', profileId, fileId],
    queryFn: () => apiClient.driveFiles.getComments({ profileId, fileId }),
    enabled: !!profileId && !!fileId,
  });
}

export function useAddDriveFileComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, fileId, data }) => apiClient.driveFiles.addComment({ profileId, fileId, data }),
    onSuccess: (_, { profileId, fileId }) => {
      qc.invalidateQueries({ queryKey: ['drive-file-comments', profileId, fileId] });
    },
  });
}

export function useMakeDriveFileDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, fileId, data }) => apiClient.driveFiles.makeDecision({ profileId, fileId, data }),
    onSuccess: (_, { profileId, folderId, fileId }) => {
      qc.invalidateQueries({ queryKey: ['drive-file-comments', profileId, fileId] });
      qc.invalidateQueries({ queryKey: ['drive-files', profileId] });
    },
  });
}

// Admin Hooks
export function useAdminDeliveryDriveFiles(profileId, folderId) {
  return useQuery({
    queryKey: ['admin-delivery-drive-files', profileId, folderId],
    queryFn: () => apiClient.admin.getDeliveryDriveFiles(profileId, folderId),
    enabled: !!profileId,
  });
}

export function useSetAdminFileVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, fileId, data }) => apiClient.admin.setFileVisibility(profileId, fileId, data),
    onSuccess: (_, { profileId }) => {
      qc.invalidateQueries({ queryKey: ['admin-delivery-drive-files', profileId] });
      qc.invalidateQueries({ queryKey: ['admin-delivery-audit', profileId] });
    },
  });
}

export function useAdminPaymentEligibility(profileId) {
  return useQuery({
    queryKey: ['admin-payment-eligibility', profileId],
    queryFn: () => apiClient.admin.getPaymentEligibility(profileId),
    enabled: !!profileId,
  });
}

export function useSetAdminPaymentEligibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, data }) => apiClient.admin.setPaymentEligibility(profileId, data),
    onSuccess: (_, { profileId }) => {
      qc.invalidateQueries({ queryKey: ['admin-payment-eligibility', profileId] });
      qc.invalidateQueries({ queryKey: ['admin-delivery-audit', profileId] });
    },
  });
}

export function useAdminDeliveryAudit(profileId, limit) {
  return useQuery({
    queryKey: ['admin-delivery-audit', profileId, limit],
    queryFn: () => apiClient.admin.getDeliveryAudit(profileId, limit),
    enabled: !!profileId,
  });
}