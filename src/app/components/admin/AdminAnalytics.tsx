import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { db, ref, onValue } from "../../../lib/db";
import { SkeletonChart, SkeletonCard } from "../ui/Skeleton";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Activity, Users, AlertTriangle, ShieldCheck } from "lucide-react";

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [incidentData, setIncidentData] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    activeFamilies: 0,
    totalIncidents: 0,
    onlineDevices: 0,
    resolvedIncidents: 0
  });

  useEffect(() => {
    // In a real production app, this would call a Cloud Function to return aggregated stats.
    // For the free tier MVP, we aggregate everything client side.
    const familiesRef = ref(db, 'families');
    const devicesRef = ref(db, 'devices');
    const eventsRef = ref(db, 'events');

    let activeFam = 0;
    let onlineDev = 0;
    
    const unsubFamilies = onValue(familiesRef, (snap) => {
      if (snap.val()) activeFam = Object.keys(snap.val()).length;
      updateStats();
    });

    const unsubDevices = onValue(devicesRef, (snap) => {
      const data = snap.val();
      if (data) {
        let online = 0;
        let onlineCount = 0;
        let offlineCount = 0;
        let lowBatteryCount = 0;
        
        Object.values(data as Record<string, any>).forEach(device => {
          if (device.status === 'online') { online++; onlineCount++; }
          else if (device.status === 'offline') offlineCount++;
          else lowBatteryCount++;
        });
        onlineDev = online;
        
        setDeviceData([
          { name: 'Online', count: onlineCount, fill: '#10b981' },
          { name: 'Offline', count: offlineCount, fill: '#ef4444' },
          { name: 'Low Battery', count: lowBatteryCount, fill: '#f59e0b' },
        ]);
      }
      updateStats();
    });

    const unsubEvents = onValue(eventsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const events = Object.values(data as Record<string, any>);
        
        // Group incidents by day of week (naive approach for MVP)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartData = days.map(day => ({ name: day, incidents: 0, falseAlarms: 0 }));
        
        let total = 0;
        let resolved = 0;
        
        events.forEach(evt => {
          total++;
          if (evt.status === 'confirmed' || evt.status === 'resolved') resolved++;
          
          if (evt.timestamp) {
            const date = new Date(evt.timestamp);
            const dayName = days[date.getDay()];
            const dayObj = chartData.find(d => d.name === dayName);
            if (dayObj) {
              if (evt.status === 'cancelled') dayObj.falseAlarms++;
              else dayObj.incidents++;
            }
          }
        });
        
        setIncidentData(chartData);
        setStats(prev => ({ ...prev, totalIncidents: total, resolvedIncidents: resolved }));
      }
      setLoading(false);
    });

    function updateStats() {
      setStats(prev => ({
        ...prev,
        activeFamilies: activeFam,
        onlineDevices: onlineDev,
      }));
    }

    return () => {
      unsubFamilies();
      unsubDevices();
      unsubEvents();
    };
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">System-wide trends and engagement metrics</p>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Active Families</p>
              <p className="text-2xl font-bold text-foreground">{stats.activeFamilies}</p>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-success/10 text-success rounded-xl">
              <Activity className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Online Devices</p>
              <p className="text-2xl font-bold text-foreground">{stats.onlineDevices}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-destructive/10 text-destructive rounded-xl">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Incidents</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalIncidents}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Resolved/Confirmed</p>
              <p className="text-2xl font-bold text-foreground">{stats.resolvedIncidents}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Incident Trends (Line Chart) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-foreground mb-6">Incident Trends (7 Days)</h3>
            <div className="h-72 w-full">
              {loading ? (
                <SkeletonChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incidentData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} 
                    />
                    <Line type="monotone" dataKey="incidents" name="Incidents" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="falseAlarms" name="False Alarms" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Device Status (Bar Chart) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-foreground mb-6">Device Fleet Status</h3>
            <div className="h-72 w-full">
              {loading ? (
                <SkeletonChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} 
                      cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="count" name="Devices" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
