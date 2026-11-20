"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SESSION_KEY = "ker-khadim-visitor-session-v1";

function getVisitorSessionId() {
  try {
    let sessionId = window.sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = window.crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return null;
  }
}

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      !supabase ||
      !pathname ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api/")
    ) {
      return;
    }

    const visitorSessionId = getVisitorSessionId();
    if (!visitorSessionId) return;

    void supabase.rpc("record_site_visitor", {
      p_visitor_session_id: visitorSessionId,
    });
  }, [pathname]);

  return null;
}
