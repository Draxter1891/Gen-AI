import "dotenv/config"
import { CohereEmbeddings, ChatCohere } from "@langchain/cohere";
import {Pinecone} from "@pinecone-database/pinecone"
import { HumanMessage, ToolMessage } from "langchain";

//Taking user Input
const userInput = "Tell me about Arav's college life"

//Initialize embedding model
const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHORE_API_KEY,
    model: "embed-v5.0-fast"
})

//Creating vector representation of user input
const vector = await embeddings.embedQuery(userInput);

//Initializing Pinecone client
const pc = new Pinecone({
apiKey: process.env.PINECONE_API_KEY
})

const index = pc.Index({
    name:"cohort-3-rag"
})

const results = await index.documents.search({
    topK:3,
    scoreBy:[
        {
            type: "dense_vector", field:["embedding"], values: vector
        }
    ],
    includeFields:["content"]
})



//Initializing LLM Chat model

const chat = new ChatCohere({
    apiKey: process.env.COHORE_API_KEY,
    model: "command-a-03-2025"
})


const messages = []

messages.push(new HumanMessage(userInput));

messages.push(new ToolMessage({
    content: JSON.stringify(results)
}) )


const aiResponse = await chat.stream(messages);

for await(let chunk of aiResponse){
    process.stdout.write(chunk.content)
}

