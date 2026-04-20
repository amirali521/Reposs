import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Ruler, Maximize, Target, Info, RefreshCw } from 'lucide-react';
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export function LevelTest() {
  const [orientation, setOrientation] = useState<{ pitch: number; roll: number }>({ pitch: 0, roll: 0 });
  const [status, setStatus] = useState<'idle' | 'active' | 'unsupported'>('idle');
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [offset, setOffset] = useState({ pitch: 0, roll: 0 });

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        setOrientation({
          pitch: e.beta - offset.pitch,
          roll: e.gamma - offset.roll
        });
        setStatus('active');
      } else {
        setStatus('unsupported');
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [offset]);

  const calibrate = () => {
    // Current values become the new zero
    setOffset({
      pitch: orientation.pitch + offset.pitch,
      roll: orientation.roll + offset.roll
    });
    setIsCalibrated(true);
    setTimeout(() => setIsCalibrated(false), 2000);
  };

  const isLevel = Math.abs(orientation.pitch) < 0.5 && Math.abs(orientation.roll) < 0.5;

  return (
    <Card className="hardware-card border-none overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-3 text-white">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Ruler className="w-5 h-5 text-emerald-500" />
              </div>
              Surface Level (IMU)
            </CardTitle>
            <CardDescription className="mono-label mt-1 text-[10px] opacity-50 tracking-widest uppercase">
              Inclinometer_Axial_Audit
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className={cn(
               "emerald-badge",
               status === 'unsupported' && "rose-badge",
               isLevel && "animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.3)]"
             )}>
                {isLevel ? "Zero Point Reached" : "Engaged"}
             </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main 2D Bullseye Level */}
          <div className="bg-black/30 p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-h-[280px] relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/50" />
                <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/50" />
             </div>

             <div className="relative w-48 h-48 rounded-full border border-white/10 flex items-center justify-center">
                {/* Visual Rings */}
                <div className="absolute w-32 h-32 rounded-full border border-white/5" />
                <div className="absolute w-16 h-16 rounded-full border border-emerald-500/10" />
                
                {/* The Bubble */}
                <motion.div 
                  className={cn(
                    "w-8 h-8 rounded-full shadow-lg z-20 transition-colors duration-300",
                    isLevel ? "bg-emerald-500 shadow-emerald-500/40" : "bg-white/90"
                  )}
                  animate={{
                    x: Math.max(Math.min(orientation.roll * 2, 80), -80),
                    y: Math.max(Math.min(orientation.pitch * 2, 80), -80),
                  }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                >
                   <div className="absolute top-1 left-2 w-2 h-2 bg-white/50 rounded-full blur-[1px]" />
                </motion.div>

                <Target className="w-6 h-6 text-white/5 absolute z-10" />
             </div>

             <div className="mt-6 flex gap-8">
                <div className="text-center">
                   <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Pitch (X)</p>
                   <p className={cn("text-xl font-mono tabular-nums", isLevel ? "text-emerald-400" : "text-white")}>
                     {orientation.pitch.toFixed(1)}°
                   </p>
                </div>
                <div className="text-center">
                   <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Roll (Y)</p>
                   <p className={cn("text-xl font-mono tabular-nums", isLevel ? "text-emerald-400" : "text-white")}>
                     {orientation.roll.toFixed(1)}°
                   </p>
                </div>
             </div>
          </div>

          {/* Vertical & Horizontal Bars */}
          <div className="space-y-4">
             {/* Horizontal Bar */}
             <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Maximize className="w-3 h-3 rotate-90" /> Horizontal Bias
                   </span>
                   {Math.abs(orientation.roll) < 1 && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />}
                </div>
                <div className="h-6 bg-white/5 rounded-full border border-white/5 relative flex items-center overflow-hidden px-1">
                   <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/20 z-0" />
                   <motion.div 
                     className={cn(
                       "h-4 w-12 rounded-full absolute",
                       Math.abs(orientation.roll) < 1 ? "bg-emerald-500" : "bg-white/40"
                     )}
                     animate={{
                       left: `calc(50% + ${Math.max(Math.min(orientation.roll * 3, 40), -40)}%)`,
                       translateX: '-50%'
                     }}
                   />
                </div>
             </div>

             {/* Vertical Bar */}
             <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Maximize className="w-3 h-3" /> Vertical Bias
                   </span>
                   {Math.abs(orientation.pitch) < 1 && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />}
                </div>
                <div className="h-6 bg-white/5 rounded-full border border-white/5 relative flex items-center overflow-hidden px-1">
                   <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/20 z-0" />
                   <motion.div 
                     className={cn(
                       "h-4 w-12 rounded-full absolute",
                       Math.abs(orientation.pitch) < 1 ? "bg-emerald-500" : "bg-white/40"
                     )}
                     animate={{
                       left: `calc(50% + ${Math.max(Math.min(orientation.pitch * 3, 40), -40)}%)`,
                       translateX: '-50%'
                     }}
                   />
                </div>
             </div>

             {/* Calibration Trigger */}
             <button
               onClick={calibrate}
               className="w-full bg-[#151619] border border-white/5 hover:border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between group transition-all"
             >
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/5 rounded-lg group-hover:bg-emerald-500/10">
                      <RefreshCw className={cn("w-4 h-4 transition-transform duration-500", isCalibrated ? "rotate-180 text-emerald-500" : "text-white/40")} />
                   </div>
                   <div className="text-left leading-tight">
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider">Null Plane Correction</p>
                      <p className="text-[8px] font-mono text-white/20 uppercase">Calibrate current surface as 0.0°</p>
                   </div>
                </div>
                <Info className="w-4 h-4 text-white/10" />
             </button>
          </div>
        </div>

        {status === 'unsupported' && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3">
             <Info className="w-5 h-5 text-rose-500" />
             <p className="text-xs text-rose-400 font-mono">CRITICAL: IMU Hardware not detected or permissions blocked. Please check System Settings.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
