import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { OWNER_CONTACT_INFO } from '../data/experienceAndNotes';
import { RouteDescriptor } from '../utils/portfolioLogic';
import { NavbarAsciiSnake } from './NavbarAsciiSnake';

interface NavigationProps {
  currentRoute: RouteDescriptor;
  activeSection: string;
  onNavigate: (path: string, sectionId?: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRoute,
  activeSection,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Work', path: '/', sectionId: 'work', matchPage: 'projects' },
    { label: 'Domains', path: '/', sectionId: 'domains' },
    { label: 'Experience', path: '/', sectionId: 'experience' },
    { label: 'Notes', path: '/', sectionId: 'notes' },
    { label: 'About', path: '/about', sectionId: 'about', matchPage: 'about' }
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
    sectionId?: string
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(path, sectionId);
  };

  return (
    <header className="fixed top-3 sm:top-4 inset-x-0 z-50 mx-auto max-w-[1240px] px-4 sm:px-6">
      {/* Strict 3-Zone Top Bar Contract inside Floating Monochrome Liquid Glass */}
      <div className="glass-nav rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Wordmark that transforms "Hari Nandan K." into a hyper-detailed ASCII serpent after "K." loads */}
        <a
          href="/"
          aria-label="HK · Hari Nandan K."
          onClick={(e) => handleNavClick(e, '/', 'hero')}
          className="font-display text-sm sm:text-base font-semibold tracking-tight text-[#FFFFFF] hover:text-[#E4E4E7] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFFFFF]"
        >
          <NavbarAsciiSnake />
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A1A1AA]"
        >
          {navItems.map((item) => {
            const isActive =
              (currentRoute.page === 'home' && activeSection === item.sectionId) ||
              (item.matchPage === 'projects' &&
                (currentRoute.page === 'projects' || currentRoute.page === 'project-detail')) ||
              (item.matchPage === 'about' && currentRoute.page === 'about');

            return (
              <a
                key={item.label}
                href={item.sectionId && item.path === '/' ? `/#${item.sectionId}` : item.path}
                onClick={(e) => handleNavClick(e, item.path, item.sectionId)}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFFFFF] ${
                  isActive
                    ? 'text-[#FFFFFF] after:absolute after:bottom-0 after:inset-x-0 after:h-[1.5px] after:bg-[#FFFFFF]'
                    : 'text-[#A1A1AA] hover:text-[#FFFFFF]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
          {OWNER_CONTACT_INFO.resumeAvailable && (
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors whitespace-nowrap shrink-0"
            >
              Resume
            </a>
          )}
        </nav>

        {/* Zone 3: 1 primary action (+ mobile menu trigger on small screens) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/contact"
            onClick={(e) => handleNavClick(e, '/contact', 'contact')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold liquid-pill-action rounded-xl whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF]"
          >
            Get in Touch
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-2.5 rounded-xl text-[#FFFFFF] hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#FFFFFF]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden mt-2 glass-nav rounded-2xl p-5 flex flex-col gap-3"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.sectionId && item.path === '/' ? `/#${item.sectionId}` : item.path}
              onClick={(e) => handleNavClick(e, item.path, item.sectionId)}
              className="py-2.5 px-3 rounded-xl text-base font-medium text-[#FFFFFF] hover:bg-white/5 transition-colors flex items-center justify-between"
            >
              <span>{item.label}</span>
              <ArrowUpRight className="w-4 h-4 text-[#71717A]" />
            </a>
          ))}
          <a
            href="/projects"
            onClick={(e) => handleNavClick(e, '/projects')}
            className="py-2.5 px-3 rounded-xl text-base font-medium text-[#E4E4E7] hover:bg-white/5 transition-colors flex items-center justify-between"
          >
            <span>All Case Studies Archive</span>
            <ArrowUpRight className="w-4 h-4 text-[#E4E4E7]" />
          </a>
        </nav>
      )}
    </header>
  );
};
