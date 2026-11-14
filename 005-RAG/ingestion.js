import "dotenv/config"
import { PDFParse } from "pdf-parse";
import fs from "fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {CohereEmbeddings} from "@langchain/cohere"


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


const vector = await embeddings.embedDocuments(chunks);

console.log(vector)