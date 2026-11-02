import { ChatGroq } from "@langchain/groq";
import "dotenv/config";
import rl from "readline/promises";

const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API,
});


const readline = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const memory = [];

while (true) {

  const userInput = await readline.question("> ");

  memory.push({
    role: "user",
    content: userInput,
  });
  //for response all at once
  // const response = await model.invoke("Hey");
  
  const response = await model.stream(memory);
  
  let aiResponse = "";

  for await (let chunk of response) {
    aiResponse += chunk.content;
    process.stdout.write(chunk.content);
  }

  memory.push({
    role: "assistant",
    content: aiResponse,
  });
  process.stdout.write("\n");
}
