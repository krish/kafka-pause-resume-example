import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { error } from 'console';
import { Consumer, Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private producer: Producer;
  private readonly topic = 'krish-pause-resume-test4';
  private isPaused = false;
  private lastOffset;

  constructor() {
    this.kafka = new Kafka({
      brokers: process.env.KAFKA_BROKERS.split(','),
    });
    this.consumer = this.kafka.consumer({ groupId: 'krish-pause-test4' });
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
        const messageTimestamp = new Date(
          message.value.toString().split('Message at ')[1],
        );

        const timeDifference =
          (currentDate.getTime() - messageTimestamp.getTime()) / 1000;

        console.log(
          `Consumed message: message: ${messageTimestamp} current:${currentDate} Diff: ${timeDifference} offset: ${message.offset}`,
        );

        if (timeDifference < 60 && !this.isPaused) {
          console.log('Pausing consumer........');
          this.lastOffset = message.offset;
          this.consumer.pause([{ topic: this.topic }]);
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
      if (this.lastOffset !== null) {
        // Seek to the last processed offset
        this.consumer.seek({
          topic: this.topic,
          partition: 0,
          offset: this.lastOffset,
        });
      }
      this.consumer.resume([{ topic: this.topic }]);
      this.isPaused = false;
    }
  }
}
