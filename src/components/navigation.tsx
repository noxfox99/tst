'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-deep-blue border-b border-light-blue">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-white-slate text-xl font-bold">
            Micro SaaS AI Builder
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white-slate"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          
          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8">
            <NavLink href="/" active={pathname === '/'}>
              Home
            </NavLink>
            <NavLink href="/projects" active={pathname === '/projects'}>
              Projects
            </NavLink>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <Link 
              href="/" 
              className={`block py-2 px-4 rounded ${pathname === '/' ? 'bg-light-blue text-white-slate' : 'text-slate-blue hover:bg-light-blue/30'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/projects" 
              className={`block py-2 px-4 rounded ${pathname === '/projects' ? 'bg-light-blue text-white-slate' : 'text-slate-blue hover:bg-light-blue/30'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Projects
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string, active: boolean, children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={`${active ? 'text-green-blue font-medium' : 'text-slate-blue hover:text-white-slate'} transition-colors`}
    >
      {children}
    </Link>
  );
}