import path from "path";
import { HOME_DIR, CONFIG_DIR } from "./constants.js";
import fs from "fs/promises";
import axios from "axios";

/**
 *
 * returns the content of settings.json file (create one if doesn't exists)
 */
export const getSettingsFile = async () => {
  try {
    await fs.access(CONFIG_DIR);
  } catch (error) {
    // console.log(CONFIG_DIR, "path is not defined");
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  }

  const settingsFile = path.join(CONFIG_DIR, "settings.json");

  try {
    await fs.access(settingsFile);
    const content = await fs.readFile(settingsFile, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    // console.log(settingsFile, "file doesn't exist");
    await fs.writeFile(settingsFile, JSON.stringify({}));

    return {};
  }
};

/**
 *
 * saves the api key
 */
export const saveApiKey = async (apiKey) => {
  const settingsFilePath = path.join(CONFIG_DIR, "settings.json");

  const settingsContent = await getSettingsFile();

  await fs.writeFile(
    settingsFilePath,
    JSON.stringify({ ...settingsContent, apiKey }),
  );
};

/**
 *
 * get the api key from settings.json
 */
export const getApiKey = async () => {
  const settingsFile = await getSettingsFile();

  const apiKey = settingsFile.apiKey || null;

  if (!apiKey) {
    return {
      error: "API key not found in settings file.",
    };
  }

  try {
    const response = await axios.get("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return { apiKey };
  } catch (error) {
    return {
      error: "Invalid api key",
    };
  }
};
