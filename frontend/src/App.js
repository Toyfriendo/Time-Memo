import React, { useState, useEffect } from 'react';
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/toaster';
import Layout from './components/Layout';
import MemoList from './components/MemoList';
import MemoModal from './components/MemoModal';
import NotificationSystem from './components/NotificationSystem';
import { getMemos, createMemo, updateMemo, deleteMemo } from './mock/mockData';
import { useToast } from './hooks/use-toast';
import "./App.css";

function AppContent() {
  const [memos, setMemos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState(null);
  const { toast } = useToast();

  // Load memos on component mount
  useEffect(() => {
    loadMemos();
  }, []);

  const loadMemos = async () => {
    try {
      const data = await getMemos();
      setMemos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load memos",
        variant: "destructive"
      });
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
        await updateMemo(editingMemo.id, memoData);
        setMemos(prev => prev.map(memo => 
          memo.id === editingMemo.id 
            ? { ...memo, ...memoData, updatedAt: new Date().toISOString() }
            : memo
        ));
      } else {
        const newMemo = await createMemo(memoData);
        setMemos(prev => [newMemo, ...prev]);
      }
      setIsModalOpen(false);
      setEditingMemo(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save memo",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMemo = async (memo) => {
    if (window.confirm('Are you sure you want to delete this memo?')) {
      try {
        await deleteMemo(memo.id);
        setMemos(prev => prev.filter(m => m.id !== memo.id));
        toast({
          title: "Success",
          description: "Memo deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete memo",
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleAlarm = async (memo) => {
    try {
      const updatedAlarm = {
        ...memo.alarm,
        enabled: !memo.alarm?.enabled
      };
      
      await updateMemo(memo.id, { alarm: updatedAlarm });
      setMemos(prev => prev.map(m => 
        m.id === memo.id 
          ? { ...m, alarm: updatedAlarm, updatedAt: new Date().toISOString() }
          : m
      ));
      
      toast({
        title: updatedAlarm.enabled ? "Alarm enabled" : "Alarm disabled",
        description: `Alarm for "${memo.title}" has been ${updatedAlarm.enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle alarm",
        variant: "destructive"
      });
    }
  };

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