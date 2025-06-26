//stroke/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/app/components/backButton';
import API from '@/lib/api'

const fields = [
    { name: 'gender', label: 'Gender', 
            type: 'select', options: ['Male', 'Female', 'Other'] },
    { name: 'age', label: 'Age', 
            type: 'number', min: 1, max: 120 },
    { name: 'hypertension', label: 'Hypertension', 
            type: 'select', options: ['Yes', 'No'] },
    { name: 'heartDisease', label: 'Heart Disease', 
            type: 'select', options: ['Yes', 'No'] },
    { name: 'married', label: 'Married', 
            type: 'select', options: ['Yes', 'No'] },
    { name: 'workType', label: 'Work Type', type: 'select', 
            options: ['Private', 'Self-employed', 'Govt-job', 'children', 'Never worked'] },
    { name: 'residenceType', label: 'Residence Type', 
            type: 'select', options: ['Urban', 'Rural'] },
    { name: 'glucose', label: 'Glucose Level', 
            type: 'number', min: 50, max: 300 },
    { name: 'bmi', label: 'BMI', type: 'number', 
            min: 10, max: 60 },
    { name: 'smokingStatus', label: 'Smoking Status', type: 'select', 
            options: ['never smoked', 'formerly smoked', 'smokes', 'Unknown'] },
];

export default function StrokePage() {
    const router = useRouter();
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
        const payload  = {
                            gender: form.gender,
                            age: parseInt(form.age) || 0,
                            hypertension: form.hypertension === 'Yes' ? 1 : 0,
                            heartDisease: form.heartDisease === 'Yes' ? 1 : 0,
                            married: form.married,
                            workType: form.workType,
                            residenceType: form.residenceType,
                            glucose: parseFloat(form.glucose) || 100.0,
                            bmi: parseFloat(form.bmi) || 25.0,
                            smokingStatus: form.smokingStatus,
                        };
        try {
            const {data} = await API.post('/metric/predict/stroke', payload );

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
            setResult('Error predicting risk');
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl text-center font-bold mb-4">Stroke Risk Prediction</h1>

            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white">
                {fields.map(f => (
                    <div key={f.name}>
                        <label className="block mb-1">{f.label}:</label>
                        {f.type === 'select' ? (
                            <select
                                name={f.name}
                                value={form[f.name]}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                            >
                                <option value="" disabled>Select {f.label}</option>
                                {f.options!.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                name={f.name}
                                type="number"
                                value={form[f.name]}
                                onChange={handleChange}
                                placeholder={f.label}
                                min={f.min}
                                max={f.max}
                                className="w-full p-2 border rounded"
                                required
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


/*

                <p>Enter Gender:</p>
                <select name="gender" value={form.gender} onChange={handleChange} 
                        className="w-full p-2 border rounded" required>
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>


                <p>Enter Age:</p>
                <input type="number" name="age" value={form.age} 
                        onChange={handleChange} placeholder="Age" 
                        className="w-full p-2 border rounded" 
                        min={1} max={120} required />


                <p>Enter Hypertension:</p>
                <select name="hypertension" value={form.hypertension} 
                        onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="" disabled>Hypertension</option>
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                </select>


                <p>Enter Heart Disease:</p>
                <select name="heartDisease" value={form.heartDisease} 
                        onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="" disabled>Heart Disease</option>
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                </select>


                <p>Enter Married:</p>
                <select name="married" value={form.married} 
                        onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="" disabled>Married</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>


                <p>Enter Work Type:</p>
                <select name="workType" value={form.workType} 
                        onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="" disabled>Work Type</option>
                    <option value="Private">Private</option>
                    <option value="Self-employed">Self-employed</option>
                     <option value="Govt-job">Govt-job</option>
                    <option value="children">Children</option>
                    <option value="Never worked">Never worked</option>
                </select>


                <p>Enter Residence Type:</p>
                <select name="residenceType" value={form.residenceType} 
                        onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="" disabled>Residence Type</option>
                    <option value="Urban">Urban</option>
                    <option value="Rural">Rural</option>
                </select>


                <p>Enter Glucose Level:</p>
                <input type="number" name="glucose" value={form.glucose} 
                        onChange={handleChange} placeholder="Avg Glucose Level" 
                        className="w-full p-2 border rounded" min={50} max={300}/>


                <p>Enter BMI:</p>
                <input type="number" name="bmi" value={form.bmi} 
                        onChange={handleChange} placeholder="BMI" 
                        className="w-full p-2 border rounded" min={10} max={60}/>


                <p>Enter Smoking Status:</p>
                <select name="smokingStatus" value={form.smokingStatus} 
                        onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="" disabled>Smoking Status</option>
                    <option value="never smoked">Never smoked</option>
                    <option value="formerly smoked">Formerly smoked</option>
                    <option value="smokes">Smokes</option>
                    <option value="Unknown">Unknown</option>
                </select>
*/
