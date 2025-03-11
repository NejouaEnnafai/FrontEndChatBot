
import React, { useState } from 'react';
import { Building, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#343541] sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 h-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-full">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-medium text-gray-800 dark:text-gray-200">Assistant SQL</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <a href="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Accueil
            </a>
            <a href="#projets" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
              Projets
            </a>
            <a href="#services" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
              Services
            </a>
          </nav>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="text-gray-700 dark:text-gray-300"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            {isMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-white dark:bg-[#343541] border-b border-gray-200 dark:border-gray-800 p-4 z-20">
                <nav className="flex flex-col space-y-3">
                  <a 
                    href="/" 
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Accueil
                  </a>
                  <a 
                    href="#projets" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Projets
                  </a>
                  <a 
                    href="#services" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Services
                  </a>
                </nav>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">
            Assistant Immobilier
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
