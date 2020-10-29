
export class Helpers {
  static async sleep(amt: number) {
    return new Promise((resolve) => { setTimeout(() => resolve(), amt) });
  }
}