'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const { data: session, status } = useSession();

  const linkClasses = `
    relative text-gray-800 hover:text-black cursor-pointer
    after:content-[''] after:absolute after:bottom-0 after:left-0
    after:h-[2px] after:bg-black after:w-0 hover:after:w-full
    after:transition-all after:duration-500
  `;

  const mobileLinkClasses = `
    relative text-gray-700 hover:text-black text-lg cursor-pointer
    after:content-[''] after:absolute after:bottom-0 after:left-0
    after:h-[2px] after:bg-black after:w-0 hover:after:w-full
    after:transition-all after:duration-500
  `;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    setIsOpen(false); // Fermer le menu mobile après déconnexion
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-22">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-gray-900" onClick={closeMenu}>
          Chris
        </Link>

        {/* Liens centrés (desktop) */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-10">
          <Link href="/" className={linkClasses}>Accueil</Link>
          <Link href="/services" className={linkClasses}>Services</Link>
          <Link href="/contact" className={linkClasses}>Contact</Link>
        </div>

        {/* Boutons à droite (desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {status === 'loading' ? (
            <div className="px-4 py-2 text-gray-500">Chargement...</div>
          ) : session?.user ? (
            <>
              <Link
                href="/profil"
                className="px-4 py-2 bg-gray-200 text-black rounded-full hover:bg-gray-300 transition cursor-pointer"
              >
                Réservation
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition cursor-pointer"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition cursor-pointer"
            >
              Réservation
            </Link>
          )}
        </div>

        {/* Burger Menu */}
        <button onClick={toggleMenu} className="md:hidden text-gray-800">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out px-4 ${
          isOpen ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-[calc(60vh-6rem)] space-y-10">
          <Link href="/" className={mobileLinkClasses} onClick={closeMenu}>
            Accueil
          </Link>
          <Link href="/services" className={mobileLinkClasses} onClick={closeMenu}>
            Services
          </Link>
          <Link href="/contact" className={mobileLinkClasses} onClick={closeMenu}>
            Contact
          </Link>

          <div className="pt-4 space-y-2 w-full px-8">
            {status === 'loading' ? (
              <div className="text-center text-gray-500">Chargement...</div>
            ) : session?.user ? (
              <>
                <Link
                  href="/profil"
                  className="w-full block text-center px-4 py-2 bg-gray-200 text-black rounded-full hover:bg-gray-300 transition"
                  onClick={closeMenu}
                >
                  Réservation
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full block text-center px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition cursor-pointer"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="w-full block text-center px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition cursor-pointer"
                onClick={closeMenu}
              >
                Réservation
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}