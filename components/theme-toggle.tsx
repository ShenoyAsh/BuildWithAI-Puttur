"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  minimal?: boolean;
}

export function ThemeToggle({ minimal = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-9 rounded-lg bg-zinc-100/50 dark:bg-zinc-900/50 animate-pulse",
          minimal ? "w-9 mx-auto" : "w-full"
        )}
      />
    );
  }

  const currentTheme = theme || "system";

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Laptop, label: "System" },
  ];

  if (minimal) {
    // Collapsed mode: single button that cycles themes
    const nextTheme =
      currentTheme === "light"
        ? "dark"
        : currentTheme === "dark"
        ? "system"
        : "light";
    const ActiveIcon =
      currentTheme === "light"
        ? Sun
        : currentTheme === "dark"
        ? Moon
        : Laptop;

    return (
      <button
        onClick={() => setTheme(nextTheme)}
        className="w-9 h-9 mx-auto flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all shadow-sm"
        title={`Theme: ${currentTheme}. Click to cycle.`}
      >
        <ActiveIcon size={15} className="transition-transform duration-200 active:scale-90" />
      </button>
    );
  }

  return (
    <div className="w-full flex p-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-sm relative">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = currentTheme === t.value;
        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all relative z-10",
              isActive
                ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700/50"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200"
            )}
            title={`Switch to ${t.label} theme`}
          >
            <Icon size={13} className={cn("transition-transform duration-300", isActive && "scale-110")} />
            <span className="text-[10px] tracking-wide font-semibold">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
