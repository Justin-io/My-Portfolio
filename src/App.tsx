/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { PROJECTS } from './data/projects';
import { parseRoute, getProjectBySlug, RouteDescriptor } from './utils/portfolioLogic';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { SelectedWork } from './components/SelectedWork';
import { ProjectCaseStudyView } from './components/ProjectCaseStudyView';
import { DomainsAndCapabilities } from './components/DomainsAndCapabilities';
import { ExperienceAndNotes } from './components/ExperienceAndNotes';
import { ContactAndFooter } from './components/ContactAndFooter';

export default function App() {
  const [route, setRoute] = useState<RouteDescriptor>(() =>
    parseRoute(window.location.pathname)
  );
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Update document title dynamically per route for SEO & browser clarity
  useEffect(() => {
    const baseTitle = 'Hari Nandan K. — Applied AI & Systems Engineer';
    if (route.page === 'home') {
      document.title = baseTitle;
    } else if (route.page === 'projects') {
      document.title = `Selected Work & Case Studies — Hari Nandan K.`;
    } else if (route.page === 'project-detail') {
      const proj = getProjectBySlug(PROJECTS, route.slug);
      document.title = proj
        ? `${proj.title} (${proj.maturity}) — Hari Nandan K.`
        : baseTitle;
    } else if (route.page === 'about') {
      document.title = `About & Capabilities — Hari Nandan K.`;
    } else if (route.page === 'contact') {
      document.title = `Contact — Hari Nandan K.`;
    }
  }, [route]);

  // Listen to browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track active section while scrolling on homepage
  useEffect(() => {
    if (route.page !== 'home') return;

    const sectionIds = ['hero', 'work', 'domains', 'capabilities', 'experience', 'about', 'notes', 'contact'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 240;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [route.page]);

  const handleNavigate = useCallback((path: string, sectionId?: string) => {
    const targetRoute = parseRoute(path);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(targetRoute);

    if (sectionId) {
      requestAnimationFrame(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const renderMainContent = () => {
    if (route.page === 'project-detail') {
      const project = getProjectBySlug(PROJECTS, route.slug);
      if (project) {
        return (
          <>
            <ProjectCaseStudyView project={project} onNavigate={handleNavigate} />
            <ContactAndFooter onNavigate={handleNavigate} />
          </>
        );
      }
    }

    if (route.page === 'projects') {
      return (
        <>
          <SelectedWork onNavigate={handleNavigate} isArchivePage={true} />
          <ContactAndFooter onNavigate={handleNavigate} />
        </>
      );
    }

    if (route.page === 'about') {
      return (
        <div className="pt-16">
          <ExperienceAndNotes onNavigate={handleNavigate} />
          <DomainsAndCapabilities onNavigate={handleNavigate} />
          <ContactAndFooter onNavigate={handleNavigate} />
        </div>
      );
    }

    if (route.page === 'contact') {
      return <ContactAndFooter onNavigate={handleNavigate} isStandalonePage={true} />;
    }

    // Default: Complete editorial homepage ('/')
    return (
      <>
        <Hero onNavigate={handleNavigate} />
        <SelectedWork onNavigate={handleNavigate} />
        <DomainsAndCapabilities onNavigate={handleNavigate} />
        <ExperienceAndNotes onNavigate={handleNavigate} />
        <ContactAndFooter onNavigate={handleNavigate} />
      </>
    );
  };

  return (
    <div className="min-h-screen obsidian-atmosphere text-[#F4F4F5] flex flex-col">
      <Navigation
        currentRoute={route}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />
      <main className="flex-1">{renderMainContent()}</main>
    </div>
  );
}
