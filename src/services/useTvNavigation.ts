import { useEffect, useRef } from 'react';

interface UseTvNavigationOptions {
  enabled?: boolean;
}

/**
 * Tabulation and Spatial Navigation Hook engineered for Android TV,
 * Fire TV Stick, Android WebViews, and physical remote controllers (D-Pad & Tab).
 */
export function useTvNavigation({ enabled = true }: UseTvNavigationOptions = {}) {
  const lastFocusedCardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTvKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.keyCode || e.which;

      const isUp = key === 'ArrowUp' || code === 38 || code === 19;
      const isDown = key === 'ArrowDown' || code === 40 || code === 20;
      const isLeft = key === 'ArrowLeft' || code === 37 || code === 21;
      const isRight = key === 'ArrowRight' || code === 39 || code === 22;
      const isTab = key === 'Tab' || code === 9;
      const isEnter =
        key === 'Enter' ||
        key === ' ' ||
        code === 13 ||
        code === 23 || // Android DPAD_CENTER
        code === 66; // Android KEYCODE_ENTER

      if (!isUp && !isDown && !isLeft && !isRight && !isTab && !isEnter) {
        return;
      }

      const activeEl = document.activeElement as HTMLElement | null;

      // Collect all visible TV navigable elements in strict sequential order
      const navElements = Array.from(
        document.querySelectorAll<HTMLElement>(
          '#channel-search-input, [data-tv-nav="category"], [data-tv-card="true"]'
        )
      ).filter((el) => {
        return el.offsetParent !== null && !el.hasAttribute('disabled');
      });

      if (navElements.length === 0) return;

      // Handle TAB key explicitly for Android TV remote tab sequence
      if (isTab) {
        e.preventDefault();
        const currIdx = activeEl ? navElements.indexOf(activeEl) : -1;
        let nextIdx = 0;

        if (e.shiftKey) {
          // Backward tab
          nextIdx = currIdx > 0 ? currIdx - 1 : navElements.length - 1;
        } else {
          // Forward tab
          nextIdx = currIdx >= 0 && currIdx < navElements.length - 1 ? currIdx + 1 : 0;
        }

        const target = navElements[nextIdx];
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          if (target.getAttribute('data-tv-card') === 'true') {
            lastFocusedCardRef.current = target;
          }
        }
        return;
      }

      // If user is typing in the search bar, ArrowDown jumps into the categories or first card
      if (activeEl?.id === 'channel-search-input') {
        if (isDown) {
          e.preventDefault();
          const firstCategory = document.querySelector<HTMLElement>('[data-tv-nav="category"]');
          const firstCard = document.querySelector<HTMLElement>('[data-tv-card="true"]');
          const target = firstCategory || firstCard;
          if (target) {
            target.focus();
            target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            if (target.getAttribute('data-tv-card') === 'true') {
              lastFocusedCardRef.current = target;
            }
          }
        }
        return;
      }

      // If nothing is focused yet, activate the first target
      if (!activeEl || activeEl === document.body || !navElements.includes(activeEl)) {
        e.preventDefault();
        const target =
          lastFocusedCardRef.current && document.contains(lastFocusedCardRef.current)
            ? lastFocusedCardRef.current
            : document.querySelector<HTMLElement>('[data-tv-card="true"]') || navElements[0];
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          lastFocusedCardRef.current = target;
        }
        return;
      }

      // Enter / OK action on focused element
      if (isEnter) {
        if (activeEl.getAttribute('data-tv-card') === 'true') {
          e.preventDefault();
          activeEl.click();
          lastFocusedCardRef.current = activeEl;
          return;
        }
        if (activeEl.getAttribute('data-tv-nav') === 'category') {
          e.preventDefault();
          activeEl.click();
          return;
        }
      }

      // Spatial navigation for Directional D-Pad (Up, Down, Left, Right)
      const currRect = activeEl.getBoundingClientRect();
      const currCenterX = currRect.left + currRect.width / 2;
      const currCenterY = currRect.top + currRect.height / 2;

      let bestCandidate: HTMLElement | null = null;
      let bestScore = Infinity;

      for (const candidate of navElements) {
        if (candidate === activeEl) continue;

        const candRect = candidate.getBoundingClientRect();
        const candCenterX = candRect.left + candRect.width / 2;
        const candCenterY = candRect.top + candRect.height / 2;

        const dx = candCenterX - currCenterX;
        const dy = candCenterY - currCenterY;

        if (isDown) {
          // Must be physically below current element
          if (candRect.top < currRect.bottom - 10) continue;
          const verticalDist = candRect.top - currRect.bottom;
          const horizontalDist = Math.abs(dx);
          const score = verticalDist * 2.0 + horizontalDist;
          if (score < bestScore) {
            bestScore = score;
            bestCandidate = candidate;
          }
        } else if (isUp) {
          // Must be physically above current element
          if (candRect.bottom > currRect.top + 10) continue;
          const verticalDist = currRect.top - candRect.bottom;
          const horizontalDist = Math.abs(dx);
          const score = verticalDist * 2.0 + horizontalDist;
          if (score < bestScore) {
            bestScore = score;
            bestCandidate = candidate;
          }
        } else if (isRight) {
          // Must be physically to the right
          if (candRect.left < currRect.right - 10) continue;
          const horizontalDist = candRect.left - currRect.right;
          const verticalDist = Math.abs(dy);
          const rowTolerance = verticalDist > 40 ? verticalDist * 4 : verticalDist * 0.4;
          const score = horizontalDist + rowTolerance;
          if (score < bestScore) {
            bestScore = score;
            bestCandidate = candidate;
          }
        } else if (isLeft) {
          // Must be physically to the left
          if (candRect.right > currRect.left + 10) continue;
          const horizontalDist = currRect.left - candRect.right;
          const verticalDist = Math.abs(dy);
          const rowTolerance = verticalDist > 40 ? verticalDist * 4 : verticalDist * 0.4;
          const score = horizontalDist + rowTolerance;
          if (score < bestScore) {
            bestScore = score;
            bestCandidate = candidate;
          }
        }
      }

      if (bestCandidate) {
        e.preventDefault();
        bestCandidate.focus();
        bestCandidate.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        if (bestCandidate.getAttribute('data-tv-card') === 'true') {
          lastFocusedCardRef.current = bestCandidate;
        }
      }
    };

    // On initial load or return from back navigation (pageshow / webView.goBack), restore last focused card
    const restoreLastFocus = () => {
      let target: HTMLElement | null = null;
      try {
        const lastChannel = sessionStorage.getItem('satv_last_channel');
        if (lastChannel) {
          target = document.querySelector<HTMLElement>(`[data-channel-name="${lastChannel}"]`);
        }
      } catch {}

      if (!target && lastFocusedCardRef.current && document.contains(lastFocusedCardRef.current)) {
        target = lastFocusedCardRef.current;
      }

      if (!target) {
        target = document.querySelector<HTMLElement>('[data-tv-card="true"]');
      }

      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        lastFocusedCardRef.current = target;
      }
    };

    const timer = setTimeout(restoreLastFocus, 150);
    window.addEventListener('pageshow', restoreLastFocus);
    window.addEventListener('keydown', handleTvKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pageshow', restoreLastFocus);
      window.removeEventListener('keydown', handleTvKeyDown);
    };
  }, [enabled]);

  return { lastFocusedCardRef };
}
