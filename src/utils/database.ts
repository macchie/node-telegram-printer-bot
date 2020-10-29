import {createConnection, Connection, ConnectionOptions } from "typeorm";

export class Database {

  public static config: any;
  public static conn: Connection;

  public static async init(config: Partial<ConnectionOptions>) {
    const defaultConfig = {
      type: "postgres",
      port: 5432,
      database: "postgres",
      synchronize: false,
      entities: [__dirname + '/../**/*.entity{.ts,.js}']
    };

    this.config = {...defaultConfig, ...config};
    
    const conn = await createConnection(this.config).catch((err) => {
      console.log(err);
    });

    if (conn) {
      this.conn = conn;
    }
  }

  public static async drop() {
    if (this.conn) {
      await this.conn.query(`TRUNCATE TABLE ${this.config.database}.telegram_chat CASCADE;`);
      await this.conn.query(`TRUNCATE TABLE ${this.config.database}.print_queue CASCADE;`);
      await this.conn.query(`TRUNCATE TABLE ${this.config.database}.telegram_user CASCADE;`);
    }
  }
}