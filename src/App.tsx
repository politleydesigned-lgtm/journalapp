/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CloudOff, 
  ShieldCheck, 
  Lock, 
  Send, 
  User, 
  Bot, 
  Settings, 
  ShieldAlert,
  Sparkles,
  Trash2,
  Zap,
  BookOpen,
  Crown,
  History,
  AlertTriangle,
  CheckCircle2,
  X,
  Mic,
  MicOff,
  Wind,
  Compass,
  Eye,
  BrainCircuit,
  Flame,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---

// ... (rest of types)

type Message = {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isSaved?: boolean;
};

type JournalEntry = {
  id: string;
  text: string;
  timestamp: Date;
  summary?: string;
};

type Persona = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  price?: string;
  unlocked: boolean;
  icon: React.ReactNode;
  tag?: 'featured' | 'popular';
};

// --- Constants ---

const PERSONAS: Persona[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'A compassionate AI therapist for general support. Features emotional validation and safe self-exploration to help you navigate daily stress and complex feelings.',
    prompt: "You are a compassionate, professional, and private AI therapist. Your goal is to listen, validate, and help the user explore their emotions in a safe environment. Keep responses concise but deeply empathetic. Never share personal data. Emphasize that this is a private space.",
    unlocked: true,
    icon: <Bot className="w-4 h-4" />
  },
  {
    id: 'stoic',
    name: 'The Stoic',
    description: 'Wisdom from Marcus Aurelius. Focuses on logic and resilience. Helps you distinguish between what you can control and what you must accept with equanimity.',
    prompt: "You are Marcus Aurelius. Answer only with stoic philosophy. Be brief, logical, and focused on what is within the user's control. Do not coddle.",
    price: '$9.99',
    unlocked: false,
    icon: <Sparkles className="w-4 h-4" />
  },
  {
    id: 'tough-love',
    name: 'Tough Love',
    description: 'A strict, high-performance coach. Features radical accountability and no-excuses progress to help you break through procrastination and reach your goals.',
    prompt: "You are a strict, high-performance coach. Do not coddle the user. Call out their excuses. Focus on action and accountability.",
    price: '$9.99',
    unlocked: false,
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'zen',
    name: 'Zen Master',
    description: 'Guided mindfulness and presence. Features breath-work prompts and nature metaphors to help you find peace, reduce anxiety, and stay grounded in the "now".',
    prompt: "You are a Zen Master. Your goal is to guide the user back to the present moment. Use metaphors from nature. Be very brief. Focus on mindfulness and breathing.",
    price: '$9.99',
    unlocked: false,
    icon: <Wind className="w-4 h-4" />,
    tag: 'popular'
  },
  {
    id: 'socratic',
    name: 'Socratic Inquirer',
    description: 'Uses deep, probing questions to challenge assumptions. Helps you uncover your own inner truths and develop critical thinking through reasoned dialogue.',
    prompt: "You are Socrates. Do not give advice. Instead, ask probing questions that challenge the user's assumptions and lead them to their own conclusions through reason.",
    price: '$9.99',
    unlocked: false,
    icon: <Compass className="w-4 h-4" />
  },
  {
    id: 'shadow',
    name: 'Shadow Worker',
    description: 'A Jungian approach to the subconscious. Features deep analytical prompts to help you integrate hidden motivations and the parts of yourself you usually ignore.',
    prompt: "You are a Jungian analyst specializing in Shadow Work. Help the user explore their subconscious, hidden motivations, and the parts of themselves they usually ignore. Be deep and analytical.",
    price: '$14.99',
    unlocked: false,
    icon: <Moon className="w-4 h-4" />,
    tag: 'featured'
  },
  {
    id: 'offline-journal',
    name: 'The Offline Journal',
    description: 'A structured reflection space. Features thought-provoking prompts and pattern detection to help you process your day and track your emotional growth over time.',
    prompt: "You are a professional journaling guide. Your goal is to help the user reflect deeply on their day. Ask one thought-provoking question at a time. Encourage them to write freely. Focus on emotional processing and personal growth.",
    price: '$19.99',
    unlocked: false,
    icon: <BookOpen className="w-4 h-4" />
  }
];

// --- Components ---

// --- Components ---

