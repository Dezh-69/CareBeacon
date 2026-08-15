import { Battery, Wifi, Radio, Activity, Clock, MapPin, Cpu, Signal, Zap } from 'lucide-react';

interface DeviceStatusProps {
  deviceData: {
    status: string;
    battery: number;
    lastUpdate: string;
    location: {
      lat: number;
      lng: number;
      address: string;
    };
  };
}

export function DeviceStatus({ deviceData }: DeviceStatusProps) {
  const getBatteryColor = (level: number) => {
    if (level > 50) return 'emerald';
    if (level > 20) return 'amber';
    return 'red';
  };
  
  const batteryColor = getBatteryColor(deviceData.battery);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">System Diagnostics</h2>
        <p className="text-sm text-slate-400">Real-time hardware monitoring</p>
      </div>
      
      {/* Primary Status Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-emerald-500/30 transition">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-slate-400 mb-2">Network Status</p>
                <p className="text-3xl font-bold capitalize">{deviceData.status}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Wifi className="size-8 text-emerald-400" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
              <Clock className="size-4 text-slate-400" />
              <span className="text-xs text-slate-400">
                Last seen: {new Date(deviceData.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">Signal Strength</span>
              <div className="flex gap-1 items-end h-5">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`w-1 rounded-full ${
                      bar <= 4 ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    style={{ height: `${bar * 3 + 2}px` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Battery Status */}
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-br from-${batteryColor}-500/10 to-${batteryColor}-600/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition`}></div>
          <div className={`relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-${batteryColor}-500/30 transition`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-slate-400 mb-2">Battery Level</p>
                <p className="text-3xl font-bold">{Math.round(deviceData.battery)}%</p>
              </div>
              <div className={`p-3 bg-${batteryColor}-500/10 rounded-xl`}>
                <Battery className={`size-8 text-${batteryColor}-400`} />
              </div>
            </div>
            
            {/* Battery Bar */}
            <div className="relative w-full h-3 bg-slate-800/50 rounded-full overflow-hidden">
              <div 
                className={`absolute inset-y-0 left-0 bg-gradient-to-r from-${batteryColor}-600 to-${batteryColor}-400 rounded-full transition-all duration-500`}
                style={{ width: `${deviceData.battery}%` }}
              ></div>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">Estimated Runtime</span>
              <span className={`font-medium text-${batteryColor}-400`}>
                {Math.round(deviceData.battery / 10)} hours
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Technical Information Grid */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl blur-2xl"></div>
        
        <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6">Technical Details</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Cpu className="size-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">Device ID</p>
                <p className="font-mono text-sm font-semibold">ESP32-FD-001</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <Signal className="size-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">Network Type</p>
                <p className="text-sm font-semibold">GSM/GPRS</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                <Radio className="size-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">Signal Strength</p>
                <p className="text-sm font-semibold text-emerald-400">Strong (4/5)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="p-2.5 bg-indigo-500/10 rounded-lg">
                <MapPin className="size-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">GPS Status</p>
                <p className="text-sm font-semibold text-emerald-400">Active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <Zap className="size-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">Firmware Version</p>
                <p className="font-mono text-sm font-semibold">v1.2.0</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="p-2.5 bg-pink-500/10 rounded-lg">
                <Clock className="size-5 text-pink-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">System Uptime</p>
                <p className="text-sm font-semibold">12h 34m</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sensor Status */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl blur-2xl"></div>
        
        <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6">Hardware Components</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'MPU6050 Accelerometer', desc: 'Motion detection operational', status: 'active' },
              { name: 'NEO-6M GPS Module', desc: 'Location tracking operational', status: 'active' },
              { name: 'SIM800L GSM Module', desc: 'Communication operational', status: 'active' },
              { name: 'Audio System', desc: 'Two-way audio ready', status: 'active' },
            ].map((sensor, index) => (
              <div key={index} className="relative group/item">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition"></div>
                <div className="relative p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl hover:border-emerald-500/30 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium mb-1">{sensor.name}</p>
                      <p className="text-xs text-slate-400">{sensor.desc}</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium">
                      Active
                    </span>
                  </div>
                  
                  {/* Status indicator bar */}
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}