import "dotenv/config";
import { START, END, StateGraph } from "@langchain/langgraph";
import * as z from "zod";


const introNode = (state) => {
  return {
    messages: [
      ...state.messages,
      {
        role: "ai",
        content: "Hi, I am your AI assistant. Happy talking you...!",
      },
    ],
  };
};

const graph = new StateGraph(z.object({ messages: z.array(z.any()) }))
  .addNode("introNode", introNode)
  .addEdge(START, "introNode")
  .addEdge("introNode", END)
  .compile();

const graphResult = await graph.invoke({
  messages: [
    {
      role: "user",
      content: "Hello, world!",
    },
  ],
});

console.log(graphResult);
