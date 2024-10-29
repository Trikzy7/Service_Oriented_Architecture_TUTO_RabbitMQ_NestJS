import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@Inject('APP2_SERVICE') private readonly client: ClientProxy) {}

  async sendMessage(data: any) {
    return this.client.send('message_printed', data).toPromise();
  }
}
