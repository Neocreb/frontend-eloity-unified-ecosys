import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cryptoService } from "@/services/cryptoService";
import { StakingProduct } from "@/types/crypto";
import { CheckCircle2, Lock, Unlock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AdminDeFi: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<StakingProduct[]>([]);
  const [protocols, setProtocols] = useState<any[]>([]);

  useEffect(() => {
    cryptoService.getStakingProducts().then(setProducts);
    cryptoService.getDeFiProtocols().then(setProtocols);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">DeFi Management</h1>
        <p className="text-muted-foreground">Overview of staking products and protocols</p>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Staking Products</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{p.asset}</span>
                    <Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'Active' : 'Disabled'}</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">Type: {p.type}</div>
                  <div className="text-sm">APY: {p.apy}%</div>
                  {p.duration && <div className="text-sm">Lock: {p.duration} days</div>}
                  <div className="text-xs text-muted-foreground">Min: {p.minAmount}</div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={()=>toast({ title: 'Toggled (preview)' })}>
                      {p.isActive ? <Lock className="h-4 w-4 mr-1"/> : <Unlock className="h-4 w-4 mr-1"/>}
                      {p.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button size="sm" onClick={()=>toast({ title: 'Saved' })}><CheckCircle2 className="h-4 w-4 mr-1"/>Save</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="protocols">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {protocols.map(pr => (
              <Card key={pr.id}>
                <CardHeader>
                  <CardTitle>{pr.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{pr.description}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">Type: {pr.type}</div>
                  <div className="text-sm">TVL: ${pr.tvl.toLocaleString()}</div>
                  <div className="text-sm">APY: {pr.apyRange.min}% - {pr.apyRange.max}%</div>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {pr.assets.map((a: string) => <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDeFi;
