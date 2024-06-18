import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  process.env.KAFKA_BROKERS =
    'b-1.rapiddevkafka.wo3919.c3.kafka.ap-southeast-1.amazonaws.com:9092,b-2.rapiddevkafka.wo3919.c3.kafka.ap-southeast-1.amazonaws.com:9092';
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
