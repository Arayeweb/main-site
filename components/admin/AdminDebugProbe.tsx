'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { agentDebugLog } from '@/lib/agentDebug';

function hypothesisForPath(pathname: string, eventType: 'route' | 'click' | 'submit') {
  if (pathname.includes('/ai-ops/costs')) return 'H4';
  if (pathname.includes('/ai-ops/content') || pathname.includes('/ai-ops/campaigns')) return 'H5';
  if (eventType === 'submit') return 'H3';
  if (pathname.includes('/login')) return 'H1';
  return 'H2';
}

function safeText(text: string | null | undefined) {
  return (text ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

export function AdminDebugProbe() {
  const pathname = usePathname();

  useEffect(() => {
    agentDebugLog(
      'components/admin/AdminDebugProbe.tsx:route',
      'admin_route_view',
      { pathname },
      hypothesisForPath(pathname, 'route')
    );
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const control = target?.closest('button,a') as HTMLButtonElement | HTMLAnchorElement | null;
      if (!control) return;

      agentDebugLog(
        'components/admin/AdminDebugProbe.tsx:click',
        'admin_control_click',
        {
          pathname: window.location.pathname,
          tag: control.tagName.toLowerCase(),
          type: control instanceof HTMLButtonElement ? control.type || 'button' : null,
          label: safeText(control.textContent || control.getAttribute('aria-label')),
          href: control instanceof HTMLAnchorElement ? control.getAttribute('href') : null,
        },
        hypothesisForPath(window.location.pathname, 'click')
      );
    }

    function handleSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement | null;
      queueMicrotask(() => {
        agentDebugLog(
          'components/admin/AdminDebugProbe.tsx:submit',
          'admin_form_submit',
          {
            pathname: window.location.pathname,
            method: form?.method || 'get',
            action: form?.getAttribute('action') || null,
            prevented: event.defaultPrevented,
          },
          hypothesisForPath(window.location.pathname, 'submit')
        );
      });
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('submit', handleSubmit, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', handleSubmit, true);
    };
  }, []);

  return null;
}
