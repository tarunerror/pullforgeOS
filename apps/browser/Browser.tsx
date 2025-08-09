'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Search, 
  Lock,
  X,
  Plus,
  ExternalLink
} from 'lucide-react'

interface BrowserProps {
  windowId: string
  data?: { url?: string }
}

interface Tab {
  id: string
  url: string
  title: string
  isLoading: boolean
  error: boolean
  history: string[]
  historyIndex: number
}

export default function Browser({ windowId, data }: BrowserProps) {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')
  const [addressBarUrl, setAddressBarUrl] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const getProxyUrl = (url: string) => {
    if (!url || url.startsWith('about:blank') || url.startsWith(window.location.origin)) {
      return url
    }
    return `/api/proxy?url=${encodeURIComponent(url)}`
  }

  const getPageTitle = (url: string): string => {
    try {
      const hostname = new URL(url).hostname
      return hostname.replace(/^www\./, '')
    } catch (e) {
      return 'Loading...'
    }
  }

  const createNewTab = (url: string = 'https://www.google.com') => {
    const newTabId = `tab-${Date.now()}`
    const newTab: Tab = {
      id: newTabId,
      url: url,
      title: getPageTitle(url),
      isLoading: true,
      error: false,
      history: [url],
      historyIndex: 0,
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTabId)
  }

  useEffect(() => {
    const initialUrl = data?.url || 'https://www.google.com'
    createNewTab(initialUrl)
  }, [data])

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  useEffect(() => {
    if (activeTab) {
      setAddressBarUrl(activeTab.url)
    }
  }, [activeTab])

  const closeTab = (tabId: string) => {
    const tabIndex = tabs.findIndex(tab => tab.id === tabId)
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    
    if (newTabs.length === 0) {
      createNewTab()
    } else if (activeTabId === tabId) {
      const newActiveIndex = Math.max(0, tabIndex - 1)
      setActiveTabId(newTabs[newActiveIndex].id)
    }
    setTabs(newTabs)
  }

  const navigate = (url: string) => {
    if (!activeTab) return
    const newHistory = [...activeTab.history.slice(0, activeTab.historyIndex + 1), url]
    setTabs(tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url, title: getPageTitle(url), isLoading: true, error: false, history: newHistory, historyIndex: newHistory.length - 1 }
        : tab
    ))
  }

  const goBack = () => {
    if (activeTab && activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1
      const newUrl = activeTab.history[newIndex]
      setTabs(tabs.map(tab => 
        tab.id === activeTabId ? { ...tab, url: newUrl, historyIndex: newIndex, isLoading: true, error: false } : tab
      ))
    }
  }

  const goForward = () => {
    if (activeTab && activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1
      const newUrl = activeTab.history[newIndex]
      setTabs(tabs.map(tab => 
        tab.id === activeTabId ? { ...tab, url: newUrl, historyIndex: newIndex, isLoading: true, error: false } : tab
      ))
    }
  }

  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const handleAddressBarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    let url = addressBarUrl
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    navigate(url)
  }

  const handleIframeLoad = () => {
    if (!activeTab) return
    try {
      const iframeLocation = iframeRef.current?.contentWindow?.location.href
      if (iframeLocation && iframeLocation !== 'about:blank') {
        const proxiedUrl = new URL(iframeLocation).searchParams.get('url')
        if (proxiedUrl && proxiedUrl !== activeTab.url) {
          // Update state if iframe navigated internally
          navigate(proxiedUrl)
        }
      }
    } catch (e) {
      // Cross-origin error, expected
    }
    setTabs(tabs.map(tab => tab.id === activeTabId ? { ...tab, isLoading: false, error: false } : tab))
  }

  const handleIframeError = () => {
    if (!activeTab) return
    setTabs(tabs.map(tab => tab.id === activeTabId ? { ...tab, isLoading: false, error: true } : tab))
  }

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col text-gray-800">
      <div className="bg-gray-200 flex items-center pr-2">
        <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 border-r border-gray-300 cursor-pointer transition-colors ${
                activeTabId === tab.id ? 'bg-white' : 'hover:bg-gray-300/50'
              }`}
            >
              <span className="text-sm whitespace-nowrap">{tab.isLoading ? 'Loading...' : tab.title}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
                className="p-1 rounded-full hover:bg-gray-400/50"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => createNewTab()} className="p-2 rounded-full hover:bg-gray-300/50">
          <Plus size={16} />
        </button>
      </div>

      <div className="bg-white border-b border-gray-300 px-3 py-2 flex items-center space-x-2">
        <button onClick={goBack} disabled={!activeTab || activeTab.historyIndex <= 0} className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50">
          <ArrowLeft size={18} />
        </button>
        <button onClick={goForward} disabled={!activeTab || activeTab.historyIndex >= activeTab.history.length - 1} className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50">
          <ArrowRight size={18} />
        </button>
        <button onClick={refresh} className="p-2 rounded-full hover:bg-gray-200">
          <RotateCcw size={18} />
        </button>
        <button onClick={() => navigate('https://www.google.com')} className="p-2 rounded-full hover:bg-gray-200">
          <Home size={18} />
        </button>

        <form onSubmit={handleAddressBarSubmit} className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-1 border border-transparent focus-within:border-blue-500 focus-within:bg-white">
          <Lock size={14} className="text-green-600 mr-2" />
          <input
            type="text"
            value={addressBarUrl}
            onChange={(e) => setAddressBarUrl(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full bg-transparent outline-none text-sm"
            placeholder="Search or type a URL"
          />
        </form>
      </div>

      <div className="flex-1 relative bg-white">
        {tabs.map(tab => (
          <iframe
            key={tab.id}
            ref={activeTabId === tab.id ? iframeRef : null}
            src={getProxyUrl(tab.url)}
            className="w-full h-full border-none"
            style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        ))}
        
        {activeTab?.error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 bg-gray-50">
            <div className="text-center max-w-lg">
              <h2 className="text-xl font-semibold mb-2">Failed to load page</h2>
              <p className="text-sm mb-4 text-gray-500">
                There was an error loading <strong>{activeTab.url}</strong>.
              </p>
              <button
                onClick={() => window.open(activeTab.url, '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ExternalLink size={16} />
                <span>Open in New Tab</span>
              </button>
            </div>
          </div>
        )}
        
        {activeTab?.isLoading && !activeTab.error && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <div className="flex items-center space-x-3">
              <RotateCcw className="animate-spin text-blue-500" size={24} />
              <span className="text-gray-600">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
