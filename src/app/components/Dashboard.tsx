import { useState, useEffect } from 'react';
import { MapPin, Activity, Bell, LogOut, User, Phone, AlertTriangle, CheckCircle, Battery, Wifi, TrendingUp } from 'lucide-react';
import { LocationMap } from './LocationMap';
import { FallHistory } from './FallHistory';
import { DeviceStatus } from './DeviceStatus';
import { EmergencyContacts } from './EmergencyContacts';
import { db, ref, onValue, update, push, set } from '../../lib/db';

interface DashboardProps {
  onLogout: () => void;
}

type TabType = 'map' | 'history' | 'device' | 'contacts';

const fallbackDeviceData = {
  status: 'offline',
  battery: 0,
  lastUpdate: new Date().toISOString(),
  location: {
    lat: 14.6042,
    lng: 120.9822,
    address: 'Unknown',
  },
  user: {
    name: 'Unknown User',
    age: 0,
  },
};

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [deviceData, setDeviceData] = useState<any>(fallbackDeviceData);
  const [hasAlert, setHasAlert] = useState(false);
  const [incidentsCount, setIncidentsCount] = useState(0);
  
  const deviceId = "device_001"; // Generic device ID for demo
  
  useEffect(() => {
    const deviceRef = ref(db, `devices/${deviceId}`);
    const unsubscribeDevice = onValue(deviceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeviceData((prev: any) => ({ ...prev, ...data }));
        if (data.status === 'FALL_DETECTED') {
          setHasAlert(true);
        } else {
          setHasAlert(false);
        }
      }
    });

    const eventsRef = ref(db, `events/${deviceId}`);
    const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const events = snapshot.val();
        setIncidentsCount(Object.keys(events).length);
      }
    });
    
    return () => {
      unsubscribeDevice();
      unsubscribeEvents();
    };
  }, []);
  
  const handleConfirmAlert = async () => {
    try {
      const deviceRef = ref(db, `devices/${deviceId}`);
      await update(deviceRef, { status: 'CONFIRMED_FALL' });
      // The ESP32 listens to this or we log this, stopping SMS spam
    } catch (err) {
      console.error("Failed to confirm alert:", err);
    }
  };
  
  const simulateFall = () => {
    const deviceRef = ref(db, `devices/${deviceId}`);
    update(deviceRef, { status: 'FALL_DETECTED', lastUpdate: new Date().toISOString() });
    
    const eventsRef = ref(db, `events/${deviceId}`);
    const newEventRef = push(eventsRef);
    set(newEventRef, {
      timestamp: new Date().toISOString(),
      status: 'pending',
      location: deviceData.location?.address || 'Unknown'
    });
  };
  
  const simulateSOS = () => {
    const deviceRef = ref(db, `devices/${deviceId}`);
    update(deviceRef, { status: 'SOS_MANUAL', lastUpdate: new Date().toISOString() });
    
    const eventsRef = ref(db, `events/${deviceId}`);
    const newEventRef = push(eventsRef);
    set(newEventRef, {
      timestamp: new Date().toISOString(),
      status: 'emergency',
      location: deviceData.location?.address || 'Unknown'
    });
  };
  
  const simulateBatteryDrop = () => {
    const deviceRef = ref(db, `devices/${deviceId}`);
    update(deviceRef, { battery: Math.max(0, deviceData.battery - 10) });
  };
  
  const resetStatus = () => {
    const deviceRef = ref(db, `devices/${deviceId}`);
    update(deviceRef, { status: 'online' });
  };
  
  const isDemo = import.meta.env.VITE_FIREBASE_API_KEY === "AIzaSyDummyKeyForDemoPurposesOnly123456" || !import.meta.env.VITE_FIREBASE_API_KEY;
  
  return (
    <div className="size-full flex flex-col bg-slate-950 text-white">
      {/* Top Bar */}
      <header className="relative border-b border-slate-800/50 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-slate-950/50"></div>
        
        <div className="relative px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Brand */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur opacity-50"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
                <Activity className="size-5" strokeWidth={2} />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">CareBeacon</h1>
              <p className="text-xs text-slate-400">{deviceData.user?.name || fallbackDeviceData.user.name}, {deviceData.user?.age || fallbackDeviceData.user.age}</p>
            </div>
          </div>
          
          {/* Right: Status & Actions */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4">
            {hasAlert && (
              <div className="flex items-center gap-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-red-400 animate-pulse" />
                  <span className="text-sm font-bold text-red-400 uppercase">UNCONFIRMED FALL</span>
                </div>
                <button 
                  onClick={handleConfirmAlert}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition"
                >
                  <CheckCircle className="size-3" />
                  Confirm Alert
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <div className={`size-2 rounded-full ${deviceData.status !== 'offline' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium capitalize text-slate-200">{deviceData.status}</span>
            </div>
            
            <button
              onClick={onLogout}
              className="p-2.5 hover:bg-slate-800/50 rounded-xl transition-colors border border-transparent hover:border-slate-700/50"
              title="Logout"
            >
              <LogOut className="size-4 text-slate-400" />
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition"></div>
                <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-emerald-500/30 transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                      <Wifi className="size-5 text-emerald-400" />
                    </div>
                    <TrendingUp className="size-4 text-emerald-400" />
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Connection</p>
                  <p className="text-2xl font-semibold text-white">Online</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition"></div>
                <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-blue-500/30 transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                      <Battery className="size-5 text-blue-400" />
                    </div>
                    <span className="text-xs text-slate-400">Good</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Battery</p>
                  <p className="text-2xl font-semibold text-white">{Math.round(deviceData.battery)}%</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition"></div>
                <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-purple-500/30 transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-purple-500/10 rounded-xl">
                      <Bell className="size-5 text-purple-400" />
                    </div>
                    <span className="text-xs text-emerald-400">Low</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Incidents</p>
                  <p className="text-2xl font-semibold text-white">{incidentsCount} Total</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition"></div>
                <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-amber-500/30 transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl">
                      <Phone className="size-5 text-amber-400" />
                    </div>
                    <span className="text-xs text-slate-400">Active</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Contacts</p>
                  <p className="text-2xl font-semibold text-white">3</p>
                </div>
              </div>
            </div>
            
            {/* Simulation Panel */}
            {isDemo && (
              <div className="mb-8 p-6 bg-slate-900/50 backdrop-blur-sm border border-indigo-500/30 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="size-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-white">Device Simulator (Demo Mode)</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button onClick={simulateFall} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 rounded-xl transition font-medium text-sm">
                    Simulate Fall
                  </button>
                  <button onClick={simulateSOS} className="px-4 py-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/50 rounded-xl transition font-medium text-sm">
                    Simulate SOS
                  </button>
                  <button onClick={simulateBatteryDrop} className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600 rounded-xl transition font-medium text-sm">
                    Drop Battery 10%
                  </button>
                  <button onClick={resetStatus} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-xl transition font-medium text-sm">
                    Reset Status
                  </button>
                </div>
              </div>
            )}
            
            {/* Navigation Pills */}
            <div className="flex gap-2 mb-8 p-1.5 bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab('map')}
                className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'map'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === 'map' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl"></div>
                )}
                <span className="relative flex items-center gap-2">
                  <MapPin className="size-4" />
                  Live Location
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'history'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === 'history' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl"></div>
                )}
                <span className="relative flex items-center gap-2">
                  <Bell className="size-4" />
                  Fall History
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('device')}
                className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'device'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === 'device' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl"></div>
                )}
                <span className="relative flex items-center gap-2">
                  <Activity className="size-4" />
                  Device Status
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('contacts')}
                className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'contacts'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === 'contacts' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl"></div>
                )}
                <span className="relative flex items-center gap-2">
                  <Phone className="size-4" />
                  Contacts
                </span>
              </button>
            </div>
            
            {/* Content */}
            {activeTab === 'map' && <LocationMap location={deviceData.location} />}
            {activeTab === 'history' && <FallHistory />}
            {activeTab === 'device' && <DeviceStatus deviceData={deviceData} />}
            {activeTab === 'contacts' && <EmergencyContacts />}
          </div>
        </main>
      </div>
    </div>
  );
}
