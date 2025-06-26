//heart/page.tsx
'use client';
import { useState } from 'react';
import BackButton from '@/app/components/backButton';
import API from '@/lib/api'

const fields = [
    { name: 'sex', label: 'Sex', type: 'select', 
        options: [{ value: 1, label: 'Male' }, { value: 0, label: 'Female' }] },
    { name: 'age', label: 'Age', type: 'number', 
        min: 1, max: 120, required: true },
    { name: 'chestPainType', label: 'Chest Pain Type', type: 'select', 
        options: [
            { value: 0, label: 'Typical Angina' }, { value: 1, label: 'Atypical Angina' },
            { value: 2, label: 'Non-Anginal Pain' }, { value: 3, label: 'Asymptomatic' }
        ] },
    { name: 'restingBloodPressure', label: 'Resting Blood Pressure', 
        type: 'number', min: 50, max: 200 },
    { name: 'serumCholestoral', label: 'Cholesterol', 
        type: 'number', min: 100, max: 600 },
    { name: 'fastingBloodSugar', label: 'Fasting Blood Sugar', 
        type: 'number', min: 50, max: 300 },
    { name: 'restingECG', label: 'Resting ECG', type: 'select', 
        options: [
            { value: 0, label: 'Normal' }, { value: 1, label: 'ST-T Wave Abnormality' },
            { value: 2, label: 'Left Ventricular Hypertrophy' }
        ] },
    { name: 'maxHeartRate', label: 'Max Heart Rate', 
        type: 'number', min: 70, max: 210 },
    { name: 'exerciseInducedAngina', label: 'Exercise Induced Angina', type: 'select', 
        options: [
            { value: 1, label: 'Yes' }, { value: 0, label: 'No' }
        ] },
    { name: 'thalassemia', label: 'Thalassemia', type: 'select', 
        options: [
            { value: 0, label: 'Normal' }, { value: 1, label: 'Fixed Defect' },
            { value: 2, label: 'Reversible Defect' }, { value: 3, label: 'Other' }
        ] },
    { name: 'oldpeak', label: 'Oldpeak', type: 'number', 
        min: 0, max: 7, step: 0.1 },
    { name: 'stSegment', label: 'ST Segment', type: 'select', 
        options: [
            { value: 0, label: 'Upsloping' }, { value: 1, label: 'Flat' }, 
            { value: 2, label: 'Downsloping' }
        ] },
    { name: 'majorVessels', label: 'Major Vessels', 
        type: 'number', min: 0, max: 3 },
];

export default function HeartPage() {
    const [form, setForm] = useState(() =>
        Object.fromEntries(fields.map(f => [f.name, '']))
    );
    const [result, setResult] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                            const { name, value } = e.target;
                            setForm(prev => ({ ...prev, [name]: value }));
                        };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = Object.fromEntries(
            Object.entries(form).map(([key, val]) => [key, Number(val) || 0])
        );

        try {
            const {data} = await API.post('/metric/predict/heart', payload);

            if (data.probability && data.prediction && data.riskCategory) {
                setResult(
                    `Prediction: ${data.prediction}\n
                    Probability: ${data.probability}%\n
                    Risk Category: ${data.riskCategory}`
                );
            } 
            else {
                setResult('Invalid response format');
            }
        }
        catch (error) {
            console.error('Error during prediction:', error);
            setResult('Prediction failed');
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl text-center font-bold mb-4">Heart Disease Prediction</h1>

            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white">
                {fields.map(field => (
                    <div key={field.name}>
                        <label htmlFor={field.name} className="block mb-1">{field.label}:</label>
                        {field.type === 'select' ? (
                            <select
                                id={field.name}
                                name={field.name}
                                value={form[field.name]}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="" disabled>Select {field.label}</option>
                                {field.options?.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                id={field.name}
                                name={field.name}
                                type="number"
                                value={form[field.name]}
                                onChange={handleChange}
                                placeholder={field.label}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                required={field.required}
                                className="w-full p-2 border rounded"
                            />
                        )}
                    </div>
                ))}
                <button className="w-full cursor-pointer text-white p-2 rounded
                    bg-gradient-to-br from-indigo-200 to-blue-600
                    hover:from-indigo-700 hover:to-indigo-400" type="submit">
                    Predict
                </button>
            </form>

            {result && 
                <div className="mt-5 text-xl text-center font-semibold whitespace-pre-line">
                    {result}
                </div>
            }
            <BackButton />
        </div>
    );
}

