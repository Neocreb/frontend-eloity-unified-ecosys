import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { giftCardService, GiftCardRecord, GiftCardStatus, updateGiftCardStatus, deleteGiftCardRecord } from "@/services/giftCardService";
import { Copy, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AdminGiftCards: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<GiftCardRecord[]>([]);
  const [status, setStatus] = useState<"all" | GiftCardStatus>("all");

  const refresh = () => giftCardService.list(200).then(setItems);

  useEffect(() => {
    refresh();
  }, []);

  const filtered = items.filter(i => status === 'all' ? true : i.status === status);

  const setStatusFor = (id: string, st: GiftCardStatus) => {
    const res = updateGiftCardStatus(id, st);
    if (res) {
      toast({ title: `Marked ${st}` });
      refresh();
    }
  };

  const remove = (id: string) => {
    if (deleteGiftCardRecord(id)) {
      toast({ title: "Deleted" });
      refresh();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gift Cards</h1>
        <p className="text-muted-foreground">View and manage gift card purchases/sells</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={(v: any)=>setStatus(v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="redeemed">Redeemed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="flex items-start justify-between rounded border p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge>{r.direction}</Badge>
                    <span className="font-medium">{r.retailerName}</span>
                    <Badge variant="secondary">{r.status}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Amount: ${r.amount.toFixed(2)}</div>
                  <div className="text-xs font-mono">{r.code}</div>
                </div>
                <div className="flex gap-2">
                  {r.status !== 'redeemed' && r.direction === 'buy' && (
                    <Button size="sm" onClick={()=>setStatusFor(r.id,'redeemed')}>
                      <CheckCircle2 className="h-4 w-4 mr-1"/> Mark Redeemed
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={()=>{navigator.clipboard.writeText(r.code); toast({ title: 'Copied' });}}>
                    <Copy className="h-4 w-4 mr-1"/> Copy Code
                  </Button>
                  <Button size="sm" variant="destructive" onClick={()=>remove(r.id)}>
                    <Trash2 className="h-4 w-4 mr-1"/> Delete
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-sm text-muted-foreground">No records.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGiftCards;
