import { useState, useEffect } from 'react';
import { Battery, Wifi, Radio, Activity, Clock, MapPin, Cpu, Signal, Zap } from 'lucide-react';
import { db, ref, onValue } from '../../lib/db';
import { SkeletonCard } from './ui/Skeleton';

interface DeviceStatusProps {
  deviceId: string;
}

export function DeviceStatus({ deviceId }: DeviceStatusProps) {
  const [deviceData, setDeviceData] = useState<any>(null);

  useEffect(() => {
    const deviceRef = ref(db, `devices/${deviceId}`);
    const unsubscribe = onValue(deviceRef, (snapshot) => {
      setDeviceData(snapshot.val());
    });
    return () => unsubscribe();
  }, [deviceId]);

  if (!deviceData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-foreground">System Diagnostics</h2>
          <p className="text-sm text-muted-foreground">Real-time hardware monitoring</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }
  const getBatteryColor = (level: number) => {
    if (level > 50) return 'emerald';
    if (level > 20) return 'amber';
    return 'red';
  };
  
  const batteryColor = getBatteryColor(deviceData.battery);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1 text-foreground">System Diagnostics</h2>
        <p className="text-sm text-muted-foreground">Real-time hardware monitoring</p>
      </div>
      
      {/* Primary Status Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Network Status</p>
              <p className="text-3xl font-bold capitalize text-foreground">{deviceData.status}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <Wifi className="size-8 text-success" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-4 border-t border-border">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Last seen: {new Date(deviceData.lastUpdate).toLocaleTimeString()}
            </span>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Signal Strength</span>
            <div className="flex gap-1 items-end h-5">
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  className={`w-1 rounded-full ${
                    bar <= 4 ? 'bg-success' : 'bg-muted'
                  }`}
                  style={{ height: `${bar * 3 + 2}px` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Battery Status */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Battery Level</p>
              <p className="text-3xl font-bold text-foreground">{Math.round(deviceData.battery)}%</p>
            </div>
            <div className={`p-3 rounded-xl ${
              batteryColor === 'emerald' ? 'bg-success/10 text-success' :
              batteryColor === 'amber' ? 'bg-warning/10 text-warning' :
              'bg-destructive/10 text-destructive'
            }`}>
              <Battery className="size-8" />
            </div>
          </div>
          
          {/* Battery Bar */}
          <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                batteryColor === 'emerald' ? 'bg-success' :
                batteryColor === 'amber' ? 'bg-warning' :
                'bg-destructive'
              }`}
              style={{ width: `${deviceData.battery}%` }}
            ></div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Estimated Runtime</span>
            <span className={`font-medium ${
              batteryColor === 'emerald' ? 'text-success' :
              batteryColor === 'amber' ? 'text-warning' :
              'text-destructive'
            }`}>
              {Math.round(deviceData.battery / 10)} hours
            </span>
          </div>
        </div>
      </div>
      
      {/* Technical Information Grid */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6 text-foreground">Technical Details</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-muted border border-border rounded-xl">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Cpu className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Device ID</p>
              <p className="font-mono text-sm font-semibold text-foreground">ESP32-FD-001</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-muted border border-border rounded-xl">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Signal className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Network Type</p>
              <p className="text-sm font-semibold text-foreground">GSM/GPRS</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-muted border border-border rounded-xl">
            <div className="p-2.5 bg-success/10 rounded-lg">
              <Radio className="size-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Signal Strength</p>
              <p className="text-sm font-semibold text-success">Strong (4/5)</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-muted border border-border rounded-xl">
            <div className="p-2.5 bg-success/10 rounded-lg">
              <MapPin className="size-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">GPS Status</p>
              <p className="text-sm font-semibold text-success">Active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-muted border border-border rounded-xl">
            <div className="p-2.5 bg-warning/10 rounded-lg">
              <Zap className="size-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Firmware Version</p>
              <p className="font-mono text-sm font-semibold text-foreground">v1.2.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-muted border border-border rounded-xl">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Clock className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">System Uptime</p>
              <p className="text-sm font-semibold text-foreground">12h 34m</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sensor Status */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6 text-foreground">Hardware Components</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: 'MPU6050 Accelerometer', desc: 'Motion detection operational', status: 'active' },
            { name: 'NEO-6M GPS Module', desc: 'Location tracking operational', status: 'active' },
            { name: 'SIM800L GSM Module', desc: 'Communication operational', status: 'active' },
            { name: 'Audio System', desc: 'Two-way audio ready', status: 'active' },
          ].map((sensor, index) => (
            <div key={index} className="relative group/item">
              <div className="relative p-4 bg-muted border border-border rounded-xl hover:border-success/30 transition shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-medium mb-1 text-foreground">{sensor.name}</p>
                    <p className="text-xs text-muted-foreground">{sensor.desc}</p>
                  </div>
                  <span className="px-2 py-1 bg-success/10 text-success border border-success/20 rounded-lg text-xs font-medium">
                    Active
                  </span>
                </div>
                
                {/* Status indicator bar */}
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full w-full bg-success rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}