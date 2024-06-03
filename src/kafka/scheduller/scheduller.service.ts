import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedullerService {
  constructor(private readonly kafkaService: KafkaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    console.log(
      'Resuming consumer from cron job++++++++++++++++++++++++++++++++++++++++',
    );
    this.kafkaService.resumeConsumer();
  }
}
