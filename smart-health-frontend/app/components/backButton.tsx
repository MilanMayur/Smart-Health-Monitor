//backButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-gradient-to-l from-gray-400 to-gray-800 text-white 
                rounded-xl hover:from-gray-600 hover:to-gray-800 transition cursor-pointer"
        >
            <ArrowLeft className="inline w-4 h-4 mr-2" />Back
        </button>
    );
}

