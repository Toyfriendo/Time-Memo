// Mock data for Time Notes App
export const mockMemos = [
  {
    id: '1',
    title: 'Team Meeting',
    content: 'Discuss project timeline and deliverables for Q1. Need to prepare presentation slides and review budget.',
    image: null,
    alarm: {
      time: '2025-01-20T10:00:00Z',
      enabled: true
    },
    createdAt: '2025-01-15T09:30:00Z',
    updatedAt: '2025-01-15T09:30:00Z',
    type: 'text'
  },
  {
    id: '2',
    title: 'Recipe Ideas',
    content: 'Try the new pasta recipe with fresh basil and cherry tomatoes. Remember to buy parmesan cheese.',
    image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=500&h=300&fit=crop',
    alarm: {
      time: '2025-01-19T18:00:00Z',
      enabled: true
    },
    createdAt: '2025-01-14T15:20:00Z',
    updatedAt: '2025-01-14T15:20:00Z',
    type: 'image'
  },
  {
    id: '3',
    title: 'Book Notes',
    content: 'Key insights from "Atomic Habits" - small changes compound over time. Focus on systems, not goals.',
    image: null,
    alarm: {
      time: null,
      enabled: false
    },
    createdAt: '2025-01-13T20:45:00Z',
    updatedAt: '2025-01-13T20:45:00Z',
    type: 'text'
  },
  {
    id: '4',
    title: 'Workout Plan',
    content: 'Monday: Upper body, Tuesday: Cardio, Wednesday: Lower body, Thursday: Rest, Friday: Full body',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
    alarm: {
      time: '2025-01-21T07:00:00Z',
      enabled: true
    },
    createdAt: '2025-01-12T11:15:00Z',
    updatedAt: '2025-01-12T11:15:00Z',
    type: 'image'
  }
];

export const mockNotifications = [
  {
    id: 'notif-1',
    memoId: '1',
    message: 'Reminder: Team Meeting',
    time: '2025-01-20T10:00:00Z',
    read: false
  }
];

// Helper functions for mock operations
export const getMemos = () => {
  return Promise.resolve(mockMemos);
};

export const createMemo = (memo) => {
  const newMemo = {
    ...memo,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockMemos.unshift(newMemo);
  return Promise.resolve(newMemo);
};

export const updateMemo = (id, updates) => {
  const index = mockMemos.findIndex(memo => memo.id === id);
  if (index !== -1) {
    mockMemos[index] = {
      ...mockMemos[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return Promise.resolve(mockMemos[index]);
  }
  return Promise.reject(new Error('Memo not found'));
};

export const deleteMemo = (id) => {
  const index = mockMemos.findIndex(memo => memo.id === id);
  if (index !== -1) {
    mockMemos.splice(index, 1);
    return Promise.resolve(true);
  }
  return Promise.reject(new Error('Memo not found'));
};