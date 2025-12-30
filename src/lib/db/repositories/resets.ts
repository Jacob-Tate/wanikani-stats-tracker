// src/lib/db/repositories/resets.ts
import { getAll, putMany, count } from '../database'
import { STORES } from '../schema'
import { getSyncMetadata, updateSyncMetadata } from '../sync-metadata'
import { fetchResets } from '@/lib/api/endpoints'
import type { Reset } from '@/lib/api/types'

export interface CachedReset {
  id: number
  data: Reset
  updatedAt: string
}

export async function getCachedResets(): Promise<Reset[]> {
  const cached = await getAll<CachedReset>(STORES.RESETS)
  return cached.map((item) => item.data)
}

export async function getResetCount(): Promise<number> {
  return count(STORES.RESETS)
}

export async function syncResets(
  token: string,
  onProgress?: (message: string) => void
): Promise<{ updated: number; isFullSync: boolean }> {
  const metadata = await getSyncMetadata()
  const cachedCount = await getResetCount()

  const isFullSync = cachedCount === 0 || !metadata.resetsUpdatedAt
  const updatedAfter = isFullSync ? undefined : metadata.resetsUpdatedAt

  onProgress?.(
    isFullSync ? 'Fetching resets...' : 'Checking for reset updates...'
  )

  const resets = await fetchResets(token, updatedAfter ?? undefined)

  if (resets.length === 0) {
    onProgress?.('Resets up to date')
    return { updated: 0, isFullSync }
  }

  onProgress?.(`Saving ${resets.length} resets...`)

  const cachedResets: CachedReset[] = resets.map((reset: any) => ({
    id: reset.id,
    data: reset,
    updatedAt: new Date().toISOString(),
  }))

  await putMany(STORES.RESETS, cachedResets)

  await updateSyncMetadata({
    resetsUpdatedAt: new Date().toISOString(),
  })

  onProgress?.(`Updated ${resets.length} resets`)
  return { updated: resets.length, isFullSync }
}
