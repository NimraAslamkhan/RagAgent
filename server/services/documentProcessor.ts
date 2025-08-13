import fs from "fs";
import path from "path";
import { generateEmbedding } from "./openai.js";
import { storage } from "../storage.js";

// Simple PDF text extraction (for production, use a proper PDF parser)
function extractPdfText(filePath: string): string {
  // For now, we'll return a placeholder. In production, use pdf-parse or similar
  const buffer = fs.readFileSync(filePath);
  // This is a simplified implementation - in production you'd use pdf-parse
  return buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, '');
}

function extractTxtText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk.trim());
    
    if (end === text.length) break;
    start = end - overlap;
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Filter out very short chunks
}

export async function processDocument(documentId: string, filePath: string, fileType: string): Promise<void> {
  try {
    let text: string;
    
    // Extract text based on file type
    if (fileType === 'application/pdf') {
      text = extractPdfText(filePath);
    } else if (fileType === 'text/plain') {
      text = extractTxtText(filePath);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
    
    // Update document with extracted content
    const document = await storage.getDocument(documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Update document with content
    document.content = text;
    await storage.updateDocumentStatus(documentId, 'processing');
    
    // Create chunks
    const chunks = chunkText(text);
    
    // Generate embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk);
      
      await storage.createDocumentChunk({
        documentId,
        content: chunk,
        embedding,
        chunkIndex: i,
      });
    }
    
    // Mark document as processed
    await storage.updateDocumentStatus(documentId, 'active', new Date());
    
    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    await storage.updateDocumentStatus(documentId, 'error');
    throw error;
  }
}
