import { useState, useEffect } from "react";
import { Link } from "react-router";
import { StatusBadge } from "./StatusBadge";
import { AdminLayout } from "./AdminLayout";
import { db, ref, onValue } from "../../../lib/db";

interface Family {
  id: string;
  name: string;
  deviceId: string;
  status: "online" | "offline" | "low_battery";
  battery: string;
  createdAt: string;
}

interface Incident {
  id: string;
  type: string;
  person: string;
  time: string;
  statusText: string;
  typeColor: string;
  timestamp: Date;
}

export function AdminDashboard() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState({
    totalFamilies: 0,
    devicesOnline: 0,
    totalDevices: 0,
    openIncidents: 0,
  });

  useEffect(() => {
    // 1. Fetch Families and their Devices
    const familiesRef = ref(db, 'families');
    const devicesRef = ref(db, 'devices');
    const eventsRef = ref(db, 'events');
    
    // Using a single large listener approach for dashboard, in production we might use specific queries
    // or Cloud Functions to aggregate this.
    
    let currentFamilies: any = {};
    let currentDevices: any = {};
    
    const unsubscribeFamilies = onValue(familiesRef, (snapshot) => {
      if (snapshot.exists()) {
        currentFamilies = snapshot.val();
        updateDashboard(currentFamilies, currentDevices);
      }
    });

    const unsubscribeDevices = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        currentDevices = snapshot.val();
        updateDashboard(currentFamilies, currentDevices);
      }
    });
    
    const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const eventsData = snapshot.val();
        const parsedIncidents: Incident[] = [];
        let openCount = 0;
        
        // eventsData is keyed by deviceId
        Object.keys(eventsData).forEach(deviceId => {
          const deviceEvents = eventsData[deviceId];
          // get family name for this device
          const family = Object.values(currentFamilies).find((f: any) => f.deviceId === deviceId) as any;
          const personName = family ? family.patientName : "Unknown Patient";
          
          Object.keys(deviceEvents).forEach(eventId => {
            const ev = deviceEvents[eventId];
            
            if (ev.status === 'pending' || ev.status === 'emergency' || ev.status === 'unconfirmed') {
              openCount++;
            }
            
            let typeColor = "bg-primary/15";
            let typeText = "Event";
            
            if (ev.status === 'pending' || ev.status === 'unconfirmed') {
              typeColor = "bg-destructive/15";
              typeText = "Fall detected (Unconfirmed)";
            } else if (ev.status === 'emergency') {
              typeColor = "bg-warning/15";
              typeText = "SOS Button Pressed";
            } else if (ev.status === 'confirmed') {
              typeColor = "bg-destructive/15";
              typeText = "Fall Confirmed";
            } else if (ev.status === 'resolved') {
              typeColor = "bg-success/15";
              typeText = "Resolved";
            } else if (ev.status === 'cancelled') {
              typeColor = "bg-muted";
              typeText = "Cancelled";
            }

            parsedIncidents.push({
              id: eventId,
              type: typeText,
              person: personName,
              time: new Date(ev.timestamp).toLocaleString(),
              timestamp: new Date(ev.timestamp),
              statusText: ev.contactNotified ? `Notified: ${ev.contactNotified}` : '',
              typeColor
            });
          });
        });
        
        // Sort by newest first, take top 5
        parsedIncidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setIncidents(parsedIncidents.slice(0, 5));
        setStats(prev => ({ ...prev, openIncidents: openCount }));
      }
    });

    const updateDashboard = (fams: any, devs: any) => {
      const parsedFamilies: Family[] = [];
      let onlineCount = 0;
      let totalDevs = 0;
      
      Object.keys(fams).forEach(key => {
        const f = fams[key];
        const deviceId = f.deviceId;
        const device = devs[deviceId];
        
        let status: "online" | "offline" | "low_battery" = "offline";
        let battery = "—";
        
        if (device) {
          totalDevs++;
          battery = `${Math.round(device.battery || 0)}%`;
          
          if (device.status === 'offline') {
            status = 'offline';
          } else if (device.battery < 20) {
            status = 'low_battery';
            onlineCount++;
          } else {
            status = 'online';
            onlineCount++;
          }
        }
        
        parsedFamilies.push({
          id: key,
          name: f.patientName || "Unknown",
          deviceId: deviceId || "Unlinked",
          status,
          battery,
          createdAt: f.createdAt
        });
      });
      
      setFamilies(parsedFamilies);
      setStats(prev => ({
        ...prev,
        totalFamilies: Object.keys(fams).length,
        devicesOnline: onlineCount,
        totalDevices: totalDevs
      }));
    };

    return () => {
      unsubscribeFamilies();
      unsubscribeDevices();
      unsubscribeEvents();
    };
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">System overview</p>
          </div>
          <div className="hidden sm:flex items-center justify-center size-10 rounded-full bg-secondary text-primary font-medium cursor-pointer hover:bg-secondary/80">
            A
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-card p-4 sm:p-6 rounded-xl border border-border flex flex-col gap-1 sm:gap-2 shadow-sm">
            <span className="text-xs sm:text-sm text-muted-foreground">Families</span>
            <span className="text-xl sm:text-2xl font-semibold">{stats.totalFamilies}</span>
          </div>
          <div className="bg-card p-4 sm:p-6 rounded-xl border border-border flex flex-col gap-1 sm:gap-2 shadow-sm">
            <span className="text-xs sm:text-sm text-muted-foreground">Devices online</span>
            <span className="text-xl sm:text-2xl font-semibold">{stats.devicesOnline}/{stats.totalDevices}</span>
          </div>
          <div className="bg-card p-4 sm:p-6 rounded-xl border border-border flex flex-col gap-1 sm:gap-2 shadow-sm">
            <span className="text-xs sm:text-sm text-muted-foreground">Open incidents</span>
            <span className="text-xl sm:text-2xl font-semibold">{stats.openIncidents}</span>
          </div>
          <div className="bg-card p-4 sm:p-6 rounded-xl border border-border flex flex-col gap-1 sm:gap-2 shadow-sm">
            <span className="text-xs sm:text-sm text-muted-foreground">Alerts delivered</span>
            <span className="text-xl sm:text-2xl font-semibold">100%</span>
          </div>
        </div>

        {/* Registered Families Panel */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 flex items-center justify-between border-b border-border">
            <h2 className="text-base sm:text-lg font-medium text-foreground">Registered families</h2>
            <Link to="/admin/families" className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View all
            </Link>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[480px]">
              <thead className="text-muted-foreground bg-muted/30">
                <tr>
                  <th className="font-medium px-3 sm:px-6 py-3 sm:py-4">Person monitored</th>
                  <th className="font-medium px-3 sm:px-6 py-3 sm:py-4">Device Serial</th>
                  <th className="font-medium px-3 sm:px-6 py-3 sm:py-4">Battery</th>
                  <th className="font-medium px-3 sm:px-6 py-3 sm:py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {families.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No families registered yet
                    </td>
                  </tr>
                ) : (
                  families.slice(0, 5).map((family) => (
                    <tr key={family.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-foreground font-medium">{family.name}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-muted-foreground font-mono text-xs">{family.deviceId}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-muted-foreground">{family.battery}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <StatusBadge status={family.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Incidents Panel */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border">
            <h2 className="text-base sm:text-lg font-medium text-foreground">Recent incidents</h2>
          </div>
          <div className="flex flex-col">
            {incidents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No recent incidents
              </div>
            ) : (
              incidents.map((incident) => (
                <div key={incident.id} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 hover:bg-muted/50 transition-colors border-b border-border last:border-0">
                  <div className={`mt-1 size-3 rounded ${incident.typeColor} flex-shrink-0`} />
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-foreground">
                      {incident.type} — <span className="font-normal text-muted-foreground">{incident.person}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <span>{incident.time}</span>
                      {incident.statusText && (
                        <>
                          <span>&middot;</span>
                          <span>{incident.statusText}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
