import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function Earnings(){
  const { stats, earnings } = useOutletContext() as any;
  const formatCurrency = (amount:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amount);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-600">This Week</p><p className="text-xl font-bold">{formatCurrency(stats.weekEarnings)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-600">This Month</p><p className="text-xl font-bold">{formatCurrency(stats.monthEarnings)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-600">Total Tips</p><p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalTips)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-600">Bonuses</p><p className="text-xl font-bold text-purple-600">{formatCurrency(stats.bonusesEarned)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">Earnings History <button className="btn"><Download className="h-4 w-4 mr-2"/>Export</button></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {earnings.map((e:any)=> (
              <div key={e.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">{e.type}</div>
                  <div>
                    <p className="font-medium">{e.description}</p>
                    <p className="text-sm text-gray-500">{new Date(e.date).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+{formatCurrency(e.amount)}</p>
                  <div className="text-xs">{e.status}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
