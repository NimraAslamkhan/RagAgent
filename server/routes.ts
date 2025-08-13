import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage.js";
import { processDocument } from "./services/documentProcessor.js";
import { searchSimilarChunks } from "./services/vectorStore.js";
import { generateAnswer } from "./services/openai.js";
import { insertDocumentSchema, insertQuerySchema } from "@shared/schema.js";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  // Upload document
  app.post("/api/documents", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const document = await storage.createDocument({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        content: "",
        status: "uploading",
      });

      // Process document asynchronously
      processDocument(document.id, req.file.path, req.file.mimetype).catch(error => {
        console.error("Document processing failed:", error);
      });

      res.json(document);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to upload document: " + errorMessage });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to fetch documents: " + errorMessage });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      await storage.deleteDocument(req.params.id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to delete document: " + errorMessage });
    }
  });

  // Query documents
  app.post("/api/query", async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ message: "Question is required" });
      }

      const startTime = Date.now();

      // Search for similar chunks
      const similarChunks = await searchSimilarChunks(question, 5);
      
      if (similarChunks.length === 0) {
        return res.status(404).json({ 
          message: "No relevant documents found. Please upload documents first." 
        });
      }

      // Combine context from similar chunks
      const context = similarChunks
        .map(item => item.chunk.content)
        .join('\n\n');

      // Generate answer
      const response = await generateAnswer(question, context);
      
      const responseTime = Date.now() - startTime;
      
      // Get unique document IDs  
      const referencedDocuments = Array.from(new Set(similarChunks.map(item => item.documentId)));
      
      // Calculate confidence based on similarity scores
      const avgSimilarity = similarChunks.reduce((sum, item) => sum + item.similarity, 0) / similarChunks.length;
      const confidence = Math.round(avgSimilarity * 100);

      // Save query
      const query = await storage.createQuery({
        question,
        response,
        confidence: confidence / 100,
        responseTime,
        referencedDocuments,
      });

      res.json({
        ...query,
        similarChunks: similarChunks.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to process query: " + errorMessage });
    }
  });

  // Get all queries
  app.get("/api/queries", async (req, res) => {
    try {
      const queries = await storage.getAllQueries();
      res.json(queries);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to fetch queries: " + errorMessage });
    }
  });

  // Get analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const documentCount = await storage.getDocumentCount();
      const queryCount = await storage.getQueryCount();
      const embeddingCount = await storage.getEmbeddingCount();
      const avgResponseTime = await storage.getAverageResponseTime();

      res.json({
        documentCount,
        queryCount,
        embeddingCount,
        avgResponseTime: Math.round(avgResponseTime) / 1000, // Convert to seconds
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to fetch analytics: " + errorMessage });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
