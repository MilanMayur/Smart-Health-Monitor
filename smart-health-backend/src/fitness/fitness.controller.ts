//fitness//fitness.controller.ts
import { Controller, Post, Get, Body, 
        Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { FitnessService } from './fitness.service';
import { SessionAuthGuard } from 'src/auth/session-auth.guard';
import { MetricsService } from 'src/metrics/metrics.service';

@Controller('fitness')
@UseGuards(SessionAuthGuard)
export class FitnessController {
    constructor(private readonly fitnessService: FitnessService,
                private readonly metricsService: MetricsService
        ) {}

    @Get('workout-recommendations')
    async getWorkouts(@Req() req) {
        const user = req.session.user;
        const userId = user._id;
        const metrics = await this.metricsService.getRecentMetrics(userId);

        if (!metrics) {
            console.warn('No data found, returning general plan');
            const defaultMetrics = { diabetesRisk: 'low',
                                        heartRisk: 'low',
                                        strokeRisk: 'low',
                                    };

            const workouts = await this.fitnessService.getWorkoutRecommendations(defaultMetrics);
            return { workouts, isGeneric: true };
        }

        const workouts = await this.fitnessService.getWorkoutRecommendations(metrics);

        return { workouts, isGeneric: false };
    }
}
