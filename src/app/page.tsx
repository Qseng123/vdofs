"use client";
import Kampfsimulator from "./vdofs";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-3xl w-full p-6 bg-white rounded-xl shadow-lg">
        <Kampfsimulator />
      </div>
    </main>
  );
}
