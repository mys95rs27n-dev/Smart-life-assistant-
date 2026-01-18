import { create } from 'zustand';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  energy_level: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  completed_at?: string;
  created_at: string;
}

interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  last_completed?: string;
  completion_dates: string[];
  created_at: string;
}

interface Stats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  active_habits: number;
  completion_rate: number;
  total_streak: number;
}

interface AppState {
  tasks: Task[];
  habits: Habit[];
  stats: Stats | null;
  dailyTip: { tip: string; date: string } | null;
  setTasks: (tasks: Task[]) => void;
  setHabits: (habits: Habit[]) => void;
  setStats: (stats: Stats) => void;
  setDailyTip: (tip: { tip: string; date: string }) => void;
}

export const useStore = create<AppState>((set) => ({
  tasks: [],
  habits: [],
  stats: null,
  dailyTip: null,
  setTasks: (tasks) => set({ tasks }),
  setHabits: (habits) => set({ habits }),
  setStats: (stats) => set({ stats }),
  setDailyTip: (dailyTip) => set({ dailyTip }),
}));
