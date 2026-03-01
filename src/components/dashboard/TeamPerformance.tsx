'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamPerformance as TeamPerformanceType } from '@/types';

interface TeamPerformanceProps {
  performance: TeamPerformanceType[];
  title?: string;
}

export function TeamPerformance({ performance, title = '📊 Team Performance (24h)' }: TeamPerformanceProps) {
  const maxMessages = Math.max(...performance.map(p => p.messages_sent), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {performance.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data available</p>
        ) : (
          performance.map((member) => {
            const percentage = (member.messages_sent / maxMessages) * 100;
            
            return (
              <div key={member.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{member.team_member}</span>
                  <span className="text-muted-foreground">
                    {member.messages_sent} msgs
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{member.conversations_handled} conversations</span>
                  {member.avg_response_time_minutes && (
                    <span>~{member.avg_response_time_minutes}m response</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
