import {
  Plus,
  Trash2,
  Pencil,
  ArrowRightLeft,
  Type,
  Barcode,
  Image,
  Shield,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { type DiscrepancyItem, discrepancies } from "@/data/dummyData";

type Status = "Deleted" | "Added" | "Modified" | "Misplaced";

const statusConfig: Record<Status, { icon: typeof Plus; label: string; borderClass: string; textClass: string }> = {
  Deleted: { icon: Trash2, label: "Deleted", borderClass: "border-l-status-deleted", textClass: "text-status-deleted" },
  Added: { icon: Plus, label: "Added", borderClass: "border-l-status-added", textClass: "text-status-added" },
  Modified: { icon: Pencil, label: "Modified", borderClass: "border-l-status-modified", textClass: "text-status-modified" },
  Misplaced: { icon: ArrowRightLeft, label: "Misplaced", borderClass: "border-l-status-misplaced", textClass: "text-status-misplaced" },
};

const categoryIcons: Record<string, typeof Type> = {
  Text: Type,
  Barcode: Barcode,
  Image: Image,
  Symbol: Shield,
};

const statusOrder: Status[] = ["Deleted", "Added", "Modified", "Misplaced"];

type Category = "Text" | "Symbol" | "Barcode" | "Image";

function computeCounts(items: DiscrepancyItem[]) {
  const byStatus: Record<Status, number> = { Deleted: 0, Added: 0, Modified: 0, Misplaced: 0 };
  const byStatusAndCategory: Record<Status, Record<Category, number>> = {
    Deleted: { Text: 0, Symbol: 0, Barcode: 0, Image: 0 },
    Added: { Text: 0, Symbol: 0, Barcode: 0, Image: 0 },
    Modified: { Text: 0, Symbol: 0, Barcode: 0, Image: 0 },
    Misplaced: { Text: 0, Symbol: 0, Barcode: 0, Image: 0 },
  };
  items.forEach((item) => {
    byStatus[item.status]++;
    byStatusAndCategory[item.status][item.category as Category]++;
  });
  return { byStatus, byStatusAndCategory, total: items.length };
}

const InspectionSummary = ({ items }: { items: DiscrepancyItem[] }) => {
  const { byStatus, byStatusAndCategory, total } = computeCounts(items);

  return (
    <div className="bg-card border border-border">
      <div className="bg-secondary/50 px-4 py-2 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inspection Summary</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        <div className="text-sm">
          <span className="font-semibold text-foreground">Total Differences:</span>{" "}
          <span className="font-mono font-bold">{total}</span>
        </div>

        {/* Status Counts Row */}
        <div className="grid grid-cols-4 gap-8 text-sm pb-3 border-b border-border">
          {statusOrder.map((status) => {
            const cfg = statusConfig[status];
            const statusCount = byStatus[status];
            return (
              <div key={status} className="flex items-baseline gap-2">
                <span className={`font-semibold ${cfg.textClass}`}>{status}:</span>
                <span className={`font-mono font-bold ${cfg.textClass}`}>{statusCount}</span>
              </div>
            );
          })}
        </div>

        {/* Category Counts Row */}
        <div className="grid grid-cols-4 gap-8 text-sm pt-3">
          {statusOrder.map((status) => {
            const categoryBreakdown = byStatusAndCategory[status];
            return (
              <div key={`${status}-cats`} className="space-y-1">
                {(["Text", "Symbol", "Barcode", "Image"] as Category[]).map((cat) => {
                  const CatIcon = categoryIcons[cat] || Type;
                  const catCount = categoryBreakdown[cat];
                  return (
                    <div key={cat} className="flex items-center gap-2 text-sm">
                      <CatIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className={catCount > 0 ? "text-foreground" : "text-muted-foreground"}>{cat}:</span>
                      <span className={`font-mono font-semibold ml-auto ${catCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>{catCount}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Inline diff for Modified items
const DiffView = ({ oldText, newText }: { oldText: string; newText: string }) => (
  <span className="inline-flex items-center gap-1.5 font-mono text-xs mt-1">
    <span className="bg-status-deleted-bg px-1.5 py-0.5 line-through text-status-deleted/80">
      {oldText}
    </span>
    <span className="text-muted-foreground">→</span>
    <span className="bg-status-added-bg px-1.5 py-0.5 text-status-added/80">
      {newText}
    </span>
  </span>
);

// Single row
const DiscrepancyRow = ({ item, status }: { item: DiscrepancyItem; status: Status }) => {
  const config = statusConfig[status];
  const CatIcon = categoryIcons[item.category] || Type;
  const showDiff = status === "Modified" && item.oldText && item.newText;

  return (
    <div className={`border-l-2 ${config.borderClass} pl-3 pr-4 py-2`}>
      <div className="flex items-start gap-2.5">
        <CatIcon className={`h-3.5 w-3.5 mt-0.5 ${config.textClass} shrink-0`} />
        <div className="min-w-0">
          <span className="text-sm text-foreground">{item.value}</span>
          {showDiff && (
            <div>
              <DiffView oldText={item.oldText!} newText={item.newText!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Status group with collapse
const StatusGroup = ({ status, items }: { status: Status; items: DiscrepancyItem[] }) => {
  const [open, setOpen] = useState(true);
  const config = statusConfig[status];
  const Icon = config.icon;

  if (items.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-1.5 hover:bg-secondary/30 transition-colors"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        <Icon className={`h-3.5 w-3.5 ${config.textClass}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${config.textClass}`}>{config.label}</span>
        <span className="text-xs text-muted-foreground font-mono">({items.length})</span>
      </button>
      {open && (
        <div className="ml-1 space-y-0.5 mt-0.5 mb-3">
          {items.map((item) => (
            <DiscrepancyRow key={item.id} item={item} status={status} />
          ))}
        </div>
      )}
    </div>
  );
};

const DiscrepancyDashboard = ({ items = discrepancies }: { items?: DiscrepancyItem[] }) => {
  const grouped: Record<Status, DiscrepancyItem[]> = { Deleted: [], Added: [], Modified: [], Misplaced: [] };
  items.forEach((item) => {
    if (grouped[item.status]) {
      grouped[item.status].push(item);
    }
  });

  return (
    <div className="space-y-4">
      <InspectionSummary items={items} />
      <div>
        {statusOrder.map((status) => (
          <StatusGroup key={status} status={status} items={grouped[status]} />
        ))}
      </div>
    </div>
  );
};

export default DiscrepancyDashboard;
