import { createContext, useContext } from 'react';

const AdminViewContext = createContext({ isAdmin: false, view: 'brand', switchView: () => {} });

export const AdminViewProvider = AdminViewContext.Provider;

export function useAdminView() {
  return useContext(AdminViewContext);
}