'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SupportConversation } from '@/types';

interface SupportQueueProps {
  conversations: SupportConversation[];
  title?: string;
}

export function SupportQueue({ conversations, title = '📬 Support Queue' }: SupportQueueProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      default:
        return '🟡';
    }
  };

  const urgentCount = conversations.filter(c => c.priority === 'urgent').length;
  const highCount = conversations.filter(c => c.priority === 'high').length;
  const normalCount = conversations.filter(c => c.priority === 'normal' || c.priority === 'low').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">🔴 Urgent</span>
            <Badge variant="destructive">{urgentCount}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">🟠 High Priority</span>
            <Badge>{highCount}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">🟡 Normal</span>
            <Badge variant="secondary">{normalCount}</Badge>
          </div>
        </div>

        {conversations.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Recent:</h4>
            {conversations.slice(0, 5).map((conv) => (
              <div
                key={conv.id}
                className="flex items-start gap-2 p-2 rounded-lg border bg-card text-card-foreground"
              >
                <span className="text-lg">{getPriorityEmoji(conv.priority)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {conv.contact_name || 'Unknown'}
                  </p>
                  {conv.company_name && (
                    <p className="text-xs text-muted-foreground">{conv.company_name}</p>
                  )}
                  {conv.last_message_body && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {conv.last_message_body}
                    </p>
                  )}
                </div>
                {conv.unread_count > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {conv.unread_count}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
