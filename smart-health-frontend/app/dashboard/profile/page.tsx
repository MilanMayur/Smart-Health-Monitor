//profile/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import API from '@/lib/api';
import { AppButton } from '@/app/components/button';
import { Mail, User, LoaderIcon, Pencil, Lock, Trash2 } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
    const [metrics, setMetrics] = useState<{ 
                                                updatedAt?: string; 
                                                sex?: number;
                                                diabetesProbability?: number;
                                                heartProbability?: number;
                                                strokeProbability?: number;
                                    } | null>(null);
    const [formattedDate, setFormattedDate] = useState<string>('N/A');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserAndMetrics = async () => {
            try {
                const authRes = await API.get('/auth/check');
                setUser(authRes.data.authenticated ? authRes.data.user : null);

                if (authRes.data.authenticated) {
                    const metricRes = await API.get('/metric/recent');
                    setMetrics(metricRes.data);

                    const updatedAt = metricRes.data?.updatedAt;
                    if (updatedAt) {
                        const formatted = new Date(updatedAt).toLocaleString('en-US', {
                            dateStyle: 'long',
                            timeStyle: 'short',
                        });
                        setFormattedDate(formatted);
                    }
                }
            }   
            catch (error) {
                console.error('Error loading user or metrics:', error);
                setUser(null);
                setMetrics(null);
            } 
            finally {
                setLoading(false);
            }
        };
        fetchUserAndMetrics();
    }, []);

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account?')) return;
        
        try {
            const response = await API.delete('/auth/delete-account');
            alert(response.data.message || 'Account deleted');
            router.push('/');
        } 
        catch (error) {
            console.error(error);
            alert('An error occurred while deleting account.');
        }
    };

    if (loading) {
        return <p className="p-6 text-center text-gray-600">Loading...</p>;
    }
    if (!user) {
        return <p className="p-6 text-center text-gray-600">Please login</p>;
    }

    const badge = hasMetricsData(metrics) ? getHealthBadge(metrics) : null;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">Profile Settings</h1>

             <div className="p-6 bg-gradient-to-bl from-white via-blue-50 to-blue-100  
                space-y-4 w-full max-w-md mx-auto mt-10 flex flex-col items-center
                rounded-xl shadow-lg opacity-90">
                
                <div className="p-4 rounded w-full text-center">
                    <Image
                        className="mx-auto mb-5 rounded-full border-2 border-blue-500 
                            shadow-lg hover:scale-105 transition-transform duration-300"
                        src={metrics?.sex === 0 ? '/user_female.png' : '/user_male.png'}
                        alt="User_Icon"
                        width={90}
                        height={90}
                    />

                    <InfoRow icon={<User className="w-4 h-4" />} text={user.name} />
                    <InfoRow icon={<Mail className="w-4 h-4" />} text={user.email} />
                    <InfoRow icon={<LoaderIcon className="w-4 h-4" />} text={`Last Updated: ${formattedDate}`} />

                    {badge && (
                        <div className={`inline-block px-4 py-2 rounded-full border text-sm font-medium 
                            ${colorMap[badge.color]}`}>
                            Health Badge: {badge.label} {badge.emoji}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <AppButton 
                    text="Update Details" 
                    icon={<Pencil className="w-4 h-4" />} 
                    onClick={() => {router.push('/dashboard/profile/update-details')}} 
                />

                <AppButton 
                    text="Change Password" 
                    icon={<Lock className="w-4 h-4" />} 
                    onClick={() => {router.push('/dashboard/profile/change-password')}}
                />

                <AppButton 
                    text="Delete Account" 
                    icon={<Trash2 className="w-4 h-4" />} 
                    onClick={handleDeleteAccount} 
                    color="red"
                />
            </div>
        </div>
    );
} 

function InfoRow({ icon, text }: { icon: React.ReactNode; text?: string }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-2 text-gray-800">
            {icon}
            <p className="text-gray-600">{text}</p>
        </div>
    );
}

interface Metrics {
    updatedAt?: string;
    sex?: number;
    diabetesProbability?: number;
    heartProbability?: number;
    strokeProbability?: number;
}

const colorMap: Record<string, string> = {
    amber: 'bg-amber-100 text-amber-800 border-amber-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

function hasMetricsData(metrics: Metrics | null) {
    return !!metrics && Object.values(metrics).some(val => val !== null && val !== 'N/A' && val !== 0);
}

function getHealthBadge(metrics: Metrics | null) {
    if (!metrics) return null;

    const risks = [
        metrics.diabetesProbability || 0,
        metrics.heartProbability || 0,
        metrics.strokeProbability || 0,
    ];
    const avgRisk = risks.reduce((a, b) => a + b, 0) / risks.length;

    if (avgRisk < 30) return { label: 'Gold', color: 'amber', emoji: '🥇' };
    if (avgRisk < 70) return { label: 'Silver', color: 'gray', emoji: '🥈' };
    return { label: 'Bronze', color: 'yellow', emoji: '🥉' };
}

