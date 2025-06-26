"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import API from '@/lib/api'; 
import { InsightCard } from "@/app/components/insightCard";
import { tipCardConfigs } from "@/utils/tipCardConfig";
import { AppButton } from '@/app/components/button';

const colorMap = {
    high: "text-red-600 border-red-400",
    moderate: "text-orange-600 border-orange-400",
    low: "text-green-600 border-green-400",
    none: "text-slate-600 border-slate-400",
};

const tipCategories = ["bmi", "glucose", "bloodPressure", 
                        "insulin", "cholesterol", "maxHeartRate"];

const getLevel = (metric: string, value: number | string): 
                'low' | 'moderate' | 'high' | 'none' => {
                    if (value === 'N/A' || value === undefined || value === null) {
                        return 'none';
                    }
                    if (typeof value !== 'number') {
                        return 'moderate';
                    }
                    switch (metric) {
                        case 'bmi': 
                            if (value >= 30) return 'high';
                            if (value >= 25) return 'moderate';
                            if (value > 18.5) return 'low';
                            return 'moderate';
                        case 'maxHeartRate': 
                            if (value >= 180) return 'high';
                            if (value >= 60 && value <= 100) return 'moderate'; 
                            return 'low';
                        case 'glucose': 
                            if (value >= 126) return 'high';
                            if (value >= 100) return 'moderate';
                            return 'low';
                        case 'bloodPressure': 
                            if (value >= 140) return 'high';
                            if (value >= 120) return 'moderate';
                            return 'low';
                        case 'insulin': 
                            if (value >= 150) return 'high';
                            if (value > 25) return 'moderate';
                            return 'low';
                        case 'cholesterol': 
                            if (value >= 240) return 'high';
                            if (value >= 200) return 'moderate';
                            return 'low';
                        default: 
                            return 'moderate';
                    }
                };

const getRandomTip = (tips: Record<string, string>) => {
    const tipArray = Object.values(tips);
    return tipArray[Math.floor(Math.random() * tipArray.length)];
};

export default function ReportsPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [tips, setTips] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get('/metric/recent');
                const metricData = res.data;
                setMetrics(metricData);
                if (metricData) {
                    const tipsMap: Record<string, any> = {};
                    await Promise.all(tipCategories.map(async (category) => {
                        const level = getLevel(category, metricData[category]);
                        try {
                            const { data } = await API.get(`/tips?category=${category}&level=${level}`);
                            tipsMap[category] = data && Object.keys(data).length 
                                                ? data 
                                                : { tip1: "Maintain a healthy lifestyle." };
                        } 
                        catch (err) {
                            tipsMap[category] = { tip1: "Maintain a healthy lifestyle." };
                        }
                    }));
                    setTips(tipsMap);
                }
            } 
            catch (error) {
                console.error('Error fetching metrics or tips:', error);
            } 
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const avgRisk = useMemo(() => {
                        const risks = [
                                        metrics?.diabetesProbability, 
                                        metrics?.heartProbability, 
                                        metrics?.strokeProbability
                                    ].filter(v => typeof v === 'number');
                        return risks.length 
                                ? Math.round(risks.reduce((sum, val) => sum + val, 0) / risks.length) 
                                : 0;
                    }, [metrics]);

    const riskLevel = avgRisk >= 70 ? 'high' 
                    : avgRisk >= 30 ? 'moderate' 
                    : 'low';

    if (loading) return <div className="p-6 text-center text-gray-600">Loading...</div>;

    const hasValidMetrics = metrics && Object.values(metrics).some(value => value && 
                                                                    value !== 'N/A' && 
                                                                    value !== 0);

    return (
        <div className="p-6 mx-auto max-w-3xl">
            <h1 className="text-2xl font-bold mb-4 text-center">Health Insights</h1>

            {/* Default */}
            {!hasValidMetrics && (
                <div className="text-center bg-yellow-100 border border-yellow-300 
                    text-yellow-700 p-4 rounded mb-4 bg-gradient-to-br from-white 
                    to-blue-100 opacity-90">
                    <h2 className="text-lg font-semibold text-red-600 mb-2">
                        You don't have any health insights.
                    </h2>
                    <p>
                        To get a personalized insights, please complete your first health prediction.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <AppButton 
                            text="Take your First Prediction" 
                            onClick={() => {router.push('/dashboard/health')}} 
                        />
                    </div>
                </div>
            )}

            {hasValidMetrics && (
            <>
                {/* Health Summary */}
                <div className={`bg-gradient-to-r from-white to-sky-200 p-4 text-center 
                    rounded-xl shadow mt-8 mx-auto border-4 shadow-lg transition-all 
                    hover:scale-105 hover:shadow-lg ${colorMap[riskLevel]}`}>
                    <h3 className={`text-lg font-semibold mb-2 ${colorMap[riskLevel].split(" ")[0]}`}>
                        Health Summary
                    </h3>
                    <p className="text-gray-700 mb-1">
                        Based on your recent inputs, your average health risk is:
                    </p>
                    <p className={`text-2xl font-bold ${colorMap[riskLevel].split(" ")[0]}`}>
                        {avgRisk}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        Track blood pressure, glucose, and cholesterol weekly. 
                        Start using your Fitness and Diet Planner.
                    </p>
                </div>

                {/* Insight Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-3xl mx-auto">
                    {tipCardConfigs.map(({ key, label, unit, thresholds, labels }) => {
                        const val = metrics?.[key];
                        const level = getLevel(key, val);
                        return (
                            <InsightCard
                                key={key}
                                label={label}
                                value={val}
                                unit={unit}
                                level={val === "N/A" || val == null ? "none" : level}
                                tip={tips?.[key] ? getRandomTip(tips[key]) : null}
                                thresholds={thresholds}
                                labels={labels}
                            />
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4 mt-10">
                    <AppButton 
                        text="Check Fitness Planner"  
                        onClick={() => {router.push('/dashboard/fitness')}} 
                    />
                    <AppButton 
                        text="Check Diet Planner"  
                        onClick={() => {router.push('/dashboard/nutrition')}} 
                    />
                </div>
            </>
            )}
        </div>
    );
}
