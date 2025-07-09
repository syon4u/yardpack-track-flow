import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncSession {
  id: string;
  status: 'in_progress' | 'completed' | 'failed';
  total_shipments: number;
  processed_shipments: number;
  created_packages: number;
  updated_packages: number;
  created_customers: number;
  error_count: number;
  started_at: string;
  completed_at?: string;
}

export const useMagayaBulkSync = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Query for sync session status directly from database
  const { data: syncSession, isLoading: isSessionLoading } = useQuery({
    queryKey: ['magaya-sync-session', currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return null;
      
      const { data, error } = await supabase
        .from('magaya_sync_sessions')
        .select('*')
        .eq('id', currentSessionId)
        .single();

      if (error) {
        console.error('Error fetching sync session:', error);
        throw error;
      }
      
      return data as SyncSession;
    },
    enabled: !!currentSessionId,
    refetchInterval: currentSessionId ? 2000 : false, // Poll every 2 seconds when session is active
  });

  // Mutation to start bulk sync
  const startBulkSyncMutation = useMutation({
    mutationFn: async (supplierName: string = 'Jhavar Leakey') => {
      // Create sync session first
      const { data: session, error: sessionError } = await supabase
        .from('magaya_sync_sessions')
        .insert({
          initiated_by: (await supabase.auth.getUser()).data.user?.id,
          supplier_filter: supplierName,
          session_type: 'bulk_sync',
          status: 'in_progress',
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Start the bulk sync process
      const { data, error } = await supabase.functions.invoke('magaya-api', {
        body: {
          action: 'bulk_sync_from_supplier',
          sessionId: session.id,
          supplierName,
        },
      });

      if (error) throw error;

      setCurrentSessionId(session.id);
      return { session, result: data };
    },
    onSuccess: () => {
      toast.success('Bulk sync started successfully');
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['optimized-packages'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to start bulk sync: ${error.message}`);
      setCurrentSessionId(null);
    },
  });

  // Function to clear current session
  const clearSession = () => {
    setCurrentSessionId(null);
  };

  // Calculate progress percentage with fallbacks
  const progress = syncSession && syncSession.total_shipments > 0 ? 
    Math.min((syncSession.processed_shipments / syncSession.total_shipments) * 100, 100) : 0;

  // Check if sync is still in progress
  const isInProgress = syncSession?.status === 'in_progress';
  const isCompleted = syncSession?.status === 'completed';
  const isFailed = syncSession?.status === 'failed';

  return {
    startBulkSync: startBulkSyncMutation.mutate,
    isStarting: startBulkSyncMutation.isPending,
    syncSession,
    isSessionLoading,
    progress,
    isInProgress,
    isCompleted,
    isFailed,
    clearSession,
    currentSessionId,
  };
};