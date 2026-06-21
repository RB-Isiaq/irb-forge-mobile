import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OrgState {
  activeOrgSlug: string | null;
  setActiveOrgSlug: (slug: string | null) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      activeOrgSlug: null,
      setActiveOrgSlug: (slug) => set({ activeOrgSlug: slug }),
    }),
    {
      name: 'irb_active_org',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
