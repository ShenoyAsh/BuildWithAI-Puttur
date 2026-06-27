"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Cpu, 
  Trophy, 
  Info,
  Sparkles,
  Gamepad2
} from "lucide-react";

// Types
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };
type GameState = "MENU" | "PLAYING" | "PAUSED" | "GAME_OVER" | "LEADERBOARD";
type ColorScheme = "GREEN" | "AMBER" | "GRAY" | "CYBER";

interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

// Retro Sound Synthesizer using Web Audio API
class RetroAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgMusicInterval: any = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (mute) {
      this.stopMusic();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    }
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    // Standard arcade coin sound: 2 quick tones (987.77 Hz - B5, then 1318.51 Hz - E6)
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playChomp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playCrash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Noise buffer for explosion
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(20, now + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.4);

    // Add a low bass drop frequency alongside the noise
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.3);
    
    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playLevelUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    // Quick ascending scale (Arpeggio)
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    });

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.setValueAtTime(0.15, now + 0.24);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  playSelect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now); // A4

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  startMusic() {
    if (this.isMuted || this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx) return;
    this.isMusicPlaying = true;

    let index = 0;
    // Simple 8-bit bassline loop: C2, G2, C3, G2, A2, E3, A3, E3...
    const melody = [
      130.81, 196.00, 261.63, 196.00, // C3, G3, C4, G3
      146.83, 220.00, 293.66, 220.00, // D3, A3, D4, A3
      164.81, 246.94, 329.63, 246.94, // E3, B3, E4, B3
      130.81, 196.00, 261.63, 196.00  // C3, G3, C4, G3
    ];
    
    const playNote = () => {
      if (!this.ctx || this.isMuted || !this.isMusicPlaying) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(melody[index % melody.length], now);
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.25);
      
      index++;
    };

    // Play first note immediately
    playNote();
    this.bgMusicInterval = setInterval(playNote, 250);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
  }
}

// Color scheme palettes
const PALETTES = {
  GREEN: {
    bg: "#0d1a0d",
    grid: "#142c14",
    snakeHead: "#39ff14",
    snakeBody: "#26cc0c",
    food: "#ff3333",
    goldenFood: "#e5c158",
    glow: "rgba(57, 255, 20, 0.4)",
    text: "#39ff14",
    textDim: "#1f990a",
    border: "#1d441d"
  },
  AMBER: {
    bg: "#1a1200",
    grid: "#2e1e00",
    snakeHead: "#ffb000",
    snakeBody: "#d48c00",
    food: "#ff5500",
    goldenFood: "#ffea78",
    glow: "rgba(255, 176, 0, 0.4)",
    text: "#ffb000",
    textDim: "#9e6d00",
    border: "#442c00"
  },
  GRAY: {
    bg: "#121212",
    grid: "#1c1c1c",
    snakeHead: "#e0e0e0",
    snakeBody: "#9e9e9e",
    food: "#757575",
    goldenFood: "#ffffff",
    glow: "rgba(224, 224, 224, 0.2)",
    text: "#e0e0e0",
    textDim: "#757575",
    border: "#2d2d2d"
  },
  CYBER: {
    bg: "#10001a",
    grid: "#200033",
    snakeHead: "#ff007f",
    snakeBody: "#b30059",
    food: "#00ffff",
    goldenFood: "#ffff00",
    glow: "rgba(255, 0, 127, 0.4)",
    text: "#ff007f",
    textDim: "#99004c",
    border: "#4d0066"
  }
};

const GRID_SIZE = 20;

