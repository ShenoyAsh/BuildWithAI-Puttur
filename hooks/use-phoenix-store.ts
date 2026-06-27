import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: "DAILY" | "WEEKLY";
  streak: number;
  history: string[]; // completion dates
  lastCompleted?: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  aiAnalysis?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  completed: boolean;
}

export interface PlacementTopic {
  id: string;
  topic: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "READY";
  notes?: string;
  score?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  githubUrl?: string;
  liveUrl?: string;
  status: "IDEATION" | "DEVELOPMENT" | "COMPLETED";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  topic: string;
  messages: Message[];
  updatedAt: string;
}

interface PhoenixStore {
  tasks: Task[];
  habits: Habit[];
  journalEntries: JournalEntry[];
  goals: Goal[];
  placementTopics: PlacementTopic[];
  projects: Project[];
  achievements: Achievement[];
  conversations: AIConversation[];
  activeConversationId: string | null;
  sidebarOpen: boolean;
  activeTab: string;
  aiMemories: { key: string; value: string }[];
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Habit Actions
  addHabit: (habit: Omit<Habit, "id" | "streak" | "history">) => void;
  toggleHabit: (id: string, dateStr: string) => void;
  deleteHabit: (id: string) => void;
  
  // Journal Actions
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => void;
  
  // Goal Actions
  addGoal: (goal: Omit<Goal, "id" | "completed">) => void;
  toggleGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  
  // Placement Actions
  updatePlacementTopic: (id: string, updates: Partial<PlacementTopic>) => void;
  
  // Project Actions
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  
  // AI Chat Actions
  startNewConversation: (topic: string) => string;
  addMessage: (conversationId: string, message: Omit<Message, "timestamp">) => void;
  deleteConversation: (id: string) => void;
  
  // Memory Actions
  addMemory: (key: string, value: string) => void;
  deleteMemory: (key: string) => void;
}

// Outstanding seed data
const initialTasks: Task[] = [
  { id: "t1", title: "Complete System Design for Placement prep", description: "Read Alex Xu Chapter 4 & 5", status: "IN_PROGRESS", priority: "HIGH", dueDate: "2026-06-30", createdAt: "2026-06-25" },
  { id: "t2", title: "Refactor portfolio page with glassmorphism", description: "Apply Tailwind CSS v4 styling rules", status: "TODO", priority: "MEDIUM", dueDate: "2026-07-02", createdAt: "2026-06-26" },
  { id: "t3", title: "Review mock interview feedback", description: "Work on stuttering during tech explanations", status: "COMPLETED", priority: "HIGH", dueDate: "2026-06-26", createdAt: "2026-06-24" },
];

const initialHabits: Habit[] = [
  { id: "h1", name: "LeetCode Daily Challenge", description: "Solve 1 Medium or Hard question", frequency: "DAILY", streak: 5, history: ["2026-06-22", "2026-06-23", "2026-06-24", "2026-06-25", "2026-06-26"], lastCompleted: "2026-06-26" },
  { id: "h2", name: "Write 250w Journal", description: "Night reflection and daily review", frequency: "DAILY", streak: 12, history: ["2026-06-25", "2026-06-26"], lastCompleted: "2026-06-26" },
  { id: "h3", name: "Mock Pitch Speaking", description: "Practice verbal clarity for 10 mins", frequency: "DAILY", streak: 2, history: ["2026-06-26"], lastCompleted: "2026-06-26" },
];

const initialJournalEntries: JournalEntry[] = [
  {
    id: "j1",
    content: "Today I felt slightly overwhelmed with placement prep, but doing a Mock Interview session helped boost my confidence. I need to focus on graphs and dynamic programming next.",
    mood: "Reflective",
    aiAnalysis: "You are experiencing natural pre-placement stress. However, your mock interview performance highlights strong communication skills. Growth suggestion: Break graph problems into small patterns (DFS, BFS, Dijkstra).",
    createdAt: "2026-06-26T21:30:00.000Z",
  },
  {
    id: "j2",
    content: "Built the foundation of Project Phoenix. The styling looks fantastic, minimal dark glassmorphism. It feels rewarding to see designs come to life.",
    mood: "Energized",
    aiAnalysis: "Productive momentum detected! Creative projects boost endorphins and relieve technical burnout. Keep this cadence.",
    createdAt: "2026-06-27T15:00:00.000Z",
  }
];

const initialGoals: Goal[] = [
  { id: "g1", title: "Secure a Software Engineering Internship", description: "Target FAANG or tier 1 startups by end of August", targetDate: "2026-08-31", completed: false },
  { id: "g2", title: "Build 3 Premium Portfolio Projects", description: "Phoenix OS, DevShowcase, and CivicAgent", targetDate: "2026-07-15", completed: false },
];

