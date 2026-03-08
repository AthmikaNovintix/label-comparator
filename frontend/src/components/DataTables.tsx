import DiscrepancyDashboard from "@/components/DiscrepancyDashboard";
import { type DiscrepancyItem } from "@/data/dummyData";

const DataTables = ({ discrepancies }: { discrepancies?: DiscrepancyItem[] }) => <DiscrepancyDashboard items={discrepancies} />;

export default DataTables;
