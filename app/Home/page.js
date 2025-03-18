'use client'
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useState } from "react";

export default function Home() {
const credentials= "fake fakeman"
  return (
    <div className="container mx-auto px-4 bg-gray-800 h-screen w-full">
      <Navbar/>
       <Image
        src="/pics/logobig.png" // Path to your image (can be local or external)
        alt="Logo of Mikey's Rentals"
        width={128} // Desired width
        height={128} // Desired height
      />
      <h1 className="text-4xl font-bold my-8 text-white">Welcome to Mikey's rentals,{credentials}!</h1>
      <h1 className="text-4xl font-bold my-8 text-white">Who are you?</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/Rent" className="bg-blue-600 text-white p-4 rounded-md text-center">
          I want to rent
        </Link>
        <Link href="/Owner" className="bg-green-600 text-white p-4 rounded-md text-center">
          I am a Owner
        </Link>
      </div>
    </div>
  );
}
