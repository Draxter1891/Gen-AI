import { getApiKey, getSettingsFile, saveApiKey } from "./utils/file.utils.js";
import rl from "./utils/readline.js";

const main = async () => {
  const settings = await getSettingsFile();

  if (!settings.apiKey) {
    const apiKey = await rl.question("Enter your api key: ");

    await saveApiKey(apiKey);
  }

  const response = await getApiKey();

  if (response.error) {
    console.log(response.error);
    const apiKey = await rl.question("Enter your api key: ");

    await saveApiKey(apiKey);
    return main();
  }

  console.log(response.apiKey);
};

export default main;
