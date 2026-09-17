import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';

export const useReferralAccess = (enabled = true) => useQuery({
  queryKey: ['referrals', 'access'],
  queryFn: () => apiClient.referrals.getAccess(),
  enabled,
  retry: false,
});

export const useReferralSubmissions = () => useQuery({
  queryKey: ['referrals', 'submissions'],
  queryFn: () => apiClient.referrals.listSubmissions(),
});

export const useCreateReferralSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.referrals.createSubmission(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referrals', 'submissions'] });
    },
  });
};
