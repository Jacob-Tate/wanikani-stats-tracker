import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App, { queryClient } from './App.tsx'
import { checkAndUpdateVersion } from './lib/cache/version-manager'

// Check app version and clear caches if needed before rendering
checkAndUpdateVersion()
  .then((result) => {
    if (result.versionChanged) {
      console.log(
        `[MAIN] App updated from ${result.previousVersion} to ${result.currentVersion}`
      )
      // Clear React Query cache after version change
      queryClient.clear()
    }
  })
  .catch((error) => {
    console.error('[MAIN] Error checking app version:', error)
  })
  .finally(() => {
    // Render app regardless of version check result
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  })
