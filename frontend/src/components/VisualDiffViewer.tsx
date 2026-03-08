import { useRef, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const PLACEHOLDER_LABEL_BASE = "data:image/svg+xml," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="#f8fafc">
  <rect width="800" height="600" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="40" y="30" width="720" height="60" fill="#1e293b" rx="0"/>
  <text x="400" y="68" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="18" font-weight="bold">NOVARTIS AG — Pharmaceutical Label</text>
  <text x="60" y="120" fill="#334155" font-family="monospace" font-size="13">NDC 0078-0357-05</text>
  <text x="60" y="150" fill="#334155" font-family="monospace" font-size="13">Rx Only — Federal law restricts this device to sale by</text>
  <text x="60" y="170" fill="#334155" font-family="monospace" font-size="13">or on the order of a physician.</text>
  <text x="60" y="210" fill="#334155" font-family="monospace" font-size="13">Sterile EO — Single Use Only</text>
  <rect x="60" y="240" width="200" height="40" fill="#e2e8f0" stroke="#94a3b8"/>
  <text x="160" y="265" text-anchor="middle" fill="#475569" font-family="monospace" font-size="11">GS1-128: (01)08714729000013</text>
  <rect x="60" y="300" width="120" height="120" fill="#e2e8f0" stroke="#94a3b8"/>
  <text x="120" y="365" text-anchor="middle" fill="#475569" font-family="monospace" font-size="10">DataMatrix</text>
  <text x="120" y="380" text-anchor="middle" fill="#475569" font-family="monospace" font-size="9">LOT-2024-MX-0091</text>
  <text x="60" y="460" fill="#334155" font-family="monospace" font-size="13">Store at 2°C–8°C (36°F–46°F)</text>
  <rect x="560" y="480" width="80" height="80" fill="#e2e8f0" stroke="#94a3b8" rx="0"/>
  <text x="600" y="525" text-anchor="middle" fill="#475569" font-family="monospace" font-size="12" font-weight="bold">CE</text>
  <text x="600" y="542" text-anchor="middle" fill="#475569" font-family="monospace" font-size="10">0123</text>
  <text x="400" y="570" text-anchor="middle" fill="#64748b" font-family="monospace" font-size="10">BASE LABEL — Rev. 04 — 2024-01-15</text>
</svg>`);

const PLACEHOLDER_LABEL_CHILD = "data:image/svg+xml," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="#f8fafc">
  <rect width="800" height="600" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="40" y="30" width="720" height="60" fill="#1e293b" rx="0"/>
  <text x="400" y="68" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="18" font-weight="bold">NOVARTIS AG — Pharmaceutical Label</text>
  <text x="60" y="120" fill="#334155" font-family="monospace" font-size="13">NDC 0078-0357-05</text>
  <text x="60" y="150" fill="#334155" font-family="monospace" font-size="13">Rx Only — Federal law restricts</text>
  <text x="60" y="210" fill="#334155" font-family="monospace" font-size="13">Sterile EO — Single Use</text>
  <rect x="60" y="240" width="200" height="40" fill="#e2e8f0" stroke="#94a3b8"/>
  <text x="160" y="265" text-anchor="middle" fill="#475569" font-family="monospace" font-size="11">GS1-128: (01)08714729000013</text>
  <rect x="500" y="100" width="120" height="120" fill="#fef9c3" stroke="#d97706"/>
  <text x="560" y="165" text-anchor="middle" fill="#92400e" font-family="monospace" font-size="10">DataMatrix</text>
  <text x="560" y="180" text-anchor="middle" fill="#92400e" font-family="monospace" font-size="9">LOT-2025-MX-0114</text>
  <text x="560" y="195" text-anchor="middle" fill="#d97706" font-family="monospace" font-size="8">MISPLACED</text>
  <text x="72" y="460" fill="#334155" font-family="monospace" font-size="13">Store at 2°C–8°C (36°F–46°F)</text>
  <rect x="560" y="480" width="80" height="80" fill="#e2e8f0" stroke="#94a3b8" rx="0"/>
  <text x="600" y="525" text-anchor="middle" fill="#475569" font-family="monospace" font-size="12" font-weight="bold">CE</text>
  <text x="600" y="542" text-anchor="middle" fill="#d97706" font-family="monospace" font-size="10">0197</text>
  <rect x="60" y="480" width="70" height="70" fill="#dcfce7" stroke="#16a34a"/>
  <text x="95" y="520" text-anchor="middle" fill="#166534" font-family="monospace" font-size="9">UDI</text>
  <text x="95" y="533" text-anchor="middle" fill="#16a34a" font-family="monospace" font-size="7">ADDED</text>
  <text x="400" y="570" text-anchor="middle" fill="#64748b" font-family="monospace" font-size="10">CHILD LABEL — Rev. 05 — 2025-03-01</text>
</svg>`);

const VisualDiffViewer = ({ 
  baseFile, 
  childFile,
  annotatedBaseImage,
  annotatedChildImage
}: { 
  baseFile?: File | null, 
  childFile?: File | null,
  annotatedBaseImage?: string,
  annotatedChildImage?: string
}) => {
  const baseRef = useRef<any>(null);
  const childRef = useRef<any>(null);

  const baseSrc = annotatedBaseImage || (baseFile ? URL.createObjectURL(baseFile) : PLACEHOLDER_LABEL_BASE);
  const childSrc = annotatedChildImage || (childFile ? URL.createObjectURL(childFile) : PLACEHOLDER_LABEL_CHILD);

  const handleZoomIn = useCallback(() => {
    baseRef.current?.zoomIn();
    childRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    baseRef.current?.zoomOut();
    childRef.current?.zoomOut();
  }, []);

  const handleReset = useCallback(() => {
    baseRef.current?.resetTransform();
    childRef.current?.resetTransform();
  }, []);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between border border-border bg-card px-4 py-2 mb-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Visual Diff Viewer
        </span>
        <div className="flex items-center gap-1">
          <button onClick={handleZoomIn} className="p-1.5 hover:bg-secondary transition-colors border border-border" title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={handleZoomOut} className="p-1.5 hover:bg-secondary transition-colors border border-border" title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button onClick={handleReset} className="p-1.5 hover:bg-secondary transition-colors border border-border" title="Reset">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Split view */}
      <div className="grid grid-cols-2 border border-t-0 border-border">
        <div className="border-r border-border">
          <div className="bg-card px-3 py-1.5 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Base Label</span>
          </div>
          <div className="bg-secondary/50 h-[400px] overflow-hidden">
            <TransformWrapper ref={baseRef} minScale={0.5} maxScale={4} initialScale={1}>
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={baseSrc} alt="Base pharmaceutical label" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
        <div>
          <div className="bg-card px-3 py-1.5 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Child Label</span>
          </div>
          <div className="bg-secondary/50 h-[400px] overflow-hidden">
            <TransformWrapper ref={childRef} minScale={0.5} maxScale={4} initialScale={1}>
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={childSrc} alt="Child pharmaceutical label" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 border border-t-0 border-border bg-card px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">Legend:</span>
        <LegendItem color="#15803d" label="Added" />
        <LegendItem color="#de2626" label="Deleted" />
        <LegendItem color="#1e3d89" label="Modified" />
        <LegendItem color="#f5a30a" label="Misplaced" />
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-1.5">
    <div className="w-3 h-3" style={{ backgroundColor: color }} />
    <span className="text-xs font-medium text-foreground">{label}</span>
  </div>
);

export default VisualDiffViewer;
