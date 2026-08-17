import { cn } from "../ui/utils";

type Status = "online" | "low_battery" | "offline" | "unconfirmed" | "confirmed";

interface StatusBadgeProps {
  status: Status;
  text?: string;
}

export function StatusBadge({ status, text }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "online":
      case "confirmed":
        return "bg-success/15 text-success";
      case "low_battery":
        return "bg-warning/15 text-warning";
      case "offline":
      case "unconfirmed":
        return "bg-destructive/15 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = () => {
    if (text) return text;
    switch (status) {
      case "online": return "Online";
      case "low_battery": return "Low battery";
      case "offline": return "Offline";
      case "unconfirmed": return "Unconfirmed";
      case "confirmed": return "Confirmed";
      default: return "";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        getStatusStyles()
      )}
    >
      {getStatusText()}
    </span>
  );
}
