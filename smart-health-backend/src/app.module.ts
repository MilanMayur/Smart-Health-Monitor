//app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MetricsModule } from './metrics/metrics.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { FitnessModule } from './fitness/fitness.module';
import { TipsModule } from './tips/tips.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import dotenv from'dotenv';
dotenv.config();

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI!),
        AuthModule,
        UsersModule,
        MetricsModule,
        NutritionModule,
        FitnessModule,
        TipsModule
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}
