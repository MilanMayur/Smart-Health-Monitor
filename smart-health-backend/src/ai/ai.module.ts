//ai.module.ts
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MetricSchema } from 'src/metrics/metrics.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Metric', schema: MetricSchema }])],
    controllers: [AiController],
})
export class AiModule {}