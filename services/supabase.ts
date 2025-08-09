import { createClient } from '@supabase/supabase-js'

// Types for vector embeddings
export interface FileEmbedding {
  id: string
  file_path: string
  file_name: string
  content: string
  embedding: number[]
  metadata: {
    size: number
    language?: string
    last_modified: string
    project_id?: string
    repository?: string
  }
  created_at: string
}

export interface SearchResult {
  file_path: string
  file_name: string
  content: string
  similarity: number
  metadata: FileEmbedding['metadata']
}

class SupabaseService {
  private supabase: any = null
  private isInitialized = false

  async initialize(supabaseUrl: string, supabaseKey: string) {
    try {
      this.supabase = createClient(supabaseUrl, supabaseKey)
      this.isInitialized = true
      
      // Test connection
      const { data, error } = await this.supabase.from('file_embeddings').select('count').limit(1)
      if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist"
        throw error
      }
      
      return { success: true, message: 'Connected to Supabase successfully' }
    } catch (error) {
      console.error('Failed to initialize Supabase:', error)
      return { success: false, message: `Failed to connect: ${error}` }
    }
  }

  private checkInitialized() {
    if (!this.isInitialized || !this.supabase) {
      throw new Error('Supabase not initialized. Please call initialize() first.')
    }
  }

  // Generate embeddings using OpenAI (or similar service)
  async generateEmbedding(text: string): Promise<number[]> {
    // In a real implementation, you'd call OpenAI's embedding API
    // For now, we'll simulate embeddings with random vectors
    const dimension = 1536 // OpenAI ada-002 dimension
    return Array.from({ length: dimension }, () => Math.random() * 2 - 1)
  }

  // Store file with embedding
  async storeFileEmbedding(
    filePath: string,
    fileName: string,
    content: string,
    metadata: Partial<FileEmbedding['metadata']> = {}
  ): Promise<{ success: boolean; message: string; id?: string }> {
    this.checkInitialized()

    try {
      // Generate embedding for file content
      const embedding = await this.generateEmbedding(content)
      
      const fileEmbedding: Omit<FileEmbedding, 'id' | 'created_at'> = {
        file_path: filePath,
        file_name: fileName,
        content: content.substring(0, 8000), // Limit content size
        embedding,
        metadata: {
          size: content.length,
          last_modified: new Date().toISOString(),
          ...metadata
        }
      }

      const { data, error } = await this.supabase
        .from('file_embeddings')
        .insert([fileEmbedding])
        .select()

      if (error) throw error

      return {
        success: true,
        message: 'File embedding stored successfully',
        id: data[0]?.id
      }
    } catch (error) {
      console.error('Error storing file embedding:', error)
      return {
        success: false,
        message: `Failed to store embedding: ${error}`
      }
    }
  }

  // Search files using vector similarity
  async searchFiles(
    query: string,
    limit: number = 10,
    threshold: number = 0.7,
    projectId?: string
  ): Promise<SearchResult[]> {
    this.checkInitialized()

    try {
      // Generate embedding for search query
      const queryEmbedding = await this.generateEmbedding(query)
      
      // Build the RPC call for vector similarity search
      let rpcCall = this.supabase.rpc('search_files', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit
      })

      // Add project filter if specified
      if (projectId) {
        rpcCall = rpcCall.eq('metadata->project_id', projectId)
      }

      const { data, error } = await rpcCall

      if (error) throw error

      return data.map((item: any) => ({
        file_path: item.file_path,
        file_name: item.file_name,
        content: item.content,
        similarity: item.similarity,
        metadata: item.metadata
      }))
    } catch (error) {
      console.error('Error searching files:', error)
      throw error
    }
  }

  // Get all files for a project
  async getProjectFiles(projectId: string): Promise<FileEmbedding[]> {
    this.checkInitialized()

    try {
      const { data, error } = await this.supabase
        .from('file_embeddings')
        .select('*')
        .eq('metadata->project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching project files:', error)
      throw error
    }
  }

  // Delete file embedding
  async deleteFileEmbedding(id: string): Promise<{ success: boolean; message: string }> {
    this.checkInitialized()

    try {
      const { error } = await this.supabase
        .from('file_embeddings')
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        success: true,
        message: 'File embedding deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting file embedding:', error)
      return {
        success: false,
        message: `Failed to delete embedding: ${error}`
      }
    }
  }

  // Update file embedding
  async updateFileEmbedding(
    id: string,
    content: string,
    metadata: Partial<FileEmbedding['metadata']> = {}
  ): Promise<{ success: boolean; message: string }> {
    this.checkInitialized()

    try {
      // Generate new embedding for updated content
      const embedding = await this.generateEmbedding(content)
      
      const updates = {
        content: content.substring(0, 8000),
        embedding,
        metadata: {
          ...metadata,
          size: content.length,
          last_modified: new Date().toISOString()
        }
      }

      const { error } = await this.supabase
        .from('file_embeddings')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      return {
        success: true,
        message: 'File embedding updated successfully'
      }
    } catch (error) {
      console.error('Error updating file embedding:', error)
      return {
        success: false,
        message: `Failed to update embedding: ${error}`
      }
    }
  }

  // Get database setup SQL
  getSetupSQL(): string {
    return `
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the file_embeddings table
CREATE TABLE IF NOT EXISTS file_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for vector similarity search
CREATE INDEX IF NOT EXISTS file_embeddings_embedding_idx 
ON file_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create a function for similarity search
CREATE OR REPLACE FUNCTION search_files(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  file_path TEXT,
  file_name TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    file_path,
    file_name,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM file_embeddings
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS file_embeddings_file_path_idx ON file_embeddings(file_path);
CREATE INDEX IF NOT EXISTS file_embeddings_metadata_idx ON file_embeddings USING GIN(metadata);
    `.trim()
  }
}

export const supabaseService = new SupabaseService()
