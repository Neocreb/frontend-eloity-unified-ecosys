import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { giftCardService, type GiftCardRecord } from "@/services/giftCardService";
import { Copy, Gift, Store } from "lucide-react";

const GiftCards = () => {
  const [items, setItems] = useState<GiftCardRecord[]>([]);

  useEffect(()=>{
    giftCardService.list().then(setItems);
  },[]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gift Cards</CardTitle>
          <CardDescription>View purchased and sold gift cards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">No gift cards yet.</div>
          )}
          {items.map((gc)=> (
            <div key={gc.id} className="p-3 border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                {gc.direction === 'buy' ? <Gift className="h-5 w-5 text-pink-600"/> : <Store className="h-5 w-5 text-emerald-600"/>}
                <div>
                  <div className="text-sm font-medium">{gc.retailerName} • ${gc.amount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{new Date(gc.createdAt).toLocaleString()}</div>
                  <div className="text-xs mt-1 flex items-center gap-2">
                    <code className="px-1.5 py-0.5 bg-muted rounded">{gc.code}</code>
                    <Button size="xs" variant="outline" onClick={()=>copy(gc.code)} className="h-7 px-2">
                      <Copy className="h-3.5 w-3.5"/>
                      Copy
                    </Button>
                    {gc.payout ? <span className="text-xs text-emerald-600">Payout ${gc.payout.toFixed(2)}</span> : null}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">{gc.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GiftCards;
