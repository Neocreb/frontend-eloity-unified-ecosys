import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useNotification } from "@/hooks/use-notification";
import { AdminService } from "@/services/adminService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Database,
  Server,
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Shield,
  RefreshCw,
} from "lucide-react";

interface SystemMetrics {
  cpu: { usage: number; cores: number; temperature: number };
  memory: { used: number; total: number; percentage: number };
  disk: { used: number; total: number; percentage: number };
  network: { inbound: number; outbound: number; latency: number };
  database: { connections: number; queries: number; responseTime: number };
  uptime: number;
  loadAverage: number[];
}

interface ServiceStatus {
  name: string;
  status: "healthy" | "warning" | "error" | "offline";
  uptime: number;
  lastCheck: string;
  responseTime: number;
  endpoint?: string;
  version?: string;
}

interface SystemAlert {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  severity: "low" | "medium" | "high" | "critical";
}

const AdminSystem = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  const notification = useNotification();

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      setIsLoading(true);
      
      // Use real API call for system metrics
      const response = await AdminService.getSystemMetrics();
      
      if (response.success) {
        const data = response.data;
        setMetrics(data.metrics || {});
        setServices(data.services || []);
        setAlerts(data.alerts || []);
        setHistoricalData(data.historicalData || []);
      } else {
        throw new Error(response.error || 'Failed to load system metrics');
      }
    } catch (error) {
      console.error("Error loading system data:", error);
      notification.error("Failed to load system data");
      
      // Fallback to mock data if API fails
      const mockMetrics: SystemMetrics = {
        cpu: { usage: 45.2, cores: 8, temperature: 65 },
        memory: { used: 6.2, total: 16, percentage: 38.8 },
        disk: { used: 128, total: 512, percentage: 25.0 },
        network: { inbound: 45.6, outbound: 23.8, latency: 12 },
        database: { connections: 45, queries: 1250, responseTime: 8.5 },
        uptime: 2592000,
        loadAverage: [1.2, 1.5, 1.8],
      };
      
      const mockServices: ServiceStatus[] = [
        {
          name: "Web Server",
          status: "healthy",
          uptime: 99.9,
          lastCheck: new Date().toISOString(),
          responseTime: 45,
          endpoint: "https://api.eloity.com/health",
          version: "1.2.3",
        },
      ];
      
      const mockAlerts: SystemAlert[] = [
        {
          id: "alert-001",
          type: "warning",
          title: "API Connection Issue",
          message: "Using fallback data - API not available",
          timestamp: new Date().toISOString(),
          resolved: false,
          severity: "medium",
        },
      ];
      
      setMetrics(mockMetrics);
      setServices(mockServices);
      setAlerts(mockAlerts);
      setHistoricalData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      healthy: "bg-green-500 text-white",
      warning: "bg-yellow-500 text-white",
      error: "bg-red-500 text-white",
      offline: "bg-gray-500 text-white",
    };
    return colors[status] || "bg-gray-500 text-white";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      healthy: <CheckCircle className="w-4 h-4" />,
      warning: <AlertTriangle className="w-4 h-4" />,
      error: <XCircle className="w-4 h-4" />,
      offline: <Clock className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[severity] || "bg-gray-100 text-gray-800";
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Health
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor server performance and system status
          </p>
        </div>
        <Button onClick={loadSystemData} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-blue-500/10 p-3 rounded-full mb-4">
                <Cpu className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{metrics.cpu.usage}%</div>
              <div className="text-sm text-gray-600">CPU Usage</div>
              <Progress value={metrics.cpu.usage} className="w-full mt-2" />
              <div className="text-xs text-gray-500 mt-1">
                {metrics.cpu.cores} cores • {metrics.cpu.temperature}°C
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-green-500/10 p-3 rounded-full mb-4">
                <MemoryStick className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{metrics.memory.percentage}%</div>
              <div className="text-sm text-gray-600">Memory Usage</div>
              <Progress value={metrics.memory.percentage} className="w-full mt-2" />
              <div className="text-xs text-gray-500 mt-1">
                {formatBytes(metrics.memory.used * 1024 * 1024 * 1024)} / {formatBytes(metrics.memory.total * 1024 * 1024 * 1024)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-purple-500/10 p-3 rounded-full mb-4">
                <HardDrive className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{metrics.disk.percentage}%</div>
              <div className="text-sm text-gray-600">Disk Usage</div>
              <Progress value={metrics.disk.percentage} className="w-full mt-2" />
              <div className="text-xs text-gray-500 mt-1">
                {formatBytes(metrics.disk.used * 1024 * 1024 * 1024)} / {formatBytes(metrics.disk.total * 1024 * 1024 * 1024)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-orange-500/10 p-3 rounded-full mb-4">
                <Wifi className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold">{metrics.network.latency}ms</div>
              <div className="text-sm text-gray-600">Network Latency</div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                ↑ {metrics.network.outbound} MB/s<br />
                ↓ {metrics.network.inbound} MB/s
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Performance (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                <Line type="monotone" dataKey="network" stroke="#ffc658" name="Network %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="responseTime" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Response Time (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Service Status
              </CardTitle>
              <CardDescription>
                Monitor all platform services and dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <Card key={service.name} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(service.status)}
                          <h3 className="font-medium">{service.name}</h3>
                        </div>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Uptime:</span>
                          <span className="font-medium">{service.uptime}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Response:</span>
                          <span className="font-medium">{service.responseTime}ms</span>
                        </div>
                        {service.version && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Version:</span>
                            <span className="font-medium">{service.version}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Last check: {new Date(service.lastCheck).toLocaleTimeString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                System Alerts
              </CardTitle>
              <CardDescription>
                Recent system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Alert key={alert.id} className="border">
                    <AlertTriangle className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{alert.title}</h4>
                        <div className="flex gap-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {alert.resolved && (
                            <Badge className="bg-green-100 text-green-800">
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                      <AlertDescription className="mb-2">
                        {alert.message}
                      </AlertDescription>
                      <div className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  System logs viewer will be implemented with log aggregation and search functionality.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSystem;