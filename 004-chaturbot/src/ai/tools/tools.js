import { tool } from "langchain";
import * as z from "zod";
import fs from "fs/promises";
import path from "path";

export const UpsertFiles = tool(
  async ({ files }) => {
    await Promise.all(
      files.map(async (file) => {
        return await fs.writeFile(file.path, file.content);
      }),
    );

    return "File created/updated successfully";
  },
  {
    name: "UpsertFiles",
    description:
      "Create/Update multiple files at once (create one if not existed)",
    schema: z.object({
      files: z.array(
        z.object({
          path: z
            .string()
            .describe(
              "absolute path of the file that is going to be created/updated",
            ),
          content: z
            .string()
            .describe(
              "Content of the file that is going to be created/updated",
            ),
        }),
      ),
    }),
  },
);

/**
 * List all the folders (recursively) and files ignoring the node_modules folder
 */

export const ListFiles = tool(
  async function ({ folder }) {
    const results = [];

    async function traverse(currentFolder) {
      const entries = await fs.readdir(currentFolder, { withFileTypes: true });
      for (let entry of entries) {
        const fullPath = path.join(currentFolder, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "node_modules") continue;
          await traverse(fullPath);
        } else {
          results.push(fullPath);
        }
      }
    }

    await traverse(folder);
    return JSON.stringify(results);
  },
  {
    name: "ListFiles",
    description:
      "List all the folders (recursively) and files inside the folder ignoring the node_modules folder",
    schema: z.object({
      folder: z.string().describe("absolute path to the folder to list"),
    }),
  },
);

/**
 * Read the content of multiple files at once
 */

export const ReadFiles = tool(
  async function ({ files }) {
    const results = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(file.path, "utf-8");
        return { path: file.path, content };
      }),
    );

    return JSON.stringify(results);
  },
  {
    name: "ReadFiles",
    description: "Read all the files from current working directory",
    schema: z.object({
      files: z.array(
        z.object({
          path: z.string().describe("absolute path of the file to be read"),
        }),
      ),
    }),
  },
);
