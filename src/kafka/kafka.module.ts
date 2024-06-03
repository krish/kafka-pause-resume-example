import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { SchedullerService } from './scheduller/scheduller.service';

@Module({
  providers: [KafkaService, SchedullerService]
})
export class KafkaModule {}
