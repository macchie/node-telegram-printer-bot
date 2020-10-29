import { Helpers } from "./utils/helpers";
import { PrintQueue } from "./models/print-queue.entity";

const SerialPort = require('serialport');
const ThermalPrinter = require('thermalprinter');

export interface PrinterConfig {
  path: string;
}

export interface PrinterLine { 
  type: string; 
  value: any; 
  bold?: boolean; 
  underline?: boolean; 
  big?: boolean; 
  align?: 'left' | 'center' | 'right'; 
}

export class PrinterController {

  private config!: PrinterConfig;
  private serialPort?: typeof SerialPort;
  private printer?: typeof ThermalPrinter;

  constructor(config: any) {
    this.config = config;
  }

  public async init() {
    return new Promise((resolve) => {
      try {
        this.serialPort = new SerialPort(this.config.path, {
          baudRate: 9600
        });
  
        this.serialPort.on('open', () => {
          this.printer = new ThermalPrinter(this.serialPort, {
            charset: 1,
            heatingInterval: 0
          });
  
          this.startPrinterWorker();
  
          this.printer.on('ready', () => {
            return resolve(true);
          });
        });
      } catch (error) {
        return resolve(false);
      }
    });
  }

  public async printLines(lines: PrinterLine[]): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.printer.reset();
        this.printer.setCharset(1);

        for (let line of lines) {
          if (line.type === 'text') {
            if (line.bold) {
              this.printer.bold(true)
              this.printer.underline(true)
            }

            if (line.align) {
              this.printer[line.align]();
            } else {
              this.printer.left();
            }
            
            this.printer.printLine(line.value);

            if (line.bold) {
              this.printer.underline(false)
              this.printer.bold(false)
            }
          }

          if (line.type === 'image') {
            this.printer.printImage(line.value)
          }
        }

        this.printer.print(() => {
          return resolve(true);
        })
      } catch (error) {
        console.log(error)
        return resolve(false);
      }
    })
  }

  // private

  private async startPrinterWorker() {
    console.log(`starting printer worker...`);

    try {
      for (let index = 0; index >= 0; index++) {
        const queueItem = await PrintQueue.findOne({ where: { processed: false }});
        if (queueItem) {
          await this.printLines(queueItem.lines);
          await queueItem.saveProcessed();
        }

        await Helpers.sleep(2000)
      }
    } catch (error) {
      console.log(error);     
    }
  }
}