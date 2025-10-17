const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({
  apiKey: process.env.PINECODE_API_KEY,
});

const gptCloneIndex = pc.index('gpt-clone');

async function createMemory({ id, values, metadata }){
    await gptCloneIndex.upsert([{
        id,
        values,
        metadata
    }]);
}

async function queryMemory({ queryVector , topK = 5, metadata }) {
    const response = await gptCloneIndex.query({
        vector: queryVector,
        topK,
        filter: metadata || undefined,
        includeMetadata: true,
    });
    return response.matches;
}

module.exports = { 
    createMemory, 
    queryMemory 
};
