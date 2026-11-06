import path from "path";
import { HOME_DIR, CONFIG_DIR } from "./constants.js";
import fs from "fs/promises";

export const getSettingsFile = async () => {
  try {
    await fs.access(CONFIG_DIR);
  } catch (error) {
    console.log(CONFIG_DIR, "path is not defined");
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  }

  const settingsFile = path.join(CONFIG_DIR, "settings.json");

  try {
    await fs.access(settingsFile);
    const content = await fs.readFile(settingsFile, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.log(settingsFile, "file doesn't exist");
    await fs.writeFile(settingsFile, JSON.stringify({}));

    return {};
  }
};

export const saveApiKey = async (apiKey) => {
  const settingsFilePath = path.join(CONFIG_DIR, "settings.json");

  const settingsContent = await getSettingsFile();

  await fs.writeFile(
    settingsFilePath,
    JSON.stringify({ ...settingsContent, apiKey }),
  );
};
