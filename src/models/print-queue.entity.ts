import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { PrinterLine } from "../printer-controller";

@Entity({ name: 'print_queue' })
export class PrintQueue extends BaseEntity {

  @PrimaryGeneratedColumn()
  _id!: number;

  @Column({ name: 'lines', type: 'jsonb', nullable: true, default: '[]' })
  lines: PrinterLine[] = [];

  @Column({ name: 'image_path', type: 'varchar', nullable: true })
  imagePath!: string;

  @Column({ name: 'processed', type: 'boolean', nullable: true, default: 'false' })
  processed: boolean = false;

  @Column({ name: 'last_update', type: 'timestamp without time zone', nullable: true, default: 'now()' })
  lastUpdate!: Date;
  
  constructor(data: any) {
    super();
    Object.assign(this, {...data});
  }

  async addLine(line: PrinterLine) {
    this.lines.push(line);
  }

  async addToQueue() {
    return this.save();
  }

  async saveProcessed() {
    this.processed = true;
    return this.save();
  }
}