//nutrition/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton } from '@/app/components/button';
import API from '@/lib/api';

type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 
                'Friday' | 'Saturday' | 'Sunday';

interface DailyMeal {
    breakfast: string;
    lunch: string;
    dinner: string;
}

interface NutritionPlan {
    today: Weekday;
    category: 'low_bmi' | 'normal_bmi' | 'high_bmi';
    todayMeals: DailyMeal | null;
    fullWeek: {
        day: Weekday;
        meals: DailyMeal;
    }[];
    calories: number;
    tips: string[];
}

const formatBmiCategory = (category: string) => {
    switch (category) {
        case 'low':
        case 'low_bmi':
            return 'Low BMI';
        case 'normal':
        case 'normal_bmi':
            return 'Normal BMI';
        case 'high':
        case 'high_bmi':
            return 'High BMI';
        default:
        return 'BMI Category: Unknown';
    }
};

const MealList = ({ meals }: { meals: DailyMeal }) => (
    <ul className="list-disc pl-6 text-gray-700 border-l-4 border-blue-500">
        <li><strong>Breakfast:</strong> {meals.breakfast}</li>
        <li><strong>Lunch:</strong> {meals.lunch}</li>
        <li><strong>Dinner:</strong> {meals.dinner}</li>
    </ul>
);

export default function NutritionPage() {
    const router = useRouter();
    const [nutritionData, setNutritionData] = useState<NutritionPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await API.get('/nutrition/diet-plan'); //
                const data: NutritionPlan = res.data;

                if (!data) {
                    throw new Error('Nutrition data not found');
                }

                setNutritionData(data);
            } 
            catch (error) {
                console.error('Failed to fetch metrics:', error);
                setNutritionData(null);
            }
            finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, []);

    const noPlan = !nutritionData?.todayMeals;

    const handleHealthPrediction = () => {
        router.push('/dashboard/health');
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-600">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6 mx-auto max-w-5xl">
            <h1 className="text-2xl font-bold mb-4 text-center">Diet & Nutrition</h1>

            {/* No Plan Available */}
            {noPlan ? (
                <div className="text-center bg-yellow-100 border border-yellow-300 text-yellow-700 
                    p-4 rounded mb-4 bg-gradient-to-br from-white to-blue-100 opacity-90">
                    <h2 className="text-lg font-semibold text-red-600 mb-2">No Nutrition Plan Available</h2>
                    <p>
                        Please complete your health prediction to receive a personalized nutrition plan.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <AppButton 
                            text="Take your First Prediction" 
                            onClick={() => {router.push('/dashboard/health')}} 
                        />
                    </div>
                </div>
            ) : (
            <>
                {/* Today's Nutrition Plan */}
                {nutritionData.todayMeals && (
                    <div className="mb-5 p-4 bg-gradient-to-br from-white to-blue-200 
                        opacity-90 rounded-xl p-2 shadow-xl">
                        <h2 className="text-lg font-semibold mb-2">
                            Today's Personalized Meals ({nutritionData.today})
                        </h2>
                        <MealList meals={nutritionData.todayMeals} />
                    </div>
                )}

                {/* Full Week Nutrition Plan */}
                <div className="bg-gradient-to-br from-white to-blue-200 opacity-90 
                    p-4 shadow-xl rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">
                            Full Week Plan ({formatBmiCategory(nutritionData.category)})
                        </h2>
                        <button
                            onClick={() => setIsExpanded(prev => !prev)}
                            className="text-xl font-bold text-blue-600 focus:outline-none"
                            aria-label="Toggle full week plan"
                        >
                            {isExpanded ? '−' : '+'}
                        </button>
                    </div>

                    {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {nutritionData.fullWeek.map((plan, index) => (
                                <div key={index} className="mb-4 bg-white border border-gray-200 shadow-md 
                                    rounded-xl p-4 transition-all hover:scale-105 hover:shadow-lg">
                                    <h3 className="text-md text-center font-bold">{plan.day}</h3>
                                    <MealList meals={plan.meals} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Calorie Intake */}
                {nutritionData?.calories && (
                    <div className="bg-white p-4 shadow rounded-xl mb-5 shadow-xl
                        bg-gradient-to-br from-white to-blue-200 opacity-90">
                        <h2 className="text-lg font-semibold mb-2">
                            Recommended Daily Calorie Intake
                        </h2>
                        <p className="text-gray-700">
                            Based on your BMI, your recommended intake is around{' '}
                            <span className="font-semibold">
                                {/*dailyCalories*/}{nutritionData.calories} kcal/day
                            </span>.
                        </p>
                    </div>
                )}

                {/* Tips */}
                <div className="bg-white p-4 shadow rounded-xl shadow-xl 
                    bg-gradient-to-br from-white to-blue-200 opacity-90">
                    <h2 className="text-lg font-semibold mb-2">Health Tips</h2>
                    {nutritionData.tips.length > 0 ? (
                        <ul className="list-disc pl-6 text-gray-700">
                            {nutritionData.tips.map((tips, index) => (
                                <li key={index}>{tips}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No health tips available.</p>
                    )}
                </div>
            </>
            )}
        </div>
    );
}
