// components/ui/toast.tsx
'use client';
export function showToast(message: string, type: 'success' | 'error' = 'success') {
  const el = document.createElement('div');
  el.textContent = message;
  el.style.position = 'fixed';
  el.style.right = '20px';
  el.style.bottom = '20px';
  el.style.padding = '10px 14px';
  el.style.background = type === 'success' ? '#059669' : '#dc2626';
  el.style.color = 'white';
  el.style.borderRadius = '8px';
  el.style.zIndex = '9999';
  el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
  document.body.appendChild(el);
  setTimeout(() => (el.style.opacity = '0'), 2200);
  setTimeout(() => el.remove(), 2600);
}
