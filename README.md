# RabbitMQ with NestJS

This tutorial aims to have 2 applications able to communicate between them using rabbitMQ.

# RabbitMQ

I used Docker for launch RabbitMQ in a container. Create a `docker-compose.yml` at the root of the project.

```jsx
version: '3'
services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "5672:5672"     # RabbitMQ Port
      - "15672:15672"   # RabbitMQ Dashboard Port
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
```

# NestJS

## App-1 (producer)

Create a project NestJS named app-1.

```bash
nest new app-1
```

Install dependencies for RabbitMQ

```bash
npm install @nestjs/microservices amqplib
npm install amqp-connection-manager
```

### Module for RabbitMQ Connexion

Create a module file for RabbitMQ and Configure de connexion to RabbitMQ

```bash
nest g module rabbitmq
```

```jsx
// in rabbitmq.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'APP2_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'app2_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule {}
```

### Service for RabbitMQ

Add in `app.service.ts` a method using the client to send messages.

```jsx
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@Inject('APP2_SERVICE') private readonly client: ClientProxy) {}

  async sendMessage(data: any) {
    return this.client.send('message_printed', data).toPromise();
  }
}
```

### Controller for manage route to send messages

Add a route in app.controller.ts in order to send message to app-2

```jsx
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
```

## APP-2 (consumer)

### Microservice

Create a microservice connected to the queue where messages from app-1 are sent. 

```tsx
// in main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'app2_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();

```

### Controller

Create a controller to manage incoming messages 

```tsx
// in app.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern('message_printed')
  handleMessage(data: any) {
    console.log('Message reçu :', data);
  }
}
```

# Start the project

Start RabbitMQ with docker compose 

```bash
docker compose up -d
```

Start app-1

```bash
cd app-1 && npm run start:dev
```

Start app-2

```bash
cd app-2 && npm run start:dev
```

# Test the project

## Postman

Call the route [http://localhost:3000/send-message](http://localhost:3000/send-message) of app-1 with a tool such as Postman. 

![image.png](RabbitMQ%20with%20NestJS%201288dc0c76ce808e8a27d59e59016b7b/image.png)

## RabbitMQ

Open the RabbitMQ Dashboard to see when a message is sent.

![image.png](RabbitMQ%20with%20NestJS%201288dc0c76ce808e8a27d59e59016b7b/image%201.png)

## App-2 Terminal

In the terminal of app-2 you are able to see the message sent by app-1.

![image.png](RabbitMQ%20with%20NestJS%201288dc0c76ce808e8a27d59e59016b7b/image%202.png)