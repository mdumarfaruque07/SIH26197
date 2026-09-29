/**
 * Bulletproof Mobile & Desktop Body Scroll Lock
 *
 * Prevents background content from scrolling when a modal, drawer,
 * or full-screen viewer (Instagram Stories / Comments Drawer) is open.
 * Uses reference counting so multiple overlays don't conflict.
 */

let lockCount = 0;
let preservedScrollY = 0;

export function lockBodyScroll() {
  if (typeof document === 'undefined') return;

  lockCount++;
  if (lockCount === 1) {
    preservedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${preservedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-scroll-locked');
  }
}

export function unlockBodyScroll() {
  if (typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    const scrollY = preservedScrollY;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.classList.remove('modal-scroll-locked');
    window.scrollTo(0, scrollY);
  }
}
