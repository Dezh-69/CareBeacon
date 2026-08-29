import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { db, ref, onValue, update } from "../../../lib/db";
import { auth } from "../../../lib/firebase";
import { SkeletonTable } from "../ui/skeleton";
import { Search, Filter, HelpCircle, MessageSquare } from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  assignedTo: string;
  familyId: string;
  createdAt: string;
}

export function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [families, setFamilies] = useState<any>({});

  useEffect(() => {
    const ticketsRef = ref(db, 'admin/tickets');
    const familiesRef = ref(db, 'families');
    
    let currentTickets: any = {};
    
    const unsubTickets = onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedTickets = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTickets(parsedTickets);
      } else {
        setTickets([]);
      }
      setLoading(false);
    });

    const unsubFamilies = onValue(familiesRef, (snapshot) => {
      if (snapshot.exists()) {
        setFamilies(snapshot.val());
      }
    });

    return () => {
      unsubTickets();
      unsubFamilies();
    };
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await update(ref(db, `admin/tickets/${ticketId}`), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating ticket status", error);
    }
  };

  const handleAssign = async (ticketId: string, assignee: string) => {
    try {
      await update(ref(db, `admin/tickets/${ticketId}`), {
        assignedTo: assignee,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error assigning ticket", error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase()) || 
                          ticket.familyId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'in_progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'resolved': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Support Tickets</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage inbound support requests from families</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-64 transition-all"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-9 pr-8 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer text-foreground"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Grid/List */}
        {loading ? (
          <SkeletonTable rows={5} />
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Ticket Details</th>
                  <th className="px-6 py-4 font-medium">Family / Patient</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Assigned To</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <HelpCircle className="size-10 text-muted-foreground/30" />
                        <p>{search || filterStatus !== 'all' ? "No tickets match your filters." : "No support tickets found."}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                            <MessageSquare className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{ticket.title}</p>
                            <p className="text-xs text-muted-foreground max-w-xs truncate mt-0.5">{ticket.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {families[ticket.familyId] && (
                          <div className="font-medium text-foreground">
                            {families[ticket.familyId].patientName || families[ticket.familyId].monitoredPerson?.name || "Unknown"}
                          </div>
                        )}
                        <div className="font-mono text-xs text-muted-foreground mt-0.5">
                          {ticket.familyId}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {ticket.assignedTo ? (
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="text-sm">{ticket.assignedTo}</span>
                            {auth.currentUser?.email === ticket.assignedTo && (
                              <button 
                                onClick={() => handleAssign(ticket.id, "")}
                                className="text-xs text-destructive hover:underline"
                              >
                                Unassign
                              </button>
                            )}
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleAssign(ticket.id, auth.currentUser?.email || "Admin")}
                            className="text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md transition-colors"
                          >
                            Assign to me
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select 
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider focus:outline-none cursor-pointer ${getStatusColor(ticket.status)}`}
                        >
                          <option value="open">OPEN</option>
                          <option value="in_progress">IN PROGRESS</option>
                          <option value="resolved">RESOLVED</option>
                        </select>
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
