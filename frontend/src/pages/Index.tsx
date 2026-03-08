import { useState } from "react";
import { ScanLine, Activity } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import VisualDiffViewer from "@/components/VisualDiffViewer";
import DataTables from "@/components/DataTables";

const Index = () => {
  const [baseFile, setBaseFile] = useState<File[]>([]);
  const [childFiles, setChildFiles] = useState<File[]>([]);
  const [analysisRun, setAnalysisRun] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  const handleRunAnalysis = async () => {
    if (baseFile.length === 0 || childFiles.length === 0) {
      alert("Please upload both base and child labels.");
      return;
    }
    setLoading(true);
    setProgress(0);
    setAnalysisRun(false);

    // Simulated progress block
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append("base_file", baseFile[0]);
      childFiles.forEach(file => {
        formData.append("child_files", file);
      });

      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/compare`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to run analysis");
      }

      const rawData = await response.json();

      const processedResults = rawData.results.map((result: any, index: number) => {
        const apiDiscrepancies = result.discrepancies || {};
        const parsedItems: any[] = [];
        let idCounter = 1;

        for (const status of ["Added", "Deleted", "Modified", "Misplaced"]) {
          if (apiDiscrepancies[status]) {
            apiDiscrepancies[status].forEach((item: any) => {
              let oldText;
              let newText;
              let value = item.Value;

              if (status === "Modified" && typeof value === "string") {
                const match = value.match(/From:\s*'(.*?)'\s*➔\s*To:\s*'(.*?)'/);
                if (match) {
                  oldText = match[1];
                  newText = match[2];
                }
              }

              parsedItems.push({
                id: `api-d${index}-${idCounter++}`,
                category: item.Category,
                status: status,
                value,
                oldText,
                newText,
              });
            });
          }
        }

        return {
          ...result,
          parsedItems,
        };
      });

      setApiResults(processedResults);
      setSelectedResultIndex(0);
      setProgress(100);
      setAnalysisRun(true);
    } catch (err) {
      console.error(err);
      alert("Error running analysis. Check console for details.");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setLoading(false), 500); // Give the 100% a moment to show
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-foreground" />
            <h1 className="text-base font-bold tracking-tight text-foreground">
              Label Comparator Pro
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Activity className="h-3.5 w-3.5" />
            <span>System Operational</span>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Upload Section */}
        <section>
          <div className="grid grid-cols-2 gap-4">
            <Dropzone label="Upload Base Label" files={baseFile} onFilesSelect={setBaseFile} multiple={false} />
            <Dropzone label="Upload Child Label(s)" files={childFiles} onFilesSelect={setChildFiles} multiple={true} />
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : "Run Comparator Analysis"}
            </button>
          </div>
        </section>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 max-w-md mx-auto">
            <Activity className="h-8 w-8 text-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">Analyzing documents... {progress}%</span>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground animate-pulse">Running Comparator Logic</span>
          </div>
        )}

        {analysisRun && apiResults.length > 0 && (
          <>
            {apiResults.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {apiResults.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedResultIndex(idx)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md whitespace-nowrap transition-colors ${selectedResultIndex === idx
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                  >
                    Results for {res.filename || childFiles[idx]?.name || `Child ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Visual Diff */}
            <section>
              <VisualDiffViewer
                baseFile={baseFile[0]}
                childFile={childFiles[selectedResultIndex]}
                annotatedBaseImage={apiResults[selectedResultIndex].annotated_base_image}
                annotatedChildImage={apiResults[selectedResultIndex].annotated_child_image}
              />
            </section>

            {/* Data Tables */}
            <section>
              <DataTables discrepancies={apiResults[selectedResultIndex].parsedItems} />
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
