import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "./AdminLayout";
import { StatusBadge } from "./StatusBadge";
import { SkeletonTable } from "../ui/skeleton";
import { db, ref, onValue, push, set, update, remove, getOnce } from "../../../lib/db";
import { auth } from "../../../lib/firebase";
import { Search, Filter, Ban, ShieldCheck, PlusCircle, X, PackagePlus, AlertCircle, Check, Edit2, Plus, Minus, Trash2, AlertTriangle, Users, UserMinus } from "lucide-react";

interface CaregiverDetail {
  uid: string;
  name: string;
  email: string;
  role: string;
}

interface Family {
  id: string;
  name: string;
  deviceId: string;
  status: "online" | "offline" | "low_battery";
  accountStatus: "active" | "suspended";
  battery: string;
  createdAt: string;
  caregiverUids: string[];
  caregiverDetails: CaregiverDetail[];
  incidentOffset?: number;
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

  // Incident adjustment modal state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustFamily, setAdjustFamily] = useState<Family | null>(null);
  const [adjustAmount, setAdjustAmount] = useState(0);

  // Delete family modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteFamilyData, setDeleteFamilyData] = useState<Family | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Manage caregivers modal state
  const [showManageCaregivers, setShowManageCaregivers] = useState(false);
  const [manageFamilyData, setManageFamilyData] = useState<Family | null>(null);
  const [removingUid, setRemovingUid] = useState<string | null>(null);

  // Suspend family modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendFamily, setSuspendFamily] = useState<Family | null>(null);

  // View as family modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewFamily, setViewFamily] = useState<Family | null>(null);

  const navigate = useNavigate();

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
        const deviceId = f.deviceId || f.deviceSerialNumber;
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
        
        const realIncidents = Object.values(deviceEvents).filter((e: any) => 
          e.status !== 'cancelled' && e.status !== 'emergency'
        ).length;
        const incidentOffset = f.incidentOffset || 0;
        const totalIncidents = Math.max(0, realIncidents + incidentOffset);

        // Collect caregiver UIDs and details from family data
        const caregiverUids = f.caregivers ? Object.keys(f.caregivers) : [];
        const caregiverDetails: CaregiverDetail[] = f.caregivers 
          ? Object.entries(f.caregivers).map(([uid, info]: [string, any]) => ({
              uid,
              name: info.name || 'Unknown',
              email: info.email || '—',
              role: info.role || 'caregiver',
            }))
          : [];

