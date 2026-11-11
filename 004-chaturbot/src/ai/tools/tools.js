import { tool } from "langchain";
import * as z from "zod";
import fs from "fs/promises";

export const upsertFilesTool = tool(
  async ({ files }) => {
    await Promise.all(
      files.map(async (file) => {
        return await fs.writeFile(file.path, file.content);
      }),
    );

    return "File created/updated successfully";
  },
  {
    name: "UpsertFilesTool",
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
