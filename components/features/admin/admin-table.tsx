"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export interface Column<T> {
  key: keyof T;
  header: string;
  /** Additional className for the cell */
  className?: string;
}

export interface StatusBadge {
  label: string;
  className: string;
}

interface AdminTableProps<T extends Record<string, string>> {
  /** Page heading */
  title: string;
  /** Page subheading */
  description: string;
  /** Card section title */
  sectionTitle: string;
  /** Column definitions */
  columns: Column<T>[];
  /** Row data */
  data: T[];
  /** Keys to include in the search filter */
  searchKeys: (keyof T)[];
  /** Status badge rendered in the last column */
  badge: StatusBadge;
  /** Message when no rows match */
  emptyMessage?: string;
}

export function AdminTable<T extends Record<string, string>>({
  title,
  description,
  sectionTitle,
  columns,
  data,
  searchKeys,
  badge,
  emptyMessage = "No results found.",
}: AdminTableProps<T>) {
  const [search, setSearch] = useState("");

  const filtered = data.filter(row =>
    searchKeys.some(k => row[k]?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCols = columns.length + 1; // +1 for status badge column

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border font-semibold text-sm">
          {sectionTitle}
        </div>
        <div className="p-5 space-y-4">
          <Input
            className="max-w-xs"
            placeholder="Search\u2026"
            aria-label={`Search ${sectionTitle}`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="overflow-x-auto">
            <Table aria-label={sectionTitle}>
              <TableHeader>
                <TableRow>
                  {columns.map(col => (
                    <TableHead key={String(col.key)}>{col.header}</TableHead>
                  ))}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={totalCols} className="text-center py-10 text-muted-foreground text-sm">
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : filtered.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map(col => (
                      <TableCell key={String(col.key)} className={col.className ?? "text-sm"}>
                        {row[col.key]}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${badge.className}`}>
                        {badge.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
