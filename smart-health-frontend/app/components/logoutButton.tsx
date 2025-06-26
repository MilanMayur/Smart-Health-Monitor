//logoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import API from '@/lib/api';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await API.get('/auth/logout');
            router.push('/');
        } 
        catch (err) {
            console.error('Logout failed', err);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 
                rounded hover:from-red-600 hover:to-red-800 text-white cursor-pointer"
        >
            Logout
        </button>
    );
}
