//diabetes/page.tsx
'use client';
import React, { useState } from 'react';
import BackButton from '@/app/components/backButton';
import API from '@/lib/api'

const fields = [
    { name: 'age', label: 'Age', min: 1, max: 120 },
    { name: 'bmi', label: 'BMI', min: 10, max: 60 },
    { name: 'glucose', label: 'Glucose', min: 50, max: 300 },
    { name: 'insulin', label: 'Insulin', min: 0, max: 900 },
    { name: 'bloodPressure', label: 'Blood Pressure', min: 40, max: 250 },
    { name: 'skinThickness', label: 'Skin Thickness', min: 7, max: 99 },
    { name: 'diabetesPedigreeFunction', label: 'Diabetes Pedigree Function', 
            min: 0.0, max: 2.5, step: 0.01 },
    { name: 'pregnancies', label: 'Pregnancies', min: 0, max: 20 },
];


export default function DiabetesPage() {
    const [form, setForm] = useState(() => Object.fromEntries(fields.map(f => [f.name, ''])));
    const [result, setResult] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                            const { name, value } = e.target;
                            setForm(prev => ({ ...prev, [name]: value }));
                        };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = Object.fromEntries(
            Object.entries(form).map(([key, val]) => [key, parseFloat(val) || 0])
        );
        try {
            const {data} = await API.post('/metric/predict/diabetes', payload);
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
            console.error('Prediction error:', error);
            setResult('Prediction failed');
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-center mb-4">Diabetes Risk Prediction</h1>

            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white">
                {fields.map(({ name, label, min, max, step }) => (
                    <div key={name}>
                        <label htmlFor={name} className="block mb-1">{label}:</label>
                        <input
                            id={name}
                            name={name}
                            type="number"
                            value={form[name]}
                            onChange={handleChange}
                            placeholder={label}
                            min={min}
                            max={max}
                            step={step || 'any'}
                            required={name === 'age' || name === 'pregnancies'}
                            className="w-full p-2 border rounded"
                        />
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
