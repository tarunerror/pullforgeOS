export interface Application {
  id: string
  name: string
  description: string
  icon: string
  category: 'browser' | 'development' | 'productivity' | 'entertainment' | 'system'
  version: string
  size: string
  developer: string
  url?: string
  executable?: string
  installed: boolean
  featured: boolean
  screenshots: string[]
  permissions: string[]
}

export interface InstallationProgress {
  appId: string
  progress: number
  status: 'downloading' | 'installing' | 'completed' | 'error'
  message: string
}

class AppStoreService {
  private installedApps: Set<string> = new Set()
  private installationListeners: Map<string, (progress: InstallationProgress) => void> = new Map()

  // Predefined applications that can be "installed"
  private availableApps: Application[] = [
    {
      id: 'chrome',
      name: 'Google Chrome',
      description: 'Fast, secure web browser with built-in developer tools',
      icon: '🌐',
      category: 'browser',
      version: '120.0.0',
      size: '95 MB',
      developer: 'Google',
      url: 'https://www.google.com/chrome/',
      installed: false,
      featured: true,
      screenshots: [],
      permissions: ['Internet Access', 'File System Access']
    },
    {
      id: 'brave',
      name: 'Brave Browser',
      description: 'Privacy-focused browser with built-in ad blocker',
      icon: '🦁',
      category: 'browser',
      version: '1.60.0',
      size: '85 MB',
      developer: 'Brave Software',
      url: 'https://brave.com/',
      installed: false,
      featured: true,
      screenshots: [],
      permissions: ['Internet Access', 'File System Access']
    },
    {
      id: 'firefox',
      name: 'Mozilla Firefox',
      description: 'Open-source web browser focused on privacy and customization',
      icon: '🔥',
      category: 'browser',
      version: '121.0.0',
      size: '78 MB',
      developer: 'Mozilla',
      url: 'https://www.mozilla.org/firefox/',
      installed: false,
      featured: true,
      screenshots: [],
      permissions: ['Internet Access', 'File System Access']
    },
    {
      id: 'vscode',
      name: 'Visual Studio Code',
      description: 'Lightweight but powerful source code editor',
      icon: '📝',
      category: 'development',
      version: '1.85.0',
      size: '120 MB',
      developer: 'Microsoft',
      url: 'https://code.visualstudio.com/',
      installed: false,
      featured: true,
      screenshots: [],
      permissions: ['File System Access', 'Terminal Access']
    },
    {
      id: 'figma',
      name: 'Figma',
      description: 'Collaborative interface design tool',
      icon: '🎨',
      category: 'productivity',
      version: '116.0.0',
      size: '65 MB',
      developer: 'Figma Inc.',
      url: 'https://www.figma.com/',
      installed: false,
      featured: false,
      screenshots: [],
      permissions: ['Internet Access', 'File System Access']
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Voice, video and text communication service',
      icon: '💬',
      category: 'entertainment',
      version: '0.0.30',
      size: '45 MB',
      developer: 'Discord Inc.',
      url: 'https://discord.com/',
      installed: false,
      featured: false,
      screenshots: [],
      permissions: ['Internet Access', 'Microphone Access', 'Camera Access']
    },
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Music streaming service',
      icon: '🎵',
      category: 'entertainment',
      version: '1.2.25',
      size: '55 MB',
      developer: 'Spotify AB',
      url: 'https://open.spotify.com/',
      installed: false,
      featured: false,
      screenshots: [],
      permissions: ['Internet Access', 'Audio Access']
    }
  ]

  constructor() {
    // Load installed apps from localStorage
    const stored = localStorage.getItem('pullforge_installed_apps')
    if (stored) {
      this.installedApps = new Set(JSON.parse(stored))
      this.updateInstalledStatus()
    }
  }

  private updateInstalledStatus() {
    this.availableApps.forEach(app => {
      app.installed = this.installedApps.has(app.id)
    })
  }

  private saveInstalledApps() {
    localStorage.setItem('pullforge_installed_apps', JSON.stringify(Array.from(this.installedApps)))
  }

  // Get all available applications
  getAvailableApps(): Application[] {
    return [...this.availableApps]
  }

  // Get installed applications
  getInstalledApps(): Application[] {
    return this.availableApps.filter(app => app.installed)
  }

  // Get featured applications
  getFeaturedApps(): Application[] {
    return this.availableApps.filter(app => app.featured)
  }

  // Get applications by category
  getAppsByCategory(category: Application['category']): Application[] {
    return this.availableApps.filter(app => app.category === category)
  }

  // Search applications
  searchApps(query: string): Application[] {
    const lowercaseQuery = query.toLowerCase()
    return this.availableApps.filter(app => 
      app.name.toLowerCase().includes(lowercaseQuery) ||
      app.description.toLowerCase().includes(lowercaseQuery) ||
      app.developer.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Install an application
  async installApp(appId: string): Promise<boolean> {
    const app = this.availableApps.find(a => a.id === appId)
    if (!app) {
      throw new Error(`Application ${appId} not found`)
    }

    if (app.installed) {
      throw new Error(`Application ${app.name} is already installed`)
    }

    // Simulate installation process
    return new Promise((resolve) => {
      const listener = this.installationListeners.get(appId)
      
      // Simulate download progress
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        
        if (progress < 50) {
          listener?.({
            appId,
            progress: Math.min(progress, 50),
            status: 'downloading',
            message: `Downloading ${app.name}...`
          })
        } else if (progress < 100) {
          listener?.({
            appId,
            progress: Math.min(progress, 99),
            status: 'installing',
            message: `Installing ${app.name}...`
          })
        } else {
          clearInterval(interval)
          
          // Mark as installed
          this.installedApps.add(appId)
          app.installed = true
          this.saveInstalledApps()
          
          listener?.({
            appId,
            progress: 100,
            status: 'completed',
            message: `${app.name} installed successfully!`
          })
          
          resolve(true)
        }
      }, 200)
    })
  }

  // Uninstall an application
  async uninstallApp(appId: string): Promise<boolean> {
    const app = this.availableApps.find(a => a.id === appId)
    if (!app) {
      throw new Error(`Application ${appId} not found`)
    }

    if (!app.installed) {
      throw new Error(`Application ${app.name} is not installed`)
    }

    // Remove from installed apps
    this.installedApps.delete(appId)
    app.installed = false
    this.saveInstalledApps()

    return true
  }

  // Launch an application (opens within the OS)
  launchApp(appId: string, windowManager?: any): boolean {
    const app = this.availableApps.find(a => a.id === appId)
    if (!app) {
      throw new Error(`Application ${appId} not found`)
    }

    if (!app.installed) {
      throw new Error(`Application ${app.name} is not installed`)
    }

    if (app.url && windowManager) {
      // Launch app in embedded browser within the OS
      windowManager.openWindow({
        title: app.name,
        component: 'browser',
        isMinimized: false,
        isMaximized: false,
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        size: { width: 1200, height: 800 },
        data: {
          url: app.url,
          title: app.name,
          appId: app.id
        }
      })
      return true
    }

    // Fallback for apps without URLs or window manager
    if (app.url) {
      window.open(app.url, '_blank')
      return true
    }

    // For native apps, we'd need to integrate with system APIs
    alert(`Launching ${app.name}... (This would integrate with system APIs in a real implementation)`)
    return true
  }

  // Add installation progress listener
  addInstallationListener(appId: string, callback: (progress: InstallationProgress) => void) {
    this.installationListeners.set(appId, callback)
  }

  // Remove installation progress listener
  removeInstallationListener(appId: string) {
    this.installationListeners.delete(appId)
  }

  // Get application by ID
  getApp(appId: string): Application | undefined {
    return this.availableApps.find(app => app.id === appId)
  }

  // Check if app is installed
  isAppInstalled(appId: string): boolean {
    return this.installedApps.has(appId)
  }
}

export const appStoreService = new AppStoreService()
export default appStoreService
