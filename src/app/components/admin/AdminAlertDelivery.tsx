import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { db, ref, onValue } from "../../../lib/db";
import { SkeletonTable } from "../ui/Skeleton";
import { Search, Filter, CheckCircle2, XCircle, Clock } from "lucide-react";

interface AlertDelivery {
  id: string;
  timestamp: Date;
  patientName: string;
  contactName: string;
  contactPhone: string;
  method: 'SMS' | 'Call' | 'Push';
  status: 'Delivered' | 'Failed' | 'Pending';
}

export function AdminAlertDelivery() {
  const [deliveries, setDeliveries] = useState<AlertDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // In a real implementation with Twilio/FCM, we would pull delivery receipts.
    // For now, we synthesize these from the events table.
    const eventsRef = ref(db, 'events');
    const familiesRef = ref(db, 'families');
    
    let currentEvents: any = {};
    let currentFamilies: any = {};
    
    const updateDeliveries = () => {
      const parsedDeliveries: AlertDelivery[] = [];
      
      Object.keys(currentEvents).forEach(deviceId => {
        const deviceEvents = currentEvents[deviceId];
        const family = Object.values(currentFamilies).find((f: any) => f.deviceId === deviceId) as any;
        const patientName = family ? family.patientName : "Unknown Patient";
        
        Object.keys(deviceEvents).forEach(eventId => {
          const ev = deviceEvents[eventId];
          
          if (ev.status === 'cancelled') return;
          
          // Use actual receipts from the hardware if they exist
          if (ev.receipts && Array.isArray(ev.receipts)) {
            ev.receipts.forEach((receipt: any, idx: number) => {
              parsedDeliveries.push({
                id: `${eventId}_receipt_${idx}`,
                timestamp: new Date(receipt.timestamp || ev.timestamp),
                patientName,
                contactName: receipt.contactName || 'Unknown',
                contactPhone: 'Hidden',
                method: receipt.method || 'Unknown',
                status: receipt.status || 'Pending'
              });
            });
          } else if (ev.contactNotified && ev.contactNotified !== 'None' && ev.contactNotified !== 'None (False Alarm)') {
            // Legacy/fallback synthesized log
            parsedDeliveries.push({
              id: `${eventId}_sms_legacy`,
              timestamp: new Date(ev.timestamp),
              patientName,
              contactName: ev.contactNotified,
              contactPhone: 'Hidden',
              method: 'SMS',
              status: 'Delivered'
            });
          }
        });
      });
      
      parsedDeliveries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setDeliveries(parsedDeliveries);
      setLoading(false);
    };

    const unsubEvents = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) currentEvents = snapshot.val();
      updateDeliveries();
    });

    const unsubFamilies = onValue(familiesRef, (snapshot) => {
      if (snapshot.exists()) currentFamilies = snapshot.val();
      updateDeliveries();
    });

    return () => {
      unsubEvents();
      unsubFamilies();
    };
  }, []);

  const filteredDeliveries = deliveries.filter(d => 
    d.patientName.toLowerCase().includes(search.toLowerCase()) || 
    d.contactName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Alert Delivery</h1>
            <p className="text-sm text-muted-foreground mt-1">Track SMS, Call, and Push notification delivery success</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search patient or contact..."
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

        {/* Deliveries Table */}
        {loading ? (
          <SkeletonTable rows={5} />
        ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground bg-muted/30">
                <tr>
                  <th className="font-medium px-6 py-4">Time</th>
                  <th className="font-medium px-6 py-4">Patient</th>
                  <th className="font-medium px-6 py-4">Contact</th>
                  <th className="font-medium px-6 py-4">Method</th>
                  <th className="font-medium px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      {search ? "No logs matched your search" : "No delivery logs recorded"}
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {delivery.timestamp.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">{delivery.patientName}</td>
                      <td className="px-6 py-4 text-foreground">{delivery.contactName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-muted rounded-lg text-xs font-medium text-muted-foreground">
                          {delivery.method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {delivery.status === 'Delivered' ? (
                          <div className="flex items-center gap-1.5 text-success">
                            <CheckCircle2 className="size-4" />
                            <span className="text-xs font-medium">Delivered</span>
                          </div>
                        ) : delivery.status === 'Failed' ? (
                          <div className="flex items-center gap-1.5 text-destructive">
                            <XCircle className="size-4" />
                            <span className="text-xs font-medium">Failed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-warning">
                            <Clock className="size-4" />
                            <span className="text-xs font-medium">Pending</span>
                          </div>
                        )}
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
