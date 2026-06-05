import { useEffect, useRef, useState, useCallback } from "react";
import {
  ADMIN_MODE_CHANGED,
  isAdminModeActive,
  setAdminModeActive,
  tryEnableAdminFromUrl,
} from "@/lib/adminMode";

export function useAdminMode() {
  const [adminMode, setAdminMode] = useState(() => {
    if (typeof window === "undefined") return false;
    tryEnableAdminFromUrl();
    return isAdminModeActive();
  });
  const knockCountRef = useRef(0);
  const knockTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onChange = () => setAdminMode(isAdminModeActive());
    window.addEventListener(ADMIN_MODE_CHANGED, onChange);
    return () => window.removeEventListener(ADMIN_MODE_CHANGED, onChange);
  }, []);

  const enableAdmin = useCallback(() => {
    setAdminModeActive(true);
  }, []);

  const disableAdmin = useCallback(() => {
    setAdminModeActive(false);
  }, []);

  /** 页脚版权文字连点 5 次（2 秒内）开启管理员模式 */
  const registerAdminKnock = useCallback(() => {
    if (knockTimerRef.current) window.clearTimeout(knockTimerRef.current);
    knockCountRef.current += 1;
    if (knockCountRef.current >= 5) {
      knockCountRef.current = 0;
      enableAdmin();
      return true;
    }
    knockTimerRef.current = window.setTimeout(() => {
      knockCountRef.current = 0;
    }, 2000);
    return false;
  }, [enableAdmin]);

  return {
    adminMode,
    enableAdmin,
    disableAdmin,
    registerAdminKnock,
  };
}
