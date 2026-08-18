import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { db, ref, onValue, query, orderByChild, update } from "../../../lib/db";
import { SkeletonTable } from "../ui/Skeleton";
import { Search, Filter, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface Incident {
  id: string;
  deviceId: string;
  patientName: string;
  type: string;
  time: string;
  timestamp: Date;
  status: string;
  contactNotified: string;
  location: string;
  typeColor: string;
  icon: any;
}

export function AdminIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const eventsRef = ref(db, 'events');
    const familiesRef = ref(db, 'families');
    
    let currentEvents: any = {};
    let currentFamilies: any = {};
    
    const updateIncidentsList = () => {
      const parsedIncidents: Incident[] = [];
      
      Object.keys(currentEvents).forEach(deviceId => {
        const deviceEvents = currentEvents[deviceId];
        const family = Object.values(currentFamilies).find((f: any) => f.deviceId === deviceId) as any;
        const patientName = family ? family.patientName : "Unknown Patient";
        
        Object.keys(deviceEvents).forEach(eventId => {
          const ev = deviceEvents[eventId];
          
          let typeColor = "bg-primary/10 text-primary";
          let typeText = "Event";
          let icon = <CheckCircle className="size-4" />;
          
          if (ev.status === 'pending' || ev.status === 'unconfirmed') {
            typeColor = "bg-destructive/10 text-destructive";
            typeText = "Fall detected (Unconfirmed)";
            icon = <AlertTriangle className="size-4" />;
          } else if (ev.status === 'emergency') {
            typeColor = "bg-warning/10 text-warning";
            typeText = "SOS Button Pressed";
            icon = <Clock className="size-4" />;
          } else if (ev.status === 'confirmed') {
            typeColor = "bg-destructive/10 text-destructive";
            typeText = "Fall Confirmed";
            icon = <AlertTriangle className="size-4" />;
          } else if (ev.status === 'resolved') {
            typeColor = "bg-success/10 text-success";
            typeText = "Resolved";
            icon = <CheckCircle className="size-4" />;
          } else if (ev.status === 'cancelled') {
            typeColor = "bg-muted text-muted-foreground";
            typeText = "Cancelled";
            icon = <AlertTriangle className="size-4" />;
          }

          parsedIncidents.push({
            id: eventId,
            deviceId,
            patientName,
            type: typeText,
            time: new Date(ev.timestamp).toLocaleString(),
            timestamp: new Date(ev.timestamp),
            status: ev.status,
            contactNotified: ev.contactNotified || "None",
            location: ev.location || "Unknown",
            typeColor,
            icon
          });
        });
      });
      
      parsedIncidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setIncidents(parsedIncidents);
      setLoading(false);
    };

    const unsubEvents = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) currentEvents = snapshot.val();
      updateIncidentsList();
    });

    const unsubFamilies = onValue(familiesRef, (snapshot) => {
      if (snapshot.exists()) currentFamilies = snapshot.val();
      updateIncidentsList();
    });

    return () => {
      unsubEvents();
      unsubFamilies();
    };
  }, []);

  const filteredIncidents = incidents.filter(i => 
    i.patientName.toLowerCase().includes(search.toLowerCase()) || 
    i.deviceId.toLowerCase().includes(search.toLowerCase()) ||
    i.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Incidents</h1>
            <p className="text-sm text-muted-foreground mt-1">System-wide log of all falls and emergencies</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search person or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary w-full md:w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors">
              <Filter className="size-4" />
              Filter
            </button>
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={5} />
        ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground bg-muted/30">
                <tr>
                  <th className="font-medium px-6 py-4">Event Type</th>
                  <th className="font-medium px-6 py-4">Time</th>
                  <th className="font-medium px-6 py-4">Person / Device</th>
                  <th className="font-medium px-6 py-4">Location</th>
                  <th className="font-medium px-6 py-4">Alert Delivery</th>
                  <th className="font-medium px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      {search ? "No incidents matched your search" : "No incidents recorded"}
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ${incident.typeColor} font-medium text-xs`}>
                          {incident.icon}
                          {incident.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{incident.time}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-foreground font-medium">{incident.patientName}</span>
                          <span className="text-muted-foreground font-mono text-xs">{incident.deviceId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs truncate max-w-[200px]" title={incident.location}>
                        {incident.location}
                      </td>
                      <td className="px-6 py-4 text-foreground text-xs">
                        {incident.contactNotified}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </AdminLayout>
  );
}
