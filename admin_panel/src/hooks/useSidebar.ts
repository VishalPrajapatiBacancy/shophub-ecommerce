import { useLocalStorage } from './useLocalStorage';

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar_collapsed', false);
  const [isMobileOpen, setIsMobileOpen] = useLocalStorage('sidebar_mobile_open', false);

  const toggle = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  return {
    isCollapsed,
    isMobileOpen,
    toggle,
    toggleMobile,
    closeMobile,
  };
}
