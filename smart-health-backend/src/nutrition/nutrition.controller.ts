//nutrition.controller.ts
import { Controller, Get, Req, UseGuards,
    UnauthorizedException } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { SessionAuthGuard } from 'src/auth/session-auth.guard';
import { MetricsService } from 'src/metrics/metrics.service';

@Controller('nutrition')
@UseGuards(SessionAuthGuard)
export class NutritionController {
    constructor(private readonly nutritionService: NutritionService,
                private readonly metricsService: MetricsService
    ) {}

    @Get('diet-plan')
    async getNutritionPlan(@Req() req) {
        const user = req.session.user;
        const userId = user._id;

        if (!user || !user._id) {
            throw new UnauthorizedException('User not authenticated');
        }

        const metrics = await this.metricsService.getRecentMetrics(userId);

        if (!metrics || typeof metrics.bmi !== 'number' || isNaN(metrics.bmi)) {
            return {
                today: new Date().toLocaleString('en-US', { weekday: 'long' }),
                category: null,
                todayMeals: null,
                fullWeek: [],
                calories: null,
                tips: []
            };
        }

        const calories = this.nutritionService.calculateCalories(metrics.bmi);
        const plan  = await this.nutritionService.getDietPlanByBmi(metrics.bmi);
        const tips = this.nutritionService.getTips(metrics)

        return { ...plan, calories, tips };
    }
}
