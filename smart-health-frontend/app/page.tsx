//app/page.tsx
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, Activity, Dumbbell, Salad, Lock, UtensilsCrossed  } from 'lucide-react';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function HomePage() {
    const router = useRouter();
    const [secondBgVisible, setSecondBgVisible] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setSecondBgVisible(entry.isIntersecting),
            { threshold: 0.5 }
        );

        const section = document.getElementById('second-section');
        if (section) observer.observe(section);

        AOS.init({
            duration: 3600,  // animation duration in ms 3600
            once: false      // animate only once when scrolling down
        });

        const handleScroll = () => { setShowButton(window.scrollY > 300) };
        window.addEventListener('scroll', handleScroll);

        return () =>  {
            if (section) observer.unobserve(section);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogin = () => {
        router.push('/login');
    };

    return (
        <div>
            {/* Navbar */}
            <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between 
                p-4 bg-white shadow-md">
                <div className="flex items-center space-x-2">
                    <Image src="/logo.png" alt="Logo" width={40} height={40} />
                    <span className="text-xl font-bold text-gray-800">
                        Smart Health Monitor
                    </span>
                </div>
                <button
                    onClick={handleLogin}
                    className="px-4 py-2 text-white rounded-2xl cursor-pointer                        
                        bg-gradient-to-r from-indigo-400 to-blue-700 hover:shadow-lg                         
                        hover:from-indigo-600 hover:to-blue-800"
                >
                    Login
                </button>
            </nav>

            {/* First Background (Default) */}
            <div className={`fixed top-0 left-0 w-screen h-screen -z-20 bg-cover bg-center bg-no-repeat 
                bg-fixed transition-opacity duration-1000 ${secondBgVisible ? 'opacity-0' : 'opacity-100'}`}
                style={{ backgroundImage: `url('/root_background.jpg')` }}
            />

            {/* Second Background (Visible on Scroll) */}
            <div className={`fixed top-0 left-0 w-screen h-screen -z-10 bg-cover bg-center bg-no-repeat 
                bg-fixed transition-opacity duration-1000 ${secondBgVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: `url('/background1.png')` }}
            />

            {/* Hero Section */}
            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <section className="pt-20 min-h-screen flex flex-col items-center justify-center text-center px-4">
                
                    <h1 className="mt-10 text-5xl font-extrabold text-white text-shadow">
                        Welcome to Smart Health Monitor
                    </h1>
                
                    <p className="mt-20 text-xl text-white max-w-xl">
                        Track your vital health parameters, receive risk predictions powered by AI,
                        and view reports securely.
                    </p>
                    <button
                        onClick={handleLogin}
                        className="mt-10 px-6 py-3 text-white rounded-lg cursor-pointer                        
                        bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-lg                         
                        hover:from-blue-600 hover:to-blue-800"
                    >
                        Get Started
                    </button>
                    <div className="mt-8 animate-bounce text-white text-sm">
                        ↓ Scroll Down
                    </div>
                </section>
            </motion.section>

            {/* Info Section */}
            <section id="second-section" className="pt-10 px-4 flex flex-col items-center justify-start">
                
                {/* How It Works */}
                <h1 className="text-3xl font-bold mb-8 text-white text-shadow">How It Works?</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl text-center">
                    <div data-aos="fade-up" data-aos-delay="400" data-aos-easing="ease-in-out" 
                        className="p-4 bg-gradient-to-br from-white to-blue-200 text-black rounded-xl 
                            shadow transition-all hover:scale-105 hover:shadow-lg">
                        <h3 className="font-bold text-lg mb-2">1. Enter Your Health Data</h3>
                        <p className="text-gray-700">
                            Input your vitals like blood pressure, glucose, BMI, and more.
                        </p>
                    </div>
                    <div data-aos="fade-up" data-aos-delay="600" data-aos-easing="ease-in-out" 
                        className="p-4 bg-gradient-to-br from-white to-red-200 text-black rounded-xl 
                            shadow transition-all hover:scale-105 hover:shadow-lg">
                        <h3 className="font-bold text-lg mb-2">2. Get Instant Risk Predictions</h3>
                        <p className="text-gray-700">
                            AI models analyze your data to predict risks of diabetes, heart disease, and stroke.
                        </p>
                    </div>
                    <div data-aos="fade-up" data-aos-delay="800" data-aos-easing="ease-in-out" 
                        className="p-4 bg-gradient-to-br from-white to-green-200 text-black rounded-xl 
                            shadow transition-all hover:scale-105 hover:shadow-lg">
                        <h3 className="font-bold text-lg mb-2">3. Personalized Plans</h3>
                        <p className="text-gray-700">
                            Receive fitness routines and nutrition tips tailored to your health status.
                        </p>
                    </div>
                </div>

                {/* Why Smart Health Monitor */}
                <div className="mt-20 text-center max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4 text-white text-shadow">Why Smart Health Monitor?</h2>
                    <p className="text-white">
                        Built with advanced AI models, our platform empowers individuals to monitor their 
                        health and prevent serious conditions before they arise — all in a secure and 
                        user-friendly interface.
                    </p>
                </div>

                {/* What Do You Get */}
                <div className="relative w-[420px] h-[420px] text-center mx-auto mt-10">
                    <h2 className="text-3xl font-bold mb-4 text-white text-shadow">What Do You Get?</h2>
                                    
                    {/* Circle 1 - Top */}
                    <div data-aos="flip-right" data-aos-delay="600" data-aos-easing="ease-in-out" 
                        className="absolute top-15 left-1/2 transform -translate-x-1/2 w-36 h-36 
                            transition-all hover:scale-105 hover:shadow-lg text-center rounded-full 
                            shadow-md flex items-center justify-center p-4 text-sm font-bold text-white 
                            flex flex-col bg-gradient-to-br from-blue-400 to-teal-200">
                        <HeartPulse className="w-6 h-6 mb-1"/>
                        <span className="text-shadow">Real-Time<br />Health Tracking</span>
                    </div>

                    {/* Circle 2 - Top Left */}
                    <div data-aos="flip-right" data-aos-delay="400" data-aos-easing="ease-in-out" 
                        className="absolute top-[140px] left-[0px] w-36 h-36 transition-all 
                            hover:scale-105 hover:shadow-lg text-center rounded-full shadow-md flex 
                            items-center justify-center p-4 text-sm font-bold text-white flex flex-col 
                            bg-gradient-to-br from-red-400 to-pink-200">
                        <Activity className="w-6 h-6 mb-1"/>
                        <span className="text-shadow">Risk<br />Assessments</span>
                    </div>

                    {/* Circle 3 - Top Right */}
                    <div data-aos="flip-right" data-aos-delay="800" data-aos-easing="ease-in-out" 
                        className="absolute top-[140px] right-[0px] w-36 h-36  transition-all 
                            hover:scale-105 hover:shadow-lg text-center rounded-full shadow-md flex 
                            items-center justify-center p-4 text-sm font-bold text-white flex flex-col 
                            bg-gradient-to-br from-orange-400 to-stone-200">
                        <Dumbbell className="w-6 h-6 mb-1"/>
                        <span className="text-shadow">Personalized<br />Workout</span>
                    </div>

                    {/* Circle 4 - Bottom Left */}
                    <div data-aos="flip-right" data-aos-delay="1200" data-aos-easing="ease-in-out" 
                        className="absolute top-[290px] left-[55px] w-36 h-36  transition-all 
                            hover:scale-105 hover:shadow-lg text-center rounded-full shadow-md flex 
                            items-center justify-center p-4 text-sm font-bold text-white flex flex-col 
                            bg-gradient-to-br from-yellow-400 to-emerald-200">
                        <UtensilsCrossed  className="w-6 h-6 mb-1"/>
                        <span className="text-shadow">Customized<br />Diet</span>
                    </div>

                    {/* Circle 5 - Bottom Right */}
                    <div data-aos="flip-right" data-aos-delay="1000" data-aos-easing="ease-in-out" 
                        className="absolute top-[290px] right-[55px] w-36 h-36  transition-all 
                            hover:scale-105 hover:shadow-lg text-center rounded-full shadow-md flex 
                            items-center justify-center p-4 text-sm font-bold text-white flex flex-col 
                            bg-gradient-to-br from-violet-400 to-sky-200">
                        <Lock className="w-6 h-6 mb-1"/>
                        <span className="text-shadow">Secure<br />Storage</span>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-20 pb-1 text-center text-white text-sm opacity-60">
                    &copy; 2025 Smart Health Monitor. All rights reserved.
                    <>
                        {showButton && (
                            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 
                                    rounded-full shadow-lg hover:bg-blue-800 transition-all"
                            >
                                ↑ Top
                            </button>
                        )}
                    </>
                </footer>
            </section>
        </div>
    );
}

