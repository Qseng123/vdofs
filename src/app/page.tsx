"use client";
import Kampfsimulator from "./vdofs";

export default function Home() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="max-w-6xl w-full p-6 bg-gray-800 rounded-xl shadow-xl">
                <Kampfsimulator />
            </div>
        </main>
    );
}

