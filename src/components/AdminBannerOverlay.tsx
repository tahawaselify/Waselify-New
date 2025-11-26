import React from 'react';
import { useAdminControl } from '@/hooks/useAdminControl';

interface Props { workflowName: string }

const levelClasses: Record<string, string> = {
  info: 'bg-blue-600',
  warn: 'bg-amber-600',
  error: 'bg-red-600',
};

export default function AdminBannerOverlay({ workflowName }: Props) {
  const { maintenance, banner } = useAdminControl(workflowName);

  const showOverlay = maintenance;
  const showBanner = !!banner?.message;
  const level = banner?.level || 'info';

  return (
    <>
      {showBanner && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 text-white rounded shadow ${levelClasses[level]}`}>
          <div className="font-semibold">{banner?.title || 'Notice'}</div>
          <div className="text-sm opacity-90">{banner?.message}</div>
        </div>
      )}
      {showOverlay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 text-center">
            <div className="text-xl font-semibold mb-2">Maintenance Mode</div>
            <div className="text-slate-600 mb-4">
              This dashboard is temporarily disabled by Admin. Please try again later.
            </div>
            <div className="text-xs text-slate-500">Workflow: {workflowName}</div>
          </div>
        </div>
      )}
    </>
  );
}

