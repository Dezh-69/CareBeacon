import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { StatusBadge } from "./StatusBadge";
import { SkeletonTable } from "../ui/skeleton";
import { db, ref, onValue, push, set, update } from "../../../lib/db";
import { auth } from "../../../lib/firebase";
import { Search, Filter, Ban, ShieldCheck, PlusCircle, X, PackagePlus, AlertCircle, Check } from "lucide-react";

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

  // Provision modal state
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionSerial, setProvisionSerial] = useState("");
  const [provisionLabel, setProvisionLabel] = useState("");
  const [provisionNotes, setProvisionNotes] = useState("");
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [provisionError, setProvisionError] = useState("");
  const [provisionSuccess, setProvisionSuccess] = useState(false);

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

  const handleProvisionDevice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setProvisionError('');
    setProvisionSuccess(false);

    const trimmedSerial = provisionSerial.trim();
    if (!trimmedSerial) {
      setProvisionError('Serial number is required.');
      return;
    }

    setProvisionLoading(true);
    try {
      const now = new Date().toISOString();

      // Write to admin/inventory so signup can validate
      const inventoryRef = ref(db, `admin/inventory/${trimmedSerial}`);
      await set(inventoryRef, {
        provisionedAt: now,
        label: provisionLabel.trim() || null,
        notes: provisionNotes.trim() || null,
        provisionedBy: auth.currentUser?.email || 'unknown',
      });

      // Create the device record
      const deviceRef = ref(db, `devices/${trimmedSerial}`);
      await set(deviceRef, {
        status: 'offline',
        battery: 0,
        lastUpdate: now,
        location: { lat: 0, lng: 0 },
      });

      setProvisionSuccess(true);
      setProvisionSerial('');
      setProvisionLabel('');
      setProvisionNotes('');

      // Auto-close after a short delay
      setTimeout(() => {
        setShowProvisionModal(false);
        setProvisionSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error('Provision error:', err);
      setProvisionError(err.message || 'Failed to provision device. Please try again.');
    } finally {
      setProvisionLoading(false);
    }
  };

  const resetProvisionModal = () => {
    setShowProvisionModal(false);
    setProvisionSerial('');
    setProvisionLabel('');
    setProvisionNotes('');
    setProvisionError('');
    setProvisionSuccess(false);
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
              onClick={() => setShowProvisionModal(true)}
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
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
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

      {/* Provision Device Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
                  <PackagePlus className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Provision Device</h3>
                  <p className="text-xs text-muted-foreground">Add a new CareBeacon to the inventory</p>
                </div>
              </div>
              <button
                onClick={resetProvisionModal}
                className="p-2 hover:bg-muted text-muted-foreground rounded-xl transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleProvisionDevice} className="p-6 overflow-y-auto space-y-5">
              {provisionError && (
                <div className="flex items-start gap-2.5 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                  <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                  {provisionError}
                </div>
              )}

              {provisionSuccess && (
                <div className="flex items-center gap-2.5 p-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm">
                  <Check className="size-4 flex-shrink-0" />
                  Device provisioned successfully!
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Serial Number <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  value={provisionSerial}
                  onChange={(e) => setProvisionSerial(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm font-mono tracking-wider"
                  placeholder="CB-XXXX-XXXX"
                  required
                  disabled={provisionLoading || provisionSuccess}
                />
                <p className="text-[10px] text-muted-foreground">The unique serial number printed on the CareBeacon device.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Device Label <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={provisionLabel}
                  onChange={(e) => setProvisionLabel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                  placeholder="e.g. Batch 2 — Unit 14"
                  disabled={provisionLoading || provisionSuccess}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  value={provisionNotes}
                  onChange={(e) => setProvisionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm resize-none"
                  placeholder="Any additional notes about this device..."
                  disabled={provisionLoading || provisionSuccess}
                />
              </div>

              <div className="p-3 bg-muted/50 border border-border rounded-xl">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">What happens next:</strong> The device will be added to the inventory and marked as <span className="font-mono text-foreground">offline</span>. Caregivers can then register by entering this serial number during sign-up.
                </p>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetProvisionModal}
                className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-medium transition-colors"
                disabled={provisionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleProvisionDevice()}
                disabled={provisionLoading || provisionSuccess}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors disabled:opacity-70 disabled:pointer-events-none flex items-center gap-2"
              >
                {provisionLoading ? (
                  <>
                    <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Provisioning...
                  </>
                ) : provisionSuccess ? (
                  <>
                    <Check className="size-4" />
                    Done
                  </>
                ) : (
                  <>
                    <PackagePlus className="size-4" />
                    Provision Device
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
