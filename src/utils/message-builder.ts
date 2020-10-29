import { TelegrafContext } from "telegraf/typings/context";

export class MessageBuilder {

  public static welcomeMessage(ctx: TelegrafContext) {
    try {
      if (ctx.from) {
        switch (ctx.from.language_code) {
          case 'it':
            return `Ciao ${ctx.from.first_name ? ctx.from.first_name : ''}${ctx.from.last_name ? ` ${ctx.from.last_name}` : ''}, mandami un messaggio (o foto) e io lo stamperò!`;
          default:
            return `Hello ${ctx.from.first_name ? ctx.from.first_name : ''}${ctx.from.last_name ? ` ${ctx.from.last_name}` : ''}, send me a message (or photo) and i'll print it!`;
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      return `Hello visitor, send me a message (or photo) and i'll print it!`
    }
  }

  public static doNotSpamMessage(lastMessageDate: Date, ctx: TelegrafContext) {
    try {
      if (ctx.from) {
        switch (ctx.from.language_code) {
          case 'it':
            return `Calma! Potrai stampare di nuovo tra ${Math.round((lastMessageDate && lastMessageDate.getTime() + (1000*60) - new Date().getTime())/1000)} secondi...`;
          default:
            return `Hang on! You will be able to print again in ${Math.round((lastMessageDate && lastMessageDate.getTime() + (1000*60) - new Date().getTime())/1000)} seconds...`;
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      return `Hang on! You will be able to print again in ${Math.round((lastMessageDate && lastMessageDate.getTime() + (1000*60) - new Date().getTime())/1000)} seconds...`;
    }
  }

  public static printASAPMessage(ctx: TelegrafContext) {
    try {
      if (ctx.from) {
        switch (ctx.from.language_code) {
          case 'it':
            return `Grazie! Il tuo messaggio verrà stampato immediatamente...`;
          default:
            return `Thanks! Your message will be printed immediately...`;
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      return `Thanks! Your message will be printed immediately...`;
    }
  }

  public static inQueueMessage(queueSize: number, ctx: TelegrafContext) {
    try {
      if (ctx.from) {
        switch (ctx.from.language_code) {
          case 'it':
            return `Grazie! Ci sono ${queueSize} messaggi in coda prima del tuo, appena possibile il tuo messaggio sarà stampato...`;
          default:
            return `Thanks! There are ${queueSize} messages in the print queue before yours, it will be printed as soon as possible...`;
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      return `Thanks! There are ${queueSize} messages in the print queue before yours, it will be printed as soon as possible...`;
    }
  }

  
}