//register/page.tsx
'use client'

import { useForm } from 'react-hook-form';
import API from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const onSubmit = async (data: any) => {
        try {
            const res = await API.post('/auth/register', data); 
            router.push('/dashboard');
            console.log('Registering to:', API.defaults.baseURL); //debug
        } 
        catch (err: any) {
            console.error('Registration error:', err);
            if (err.response) {
                setError(err.response.data?.message || 'Registration failed. Please try again.');
            } 
            else if (err.request) {
                setError('No response from server. Please try again later.');
            } 
            else {
                setError('An unexpected error occurred during registration.');
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className="flex items-center justify-between bg-white shadow-md px-6 py-4">
                <a href="/" className="flex items-center space-x-2">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10" />
                    <span className="text-xl font-bold text-gray-800">Smart Health Monitor</span>
                </a>
            </nav>

            {/* Background Image */}
            <div
                className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-80"
                style={{ backgroundImage: `url('/root_background.jpg')` }}
            ></div>

            {/* Main content */}
            <div className="flex-grow flex justify-center items-center">
                <div className="fade-in">
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-md w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

                        <input
                            {...register('name')}
                            placeholder="Full Name"
                            className="mb-3 p-2 border rounded w-full"
                            required
                        />

                        <input
                            {...register('email')}
                            type="email"
                            placeholder="Email"
                            className="mb-3 p-2 border rounded w-full"
                            required
                        />

                        <input
                            {...register('password')}
                            type="password"
                            placeholder="Password"
                            className="mb-3 p-2 border rounded w-full"
                            required
                        />

                        {error && <p className="text-red-500 mb-3 text-center text-sm">{error}</p>}

                        <button
                            type="submit"
                            className="w-full text-white px-4 py-2 rounded cursor-pointer
                                bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-lg                         
                                hover:from-blue-600 hover:to-blue-800"
                        >
                            Register
                        </button>

                        <p className="mt-4 text-center text-sm">
                            Already have an account?{' '}
                            <a href="/login" className="text-blue-600 underline">
                                Login here
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
