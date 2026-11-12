import { ChatGroq } from "@langchain/groq";
import { getApiKey } from "../../utils/file.utils.js";
import { UpsertFiles, ReadFiles, ListFiles } from "../tools/tools.js";
import * as fileTools from "../tools/tools.js";
import rl from "../../utils/readline.js";
import { ToolMessage } from "langchain";
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

  const modelWithTool = model.bindTools([UpsertFiles, ReadFiles, ListFiles]);

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

  console.log(toolCalls)

  const toolResults = [];
  for (const toolCall of toolCalls) {
    switch (toolCall.name) {
      case "UpsertFiles":
        process.stdout.write(
          `[Tool]: Creating/Updating files ${JSON.stringify(toolCall.args.files.map(f => f.path).join(", "))}\n}`,
        );
        const userInput = await rl.question(
          "Do want to proceed further? (yes/no)",
        );

        if (userInput.toLowerCase() !== "yes") {
          process.stdout.write("Aborting file updation/creation.\n");
          return new ToolMessage({
            content: "User aborted file updation/creation.",
            tool_call_id: toolCall.id,
          });
        }

        const result = await fileTools.UpsertFiles.invoke(toolCall);
        toolResults.push(result);
        break;
      case "ReadFiles":
        process.stdout.write(
          `[Tool]: Reading files ${JSON.stringify(toolCall.args.files.map(f => f.path).join(", "))}\n}`,
        );
        const readResult = await fileTools.ReadFiles.invoke(toolCall);
        toolResults.push(readResult);
        break;
      case "ListFiles":
        process.stdout.write(
          `[Tool]: Listing files ${JSON.stringify(toolCall)}`,
        );
        const listResult = await fileTools.ListFiles.invoke(toolCall);
        toolResults.push(listResult);
        break;

      default:
        process.stdout.write(`[Tool]: Unknown tool call ${toolCall.name}`);
        break;
    }
  }

  return {
    messages: [...state.messages, ...toolResults],
  };
}
