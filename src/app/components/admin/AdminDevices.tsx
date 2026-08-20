import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { StatusBadge } from "./StatusBadge";
import { db, ref, onValue } from "../../../lib/db";
import { SkeletonTable } from "../ui/skeleton";
import { Search, Filter, Battery, Wifi, WifiOff, X, Activity, HardDrive, Cpu, Radio } from "lucide-react";

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
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

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

  const filteredDevices = devices.filter(d => {
    const matchesSearch = d.id.toLowerCase().includes(search.toLowerCase()) || 
                          (d.patientName && d.patientName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-9 pr-8 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer text-foreground h-[38px]"
              >
                <option value="all">All Statuses</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="low_battery">Low Battery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Devices Table */}
        {loading ? (
          <SkeletonTable rows={5} />
        ) : (
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
                {filteredDevices.length === 0 ? (
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
                        <button 
                          onClick={() => setSelectedDevice(device)}
                          className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        >
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
        )}
      </div>

      {/* Diagnostics Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
                  <Activity className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Device Diagnostics</h3>
                  <p className="text-xs text-muted-foreground font-mono">{selectedDevice.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDevice(null)}
                className="p-2 hover:bg-muted text-muted-foreground rounded-xl transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                  <div><StatusBadge status={selectedDevice.status} /></div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Battery Level</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    {selectedDevice.battery}%
                    {selectedDevice.battery < 20 ? <Battery className="size-4 text-destructive" /> : <Battery className="size-4 text-success" />}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Assigned Patient</p>
                  <p className="text-sm text-foreground">{selectedDevice.patientName || <span className="italic text-muted-foreground">Unassigned</span>}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Last Sync</p>
                  <p className="text-sm text-foreground">{new Date(selectedDevice.lastUpdate).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Hardware Modules</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 border border-border rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-success/10 text-success rounded-lg">
                      <Cpu className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">ESP32 Core</p>
                      <p className="text-[10px] text-muted-foreground">Healthy</p>
                    </div>
                  </div>
                  <div className="p-3 border border-border rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-success/10 text-success rounded-lg">
                      <Radio className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">SIM800L</p>
                      <p className="text-[10px] text-muted-foreground">Network OK</p>
                    </div>
                  </div>
                  <div className="p-3 border border-border rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-success/10 text-success rounded-lg">
                      <HardDrive className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Storage</p>
                      <p className="text-[10px] text-muted-foreground">23% Used</p>
                    </div>
                  </div>
                  <div className="p-3 border border-border rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-success/10 text-success rounded-lg">
                      <Activity className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Accelerometer</p>
                      <p className="text-[10px] text-muted-foreground">Calibrated</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2 italic">
                  * Hardware module statuses are simulated for this prototype.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/10 flex justify-between items-center">
              <button className="px-4 py-2 text-primary hover:bg-primary/10 rounded-xl text-sm font-medium transition-colors">
                Ping Device
              </button>
              <button 
                onClick={() => setSelectedDevice(null)}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
