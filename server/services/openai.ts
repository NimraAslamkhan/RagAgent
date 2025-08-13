import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-default_key"
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Failed to generate embedding: " + errorMessage);
  }
}

export async function generateAnswer(question: string, context: string): Promise<string> {
  try {
    const prompt = `Based on the following context from documents, answer the question. If the context doesn't contain enough information to answer the question, say so clearly.

Context:
${context}

Question: ${question}

Answer:`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant that answers questions based on provided document context. Be accurate, concise, and cite relevant information from the context when possible."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.1,
    });

    return response.choices[0].message.content || "I couldn't generate an answer at this time.";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Failed to generate answer: " + errorMessage);
  }
}