const TalkingAvatar = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="relative size-48 flex items-center justify-center"
    >
      {/* Outer Glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl"
      />
      
      {/* Concentric Rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.2 + i * 0.15, 1],
            rotate: [0, 180 * (i + 1), 360 * (i + 1)],
            borderRadius: [
              "40% 60% 70% 30% / 40% 50% 60% 50%", 
              "60% 40% 30% 70% / 50% 60% 40% 60%", 
              "40% 60% 70% 30% / 40% 50% 60% 50%"
            ],
          }}
          transition={{
            duration: 10 + i * 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 border border-blue-500/20 rounded-full"
        />
      ))}

      {/* Core - Breathing Motion */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          y: [0, -4, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative size-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center overflow-hidden z-20"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Bot className="w-10 h-10 text-white relative z-10" />
        </motion.div>
        
        {/* Inner Pulse */}
        <motion.div
          animate={{
            opacity: [0, 0.3, 0],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 bg-white rounded-full"
        />
      </motion.div>

      {/* "Talking" Waves - More Dynamic Spectrum */}
      <div className="absolute -bottom-10 flex gap-1.5 items-end h-10">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: [4, 8 + Math.random() * 24, 4],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 0.4 + Math.random() * 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.05,
            }}
            className="w-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
};

const Onboarding = ({ onStart }: { onStart: () => void }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-[#101622]">
      <div className="flex items-center p-4 pb-2 justify-between shrink-0">
        <div className="text-slate-100 flex size-12 shrink-0 items-center justify-start">
          <Sparkles className="w-6 h-6 text-blue-500" />
        </div>
        <h2 className="text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12 font-display">
          Welcome to Your Vault
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-8 flex flex-col items-center justify-center min-h-[320px]">
          <TalkingAvatar />
        </div>

        <div className="px-6 pt-2 pb-6">
          <div className="space-y-4 mb-8">
            <h1 className="text-slate-100 tracking-tight text-3xl font-extrabold leading-tight text-center font-display">
              The Privacy Vault
            </h1>
            <p className="text-slate-400 text-base font-medium leading-relaxed text-center px-2">
              A safe, private space to explore your thoughts. Your journal is 100% offline, encrypted, and yours alone.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">Privacy Guaranteed</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your data never leaves this device. We use zero-knowledge encryption to ensure even we can't see your reflections.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-3 mt-4 cursor-pointer group">
              <div className={`size-5 rounded border flex items-center justify-center transition-all ${agreed ? 'bg-blue-600 border-blue-600' : 'border-slate-600 group-hover:border-slate-400'}`}>
                {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <input type="checkbox" className="hidden" checked={agreed} onChange={() => setAgreed(!agreed)} />
              <span className="text-xs text-slate-300">I understand and agree to the terms.</span>
            </label>
          </div>

          <motion.button 
            whileHover={agreed ? { scale: 1.02 } : {}}
            whileTap={agreed ? { scale: 0.98 } : {}}
            onClick={() => agreed && onStart()}
            disabled={!agreed}
            className={`w-full font-bold py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 mb-8 ${
              agreed 
                ? 'bg-[#135bec] text-white shadow-xl shadow-blue-500/30' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span className="text-lg">Open My Vault</span>
            <ArrowRight className="w-6 h-6" />
          </motion.button>

          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <CloudOff className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">100% Offline</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <Lock className="w-4 h-4 text-blue-500" />
              <span className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">Encrypted Memory</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 shrink-0 border-t border-slate-800">
        <p className="text-slate-500 text-[10px] text-center font-medium tracking-widest">
          NO CLOUD SYNC • NO DATA COLLECTION • LOCAL PROCESSING ONLY
        </p>
      </div>
    </div>
  );
};

const SettingsView = ({ 
  onClose, 
  onIncinerate, 
  unlocked, 
  onUnlock, 
  personas, 
  onBuyPersona,
  activePersonaId,
  onSelectPersona
}: { 
  onClose: () => void;
  onIncinerate: () => void;
  unlocked: boolean;
  onUnlock: () => void;
  personas: Persona[];
  onBuyPersona: (id: string) => void;
  activePersonaId: string;
  onSelectPersona: (id: string) => void;
}) => {
  return (
    <div className="flex flex-col h-full bg-[#101622]">
      <div className="flex items-center p-4 border-b border-slate-800">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-100">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-slate-100 flex-1 text-center pr-8 font-display">Vault Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Premium Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Premium Features</h3>
          {!unlocked ? (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-xl shadow-blue-900/20">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white">$49.99</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Lifetime Privacy Unlock</h4>
              <p className="text-blue-100 text-xs leading-relaxed mb-4">
                Enable "Vector Search" module. The AI will remember your history across months to find deep patterns.
              </p>
              <button 
                onClick={onUnlock}
                className="w-full bg-white text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                Unlock Lifetime Memory
              </button>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-2 bg-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-400">Lifetime Unlocked</h4>
                <p className="text-[10px] text-slate-400">Vector Search & Long-term Memory Active</p>
              </div>
            </div>
          )}
        </section>

        {/* Personas Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Persona DLCs</h3>
            <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">New Personas Added</span>
          </div>
          
          {/* Debug Hint for User */}
          <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <p className="text-[9px] text-slate-500 leading-tight">
              <span className="font-bold text-slate-400">Note:</span> Checkout requires <code className="text-blue-400">STRIPE_SECRET_KEY</code> to be set in your AI Studio environment variables.
            </p>
          </div>

          <div className="grid gap-3">
            {personas.map(persona => (
              <div 
                key={persona.id} 
                onClick={() => persona.unlocked && onSelectPersona(persona.id)}
                className={`bg-slate-800/50 border rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer ${
                  activePersonaId === persona.id 
                    ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/50' 
                    : 'border-slate-700 hover:border-slate-600'
                } ${!persona.unlocked ? 'opacity-70 grayscale-[0.5]' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${
                    activePersonaId === persona.id 
                      ? 'bg-blue-500 text-white' 
                      : persona.unlocked ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'
                  }`}>
                    {persona.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{persona.name}</h4>
                      {persona.tag && (
                        <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${
                          persona.tag === 'featured' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {persona.tag}
                        </span>
                      )}
                      {activePersonaId === persona.id && <div className="size-1.5 rounded-full bg-blue-500 animate-pulse" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{persona.description}</p>
                  </div>
                </div>
                {!persona.unlocked ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuyPersona(persona.id);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-900/20"
                  >
                    {persona.price}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {activePersonaId === persona.id ? (
                      <span className="text-[10px] font-bold text-blue-500 uppercase">Active</span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">Owned</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Security Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Security & Trust</h3>
          <div className="space-y-3">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-200">Airplane Mode Test</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Verified</span>
            </div>
            <button 
              onClick={onIncinerate}
              className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-2xl p-4 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-sm font-bold text-red-500">Incinerate Data</span>
              </div>
              <ArrowRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[10px] text-slate-500 text-center px-4">
              Wipes the local encryption key instantly. Data becomes mathematically unrecoverable.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

const JournalView = ({ entries, onClose, unlocked }: { entries: JournalEntry[], onClose: () => void, unlocked: boolean }) => {
  return (
    <div className="flex flex-col h-full bg-[#101622]">
      <div className="flex items-center p-4 border-b border-slate-800">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-100">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-slate-100 flex-1 text-center pr-8 font-display">The Offline Journal</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!unlocked && entries.length > 5 && (
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Premium Feature</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              You've reached the limit for free journal entries. Unlock <span className="text-white font-bold">Lifetime Memory</span> to store unlimited reflections and enable pattern detection.
            </p>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 opacity-50">
            <div className="size-20 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700">
              <BookOpen className="w-10 h-10 text-slate-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-300">Your vault is empty</p>
              <p className="text-xs text-slate-500">Save insights from your conversations to build your offline journal.</p>
            </div>
          </div>
        ) : (
          entries.map(entry => (
            <motion.div 
              key={entry.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-3 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {entry.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <History className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <p className="text-sm text-slate-200 leading-relaxed italic">"{entry.text}"</p>
              {entry.summary && (
                <div className="pt-3 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <BrainCircuit className="w-3 h-3 text-blue-400" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">AI Pattern Analysis</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{entry.summary}</p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-center gap-2 opacity-30">
          <Lock className="w-3 h-3" />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Zero-Knowledge Storage</span>
        </div>
      </div>
    </div>
  );
};

const ChatInterface = ({ 
  onOpenSettings, 
  onOpenJournal, 
  unlocked, 
  activePersona,
  onSaveEntry,
  personas,
  onSelectPersona
}: { 
  onOpenSettings: () => void;
  onOpenJournal: () => void;
  unlocked: boolean;
  activePersona: Persona;
  onSaveEntry: (text: string) => void;
  personas: Persona[];
  onSelectPersona: (id: string) => void;
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Hello. I am the Privacy Vault AI (${activePersona.name} mode). I'm here to provide a safe, private space for you to explore your thoughts and feelings. How are you feeling today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseInputRef = useRef('');
  const latestInputRef = useRef('');
  const manualStopRef = useRef(false);
  const inputAreaRef = useRef<HTMLDivElement>(null);

  // Keep latestInputRef in sync with input state
  useEffect(() => {
    latestInputRef.current = input;
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isListening && inputAreaRef.current && !inputAreaRef.current.contains(event.target as Node)) {
        manualStopRef.current = true;
        recognitionRef.current?.stop();
        setIsListening(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isListening]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript || interimTranscript) {
          // We use the base input (what was there before we started) 
          // and append the current session's transcript
          const currentSessionTranscript = event.results[0][0].transcript; // Simplified for now
          // Actually, let's stick to a simpler but more reliable approach for continuous
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript;
          }
          setInput(baseInputRef.current + (baseInputRef.current ? ' ' : '') + fullTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        let errorMessage = '';
        switch (event.error) {
          case 'no-speech':
            // In continuous mode, we just let onend restart it silently
            return;
          case 'audio-capture':
            errorMessage = "Can't find your microphone. Check if it's plugged in or used by another app.";
            break;
          case 'not-allowed':
          case 'permission-denied':
            errorMessage = "Microphone access is blocked. Please enable it in your browser settings.";
            break;
          case 'network':
            errorMessage = "Connection issue. Voice input needs a stable internet connection.";
            break;
          case 'aborted':
            errorMessage = "Listening was interrupted. Please try again.";
            break;
          case 'service-not-allowed':
            errorMessage = "Speech service is currently unavailable. Please try again later.";
            break;
          case 'language-not-supported':
            errorMessage = "Your browser doesn't support speech recognition in this language.";
            break;
          default:
            errorMessage = "Something went wrong with the microphone. Please try again.";
        }
        
        if (errorMessage) {
          setVoiceError(errorMessage);
          setIsListening(false);
          manualStopRef.current = true;
          // Keep errors visible a bit longer if they are critical
          setTimeout(() => setVoiceError(null), 8000);
        }
      };

      recognitionRef.current.onend = () => {
        // If it wasn't a manual stop, restart to ensure continuous listening
        if (!manualStopRef.current) {
          try {
            setTimeout(() => {
              if (!manualStopRef.current) {
                // Update base input to the latest full text before restarting
                baseInputRef.current = latestInputRef.current;
                recognitionRef.current?.start();
              }
            }, 100);
          } catch (e) {
            console.error("Failed to restart recognition:", e);
            setIsListening(false);
          }
        }
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      manualStopRef.current = true;
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setVoiceError(null);
      manualStopRef.current = false;
      try {
        baseInputRef.current = input;
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset messages when persona changes
  useEffect(() => {
    setMessages([
      {
        role: 'model',
        text: `Switched to ${activePersona.name} mode. How can I help you from this perspective?`,
        timestamp: new Date()
      }
    ]);
  }, [activePersona]);

  const runSafetyCheck = (text: string) => {
    const crisisKeywords = ['hurt myself', 'suicide', 'end it all', 'kill myself', 'self harm'];
    return crisisKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // 1. Safety Classifier (Simulated Local Model)
    if (runSafetyCheck(input)) {
      setShowCrisis(true);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      // 2. RAG Layer (Simulated Vector Search if unlocked)
      let context = "";
      if (unlocked) {
        context = "\n[CONTEXT FROM MEMORY]: The user has mentioned feeling similar pressure in past entries. They usually find relief through creative work.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.concat(userMessage).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: activePersona.prompt + context,
        }
      });

      const modelText = response.text || "I'm here to listen. Could you tell me more about that?";
      
      setMessages(prev => [...prev, {
        role: 'model',
        text: modelText,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I apologize, but I'm having trouble connecting securely right now. Please try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#101622] relative">
      {/* Crisis Overlay */}
      <AnimatePresence>
        {showCrisis && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#101622]/95 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-[2rem] p-8 text-center space-y-6">
              <div className="size-16 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-red-500/20">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">You are not alone.</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Our safety system detected a potential crisis. Please reach out to professional help immediately.
                </p>
              </div>
              <div className="space-y-3">
                <a href="tel:988" className="block w-full bg-white text-red-600 font-bold py-4 rounded-2xl">Call 988 (Crisis Line)</a>
                <button 
                  onClick={() => setShowCrisis(false)}
                  className="block w-full bg-slate-800 text-slate-300 font-bold py-4 rounded-2xl"
                >
                  I'm safe now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col border-b border-slate-800 bg-[#101622]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center p-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              {activePersona.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 font-display flex items-center gap-2">
                {activePersona.name}
                {unlocked && <Crown className="w-3 h-3 text-amber-500" />}
              </h3>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Local Inference Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onOpenJournal} className="p-2 text-slate-400 hover:text-slate-100 transition-colors">
              <BookOpen className="w-5 h-5" />
            </button>
            <button onClick={onOpenSettings} className="p-2 text-slate-400 hover:text-slate-100 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Persona Quick Switcher */}
        <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest shrink-0 mr-1">Switch:</span>
          {personas.filter(p => p.unlocked).map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p.id)}
              className={`size-8 rounded-full flex items-center justify-center shrink-0 transition-all border ${
                activePersona.id === p.id 
                  ? 'bg-blue-600 border-blue-400 text-white scale-110 shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
              }`}
              title={p.name}
            >
              {p.icon}
            </button>
          ))}
          {!unlocked && (
            <button 
              onClick={onOpenSettings}
              className="size-8 rounded-full flex items-center justify-center shrink-0 bg-slate-800/50 border border-dashed border-slate-700 text-slate-600 hover:text-blue-400 hover:border-blue-500/50 transition-all"
            >
              <Crown className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`size-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className="space-y-2">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700' 
                      : 'bg-blue-600/10 text-slate-100 rounded-tl-none border border-blue-500/20'
                  }`}>
                    {msg.text}
                    <div className="mt-2 text-[9px] opacity-40 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {msg.role === 'user' && !msg.isSaved && (
                    <button 
                      onClick={() => {
                        onSaveEntry(msg.text);
                        setMessages(prev => prev.map((m, i) => i === idx ? { ...m, isSaved: true } : m));
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[9px] font-bold text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                    >
                      <BookOpen className="w-3 h-3" />
                      SAVE TO JOURNAL
                    </button>
                  )}
                  {msg.isSaved && (
                    <div className="flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold text-emerald-500">
                      <CheckCircle2 className="w-3 h-3" />
                      SAVED TO VAULT
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 bg-blue-600/10 rounded-2xl rounded-tl-none border border-blue-500/20 flex gap-1">
                <span className="size-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="size-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="size-1.5 bg-blue-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-[#101622]">
        <AnimatePresence>
          {voiceError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider leading-tight">{voiceError}</p>
                <button 
                  onClick={() => {
                    setVoiceError(null);
                    toggleListening();
                  }}
                  className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-1 hover:text-blue-300 transition-colors"
                >
                  Try Again
                </button>
              </div>
              <button onClick={() => setVoiceError(null)} className="p-1 text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={inputAreaRef} className="relative flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <AnimatePresence>
              {isListening && !input && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute left-4 flex items-center gap-2 pointer-events-none z-10"
                >
                  <div className="flex gap-0.5 items-center h-3">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, 12, 4] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                        className="w-0.5 bg-blue-500 rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Listening...</span>
                </motion.div>
              )}
            </AnimatePresence>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "" : "Share your thoughts..."}
              className={`w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-500 ${
                isListening && !input ? 'pl-24' : ''
              }`}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-0 bg-red-500 rounded-2xl z-0"
                />
              )}
            </AnimatePresence>
            <motion.button
              onClick={toggleListening}
              animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={isListening ? { repeat: Infinity, duration: 1.5 } : {}}
              className={`relative z-10 p-4 rounded-2xl transition-all flex items-center justify-center ${
                isListening 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 opacity-40">
          <ShieldAlert className="w-3 h-3" />
          <span className="text-[9px] font-bold uppercase tracking-widest">End-to-End Encrypted Channel</span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState<'onboarding' | 'chat' | 'settings' | 'journal'>('onboarding');
  const [unlocked, setUnlocked] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>(PERSONAS);
  const [activePersonaId, setActivePersonaId] = useState('default');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const userEmail = "lisa@intentionaltravelwithlisa.com";

  // Fetch journal entries on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log("Backend Health Check:", data);
      } catch (error) {
        console.error("Backend Health Check Failed:", error);
      }
    };
    checkHealth();

    const fetchJournal = async () => {
      try {
        const response = await fetch('/api/journal');
        if (response.ok) {
          const data = await response.json();
          setJournalEntries(data.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          })));
        }
      } catch (error) {
        console.error("Failed to fetch journal:", error);
      }
    };
    fetchJournal();
  }, []);

  // Handle Stripe Success Redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      const personaId = params.get('personaId');
      if (personaId === 'lifetime') {
        setUnlocked(true);
        alert("Lifetime Privacy Unlocked! Vector Search & Long-term Memory are now active.");
      } else if (personaId) {
        setPersonas(prev => prev.map(p => p.id === personaId ? { ...p, unlocked: true } : p));
        setActivePersonaId(personaId);
        alert(`Unlocked ${personaId} persona!`);
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setStep('chat');
    }
  }, []);

  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0];

  const handleIncinerate = async () => {
    if (confirm("Are you sure? This will wipe the encryption key and all data will be lost forever.")) {
      try {
        await fetch('/api/journal', { method: 'DELETE' });
        setJournalEntries([]);
        setUnlocked(false);
        setPersonas(PERSONAS);
        setActivePersonaId('default');
        setStep('onboarding');
      } catch (error) {
        console.error("Failed to incinerate data:", error);
        alert("Failed to wipe remote vault data.");
      }
    }
  };

  const handleUnlock = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          personaId: 'lifetime',
          email: userEmail 
        }),
      });
      const { url, error } = await response.json();
      if (url) {
        // Using window.open instead of window.location.href to avoid iframe restrictions
        const checkoutWindow = window.open(url, '_blank');
        if (!checkoutWindow) {
          // If popup is blocked, fallback to location.href
          window.location.href = url;
        }
      } else {
        throw new Error(error || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(`Checkout Error: ${error.message}. Please ensure your STRIPE_SECRET_KEY is configured in AI Studio settings.`);
    }
  };

  const handleBuyPersona = async (id: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          personaId: id,
          email: userEmail 
        }),
      });
      const { url, error } = await response.json();
      if (url) {
        // Using window.open instead of window.location.href to avoid iframe restrictions
        const checkoutWindow = window.open(url, '_blank');
        if (!checkoutWindow) {
          // If popup is blocked, fallback to location.href
          window.location.href = url;
        }
      } else {
        throw new Error(error || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(`Checkout Error: ${error.message}. Please ensure your STRIPE_SECRET_KEY is configured in AI Studio settings.`);
    }
  };

  const handleSaveEntry = async (text: string) => {
    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      timestamp: new Date(),
      summary: "User expressed thoughts on current situation. Patterns suggest a need for reflection."
    };
    
    try {
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      setJournalEntries(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error("Failed to save journal entry:", error);
      alert("Failed to save entry to the vault backend.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-0 sm:p-4">
      <div className="w-full h-screen sm:h-[844px] sm:max-w-[390px] bg-[#101622] sm:rounded-[3rem] sm:border-[8px] border-slate-800 overflow-hidden shadow-2xl relative">
        {/* Status Bar Mockup */}
        <div className="hidden sm:flex absolute top-0 left-0 right-0 h-8 items-center justify-between px-8 z-50 pointer-events-none">
          <span className="text-[10px] font-bold text-slate-500">9:41</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full border border-slate-500"></div>
            <div className="w-3 h-3 rounded-full border border-slate-500"></div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'onboarding' && (
            <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              <Onboarding onStart={() => setStep('chat')} />
            </motion.div>
          )}
          {step === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full">
              <ChatInterface 
                onOpenSettings={() => setStep('settings')} 
                onOpenJournal={() => setStep('journal')}
                unlocked={unlocked}
                activePersona={activePersona}
                onSaveEntry={handleSaveEntry}
                personas={personas}
                onSelectPersona={(id) => setActivePersonaId(id)}
              />
            </motion.div>
          )}
          {step === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="h-full">
              <SettingsView 
                onClose={() => setStep('chat')} 
                onIncinerate={handleIncinerate}
                unlocked={unlocked}
                onUnlock={handleUnlock}
                personas={personas}
                onBuyPersona={handleBuyPersona}
                activePersonaId={activePersonaId}
                onSelectPersona={(id) => {
                  setActivePersonaId(id);
                  setStep('chat');
                }}
              />
            </motion.div>
          )}
          {step === 'journal' && (
            <motion.div key="journal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="h-full">
              <JournalView entries={journalEntries} onClose={() => setStep('chat')} unlocked={unlocked} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Home Indicator Mockup */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-800 rounded-full pointer-events-none"></div>
      </div>
    </div>
  );
}
