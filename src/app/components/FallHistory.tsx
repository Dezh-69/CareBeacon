import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin, Phone, Download } from 'lucide-react';
import { db, ref, onValue } from '../../lib/db';

interface FallEvent {
  id: string;
  timestamp: Date;
  status: 'resolved' | 'pending' | 'emergency' | 'confirmed' | 'cancelled';
  location: string;
  responseTime?: string;
  contactNotified?: string;
}

export function FallHistory() {
  const [fallEvents, setFallEvents] = useState<FallEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const deviceId = "device_001"; // Generic device ID for demo
    const eventsRef = ref(db, `events/${deviceId}`);
    
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const eventsData = snapshot.val();
        const parsedEvents: FallEvent[] = Object.keys(eventsData).map(key => ({
          id: key,
          timestamp: new Date(eventsData[key].timestamp),
          status: eventsData[key].status || 'pending',
          location: eventsData[key].location || 'Unknown',
          responseTime: eventsData[key].responseTime,
          contactNotified: eventsData[key].contactNotified
        })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setFallEvents(parsedEvents);
      } else {
        setFallEvents([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Incident History</h2>
          <p className="text-sm text-slate-400">Comprehensive fall detection records</p>
        </div>
        <button 
          onClick={() => {
            const csvContent = "data:text/csv;charset=utf-8," + 
              "ID,Timestamp,Status,Location,Response Time,Contact Notified\n" +
              fallEvents.map(e => `${e.id},${e.timestamp.toISOString()},${e.status},"${e.location}",${e.responseTime || ''},"${e.contactNotified || ''}"`).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `carebeacon_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 rounded-xl transition"
        >
          <Download className="size-4" />
          <span>Export Report</span>
        </button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <CheckCircle className="size-6 text-emerald-400" />
              </div>
              <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">All Time</span>
            </div>
            <p className="text-3xl font-bold mb-1">{fallEvents.length}</p>
            <p className="text-sm text-slate-400">Total Incidents</p>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Clock className="size-6 text-blue-400" />
              </div>
              <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg">Average</span>
            </div>
            <p className="text-3xl font-bold mb-1">5 min</p>
            <p className="text-sm text-slate-400">Response Time</p>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <AlertTriangle className="size-6 text-purple-400" />
              </div>
              <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg">March 2026</span>
            </div>
            <p className="text-3xl font-bold mb-1">1</p>
            <p className="text-sm text-slate-400">This Month</p>
          </div>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-purple-500/5 rounded-2xl blur-2xl"></div>
        
        <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6">Event Timeline</h3>
          
          <div className="space-y-4">
            {fallEvents.map((event, index) => (
              <div key={event.id} className="relative group">
                {/* Connector line */}
                {index < fallEvents.length - 1 && (
                  <div className="absolute left-[22px] top-12 bottom-0 w-px bg-gradient-to-b from-slate-700 to-transparent"></div>
                )}
                
                <div className="relative bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-all duration-200 hover:bg-slate-800/50">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`relative flex-shrink-0 p-2.5 rounded-lg ${
                      event.status === 'resolved' ? 'bg-emerald-500/10' : 
                      event.status === 'confirmed' ? 'bg-blue-500/10' : 
                      event.status === 'cancelled' ? 'bg-slate-500/10' : 
                      event.status === 'pending' ? 'bg-amber-500/10' : 
                      'bg-red-500/10'
                    }`}>
                      {event.status === 'resolved' ? (
                        <CheckCircle className="size-5 text-emerald-400" />
                      ) : event.status === 'confirmed' ? (
                        <CheckCircle className="size-5 text-blue-400" />
                      ) : event.status === 'cancelled' ? (
                        <AlertTriangle className="size-5 text-slate-400" />
                      ) : event.status === 'pending' ? (
                        <Clock className="size-5 text-amber-400" />
                      ) : (
                        <AlertTriangle className="size-5 text-red-400" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold mb-1">Fall Detected</p>
                          <p className="text-sm text-slate-400">{event.timestamp.toLocaleString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          event.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          event.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                          event.status === 'cancelled' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : 
                          event.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-lg">
                          <MapPin className="size-4 text-slate-400 flex-shrink-0" />
                          <span className="text-xs text-slate-300 truncate">{event.location}</span>
                        </div>
                        {event.responseTime && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-lg">
                            <Clock className="size-4 text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-300">{event.responseTime}</span>
                          </div>
                        )}
                        {event.contactNotified && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-lg">
                            <Phone className="size-4 text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-300 truncate">{event.contactNotified}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {fallEvents.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex p-6 bg-slate-800/30 rounded-2xl mb-4">
                <CheckCircle className="size-12 text-slate-600" />
              </div>
              <p className="text-slate-400">No incidents recorded</p>
              <p className="text-sm text-slate-500 mt-2">All systems operational</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
