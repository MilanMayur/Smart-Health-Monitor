//profile/change-password/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';

export default function ChangePasswordPage() {
    const router = useRouter();
    const [form, setForm] = useState({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                            });
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit  = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            const res = await API.post('/auth/change-password', {
                                currentPassword: form.currentPassword,
                                newPassword: form.newPassword,
                            });

            alert(res.data.message || 'Password changed successfully!');
            setTimeout(() => router.push('/dashboard/profile'), 1500);
        } 
        catch (error: any) {
            setMessage(error.response?.data?.message || 'Password change failed');
        }
    };

    return (
        <main className="flex flex-col items-center justify-start min-h-screen p-6 pt-12">
            <div className="w-full max-w-md bg-white rounded shadow-md p-8">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Change Password
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {['currentPassword', 'newPassword', 'confirmPassword'].map((field, idx) => (
                        <input
                            key={field}
                            type="password"
                            name={field}
                            placeholder={
                                field === 'currentPassword'
                                    ? 'Current Password'
                                    : field === 'newPassword'
                                        ? 'New Password'
                                        : 'Confirm New Password'
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded 
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form[field as keyof typeof form]}
                            onChange={handleChange}
                            required
                        />
                    ))}

                    {message && (
                        <p className="text-center text-sm text-red-600">{message}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </main>
    );
}
