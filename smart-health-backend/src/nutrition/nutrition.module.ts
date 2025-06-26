//nutrition.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { MetricsModule } from 'src/metrics/metrics.module';
import { DietPlan, NutritionSchema } from './nutrition.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ 
            name: DietPlan.name, 
            schema: NutritionSchema 
        }]),
        MetricsModule
    ],
    controllers: [NutritionController],
    providers: [NutritionService],
    exports: [NutritionService]
})

export class NutritionModule {}
