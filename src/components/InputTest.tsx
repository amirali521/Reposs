import React, { useState, useEffect } from 'react';
import { Keyboard, MousePointer2, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';

export function InputTest() {
  const [lastKey, setLastKey] = useState<{ key: string; code: string; timestamp: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      setLastKey({ key: e.key, code: e.code, timestamp: Date.now() });
    };

    const handleMouse = (e: MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMousePos({
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top)
      });
    };

    const handleClick = () => setClicks(prev => prev + 1);

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <Card className="hardware-card border-none overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Keyboard className="w-5 h-5 text-emerald-500" />
              I/O Peripherals
            </CardTitle>
            <CardDescription className="mono-label mt-1">
              HID Interface Audit
            </CardDescription>
          </div>
          <span className="emerald-badge">Listening</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-40 bg-black/40 rounded border border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden p-6 relative gap-4">
           {/* Keyboard Display */}
           <div className="w-full flex-1 border border-white/5 rounded p-3 flex items-center justify-center relative">
              <span className="absolute top-1 left-2 mono-label text-[7px] text-white/20 uppercase tracking-widest">Keyboard Trace</span>
              <AnimatePresence mode="wait">
                {lastKey ? (
                  <motion.div 
                    key={lastKey.timestamp}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="text-center"
                  >
                    <p className="text-2xl font-light font-mono text-emerald-500">{lastKey.key === ' ' ? 'SPACE' : lastKey.key}</p>
                    <p className="mono-label text-[8px] opacity-40">{lastKey.code}</p>
                  </motion.div>
                ) : (
                  <p className="text-[10px] uppercase font-mono text-white/20 tracking-widest">Engage Keypress</p>
                )}
              </AnimatePresence>
           </div>

           {/* Mouse / Click Info */}
           <div 
             className="w-full flex-1 border border-white/5 rounded p-3 flex items-center justify-center relative cursor-crosshair group"
             onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMousePos({ x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) });
             }}
             onClick={() => setClicks(prev => prev + 1)}
           >
              <span className="absolute top-1 left-2 mono-label text-[7px] text-white/20 uppercase tracking-widest">HIDs Diagnostics</span>
              <div className="grid grid-cols-2 gap-4 w-full text-center">
                 <div>
                    <p className="mono-label text-[7px] opacity-40 uppercase">X:Y Params</p>
                    <p className="text-xs font-mono text-white leading-none">{mousePos.x} : {mousePos.y}</p>
                 </div>
                 <div>
                    <p className="mono-label text-[7px] opacity-40 uppercase">Click Events</p>
                    <p className="text-xs font-mono text-white leading-none">{clicks}</p>
                 </div>
              </div>
           </div>
        </div>

        <Button 
          onClick={() => { setLastKey(null); setClicks(0); }} 
          variant="outline" 
          className="w-full border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg"
        >
          Purge Event Logs
        </Button>
      </CardContent>
    </Card>
  );
}
