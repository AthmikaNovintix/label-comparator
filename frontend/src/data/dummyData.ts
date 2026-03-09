export interface DiscrepancyItem {
  id: string;
  category: "Text" | "Symbol" | "Barcode" | "Image";
  status: "Added" | "Deleted" | "Modified" | "Repositioned";
  value: string;
  oldText?: string;
  newText?: string;
}

export interface FeatureItem {
  id: string;
  type: "Barcode" | "Logo" | "Text";
  value: string;
  location: string;
}

export const baseFeatures: FeatureItem[] = [
  { id: "b1", type: "Barcode", value: "GS1-128: (01)08714729000013", location: "Bottom-Right" },
  { id: "b2", type: "Barcode", value: "DataMatrix: LOT-2024-MX-0091", location: "Bottom-Left" },
  { id: "b3", type: "Text", value: "NDC 0078-0357-05", location: "Top-Right" },
  { id: "b4", type: "Text", value: "Sterile EO — Single Use Only", location: "Center-Left" },
  { id: "b5", type: "Text", value: "Rx Only — Federal law restricts", location: "Top-Left" },
  { id: "b6", type: "Logo", value: "CE Mark (CE 0123)", location: "Bottom-Center" },
  { id: "b7", type: "Logo", value: "Manufacturer Logo — Novartis AG", location: "Top-Center" },
  { id: "b8", type: "Text", value: "Store at 2°C–8°C (36°F–46°F)", location: "Center-Right" },
];

export const childFeatures: FeatureItem[] = [
  { id: "c1", type: "Barcode", value: "GS1-128: (01)08714729000013", location: "Bottom-Right" },
  { id: "c2", type: "Barcode", value: "DataMatrix: LOT-2025-MX-0114", location: "Top-Left" },
  { id: "c3", type: "Text", value: "NDC 0078-0357-05", location: "Top-Right" },
  { id: "c4", type: "Text", value: "Sterile EO — Single Use", location: "Center-Left" },
  { id: "c5", type: "Text", value: "Rx Only — Federal law restricts", location: "Top-Left" },
  { id: "c6", type: "Logo", value: "CE Mark (CE 0197)", location: "Bottom-Center" },
  { id: "c7", type: "Logo", value: "Manufacturer Logo — Novartis AG", location: "Top-Center" },
  { id: "c8", type: "Text", value: "Store at 2°C–8°C (36°F–46°F)", location: "Center-Right" },
  { id: "c9", type: "Logo", value: "UDI Symbol (ISO 15223-1)", location: "Bottom-Left" },
];

export const discrepancies: DiscrepancyItem[] = [
  { id: "d1", category: "Barcode", status: "Modified", value: "DataMatrix LOT changed: LOT-2024-MX-0091 → LOT-2025-MX-0114", oldText: "LOT-2024-MX-0091", newText: "LOT-2025-MX-0114" },
  { id: "d2", category: "Barcode", status: "Repositioned", value: "DataMatrix relocated from Bottom-Left to Top-Left" },
  { id: "d3", category: "Text", status: "Modified", value: "'Single Use Only' truncated to 'Single Use'", oldText: "Sterile EO — Single Use Only", newText: "Sterile EO — Single Use" },
  { id: "d4", category: "Symbol", status: "Modified", value: "CE Notified Body ID changed: 0123 → 0197", oldText: "CE 0123", newText: "CE 0197" },
  { id: "d5", category: "Symbol", status: "Added", value: "UDI Symbol (ISO 15223-1) added at Bottom-Left" },
  { id: "d6", category: "Text", status: "Deleted", value: "Missing trailing text 'this device to sale by…' on Rx statement" },
  { id: "d7", category: "Image", status: "Modified", value: "Manufacturer logo scale reduced by ~8%", oldText: "Scale: 100%", newText: "Scale: 92%" },
  { id: "d8", category: "Text", status: "Repositioned", value: "Storage instructions shifted 12px right from baseline" },
];
