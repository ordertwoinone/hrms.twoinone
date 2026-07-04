import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { NOTIFICATION_CATEGORIES } from "../constants";
import type {
  NotificationCenterData,
  NotificationItem,
  PreferenceItem,
} from "../types";

function toItem(n: {
  id: string;
  category: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}): NotificationItem {
  return {
    id: n.id,
    category: n.category,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    readAt: n.read_at,
    createdAt: n.created_at,
  };
}

export async function getNotificationCenterData(
  userId: string,
): Promise<NotificationCenterData> {
  const admin = createAdminClient();
  const [{ data: rows }, { count }, { data: prefs }] = await Promise.all([
    admin
      .from("notifications")
      .select("id, category, type, title, body, link, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    admin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null),
    admin
      .from("notification_preferences")
      .select("category, in_app, email")
      .eq("user_id", userId),
  ]);

  const prefMap = new Map(
    (prefs ?? []).map((p) => [p.category, { inApp: p.in_app, email: p.email }]),
  );
  const preferences: PreferenceItem[] = NOTIFICATION_CATEGORIES.map((c) => {
    const p = prefMap.get(c.value);
    return {
      category: c.value,
      label: c.label,
      description: c.description,
      inApp: p?.inApp ?? true,
      email: p?.email ?? true,
    };
  });

  return {
    items: (rows ?? []).map(toItem),
    unreadCount: count ?? 0,
    preferences,
  };
}

/** Compact recent list + unread count for the header bell. */
export async function getBellData(userId: string): Promise<{
  items: NotificationItem[];
  unreadCount: number;
}> {
  const admin = createAdminClient();
  const [{ data: rows }, { count }] = await Promise.all([
    admin
      .from("notifications")
      .select("id, category, type, title, body, link, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null),
  ]);
  return {
    items: (rows ?? []).map(toItem),
    unreadCount: count ?? 0,
  };
}
