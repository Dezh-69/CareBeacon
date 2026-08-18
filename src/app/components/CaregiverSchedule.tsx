import { useState, useEffect } from "react";
import { db, ref, onValue, update } from "../../lib/db";
import { SkeletonList } from "./ui/skeleton";
import { auth } from "../../lib/firebase";
import { Calendar, Clock, User, ShieldCheck, ToggleRight, ToggleLeft } from "lucide-react";

interface CaregiverScheduleProps {
  familyId: string;
}

export function CaregiverSchedule({ familyId }: CaregiverScheduleProps) {
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUid = auth.currentUser?.uid;

  useEffect(() => {
    if (!familyId) return;
    const cgRef = ref(db, `families/${familyId}/caregivers`);
    const unsub = onValue(cgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data).map(key => ({
          uid: key,
          ...data[key]
        }));
        setCaregivers(parsed);
      } else {
        setCaregivers([]);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [familyId]);

  const toggleDuty = async (uid: string, currentStatus: boolean) => {
    if (!familyId) return;
    try {
      await update(ref(db, `families/${familyId}/caregivers/${uid}`), {
        onDuty: !currentStatus
      });
    } catch (err) {
      console.error("Failed to update duty status", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-foreground">Care Schedule</h2>
          <p className="text-sm text-muted-foreground">Manage caregiver duty status</p>
        </div>
        <SkeletonList items={4} />
      </div>
    );
  }

  const activeCaregivers = caregivers.filter(c => c.onDuty);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Calendar className="size-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">On-Duty Schedule</h2>
          </div>
          <p className="text-sm text-muted-foreground pl-14">
            Manage who is currently the primary contact. On-duty caregivers receive emergency alerts first.
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6 p-4 bg-muted/50 rounded-xl border border-border">
            <ShieldCheck className="size-5 text-primary" />
            <span className="text-sm text-foreground font-medium">
              Currently On-Duty: {activeCaregivers.length > 0 ? activeCaregivers.map(c => c.name).join(", ") : "No one is on duty! Please assign someone."}
            </span>
          </div>

          <div className="space-y-4">
            {caregivers.map((cg) => {
              const isMe = cg.uid === currentUid;
              return (
                <div key={cg.uid} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${cg.onDuty ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${cg.onDuty ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <User className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        {cg.name} {isMe && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">You</span>}
                      </h3>
                      <p className="text-sm text-muted-foreground">{cg.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${cg.onDuty ? 'text-primary' : 'text-muted-foreground'}`}>
                      {cg.onDuty ? 'On Duty' : 'Off Duty'}
                    </span>
                    <button 
                      onClick={() => toggleDuty(cg.uid, cg.onDuty)}
                      disabled={!isMe && cg.role !== 'primary'} // only primary or self can toggle
                      className={`transition-colors ${cg.onDuty ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {cg.onDuty ? <ToggleRight className="size-8" /> : <ToggleLeft className="size-8" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
