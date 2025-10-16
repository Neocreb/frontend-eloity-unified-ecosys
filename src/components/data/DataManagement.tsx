import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Download,
  Upload,
  FileText,
  Database,
  Link2,
  Cloud,
  RefreshCw,
  Calendar,
  Users,
  ShoppingCart,
  TrendingUp,
  MessageSquare,
  Image,
  Video,
  CheckCircle,
  Music,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  FileJson,
  Globe,
  Smartphone,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  Clock,
  Check,
  X,
  AlertTriangle,
  Info,
  Settings,
  Eye,
  Share2,
  Copy,
  Trash2,
  Archive,
  Filter,
  Search,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ExportOptions {
  format: "json" | "csv" | "xml" | "pdf";
  dateRange: {
    start: Date;
    end: Date;
  };
  includeMedia: boolean;
  includePrivateData: boolean;
  categories: string[];
}

interface ImportProgress {
  total: number;
  completed: number;
  errors: number;
  currentItem: string;
  status: "idle" | "processing" | "completed" | "error";
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "disconnected" | "error";
  lastSync?: Date;
  capabilities: string[];
  settings?: Record<string, any>;
}

const supportedIntegrations: Integration[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync events and schedules",
    icon: <Calendar className="w-5 h-5" />,
    status: "disconnected",
    capabilities: ["sync", "import", "export"],
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Import contacts and emails",
    icon: <Mail className="w-5 h-5" />,
    status: "disconnected",
    capabilities: ["import", "contacts"],
  },
  {
    id: "twitter",
    name: "Twitter",
    description: "Import tweets and followers",
    icon: <Twitter className="w-5 h-5" />,
    status: "connected",
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    capabilities: ["import", "export", "sync"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Import professional network",
    icon: <Linkedin className="w-5 h-5" />,
    status: "connected",
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
    capabilities: ["import", "export", "sync"],
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Import photos and stories",
    icon: <Instagram className="w-5 h-5" />,
    status: "disconnected",
    capabilities: ["import", "media"],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Import repositories and activity",
    icon: <Github className="w-5 h-5" />,
    status: "connected",
    lastSync: new Date(Date.now() - 6 * 60 * 60 * 1000),
    capabilities: ["import", "export", "sync"],
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Import store products and orders",
    icon: <ShoppingCart className="w-5 h-5" />,
    status: "disconnected",
    capabilities: ["import", "export", "sync"],
  },
  {
    id: "coinbase",
    name: "Coinbase",
    description: "Import trading data and portfolio",
    icon: <TrendingUp className="w-5 h-5" />,
    status: "disconnected",
    capabilities: ["import", "export", "sync"],
  },
];

