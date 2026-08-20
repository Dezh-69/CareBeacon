import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { StatusBadge } from "./StatusBadge";
import { SkeletonTable } from "../ui/skeleton";
import { db, ref, onValue, push, set, update } from "../../../lib/db";
import { auth } from "../../../lib/firebase";
import { Search, Filter, Ban, ShieldCheck, PlusCircle } from "lucide-react";

interface Family {
  id: string;
  name: string;
  deviceId: string;
  status: "online" | "offline" | "low_battery";
  accountStatus: "active" | "suspended";
  battery: string;
  createdAt: string;
  totalIncidents: number;
  caregiverUids: string[];
}

export function AdminFamilies() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const familiesRef = ref(db, 'families');
    const devicesRef = ref(db, 'devices');
    const eventsRef = ref(db, 'events');
    
    let currentFamilies: any = {};
    let currentDevices: any = {};
    let currentEvents: any = {};
    
    const updateFamiliesList = () => {
      const parsedFamilies: Family[] = [];
      
      Object.keys(currentFamilies).forEach(key => {
        const f = currentFamilies[key];
        const deviceId = f.deviceId;
        const device = currentDevices[deviceId];
        const deviceEvents = currentEvents[deviceId] || {};
        
        let status: "online" | "offline" | "low_battery" = "offline";
        let battery = "—";
        
        if (device) {
          battery = `${Math.round(device.battery || 0)}%`;
          
          if (device.status === 'offline') {
            status = 'offline';
          } else if (device.battery < 20) {
            status = 'low_battery';
          } else {
            status = 'online';
          }
        }
        
        const totalIncidents = Object.values(deviceEvents).filter((e: any) => 
          e.status !== 'cancelled' && e.status !== 'emergency'
        ).length;
        
        // Collect caregiver UIDs from family data
        const caregiverUids = f.caregivers ? Object.keys(f.caregivers) : [];

        parsedFamilies.push({
          id: key,
          name: f.patientName || f.monitoredPerson?.name || "Unknown",
          deviceId: deviceId || f.deviceSerialNumber || "Unlinked",
          status,
          accountStatus: f.status === 'suspended' ? 'suspended' : 'active',
          battery,
          createdAt: f.createdAt,
          totalIncidents,
          caregiverUids,
        });
      });
      
      setFamilies(parsedFamilies);
      setLoading(false);
    };

    const unsubFamilies = onValue(familiesRef, (snapshot) => {
      if (snapshot.exists()) currentFamilies = snapshot.val();
      updateFamiliesList();
    });

    const unsubDevices = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) currentDevices = snapshot.val();
      updateFamiliesList();
    });
    
    const unsubEvents = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) currentEvents = snapshot.val();
      updateFamiliesList();
    });

    return () => {
      unsubFamilies();
      unsubDevices();
      unsubEvents();
    };
  }, []);

  const filteredFamilies = families.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || 
                          f.deviceId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || f.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleToggleSuspend = async (family: Family) => {
    const newStatus = family.accountStatus === 'active' ? 'suspended' : 'active';
    const confirmMsg = newStatus === 'suspended' 
      ? `Suspend family "${family.name}"? All caregivers in this family will lose access.`
      : `Reactivate family "${family.name}"? All caregivers will regain access.`;
    
    if (!confirm(confirmMsg)) return;

    try {
      // Update family status
      await update(ref(db, `families/${family.id}`), { status: newStatus });

      // Update all caregivers' accessStatus
      for (const uid of family.caregiverUids) {
        await update(ref(db, `users/${uid}`), { accessStatus: newStatus });
      }

      // Log the action
      const user = auth.currentUser;
      if (user) {
        const logRef = push(ref(db, 'admin/auditLog'));
        await set(logRef, {
          action: newStatus === 'suspended' ? 'Suspended Family' : 'Reactivated Family',
          adminId: user.uid,
          adminEmail: user.email,
          targetId: family.id,
          targetDevice: family.deviceId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to toggle suspension:', err);
    }
  };

  const handleProvisionDevice = async () => {
    const serial = prompt('Enter the device serial number to provision (e.g., CB-2024-0001):');
    if (!serial || !serial.trim()) return;

    try {
      const trimmed = serial.trim();
      // Add to admin inventory
      await set(ref(db, `admin/inventory/${trimmed}`), {
        provisionedAt: new Date().toISOString(),
        provisionedBy: auth.currentUser?.email || 'unknown',
      });
      // Create a basic device record
      await set(ref(db, `devices/${trimmed}`), {
        status: 'offline',
        battery: 100,
        lastUpdate: new Date().toISOString(),
        location: { lat: 0, lng: 0, address: 'Not yet configured' },
      });
      alert(`Device "${trimmed}" has been provisioned successfully. Caregivers can now register with this serial number.`);
    } catch (err) {
      console.error('Failed to provision device:', err);
      alert('Failed to provision device. Check the console for details.');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Families</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage registered families and their devices</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search families or devices..."
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
            <button 
              onClick={handleProvisionDevice}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors"
            >
              <PlusCircle className="size-4" />
              Provision Device
            </button>
          </div>
        </div>

        {/* Families Table */}
        {loading ? (
          <SkeletonTable rows={5} />
        ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground bg-muted/30">
                <tr>
                  <th className="font-medium px-6 py-4">Person monitored</th>
                  <th className="font-medium px-6 py-4">Device Serial</th>
                  <th className="font-medium px-6 py-4">Battery</th>
                  <th className="font-medium px-6 py-4">Status</th>
                  <th className="font-medium px-6 py-4">Total Falls</th>
                  <th className="font-medium px-6 py-4">Account</th>
                  <th className="font-medium px-6 py-4">Registered Date</th>
                  <th className="font-medium px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFamilies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      {search ? "No families matched your search" : "No families registered yet"}
                    </td>
                  </tr>
                ) : (
                  filteredFamilies.map((family) => (
                    <tr key={family.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-foreground font-medium">{family.name}</td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{family.deviceId}</td>
                      <td className="px-6 py-4 text-muted-foreground">{family.battery}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={family.status} />
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">{family.totalIncidents}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          family.accountStatus === 'active' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {family.accountStatus === 'active' ? (
                            <><ShieldCheck className="size-3" /> Active</>
                          ) : (
                            <><Ban className="size-3" /> Suspended</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(family.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={async () => {
                              const user = auth.currentUser;
                              if (user) {
                                const logRef = push(ref(db, 'admin/auditLog'));
                                await set(logRef, {
                                  action: "View as Family",
                                  adminId: user.uid,
                                  adminEmail: user.email,
                                  targetId: family.id,
                                  targetDevice: family.deviceId,
                                  timestamp: new Date().toISOString()
                                });
                              }
                              alert(`Audit Log: Administrator initiated 'View as Family' session for device ${family.deviceId}. (Impersonation UI under development)`);
                            }}
                            className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleToggleSuspend(family)}
                            className={`font-medium text-sm transition-colors ${
                              family.accountStatus === 'active' 
                                ? 'text-destructive hover:text-destructive/80' 
                                : 'text-success hover:text-success/80'
                            }`}
                          >
                            {family.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
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
