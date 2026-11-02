import { ChatGroq } from "@langchain/groq";
import "dotenv/config";
import readline from "readline/promises";
import { createAgent, tool } from "langchain";
import * as z from "zod";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const event = [];
const memory = [];

const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API,
});

const createCalendarEvent = tool(
  /**
   *
   * @param {*} param0
   * @description = takes the only compulsory parameter which should be an object
   * @returns success msgs or values for getter funtions
   */
  async ({ date, title, description }) => {
    console.log("Creating an event...");
    event.push({
      date,
      title,
      description,
    });

    return "Event created\n";
  },
  /**
   * this method have the meta data about the function above
   */
  {
    name: "createEvent",
    description:
      "Creates an event in calendar with date, title and description",
    schema: z.object({
      date: z.string(),
      title: z.string(),
      description: z.string(),
    }),
  },
);

const getEventTool = tool(
  async ({}) => {
    console.log("Retrieving all events...");
    if (event.length > 0) {
      return event;
    } else {
      return "Currently no events\n";
    }
  },
  {
    name: "getEvents",
    description: "Get all the calendar events",
    schema: z.object({}),
  },
);

const agent = createAgent({
  model,
  tools: [createCalendarEvent, getEventTool],
});

while (true) {
  const userInput = await rl.question("> ");

  memory.push({
    role: "user",
    content: userInput,
  });

  //Without memory implementation
  // const stream = await model.stream([{
  //     role:"user",
  //     content: userInput
  // }]);

  const stream = await agent.stream(
    {
      messages: memory,
    },
    { streamMode: "messages" },
  );

  let aiResponse = "";
  for await (const [chunk] of stream) {
    // console.log(chunk)
    aiResponse += chunk.content;
    process.stdout.write(chunk.content);
  }
  memory.push({
    role: "assistant",
    content: aiResponse,
  });
  process.stdout.write("\n");
}
