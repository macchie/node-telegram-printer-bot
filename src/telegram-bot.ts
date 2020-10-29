
import jimp from 'jimp';
import Telegraf from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';
import { User } from 'telegraf/typings/telegram-types';
import { getConnection } from 'typeorm';
import { PrintQueue } from './models/print-queue.entity';

import { TelegramChat } from './models/telegram-chat.entity';
import { TelegramUser } from './models/telegram-user.entity';
import { PrinterController, PrinterLine } from './printer-controller';
import { MessageBuilder } from './utils/message-builder';


export class TelegramBot {

  private static bot: Telegraf<TelegrafContext>;
  private static printerCtrl: PrinterController;
  private static lastMessageDateById: { [key: string]: Date } = {};

  private static token: string;
  private static me: User;
  
  public static async init(token: string) {

    // init telegram bot

    this.token = token;
    this.bot = new Telegraf(this.token);
    this.me = await this.bot.telegram.getMe();

    try {
      // init serial printer
      this.printerCtrl = new PrinterController({ path: '/dev/ttyS1' });
      await this.printerCtrl.init();
    } catch (error) {
      console.log(error);
    }

    // print init message

    await this.prinInitMessage();

    // register handlers

    this.bot.command('start', this.onStart.bind(this));
    this.bot.on('message', this.onMessage.bind(this));

    // showtime!

    await this.bot.launch();
  }

  // private

  private static async onStart(ctx: TelegrafContext) {
    try {
      await this.updateChatUserVisit(ctx);
      ctx.reply( MessageBuilder.welcomeMessage(ctx) );
    } catch (error) {
      console.log(error);
    }
  }

  private static async onMessage(ctx: TelegrafContext) {
    try {
      await this.updateChatUserVisit(ctx);

      const newQueueItem = new PrintQueue({ lines: [], processed: false})

      // check if user is spamming

      if (this.userIsSpamming(ctx)) {
        return ctx.reply( MessageBuilder.doNotSpamMessage(this.lastMessageDateById[ctx.from!.id], ctx) );
      }

      // set last user message

      this.lastMessageDateById[ctx.from!.id] = new Date();

      const firstName = ctx.from!.first_name;
      const lastName = ctx.from!.last_name;

      const formattedDate = `${new Date().getHours()}:${new Date().getMinutes() < 10 ? `0${new Date().getMinutes()}` : `${new Date().getMinutes()}`}`;
        
      // header line

      newQueueItem.addLine({
        type: 'text',
        bold: true,
        align: 'center',
        value: `[${formattedDate}] ${firstName || ''} ${lastName || ''}`
      })
      
      // message line

      if (ctx.message && ctx.message.text) {
        newQueueItem.addLine({ type: 'text', value: ctx.message.text })
        newQueueItem.addLine({ type: 'text', value: `` })
      }

      // photo line

      if (ctx.message && ctx.message.photo) {
        try {
          const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
          const imagePath = `/tmp/${fileId}.jpg`;
          const fileURL: any = await this.bot.telegram.getFileLink(fileId);
          const image = await jimp.read(fileURL)
          await image.resize(384, jimp.AUTO);
          image.write(imagePath);
          newQueueItem.imagePath = imagePath;
          newQueueItem.addLine({ type: 'image', value: imagePath });
        } catch (error) {
          newQueueItem.addLine({ type: 'text', value: `error proccessing image :(` })
        }
      }

      newQueueItem.addLine({ type: 'text', value: `` })
      
      let responseMessage: string;

      // check print queue size
      const queueSize = await PrintQueue.count();

      if (queueSize === 0) {
        responseMessage = MessageBuilder.printASAPMessage(ctx)
      } else {
        responseMessage = MessageBuilder.inQueueMessage(queueSize, ctx)
      }

      ctx.reply(responseMessage).catch(async (err: any) => {
        if (err.code === 403) {
          const chat = await TelegramChat.findOne({where: { _id: ctx.chat!.id }})
          
          if (chat) {
            await chat.remove();
          }
        }
      });

      await newQueueItem.addToQueue();
    } catch (err) {
      console.log(err);
    }
  }

  private static async prinInitMessage(): Promise<boolean> {
    const welcomeMessage = new PrintQueue({ lines: [] })

    welcomeMessage.addLine({ type: 'text', value: `${this.me.first_name || this.me.username}\n`, bold: true, big: true });
    welcomeMessage.addLine({ type: 'text', value: `@${this.me.username}\n`})
    welcomeMessage.addLine({ type: 'text', value: `https://t.me/${this.me.username}\n\n`})

    await welcomeMessage.addToQueue();

    return true;
  }

  private static async userIsSpamming(ctx: TelegrafContext) {
    if (ctx.from) {
      return this.lastMessageDateById[ctx.from.id] && this.lastMessageDateById[ctx.from.id].getTime() + (1000*60) >= new Date().getTime();
    } else {
      return false;
    }
  }

  private static async updateChatUserVisit(ctx: any) {
    try {
      const chat = new TelegramChat({
        _id: ctx.chat.id,
        name: ctx.chat.title || ctx.chat.username,
        type: ctx.chat.type,
        allMembersAreAdmin: ctx.chat.all_members_are_administrators || false
      });

      await getConnection().createQueryBuilder()
        .insert()
        .into(TelegramChat)
        .values(chat)
        .onConflict(`("_id") DO UPDATE SET "last_update" = NOW()`)
        .execute();


      const user = new TelegramUser({
        _id: ctx.from.id,
        isBOT: ctx.from.is_bot,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        language: ctx.from.language_code
      });
      
      await getConnection().createQueryBuilder()
        .insert()
        .into(TelegramUser)
        .values(user)
        .onConflict(`("_id") DO UPDATE SET "last_update" = NOW(), "language" = '${ctx.from.language_code}', "first_name" = '${ctx.from.first_name}', "last_name" = '${ctx.from.last_name}'`)
        .execute();

    } catch (error) {
      console.log(error);
    }
  }
}