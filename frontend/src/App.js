import React, { useState, useEffect } from 'react';
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/toaster';
import Layout from './components/Layout';
import MemoList from './components/MemoList';
import MemoModal from './components/MemoModal';
import NotificationSystem from './components/NotificationSystem';
import { memoApi } from './services/api';
import { useToast } from './hooks/use-toast';
import "./App.css";

function AppContent() {
  const [memos, setMemos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load memos on component mount
  useEffect(() => {
    loadMemos();
  }, []);

  const loadMemos = async () => {
    try {
      setIsLoading(true);
      const data = await memoApi.getMemos();
      setMemos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load memos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMemo = () => {
    setEditingMemo(null);
    setIsModalOpen(true);
  };

  const handleEditMemo = (memo) => {
    setEditingMemo(memo);
    setIsModalOpen(true);
  };

  const handleSaveMemo = async (memoData) => {
    try {
      if (editingMemo) {
        const updatedMemo = await memoApi.updateMemo(editingMemo.id, memoData);
        setMemos(prev => prev.map(memo => 
          memo.id === editingMemo.id ? updatedMemo : memo
        ));
      } else {
        const newMemo = await memoApi.createMemo(memoData);
        setMemos(prev => [newMemo, ...prev]);
      }
      setIsModalOpen(false);
      setEditingMemo(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteMemo = async (memo) => {
    if (window.confirm('Are you sure you want to delete this memo?')) {
      try {
        await memoApi.deleteMemo(memo.id);
        setMemos(prev => prev.filter(m => m.id !== memo.id));
        toast({
          title: "Success",
          description: "Memo deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleAlarm = async (memo) => {
    try {
      const updatedMemo = await memoApi.toggleAlarm(memo.id);
      setMemos(prev => prev.map(m => 
        m.id === memo.id ? updatedMemo : m
      ));
      
      toast({
        title: updatedMemo.alarm.enabled ? "Alarm enabled" : "Alarm disabled",
        description: `Alarm for "${memo.title}" has been ${updatedMemo.alarm.enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <Layout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your memos...</p>
            </div>
          </div>
        </Layout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <Layout onCreateMemo={handleCreateMemo}>
        <MemoList
          memos={memos}
          onEdit={handleEditMemo}
          onDelete={handleDeleteMemo}
          onToggleAlarm={handleToggleAlarm}
        />
        
        <MemoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          memo={editingMemo}
          onSave={handleSaveMemo}
        />
        
        <NotificationSystem memos={memos} />
      </Layout>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;