const initialPlacementTopics: PlacementTopic[] = [
  { id: "p1", topic: "Arrays & Hashing", status: "READY", notes: "Comfortable with sliding window and two pointers", score: 85 },
  { id: "p2", topic: "Trees & Graphs", status: "IN_PROGRESS", notes: "Working on DFS/BFS traversal and tree height logic", score: 65 },
  { id: "p3", topic: "Dynamic Programming", status: "NOT_STARTED", notes: "Need to start with knapsack and LCS models", score: 0 },
  { id: "p4", topic: "System Design basics", status: "IN_PROGRESS", notes: "Studying load balancers, caching, and database scaling", score: 70 },
  { id: "p5", topic: "Resume Optimization", status: "READY", notes: "ATS-friendly template configured, projects highlighted", score: 95 },
];

const initialProjects: Project[] = [
  { id: "pr1", name: "Project Phoenix OS", description: "AI-Powered Personal growth operating system", status: "DEVELOPMENT" },
  { id: "pr2", name: "FixIt Civic Agent", description: "AI reporting system for local civic actions", status: "COMPLETED" },
];

const initialAchievements: Achievement[] = [
  { id: "a1", title: "Phoenix Rising", description: "Initialized your personal growth operating system", icon: "✨", unlockedAt: "2026-06-27" },
  { id: "a2", title: "Consistency King", description: "Maintained a 5-day habit streak on Leetcode", icon: "🔥", unlockedAt: "2026-06-26" },
];

const initialConversations: AIConversation[] = [
  {
    id: "c1",
    topic: "Career Pitch Guidance",
    messages: [
      { role: "user", content: "How do I summarize my project experience in 30 seconds?", timestamp: "2026-06-26T18:00:00.000Z" },
      { role: "assistant", content: "Use the Hook-Action-Result format: \n1. **Hook**: 'I built Phoenix, an AI-powered Personal Growth OS.' \n2. **Action**: 'I integrated Next.js, Tailwind v4, Zustand, and Google Gemini.' \n3. **Result**: 'It optimized task tracking by 40% and handles real-time habit analytics.' Keep it punchy!", timestamp: "2026-06-26T18:00:30.000Z" }
    ],
    updatedAt: "2026-06-26T18:00:30.000Z"
  }
];

export const usePhoenixStore = create<PhoenixStore>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      habits: initialHabits,
      journalEntries: initialJournalEntries,
      goals: initialGoals,
      placementTopics: initialPlacementTopics,
      projects: initialProjects,
      achievements: initialAchievements,
      conversations: initialConversations,
      activeConversationId: "c1",
      sidebarOpen: true,
      activeTab: "dashboard",
      aiMemories: [
        { key: "Preferred Topic", value: "System Design and Algorithms" },
        { key: "Current Focus", value: "Verbal pacing and graphs" }
      ],

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setActiveTab: (activeTab) => set({ activeTab }),

      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...task, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString().split("T")[0] },
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            { ...habit, id: Math.random().toString(36).substr(2, 9), streak: 0, history: [] },
          ],
        })),

      toggleHabit: (id, dateStr) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;
            
            const isCompleted = h.history.includes(dateStr);
            let newHistory = [...h.history];
            let newStreak = h.streak;

            if (isCompleted) {
              newHistory = newHistory.filter((d) => d !== dateStr);
              newStreak = Math.max(0, newStreak - 1);
            } else {
              newHistory.push(dateStr);
              newStreak += 1;
            }

            return {
              ...h,
              history: newHistory,
              streak: newStreak,
              lastCompleted: isCompleted ? undefined : dateStr,
            };
          }),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      addJournalEntry: (entry) =>
        set((state) => ({
          journalEntries: [
            { ...entry, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() },
            ...state.journalEntries,
          ],
        })),

      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            { ...goal, id: Math.random().toString(36).substr(2, 9), completed: false },
          ],
        })),

      toggleGoal: (id) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      updatePlacementTopic: (id, updates) =>
        set((state) => ({
          placementTopics: state.placementTopics.map((pt) => (pt.id === id ? { ...pt, ...updates } : pt)),
        })),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, { ...project, id: Math.random().toString(36).substr(2, 9) }],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      startNewConversation: (topic) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          conversations: [
            ...state.conversations,
            { id, topic, messages: [], updatedAt: new Date().toISOString() },
          ],
          activeConversationId: id,
        }));
        return id;
      },

      addMessage: (conversationId, message) =>
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            return {
              ...c,
              messages: [...c.messages, { ...message, timestamp: new Date().toISOString() }],
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversationId:
            state.activeConversationId === id
              ? state.conversations.find((c) => c.id !== id)?.id || null
              : state.activeConversationId,
        })),

      addMemory: (key, value) =>
        set((state) => ({
          aiMemories: [...state.aiMemories.filter((m) => m.key !== key), { key, value }],
        })),

      deleteMemory: (key) =>
        set((state) => ({
          aiMemories: state.aiMemories.filter((m) => m.key !== key),
        })),
    }),
    {
      name: "phoenix-os-storage",
      partialize: (state) => ({
        tasks: state.tasks,
        habits: state.habits,
        journalEntries: state.journalEntries,
        goals: state.goals,
        placementTopics: state.placementTopics,
        projects: state.projects,
        achievements: state.achievements,
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        aiMemories: state.aiMemories,
      }),
    }
  )
);
