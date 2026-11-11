import { ChatGroq } from "@langchain/groq";
import { getApiKey } from "../../utils/file.utils.js";
import { AIMessage } from "langchain";
import { upsertFilesTool } from "../tools/tools.js";

/**
 * Handles the LLM node logic for the state graph.
 * @param {Object} state - The current state of the graph.
 * @returns {Promise<Object>} - The updated state after processing.
 */
export async function LLMNode(state) {
  const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: (await getApiKey()).apiKey,
  });

  const modelWithTool = model.bindTools([upsertFilesTool]);

  const stream = await modelWithTool.stream(state.messages);
  process.stdout.write("[AI]: ");

  let aiResponse = "";
  for await (let chunk of stream) {
    aiResponse += chunk.text;
    console.log(chunk);
    process.stdout.write(chunk.text);
  }
  process.stdout.write("\n");
  return {
    messages: [...state.messages, new AIMessage(aiResponse)],
  };
}
