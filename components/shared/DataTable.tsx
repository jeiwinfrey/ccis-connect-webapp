"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconLoader2, IconPlus } from "@tabler/icons-react";

export interface DataTableColumn<T> {
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  title: string;
  icon?: ReactNode;
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onAdd?: () => void;
  addLabel?: string;
  emptyMessage?: string;
  filters?: ReactNode;
  getRowKey: (row: T) => string;
}

export function DataTable<T>({
  title,
  icon,
  data,
  columns,
  loading = false,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  onAdd,
  addLabel = "Add",
  emptyMessage = "No data found.",
  filters,
  getRowKey,
}: DataTableProps<T>) {
  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2 font-semibold text-sm">
          {icon}
          {title}
          <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">
            {data.length}
          </Badge>
        </div>
        {onAdd && (
          <Button size="sm" onClick={onAdd}>
            <IconPlus className="size-4" /> {addLabel}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Search and Filters */}
        {(onSearchChange || filters) && (
          <div className="flex gap-3 flex-wrap">
            {onSearchChange && (
              <Input
                className="max-w-xs"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            )}
            {filters}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <IconLoader2 className="size-5 animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col, idx) => (
                    <TableHead key={idx} className={col.className}>
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-10 text-muted-foreground text-sm"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={getRowKey(row)}>
                      {columns.map((col, idx) => (
                        <TableCell key={idx} className={col.className}>
                          {col.accessor(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
