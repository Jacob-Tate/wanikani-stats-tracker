/**
 * Cache Manager
 *
 * Centralized cache management across all caching layers:
 * - Service Worker Cache Storage API
 * - React Query cache
 * - IndexedDB
 * - LocalStorage
 */

/**
 * Clears all Service Worker caches
 * This removes any cached API responses or assets
 */
export async function clearServiceWorkerCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      )
      console.log('Service Worker caches cleared:', cacheNames)
    } catch (error) {
      console.error('Failed to clear Service Worker caches:', error)
      throw error
    }
  }
}

/**
 * Clears all localStorage except the auth token
 * Preserves user authentication while clearing cached data
 */
export function clearLocalStorageExceptAuth(): void {
  try {
    const authData = localStorage.getItem('wanikani-auth')
    localStorage.clear()
    if (authData) {
      localStorage.setItem('wanikani-auth', authData)
    }
    console.log('LocalStorage cleared (except auth)')
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
    throw error
  }
}

/**
 * Nuclear cache clear - clears ALL caches across all layers
 * Use this for force full sync or when data is completely corrupted
 *
 * Note: Does not clear IndexedDB or React Query - those should be
 * handled separately by their respective managers
 */
export async function clearAllBrowserCaches(): Promise<void> {
  await clearServiceWorkerCaches()
  clearLocalStorageExceptAuth()
  console.log('All browser caches cleared')
}
