import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeMetrics = (workflowName: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Subscribe to real-time changes; rely on RLS for user scoping, and filter in handler by name prefix
      const subscription = supabase
        .channel(`workflow_executions_${workflowName}_${userId ?? 'anon'}`)
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'workflow_executions'
          },
          (payload) => {
            const row: any = payload.new || {};
            const name: string = row.workflow_name || '';
            if (!name.startsWith(workflowName)) return;

            // Show notification for new execution
            toast({
              title: 'New Execution',
              description: `${workflowName} workflow just completed successfully`,
            });

            // Broadcast event for dashboards
            window.dispatchEvent(new CustomEvent('workflowExecutionUpdate', {
              detail: { workflowName, data: row }
            }));
          }
        )
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'workflow_executions'
          },
          (payload) => {
            const row: any = payload.new || {};
            const name: string = row.workflow_name || '';
            if (!name.startsWith(workflowName)) return;

            window.dispatchEvent(new CustomEvent('workflowExecutionUpdate', {
              detail: { workflowName, data: row }
            }));
          }
        )
        .subscribe((status) => {
          if (!isMounted) return;
          setIsConnected(status === 'SUBSCRIBED');
          console.log(`Realtime subscription status for ${workflowName}:`, status);
        });

      return subscription;
    };

    let sub: any;
    setup().then((s) => { sub = s; });

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, [workflowName, toast]);

  return { isConnected };
}; 