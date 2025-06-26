//tips.module.ts
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { TipsService } from './tips.service';
import { TipsController } from './tips.controller';
import { TipSchema } from './tips.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { 
                name: 'Tip', 
                schema: TipSchema, 
                collection: 'healthtips' 
            }
        ])
    ],
    controllers: [TipsController],
    providers: [TipsService],
})

export class TipsModule {}
