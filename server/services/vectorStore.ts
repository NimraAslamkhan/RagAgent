import { storage } from "../storage.js";
import { generateEmbedding } from "./openai.js";

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchSimilarChunks(query: string, topK: number = 5): Promise<{
  chunk: any;
  similarity: number;
  documentId: string;
}[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Get all chunks
    const chunks = await storage.getAllChunks();
    
    // Calculate similarity scores
    const similarities = chunks.map(chunk => ({
      chunk,
      similarity: chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0,
      documentId: chunk.documentId,
    }));
    
    // Sort by similarity and return top K
    return similarities
      .filter(item => item.similarity > 0.1) // Filter out very low similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Failed to search similar chunks: " + errorMessage);
  }
}
