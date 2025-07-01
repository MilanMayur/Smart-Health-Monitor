//dashboard/layout.tsx
'use client';
import { useAuth } from '@/app/components/authProvider';
import { useRouter } from 'next/navigation';
import React from 'react';
import LogoutButton from '../components/logoutButton';
import Link from 'next/link';
import Image from 'next/image';

const navItems = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/health', label: 'Health Prediction' },
    { href: '/dashboard/nutrition', label: 'Diet & Nutrition' },
    { href: '/dashboard/fitness', label: 'Fitness Planner' },
    { href: '/dashboard/insights', label: 'Health Insights' },
    { href: '/dashboard/profile', label: 'Profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return <div>Loading...</div>;

    return (
        <div className="relative min-h-screen flex flex-col">
            {/* Background Image */}
            <div
                className="absolute inset-0 -z-10 bg-cover bg-center opacity-80"
                style={{ backgroundImage: `url('/dashboard_background.jpg')` }}
            ></div>

            {/* Overlay for content */}
            <div className="relative z-10">
                {/* Top Navbar */}
                <nav className="fixed top-0 left-0 right-0 z-100 flex justify-between 
                    items-center px-6 py-4 bg-black text-white">
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <Image  src="/logo.png" alt="Logo" width={40} height={40} />
                        <span className="font-bold text-3xl">Smart Health Care</span>
                    </Link>
                    <LogoutButton />
                </nav>

                {/* Main content: Sidebar + page */}
                <div className="flex flex-1 pt-16">

                    {/* Sidebar Content*/}
                    <aside className="sticky top-16 h-[calc(100vh-64px)] w-64 bg-gray-800 
                        opacity-70 text-white p-4 overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                        <nav>
                            {navItems.map(({ href, label }) => (
                                <Link key={href} href={href} 
                                    className="block py-2 hover:bg-gray-700">
                                    <p className="font-bold">{label}</p>
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Page Content */}
                    <main className="flex-1 bg-transparent-100 px-6 py-4 mt-4 overflow-y-auto">
                        {children}
                    </main>
                </div>

                {/* Footer AI Chat*/}
                <footer className="pb-1 text-center text-white text-sm opacity-80">
                    <button onClick={() => router.push('/dashboard/ai-chat')}
                        className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14
                            rounded-full shadow-lg hover:bg-blue-800 transition-all 
                            hover:scale-105 cursor-pointer"
                    >
                        Chat AI
                    </button> 
                </footer>
            </div>
        </div>
    );
}

