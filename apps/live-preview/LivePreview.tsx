'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Square, 
  RefreshCw, 
  ExternalLink, 
  Monitor, 
  Smartphone, 
  Tablet,
  Settings,
  Code,
  Eye,
  Globe,
  Zap,
  AlertCircle
} from 'lucide-react'

interface LivePreviewProps {
  windowId: string
  data?: any
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile' | 'custom'
type PreviewMode = 'iframe' | 'popup' | 'embedded'

interface ProjectFile {
  name: string
  content: string
  type: 'html' | 'css' | 'js' | 'json'
}

export default function LivePreview({ windowId, data }: LivePreviewProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('iframe')
  const [customWidth, setCustomWidth] = useState(1200)
  const [customHeight, setCustomHeight] = useState(800)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(1000)
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([
    {
      name: 'index.html',
      type: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview Demo</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>🚀 Pullforge OS Live Preview</h1>
        <p>This is a real-time preview of your web project!</p>
        <button id="demo-btn" class="btn">Click me!</button>
        <div id="output"></div>
    </div>
    <script src="script.js"></script>
</body>
</html>`
    },
    {
      name: 'styles.css',
      type: 'css',
      content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 500px;
    backdrop-filter: blur(10px);
}

h1 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2.5rem;
}

p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

.btn {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

#output {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 10px;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
}`
    },
    {
      name: 'script.js',
      type: 'js',
      content: `document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('demo-btn');
    const output = document.getElementById('output');
    
    let clickCount = 0;
    
    btn.addEventListener('click', function() {
        clickCount++;
        output.innerHTML = \`
            <div style="animation: fadeIn 0.5s ease-in;">
                🎉 Button clicked \${clickCount} time\${clickCount !== 1 ? 's' : ''}!
                <br>
                <small>Live preview is working perfectly!</small>
            </div>
        \`;
    });
    
    // Add some dynamic styling
    const style = document.createElement('style');
    style.textContent = \`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    \`;
    document.head.appendChild(style);
    
    console.log('Pullforge OS Live Preview initialized!');
});`
    }
  ])
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
  const [error, setError] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (autoRefresh && isRunning) {
      refreshTimeoutRef.current = setTimeout(() => {
        generatePreview()
      }, refreshInterval)
    }
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [projectFiles, autoRefresh, refreshInterval, isRunning])

  const generatePreview = () => {
    try {
      const htmlFile = projectFiles.find(f => f.type === 'html')
      const cssFile = projectFiles.find(f => f.type === 'css')
      const jsFile = projectFiles.find(f => f.type === 'js')
      
      if (!htmlFile) {
        setError('No HTML file found')
        return
      }

      let htmlContent = htmlFile.content

      // Inject CSS
      if (cssFile) {
        htmlContent = htmlContent.replace(
          '<link rel="stylesheet" href="styles.css">',
          `<style>${cssFile.content}</style>`
        )
      }

      // Inject JavaScript
      if (jsFile) {
        htmlContent = htmlContent.replace(
          '<script src="script.js"></script>',
          `<script>${jsFile.content}</script>`
        )
      }

      // Create blob URL for preview
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      
      setPreviewUrl(url)
      setError('')
    } catch (err) {
      setError(`Preview generation failed: ${err}`)
    }
  }

  const startPreview = () => {
    setIsRunning(true)
    generatePreview()
  }

