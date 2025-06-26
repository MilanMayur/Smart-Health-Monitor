//metrics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Metric } from './metrics.schema';
import { Model } from 'mongoose';

@Injectable()
export class MetricsService {
    constructor(
        @InjectModel(Metric.name) 
        private metricModel: Model<Metric>,
    ) {}

    async getRecentMetrics(userId: string) {
        const metrics = await this.metricModel.findOne({ userId })
                                                .sort({ updatedAt: -1 })
                                                .lean();
        if (!metrics) return null;

        return {
            age: metrics.age ?? 'N/A',
            sex: metrics.sex ?? 'N/A',
            bloodPressure: metrics.bloodPressure ?? 'N/A',
            insulin: metrics.insulin ?? 'N/A',
            bmi: metrics.bmi ?? 'N/A',
            glucose: metrics.glucose ?? 'N/A',
            cholesterol: metrics.serumCholestoral ?? 'N/A',
            maxHeartRate: metrics.maxHeartRate ?? 'N/A',
            restingECG: metrics.restingECG ?? 'N/A',

            diabetesRisk: metrics.diabetesRiskCategory ?? metrics.diabetesPrediction ?? 'N/A',
            heartRisk: metrics.heartRiskCategory ?? metrics.heartPrediction ?? 'N/A',
            strokeRisk: metrics.strokeRiskCategory ?? metrics.strokePrediction ?? 'N/A',

            diabetesProbability: metrics.diabetesProbability ?? null,
            heartProbability: metrics.heartProbability ?? null,
            strokeProbability: metrics.strokeProbability ?? null,

            updatedAt: metrics.updatedAt ?? null,
        };
    }

    async saveUnifiedMetric(userId: string, inputData: any, predictionFields: any) {
        return this.metricModel.findOneAndUpdate(
            { userId },
            {
                $set: {
                    userId,
                    ...inputData,  
                    ...predictionFields 
                }
            },
            { upsert: true, new: true }
        );
    }

    async deleteByUserId(userId: string) {
        await this.metricModel.findOneAndDelete({ userId }); 
    }

    async updateUserMetrics(userId: string, 
                            updatedData: Partial<Metric>): Promise<Metric | null> {
        return this.metricModel.findOneAndUpdate(
                            { userId }, 
                            { $set: updatedData },
                            { new: true, upsert: true } //creates if not found
                        );
    }
}
