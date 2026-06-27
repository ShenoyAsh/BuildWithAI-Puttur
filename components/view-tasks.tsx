"use client";

import React, { useState } from "react";
import { usePhoenixStore, Task } from "@/hooks/use-phoenix-store";
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Plus, 
  Calendar, 
  Sparkles,
} from "lucide-react";

export function ViewTasks() {
  const { tasks, addTask, updateTask, deleteTask } = usePhoenixStore();
  const [filter, setFilter] = useState<"ALL" | "TODO" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [aiTip, setAiTip] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => {
    if (filter === "ALL") return true;
    return task.status === filter;
  });

  // Sort tasks: HIGH priority first, then MEDIUM, then LOW
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      description: description.trim() || undefined,
      priority,
      status: "TODO",
      dueDate: dueDate || undefined,
    });

    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setShowAddForm(false);
  };

  const toggleTaskStatus = (task: Task) => {
    const nextStatus = task.status === "COMPLETED" ? "TODO" : "COMPLETED";
    updateTask(task.id, { status: nextStatus });
  };

  const cycleStatus = (task: Task) => {
    let nextStatus: "TODO" | "IN_PROGRESS" | "COMPLETED" = "TODO";
    if (task.status === "TODO") nextStatus = "IN_PROGRESS";
    else if (task.status === "IN_PROGRESS") nextStatus = "COMPLETED";
    updateTask(task.id, { status: nextStatus });
  };

  const getAiPrioritization = () => {
    const highTasks = tasks.filter(t => t.priority === "HIGH" && t.status !== "COMPLETED");
    if (highTasks.length > 0) {
      setAiTip(`Focus on "${highTasks[0].title}" first. It's marked as HIGH priority and has an approaching deadline. Consider blocking 45 minutes of deep work now.`);
    } else {
      const pending = tasks.filter(t => t.status !== "COMPLETED");
      if (pending.length > 0) {
        setAiTip(`You have no high-priority tasks pending. Take this opportunity to clear "${pending[0].title}" to build momentum.`);
      } else {
        setAiTip("All tasks completed! Today is a great day to reflect, update your habit streaks, or define new goals.");
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="glow-spot top-0 left-0" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Smart Task Manager
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Organize, prioritize, and check off your developmental milestones.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={getAiPrioritization}
            className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-400 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:bg-indigo-600/30"
          >
            <Sparkles size={16} />
            <span>AI Prioritize</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 active:scale-[0.98] rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* AI Advisor Card */}
      {aiTip && (
        <div className="glass-panel p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/10 flex gap-3 relative z-10">
          <div className="text-indigo-400 mt-0.5">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-300">AI Task Advisor</p>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{aiTip}</p>
          </div>
          <button onClick={() => setAiTip(null)} className="text-zinc-500 hover:text-zinc-300 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="glass-panel p-6 rounded-xl space-y-4 relative z-10 border border-zinc-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Complete sliding window challenges"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task["priority"])}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a quick outline of what needs to be done..."
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      )}

      {/* Tabs Filter */}
      <div className="flex border-b border-zinc-900 gap-6 relative z-10">
        {(["ALL", "TODO", "IN_PROGRESS", "COMPLETED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              filter === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab === "ALL" ? "All Tasks" : tab === "TODO" ? "To Do" : tab === "IN_PROGRESS" ? "In Progress" : "Completed"}
            {filter === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3 relative z-10">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-xl">
            <CheckSquare size={32} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-zinc-400 text-sm">No tasks found in this category.</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className="glass-panel p-4 rounded-xl flex items-center justify-between gap-4 border border-zinc-900/80 hover:border-zinc-800/80 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => toggleTaskStatus(task)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
                >
                  {task.status === "COMPLETED" ? (
                    <CheckSquare size={20} className="text-indigo-400" />
                  ) : (
                    <Square size={20} />
                  )}
                </button>

                <div className="min-w-0">
                  <p className={`text-sm font-semibold text-zinc-100 ${task.status === "COMPLETED" ? "line-through text-zinc-500" : ""}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className={`text-xs text-zinc-400 mt-0.5 line-clamp-1 ${task.status === "COMPLETED" ? "line-through text-zinc-600" : ""}`}>
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span
                      onClick={() => cycleStatus(task)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer select-none transition-colors ${
                        task.status === "COMPLETED"
                          ? "bg-zinc-800 text-zinc-400"
                          : task.status === "IN_PROGRESS"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      }`}
                    >
                      {task.status}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.priority === "HIGH" 
                        ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                        : task.priority === "MEDIUM" 
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                        : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {task.priority} Priority
                    </span>
                    {task.dueDate && (
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="text-zinc-600 hover:text-red-400 p-2 rounded-lg hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
