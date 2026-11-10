import { START, END, StateGraph } from "@langchain/langgraph";
import * as z from "zod";
import { LLMNode } from "./nodes.js";
import rl from "../utils/readline.js";
import { HumanMessage } from "langchain";

const state = z.object({
  messages: z.array(z.any()),
});

const graph = new StateGraph(state)
  .addNode("LLMNode", LLMNode)
  .addEdge(START, "LLMNode")
  .addEdge("LLMNode", END)
  .compile();

export default async function initGraph() {
  while (true) {
    const userInput = await rl.question("[User]: ");

    const reponse = await graph.invoke({
      messages: [new HumanMessage(userInput)],
    });

    console.log("[AI]: ", reponse);
  }
}
