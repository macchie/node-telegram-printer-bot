import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'telegram_chat' })
export class TelegramChat extends BaseEntity {

  @PrimaryColumn('bigint', { name: '_id', unique: true, nullable: false })
  _id!: string;

  @Column({ name: 'name', type: 'varchar', nullable: true })
  name!: string;

  @Column({ name: 'type', type: 'varchar', nullable: true })
  type!: string;

  @Column({ name: 'all_members_are_administrators:', type: 'varchar', nullable: true })
  allMembersAreAdmin!: string;

  @Column({ name: 'last_update', type: 'timestamp without time zone', nullable: true, default: 'now()' })
  lastUpdate!: Date;
  
  constructor(data: any) {
    super();
    Object.assign(this, {...data});
  }
}