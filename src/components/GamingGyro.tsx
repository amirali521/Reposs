import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rotate3d, Target, Zap, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

export function GamingGyro() {
  const [rotation, setRotation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [latency, setLatency] = useState(0);
  const [precision, setPrecision] = useState(0);
  const [status, setStatus] = useState<'idle' | 'active' | 'unsupported'>('idle');
  const lastUpdate = useRef(performance.now());
  const readings = useRef<number[]>([]);

  const handleMotion = (event: DeviceOrientationEvent) => {
    const now = performance.now();
    const dt = now - lastUpdate.current;
    
    // Calculate "response latency" (approximate jitter/dt)
    readings.current = [...readings.current.slice(-19), dt];
    const avgDt = readings.current.reduce((a, b) => a + b, 0) / readings.current.length;
    setLatency(Math.round(avgDt));
    
    // Calculate stability (variance in readings)
    const variance = readings.current.map(x => Math.pow(x - avgDt, 2)).reduce((a,b) => a+b, 0) / readings.current.length;
    setPrecision(Math.max(0, 100 - (variance * 10)));

    setRotation({
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0
    });
    lastUpdate.current = now;
  };

  const startTest = async () => {
    // @ts-ignore - iOS requirement
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleMotion);
          setStatus('active');
        }
      } catch (e) {
        setStatus('unsupported');
      }
    } else if ('ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleMotion);
      setStatus('active');
    } else {
      setStatus('unsupported');
    }
  };

  useEffect(() => {
    return () => window.removeEventListener('deviceorientation', handleMotion);
  }, []);

  return (
    <Card className="hardware-card border-none overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Rotate3d className="w-5 h-5 text-emerald-500" />
              High-Perf Gyro
            </CardTitle>
            <CardDescription className="mono-label mt-1">
              Gaming_Response_Probe
            </CardDescription>
          </div>
          <span className={status === 'active' ? 'emerald-badge' : 'rose-badge'}>{status}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="bg-black/40 rounded border border-dashed border-white/10 p-5 space-y-6 relative overflow-hidden">
          {/* Target Reticle Graphic */}
          <div className="aspect-square w-32 mx-auto relative flex items-center justify-center border border-white/5 rounded-full overflow-hidden">
             <div className="absolute inset-0 border border-emerald-500/10 rounded-full scale-75" />
             <Target className="w-8 h-8 text-white/5 absolute" />
             
             {/* Virtual Horizon / Crosshair */}
             <motion.div 
                className="w-20 h-[1px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10"
                animate={{ rotate: rotation.gamma, y: -rotation.beta / 2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
             />
             <motion.div 
                className="h-20 w-[1px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10 absolute"
                animate={{ x: rotation.gamma / 2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
             />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
             <div className="space-y-1">
                <div className="flex justify-between items-end">
                   <span className="mono-label text-[7px] text-white/30 uppercase">Response</span>
                   <span className="text-[10px] font-mono text-emerald-400">{latency}ms</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div className="h-full bg-emerald-500" animate={{ width: `${Math.min(100, (1000/latency)*10)}%` }} />
                </div>
             </div>
             <div className="space-y-1">
                <div className="flex justify-between items-end">
                   <span className="mono-label text-[7px] text-white/30 uppercase">Precision</span>
                   <span className="text-[10px] font-mono text-emerald-400">{Math.round(precision)}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div className="h-full bg-emerald-500" animate={{ width: `${precision}%` }} />
                </div>
             </div>
          </div>
          
          <div className="flex justify-around text-center pt-2">
             {['α', 'β', 'γ'].map((axis, i) => (
                <div key={axis}>
                   <p className="text-[8px] font-mono text-white/20 uppercase">Axis {axis}</p>
                   <p className="text-xs font-mono text-white">
                      {Math.round([rotation.alpha, rotation.beta, rotation.gamma][i])}°
                   </p>
                </div>
             ))}
          </div>
        </div>

        <Button 
          onClick={startTest} 
          disabled={status === 'active'}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg"
        >
          {status === 'active' ? 'Telemetry Engaged' : 'Sync IMU Sensors'}
        </Button>
      </CardContent>
    </Card>
  );
}
