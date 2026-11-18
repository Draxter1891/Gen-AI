import { MCPAdapter } from "@langchain/mcp-adapters";

const adapter = new MCPAdapter({
  servers: {
    // Local server: adapter spawns it as a child process (stdio)
    calendar: {
      command: "node",
      args: ["../mcp-server/server.js"],
    },
  },
});

const tools = await adapter.listTools();

console.log(tools)