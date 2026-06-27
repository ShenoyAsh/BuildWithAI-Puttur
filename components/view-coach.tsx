"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePhoenixStore } from "@/hooks/use-phoenix-store";
import { 
  Send, 
  Plus, 
  MessageSquare, 
  Bot, 
  User, 
  Trash2, 
  Sparkles,
  Loader2
} from "lucide-react";

export function ViewCoach() {
  const { 
    conversations, 
    activeConversationId, 
    startNewConversation, 
    addMessage, 
    deleteConversation 
  } = usePhoenixStore();

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages?.length, isGenerating]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConversationId || isGenerating) return;

    const userMessageContent = input.trim();
    setInput("");
    setIsGenerating(true);

    // 1. Add user message to Zustand store
    addMessage(activeConversationId, {
      role: "user",
      content: userMessageContent,
    });

    try {
      // Get the full message history for the AI API context, filtering out action messages
      const currentConversation = usePhoenixStore.getState().conversations.find(c => c.id === activeConversationId);
      const messagesToSend = (currentConversation?.messages || [])
        .filter(msg => !msg.content.startsWith("🔧 [Action]"));

      const state = usePhoenixStore.getState();

      // 2. Fetch from the local chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: messagesToSend,
          tasks: state.tasks,
          habits: state.habits,
          placementTopics: state.placementTopics,
          activeTab: state.activeTab,
          aiMemories: state.aiMemories
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Coach.");
      }

      // 3. Process Stream reader
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantReply = "";
      let buffer = "";
      const processedToolCalls = new Set<string>();

      if (reader) {
        // Add an initial empty assistant message to write into
        addMessage(activeConversationId, {
          role: "assistant",
          content: "",
        });

        // Read chunks
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n");
          // Save the last incomplete line back to the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

            const colonIndex = line.indexOf(":");
            if (colonIndex === -1) continue;

            const type = line.substring(0, colonIndex);
            const payloadStr = line.substring(colonIndex + 1);

            try {
              if (type === "0") {
                // Text chunk
                const text = JSON.parse(payloadStr);
                assistantReply += text;

                // Update the last message in store with cumulative chunk text
                usePhoenixStore.setState((state) => ({
                  conversations: state.conversations.map((c) => {
                    if (c.id !== activeConversationId) return c;
                    const msgCopy = [...c.messages];
                    if (msgCopy.length > 0 && msgCopy[msgCopy.length - 1].role === "assistant") {
                      msgCopy[msgCopy.length - 1] = {
                        ...msgCopy[msgCopy.length - 1],
                        content: assistantReply,
                      };
                    }
                    return { ...c, messages: msgCopy };
                  }),
                }));
              } else if (type === "9" || type === "b") {
                // Tool Call Chunk
                const toolCall = JSON.parse(payloadStr);
                const toolCallId = toolCall.toolCallId;
                const toolName = toolCall.name || toolCall.toolName;
                const args = toolCall.args;

                if (toolCallId && !processedToolCalls.has(toolCallId)) {
                  processedToolCalls.add(toolCallId);
                  
                  let actionLabel = "";
                  const store = usePhoenixStore.getState();

                  if (toolName === "createTask") {
                    store.addTask({
                      title: args.title,
                      description: args.description || "",
                      priority: args.priority || "MEDIUM",
                      dueDate: args.dueDate || undefined,
                      status: "TODO"
                    });
                    actionLabel = `Created Task: "${args.title}" (${args.priority || "MEDIUM"})`;
                  } else if (toolName === "updateTaskStatus") {
                    store.updateTask(args.id, { status: args.status });
                    const taskName = store.tasks.find(t => t.id === args.id)?.title || args.id;
                    actionLabel = `Updated Task Status: "${taskName}" to ${args.status}`;
                  } else if (toolName === "deleteTask") {
                    const taskName = store.tasks.find(t => t.id === args.id)?.title || args.id;
                    store.deleteTask(args.id);
                    actionLabel = `Deleted Task: "${taskName}"`;
                  } else if (toolName === "createHabit") {
                    store.addHabit({
                      name: args.name,
                      description: args.description || "",
                      frequency: args.frequency || "DAILY"
                    });
                    actionLabel = `Created Habit: "${args.name}"`;
                  } else if (toolName === "logHabitCompletion") {
                    const todayStr = new Date().toISOString().split("T")[0];
                    const dateStr = args.dateStr || todayStr;
                    store.toggleHabit(args.id, dateStr);
                    const habitName = store.habits.find(h => h.id === args.id)?.name || args.id;
                    actionLabel = `Logged completion for Habit: "${habitName}"`;
                  } else if (toolName === "updatePlacementTopic") {
                    const { id, ...updates } = args;
                    store.updatePlacementTopic(id, updates);
                    const topicName = store.placementTopics.find(pt => pt.id === id)?.topic || id;
                    actionLabel = `Updated Placement Prep: "${topicName}"`;
                  } else if (toolName === "changeTab") {
                    store.setActiveTab(args.tab);
                    actionLabel = `Switched view tab to "${args.tab}"`;
                  } else if (toolName === "saveMemory") {
                    store.addMemory(args.key, args.value);
                    actionLabel = `Saved Memory: "${args.key}" ➔ "${args.value}"`;
                  } else if (toolName === "deleteMemory") {
                    store.deleteMemory(args.key);
                    actionLabel = `Deleted Memory for Key: "${args.key}"`;
                  }

                  if (actionLabel) {
                    // Insert stylized system-level action notification right before the assistant response
                    usePhoenixStore.setState((state) => ({
                      conversations: state.conversations.map((c) => {
                        if (c.id !== activeConversationId) return c;
                        const msgCopy = [...c.messages];
                        // The last message is the empty/partial assistant message we created before streaming
                        const assistantMsg = msgCopy.pop();
                        const actionMsg = {
                          role: "assistant" as const,
                          content: `🔧 [Action] ${actionLabel}`,
                          timestamp: new Date().toISOString()
                        };
                        if (assistantMsg) {
                          return {
                            ...c,
                            messages: [...msgCopy, actionMsg, assistantMsg],
                            updatedAt: new Date().toISOString()
                          };
                        }
                        return {
                          ...c,
                          messages: [...msgCopy, actionMsg],
                          updatedAt: new Date().toISOString()
                        };
                      })
                    }));
                  }
                }
              }
            } catch (err) {
              console.warn("Failed to parse stream line:", line, err);
            }
          }
        }

        // Process leftover buffer
        if (buffer.trim()) {
          const colonIndex = buffer.indexOf(":");
          if (colonIndex !== -1) {
            const type = buffer.substring(0, colonIndex);
            const payloadStr = buffer.substring(colonIndex + 1);
            if (type === "0") {
              try {
                const text = JSON.parse(payloadStr);
                assistantReply += text;
                usePhoenixStore.setState((state) => ({
                  conversations: state.conversations.map((c) => {
                    if (c.id !== activeConversationId) return c;
                    const msgCopy = [...c.messages];
                    if (msgCopy.length > 0 && msgCopy[msgCopy.length - 1].role === "assistant") {
                      msgCopy[msgCopy.length - 1] = {
                        ...msgCopy[msgCopy.length - 1],
                        content: assistantReply,
                      };
                    }
                    return { ...c, messages: msgCopy };
                  }),
                }));
              } catch (e) {
                console.warn("Leftover buffer parse failed:", e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("AI Coach interaction error:", err);
      // Fallback message
      addMessage(activeConversationId, {
        role: "assistant",
        content: "Sorry, I ran into a connectivity error. Please verify your GEMINI_API_KEY or network connection.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartNewChat = () => {
    const topicPrompt = prompt("What is the topic for this briefing session?", "Placement Prep Strategy");
    if (topicPrompt && topicPrompt.trim()) {
      startNewConversation(topicPrompt.trim());
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 relative z-10">
      <div className="glow-spot top-0 left-0" />

      {/* Sidebar: Conversations list */}
      <div className="w-64 border-r border-zinc-900 pr-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Briefing Sessions</h3>
            <button 
              onClick={handleStartNewChat}
              className="p-1 rounded-md hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
            {conversations.map((conv) => (
              <div 
                key={conv.id}
                className={`group flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  activeConversationId === conv.id 
                    ? "bg-zinc-900 text-white border-l-2 border-indigo-500" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                }`}
              >
                <div 
                  onClick={() => usePhoenixStore.setState({ activeConversationId: conv.id })}
                  className="flex items-center gap-2 truncate flex-1"
                >
                  <MessageSquare size={12} className="text-zinc-500" />
                  <span className="truncate">{conv.topic}</span>
                </div>
                <button
                  onClick={() => deleteConversation(conv.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 transition-all"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-950/5 text-[10px] text-zinc-400 leading-relaxed">
          <div className="flex items-center gap-1 text-indigo-400 font-bold mb-1">
            <Sparkles size={10} />
            <span>EXECUTIVE ADVISOR</span>
          </div>
          Your conversation history is persisted securely to your local profile database.
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex-1 flex flex-col justify-between glass-panel rounded-xl border border-zinc-900 overflow-hidden bg-zinc-950/40">
        
        {/* Top title bar */}
        <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Bot size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {activeConversation ? activeConversation.topic : "Select or Start a Session"}
              </h2>
              <p className="text-[10px] text-zinc-500">Phoenix OS Coaching Agent</p>
            </div>
          </div>
          <button 
            onClick={handleStartNewChat}
            className="md:hidden p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Message history */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {!activeConversation ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Bot size={40} className="text-zinc-700 mb-3" />
              <p className="text-sm text-zinc-400">Select an existing briefing session or create a new one to begin coaching.</p>
              <button 
                onClick={handleStartNewChat} 
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors"
              >
                Start New Session
              </button>
            </div>
          ) : activeConversation.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Sparkles size={32} className="text-indigo-400 mb-3" />
              <p className="text-sm text-zinc-300 font-medium">Session initialized: {activeConversation.topic}</p>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">Send a message below. Describe your roadblocks, seek pitch critique, or request system design review.</p>
            </div>
          ) : (
            activeConversation.messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const isAction = msg.content.startsWith("🔧 [Action]");

              if (isAction) {
                const actionText = msg.content.replace("🔧 [Action]", "").trim();
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-2 justify-center mx-auto my-3 px-4 py-2 rounded-lg bg-zinc-900/60 border border-indigo-500/15 text-xs text-zinc-400 max-w-lg w-full shadow-md animate-fade-in"
                  >
                    <Sparkles size={12} className="text-indigo-400 shrink-0 animate-pulse" />
                    <span className="font-semibold text-zinc-300">Agent Action:</span>
                    <span className="text-indigo-300 font-medium">{actionText}</span>
                  </div>
                );
              }

              return (
                <div 
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                    isUser 
                      ? "bg-zinc-900 border-zinc-800 text-white" 
                      : "bg-indigo-600/10 border-indigo-500/20 text-indigo-400"
                  }`}>
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser 
                      ? "bg-indigo-600 text-white" 
                      : "bg-zinc-900/50 border border-zinc-900 text-zinc-200"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          {isGenerating && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                <Loader2 size={14} className="animate-spin" />
              </div>
              <span className="text-xs text-zinc-500 italic">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-zinc-900">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              required
              disabled={!activeConversationId || isGenerating}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeConversation ? "Ask the AI Coach..." : "Start a session first..."}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!activeConversationId || isGenerating || !input.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
