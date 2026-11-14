import "dotenv/config"
import { PDFParse } from "pdf-parse";
import fs from "fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {CohereEmbeddings} from "@langchain/cohere"
import { Pinecone } from '@pinecone-database/pinecone';

const parser = new PDFParse({
  data: await fs.readFile("./story.pdf"),
});


//Extract the text from the pdf
const text = (await parser.getText({pageJoiner:""})).text;


const textsplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100
})

//Split the text into chunks
const chunks = await textsplitter.splitText(text);

// Initializing embeddings (using embedding model)
const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHORE_API_KEY,
    model: "embed-v5.0-fast"
})


const vectors = await embeddings.embedDocuments(chunks);



//Initializing PINECONE client
const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY});


const index = pc.Index({
    name: "cohort-3-rag",
})

//Vectors storing to Vector DB
await index.documents.upsert({
  documents: vectors.map((embedding, index) => ({
    _id: `chunk-${index}`,
    embedding,
    content: chunks[index],
  })),
});