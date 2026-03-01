'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/types';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

interface AlertsListProps {
  alerts: Alert[];
  onDismiss?: (alertId: string) => void;
}

export function AlertsList({ alerts, onDismiss }: AlertsListProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-300';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🚨 Alerts
          {alerts.length > 0 && (
            <Badge variant="destructive">{alerts.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active alerts</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              {getSeverityIcon(alert.severity)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.title}</p>
                {alert.message && (
                  <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                )}
                {alert.customer_name && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Customer: {alert.customer_name}
                  </p>
                )}
              </div>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
