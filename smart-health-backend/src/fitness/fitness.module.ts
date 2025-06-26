//fitness.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FitnessController } from './fitness.controller';
import { FitnessService } from './fitness.service';
import { MetricsModule } from 'src/metrics/metrics.module';
import { FitnessPlan, FitnessSchema } from './fitness.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ 
            name: FitnessPlan.name, 
            schema: FitnessSchema 
        }]),
        MetricsModule
    ],
    controllers: [FitnessController],
    providers: [FitnessService],
    exports: [FitnessService]
})

export class FitnessModule {}