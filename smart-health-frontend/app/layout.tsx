//app/layout.tsx
import type { Metadata } from "next";
import SessionWrapper from './components/authProvider';
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from 'next/font/google';
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

const inter = Inter({ subsets: ['latin'], display: "swap" });

export const metadata: Metadata = {
    title: "Smart Health Monitor",
    description: "Track your vital health parameters",
    icons: {
        icon: "/logo.png"
    }
};

export default function RootLayout({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.className}`}>
            <body className="antialiased relative min-h-screen overflow-x-hidden">
                {/* Main Content */}
                <SessionWrapper>
                    {children}
                </SessionWrapper>
            </body>
        </html>
    );
}
