import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('send-message')
  async sendMessage() {
    const message = { text: 'Hello from app-1!' };
    await this.appService.sendMessage(message);
    return { status: 'Message sent to app-2' };
  }
}