export default function SnakeGame() {
  // Sound system instance ref
  const audioRef = useRef<RetroAudio | null>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>("MENU");
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [colorScheme, setColorScheme] = useState<ColorScheme>("GREEN");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playMusic, setPlayMusic] = useState<boolean>(false);
  const [speedSetting, setSpeedSetting] = useState<"SLOW" | "MEDIUM" | "FAST" | "HYPER">("MEDIUM");
  const [wallCollision, setWallCollision] = useState<boolean>(true); // border hits = game over
  const [crtEffects, setCrtEffects] = useState<boolean>(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState<string>("SNA");
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Snake coordinates & movement
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }
  ]);
  const [direction, setDirection] = useState<Direction>("UP");
  const directionRef = useRef<Direction>("UP");
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [goldenFood, setGoldenFood] = useState<Position | null>(null);
  const [goldenFoodTimer, setGoldenFoodTimer] = useState<number>(0);

  // Particles for chomp effect
  const [particles, setParticles] = useState<{x: number, y: number, vx: number, vy: number, life: number, color: string}[]>([]);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameIntervalRef = useRef<any>(null);

  // Initialize Audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new RetroAudio();
      
      // Load settings
      const savedHighScore = localStorage.getItem("snake_high_score");
      if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));

      const savedColorScheme = localStorage.getItem("snake_color_scheme") as ColorScheme;
      if (savedColorScheme && PALETTES[savedColorScheme]) setColorScheme(savedColorScheme);

      const savedMute = localStorage.getItem("snake_muted") === "true";
      setIsMuted(savedMute);
      if (audioRef.current) audioRef.current.setMute(savedMute);

      const savedLeaderboard = localStorage.getItem("snake_leaderboard");
      if (savedLeaderboard) {
        setLeaderboard(JSON.parse(savedLeaderboard));
      } else {
        const dummyLeaderboard: LeaderboardEntry[] = [
          { name: "ACE", score: 250, date: "2026-06-25" },
          { name: "RET", score: 180, date: "2026-06-26" },
          { name: "SNA", score: 120, date: "2026-06-27" },
          { name: "OS1", score: 80, date: "2026-06-27" },
          { name: "SLY", score: 40, date: "2026-06-27" }
        ];
        localStorage.setItem("snake_leaderboard", JSON.stringify(dummyLeaderboard));
        setLeaderboard(dummyLeaderboard);
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.stopMusic();
      }
    };
  }, []);

  // Update mute setting
  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = audioRef.current.toggleMute();
      setIsMuted(newMuted);
      localStorage.setItem("snake_muted", String(newMuted));
      audioRef.current.playSelect();
    }
  };

  // Toggle Background Music
  const toggleMusic = () => {
    if (audioRef.current) {
      if (playMusic) {
        audioRef.current.stopMusic();
        setPlayMusic(false);
      } else {
        setPlayMusic(true);
        audioRef.current.startMusic();
      }
      audioRef.current.playSelect();
    }
  };

  // Save color scheme preference
  const changeColorScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    localStorage.setItem("snake_color_scheme", scheme);
    if (audioRef.current) audioRef.current.playSelect();
  };

  // Get current game speed in ms
  const getSpeedMs = useCallback(() => {
    let baseSpeed = 150;
    switch (speedSetting) {
      case "SLOW": baseSpeed = 220; break;
      case "MEDIUM": baseSpeed = 140; break;
      case "FAST": baseSpeed = 85; break;
      case "HYPER": baseSpeed = 45; break;
    }
    // Speed increases slightly as level increases
    const speedReduction = Math.min(50, (level - 1) * 8);
    return Math.max(30, baseSpeed - speedReduction);
  }, [speedSetting, level]);

  // Generate random food coordinates
  const generateRandomFood = useCallback((currentSnake: Position[]): Position => {
    let attempts = 0;
    while (attempts < 100) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      // Ensure it doesn't spawn on snake body
      const onSnake = currentSnake.some(cell => cell.x === x && cell.y === y);
      if (!onSnake) {
        return { x, y };
      }
      attempts++;
    }
    return { x: 5, y: 5 }; // fallback
  }, []);

  // Spawn Golden Food (rarely)
  const trySpawnGoldenFood = useCallback((currentSnake: Position[]) => {
    if (Math.random() < 0.15 && !goldenFood) {
      const pos = generateRandomFood(currentSnake);
      setGoldenFood(pos);
      setGoldenFoodTimer(80); // ticks remaining
    }
  }, [goldenFood, generateRandomFood]);

  // Game over checks and scoring updates
  const handleGameOver = useCallback(() => {
    if (audioRef.current) audioRef.current.playCrash();
    setGameState("GAME_OVER");
    
    // Check for high score
    const isNewHigh = score > highScore;
    if (isNewHigh) {
      setHighScore(score);
      localStorage.setItem("snake_high_score", String(score));
      setIsNewHighScore(true);
    } else {
      // Check if qualifies for leaderboard
      const isLeaderboardRanked = leaderboard.length < 5 || score > leaderboard[leaderboard.length - 1].score;
      setIsNewHighScore(isLeaderboardRanked);
    }
    
    if (audioRef.current) {
      audioRef.current.stopMusic();
    }
  }, [score, highScore, leaderboard]);

  // Save leaderboard score
  const saveLeaderboardScore = () => {
    const newEntry: LeaderboardEntry = {
      name: playerName.trim().substring(0, 3).toUpperCase() || "SNA",
      score: score,
      date: new Date().toISOString().split("T")[0]
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    setLeaderboard(updatedLeaderboard);
    localStorage.setItem("snake_leaderboard", JSON.stringify(updatedLeaderboard));
    setIsNewHighScore(false);
    setGameState("LEADERBOARD");
    if (audioRef.current) audioRef.current.playCoin();
  };

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentDir = directionRef.current;
      
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (currentDir !== "DOWN") {
            setDirection("UP");
            directionRef.current = "UP";
          }
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (currentDir !== "UP") {
            setDirection("DOWN");
            directionRef.current = "DOWN";
          }
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (currentDir !== "RIGHT") {
            setDirection("LEFT");
            directionRef.current = "LEFT";
          }
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (currentDir !== "LEFT") {
            setDirection("RIGHT");
            directionRef.current = "RIGHT";
          }
          break;
        case " ":
          // Pause / Unpause / Start
          if (gameState === "PLAYING") {
            setGameState("PAUSED");
            if (audioRef.current) audioRef.current.playSelect();
          } else if (gameState === "PAUSED") {
            setGameState("PLAYING");
            if (audioRef.current) {
              audioRef.current.playSelect();
              if (playMusic) audioRef.current.startMusic();
            }
          } else if (gameState === "MENU") {
            startGame();
          } else if (gameState === "GAME_OVER" && !isNewHighScore) {
            startGame();
          }
          break;
        case "Escape":
          if (gameState === "PLAYING") setGameState("PAUSED");
          break;
        case "m":
        case "M":
          toggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, isNewHighScore, playMusic]);

  // Start a new game
  const startGame = () => {
    if (audioRef.current) {
      audioRef.current.playCoin();
      if (playMusic) audioRef.current.startMusic();
    }
    
    // Initial snake position
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ];
    setSnake(initialSnake);
    setDirection("UP");
    directionRef.current = "UP";
    setScore(0);
    setLevel(1);
    setIsNewHighScore(false);
    setGoldenFood(null);
    setParticles([]);
    
    // Spawn initial food
    const initialFood = generateRandomFood(initialSnake);
    setFood(initialFood);
    
    setGameState("PLAYING");
  };

  // Main game loop logic tick
  const gameTick = useCallback(() => {
    if (gameState !== "PLAYING") return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const dir = directionRef.current;
      let newHead = { ...head };

      switch (dir) {
        case "UP": newHead.y -= 1; break;
        case "DOWN": newHead.y += 1; break;
        case "LEFT": newHead.x -= 1; break;
        case "RIGHT": newHead.x += 1; break;
      }

      // Border collision check
      if (wallCollision) {
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          handleGameOver();
          return prevSnake;
        }
      } else {
        // Wrap around borders
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        else if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        else if (newHead.y >= GRID_SIZE) newHead.y = 0;
      }

      // Self collision check (skip tail if it moves)
      const selfCollision = prevSnake.slice(0, -1).some(cell => cell.x === newHead.x && cell.y === newHead.y);
      if (selfCollision) {
        handleGameOver();
        return prevSnake;
      }

      // Check if food eaten
      const ateNormalFood = newHead.x === food.x && newHead.y === food.y;
      const ateGoldenFood = goldenFood && newHead.x === goldenFood.x && newHead.y === goldenFood.y;

      let newSnake = [newHead, ...prevSnake];

      if (ateNormalFood) {
        // Play chomp sound
        if (audioRef.current) audioRef.current.playChomp();
        
        // Spawn chomp particles
        spawnParticles(food.x, food.y, PALETTES[colorScheme].food);

        // Increase score
        const points = 10 * level;
        setScore(prev => {
          const nextScore = prev + points;
          // Check level up (every 50 points)
          const oldLevel = Math.floor(prev / 50) + 1;
          const newLevel = Math.floor(nextScore / 50) + 1;
          if (newLevel > oldLevel) {
            setLevel(newLevel);
            if (audioRef.current) audioRef.current.playLevelUp();
          }
          return nextScore;
        });

        // Spawn new food
        const nextFood = generateRandomFood(newSnake);
        setFood(nextFood);

        // Try spawning golden food
        trySpawnGoldenFood(newSnake);
      } else if (ateGoldenFood) {
        // Play chime sound
        if (audioRef.current) audioRef.current.playLevelUp();

        // Spawn golden particles
        spawnParticles(goldenFood!.x, goldenFood!.y, PALETTES[colorScheme].goldenFood);

        // Increase score big time
        const points = 30 * level;
        setScore(prev => {
          const nextScore = prev + points;
          const oldLevel = Math.floor(prev / 50) + 1;
          const newLevel = Math.floor(nextScore / 50) + 1;
          if (newLevel > oldLevel) {
            setLevel(newLevel);
            if (audioRef.current) audioRef.current.playLevelUp();
          }
          return nextScore;
        });

        setGoldenFood(null);
      } else {
        // Remove tail if didn't eat food
        newSnake.pop();
      }

      return newSnake;
    });

    // Handle golden food timer ticking down
    if (goldenFood) {
      setGoldenFoodTimer(prev => {
        if (prev <= 1) {
          setGoldenFood(null);
          return 0;
        }
        return prev - 1;
      });
    }

    // Move particles
    setParticles(prev => 
      prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 1
        }))
        .filter(p => p.life > 0)
    );

  }, [gameState, food, goldenFood, level, wallCollision, colorScheme, generateRandomFood, trySpawnGoldenFood, handleGameOver]);

  // Particle helper
  const spawnParticles = (gridX: number, gridY: number, color: string) => {
    const pCount = 12;
    const newParticles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * 0.35;
      newParticles.push({
        x: gridX + 0.5,
        y: gridY + 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 15 + Math.floor(Math.random() * 15),
        color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Setup game clock interval
  useEffect(() => {
    if (gameState === "PLAYING") {
      gameIntervalRef.current = setInterval(gameTick, getSpeedMs());
    } else {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    }
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, [gameState, gameTick, getSpeedMs]);

  // Draw Game onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset transform and clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const palette = PALETTES[colorScheme];
    const cellSize = canvas.width / GRID_SIZE;

    // Background
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Lines (Retro CRT aesthetic)
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < GRID_SIZE; i++) {
      // vertical
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();

      // horizontal
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    if (gameState === "PLAYING" || gameState === "PAUSED" || gameState === "GAME_OVER") {
      // Draw Normal Food (Pixelated fruit style)
      ctx.shadowBlur = 10;
      ctx.shadowColor = palette.food;
      ctx.fillStyle = palette.food;
      ctx.fillRect(food.x * cellSize + 2, food.y * cellSize + 2, cellSize - 4, cellSize - 4);
      
      // Retro bite marks on food
      ctx.fillStyle = palette.bg;
      ctx.fillRect(food.x * cellSize + 2, food.y * cellSize + 2, 2, 2);

      // Draw Golden Food
      if (goldenFood) {
        // Flashing effect
        if (Math.floor(Date.now() / 150) % 2 === 0) {
          ctx.shadowColor = palette.goldenFood;
          ctx.fillStyle = palette.goldenFood;
          ctx.fillRect(goldenFood.x * cellSize + 2, goldenFood.y * cellSize + 2, cellSize - 4, cellSize - 4);
          
          // Draw sparkle cross
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(goldenFood.x * cellSize + cellSize/2 - 1, goldenFood.y * cellSize, 2, cellSize);
          ctx.fillRect(goldenFood.x * cellSize, goldenFood.y * cellSize + cellSize/2 - 1, cellSize, 2);
        }
      }

      // Draw Snake Body
      ctx.shadowColor = palette.snakeHead;
      ctx.shadowBlur = 8;
      
      snake.forEach((cell, idx) => {
        const isHead = idx === 0;
        
        ctx.fillStyle = isHead ? palette.snakeHead : palette.snakeBody;
        
        // Draw slightly smaller body cells, rounded or square
        const padding = isHead ? 1 : 2;
        ctx.fillRect(
          cell.x * cellSize + padding,
          cell.y * cellSize + padding,
          cellSize - padding * 2,
          cellSize - padding * 2
        );

        // Draw Retro Eyes on head
        if (isHead) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = palette.bg;
          
          // Eye placement based on direction
          const eyeSize = 2.5;
          const offset = 4;
          const currentDir = directionRef.current;
          
          if (currentDir === "UP" || currentDir === "DOWN") {
            ctx.fillRect(cell.x * cellSize + offset, cell.y * cellSize + cellSize/2 - 1, eyeSize, eyeSize);
            ctx.fillRect(cell.x * cellSize + cellSize - offset - eyeSize, cell.y * cellSize + cellSize/2 - 1, eyeSize, eyeSize);
          } else {
            ctx.fillRect(cell.x * cellSize + cellSize/2 - 1, cell.y * cellSize + offset, eyeSize, eyeSize);
            ctx.fillRect(cell.x * cellSize + cellSize/2 - 1, cell.y * cellSize + cellSize - offset - eyeSize, eyeSize, eyeSize);
          }
          ctx.shadowBlur = 8;
        }
      });

      // Draw Particles
      ctx.shadowBlur = 0;
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        const size = Math.max(1, (p.life / 30) * 4);
        ctx.fillRect(p.x * cellSize - size/2, p.y * cellSize - size/2, size, size);
      });
    }

    // Display Overlay UI Screens inside Canvas if needed
    if (gameState === "MENU") {
      drawRetroOverlay(ctx, canvas, palette, "VINTAGE SNAKE", "PRESS START TO RUN");
    } else if (gameState === "PAUSED") {
      drawRetroOverlay(ctx, canvas, palette, "GAME PAUSED", "PRESS START TO RESUME");
    } else if (gameState === "GAME_OVER") {
      if (isNewHighScore) {
        drawRetroOverlay(ctx, canvas, palette, "NEW HIGH SCORE!", `SCOR: ${score}`, true);
      } else {
        drawRetroOverlay(ctx, canvas, palette, "GAME OVER", "INSERT COIN TO TRY AGAIN");
      }
    } else if (gameState === "LEADERBOARD") {
      drawLeaderboardScreen(ctx, canvas, palette);
    }

  }, [gameState, snake, food, goldenFood, colorScheme, particles, isNewHighScore, score, leaderboard]);

  // CRT screen overlay graphics inside canvas
  const drawRetroOverlay = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    palette: typeof PALETTES.GREEN, 
    title: string, 
    subtitle: string,
    isEntryState = false
  ) => {
    // Semi-transparent dimming background
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 15;
    ctx.shadowColor = palette.text;
    ctx.fillStyle = palette.text;
    
    // Large flashing Title
    ctx.font = "bold 24px 'Courier New', Courier, monospace";
    ctx.textAlign = "center";
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 40);

    // Subtitle
    ctx.shadowBlur = 5;
    ctx.font = "14px 'Courier New', Courier, monospace";
    
    if (isEntryState) {
      ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 10);
      ctx.font = "12px 'Courier New', Courier, monospace";
      ctx.fillStyle = palette.textDim;
      ctx.fillText("TYPE INITIALS + SAVE", canvas.width / 2, canvas.height / 2 + 50);
    } else {
      // Make subtitle flash
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 20);
      }
      
      // Bottom instructions
      ctx.font = "11px 'Courier New', Courier, monospace";
      ctx.fillStyle = palette.textDim;
      ctx.fillText("USE ARROW KEYS OR W,A,S,D TO STEER", canvas.width / 2, canvas.height / 2 + 80);
      ctx.fillText("SPACE TO START/PAUSE", canvas.width / 2, canvas.height / 2 + 105);
    }
  };

  // Draw leaderboard directly onto canvas
  const drawLeaderboardScreen = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    palette: typeof PALETTES.GREEN
  ) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 10;
    ctx.shadowColor = palette.text;
    ctx.fillStyle = palette.text;

    ctx.font = "bold 22px 'Courier New', Courier, monospace";
    ctx.textAlign = "center";
    ctx.fillText("HALL OF FAME", canvas.width / 2, 60);

    ctx.font = "14px 'Courier New', Courier, monospace";
    ctx.textAlign = "left";
    
    const startY = 110;
    const spacing = 35;
    
    ctx.fillStyle = palette.textDim;
    ctx.fillText("RNK  NAME   SCORE   DATE", 50, startY - 20);
    ctx.fillText("---------------------------", 50, startY - 8);

    leaderboard.forEach((entry, idx) => {
      ctx.fillStyle = idx === 0 ? palette.text : palette.textDim;
      ctx.shadowBlur = idx === 0 ? 8 : 0;
      
      const rank = `${idx + 1}.`;
      const name = entry.name.padEnd(6, " ");
      const scoreStr = String(entry.score).padStart(4, "0");
      const date = entry.date;

      ctx.fillText(`${rank.padEnd(4, " ")}${name} ${scoreStr}    ${date}`, 50, startY + idx * spacing);
    });

    ctx.shadowBlur = 5;
    ctx.fillStyle = palette.text;
    ctx.textAlign = "center";
    ctx.font = "13px 'Courier New', Courier, monospace";
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillText("PRESS SPACE TO RETURN TO MENU", canvas.width / 2, 330);
    }
  };

  // Mobile controller triggers
  const handleDpadPress = (dir: Direction) => {
    const currentDir = directionRef.current;
    if (gameState !== "PLAYING") return;
    
    if (audioRef.current) audioRef.current.playSelect();

    if (dir === "UP" && currentDir !== "DOWN") {
      setDirection("UP");
      directionRef.current = "UP";
    } else if (dir === "DOWN" && currentDir !== "UP") {
      setDirection("DOWN");
      directionRef.current = "DOWN";
    } else if (dir === "LEFT" && currentDir !== "RIGHT") {
      setDirection("LEFT");
      directionRef.current = "LEFT";
    } else if (dir === "RIGHT" && currentDir !== "LEFT") {
      setDirection("RIGHT");
      directionRef.current = "RIGHT";
    }
  };

  const getThemeColors = () => {
    return PALETTES[colorScheme];
  };

  const colors = getThemeColors();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-mono antialiased overflow-y-auto pb-10">
      {/* Top Banner Navigation */}
      <header className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between border-b border-zinc-900">
        <Link 
          href="/" 
          onClick={() => {
            if (audioRef.current) audioRef.current.playSelect();
          }}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-lg bg-zinc-900/40 backdrop-blur"
        >
          <ArrowLeft size={16} />
          <span>Exit to Dashboard</span>
        </Link>
        <div className="flex items-center gap-2 font-bold tracking-widest text-zinc-400">
          <Gamepad2 className="text-emerald-500 animate-pulse" size={18} />
          <span>PHOENIX_ARCADE v1.0</span>
        </div>
      </header>

      {/* Main Game Layout Grid */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 max-w-6xl mx-auto w-full px-4 mt-6">
        
        {/* Left Side: Game Controller Board (Arcade Cabinet Bezel) */}
        <div className="flex flex-col items-center">
          
          {/* Handheld Console Casing */}
          <div className="relative p-6 rounded-3xl bg-zinc-900 border-4 border-zinc-800 shadow-2xl shadow-zinc-950/80 flex flex-col items-center w-full max-w-[480px]">
            {/* Screen Bezel Branding */}
            <div className="w-full flex items-center justify-between px-4 pb-3 text-[10px] text-zinc-500 font-bold tracking-widest">
              <span>CRT-80 MONOCHROME</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-emerald-500">POWER</span>
              </div>
            </div>

            {/* Canvas screen frame */}
            <div 
              className={`relative overflow-hidden rounded-xl border-4 border-zinc-800 shadow-inner p-1`}
              style={{ 
                backgroundColor: colors.bg,
                borderColor: colors.border,
                boxShadow: `0 0 20px ${colors.glow}, inset 0 0 20px rgba(0,0,0,0.9)`
              }}
            >
              {/* Scanline CRT overlay */}
              {crtEffects && (
                <>
                  <div className="absolute inset-0 pointer-events-none z-10 crt-overlay opacity-25"></div>
                  <div className="absolute inset-0 pointer-events-none z-10 crt-flicker opacity-95"></div>
                  <div className="absolute inset-0 pointer-events-none z-10 crt-vignette"></div>
                </>
              )}

              {/* Game Scoreboard Display */}
              <div 
                className="flex items-center justify-between px-3 py-2 border-b text-xs font-bold font-mono tracking-wider relative z-10"
                style={{ 
                  borderColor: colors.grid,
                  color: colors.text
                }}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500">1UP</span>
                  <span>{String(score).padStart(5, "0")}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-500">LEVEL</span>
                  <span>{String(level).padStart(2, "0")}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-zinc-500">HI-SCORE</span>
                  <span>{String(Math.max(highScore, score)).padStart(5, "0")}</span>
                </div>
              </div>

              {/* Game Canvas */}
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="block relative z-10 select-none touch-none w-[340px] h-[340px] md:w-[380px] md:h-[380px]"
                style={{
                  filter: crtEffects ? "contrast(1.2) brightness(1.1) saturate(1.1)" : "none"
                }}
              />

              {/* Glowing Bezel Shadow details */}
              <div 
                className="absolute inset-0 pointer-events-none z-20 border border-white/5 rounded-lg"
              />
            </div>

            {/* Handheld physical controls below the screen */}
            <div className="w-full mt-6 grid grid-cols-3 items-center justify-center gap-4">
              
              {/* D-Pad for handheld (Left Side) */}
              <div className="flex flex-col items-center justify-center select-none">
                <div className="relative w-28 h-28">
                  {/* D-pad Cross Graphic */}
                  <div className="absolute inset-0 m-auto w-8 h-24 bg-zinc-800 rounded-md shadow-lg"></div>
                  <div className="absolute inset-0 m-auto w-24 h-8 bg-zinc-800 rounded-md shadow-lg"></div>
                  <div className="absolute inset-0 m-auto w-8 h-8 bg-zinc-700 rounded-sm z-10"></div>
                  
                  {/* UP button */}
                  <button 
                    onClick={() => handleDpadPress("UP")}
                    className="absolute top-0 left-0 right-0 mx-auto w-8 h-10 bg-zinc-800 active:bg-zinc-700 border-t border-zinc-600 rounded-t-md flex items-center justify-center text-zinc-400 z-10 cursor-pointer shadow-md"
                  >
                    ▲
                  </button>
                  {/* DOWN button */}
                  <button 
                    onClick={() => handleDpadPress("DOWN")}
                    className="absolute bottom-0 left-0 right-0 mx-auto w-8 h-10 bg-zinc-800 active:bg-zinc-700 border-b border-zinc-900 rounded-b-md flex items-center justify-center text-zinc-400 z-10 cursor-pointer shadow-md"
                  >
                    ▼
                  </button>
                  {/* LEFT button */}
                  <button 
                    onClick={() => handleDpadPress("LEFT")}
                    className="absolute left-0 top-0 bottom-0 my-auto w-10 h-8 bg-zinc-800 active:bg-zinc-700 border-l border-zinc-600 rounded-l-md flex items-center justify-center text-zinc-400 z-10 cursor-pointer shadow-md"
                  >
                    ◀
                  </button>
                  {/* RIGHT button */}
                  <button 
                    onClick={() => handleDpadPress("RIGHT")}
                    className="absolute right-0 top-0 bottom-0 my-auto w-10 h-8 bg-zinc-800 active:bg-zinc-700 border-r border-zinc-900 rounded-r-md flex items-center justify-center text-zinc-400 z-10 cursor-pointer shadow-md"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Utility System Buttons (Center) */}
              <div className="flex flex-col gap-3 justify-center items-center">
                <div className="flex gap-2">
                  {/* SELECT (Cycle Color Schemes) */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => {
                        const schemes: ColorScheme[] = ["GREEN", "AMBER", "GRAY", "CYBER"];
                        const nextIdx = (schemes.indexOf(colorScheme) + 1) % schemes.length;
                        changeColorScheme(schemes[nextIdx]);
                      }}
                      className="w-10 h-3.5 bg-zinc-800 active:bg-zinc-700 rounded-full border border-zinc-700 rotate-[-12deg] shadow-inner cursor-pointer"
                      title="Select Color Palette"
                    />
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider scale-90">SELECT</span>
                  </div>

                  {/* START (Play/Pause) */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => {
                        if (gameState === "PLAYING") {
                          setGameState("PAUSED");
                          if (audioRef.current) audioRef.current.playSelect();
                        } else if (gameState === "PAUSED") {
                          setGameState("PLAYING");
                          if (audioRef.current) {
                            audioRef.current.playSelect();
                            if (playMusic) audioRef.current.startMusic();
                          }
                        } else if (gameState === "MENU") {
                          startGame();
                        } else if (gameState === "GAME_OVER" && !isNewHighScore) {
                          startGame();
                        } else if (gameState === "LEADERBOARD") {
                          setGameState("MENU");
                        }
                      }}
                      className="w-10 h-3.5 bg-zinc-800 active:bg-zinc-700 rounded-full border border-zinc-700 rotate-[-12deg] shadow-inner cursor-pointer"
                      title="Start / Pause Game"
                    />
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider scale-90">START</span>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-zinc-600 tracking-wider">
                  SYSTEM POWER
                </div>
              </div>

              {/* Action Buttons A & B (Right Side) */}
              <div className="flex justify-center items-center gap-3 relative select-none">
                {/* Button B (Reset / Menu) */}
                <div className="flex flex-col items-center gap-1 mt-3">
                  <button 
                    onClick={() => {
                      if (audioRef.current) audioRef.current.playSelect();
                      if (gameState !== "MENU") {
                        if (audioRef.current) audioRef.current.stopMusic();
                        setGameState("MENU");
                      }
                    }}
                    className="w-10 h-10 bg-zinc-800 active:bg-zinc-700 border-2 border-zinc-900 rounded-full flex items-center justify-center text-xs font-bold text-zinc-400 shadow-md cursor-pointer"
                  >
                    B
                  </button>
                  <span className="text-[9px] text-zinc-500 font-bold tracking-widest">MENU</span>
                </div>

                {/* Button A (Coin / Restart) */}
                <div className="flex flex-col items-center gap-1 -mt-3">
                  <button 
                    onClick={() => {
                      if (isNewHighScore) {
                        saveLeaderboardScore();
                      } else {
                        startGame();
                      }
                    }}
                    className="w-10 h-10 bg-rose-700 active:bg-rose-600 border-2 border-zinc-950 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md cursor-pointer"
                  >
                    A
                  </button>
                  <span className="text-[9px] text-zinc-500 font-bold tracking-widest">RUN</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Options, Retro Manual, & Leaderboard */}
        <div className="flex-1 flex flex-col gap-6 w-full max-w-[480px]">
          
          {/* Leaderboard High Score Input panel when active */}
          {isNewHighScore && gameState === "GAME_OVER" && (
            <div className="p-5 rounded-2xl bg-zinc-900 border-2 border-rose-900/50 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
              <h3 className="text-lg font-bold text-rose-500 flex items-center gap-2 mb-2">
                <Sparkles size={18} />
                <span>NEW HIGH SCORE DETECTED!</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                You scored <span className="text-rose-400 font-bold">{score}</span>! Enter your initials to secure your place in the Hall of Fame.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={3}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                  className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-center text-lg font-bold w-20 text-emerald-400 tracking-widest focus:outline-none focus:border-rose-500 uppercase"
                  placeholder="AAA"
                />
                <button
                  onClick={saveLeaderboardScore}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm px-4 py-2.5 rounded transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trophy size={16} />
                  <span>Lock In Score</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Settings Panel */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Cpu size={16} className="text-indigo-400" />
              <span>ARCADE CONTROL SYSTEM</span>
            </h3>

            <div className="space-y-4">
              {/* Game Speed Setting */}
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">
                  System Clock Speed (Difficulty)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["SLOW", "MEDIUM", "FAST", "HYPER"] as const).map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setSpeedSetting(speed);
                        if (audioRef.current) audioRef.current.playSelect();
                      }}
                      className={`text-[10px] font-bold py-1.5 rounded transition-colors cursor-pointer border ${
                        speedSetting === speed
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                          : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Mode / Wall Border Settings */}
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">
                  Boundary Matrix Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setWallCollision(true);
                      if (audioRef.current) audioRef.current.playSelect();
                    }}
                    className={`text-xs font-bold py-2 rounded transition-colors cursor-pointer border flex flex-col items-center justify-center ${
                      wallCollision
                        ? "bg-zinc-800 text-emerald-400 border-emerald-500/50 shadow"
                        : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:bg-zinc-900"
                    }`}
                  >
                    <span>SOLID WALLS</span>
                    <span className="text-[8px] text-zinc-500 mt-0.5">BORDER COLLISION = CRASH</span>
                  </button>
                  <button
                    onClick={() => {
                      setWallCollision(false);
                      if (audioRef.current) audioRef.current.playSelect();
                    }}
                    className={`text-xs font-bold py-2 rounded transition-colors cursor-pointer border flex flex-col items-center justify-center ${
                      !wallCollision
                        ? "bg-zinc-800 text-emerald-400 border-emerald-500/50 shadow"
                        : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:bg-zinc-900"
                    }`}
                  >
                    <span>WRAP BORDERS</span>
                    <span className="text-[8px] text-zinc-500 mt-0.5">TELEPORT ON EDGE</span>
                  </button>
                </div>
              </div>

              {/* Audio and CRT Visual controls */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {/* Audio sound effects toggle */}
                <button
                  onClick={toggleMute}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-bold border transition-colors cursor-pointer ${
                    !isMuted 
                      ? "bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800" 
                      : "bg-zinc-800 text-zinc-500 border-zinc-700"
                  }`}
                >
                  {!isMuted ? <Volume2 size={14} className="text-indigo-400" /> : <VolumeX size={14} />}
                  <span>SFX</span>
                </button>

                {/* Background music toggle */}
                <button
                  onClick={toggleMusic}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-bold border transition-colors cursor-pointer ${
                    playMusic 
                      ? "bg-zinc-800 text-emerald-400 border-emerald-500/40" 
                      : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
                  }`}
                >
                  <Gamepad2 size={14} className={playMusic ? "animate-spin" : ""} />
                  <span>8-BIT BASS</span>
                </button>

                {/* CRT visuals toggle */}
                <button
                  onClick={() => {
                    setCrtEffects(!crtEffects);
                    if (audioRef.current) audioRef.current.playSelect();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-bold border transition-colors cursor-pointer ${
                    crtEffects 
                      ? "bg-zinc-800 text-cyan-400 border-cyan-500/40" 
                      : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
                  }`}
                >
                  <Cpu size={14} />
                  <span>CRT FILTER</span>
                </button>
              </div>

            </div>
          </div>

          {/* Retro Manual / Instructions */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <Info size={16} className="text-zinc-400" />
              <span>SNAKE MATRIX MANUAL</span>
            </h3>
            
            <div className="space-y-3.5 text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <p>
                  Steer the snake using your keyboard's <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 font-bold text-[10px]">Arrow Keys</kbd> or <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 font-bold text-[10px]">W A S D</kbd>.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <p>
                  Eat standard fruits (<span style={{ color: colors.food }}>■</span>) to grow and earn <span className="text-zinc-200 font-bold">10 pts × level</span>.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <p>
                  Eat rare golden sparkle fruits (<span style={{ color: colors.goldenFood }}>■</span>) that appear randomly to earn a massive <span className="text-zinc-200 font-bold">30 pts × level</span>. They disappear after a limited time!
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <p>
                  Speed increases as you level up (level rises every 50 points earned).
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <p>
                  Press <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 font-bold text-[10px]">Space</kbd> to pause at any time, or click <span className="text-zinc-300 font-bold">SELECT</span> to cycle display phosphor colors.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Retro CSS Styles injected inline */}
      <style jsx global>{`
        /* Scanline CRT simulation styles */
        .crt-overlay {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.35) 50%
          );
          background-size: 100% 4px;
        }

        @keyframes crt-flicker-animation {
          0% { opacity: 0.985; }
          50% { opacity: 1; }
          100% { opacity: 0.99; }
        }

        .crt-flicker {
          animation: crt-flicker-animation 0.15s infinite;
        }

        .crt-vignette {
          background: radial-gradient(circle, transparent 65%, rgba(0, 0, 0, 0.45) 100%);
        }
      `}</style>
    </div>
  );
}
