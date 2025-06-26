//nutrition.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DietPlan, Diet } from './nutrition.schema';

@Injectable()
export class NutritionService {
    constructor(
        @InjectModel(DietPlan.name) 
        private readonly dietPlanModel: Model<Diet>
    ) {}

    async getDietPlanByBmi(bmi: number) {
        const category: 'high_bmi' | 'normal_bmi' | 'low_bmi' = bmi > 24.9 ? 'high_bmi' : 
                                                                bmi >= 18.5 ? 'normal_bmi' : 
                                                                'low_bmi';

        const weekday = new Date().toLocaleString('en-US', { weekday: 'long' });

        const allPlans = await this.dietPlanModel.find().lean();

        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", 
                            "Friday", "Saturday", "Sunday"];
        const sortedPlans = allPlans.sort((a, b) =>
                                dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
                            );

        const todayPlan = sortedPlans.find(plan => plan.day === weekday);
        const todayMeals = todayPlan?.meal?.[category] || null;

        const fullWeek = sortedPlans.map(plan => ({
                            day: plan.day,
                            meals: plan.meal?.[category] || {
                                breakfast: 'N/A',
                                lunch: 'N/A',
                                dinner: 'N/A'
                            }
                        }));

        return {
            today: weekday,
            category,
            todayMeals,
            fullWeek
        };
    }

    getTips(metrics: {
                        heartRisk: string;
                        diabetesRisk: string;
                    }): string[] {
        const tips: string[] = [];

        const heartTips = [
            "Avoid fried foods, excess red meat, and full-fat dairy.",
            "Limit sodium intake—choose fresh, whole foods over processed ones.",
            "Stay active with 30 minutes of daily moderate exercise.",
            "Quit smoking and reduce alcohol consumption.",
            "Check blood pressure and cholesterol regularly."
        ];

        const diabetesTips = [
            "Avoid sugar-rich snacks, opt for complex carbs like oats and lentils.",
            "Maintain a healthy weight through balanced diet and exercise.",
            "Control portion sizes and avoid high-GI foods.",
            "Be physically active—aim for 150 minutes of activity per week.",
            "Get regular blood sugar check-ups and monitor symptoms."
        ];

        if (metrics.heartRisk === 'high' || metrics.heartRisk === 'moderate') {
            const randomHeartTip = heartTips[Math.floor(Math.random() * heartTips.length)];
            tips.push(randomHeartTip);
        }
        if (metrics.diabetesRisk === 'high' || metrics.diabetesRisk === 'moderate') {
            const randomDiabetesTip = diabetesTips[Math.floor(Math.random() * diabetesTips.length)];
            tips.push(randomDiabetesTip);
        }

        if (tips.length === 0) {
            tips.push("Keep up your healthy lifestyle with regular exercise and a balanced diet.");
        }

        return tips;
    }
        
    calculateCalories(bmi: number): number {
        if (typeof bmi !== 'number' || isNaN(bmi)) {
            return 2000; 
        }
        if (bmi < 18.5) {
            return 2500; //Underweight
        }
        else if (bmi >= 18.5 && bmi <= 24.9) {
            return 2000; //Normal BMI
        }
        else {
            return 1700; //High BMI
        }
    };
}
