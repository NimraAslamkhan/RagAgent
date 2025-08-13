import { type Document, type InsertDocument, type DocumentChunk, type InsertDocumentChunk, type Query, type InsertQuery } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  updateDocumentStatus(id: string, status: string, processedAt?: Date): Promise<void>;
  deleteDocument(id: string): Promise<void>;
  
  // Document chunk operations
  createDocumentChunk(chunk: InsertDocumentChunk): Promise<DocumentChunk>;
  getDocumentChunks(documentId: string): Promise<DocumentChunk[]>;
  getAllChunks(): Promise<DocumentChunk[]>;
  deleteDocumentChunks(documentId: string): Promise<void>;
  
  // Query operations
  createQuery(query: InsertQuery): Promise<Query>;
  getAllQueries(): Promise<Query[]>;
  
  // Analytics
  getDocumentCount(): Promise<number>;
  getQueryCount(): Promise<number>;
  getEmbeddingCount(): Promise<number>;
  getAverageResponseTime(): Promise<number>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document>;
  private chunks: Map<string, DocumentChunk>;
  private queries: Map<string, Query>;

  constructor() {
    this.documents = new Map();
    this.chunks = new Map();
    this.queries = new Map();
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = { 
      ...insertDocument, 
      id, 
      uploadedAt: new Date(),
      processedAt: null,
      status: insertDocument.status || "processing"
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async updateDocumentStatus(id: string, status: string, processedAt?: Date): Promise<void> {
    const document = this.documents.get(id);
    if (document) {
      document.status = status;
      if (processedAt) {
        document.processedAt = processedAt;
      }
      this.documents.set(id, document);
    }
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
    // Also delete associated chunks
    await this.deleteDocumentChunks(id);
  }

  async createDocumentChunk(insertChunk: InsertDocumentChunk): Promise<DocumentChunk> {
    const id = randomUUID();
    const chunk: DocumentChunk = { 
      ...insertChunk, 
      id, 
      createdAt: new Date(),
      embedding: insertChunk.embedding || null
    };
    this.chunks.set(id, chunk);
    return chunk;
  }

  async getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
    return Array.from(this.chunks.values()).filter(chunk => chunk.documentId === documentId);
  }

  async getAllChunks(): Promise<DocumentChunk[]> {
    return Array.from(this.chunks.values());
  }

  async deleteDocumentChunks(documentId: string): Promise<void> {
    const chunksToDelete: string[] = [];
    const chunksArray = Array.from(this.chunks.entries());
    for (const [id, chunk] of chunksArray) {
      if (chunk.documentId === documentId) {
        chunksToDelete.push(id);
      }
    }
    chunksToDelete.forEach(id => this.chunks.delete(id));
  }

  async createQuery(insertQuery: InsertQuery): Promise<Query> {
    const id = randomUUID();
    const query: Query = { 
      ...insertQuery, 
      id, 
      createdAt: new Date(),
      confidence: insertQuery.confidence || null,
      responseTime: insertQuery.responseTime || null,
      referencedDocuments: insertQuery.referencedDocuments || null
    };
    this.queries.set(id, query);
    return query;
  }

  async getAllQueries(): Promise<Query[]> {
    return Array.from(this.queries.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getDocumentCount(): Promise<number> {
    return this.documents.size;
  }

  async getQueryCount(): Promise<number> {
    return this.queries.size;
  }

  async getEmbeddingCount(): Promise<number> {
    return this.chunks.size;
  }

  async getAverageResponseTime(): Promise<number> {
    const queries = Array.from(this.queries.values());
    if (queries.length === 0) return 0;
    
    const totalTime = queries.reduce((sum, query) => sum + (query.responseTime || 0), 0);
    return totalTime / queries.length;
  }
}

export const storage = new MemStorage();
