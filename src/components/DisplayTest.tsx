import React, { useState } from 'react';
import { Monitor, Square, CheckCircle2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const COLORS = ['#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000'];

export function DisplayTest() {
  const [currentColorIdx, setCurrentColorIdx] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);

  const nextColor = () => {
    setCurrentColorIdx((prev) => (prev + 1) % COLORS.length);
  };

  return (
    <Card className="hardware-card border-none overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Monitor className="w-5 h-5 text-emerald-500" />
              Luminance Matrix
            </CardTitle>
            <CardDescription className="mono-label mt-1">
              Chromatic Verification_v1
            </CardDescription>
          </div>
          <span className="emerald-badge">Standby</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="flex-1 min-h-[140px] bg-black/40 rounded border border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden p-6 relative">
           <div className="grid grid-cols-4 gap-2 w-full">
              {COLORS.map((c, i) => (
                <div 
                    key={i} 
                    className="aspect-square rounded border border-white/10"
                    style={{ backgroundColor: c }}
                />
              ))}
           </div>
           <p className="mt-4 text-[9px] uppercase font-mono text-white/30 text-center max-w-[200px] tracking-widest">
             Check for spectral uniformity and pixel burnout.
           </p>
        </div>

        <Dialog>
          <DialogTrigger
            render={
              <Button 
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg shadow-[0_10px_30px_rgba(16,185,129,0.1)]"
              >
                Start Diagnostic Shift
              </Button>
            }
          />
          <DialogContent className="max-w-[100vw] w-screen h-screen p-0 border-none bg-black rounded-none">
            <div 
               className="w-full h-full cursor-pointer flex items-center justify-center relative"
               style={{ backgroundColor: COLORS[currentColorIdx] }}
               onClick={nextColor}
            >
               <div className="absolute bottom-10 left-1/2 -translate-x-1/2 glass border border-white/10 px-6 py-3 rounded-full text-white font-mono text-[10px] uppercase tracking-widest flex items-center gap-4">
                  <span className="text-emerald-500 font-bold">MODE: {COLORS[currentColorIdx]}</span>
                  <span className="opacity-40">Tap Screen to Cycle</span>
               </div>
               
               <div className="absolute top-10 right-10">
                 <Button 
                    variant="outline" 
                    className="bg-black/50 text-white border-white/10 text-[9px] font-mono h-8 uppercase tracking-widest"
                    onClick={(e) => e.stopPropagation()}
                 >
                    Press ESC to Abort
                 </Button>
               </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
