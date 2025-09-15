import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiCall } from "@/lib/api";
import { CheckCircle, XCircle, Clock, Activity } from "lucide-react";

interface HealthStatus {
  endpoint: string;
  name: string;
  status: "success" | "error" | "loading";
  response?: any;
  error?: string;
}

export function ApiHealthChecker() {
  const [isComprehensiveMode, setIsComprehensiveMode] = useState(true);
  const [healthChecks, setHealthChecks] = useState<HealthStatus[]>([
    { endpoint: "/health", name: "Server Health", status: "loading" },
    { endpoint: "/api/wallet", name: "Wallet API", status: "loading" },
    { endpoint: "/api/premium/status", name: "Premium API", status: "loading" },
    { endpoint: "/api/boosts", name: "Boost API", status: "loading" },
    { endpoint: "/api/admin/dashboard", name: "Admin API", status: "loading" },
  ]);

  const runHealthChecks = async () => {
    setHealthChecks((prev) =>
      prev.map((check) => ({ ...check, status: "loading" })),
    );

    for (let i = 0; i < healthChecks.length; i++) {
      const check = healthChecks[i];

      try {
        const response = await apiCall(check.endpoint);

        setHealthChecks((prev) =>
          prev.map((item, index) =>
            index === i
              ? { ...item, status: "success", response, error: undefined }
              : item,
          ),
        );
      } catch (error) {
        setHealthChecks((prev) =>
          prev.map((item, index) =>
            index === i
              ? {
                  ...item,
                  status: "error",
                  error:
                    check.endpoint === "/health"
                      ? error instanceof Error
                        ? error.message
                        : "Unknown error"
                      : "API not available (basic server mode)",
                }
              : item,
          ),
        );
      }
    }
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "loading":
        return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "error":
        return "text-red-600 bg-red-50";
      case "loading":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const successCount = healthChecks.filter(
    (check) => check.status === "success",
  ).length;
  const overallHealth =
    successCount === healthChecks.length
      ? "healthy"
      : successCount > 0
        ? "partial"
        : "unhealthy";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          API Health Status
        </CardTitle>
        <Badge
          variant={
            overallHealth === "healthy"
              ? "default"
              : overallHealth === "partial"
                ? "secondary"
                : "destructive"
          }
        >
          {successCount}/{healthChecks.length} Working
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {healthChecks.map((check, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 border rounded-lg"
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(check.status)}
              <span className="text-sm font-medium">{check.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(check.status)}>
                {check.status}
              </Badge>
              {check.status === "success" && check.response?.success && (
                <span className="text-xs text-green-600">✓ OK</span>
              )}
              {check.status === "error" && (
                <span className="text-xs text-red-600" title={check.error}>
                  ✗ Error
                </span>
              )}
            </div>
          </div>
        ))}

        <Button
          onClick={runHealthChecks}
          size="sm"
          variant="outline"
          className="w-full"
          disabled={healthChecks.some((check) => check.status === "loading")}
        >
          <Activity className="h-3 w-3 mr-1" />
          Re-check APIs
        </Button>

        {successCount === 1 && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            ℹ️ Running in basic server mode. Some comprehensive features require
            the enhanced backend.
          </div>
        )}

        {overallHealth === "healthy" && (
          <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded-lg">
            🎉 All comprehensive backend features are working!
          </div>
        )}

        {overallHealth === "partial" && (
          <div className="text-center text-sm text-yellow-600 bg-yellow-50 p-2 rounded-lg">
            ⚠️ Some features may not be available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
