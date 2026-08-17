import { Link, useLocation } from "react-router";
import { cn } from "../ui/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", section: "Overview" },
  { name: "Analytics", href: "/admin/analytics", section: "Overview" },
  { name: "Families", href: "/admin/families", section: "People", count: 248 },
  { name: "Review Queue", href: "/admin/review", section: "People" },
  { name: "Devices", href: "/admin/devices", section: "Monitoring" },
  { name: "Incidents", href: "/admin/incidents", section: "Monitoring", alert: 6 },
  { name: "Alert delivery", href: "/admin/alert-delivery", section: "Monitoring" },
  { name: "Tickets", href: "/admin/tickets", section: "Support", count: 14 },
  { name: "Audit log", href: "/admin/audit-log", section: "Support" },
  { name: "Settings", href: "/admin/settings", section: "System" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const groupedNav = navigation.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navigation>);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col justify-between">
        <div className="flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center px-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-8 rounded bg-primary text-primary-foreground font-semibold">
                G
              </div>
              <span className="font-semibold text-foreground">Guardian admin</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-6">
            {Object.entries(groupedNav).map(([section, items]) => (
              <div key={section}>
                <h3 className="px-2 text-xs font-medium text-muted-foreground mb-2">
                  {section}
                </h3>
                <ul className="space-y-1">
                  {items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "bg-secondary text-primary"
                              : "text-foreground hover:bg-secondary/50 hover:text-primary"
                          )}
                        >
                          <span>{item.name}</span>
                          {item.count !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              {item.count}
                            </span>
                          )}
                          {item.alert !== undefined && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/15 text-xs text-destructive">
                              {item.alert}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer profile */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex items-center justify-center size-8 rounded-full bg-secondary text-primary font-medium">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Admin</span>
              <span className="text-xs text-muted-foreground">Superadmin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
