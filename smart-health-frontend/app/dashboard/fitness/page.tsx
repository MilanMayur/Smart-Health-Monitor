//fitness/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton } from '@/app/components/button';
import API from '@/lib/api';

interface Workout {
    condition: string;
    day: string;
    workout: string;
    description: string;
    duration: number;
}

export default function FitnessPage() {
    const router = useRouter();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [isGeneric, setIsGeneric] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const res = await API.get('/fitness/workout-recommendations');
                setWorkouts(res.data.workouts);
                setIsGeneric(res.data.isGeneric);
            } 
            catch (error) {
                console.error("Error fetching workouts", error);
            } 
            finally {
                setLoading(false);
            }
        };
        fetchWorkouts();
    }, []);

    const groupedByDay = useMemo(() => {
        return workouts.reduce((acc, workout) => {
            if (!acc[workout.day]) acc[workout.day] = [];
            acc[workout.day].push(workout);
            return acc;
        }, {} as Record<string, Workout[]>);
    }, [workouts]);

    if (loading) {
        return <div className="p-6 text-center text-gray-600">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6 mx-auto max-w-5xl">
            <h1 className="text-2xl font-bold mb-4 text-center">Fitness Planner</h1>

            {/* Generic */}
            {isGeneric && (
                <div className="text-center bg-yellow-100 border border-yellow-300 text-yellow-700 
                    p-4 rounded mb-4 bg-gradient-to-br from-white to-blue-100 opacity-90">
                    <p className="font-medium mb-2">You're viewing a general fitness plan.</p>
                    <p>To get a personalized workout plan, please complete your first health prediction.</p>
                    <div className="mt-10 flex justify-center gap-4">
                        <AppButton 
                            text="Take your First Prediction" 
                            onClick={() => router.push('/dashboard/health')} 
                        />
                    </div>
                </div>
            )}

            {/* Workout Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center 
                mx-auto max-w-6xl">
                {Object.entries(groupedByDay).map(([day, dayWorkouts]) => (
                    <div key={day} className="overflow-y-auto mb-6 p-4 bg-white rounded-xl 
                        shadow transition-all hover:scale-105 hover:shadow-lg
                        bg-gradient-to-br from-white to-indigo-200 opacity-90">
                        <h2 className="text-xl font-bold mb-2 text-indigo-700">{day}</h2>

                        {dayWorkouts.map((w, i) => (
                            <div key={i} className="pl-4 border-l-4 border-blue-500 mb-2">
                                <p className="text-lg text-black">{w.workout}</p>
                                <p className="text-sm text-black mt-1">{w.description}</p>
                                <p className="text-xs text-gray-600">Duration: {w.duration} mins</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Tips */}
            <div className="mt-6 bg-white p-4 shadow rounded-xl mx-auto max-w-6xl
                bg-gradient-to-br from-white to-indigo-200 opacity-90">
                <h2 className="text-lg font-semibold mb-2">Tips</h2>
                <ul className="list-disc pl-5 text-black">
                    <li>Stay hydrated before and after workouts</li>
                    <li>Warm up and cool down to prevent injuries</li>
                </ul>
            </div>
        </div>
    );
}
