import { AfterInsert, BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'telegram_user' })
export class TelegramUser extends BaseEntity {

  @PrimaryColumn('bigint', { name: '_id', unique: true, nullable: false })
  _id!: string;

  @Column({ name: 'first_name', type: 'varchar', nullable: true })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: true })
  lastName!: string;

  @Column({ name: 'username', type: 'varchar', nullable: true })
  username!: string;

  @Column({ name: 'language', type: 'varchar', nullable: true })
  language!: string;

  @Column({ name: 'is_bot', type: 'boolean', nullable: true })
  isBOT!: boolean;

  @Column({ name: 'last_update', type: 'timestamp without time zone', nullable: true, default: 'now()' })
  lastUpdate!: Date;
  
  constructor(data: any) {
    super();
    Object.assign(this, {...data});
  }
}