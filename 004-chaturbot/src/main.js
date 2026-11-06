import { getApiKey, getSettingsFile, saveApiKey } from "./utils/file.utils.js";
import rl from "./utils/readline.js";

const main = async () => {
  const settings = await getSettingsFile();

  if (!settings.apiKey) {
    const apiKey = await rl.question("Enter your api key: ");

    await saveApiKey(apiKey);
  }

  const {apiKey} = await getApiKey();
  console.log(apiKey);
};

export default main;
