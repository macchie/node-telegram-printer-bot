import fs from 'fs';
import { ConnectionOptions } from 'typeorm';
import { Database } from './src/utils/database';
import { TelegramBot } from './src/telegram-bot';


const main = async () => {
  console.log('reading config from config.json...');

  let TelegramBotConfig: {
    telegram: { token: string },
    database: Partial<ConnectionOptions>,
  };

  try {
    const configContent = fs.readFileSync(__dirname + '/config.json');
    TelegramBotConfig = JSON.parse(configContent.toString());
  } catch (error) {
    console.log(error)
    console.log('config error... aborting!');
    return;
  }

  console.log(`connecting to database...`);

  await Database.init(TelegramBotConfig.database);

  console.log(`database connected!`);
  
  // reset db
  // await Database.drop();

  console.log(`starting telegram bot...`);

  await TelegramBot.init(TelegramBotConfig.telegram);

  console.log(`telegram bot started!`);
}

// showtime!
main()