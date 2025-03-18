// File: components/Navbar.js
/*
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-orange-400 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/Home">
          <span className="text-2xl font-bold cursor-pointer">Mikey's rentals!</span>
        </Link>
        <div className="space-x-4">
          <Link href="/Rent" className="hover:underline">
            Renter
          </Link>
          <Link href="/Owner" className="hover:underline">
            Owner
          </Link>
          <Link href="/Admin/login" className="hover:underline">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
*/

"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  // Simulate user session (replace with actual session logic)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');  // Redirect to AuthPage
  };

  // Toggle menu on icon click
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <nav className="bg-orange-400 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/Home">
          <span className="text-2xl font-bold cursor-pointer">Mikey's Rentals!</span>
        </Link>

        <div className="space-x-4 flex items-center">
          
          {/* Profile Icon & Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            {/* Circular Profile Icon (Click to Toggle Menu) */}
            <div
              className="w-10 h-10 bg-white text-orange-400 rounded-full flex items-center justify-center cursor-pointer"
              onClick={toggleMenu}
            >
              {user ? user.name?.charAt(0).toUpperCase() : "U"}
            </div>

            {/* Dropdown Menu (Visible when toggled) */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded-lg shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left hover:bg-red-100"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

