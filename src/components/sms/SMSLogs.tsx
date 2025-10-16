import React, { useState, useEffect } from 'react';
import { smsService } from '@/services/smsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface SMSLogsProps {
  userId?: string;
}

const SMSLogs: React.FC<SMSLogsProps> = ({ userId }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await smsService.getSMSLogs({
        page,
        limit: 10,
      });
      
      setLogs(result.logs);
      setTotalPages(result.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch SMS logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      case 'delivered':
        return <Badge variant="secondary">Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SMS Logs</CardTitle>
          <CardDescription>View your SMS message history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SMS Logs</CardTitle>
          <CardDescription>View your SMS message history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Logs</CardTitle>
        <CardDescription>View your SMS message history</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No SMS logs found
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{log.message.substring(0, 50)}...</div>
                    <div className="text-sm text-gray-500 mt-1">
                      To: {log.to_number}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {getStatusBadge(log.status)}
                    <div className="text-sm text-gray-500 mt-1">
                      {format(new Date(log.sent_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">
                    Provider: {log.provider}
                  </div>
                  {log.cost && (
                    <div className="text-sm font-medium">
                      Cost: ${log.cost.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center mt-6">
              <Button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </div>
              
              <Button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SMSLogs;