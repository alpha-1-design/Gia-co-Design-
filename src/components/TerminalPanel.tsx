import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Loader2, ChevronDown, Package, Cpu, HardDrive, X } from 'lucide-react';
import { execCommand, installPackage, getSystemInfo, SystemInfo } from '../lib/api';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  text: string;
  timestamp: number;
}

interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

export function TerminalPanel({ isOpen, onClose, theme }: TerminalPanelProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [cwd, setCwd] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  // Load system info on open
  useEffect(() => {
    if (isOpen && !systemInfo) {
      getSystemInfo()
        .then(setSystemInfo)
        .catch(() => {});
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const addLine = (type: TerminalLine['type'], text: string) => {
    setLines((prev) => [...prev, { id: `line-${Date.now()}-${Math.random()}`, type, text, timestamp: Date.now() }]);
  };

  const handleRun = async () => {
    const cmd = input.trim();
    if (!cmd || isRunning) return;

    setInput('');
    addLine('command', `$ ${cmd}`);
    setIsRunning(true);

    try {
      // Special commands
      if (cmd.startsWith('install ') || cmd.startsWith('npm install ') || cmd.startsWith('yarn add ') || cmd.startsWith('bun add ')) {
        const pkg = cmd.replace(/^(install|npm install|yarn add|bun add)\s+/, '').trim();
        if (pkg) {
          addLine('info', `Installing ${pkg}...`);
          const result = await installPackage(pkg, cwd || undefined);
          if (result.stdout) addLine('output', result.stdout);
          if (result.stderr) addLine('error', result.stderr);
          if (result.exitCode === 0) addLine('info', `✅ ${pkg} installed successfully`);
          else addLine('error', `❌ Installation failed (exit code ${result.exitCode})`);
        }
      } else if (cmd === 'sysinfo' || cmd === 'system') {
        const info = await getSystemInfo();
        setSystemInfo(info);
        addLine('info', [
          `Platform: ${info.platform} ${info.arch}`,
          info.nodeVersion ? `Node: ${info.nodeVersion}` : '',
          info.npmVersion ? `npm: ${info.npmVersion}` : '',
          info.bunVersion ? `Bun: ${info.bunVersion}` : '',
          info.pythonVersion ? `Python: ${info.pythonVersion}` : '',
          info.disk ? `Disk: ${info.disk.available} free of ${info.disk.total}` : '',
        ].filter(Boolean).join('\n'));
      } else if (cmd.startsWith('cd ')) {
        const newDir = cmd.slice(3).trim();
        setCwd(newDir);
        addLine('info', `Changed directory to ${newDir}`);
      } else if (cmd === 'clear') {
        setLines([]);
      } else {
        // Regular command via backend exec
        const result = await execCommand(cmd, cwd || undefined);
        if (result.stdout) addLine('output', result.stdout);
        if (result.stderr) addLine('error', result.stderr);
        if (result.exitCode !== 0 && !result.stderr) {
          addLine('error', `Exit code: ${result.exitCode}`);
        }
      }
    } catch (err: any) {
      addLine('error', err.message || 'Command failed');
    } finally {
      setIsRunning(false);
    }
  };

  const quickActions = [
    { label: 'Install Package', icon: Package, cmd: 'install ' },
    { label: 'System Info', icon: Cpu, cmd: 'sysinfo' },
    { label: 'Disk Space', icon: HardDrive, cmd: 'df -h' },
    { label: 'Node Version', icon: Terminal, cmd: 'node --version' },
    { label: 'List Files', icon: Terminal, cmd: 'ls -la' },
  ];

  if (!isOpen) return null;

  return (
    <div
      className={`flex flex-col h-full border-l transition-colors ${
        isLight ? 'bg-[#faf8f5] border-[#e6e1d7]' : 'bg-[#1a1917] border-[#38342e]'
      }`}
      style={{ width: 420, minWidth: 320, maxWidth: '50vw' }}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b shrink-0 ${
          isLight ? 'border-[#e6e1d7] bg-[#f4f0e8]' : 'border-[#38342e] bg-[#22201d]'
        }`}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#d97757]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#d97757]">
            Terminal
          </span>
          {cwd && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              isLight ? 'bg-[#e2ddd3] text-[#736e65]' : 'bg-[#38342e] text-[#9e978a]'
            }`}>
              {cwd}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setLines([]); }}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              isLight ? 'text-[#736e65] hover:bg-[#e2ddd3]' : 'text-[#9e978a] hover:bg-[#38342e]'
            }`}
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              isLight ? 'text-[#736e65] hover:bg-[#e2ddd3]' : 'text-[#9e978a] hover:bg-[#38342e]'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* System info bar */}
      {systemInfo && (
        <div className={`flex items-center gap-3 px-3 py-1.5 border-b text-[10px] ${
          isLight ? 'border-[#e6e1d7] text-[#928e83]' : 'border-[#38342e] text-[#7a7468]'
        }`}>
          {systemInfo.nodeVersion && <span>Node {systemInfo.nodeVersion}</span>}
          {systemInfo.npmVersion && <span>npm {systemInfo.npmVersion}</span>}
          {systemInfo.bunVersion && <span>Bun {systemInfo.bunVersion}</span>}
          {systemInfo.pythonVersion && <span>{systemInfo.pythonVersion}</span>}
          <span>{systemInfo.platform} {systemInfo.arch}</span>
        </div>
      )}

      {/* Quick actions */}
      <div className={`flex items-center gap-1 px-3 py-1.5 border-b overflow-x-auto ${
        isLight ? 'border-[#e6e1d7]' : 'border-[#38342e]'
      }`}>
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => setInput(action.cmd)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
              isLight
                ? 'bg-[#e2ddd3] text-[#575249] hover:bg-[#d9d2c6]'
                : 'bg-[#38342e] text-[#b3ac9f] hover:bg-[#443f38]'
            }`}
          >
            <action.icon className="w-3 h-3" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs space-y-1"
      >
        {lines.length === 0 && (
          <div className={`text-center py-8 ${isLight ? 'text-[#b3ac9f]' : 'text-[#575249]'}`}>
            <Terminal className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p className="text-[11px]">Type a command or use quick actions above</p>
            <p className="text-[10px] mt-1 opacity-60">Commands run on your local machine</p>
          </div>
        )}
        {lines.map((line) => (
          <div
            key={line.id}
            className={`whitespace-pre-wrap break-all ${
              line.type === 'command'
                ? 'text-[#d97757] font-bold'
                : line.type === 'error'
                ? isLight ? 'text-red-600' : 'text-red-400'
                : line.type === 'info'
                ? isLight ? 'text-blue-600' : 'text-blue-400'
                : isLight ? 'text-[#575249]' : 'text-[#b3ac9f]'
            }`}
          >
            {line.text}
          </div>
        ))}
        {isRunning && (
          <div className="flex items-center gap-2 text-[#d97757]">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-[11px]">Running...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`flex items-center gap-2 px-3 py-2 border-t ${
        isLight ? 'border-[#e6e1d7]' : 'border-[#38342e]'
      }`}>
        <span className="text-[#d97757] font-mono text-xs font-bold">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRun();
          }}
          placeholder="Enter command..."
          disabled={isRunning}
          className={`flex-1 bg-transparent font-mono text-xs outline-none placeholder:opacity-40 ${
            isLight ? 'text-[#22201d]' : 'text-[#f4f0ea]'
          }`}
        />
        <button
          onClick={handleRun}
          disabled={isRunning || !input.trim()}
          className={`p-1.5 rounded-lg transition-all ${
            isRunning || !input.trim()
              ? 'opacity-40 cursor-not-allowed'
              : 'bg-[#d97757] hover:bg-[#c66545] text-white shadow-md'
          }`}
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
