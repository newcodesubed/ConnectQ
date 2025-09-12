import dotenv from 'dotenv';
dotenv.config();

const config = {
geminiApiKey: process.env.GEMINI_API_KEY,
  pineconeApiKey: process.env.PINECONE_API_KEY,
  pineconeIndexName: process.env.PINECONE_INDEX_NAME
};

export default config;