//profile/update-details/page.tsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import API from '@/lib/api';
import { useRouter } from 'next/navigation';
import { AppButton } from '@/app/components/button';

type FormValues = {
    age?: number;
    sex?: string;
    bmi?: number;
    bloodPressure?: number;
    glucose?: number;
    insulin?: number;
    cholesterol?: number;
    maxHeartRate?: number;
    restingECG?: string;
};

export default function UpdateDetailsPage() {
    const { register, handleSubmit } = useForm();
    const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const router = useRouter();

    const onSubmit = async (data: FormValues) => {
        try {
            await API.put('/metric/update', data, { withCredentials: true });
            setStatus({ type: 'success', msg: 'Metrics updated successfully!' });
            setTimeout(() => router.push('/dashboard/profile'), 1500);
        } 
        catch (error: any) {
            console.error(error);
            setStatus({
                type: 'error',
                msg: error?.response?.data?.message || 'Failed to update details',
            });
        }
    };

    const inputClass = "w-full p-2 border rounded";

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">Update Health Metrics</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 shadow-md rounded-xl">
                {[
                    { label: 'Age', name: 'age', type: 'number', min: 1, max: 120 },
                    { label: 'BMI', name: 'bmi', type: 'number', min: 10, max: 60, step: 0.1 },
                    { label: 'Blood Pressure', name: 'bloodPressure', type: 'number', min: 40, max: 250 },
                    { label: 'Glucose', name: 'glucose', type: 'number', min: 50, max: 300 },
                    { label: 'Insulin', name: 'insulin', type: 'number', min: 0, max: 900 },
                    { label: 'Cholesterol', name: 'cholesterol', type: 'number', min: 100, max: 600 },
                    { label: 'Max Heart Rate', name: 'maxHeartRate', type: 'number', min: 70, max: 210 },
                ].map(({ label, name, ...rest }) => (
                    <div key={name}>
                        <label className="block font-medium">{label}</label>
                        <input {...register(name as keyof FormValues)} {...rest} className={inputClass} />
                    </div>
                ))}

                {/* Sex Dropdown */}
                <div>
                    <label className="block font-medium">Sex</label>
                    <select {...register('sex')} className="w-full p-3 border rounded">
                        <option value="" disabled>Select sex</option>
                        <option value="1">Male</option>
                        <option value="0">Female</option>
                    </select>
                </div>

                {/* Resting ECG Dropdown */}
                <div>
                    <label className="block font-medium">Resting ECG</label>
                    <select {...register('restingECG')} className="w-full p-3 border rounded">
                        <option value="" disabled>Select ECG</option>
                        <option value="0">Normal</option>
                        <option value="1">ST-T Wave Abnormality</option>
                        <option value="2">Left Ventricular Hypertrophy</option>
                    </select>
                </div>

                <div className="flex justify-center">
                    <AppButton 
                        text="Update Metrics" 
                        type="submit"
                    >
                    </AppButton>
                </div>

                {status && (
                    <p className={`mt-2 ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {status.msg}
                    </p>
                )}
            </form>
        </div>
    );
}
