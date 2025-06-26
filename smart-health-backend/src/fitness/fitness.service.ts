//fitness.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FitnessPlan, Fitness } from './fitness.schema';

@Injectable()
export class FitnessService {
    constructor(
        @InjectModel(FitnessPlan.name) 
        private readonly fitnessPlanModel: Model<Fitness>
    ) {}

    async getWorkoutRecommendations(metrics: {
                                                diabetesRisk: string;
                                                heartRisk: string;
                                                strokeRisk: string;
                                            }) {
        const risks = {
            diabetes: metrics.diabetesRisk?.toLowerCase(),
            heart: metrics.heartRisk?.toLowerCase(),
            stroke: metrics.strokeRisk?.toLowerCase(),
        };

        const queryConditions = Object.entries(risks)
            .filter(([, risk]) => risk && risk !== 'low')
            .map(([condition, risk]) => ({ condition, risk }));

        const plans = queryConditions.length
            ? await this.fitnessPlanModel.find({ $or: queryConditions }).lean()
            : await this.fitnessPlanModel.find({ condition: 'general' }).lean();

        console.log('Returning plans for:', queryConditions.map(c => `${c.condition}-${c.risk}`));
        console.log('Number of plans fetched:', plans.length);

        return plans.flatMap(plan =>
            plan.days.map(day => ({
                condition: plan.condition,
                ...day,
            }))
        );
    }
}
