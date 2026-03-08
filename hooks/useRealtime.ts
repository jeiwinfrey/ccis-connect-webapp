"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Subscribe to Postgres changes on a table and call `onUpdate` whenever
 * an INSERT, UPDATE, or DELETE occurs. Automatically cleans up on unmount.
 *
 * @param table  The table name to subscribe to (e.g. "equipment_units")
 * @param onUpdate  Callback fired on any change — typically a refetch function
 * @param enabled  Whether the subscription is active (default: true)
 */
export function useRealtimeSubscription(
  table: string,
  onUpdate: () => void,
  enabled = true,
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    const channel: RealtimeChannel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          onUpdateRef.current();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, enabled]);
}

/**
 * Subscribe to multiple tables and call `onUpdate` when any of them change.
 */
export function useRealtimeSubscriptions(
  tables: string[],
  onUpdate: () => void,
  enabled = true,
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!enabled || tables.length === 0) return;

    const supabase = createClient();
    const channels: RealtimeChannel[] = tables.map((table) =>
      supabase
        .channel(`realtime-${table}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          () => {
            onUpdateRef.current();
          },
        )
        .subscribe(),
    );

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [tables.join(","), enabled]); // eslint-disable-line react-hooks/exhaustive-deps
}
