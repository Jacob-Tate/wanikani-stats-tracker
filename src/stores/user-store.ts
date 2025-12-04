// User Store - Manages API token only
// User data is now fetched fresh via React Query to avoid stale cache
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { clearDatabase } from '@/lib/db/database'
import { clearAllBrowserCaches } from '@/lib/cache/cache-manager'

interface UserState {
  // State
  token: string | null
  _hasHydrated: boolean

  // Actions
  setToken: (token: string) => void
  clearAuth: () => Promise<void>
  setHasHydrated: (state: boolean) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      token: null,
      _hasHydrated: false,

      // Actions
      setToken: (token: string) =>
        set({
          token,
        }),

      clearAuth: async () => {
        // Clear all caches when logging out
        try {
          await clearDatabase()
          await clearAllBrowserCaches()
        } catch (err) {
          console.error('Failed to clear caches:', err)
        }
        set({ token: null })
      },

      setHasHydrated: (state: boolean) =>
        set({
          _hasHydrated: state,
        }),
    }),
    {
      name: 'wanikani-auth', // localStorage key
      partialize: (state) => ({
        token: state.token,
        // Only persist token, not user data
        // User data is fetched fresh via React Query
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true)
        }
      },
    }
  )
)
