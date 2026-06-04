"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Viewing } from "@/types/viewing";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const MAX_PREVIEW_ITEMS_PER_DAY = 3;

function toDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startOffset + 1;
    return new Date(year, month, dayNumber);
  });
}

type ViewingsCalendarProps = {
  viewings: Viewing[];
  isLoading: boolean;
  currentMonth: Date;
  onChangeMonth: (direction: "prev" | "next") => void;
  onEdit: (viewing: Viewing) => void;
  onDelete: (viewing: Viewing) => void;
};

export function ViewingsCalendar({
  viewings,
  isLoading,
  currentMonth,
  onChangeMonth,
  onEdit,
  onDelete,
}: ViewingsCalendarProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const groupedViewingsByDate = useMemo(() => {
    const grouped = new Map<string, Viewing[]>();

    viewings.forEach((viewing) => {
      const dateKey = toDateKey(viewing.scheduledAt);
      const existing = grouped.get(dateKey) || [];
      existing.push(viewing);
      grouped.set(dateKey, existing);
    });

    grouped.forEach((items, key) => {
      grouped.set(
        key,
        [...items].sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        ),
      );
    });

    return grouped;
  }, [viewings]);

  const calendarDays = useMemo(
    () => getMonthCalendarDays(currentMonth),
    [currentMonth],
  );

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      }).format(currentMonth),
    [currentMonth],
  );

  const selectedViewings = useMemo(() => {
    if (!selectedDateKey) return [];
    return groupedViewingsByDate.get(selectedDateKey) || [];
  }, [groupedViewingsByDate, selectedDateKey]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDateKey) return "";
    const date = new Date(`${selectedDateKey}T00:00:00`);
    if (Number.isNaN(date.getTime())) return selectedDateKey;
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }, [selectedDateKey]);

  const openDateDialog = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold">Visit Calendar</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChangeMonth("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-44 text-center text-sm font-medium capitalize">
            {monthLabel}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChangeMonth("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-225">
          <div className="grid grid-cols-7 border-b bg-slate-50/60 text-xs font-medium uppercase tracking-wide text-slate-500">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
              (dayName) => (
                <div key={dayName} className="border-r p-3 last:border-r-0">
                  {dayName}
                </div>
              ),
            )}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dateKey = toDateKey(day);
              const dayViewings = groupedViewingsByDate.get(dateKey) || [];
              const previewItems = dayViewings.slice(
                0,
                MAX_PREVIEW_ITEMS_PER_DAY,
              );
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isToday = toDateKey(day) === toDateKey(new Date());

              if (!isCurrentMonth) {
                return (
                  <div
                    key={dateKey}
                    className="min-h-40 border-r border-b bg-slate-50/40 p-2 last:border-r-0"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm text-slate-300">
                      {day.getDate()}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={dateKey}
                  className="min-h-40 cursor-pointer border-r border-b bg-white p-2 last:border-r-0 hover:bg-slate-50/60 transition-colors"
                  role="button"
                  tabIndex={0}
                  onClick={() => openDateDialog(dateKey)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openDateDialog(dateKey);
                    }
                  }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                        isToday
                          ? "bg-blue-600 text-white"
                          : "text-slate-800"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {dayViewings.length > 0 ? (
                      <Badge>{dayViewings.length}</Badge>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    {isLoading && dayViewings.length > 0
                      ? Array.from({
                          length: Math.min(
                            MAX_PREVIEW_ITEMS_PER_DAY,
                            Math.max(dayViewings.length, 1),
                          ),
                        }).map((_, index) => (
                          <div
                            key={`skeleton-${dateKey}-${index}`}
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-2"
                          >
                            <div className="h-2.5 w-4/5 animate-pulse rounded bg-slate-200" />
                            <div className="mt-2 h-2 w-1/2 animate-pulse rounded bg-slate-200" />
                          </div>
                        ))
                      : previewItems.map((viewing) => (
                          <div
                            key={viewing.id}
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs"
                          >
                            <p className="line-clamp-1 font-medium text-slate-800">
                              {viewing.name}
                            </p>
                            <p className="text-slate-500">
                              {new Date(viewing.scheduledAt).toLocaleTimeString(
                                "id-ID",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                            <div className="mt-1 flex justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onEdit(viewing);
                                }}
                                title="Edit Visit"
                              >
                                <Pencil className="h-3.5 w-3.5 text-blue-500" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onDelete(viewing);
                                }}
                                title="Delete Visit"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}

                    {dayViewings.length > MAX_PREVIEW_ITEMS_PER_DAY ? (
                      <span className="inline-flex text-xs font-medium text-blue-600">
                        +{dayViewings.length - MAX_PREVIEW_ITEMS_PER_DAY}{" "}
                        lainnya
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="border-t p-4 text-sm text-slate-500">
          Loading visits...
        </div>
      ) : null}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="capitalize">
              Visit pada {selectedDateLabel}
            </DialogTitle>
            <DialogDescription>
              Total {selectedViewings.length} visit terjadwal.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
              Loading visits...
            </div>
          ) : selectedViewings.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
              Belum ada visit pada tanggal ini.
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-background">
              <div className="min-w-160">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>PIC Visit</TableHead>
                      <TableHead>Jam</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedViewings.map((viewing) => (
                      <TableRow key={viewing.id}>
                        <TableCell className="font-medium">
                          {viewing.name || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {viewing.actor?.name || "-"}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {new Date(viewing.scheduledAt).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </TableCell>
                        <TableCell>
                          {viewing.status?.name ? (
                            <Badge colorHex={viewing.status?.color}>
                              {viewing.status?.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {viewing.source?.name || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-45 truncate">
                          {viewing.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            disabled={!viewing.leadId}
                          >
                            <Link
                              href={`/leads/${viewing.leadId}?tab=visit`}
                              className="inline-flex items-center gap-1.5"
                            >
                              <ExternalLink className="size-3.5" />
                              Detail Lead
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
