# 🧠 Pullforge OS - Browser-Based Operating System

A powerful browser-based operating system interface with AI agents, code editor, terminal, and file management capabilities.

## ✨ Features

### 🖥️ Desktop Environment
- **Windows OS-like Interface**: Draggable and resizable windows
- **App Launcher**: Quick access to all applications
- **Taskbar**: Window management and system information
- **Modern UI**: Dark theme with smooth animations

### 📱 Core Applications

#### 🖥️ Terminal
- **WebContainer Integration**: Run Node.js, npm, git commands in browser
- **XTerm.js Interface**: Full-featured terminal emulator
- **Browser-side Execution**: No server required

#### 💻 Code Editor
- **Monaco Editor**: VS Code-like editing experience
- **Multi-language Support**: JavaScript, TypeScript, Python, HTML, CSS, Markdown
- **AI Assistant**: Code explanation, optimization, and generation
- **File Explorer**: Integrated file tree navigation
- **Syntax Highlighting**: Advanced code highlighting and IntelliSense

#### 💬 AI Chat
- **Multiple AI Agents**: Specialized assistants for different tasks
  - 🔧 Coding Assistant: Programming help and code review
  - 🎨 Design Assistant: UI/UX guidance and layouts
  - 📝 Writing Assistant: Documentation and content creation
  - ⚙️ DevOps Assistant: Deployment and infrastructure
  - ✨ General Assistant: Task automation and general queries
- **OpenRouter Integration**: Access to multiple LLM providers
- **Context-aware**: Understands your current project

#### 📁 File Explorer
- **File Management**: Upload, download, delete, rename files
- **Multiple View Modes**: List and grid views
- **Search Functionality**: Find files quickly
- **Context Menus**: Right-click actions
- **File Type Recognition**: Icons and handling for different file types

## 🚀 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Draggable**: Window dragging functionality
- **React Resizable**: Window resizing capabilities
- **Monaco Editor**: Code editing interface
- **XTerm.js**: Terminal emulation
- **Lucide React**: Modern icon library

### Backend & Services
- **WebContainer**: Browser-based Node.js runtime
- **OpenRouter API**: AI model access (planned)
- **Supabase**: Authentication, storage, and vector database (planned)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/tarunerror/pullforgeOS.git
   cd pullforgeOS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Environment Variables (Optional)
Create a `.env.local` file for API keys:
```env
OPENROUTER_API_KEY=your_openrouter_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## 📖 Usage Guide

### Getting Started
1. **Launch Applications**: Click the grid icon (top-left) to open the app launcher
2. **Open Terminal**: Start with the Terminal app to run commands
3. **Code Editor**: Open files and start coding with AI assistance
4. **AI Chat**: Get help from specialized AI agents
5. **File Management**: Use File Explorer to manage your project files

### Keyboard Shortcuts
- **Ctrl+S**: Save file (in Code Editor)
- **Enter**: Send message (in Chat)
- **Shift+Enter**: New line (in Chat)

### Window Management
- **Drag**: Click and drag window title bar to move
- **Resize**: Drag window edges or corners to resize
- **Minimize**: Click minus button in window header
- **Maximize**: Click maximize button in window header
- **Close**: Click X button in window header

## 🔮 Phase 2 Features ✅

### Completed Features
- [x] **GitHub Integration**: Clone repos, create PRs with AI assistance
- [x] **Vector Embeddings**: Contextual file search with Supabase
- [x] **Live Preview**: Real-time web project preview
- [x] **Workflow Automation**: n8n integration for task automation
- [x] **Supabase Authentication**: Secure user authentication with GitHub OAuth
- [x] **GitHub App Integration**: Repository access via GitHub App installation

### Phase 3 (Upcoming)
- [ ] **Multi-user Support**: Collaborative editing and chat
- [ ] **Real-time Collaboration**: Live code editing with multiple users
- [ ] **Advanced AI Features**: Code generation, debugging assistance
- [ ] **Plugin System**: Extensible architecture for custom apps
- [ ] **Plugin System**: Extensible app architecture
- [ ] **Cloud Sync**: Cross-device file synchronization
- [ ] **Advanced AI**: Custom model fine-tuning

## 🏗️ Architecture

```
ai-os/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # Shared components
│   ├── Desktop.tsx        # Main desktop interface
│   ├── Window.tsx         # Window management
│   ├── Taskbar.tsx        # Bottom taskbar
│   └── AppLauncher.tsx    # Application launcher
├── apps/                  # Individual applications
│   ├── terminal/          # Terminal app
│   ├── code-editor/       # Code editor app
│   ├── chat/              # AI chat app
│   └── file-explorer/     # File management app
├── contexts/              # React contexts
│   └── WindowContext.tsx  # Window state management
└── styles/                # Additional styles
    └── resizable.css      # Window resizing styles
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **WebContainer**: Browser-based Node.js runtime by StackBlitz
- **Monaco Editor**: VS Code's editor in the browser
- **XTerm.js**: Terminal emulator for the web
- **OpenRouter**: Multi-model AI API access
- **Supabase**: Backend-as-a-Service platform

---

**Built with ❤️ for the future of browser-based development**

🚀 **Ready to experience the future of coding in your browser? Let's build something amazing!**
