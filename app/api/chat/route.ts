import { google } from "@ai-sdk/google";
import { streamText, tool, isStepCount } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { messages, tasks, habits, placementTopics, activeTab, aiMemories } = await req.json();

    // Context about the user's current tasks, habits, and placement prep progress
    const stateContext = `
Current time: ${new Date().toISOString()}
User's current state:
- Active View Tab: "${activeTab || "dashboard"}"
- Tasks: ${JSON.stringify(tasks || [])}
- Habits: ${JSON.stringify(habits || [])}
- Placement Copilot Topics: ${JSON.stringify(placementTopics || [])}
- AI Memories: ${JSON.stringify(aiMemories || [])}
`;

    if (!process.env.GEMINI_API_KEY) {
      const lastMessage = messages[messages.length - 1]?.content || "";
      const lastMsgText = lastMessage.toLowerCase();

      let mockChunks: string[] = [];

      // Offline Demo Mode: Simulate agentic tool calling based on keywords
      if (lastMsgText.includes("add task") || lastMsgText.includes("create task")) {
        const title = lastMessage.replace(/(add|create)\s+task\s*/i, "").trim() || "Practice mock interview";
        mockChunks = [
          `0:"I'll add a task for that right away.\\n\\n"`,
          `9:{"toolCallId":"mock-task-1","name":"createTask","args":{"title":"${title}","priority":"HIGH"}}\n`,
          `a:{"toolCallId":"mock-task-1","result":{"success":true}}\n`,
          `0:"Done! I have created the task \\"${title}\\" with high priority. Let's make sure you get it done!"\n`
        ];
      } else if (lastMsgText.includes("complete task") || lastMsgText.includes("done task") || lastMsgText.includes("finish task")) {
        // Find a task to complete
        const firstTodo = (tasks || []).find((t: any) => t.status !== "COMPLETED");
        const targetId = firstTodo ? firstTodo.id : "t1";
        const targetTitle = firstTodo ? firstTodo.title : "System Design Prep";

        mockChunks = [
          `0:"Let me complete that task for you.\\n\\n"`,
          `9:{"toolCallId":"mock-task-2","name":"updateTaskStatus","args":{"id":"${targetId}","status":"COMPLETED"}}\n`,
          `a:{"toolCallId":"mock-task-2","result":{"success":true}}\n`,
          `0:"Task \\"${targetTitle}\\" has been marked as COMPLETED. Excellent work!"\n`
        ];
      } else if (lastMsgText.includes("tab") || lastMsgText.includes("go to") || lastMsgText.includes("show me") || lastMsgText.includes("switch to")) {
        let targetTab = "tasks";
        if (lastMsgText.includes("habit")) targetTab = "habits";
        else if (lastMsgText.includes("placement") || lastMsgText.includes("copilot")) targetTab = "placement";
        else if (lastMsgText.includes("journal")) targetTab = "journal";
        else if (lastMsgText.includes("dashboard")) targetTab = "dashboard";
        else if (lastMsgText.includes("comm") || lastMsgText.includes("speak")) targetTab = "comm-coach";
        else if (lastMsgText.includes("mem")) targetTab = "memories";
        
        mockChunks = [
          `0:"Certainly! Switching you over to that view.\\n\\n"`,
          `9:{"toolCallId":"mock-tab-1","name":"changeTab","args":{"tab":"${targetTab}"}}\n`,
          `a:{"toolCallId":"mock-tab-1","result":{"success":true}}\n`,
          `0:"Navigated you to the **${targetTab}** view. Let me know if there's anything else you'd like to check out!"\n`
        ];
      } else if (lastMsgText.includes("complete habit") || lastMsgText.includes("check off") || lastMsgText.includes("log habit")) {
        const firstHabit = (habits || [])[0];
        const habitId = firstHabit ? firstHabit.id : "h1";
        const habitName = firstHabit ? firstHabit.name : "LeetCode Daily";

        mockChunks = [
          `0:"Logging completion for your habit.\\n\\n"`,
          `9:{"toolCallId":"mock-habit-1","name":"logHabitCompletion","args":{"id":"${habitId}"}}\n`,
          `a:{"toolCallId":"mock-habit-1","result":{"success":true}}\n`,
          `0:"Logged completion for habit \\"${habitName}\\" for today. Keep up the streak!"\n`
        ];
      } else if (lastMsgText.includes("remember") || lastMsgText.includes("save memory")) {
        const value = lastMessage.replace(/remember\s*(that|my|to)?/i, "").trim() || "Targeting top startups";
        mockChunks = [
          `0:"I'll note that down in my memory profile.\\n\\n"`,
          `9:{"toolCallId":"mock-mem-1","name":"saveMemory","args":{"key":"User Preference","value":"${value}"}}\n`,
          `a:{"toolCallId":"mock-mem-1","result":{"success":true}}\n`,
          `0:"I've saved a new memory: **User Preference** -> *${value}*. I will adapt my coaching to this!"\n`
        ];
      } else {
        const mockReply = `Hello! I'm your AI personal growth coach. I see you asked about "${lastMessage}". 

Since the \`GEMINI_API_KEY\` is not configured in your environment variables yet, I am running in Offline Demo Mode.

Try testing my **Agentic capabilities** by typing:
- **"add task Study Graphs"** (to see me create a task automatically)
- **"complete task"** (to see me mark the first task as completed)
- **"go to habits tab"** (to see me change screens for you!)
- **"log habit"** (to check off a habit in real-time!)
- **"remember my target is FAANG"** (to see me extract and store a profile memory token!)`;
        
        mockChunks = [
          `0:${JSON.stringify(mockReply)}\n`
        ];
      }

      // Custom mock stream implementation for the client
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          for (const chunk of mockChunks) {
            controller.enqueue(encoder.encode(chunk));
            await new Promise((resolve) => setTimeout(resolve, 60));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      messages,
      system: `You are Phoenix Coach, an elite executive coach, tech career advisor, and habit strategist. 
Your goal is to help the user unlock peak performance, master placements, speak eloquently, and construct robust habits.
Keep answers structured, motivational, and highly practical. Use markdown formatting.

You have the ability to proactively perform actions in the user's workspace using your tools (e.g. creating/updating tasks, completing habits, updating placement topic status, changing the active view tab, and saving/deleting personal memory tokens).
When the user shares key details about their focus areas, weaknesses, goals, career targets, or preferences, proactively save them as memories using the \`saveMemory\` tool. If a memory is no longer relevant or requested to be removed, call \`deleteMemory\`. Always check the existing AI Memories listed below to avoid duplicating keys; instead, overwrite or update them with new values.

If the user asks you to show a different screen or page (e.g. "show me the task list", "let's look at habits"), call the \`changeTab\` tool to navigate them to the correct screen.

Here is the user's current data:
${stateContext}
`,
      stopWhen: isStepCount(5),
      tools: {
        createTask: tool({
          description: "Create a new task in the user's task manager.",
          inputSchema: z.object({
            title: z.string().describe("The title of the task"),
            description: z.string().optional().describe("Detailed description of the task"),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().describe("Task priority (default is MEDIUM)"),
            dueDate: z.string().optional().describe("Due date in YYYY-MM-DD format"),
          }),
          execute: async ({ title, description, priority, dueDate }) => {
            return { success: true, message: `Task "${title}" created.` };
          },
        }),
        updateTaskStatus: tool({
          description: "Update the status of an existing task. Use the current tasks list in system prompt to match the correct task ID.",
          inputSchema: z.object({
            id: z.string().describe("The unique task ID"),
            status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).describe("The new status for the task"),
          }),
          execute: async ({ id, status }) => {
            return { success: true, id, status };
          },
        }),
        deleteTask: tool({
          description: "Delete an existing task by its ID.",
          inputSchema: z.object({
            id: z.string().describe("The task ID to delete"),
          }),
          execute: async ({ id }) => {
            return { success: true, id };
          },
        }),
        createHabit: tool({
          description: "Create a new habit for the user to track.",
          inputSchema: z.object({
            name: z.string().describe("Name of the habit"),
            description: z.string().optional().describe("A brief description of what this habit entails"),
            frequency: z.enum(["DAILY", "WEEKLY"]).optional().describe("Frequency of completion (default is DAILY)"),
          }),
          execute: async ({ name, description, frequency }) => {
            return { success: true, name };
          },
        }),
        logHabitCompletion: tool({
          description: "Log completion of a habit for a specific date. Use the current habits list in system prompt to find the habit ID.",
          inputSchema: z.object({
            id: z.string().describe("The habit ID"),
            dateStr: z.string().optional().describe("The completion date in YYYY-MM-DD format (defaults to today)"),
          }),
          execute: async ({ id, dateStr }) => {
            return { success: true, id, dateStr };
          },
        }),
        updatePlacementTopic: tool({
          description: "Update a placement preparation topic's readiness status, score, or notes. Use the placementTopics list in system prompt to find the topic ID.",
          inputSchema: z.object({
            id: z.string().describe("The placement topic ID"),
            status: z.enum(["NOT_STARTED", "IN_PROGRESS", "READY"]).optional().describe("Topic study status"),
            notes: z.string().optional().describe("Updated study notes or resources"),
            score: z.number().min(0).max(100).optional().describe("Self-evaluation or test score from 0 to 100"),
          }),
          execute: async ({ id, status, notes, score }) => {
            return { success: true, id, status, notes, score };
          },
        }),
        changeTab: tool({
          description: "Change the active tab/view of the application to navigate the user to a specific screen.",
          inputSchema: z.object({
            tab: z.enum(["dashboard", "tasks", "habits", "journal", "coach", "placement", "comm-coach", "memories"]).describe("The tab ID to switch to"),
          }),
          execute: async ({ tab }) => {
            return { success: true, tab };
          },
        }),
        saveMemory: tool({
          description: "Save or update a key-value memory token about the user (e.g. their preferences, weaknesses, industry target, coding style, current focus, etc.) to customize future coaching sessions.",
          inputSchema: z.object({
            key: z.string().describe("The key or concept of the memory (e.g. 'Preferred Topic', 'Target Industry', 'Weakness')"),
            value: z.string().describe("The value or details of the memory (e.g. 'FAANG startups', 'Stutters during tech explanations')"),
          }),
          execute: async ({ key, value }) => {
            return { success: true, key, value };
          },
        }),
        deleteMemory: tool({
          description: "Delete an existing memory token by its key if it is no longer relevant or correct.",
          inputSchema: z.object({
            key: z.string().describe("The exact key of the memory token to delete"),
          }),
          execute: async ({ key }) => {
            return { success: true, key };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err: unknown) {
    console.error("Error in AI Chat Route:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