        parsedFamilies.push({
          id: key,
          name: f.patientName || f.monitoredPerson?.name || "Unknown",
          deviceId: deviceId || f.deviceSerialNumber || "Unlinked",
          status,
          accountStatus: f.status === 'suspended' ? 'suspended' : 'active',
          battery,
          createdAt: f.createdAt,
          totalIncidents,
          incidentOffset,
          caregiverUids,
          caregiverDetails,
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

  const handleToggleSuspend = (family: Family) => {
    setSuspendFamily(family);
    setShowSuspendModal(true);
  };

  const confirmToggleSuspend = async () => {
    if (!suspendFamily) return;
    
    const newStatus = suspendFamily.accountStatus === 'active' ? 'suspended' : 'active';
    
    try {
      // Update family status
      await update(ref(db, `families/${suspendFamily.id}`), { status: newStatus });

      // Update all caregivers' accessStatus
      for (const uid of suspendFamily.caregiverUids) {
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
          targetId: suspendFamily.id,
          targetDevice: suspendFamily.deviceId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to toggle suspension:', err);
    } finally {
      setShowSuspendModal(false);
      setSuspendFamily(null);
    }
  };

  const handleConfirmViewFamily = async () => {
    if (!viewFamily) return;

    const user = auth.currentUser;
    if (user) {
      const logRef = push(ref(db, 'admin/auditLog'));
      await set(logRef, {
        action: "View as Family",
        adminId: user.uid,
        adminEmail: user.email,
        targetId: viewFamily.id,
        targetDevice: viewFamily.deviceId,
        timestamp: new Date().toISOString()
      });
    }
    
    setShowViewModal(false);
    navigate(`/admin/family/${viewFamily.id}`);
  };

  const handleRemoveCaregiver = async (family: Family, caregiverUid: string) => {
    const caregiver = family.caregiverDetails.find(c => c.uid === caregiverUid);
    const confirmMsg = `Remove caregiver "${caregiver?.name || caregiverUid}" from this family?\n\nThey will lose access to this device, but the family profile and other caregivers will not be affected.`;
    if (!confirm(confirmMsg)) return;

    setRemovingUid(caregiverUid);
    try {
      // 1. Remove this caregiver from the family's caregivers list
      await remove(ref(db, `families/${family.id}/caregivers/${caregiverUid}`));

      // 2. Revoke the caregiver's access
      await update(ref(db, `users/${caregiverUid}`), { familyId: null, accessStatus: 'revoked' });

      // 3. Log the action
      const user = auth.currentUser;
      if (user) {
        const logRef = push(ref(db, 'admin/auditLog'));
        await set(logRef, {
          action: `Removed Caregiver: ${caregiver?.name || caregiverUid} (${caregiver?.email || 'N/A'})`,
          adminId: user.uid,
          adminEmail: user.email,
          targetId: family.id,
          targetDevice: family.deviceId,
          timestamp: new Date().toISOString(),
        });
      }

      // 4. Update the local manage modal state
      if (manageFamilyData && manageFamilyData.id === family.id) {
        const updatedDetails = manageFamilyData.caregiverDetails.filter(c => c.uid !== caregiverUid);
        const updatedUids = manageFamilyData.caregiverUids.filter(u => u !== caregiverUid);
        setManageFamilyData({ ...manageFamilyData, caregiverDetails: updatedDetails, caregiverUids: updatedUids });
      }
    } catch (err) {
      console.error('Failed to remove caregiver:', err);
      alert('Failed to remove caregiver. Check console for details.');
    } finally {
      setRemovingUid(null);
    }
  };

  const handleDeleteFamily = async () => {
    if (!deleteFamilyData) return;
    setDeleteLoading(true);

    try {
      // 1. Remove all caregivers' access
      for (const uid of deleteFamilyData.caregiverUids) {
        await update(ref(db, `users/${uid}`), { familyId: null, accessStatus: 'revoked' });
      }

      // 2. Remove the family record
      await remove(ref(db, `families/${deleteFamilyData.id}`));

      // 3. Reset the device if applicable
      if (deleteFamilyData.deviceId && deleteFamilyData.deviceId !== 'Unlinked') {
        await update(ref(db, `devices/${deleteFamilyData.deviceId}`), {
          status: 'offline',
          battery: 0,
          location: null
        });
        await remove(ref(db, `events/${deleteFamilyData.deviceId}`));
      }

      // 4. Log the action
      const user = auth.currentUser;
      if (user) {
        const logRef = push(ref(db, 'admin/auditLog'));
        await set(logRef, {
          action: 'Deleted Entire Family Account',
          adminId: user.uid,
          adminEmail: user.email,
          targetId: deleteFamilyData.id,
          targetDevice: deleteFamilyData.deviceId,
          timestamp: new Date().toISOString(),
        });
      }

      setShowDeleteModal(false);
      setDeleteFamilyData(null);
      setShowManageCaregivers(false);
      setManageFamilyData(null);
    } catch (err) {
      console.error('Failed to delete family:', err);
      alert('Failed to delete family account. Check console for details.');
    } finally {
      setDeleteLoading(false);
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
                  <th className="font-medium px-6 py-4 text-center">Actions</th>
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
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => {
                              setViewFamily(family);
                              setShowViewModal(true);
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
                          <button
                            onClick={() => {
                              setAdjustFamily(family);
                              setAdjustAmount(0);
                              setShowAdjustModal(true);
                            }}
                            className="text-muted-foreground hover:text-foreground font-medium text-sm transition-colors"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => {
                              setManageFamilyData(family);
                              setShowManageCaregivers(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-md transition-colors"
                            title="Manage Caregivers"
                          >
                            <Users className="size-3.5" />
                            Caregivers
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

      {/* View as Family Confirmation Modal */}
      {showViewModal && viewFamily && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center p-6 pb-8">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="size-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Impersonate Family</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You are about to view the dashboard for <strong className="text-foreground">{viewFamily.name}</strong>.
                This action will be recorded in the audit log for security purposes.
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewFamily(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmViewFamily}
                  className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend/Activate Family Modal */}
      {showSuspendModal && suspendFamily && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center p-6 pb-8">
              <div className={`size-12 rounded-full flex items-center justify-center mb-4 ${suspendFamily.accountStatus === 'active' ? 'bg-destructive/10' : 'bg-success/10'}`}>
                {suspendFamily.accountStatus === 'active' ? (
                  <AlertTriangle className="size-6 text-destructive" />
                ) : (
                  <ShieldCheck className="size-6 text-success" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {suspendFamily.accountStatus === 'active' ? 'Suspend Family' : 'Reactivate Family'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {suspendFamily.accountStatus === 'active' ? (
                  <>
                    Are you sure you want to suspend <strong className="text-foreground">{suspendFamily.name}</strong>?
                    All caregivers assigned to this family will immediately lose access to the application.
                  </>
                ) : (
                  <>
                    Are you sure you want to reactivate <strong className="text-foreground">{suspendFamily.name}</strong>?
                    All caregivers assigned to this family will regain full access to the application.
                  </>
                )}
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSuspendFamily(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToggleSuspend}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                    suspendFamily.accountStatus === 'active'
                      ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                      : 'bg-success hover:bg-success/90 text-success-foreground'
                  }`}
                >
                  {suspendFamily.accountStatus === 'active' ? 'Suspend Access' : 'Reactivate Access'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Adjust Incident Count Modal */}
      {showAdjustModal && adjustFamily && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground">Adjust Incident Count</h3>
              <button 
                onClick={() => { setShowAdjustModal(false); setAdjustFamily(null); setAdjustAmount(0); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-2">
                Adjusting incidents for <strong className="text-foreground">{adjustFamily.name}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Current count: <strong className="text-foreground">{adjustFamily.totalIncidents}</strong>
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-8">
                <button 
                  onClick={() => setAdjustAmount(prev => prev - 1)}
                  className="p-3 bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors"
                >
                  <Minus className="size-5" />
                </button>
                <span className="text-3xl font-bold w-12 text-center text-foreground">
                  {adjustAmount > 0 ? '+' : ''}{adjustAmount}
                </span>
                <button 
                  onClick={() => setAdjustAmount(prev => prev + 1)}
                  className="p-3 bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors"
                >
                  <Plus className="size-5" />
                </button>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowAdjustModal(false); setAdjustFamily(null); setAdjustAmount(0); }}
                  className="flex-1 px-4 py-2 bg-muted border border-border rounded-xl text-foreground font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (!adjustFamily || adjustAmount === 0) return;
                    try {
                      const newOffset = (adjustFamily.incidentOffset || 0) + adjustAmount;
                      await update(ref(db, `families/${adjustFamily.id}`), {
                        incidentOffset: newOffset
                      });
                      // Log the action
                      const user = auth.currentUser;
                      if (user) {
                        const logRef = push(ref(db, 'admin/auditLog'));
                        await set(logRef, {
                          action: `Adjusted incident count by ${adjustAmount > 0 ? '+' : ''}${adjustAmount}`,
                          adminId: user.uid,
                          adminEmail: user.email,
                          targetId: adjustFamily.id,
                          targetDevice: adjustFamily.deviceId,
                          timestamp: new Date().toISOString(),
                        });
                      }
                      setShowAdjustModal(false);
                      setAdjustFamily(null);
                      setAdjustAmount(0);
                    } catch (error) {
                      console.error("Error updating incident count:", error);
                    }
                  }}
                  disabled={adjustAmount === 0}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply {adjustAmount > 0 ? '+' : ''}{adjustAmount === 0 ? '' : adjustAmount}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Caregivers Modal */}
      {showManageCaregivers && manageFamilyData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
                  <Users className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Manage Caregivers</h3>
                  <p className="text-xs text-muted-foreground">Family: <strong>{manageFamilyData.name}</strong> · <span className="font-mono">{manageFamilyData.deviceId}</span></p>
                </div>
              </div>
              <button
                onClick={() => { setShowManageCaregivers(false); setManageFamilyData(null); }}
                className="p-2 hover:bg-muted text-muted-foreground rounded-xl transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Caregiver List */}
            <div className="p-6 overflow-y-auto space-y-3">
              {manageFamilyData.caregiverDetails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="size-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No caregivers linked to this family.</p>
                </div>
              ) : (
                manageFamilyData.caregiverDetails.map((cg) => (
                  <div key={cg.uid} className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 text-primary font-medium text-sm flex-shrink-0">
                        {cg.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{cg.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{cg.email}</p>
                      </div>
                      {cg.role === 'primary' && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider rounded-full flex-shrink-0">
                          Primary
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveCaregiver(manageFamilyData, cg.uid)}
                      disabled={removingUid === cg.uid}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ml-3"
                    >
                      {removingUid === cg.uid ? (
                        <span className="size-3 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                      ) : (
                        <UserMinus className="size-3.5" />
                      )}
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer with Delete Entire Family */}
            <div className="p-4 border-t border-border bg-muted/10 space-y-3">
              <button 
                onClick={() => { setShowManageCaregivers(false); setManageFamilyData(null); }}
                className="w-full px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-medium transition-colors"
              >
                Done
              </button>
              <button 
                onClick={() => {
                  setDeleteFamilyData(manageFamilyData);
                  setShowDeleteModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-destructive/70 hover:text-destructive transition-colors"
              >
                <Trash2 className="size-3" />
                Delete entire family profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteFamilyData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center p-6 pb-8">
              <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="size-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete Entire Family</h3>
              <p className="text-sm text-muted-foreground">
                This will permanently delete <strong className="text-foreground">{deleteFamilyData.name}</strong> and remove <strong className="text-destructive">ALL</strong> caregivers.
              </p>
              <div className="text-xs text-left w-full mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded-xl space-y-2 text-muted-foreground">
                <p className="text-destructive font-medium">⚠ This cannot be undone:</p>
                <p>• The entire family profile will be deleted.</p>
                <p>• <strong className="text-foreground">{deleteFamilyData.caregiverUids.length} caregiver(s)</strong> will ALL lose access.</p>
                <p>• Device <span className="font-mono text-foreground">{deleteFamilyData.deviceId}</span> will be unlinked.</p>
                <p>• All fall history will be permanently cleared.</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                To remove just one caregiver, use <strong>Manage Caregivers</strong> instead.
              </p>
            </div>
            
            <div className="flex gap-0 border-t border-border bg-muted/20">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteFamilyData(null); }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-4 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors border-r border-border disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteFamily}
                disabled={deleteLoading}
                className="flex-1 px-4 py-4 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <span className="size-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                ) : (
                  "Delete Permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
