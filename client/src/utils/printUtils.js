/**
 * Universal Printing Utility for SanskritiKhoj
 * Manages clean @media print orchestration by isolating designated printable documents
 * and hiding main application chrome, drawers, modals, and navigation.
 */

export const triggerPrint = (printType = 'printing-invoice', onComplete) => {
  if (typeof window === 'undefined') return;

  // Remove any stale printing classes
  document.body.classList.remove(
    'printing-invoice',
    'printing-standee',
    'printing-shipping-slip'
  );

  // Add the targeted print class to body
  document.body.classList.add(printType);

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    document.body.classList.remove(printType);
    window.removeEventListener('afterprint', cleanup);
    if (typeof onComplete === 'function') {
      onComplete();
    }
  };

  // Modern browsers fire 'afterprint' when dialog closes (printed or cancelled)
  window.addEventListener('afterprint', cleanup);

  // Fallback timeout in case browser does not support or fire afterprint
  setTimeout(() => {
    try {
      window.print();
    } catch (e) {
      console.error('Print trigger error:', e);
      cleanup();
    }
  }, 120);

  // Safety fallback after 4 seconds to ensure body state is always restored
  setTimeout(cleanup, 4000);
};