export const DataManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "json",
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    includeMedia: false,
    includePrivateData: false,
    categories: ["posts", "profile", "settings"],
  });

  const [importProgress, setImportProgress] = useState<ImportProgress>({
    total: 0,
    completed: 0,
    errors: 0,
    currentItem: "",
    status: "idle",
  });

  const [integrations, setIntegrations] = useState<Integration[]>(
    supportedIntegrations,
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Export Functions
  const handleExport = async () => {
    setShowExportDialog(false);

    toast({
      title: "Export started",
      description: "Preparing your data for download...",
    });

    try {
      // Simulate export process
      const exportData = await generateExportData();
      const blob = createExportBlob(exportData, exportOptions.format);
      downloadBlob(
        blob,
        `eloity-export-${new Date().toISOString().split("T")[0]}.${exportOptions.format}`,
      );

      toast({
        title: "Export completed",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  const generateExportData = async () => {
    // Simulate data collection based on selected categories
    const data: any = {};

    if (exportOptions.categories.includes("profile")) {
      data.profile = {
        id: user?.id,
        username: user?.username,
        email: user?.email,
        profile: user?.profile,
        created_at: user?.created_at,
      };
    }

    if (exportOptions.categories.includes("posts")) {
      data.posts = [
        {
          id: "1",
          content: "Sample post content",
          created_at: new Date().toISOString(),
          likes: 25,
          comments: 5,
        },
      ];
    }

    if (exportOptions.categories.includes("settings")) {
      data.settings = {
        notifications: JSON.parse(
          localStorage.getItem("notification-settings") || "{}",
        ),
        accessibility: JSON.parse(
          localStorage.getItem("accessibility-settings") || "{}",
        ),
        theme: localStorage.getItem("theme") || "light",
      };
    }

    if (exportOptions.categories.includes("analytics")) {
      data.analytics = {
        views: 12500,
        engagements: 850,
        followers: 456,
        export_date: new Date().toISOString(),
      };
    }

    return data;
  };

  const createExportBlob = (data: any, format: string) => {
    let content: string;
    let mimeType: string;

    switch (format) {
      case "json":
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        break;
      case "csv":
        content = convertToCSV(data);
        mimeType = "text/csv";
        break;
      case "xml":
        content = convertToXML(data);
        mimeType = "application/xml";
        break;
      default:
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
    }

    return new Blob([content], { type: mimeType });
  };

  const convertToCSV = (data: any) => {
    // Simple CSV conversion for flat data
    const flatData = flattenObject(data);
    const headers = Object.keys(flatData).join(",");
    const values = Object.values(flatData)
      .map((v) => `"${v}"`)
      .join(",");
    return `${headers}\n${values}`;
  };

  const convertToXML = (data: any) => {
    const convertObjectToXML = (
      obj: any,
      rootName: string = "data",
    ): string => {
      let xml = `<${rootName}>`;
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "object" && value !== null) {
          xml += convertObjectToXML(value, key);
        } else {
          xml += `<${key}>${value}</${key}>`;
        }
      }
      xml += `</${rootName}>`;
      return xml;
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n${convertObjectToXML(data)}`;
  };

  const flattenObject = (obj: any, prefix: string = ""): any => {
    const flattened: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
    return flattened;
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import Functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to import.",
        variant: "destructive",
      });
      return;
    }

    setImportProgress({
      total: selectedFiles.length,
      completed: 0,
      errors: 0,
      currentItem: selectedFiles[0].name,
      status: "processing",
    });

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setImportProgress((prev) => ({ ...prev, currentItem: file.name }));

        await processImportFile(file);

        setImportProgress((prev) => ({
          ...prev,
          completed: prev.completed + 1,
        }));

        // Add delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setImportProgress((prev) => ({ ...prev, status: "completed" }));
      setShowImportDialog(false);

      toast({
        title: "Import completed",
        description: `Successfully imported ${selectedFiles.length} files.`,
      });
    } catch (error) {
      setImportProgress((prev) => ({ ...prev, status: "error" }));
      toast({
        title: "Import failed",
        description: "There was an error importing your data.",
        variant: "destructive",
      });
    }
  };

  const processImportFile = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = parseImportData(file, content);

          // Process the parsed data
          console.log("Imported data:", data);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const parseImportData = (file: File, content: string) => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "json":
        return JSON.parse(content);
      case "csv":
        return parseCSV(content);
      case "xml":
        return parseXML(content);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  };

  const parseCSV = (content: string) => {
    const lines = content.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i]
          .split(",")
          .map((v) => v.trim().replace(/"/g, ""));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        data.push(row);
      }
    }

    return data;
  };

  const parseXML = (content: string) => {
    // Basic XML parsing - in production, use a proper XML parser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");

    const xmlToObject = (node: Element): any => {
      const obj: any = {};

      if (node.children.length === 0) {
        return node.textContent;
      }

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const key = child.tagName;
        const value = xmlToObject(child);

        if (obj[key]) {
          if (Array.isArray(obj[key])) {
            obj[key].push(value);
          } else {
            obj[key] = [obj[key], value];
          }
        } else {
          obj[key] = value;
        }
      }

      return obj;
    };

    return xmlToObject(xmlDoc.documentElement);
  };

  // Integration Functions
  const connectIntegration = async (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? { ...integration, status: "connected", lastSync: new Date() }
          : integration,
      ),
    );

    toast({
      title: "Integration connected",
      description: `Successfully connected to ${integrations.find((i) => i.id === integrationId)?.name}.`,
    });
  };

  const disconnectIntegration = async (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? { ...integration, status: "disconnected", lastSync: undefined }
          : integration,
      ),
    );

    toast({
      title: "Integration disconnected",
      description: `Disconnected from ${integrations.find((i) => i.id === integrationId)?.name}.`,
    });
  };

  const syncIntegration = async (integrationId: string) => {
    const integration = integrations.find((i) => i.id === integrationId);
    if (!integration || integration.status !== "connected") return;

    toast({
      title: "Sync started",
      description: `Syncing data from ${integration.name}...`,
    });

    // Simulate sync process
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((int) =>
          int.id === integrationId ? { ...int, lastSync: new Date() } : int,
        ),
      );

      toast({
        title: "Sync completed",
        description: `Successfully synced data from ${integration.name}.`,
      });
    }, 2000);
  };

  const getStatusColor = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Connected
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Management</h2>
          <p className="text-muted-foreground">
            Import, export, and manage your data across platforms
          </p>
        </div>
      </div>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Export Format</Label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value: any) =>
                      setExportOptions((prev) => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <FileJson className="w-4 h-4" />
                          JSON
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4" />
                          CSV
                        </div>
                      </SelectItem>
                      <SelectItem value="xml">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          XML
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          PDF
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Data Categories</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "posts",
                      "profile",
                      "settings",
                      "analytics",
                      "media",
                      "messages",
                    ].map((category) => (
                      <label
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={exportOptions.categories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExportOptions((prev) => ({
                                ...prev,
                                categories: [...prev.categories, category],
                              }));
                            } else {
                              setExportOptions((prev) => ({
                                ...prev,
                                categories: prev.categories.filter(
                                  (c) => c !== category,
                                ),
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      type="date"
                      value={
                        exportOptions.dateRange.start
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          dateRange: {
                            ...prev.dateRange,
                            start: new Date(e.target.value),
                          },
                        }))
                      }
                    />
                    <Input
                      type="date"
                      value={
                        exportOptions.dateRange.end.toISOString().split("T")[0]
                      }
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          dateRange: {
                            ...prev.dateRange,
                            end: new Date(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Additional Options</Label>
                  <div className="space-y-2 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeMedia}
                        onChange={(e) =>
                          setExportOptions((prev) => ({
                            ...prev,
                            includeMedia: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <span className="text-sm">Include media files</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includePrivateData}
                        onChange={(e) =>
                          setExportOptions((prev) => ({
                            ...prev,
                            includePrivateData: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <span className="text-sm">Include private data</span>
                    </label>
                  </div>
                </div>
              </div>

              <AlertDialog
                open={showExportDialog}
                onOpenChange={setShowExportDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Data Export</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will create a downloadable file containing your
                      selected data.
                      {exportOptions.includePrivateData &&
                        " This includes private information."}
                      The export includes data from{" "}
                      {exportOptions.dateRange.start.toLocaleDateString()} to{" "}
                      {exportOptions.dateRange.end.toLocaleDateString()}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleExport}>
                      Export
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Files</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".json,.csv,.xml"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div>
                  <Label>Selected Files</Label>
                  <div className="mt-2 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {(file.size / 1024).toFixed(1)} KB
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSelectedFiles((files) =>
                              files.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Supported formats:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>JSON files (.json)</li>
                      <li>CSV files (.csv)</li>
                      <li>XML files (.xml)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Dialog
                open={showImportDialog}
                onOpenChange={setShowImportDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={selectedFiles.length === 0}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Progress</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    {importProgress.status === "processing" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing: {importProgress.currentItem}</span>
                          <span>
                            {importProgress.completed}/{importProgress.total}
                          </span>
                        </div>
                        <Progress
                          value={
                            (importProgress.completed / importProgress.total) *
                            100
                          }
                        />
                      </div>
                    )}

                    {importProgress.status === "completed" && (
                      <div className="text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="font-medium">Import Completed!</p>
                        <p className="text-sm text-muted-foreground">
                          Successfully processed {importProgress.completed}{" "}
                          files
                        </p>
                      </div>
                    )}

                    {importProgress.status === "error" && (
                      <div className="text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                        <p className="font-medium">Import Failed</p>
                        <p className="text-sm text-muted-foreground">
                          {importProgress.errors} errors occurred during import
                        </p>
                      </div>
                    )}

                    {importProgress.status === "idle" && (
                      <div>
                        <p>Ready to import {selectedFiles.length} files.</p>
                        <Button onClick={handleImport} className="w-full mt-4">
                          Start Import
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {integration.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{integration.name}</h4>
                        {getStatusBadge(integration.status)}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {integration.description}
                      </p>

                      <div className="flex gap-1 flex-wrap mb-3">
                        {integration.capabilities.map((capability) => (
                          <Badge
                            key={capability}
                            variant="outline"
                            className="text-xs"
                          >
                            {capability}
                          </Badge>
                        ))}
                      </div>

                      {integration.lastSync && (
                        <p className="text-xs text-muted-foreground mb-3">
                          Last sync: {integration.lastSync.toLocaleString()}
                        </p>
                      )}

                      <div className="flex gap-2">
                        {integration.status === "connected" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => syncIntegration(integration.id)}
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Sync
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                disconnectIntegration(integration.id)
                              }
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => connectIntegration(integration.id)}
                          >
                            <Link2 className="w-3 h-3 mr-1" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use our API to programmatically access and manage your data.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>API Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value="sk_live_..." readOnly />
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Webhook URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="https://your-app.com/webhook" />
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                View API Documentation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataManagement;
