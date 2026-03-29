import { useEffect } from 'react';

/**
 * Injects global CSS to customise the AppBar layout for Merankabandi:
 *  - Hides the insuree Enquiry search box
 *  - Hides the Help (?) icon
 *  - Moves NotificationBell to just before Logout via flex order
 */
function AppBarOverrides() {
  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-merankabandi', 'appbar-overrides');
    style.textContent = `
      /* Hide the insuree Enquiry search box */
      [class*="search-"] {
        display: none !important;
      }
      /* Hide the Help icon */
      [class*="Help-button"] {
        display: none !important;
      }
      /* Move NotificationBell after the title + grow spacer, just before logout */
      [class*="NotificationBell-root"] {
        order: 50 !important;
      }
      /* Push logout to the very end */
      .MuiToolbar-root > button[class*="toolbarDrawer"],
      .MuiToolbar-root > button.MuiIconButton-root:not([class*="Help"]) {
        order: 51 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

export default AppBarOverrides;
