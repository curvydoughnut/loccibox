import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Copy, Plus, Trash2, Ban } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/keys")({
  head: () => ({ meta: [{ title: "API Keys — SandboxAPI" }] }),
  component: Page,
});

type ApiKey = {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: "active" | "revoked";
  rateLimit: number | null;
  maxConcurrent: number;
  timeout: number;
};

function genKey() {
  const r = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `sk_live_${r.slice(0, 32)}`;
}

const initial: ApiKey[] = [
  { id: "1", name: "Production API", key: genKey(), created: "May 12, 2026", lastUsed: "2 hours ago", status: "active", rateLimit: 100, maxConcurrent: 10, timeout: 30 },
  { id: "2", name: "Staging Tests", key: genKey(), created: "May 8, 2026", lastUsed: "1 day ago", status: "active", rateLimit: 60, maxConcurrent: 5, timeout: 30 },
  { id: "3", name: "Legacy CLI", key: genKey(), created: "Apr 21, 2026", lastUsed: "Never", status: "revoked", rateLimit: null, maxConcurrent: 3, timeout: 15 },
];

function Page() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;

  const [keys, setKeys] = useState<ApiKey[]>(initial);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [maxConc, setMaxConc] = useState(5);
  const [timeout_, setTimeout_] = useState(30);
  const [rateLimited, setRateLimited] = useState(true);
  const [rate, setRate] = useState(100);
  const [created, setCreated] = useState<ApiKey | null>(null);

  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reset = () => { setName(""); setMaxConc(5); setTimeout_(30); setRateLimited(true); setRate(100); };

  const create = () => {
    if (!name.trim()) { toast.error("Key name required"); return; }
    const k: ApiKey = {
      id: String(Date.now()),
      name: name.trim(),
      key: genKey(),
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      lastUsed: "Never",
      status: "active",
      rateLimit: rateLimited ? rate : null,
      maxConcurrent: maxConc,
      timeout: timeout_,
    };
    setKeys((k0) => [k, ...k0]);
    setCreated(k);
    setOpen(false);
    reset();
    toast.success("API Key created successfully");
  };

  const copy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Copied to clipboard");
  };

  const revoke = () => {
    if (!revokeId) return;
    setKeys((ks) => ks.map((k) => k.id === revokeId ? { ...k, status: "revoked" } : k));
    setRevokeId(null);
    toast.success("API Key revoked");
  };

  const del = () => {
    if (!deleteId) return;
    setKeys((ks) => ks.filter((k) => k.id !== deleteId));
    setDeleteId(null);
    toast.success("API Key deleted");
  };

  return (
    <AppLayout>
      <div className="p-8 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground mt-1">Manage your API keys and rate limits</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-gradient-brand text-primary-foreground hover:opacity-90 h-10">
            <Plus className="w-4 h-4 mr-2" /> Create New API Key
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Key Name</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium">Last Used</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Rate Limit</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k, i) => (
                <tr key={k.id} className={cn("border-t border-border hover:bg-accent/40 transition-colors", i % 2 && "bg-muted/10")}>
                  <td className="px-6 py-3">
                    <div className="font-medium">{k.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{k.key.slice(0, 14)}…{k.key.slice(-4)}</div>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{k.created}</td>
                  <td className="px-6 py-3 text-muted-foreground">{k.lastUsed}</td>
                  <td className="px-6 py-3">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-xs border",
                      k.status === "active" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border"
                    )}>
                      {k.status === "active" ? "Active" : "Revoked"}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs">{k.rateLimit ? `${k.rateLimit}/min` : "Unlimited"}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => copy(k.key)}><Copy className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" disabled={k.status === "revoked"} onClick={() => setRevokeId(k.id)}>
                        <Ban className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(k.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Create modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>Configure limits and rate controls for this key.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kn">Key Name</Label>
              <Input id="kn" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Production API" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mc">Max Concurrent</Label>
                <Input id="mc" type="number" min={1} max={100} value={maxConc} onChange={(e) => setMaxConc(+e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">Timeout (seconds)</Label>
                <Input id="to" type="number" min={1} max={300} value={timeout_} onChange={(e) => setTimeout_(+e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <Label htmlFor="rl">Rate Limited</Label>
                <p className="text-xs text-muted-foreground">Limit requests per minute</p>
              </div>
              <Switch id="rl" checked={rateLimited} onCheckedChange={setRateLimited} />
            </div>
            {rateLimited && (
              <div className="space-y-2">
                <Label htmlFor="r">Max requests per minute</Label>
                <Input id="r" type="number" min={1} value={rate} onChange={(e) => setRate(+e.target.value)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create} className="bg-gradient-brand text-primary-foreground hover:opacity-90">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show created key */}
      <Dialog open={!!created} onOpenChange={(v) => !v && setCreated(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription className="text-warning">Save this key somewhere safe — you won't see it again.</DialogDescription>
          </DialogHeader>
          {created && (
            <div className="space-y-2">
              <Label>{created.name}</Label>
              <div className="flex gap-2">
                <code className="flex-1 px-3 py-2 rounded-md bg-background border border-border font-mono text-xs break-all">{created.key}</code>
                <Button onClick={() => copy(created.key)} variant="outline"><Copy className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCreated(null)} className="bg-gradient-brand text-primary-foreground">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!revokeId} onOpenChange={(v) => !v && setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this API key?</AlertDialogTitle>
            <AlertDialogDescription>This will immediately invalidate the key.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={revoke} className="bg-destructive text-destructive-foreground">Revoke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this API key?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={del} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
