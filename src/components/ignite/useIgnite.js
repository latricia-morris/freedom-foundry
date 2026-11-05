import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { E } from './igniteApi';

export const useFolders = () => useQuery({ queryKey: ['ig-folders'], queryFn: () => E.IgniteFolder.list('name', 100) });
export const useLists = (folderId) => useQuery({ queryKey: ['ig-lists', folderId], queryFn: () => E.IgniteList.filter({ folder_id: folderId, is_template: false }, 'name', 200), enabled: !!folderId });
export const useTemplates = () => useQuery({ queryKey: ['ig-lists', 'templates'], queryFn: () => E.IgniteList.filter({ is_template: true }, 'name', 200) });
export const useTasks = (listId) => useQuery({ queryKey: ['ig-tasks', listId], queryFn: () => E.IgniteTask.filter({ list_id: listId }, 'sort_order', 500), enabled: !!listId });
export const useReviewQueue = () => useQuery({ queryKey: ['ig-review'], queryFn: () => E.IgniteTask.filter({ status: 'Brand Review' }, '-submitted_for_review_at', 100) });
export const useUsers = () => useQuery({
  queryKey: ['ig-users'],
  queryFn: async () => {
    const me = await base44.auth.me();
    return me.role === 'admin' ? E.User.list() : [me];
  },
});

export function useTaskUpdate() {
  const qc = useQueryClient();
  return async (id, patch) => {
    await E.IgniteTask.update(id, patch);
    qc.invalidateQueries({ queryKey: ['ig-tasks'] });
    qc.invalidateQueries({ queryKey: ['ig-task', id] });
    qc.invalidateQueries({ queryKey: ['ig-review'] });
  };
}