//auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { MetricsModule } from '../metrics/metrics.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        UsersModule,
        MetricsModule,
        PassportModule.register({ session: true }),
        ConfigModule,
        
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy],
    exports: [PassportModule]
})

export class AuthModule {}
