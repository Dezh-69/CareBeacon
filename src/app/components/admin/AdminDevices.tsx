import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { StatusBadge } from "./StatusBadge";
import { db, ref, onValue } from "../../../lib/db";
import { Search, Filter, Battery, Wifi, WifiOff } from "lucide-react";

interface Device {
  id: string;
  status: "online" | "offline" | "low_battery";
  battery: number;
  lastUpdate: string;
  familyId: string | null;
  patientName: string | null;
}

export function AdminDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const devicesRef = ref(db, 'devices');
    const familiesRef = ref(db, 'families');
    
    let currentDevices: any = {};
    let currentFamilies: any = {};
    
    const updateDevicesList = () => {
      const parsedDevices: Device[] = [];
      
      Object.keys(currentDevices).forEach(deviceId => {
        const d = currentDevices[deviceId];
        
        // Find which family this belongs to
        const familyEntry = Object.entries(currentFamilies).find(([_, f]: [string, any]) => f.deviceId === deviceId);
        const familyId = familyEntry ? familyEntry[0] : null;
        const patientName = familyEntry ? (familyEntry[1] as any).patientName : null;
        
        let status: "online" | "offline" | "low_battery" = "offline";
        
        if (d.status === 'offline') {
          status = 'offline';
        } else if (d.battery < 20) {
          status = 'low_battery';
        } else {
          status = 'online';
        }
        
        parsedDevices.push({
          id: deviceId,
          status,
          battery: Math.round(d.battery || 0),
          lastUpdate: d.lastUpdate || new Date().toISOString(),
          familyId,
          patientName
        });
      });
      
      setDevices(parsedDevices);
      setLoading(false);
    };

    const unsubDevices = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) currentDevices = snapshot.val();
      updateDevicesList();
    });

    const unsubFamilies = onValue(familiesRef, (snapshot) => {
      if (snapshot.exists()) currentFamilies = snapshot.val();
      updateDevicesList();
    });

    return () => {
      unsubDevices();
      unsubFamilies();
    };
  }, []);

  const filteredDevices = devices.filter(d => 
    d.id.toLowerCase().includes(search.toLowerCase()) || 
    (d.patientName && d.patientName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Devices</h1>
            <p className="text-sm text-muted-foreground mt-1">Fleet-wide monitoring of all provisioned devices</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search serial or family..."
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

        {/* Devices Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground bg-muted/30">
                <tr>
                  <th className="font-medium px-6 py-4">Serial Number</th>
                  <th className="font-medium px-6 py-4">Status</th>
                  <th className="font-medium px-6 py-4">Battery</th>
                  <th className="font-medium px-6 py-4">Assigned To</th>
                  <th className="font-medium px-6 py-4">Last Sync</th>
                  <th className="font-medium px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Loading devices...
                    </td>
                  </tr>
                ) : filteredDevices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      {search ? "No devices matched your search" : "No devices provisioned"}
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map((device) => (
                    <tr key={device.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-foreground font-mono font-medium text-xs">{device.id}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={device.status} />
                      </td>
                      <td className="px-6 py-4 text-foreground flex items-center gap-2">
                        {device.battery}%
                        {device.battery < 20 && <Battery className="size-3 text-destructive" />}
                      </td>
                      <td className="px-6 py-4">
                        {device.patientName ? (
                          <span className="text-foreground">{device.patientName}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(device.lastUpdate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                          Diagnostics
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
