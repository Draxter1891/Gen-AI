import { ChatGroq } from "@langchain/groq";
import { getApiKey } from "../../utils/file.utils.js";
import {
  UpsertFiles,
  ReadFiles,
  ListFiles,
} from "../tools/tools.js";
import * as toolFiles from "../tools/tools.js";

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

  const modelWithTool = model.bindTools([
    UpsertFiles,
    ReadFiles,
    ListFiles,
  ]);

  const stream = await modelWithTool.stream(state.messages);
  process.stdout.write("[Chatur]: ");

  let aiResponse = null;
  for await (let chunk of stream) {
    if (!aiResponse) aiResponse = chunk;
    else aiResponse = aiResponse.concat(chunk);
    process.stdout.write(chunk.text);
  }
  process.stdout.write("\n");
  return {
    messages: [...state.messages, aiResponse],
  };
}

/**
 * handle all the tool calls
 * @param {Object} state - object that consists of all the information about the current state in the graph
 *  @returns {Promise<Object>} an array of object
 */

export async function ToolNode(state) {
  const messages = state.messages;
  const lastMessage = state.messages[messages.length - 1];
  const toolCalls = lastMessage.tool_calls;
  /**
   * lastMessage = AIMessageChunk{id, content,....., tool_calls,....,tool_call_chunks}
   * toolCalls = [{
   *  "name" : "UpsertFiles",
   *  "args": {
   *      "files": [{ "content": , "path": }]
   *    },
   * "id",
   * "type"
   * }]
   */
  
  // console.log(toolCalls)

  const toolResults = await Promise.all(
    toolCalls.map(async (toolCall) => {
      return await toolFiles[toolCall.name].invoke(toolCall);
    }),
  );

  return {
    messages: [...state.messages, ...toolResults],
  };
}
