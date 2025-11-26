import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type AdminBanner = { title?: string; message?: string; level?: 'info' | 'warn' | 'error' } | null;

export function useAdminControl(workflowName: string) {
  const [maintenance, setMaintenance] = useState(false);
  const [banner, setBanner] = useState<AdminBanner>(null);
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);
  const [timeWindowDays, setTimeWindowDays] = useState<number | undefined>(undefined);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load overrides
      const { data: overrides } = await supabase
        .from('dashboard_overrides')
        .select('*')
        .eq('user_id', user.id)
        .like('workflow_name', `${workflowName}%`)
        .maybeSingle();

      if (overrides) {
        setHiddenWidgets(overrides.hidden_widgets || []);
        setBanner(overrides.banner || null);
        setTimeWindowDays(overrides.time_window_days ?? undefined);
      }

      // Subscribe to admin_commands for this user
      channel = supabase
        .channel(`admin_commands_${workflowName}_${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_commands',
          filter: `user_id=eq.${user.id}`
        }, (payload: any) => {
          const row = payload.new || {};
          if (!row.workflow_name?.startsWith(workflowName)) return;
          if (row.command === 'maintenanceOn') setMaintenance(true);
          if (row.command === 'maintenanceOff') setMaintenance(false);
          if (row.command === 'showBanner') setBanner({ title: 'Notice', message: row.message || '', level: 'info' });
          if (row.command === 'forceReload') window.location.reload();
          window.dispatchEvent(new CustomEvent('adminCommandReceived', { detail: { workflowName, row } }));
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') setConnected(true);
        });
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [workflowName]);

  return { maintenance, banner, hiddenWidgets, timeWindowDays, connected };
}

