import { useState, useEffect } from 'react';
import { Shield, Check, X, Clock } from 'lucide-react';
import { db, ref, onValue, update } from '../../lib/db';
import { auth } from '../../lib/firebase';
import { SkeletonList } from './ui/skeleton';

interface JoinRequest {
  id: string;
  uid?: string;
  userId?: string;
  name: string;
  email?: string;
  timestamp?: string;
  createdAt?: string;
  status: 'pending' | 'approved' | 'denied';
}

interface JoinRequestsProps {
  familyId: string;
}

export function JoinRequests({ familyId }: JoinRequestsProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) return;

    const requestsRef = ref(db, `families/${familyId}/joinRequests`);
    const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsedRequests: JoinRequest[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).filter(req => req.status === 'pending');
        setRequests(parsedRequests);
      } else {
        setRequests([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeRequests();
    };
  }, [familyId]);

  const handleApprove = async (request: JoinRequest) => {
    if (!familyId) return;
    try {
      // 1. Update request status
      const requestRef = ref(db, `families/${familyId}/joinRequests/${request.id}`);
      await update(requestRef, { status: 'approved' });

      // 2. Grant user access
      const targetUid = request.uid || request.userId;
      if (!targetUid) throw new Error("No UID found in request");
      const userRef = ref(db, `users/${targetUid}`);
      await update(userRef, { accessStatus: 'active' });
    } catch (err) {
      console.error("Failed to approve request", err);
    }
  };

  const handleDeny = async (request: JoinRequest) => {
    if (!familyId) return;
    try {
      // 1. Update request status
      const requestRef = ref(db, `families/${familyId}/joinRequests/${request.id}`);
      await update(requestRef, { status: 'denied' });
      
      // We don't change user accessStatus, so they remain 'pending' and blocked
    } catch (err) {
      console.error("Failed to deny request", err);
    }
  };

  if (loading && familyId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-foreground">Join Requests</h2>
          <p className="text-sm text-muted-foreground">Manage who has access to this device</p>
        </div>
        <SkeletonList items={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-foreground">Join Requests</h2>
          <p className="text-sm text-muted-foreground">Manage who has access to this device</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="inline-flex p-4 bg-muted rounded-full mb-4">
              <Shield className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No pending requests</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              When new family members or caregivers try to link to your device, their requests will appear here for your approval.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {requests.map(request => (
              <li key={request.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-warning/10 text-warning rounded-xl flex-shrink-0 mt-1 sm:mt-0">
                    <Clock className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-foreground">{request.name}</h4>
                    {request.email && <p className="text-sm text-muted-foreground mb-1">{request.email}</p>}
                    <p className="text-xs text-muted-foreground">Requested: {new Date(request.createdAt || request.timestamp || '').toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleDeny(request)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl transition-colors text-sm font-medium border border-border"
                  >
                    <X className="size-4" />
                    Deny
                  </button>
                  <button
                    onClick={() => handleApprove(request)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors text-sm font-medium shadow-sm"
                  >
                    <Check className="size-4" />
                    Approve
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
