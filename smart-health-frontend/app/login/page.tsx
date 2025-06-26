//login.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import API from '@/lib/api';

export default function LoginPage() {
    const { register, handleSubmit } = useForm();
    const router = useRouter();
    const [error, setError] = useState('');

    const onSubmit = async (data: any) => {
        try {
            const res = await API.post('/auth/login', 
                data, 
                {
                    withCredentials: true, // REQUIRED for session cookie
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            router.push('/dashboard');
        } 
        catch (err: any) {
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Invalid credentials');
                } 
                else {
                    setError(`Error: ${err.response.data?.message || 'Server error occurred'}`);
                }
            } 
            else if (err.request) {
                setError('No response from server. Please try again later.');
            } 
            else {
                setError('An unexpected error occurred.');
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
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="bg-white p-6 rounded shadow-md w-full max-w-md"
                    >
                        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

                        <input
                            {...register('email')}
                            placeholder="Email"
                            className="mb-2 p-2 border w-full"
                        />

                        <input
                            {...register('password')}
                            type="password"
                            placeholder="Password"
                            className="mb-2 p-2 border w-full"
                        />

                        {error && <p className="text-red-500 text-center text-sm mb-2">{error}</p>}

                        <button
                            type="submit"
                            className="w-full text-white px-4 py-2 rounded cursor-pointer
                                bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-lg                         
                                hover:from-blue-600 hover:to-blue-800"
                        >
                        Login
                        </button>

                        <p className="mt-4 text-center text-sm">
                            Don't have an account?{' '}
                            <a href="/register" className="text-blue-600 underline">
                                Register here
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
