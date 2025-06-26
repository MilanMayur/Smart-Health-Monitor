//dashboard/page.tsx
'use client';

import API from '@/lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, 
        ResponsiveContainer } from 'recharts';
import { AppButton } from '@/app/components/button';

interface Metrics {
    age: number;
    sex: number;
    bloodPressure: number;
    insulin: number;
    bmi: number;
    glucose: number;
    cholesterol: number;
    maxHeartRate: number;
    restingECG: number;
    diabetesRisk: string;
    heartRisk: string;
    strokeRisk: string;
    diabetesProbability: number;
    heartProbability: number;
    strokeProbability: number;
    updatedAt?: string;
}

export default function DashboardHome() {
    const router = useRouter();
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await API.get('/metric/recent');
                setMetrics(res.data);
            } 
            catch (error) {
                console.error('Failed to load metrics:', error);
                setMetrics(null);
            } 
            finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    const getFormattedDate = () => metrics?.updatedAt
                                ? new Date(metrics.updatedAt).toLocaleString('en-US', {
                                        dateStyle: 'long',
                                        timeStyle: 'short',
                                    })
                                : 'N/A';

    const getRiskColor = (prob = 0) => 
                            prob >= 70 ? 'text-red-600' 
                            : prob >= 30 ? 'text-orange-500' 
                            : 'text-green-600';
    
    const riskChartData = [
        { name: 'Diabetes', value: metrics?.diabetesProbability ?? 0 },
        { name: 'Heart', value: metrics?.heartProbability ?? 0 },
        { name: 'Stroke', value: metrics?.strokeProbability ?? 0 }        
    ];

    const vitals = [
        { title: 'Age', value: `${metrics?.age ?? 'N/A'} yr`, color: 'text-teal-600' },
        {
            title: 'Sex',
            value:
                metrics?.sex === 1
                    ? 'Male'
                    : metrics?.sex === 0
                    ? 'Female'
                    : 'N/A',
            color: 'text-rose-600',
        },
        { title: 'BMI', value: `${metrics?.bmi ?? 'N/A'}`, color: 'text-green-600' },
        {
            title: 'Blood Pressure',
            value: `${metrics?.bloodPressure ?? 'N/A'} mmHg`,
            color: 'text-blue-600',
        },
        {
            title: 'Insulin Level',
            value: `${metrics?.insulin ?? 'N/A'} µU/mL`,
            color: 'text-purple-600',
        },
        {
            title: 'Glucose',
            value: `${metrics?.glucose ?? 'N/A'} mg/dL`,
            color: 'text-yellow-600',
        },
        {
            title: 'Cholesterol',
            value: `${metrics?.cholesterol ?? 'N/A'} mg/dL`,
            color: 'text-indigo-600',
        },
        {
            title: 'Max Heart Rate',
            value: `${metrics?.maxHeartRate ?? 'N/A'} bpm`,
            color: 'text-pink-600',
        },
        {
            title: 'Resting ECG',
            value:
                metrics?.restingECG === 0
                    ? 'Normal'
                    : metrics?.restingECG === 1
                    ? 'ST-T Abnormality'
                    : metrics?.restingECG === 2
                    ? 'LV Hypertrophy'
                    : 'N/A',
            color: 'text-cyan-600',
        },
    ];

    const risks = [
        {
            title: 'Diabetes Risk',
            value: `${metrics?.diabetesRisk ?? 'N/A'} (${metrics?.diabetesProbability ?? 0}%)`,
            color: getRiskColor(metrics?.diabetesProbability),
        },
        {
            title: 'Heart Disease Risk',
            value: `${metrics?.heartRisk ?? 'N/A'} (${metrics?.heartProbability ?? 0}%)`,
            color: getRiskColor(metrics?.heartProbability),
        },
        {
            title: 'Stroke Risk',
            value: `${metrics?.strokeRisk ?? 'N/A'} (${metrics?.strokeProbability ?? 0}%)`,
            color: getRiskColor(metrics?.strokeProbability),
        },
    ];

    if (loading) {
        return <div className="p-6 text-center text-gray-600">Loading dashboard...</div>;
    }

    return (
        <div className="p-6 bg-transparent">
            <h1 className="text-2xl font-bold text-center mb-4">
                Welcome to Your Smart Health Dashboard
            </h1>
            <p className="text-gray-700 text-center mb-4">
                View your latest health metrics and AI-powered predictions.
            </p>

            {/* No Metrics */}
            {!loading && !metrics && (
                <div className="text-center bg-yellow-100 border border-yellow-300 text-yellow-700 
                    p-4 rounded mb-4 bg-gradient-to-br from-white to-blue-100 opacity-90">
                    <h2 className="text-lg font-semibold text-red-600 mb-2">
                        No recent health metrics found.
                    </h2>
                    <p>
                        Start by taking a prediction test to populate your dashboard.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <AppButton 
                            text="Take your First Prediction" 
                            onClick={() => {router.push('/dashboard/health')}} 
                        />
                    </div>
                </div>
            )}

            {/* Metrics Card + Chart */}
            {metrics && (
            <>
                <p className="text-sm text-gray-500 text-center mt-4">
                    Last updated on {getFormattedDate()}
                </p>

                {/* Vitals Section */}
                <h2 className="text-xl font-semibold mt-5 mb-4 text-center text-gray-800">
                    Vitals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto max-w-4xl">
                    {vitals.map((v) => (
                        <Card key={v.title} {...v} />
                    ))}
                </div>

                {/* Action */}
                <div className="mt-10 flex justify-center gap-4">
                    <AppButton 
                        text="View Health Insights"  
                        onClick={() => {router.push('/dashboard/insights')}} 
                    />
                </div>

                {/* Risk Section */}
                <h2 className="text-xl font-semibold mt-10 mb-4 text-center text-gray-800">
                    AI-Powered Risk Predictions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto max-w-4xl">
                    {risks.map((r) => (
                        <Card key={r.title} {...r} />
                    ))}
                </div>

                {/* Chart */}
                <div className="mt-10 bg-white rounded-lg shadow p-4 max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold mb-2 text-center text-gray-800">
                        Risk Overview
                    </h3>
                    <ResponsiveContainer height={250}>
                        <BarChart 
                            data={riskChartData} layout="vertical"
                            margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
                        >
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip />
                            <Bar dataKey="value" barSize={40}>
                                {riskChartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            entry.value < 30 ? '#16A34A' // Green
                                            : entry.value < 70 ? '#F97316' // Orange
                                            : '#DC2626' // Red
                                        }
                                        radius={5}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Action */}
                <div className="mt-10 flex justify-center gap-4">
                    <AppButton 
                        text="Update Health Prediction"  
                        onClick={() => {router.push('/dashboard/health')}} 
                    />
                </div>
            </>
            )}
        </div>
    );
}

function Card({ title, value, color }: 
    { title: string; 
        value: string; 
        color: string }) {
    return (
        <div className="bg-white bg-opacity-50 text-center 
            backdrop-blur-sm shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className={`text-xl ${color}`}>{value}</p>
        </div>
    );
}

