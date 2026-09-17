import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';

export const useAdminReferralPartners = () => useQuery({
  queryKey: ['admin', 'referrals', 'partners'],
  queryFn: () => apiClient.admin.listReferralPartners(),
});

export const useAdminReferralSubmissions = () => useQuery({
  queryKey: ['admin', 'referrals', 'submissions'],
  queryFn: () => apiClient.admin.listReferralSubmissions(),
});

export const useInviteReferralPartner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.admin.inviteReferralPartner(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'referrals', 'partners'] });
    },
  });
};

export const useResendReferralInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.admin.resendReferralInvitation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'referrals', 'partners'] });
    },
  });
};

export const useUpdateReferralPartner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.admin.updateReferralPartner(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(['admin', 'referrals', 'partners'], (old) => {
        if (!old) return old;
        return old.map(p => p.id === updated.id ? updated : p);
      });
    },
  });
};

export const useUpdateReferralSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.admin.updateReferralSubmission(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(['admin', 'referrals', 'submissions'], (old) => {
        if (!old) return old;
        return old.map(s => s.id === updated.id ? updated : s);
      });
    },
  });
};
