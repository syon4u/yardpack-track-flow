import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Users, User, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ManualNotification {
  id: string;
  sender_id: string;
  recipient_type: string;
  recipient_ids: any;
  recipient_emails: any;
  subject: string;
  message_body: string;
  sent_at: string;
  profiles: {
    full_name: string;
  };
}

const ManualMessageHistory: React.FC = () => {
  const { user, profile } = useAuth();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['manual-notifications', user?.id],
    queryFn: async (): Promise<ManualNotification[]> => {
      if (!user || profile?.role !== 'admin') return [];

      const { data, error } = await supabase
        .from('manual_notifications')
        .select(`
          *,
          profiles:sender_id(full_name)
        `)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching manual notifications:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && profile?.role === 'admin',
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Message History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Message History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Sent</h3>
            <p className="text-gray-600">Manual messages sent by admins will appear here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Message History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map(message => (
            <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{message.subject}</h4>
                  <p className="text-sm text-gray-600">
                    Sent by {message.profiles?.full_name || 'Unknown Admin'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={message.recipient_type === 'broadcast' ? 'default' : 'secondary'}>
                    {message.recipient_type === 'broadcast' ? (
                      <Users className="h-3 w-3 mr-1" />
                    ) : (
                      <User className="h-3 w-3 mr-1" />
                    )}
                    {message.recipient_type === 'broadcast' ? 'Broadcast' : 'Individual'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {Array.isArray(message.recipient_emails) ? message.recipient_emails.length : 1} recipient{Array.isArray(message.recipient_emails) && message.recipient_emails.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {message.message_body}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(message.sent_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualMessageHistory;