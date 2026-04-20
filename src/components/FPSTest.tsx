import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Activity, Gauge, Zap } from 'lucide-react';
import { motion } from "motion/react";

export function FPSTest() {
  const [fps, setFps] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [maxSupported, setMaxSupported] = useState(0);
  const [stableFps, setStableFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const requestRef = useRef<number>(0);

  const animate = (time: number) => {
    frameCount.current++;
    if (time >= lastTime.current + 1000) {
      const currentFps = Math.round((frameCount.current * 1000) / (time - lastTime.current));
      setFps(currentFps);
      
      setHistory(prev => {
        const next = [...prev.slice(-29), currentFps];
        // Calculate stable FPS - average of history
        const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
        setStableFps(avg);
        return next;
      });

      // Track peak
      setMaxSupported(prev => Math.max(prev, currentFps));
      
      frameCount.current = 0;
      lastTime.current = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const displayMax = Math.max(...history, 60);

  return (
    <Card className="hardware-card border-none overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-emerald-500" />
              Frame Frequency (FPS)
            </CardTitle>
            <CardDescription className="mono-label mt-1">
              GPU_Render_Pipeline_Vsync
            </CardDescription>
          </div>
          <span className="emerald-badge">Monitoring</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="bg-black/40 rounded border border-dashed border-white/10 p-5 space-y-6">
          <div className="text-center space-y-1">
             <h3 className="text-5xl font-light tracking-tighter text-white tabular-nums">
               {fps} <span className="text-sm font-mono text-emerald-500 align-top mt-2 inline-block">FPS</span>
             </h3>
             <p className="text-[10px] uppercase font-mono text-white/20 tracking-[0.3em]">Frame Timing Synchronized</p>
          </div>

          <div className="h-16 w-full flex items-end gap-[2px]">
             {history.map((val, i) => (
               <motion.div 
                 key={i}
                 initial={{ height: 0 }}
                 animate={{ height: `${(val / displayMax) * 100}%` }}
                 className="bg-emerald-500/30 w-full rounded-t-[1px] border-t border-emerald-500/50"
                 transition={{ duration: 0.1 }}
               />
             ))}
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-t border-white/5 pt-4">
             <div>
                <p className="mono-label text-[7px] text-white/30 uppercase tracking-widest">Max Hardware Limit</p>
                <p className="text-sm font-mono text-white">{maxSupported || '--'} Hz</p>
             </div>
             <div className="text-right">
                <p className="mono-label text-[7px] text-white/30 uppercase tracking-widest">Stable Consistency</p>
                <p className="text-sm font-mono text-emerald-400">{stableFps || '--'} FPS</p>
             </div>
             <div>
                <p className="mono-label text-[7px] text-white/30 uppercase tracking-widest">Frame Latency</p>
                <p className="text-xs font-mono text-white">{(1000/fps || 0).toFixed(2)} ms</p>
             </div>
             <div className="text-right">
                <p className="mono-label text-[7px] text-white/30 uppercase tracking-widest">Render Jitter</p>
                <p className="text-xs font-mono text-amber-500">{(stableFps ? Math.abs(fps - stableFps) : 0).toFixed(1)} Δ</p>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
