import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Plus } from 'lucide-react';
import { Button } from './ui/button';

const Layout = ({ children, onCreateMemo }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TN</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Time Notes
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={onCreateMemo}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Memo
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="relative w-5 h-5">
                  <Sun className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                    theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
                  }`} />
                  <Moon className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                    theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                  }`} />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;