  const stopPreview = () => {
    setIsRunning(false)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }
  }

  const refreshPreview = () => {
    if (isRunning) {
      generatePreview()
    }
  }

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  const getViewportDimensions = () => {
    switch (viewportSize) {
      case 'mobile':
        return { width: 375, height: 667 }
      case 'tablet':
        return { width: 768, height: 1024 }
      case 'desktop':
        return { width: 1200, height: 800 }
      case 'custom':
        return { width: customWidth, height: customHeight }
      default:
        return { width: 1200, height: 800 }
    }
  }

  const updateFileContent = (fileName: string, content: string) => {
    setProjectFiles(prev => prev.map(file => 
      file.name === fileName ? { ...file, content } : file
    ))
  }

  const addNewFile = (name: string, type: ProjectFile['type']) => {
    const newFile: ProjectFile = {
      name,
      type,
      content: type === 'html' ? '<!DOCTYPE html>\n<html>\n<head>\n    <title>New Page</title>\n</head>\n<body>\n    <h1>New Page</h1>\n</body>\n</html>' :
               type === 'css' ? '/* New CSS File */\nbody {\n    margin: 0;\n    padding: 20px;\n}' :
               type === 'js' ? '// New JavaScript File\nconsole.log("Hello from new file!");' :
               '{\n    "name": "new-file"\n}'
    }
    setProjectFiles(prev => [...prev, newFile])
  }

  const dimensions = getViewportDimensions()

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Globe className="text-green-400" size={24} />
            <h1 className="text-xl font-bold">Live Preview</h1>
            <span className="text-xs bg-green-600 px-2 py-1 rounded">Real-time</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={isRunning ? stopPreview : startPreview}
              className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? <Square size={14} /> : <Play size={14} />}
              <span>{isRunning ? 'Stop' : 'Start'}</span>
            </button>
            
            <button
              onClick={refreshPreview}
              disabled={!isRunning}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm flex items-center space-x-1"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={openInNewTab}
              disabled={!previewUrl}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-sm flex items-center space-x-1"
            >
              <ExternalLink size={14} />
              <span>Open</span>
            </button>
          </div>
        </div>
        
        {/* Viewport Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewportSize('desktop')}
                className={`p-2 rounded ${viewportSize === 'desktop' ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <Monitor size={16} />
              </button>
              <button
                onClick={() => setViewportSize('tablet')}
                className={`p-2 rounded ${viewportSize === 'tablet' ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <Tablet size={16} />
              </button>
              <button
                onClick={() => setViewportSize('mobile')}
                className={`p-2 rounded ${viewportSize === 'mobile' ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <Smartphone size={16} />
              </button>
            </div>
            
            <div className="text-sm text-gray-400">
              {dimensions.width} × {dimensions.height}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span>Auto-refresh</span>
            </label>
            
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
              >
                <option value={500}>0.5s</option>
                <option value={1000}>1s</option>
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Editor Sidebar */}
        <div className="w-80 border-r border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <h3 className="font-semibold mb-2">Project Files</h3>
            <button
              onClick={() => {
                const name = prompt('File name:')
                const type = prompt('File type (html/css/js/json):') as ProjectFile['type']
                if (name && type) addNewFile(name, type)
              }}
              className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center justify-center space-x-1"
            >
              <Code size={14} />
              <span>New File</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {projectFiles.map((file) => (
              <div
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 ${
                  selectedFile?.name === file.name ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    file.type === 'html' ? 'bg-orange-400' :
                    file.type === 'css' ? 'bg-blue-400' :
                    file.type === 'js' ? 'bg-yellow-400' :
                    'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* File Editor */}
          {selectedFile && (
            <div className="border-t border-gray-700 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <textarea
                value={selectedFile.content}
                onChange={(e) => updateFileContent(selectedFile.name, e.target.value)}
                className="w-full h-40 bg-gray-800 border border-gray-700 rounded p-2 text-sm font-mono resize-none"
                placeholder="Enter your code here..."
              />
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg flex items-center space-x-2">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {isRunning && previewUrl ? (
            <div 
              className="bg-white rounded-lg shadow-2xl overflow-hidden"
              style={{ 
                width: Math.min(dimensions.width, window.innerWidth - 400),
                height: Math.min(dimensions.height, window.innerHeight - 200)
              }}
            >
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-0"
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 mb-2">
                {isRunning ? 'Generating preview...' : 'Click Start to begin live preview'}
              </p>
              <p className="text-sm text-gray-500">
                Your web project will appear here in real-time
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
