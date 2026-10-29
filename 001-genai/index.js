import { ChatGroq } from "@langchain/groq";
import "dotenv/config";
import rl from "readline/promises";
import { processSchema } from "zod/v4/core";

const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API,
});

const readline = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});

while (true) {
  const userInput = await readline.question("> ");

  //for response all at once
  // const response = await model.invoke("Hey");

  const response = await model.stream([
    {
      role: "user",
      content: userInput,
    },
  ]);

  for await (let chunk of response) {
    process.stdout.write(chunk.content);
  }
  process.stdout.write("\n")
}
