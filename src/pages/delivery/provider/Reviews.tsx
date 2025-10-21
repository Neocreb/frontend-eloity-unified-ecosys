import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOutletContext } from 'react-router-dom';

export default function Reviews(){
  const { ratings, stats } = useOutletContext() as any;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.rating}</p><p className="text-sm text-gray-600">Overall Rating</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{ratings.length}</p><p className="text-sm text-gray-600">Total Reviews</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">4.8</p><p className="text-sm text-gray-600">Professionalism</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">4.7</p><p className="text-sm text-gray-600">Communication</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ratings.map((r:any)=> (
              <div key={r.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{r.customerName}</p>
                    <div className="flex items-center gap-2 mt-1"><span className="text-sm text-gray-500">Order #{r.orderNumber}</span></div>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(r.deliveryDate).toLocaleString()}</span>
                </div>
                <p className="text-gray-700">{r.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
