/**
 * Cache Version Manager
 *
 * Manages app version and cache invalidation when the app updates.
 * Stores the current app version in IndexedDB and compares it on app load.
 * If the version changes, all caches are cleared to prevent schema mismatches.
 */

import { getById, putOne, STORES } from '@/lib/db/database'
import { clearAllBrowserCaches } from './cache-manager'
import { clearDatabase } from '@/lib/db/database'

// Import version from package.json via Vite
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '2.1.3'

interface VersionMetadata {
  id: 'app_version'
  version: string
  lastChecked: string
}

/**
 * Checks if the app version has changed and clears caches if necessary
 * Should be called on app initialization
 */
export async function checkAndUpdateVersion(): Promise<{
  versionChanged: boolean
  previousVersion: string | null
  currentVersion: string
}> {
  console.log('[VERSION] Checking app version...')

  try {
    // Get stored version from IndexedDB
    const storedMetadata = await getById<VersionMetadata>(
      STORES.SYNC_METADATA,
      'app_version'
    )

    const previousVersion = storedMetadata?.version || null
    const versionChanged = previousVersion !== null && previousVersion !== APP_VERSION

    console.log('[VERSION] Current:', APP_VERSION, 'Stored:', previousVersion, 'Changed:', versionChanged)

    if (versionChanged) {
      console.warn(
        `[VERSION] App version changed from ${previousVersion} to ${APP_VERSION} - clearing all caches`
      )

      // Clear all caches when version changes
      await clearAllCachesOnVersionChange()
    }

    // Update stored version
    const newMetadata: VersionMetadata = {
      id: 'app_version',
      version: APP_VERSION,
      lastChecked: new Date().toISOString(),
    }

    await putOne(STORES.SYNC_METADATA, newMetadata)
    console.log('[VERSION] Version metadata updated')

    return {
      versionChanged,
      previousVersion,
      currentVersion: APP_VERSION,
    }
  } catch (error) {
    console.error('[VERSION] Error checking version:', error)
    // If there's an error, assume version changed and clear caches to be safe
    await clearAllCachesOnVersionChange()

    return {
      versionChanged: true,
      previousVersion: null,
      currentVersion: APP_VERSION,
    }
  }
}

/**
 * Clears all caches when app version changes
 * This is more aggressive than a regular sync clear
 * Note: React Query cache is cleared separately in App.tsx
 */
async function clearAllCachesOnVersionChange(): Promise<void> {
  console.log('[VERSION] Clearing all caches due to version change...')

  try {
    // Clear Service Worker caches and localStorage
    await clearAllBrowserCaches()

    // Clear IndexedDB
    await clearDatabase()

    console.log('[VERSION] All caches cleared successfully')
  } catch (error) {
    console.error('[VERSION] Error clearing caches:', error)
    // Even if clearing fails, we'll try to continue
  }
}

/**
 * Gets the current app version
 */
export function getAppVersion(): string {
  return APP_VERSION
}
