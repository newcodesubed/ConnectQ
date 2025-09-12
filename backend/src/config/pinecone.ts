import { Pinecone } from '@pinecone-database/pinecone';
import config from '.';

if (!config.pineconeApiKey || !config.pineconeIndexName) {
  throw new Error('Pinecone API key and index name are required.');
}

const pinecone = new Pinecone({
  apiKey: config.pineconeApiKey,
});

const index = pinecone.index(config.pineconeIndexName);

export { pinecone, index };