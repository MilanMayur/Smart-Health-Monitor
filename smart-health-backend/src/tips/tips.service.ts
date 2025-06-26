//tips.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TipDocument } from './tips.schema';

@Injectable()
export class TipsService {
    constructor(
        @InjectModel('Tip') private tipModel: Model<TipDocument>,
    ) {}

    private readonly DEFAULT_TIP = { tip1: "Maintain a healthy lifestyle." };

    private getLevel(metric: string, value: any): 'low' | 'moderate' | 'high' | 'none' {
        const v = typeof value === 'string' ? parseFloat(value) : value;
        if (value === 'N/A' || value === undefined || value === null) {
            return 'none';
        }
        switch (metric) {
            case 'bmi':
                return v >= 30 ? 'high' : v >= 25 ? 'moderate' : v > 18.5 ? 'low' : 'moderate';
            case 'maxHeartRate': 
                return v >= 180 ? 'high' : v >= 60 && v <= 100 ? 'moderate' : 'low';
            case 'glucose': 
                return v >= 126 ? 'high' : v >= 100 ? 'moderate' : 'low';
            case 'bloodPressure': 
                return v >= 140 ? 'high' : v >= 120 ? 'moderate' : 'low';
            case 'insulin': 
                return v >= 150 ? 'high' : v > 25 ? 'moderate' : 'low';
            case 'cholesterol': 
                return v >= 240 ? 'high' : v >= 200 ? 'moderate' : 'low';
            default:
                return 'moderate';
        }
    }

    async getTipsByCategory(category: string, level: string) {
        const doc = await this.tipModel.findOne({ category }).lean();
        return doc?.tips?.[level] || this.DEFAULT_TIP;
    }

    async getSuggestedTips(metrics: Record<string, any>) {
        const categories = ['bmi', 'glucose', 'bloodPressure', 
                            'insulin', 'cholesterol', 'maxHeartRate'];
        const tipsEntries = await Promise.all(
            categories.map(async (category) => {
                const level = this.getLevel(category, metrics[category]);
                const tips = await this.getTipsByCategory(category, level);
                return [category, tips];
            })
        );

        return Object.fromEntries(tipsEntries);
    }
}