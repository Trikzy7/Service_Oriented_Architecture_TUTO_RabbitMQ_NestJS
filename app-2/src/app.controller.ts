// src/app.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern('message_printed')
  handleMessage(data: any) {
    console.log('Message reçu :', data);
  }
}
