import path from "path";
import { HOME_DIR, CONFIG_DIR } from "./constants";
import fs from "fs/promises";

const getSettingsFile = async () => {
  try {
    await fs.access(CONFIG_DIR);
  } catch (error) {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  }

  const settingsFile = path.join(CONFIG_DIR, "settings.json");

  try {
    await fs.access(settingsFile);
    const content = await fs.readFile(settingsFile, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    await fs.writeFile(settingsFile, JSON.stringify({}));

    return {};
  }
};
