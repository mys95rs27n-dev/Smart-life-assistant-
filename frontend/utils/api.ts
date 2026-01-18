const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export const api = {
  // Tasks
  getTasks: async (status?: string) => {
    const url = status ? `${API_URL}/api/tasks?status=${status}` : `${API_URL}/api/tasks`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  createTask: async (task: any) => {
    const response = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  updateTask: async (taskId: string, updates: any) => {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  deleteTask: async (taskId: string) => {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete task');
    return response.json();
  },

  // Habits
  getHabits: async () => {
    const response = await fetch(`${API_URL}/api/habits`);
    if (!response.ok) throw new Error('Failed to fetch habits');
    return response.json();
  },

  createHabit: async (habit: any) => {
    const response = await fetch(`${API_URL}/api/habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habit),
    });
    if (!response.ok) throw new Error('Failed to create habit');
    return response.json();
  },

  updateHabit: async (habitId: string, updates: any) => {
    const response = await fetch(`${API_URL}/api/habits/${habitId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update habit');
    return response.json();
  },

  deleteHabit: async (habitId: string) => {
    const response = await fetch(`${API_URL}/api/habits/${habitId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete habit');
    return response.json();
  },

  completeHabit: async (habitId: string) => {
    const response = await fetch(`${API_URL}/api/habits/${habitId}/complete`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to complete habit');
    return response.json();
  },

  // Stats
  getStats: async () => {
    const response = await fetch(`${API_URL}/api/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Daily Tips
  getDailyTip: async () => {
    const response = await fetch(`${API_URL}/api/tips/daily`);
    if (!response.ok) throw new Error('Failed to fetch daily tip');
    return response.json();
  },
};
