import { useState, useEffect } from "react";
import { getAuditLogs } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Eye, FilePlus, Pill, CheckCircle, KeyRound, Loader2, Hash, LucideIcon } from "lucide-react";

const actionIcons: Record<string, LucideIcon> = {
  CREATE: FilePlus,
  VIEW: Eye,
  MODIFY: FilePlus,
  DISPENSE: Pill,
  VERIFY: CheckCircle,
};

const actionColors: Record<string, string> = {
  CREATE: "bg-primary/10 text-primary",
  VIEW: "bg-accent/10 text-accent",
  MODIFY: "bg-warning/10 text-warning",
  DISPENSE: "bg-success/10 text-success",
  VERIFY: "bg-secondary text-secondary-foreground",
};

interface AuditTrailProps {
  prescriptionId: string;
  prescriptionCode?: string;
}

export default function AuditTrail({ prescriptionId, prescriptionCode }: AuditTrailProps) {
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await getAuditLogs(prescriptionId);
        setLogs(res.logs || []);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchLogs();
  }, [open, prescriptionId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Shield className="h-3.5 w-3.5" /> Audit Trail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
             Audit Trail
          </DialogTitle>
          {prescriptionCode && (
            <p className="text-sm text-muted-foreground font-mono">{prescriptionCode}</p>
          )}
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No audit records found</p>
          ) : (
            <div className="space-y-0 relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-6 bottom-6 w-px bg-border" />

              {logs.map((log, i) => {
                const Icon = actionIcons[log.action_type as string] || Eye;
                const color = actionColors[log.action_type as string] || "bg-muted text-muted-foreground";
                return (
                  <div key={log.id as string} className="relative flex items-start gap-3 py-3 pl-2">
                    <div className={`relative z-10 flex items-center justify-center h-7 w-7 rounded-full ${color} flex-shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="text-xs">{log.action_type as string}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at as string).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.user_role && <span className="capitalize">{String(log.user_role)}</span>}
                        {log.details && typeof log.details === 'object' && 'description' in log.details && <span> — {String((log.details as Record<string, unknown>).description)}</span>}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground truncate">{String(log.current_hash)?.substring(0, 16)}...</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
