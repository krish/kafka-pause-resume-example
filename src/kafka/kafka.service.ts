import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private producer: Producer;
  private readonly topic = 'krish-pause-resume-test';
  private isPaused = false;

  constructor() {
    this.kafka = new Kafka({
      brokers: [
        'localhost:9092',
        'localhost:9092',
      ],
    });
    this.consumer = this.kafka.consumer({ groupId: 'krish-pause-test' });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.producer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: false });

    this.consumeMessages();
    this.produceMessages();
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    await this.producer.disconnect();
  }

  async consumeMessages() {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const currentDate = new Date();
        const currentSecond = currentDate.getSeconds();

        console.log(`Consumed message: ${message.value.toString()}`);

        if (currentSecond > 30 && !this.isPaused) {
          console.log('Pausing consumer...');
          await this.consumer.pause([{ topic: this.topic }]);
          this.isPaused = true;
        }
      },
    });
  }

  async produceMessages() {
    setInterval(async () => {
      const message = { value: `Message at ${new Date().toISOString()}` };
      await this.producer.send({
        topic: this.topic,
        messages: [message],
      });
      console.log(`Produced message: ${message.value}`);
    }, 1000);
  }

  async resumeConsumer() {
    if (this.isPaused) {
      console.log('Resuming consumer...');
      await this.consumer.resume([{ topic: this.topic }]);
      this.isPaused = false;
    }
  }
}
