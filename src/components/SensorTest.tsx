import React, { useState, useEffect } from 'react';
import { Smartphone, Rotate3d, Compass, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from "motion/react";

export function SensorTest() {
  const [orientation, setOrientation] = useState<{ alpha: number; beta: number; gamma: number } | null>(null);
  const [acceleration, setAcceleration] = useState<{ x: number; y: number; z: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'active' | 'error' | 'unsupported'>('idle');
  const [permissionState, setPermissionState] = useState<'idle' | 'requested' | 'denied'>('idle');

  const requestPermission = async () => {
    // Only works on secure contexts and iOS requires explicit request
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          startListening();
        } else {
          setPermissionState('denied');
          setStatus('error');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    } else {
      // Standard browsers
      startListening();
    }
  };

  const startListening = () => {
    window.addEventListener('deviceorientation', (e) => {
      if (e.alpha !== null) {
        setOrientation({
          alpha: e.alpha || 0,
          beta: e.beta || 0,
          gamma: e.gamma || 0
        });
        setStatus('active');
      } else {
        setStatus('unsupported');
      }
    });

    window.addEventListener('devicemotion', (e) => {
        if (e.acceleration) {
            setAcceleration({
                x: e.acceleration.x || 0,
                y: e.acceleration.y || 0,
                z: e.acceleration.z || 0
            });
        }
    });
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', () => {});
      window.removeEventListener('devicemotion', () => {});
    };
  }, []);

  return (
    <Card className="hardware-card border-none overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Rotate3d className="w-5 h-5 text-emerald-500" />
              Sensor Array
            </CardTitle>
            <CardDescription className="mono-label mt-1">
              IMU Telemetry_v4.2
            </CardDescription>
          </div>
          <span className={status === 'active' ? 'emerald-badge' : status === 'unsupported' ? 'rose-badge' : 'mono text-[10px] opacity-40 uppercase'}>
            {status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-40 bg-black/40 rounded border border-dashed border-white/10 flex items-center justify-center overflow-hidden p-6 relative">
          {status === 'active' && orientation ? (
            <div className="w-full space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                   <span className="mono text-[10px] opacity-50 uppercase">Accelerometer</span>
                   <span className="emerald-badge">Active</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                   <span className="mono text-[10px] opacity-50 uppercase">Gyroscope</span>
                   <span className="emerald-badge">Active</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <span className="mono-label text-[7px] text-white/40">Pitch</span>
                    <p className="text-sm font-mono text-white">{orientation.beta.toFixed(1)}°</p>
                  </div>
                  <div className="space-y-1">
                    <span className="mono-label text-[7px] text-white/40">Roll</span>
                    <p className="text-sm font-mono text-white">{orientation.gamma.toFixed(1)}°</p>
                  </div>
                  <div className="space-y-1">
                    <span className="mono-label text-[7px] text-white/40">Yaw</span>
                    <p className="text-sm font-mono text-white">{orientation.alpha.toFixed(1)}°</p>
                  </div>
                </div>
                
                <div className="h-[1px] bg-white/10 w-full relative">
                   <motion.div 
                      className="absolute top-0 h-[3px] -mt-[1px] bg-emerald-500 shadow-[0_0_8px_#10B981]"
                      style={{ left: '50%', width: '2px', x: `${(orientation.gamma / 90) * 50}%` }}
                   />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
               <Rotate3d className="w-8 h-8 text-white/5 mx-auto" />
               <p className="text-[10px] uppercase font-mono text-white/20 tracking-widest">Awaiting Movement</p>
            </div>
          )}
        </div>

        <Button 
          onClick={requestPermission} 
          disabled={status === 'active'}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg shadow-[0_10px_30px_rgba(16,185,129,0.1)]"
        >
          {status === 'active' ? 'Receiving Telemetry' : 'Initiate IMU Pulse'}
        </Button>
      </CardContent>
    </Card>
  );
}
