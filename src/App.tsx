/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CameraTest } from './components/CameraTest';
import { MicrophoneTest } from './components/MicrophoneTest';
import { LocationTest } from './components/LocationTest';
import { InputTest } from './components/InputTest';
import { DisplayTest } from './components/DisplayTest';
import { SystemInfo } from './components/SystemInfo';
import { StorageTest } from './components/StorageTest';
import { FPSTest } from './components/FPSTest';
import { GamingGyro } from './components/GamingGyro';
import { LevelTest } from './components/LevelTest';
import { SpeedTest } from './components/SpeedTest';
import { SpeakerTest } from './components/SpeakerTest';
import { 
  ShieldCheck, Cpu, HardDrive, Activity, 
  LayoutDashboard, Zap, Camera, Mic2, 
  Rotate3d, Database, MapPin, Keyboard, 
  Monitor, Info, Menu, X, Compass as CompassIcon,
  Wifi, Volume2, Ruler
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: 'overview', label: 'System Overview', icon: LayoutDashboard, component: SystemInfo },
  { id: 'fps', label: 'Frame frequency (FPS)', icon: Zap, component: FPSTest },
  { id: 'network', label: 'Network Bandwidth', icon: Wifi, component: SpeedTest },
  { id: 'camera', label: 'Vision Sensor', icon: Camera, component: CameraTest },
  { id: 'audio', label: 'Audio Input', icon: Mic2, component: MicrophoneTest },
  { id: 'speaker', label: 'Acoustic Output', icon: Volume2, component: SpeakerTest },
  { id: 'gyro', label: 'Motion IMU', icon: Rotate3d, component: GamingGyro },
  { id: 'level', label: 'Surface Level', icon: Ruler, component: LevelTest },
  { id: 'storage', label: 'Disk Volume', icon: Database, component: StorageTest },
  { id: 'location', label: 'Geolocation', icon: MapPin, component: LocationTest },
  { id: 'input', label: 'Haptic/Input', icon: Keyboard, component: InputTest },
  { id: 'display', label: 'Luminance Matrix', icon: Monitor, component: DisplayTest },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sysStats, setSysStats] = useState({ os: 'Generic', ram: '8GB' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    let detectedOS = 'WebOS';
    if (/Android/i.test(ua)) detectedOS = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) detectedOS = 'iOS';
    else if (ua.indexOf("Win") !== -1) detectedOS = "Windows";
    else if (ua.indexOf("Mac") !== -1) detectedOS = "MacOS";

    // @ts-ignore
    const ram = navigator.deviceMemory ? `${navigator.deviceMemory}GB` : '4GB+';
    setSysStats({ os: detectedOS, ram });
  }, []);

  const ActiveComponent = NAV_ITEMS.find(item => item.id === activeTab)?.component || SystemInfo;

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-slate-300 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#0B0C0E] border-r border-white/5 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-8 border-b border-white/5 bg-[#0B0C0E]/50">
           <span className="text-[10px] tracking-[0.3em] uppercase text-emerald-500 font-bold mb-1 block">Diagnostics</span>
           <h1 className="text-xl font-light tracking-tight text-white flex items-center gap-2">
             SYSPROBE <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-400 align-middle">v2.6</span>
           </h1>
        </div>

        <ScrollArea className="flex-1 p-4">
           <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all group",
                    activeTab === item.id 
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                      : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                   <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-emerald-500" : "group-hover:text-white")} />
                   <span className="font-medium tracking-tight">{item.label}</span>
                   {activeTab === item.id && (
                     <motion.div layoutId="active-nav" className="ml-auto w-1 h-1 bg-emerald-500 rounded-full" />
                   )}
                </button>
              ))}
           </nav>
        </ScrollArea>

        <div className="p-6 border-t border-white/5 space-y-4">
           <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="leading-tight">
                 <p className="text-[10px] font-mono text-white/40 uppercase">Trust State</p>
                 <p className="text-[10px] font-bold text-white uppercase tabular-nums tracking-wider">Verified</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0B0C0E]/50 backdrop-blur-md sticky top-0 z-40">
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-white"
           >
              <Menu className="w-5 h-5" />
           </button>

           <div className="flex items-center gap-6 overflow-hidden">
              <div className="hidden sm:flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold">Terminal Active</span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <Cpu className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-mono text-white/60 uppercase">{sysStats.os}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <HardDrive className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-mono text-white/60 uppercase">{sysStats.ram} POOL</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <span className="text-[9px] font-mono opacity-20 hidden md:block">AUDIT_LOG: 882-AX</span>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-grid-white/[0.02]">
           <div className="max-w-4xl mx-auto space-y-8">
              <AnimatePresence mode="wait">
                 <motion.div
                   key={activeTab}
                   initial={{ opacity: 0, y: 10, scale: 0.98 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: -10, scale: 0.98 }}
                   transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                 >
                    <ActiveComponent />
                 </motion.div>
              </AnimatePresence>

              {/* Quick Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <section className="bg-[#151619] rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                       <span className="text-[9px] font-mono uppercase text-white/40 tracking-widest">Trace Diagnostics</span>
                       <Activity className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="p-6 space-y-4 font-mono text-[10px]">
                       <div className="flex justify-between items-end border-b border-white/5 pb-2">
                          <span className="text-white/30 uppercase italic">Kernel Boot</span>
                          <span className="text-emerald-500 tracking-wider">04:12:08:55</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-white/5 pb-2">
                          <span className="text-white/30 uppercase italic">Latency Delta</span>
                          <span className="text-white text-xs">0.42ms</span>
                       </div>
                       <div className="flex justify-between items-end">
                          <span className="text-white/30 uppercase italic">Security Hash</span>
                          <span className="text-white truncate max-w-[120px]">D982F-X09</span>
                       </div>
                    </div>
                 </section>

                 <div className="bg-emerald-500 p-8 rounded-xl text-black flex flex-col justify-between shadow-[0_20px_50px_rgba(16,185,129,0.1)] group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10">
                      <h2 className="text-xl font-bold leading-none tracking-tight">System Sweep</h2>
                      <p className="text-[9px] font-medium opacity-60 mt-2 uppercase tracking-widest font-mono">Execute all subroutines</p>
                    </div>
                    <button className="relative z-10 w-full bg-black text-white py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all active:scale-[0.98] mt-4">
                      Bootstrap Diag
                    </button>
                 </div>
              </div>
           </div>
        </main>
      </div>

      <Toaster position="bottom-right" theme="dark" />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
