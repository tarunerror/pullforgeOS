# Pullforge OS Setup Guide

This guide will help you set up Supabase authentication and GitHub App integration for Pullforge OS.

## 🚀 Quick Start

1. **Set up Supabase** (for authentication & vector embeddings)
2. **Create GitHub App** (for repository access)
3. **Configure environment variables**
4. **Run the application**

---

## 📊 Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `pullforge-os`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your location
5. Click "Create new project"

### Step 2: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **GitHub** provider:
   - Toggle "Enable sign in with GitHub"
   - You'll need GitHub OAuth credentials (we'll create these next)

### Step 3: Set up Database Schema

Run these SQL commands in **SQL Editor**:

```sql
-- Enable the pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create user_embeddings table
CREATE TABLE user_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON user_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Create RLS policies
ALTER TABLE user_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own embeddings" ON user_embeddings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own embeddings" ON user_embeddings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own embeddings" ON user_embeddings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own embeddings" ON user_embeddings
  FOR DELETE USING (auth.uid() = user_id);

-- Create search function
CREATE OR REPLACE FUNCTION search_user_embeddings(
  query_embedding vector(1536),
  user_id UUID,
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  file_id TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    user_embeddings.id,
    user_embeddings.file_id,
    user_embeddings.metadata,
    1 - (user_embeddings.embedding <=> query_embedding) AS similarity
  FROM user_embeddings
  WHERE user_embeddings.user_id = search_user_embeddings.user_id
    AND 1 - (user_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY user_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

### Step 4: Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🐙 GitHub App Setup

### Step 1: Create a GitHub App

1. Go to GitHub **Settings** → **Developer settings** → **GitHub Apps**
2. Click **New GitHub App**
3. Fill in the details:

```
App name: Pullforge OS
Homepage URL: http://localhost:3000
Callback URL: https://your-project-id.supabase.co/auth/v1/callback
Setup URL: http://localhost:3000/auth/setup
Webhook URL: http://localhost:3000/api/webhooks/github
```

### Step 2: Set Permissions

**Repository permissions:**
- Contents: Read & Write
- Metadata: Read
- Pull requests: Read & Write
- Issues: Read & Write

**Account permissions:**
- Email addresses: Read

### Step 3: Configure OAuth

1. In your GitHub App settings, note down:
   - **App ID**
   - **Client ID**
   - **Client Secret** (generate if needed)
2. Generate a **Private Key** and download it

### Step 4: Update Supabase Auth Settings

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Configure GitHub provider:
   - **Client ID**: Your GitHub App Client ID
   - **Client Secret**: Your GitHub App Client Secret
3. Add redirect URL: `http://localhost:3000/auth/callback`

---

## 🔧 Environment Configuration

### Option 1: Environment Variables (Recommended)

Create `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GitHub App
GITHUB_APP_ID=123456
GITHUB_CLIENT_ID=Iv1.abc123def456
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

# Optional: OpenAI for embeddings
OPENAI_API_KEY=sk-...
```

### Option 2: Runtime Configuration

If you prefer to configure at runtime, you can enter credentials in the app:

1. Open Pullforge OS
2. Try to use Smart Search or GitHub features
3. You'll be prompted to configure Supabase and authenticate

---

## 🚦 Installation & Running

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pullforge-os.git
cd pullforge-os

# Install dependencies
npm install

# Set up environment variables (see above)
cp .env.example .env.local
# Edit .env.local with your credentials

# Run the development server
npm run dev
```

### First Run

1. Open [http://localhost:3000](http://localhost:3000)
2. Click on any app that requires authentication (Smart Search, GitHub)
3. Follow the authentication flow:
   - Configure Supabase (if not using env vars)
   - Sign in with GitHub
   - Grant permissions to your repositories

---

## 🔐 GitHub App Installation

### For Your Own Repositories

1. Go to your GitHub App settings
2. Click "Install App"
3. Choose your account/organization
4. Select repositories to grant access to
5. Click "Install"

### For Organization Repositories

1. Share your GitHub App URL with organization owners
2. They can install it on their organization
3. You'll have access to repositories they grant permissions for

### Installation URL Format

```
https://github.com/apps/your-app-name/installations/new
```

---

## 🧪 Testing the Setup

### Test Authentication

1. Open Smart Search app
2. You should be prompted to authenticate
3. Complete the GitHub OAuth flow
4. Verify you can see your user info

### Test Vector Embeddings

1. In Smart Search, try uploading a file
2. Verify it appears in your embeddings list
3. Try searching for content

### Test GitHub Integration

1. Open GitHub app
2. You should see your installations
3. Browse repositories you have access to
4. Try creating a branch or PR

---

## 🔧 Troubleshooting

### Common Issues

**"Supabase not initialized"**
- Check your Supabase URL and key
- Verify the project is active
- Check browser console for errors

**"GitHub authentication failed"**
- Verify GitHub App Client ID/Secret
- Check callback URLs match exactly
- Ensure GitHub App is installed

**"Vector search not working"**
- Verify pgvector extension is enabled
- Check if embeddings table exists
- Verify RLS policies are set up

**"Repository access denied"**
- Check GitHub App permissions
- Verify app is installed on the repository
- Check if installation is active

### Getting Help

1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify all URLs and credentials
4. Test with a fresh browser session

---

## 🔒 Security Considerations

### Production Deployment

- Use environment variables for all secrets
- Enable HTTPS for all URLs
- Set up proper CORS policies
- Use Supabase RLS for data security
- Regularly rotate GitHub App secrets

### Data Privacy

- User embeddings are isolated by user ID
- GitHub tokens are stored securely in Supabase
- No sensitive data is stored in localStorage
- All API calls use secure authentication

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 🆘 Support

If you encounter issues:

1. Check this setup guide thoroughly
2. Review the troubleshooting section
3. Check GitHub issues for similar problems
4. Create a new issue with detailed error information

Happy coding with Pullforge OS! 🚀
