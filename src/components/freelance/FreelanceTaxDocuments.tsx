// @ts-nocheck
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Eye,
  Search,
  Filter,
  Building,
  Receipt,
  FileSpreadsheet,
  FileCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface TaxDocument {
  id: string;
  type: "1099" | "W9" | "invoice_summary" | "earnings_statement" | "tax_summary";
  title: string;
  description: string;
  year: number;
  quarter?: number;
  totalEarnings: number;
  status: "available" | "generating" | "pending";
  generatedDate?: Date;
  downloadUrl?: string;
}

const FreelanceTaxDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<TaxDocument[]>([
    {
      id: "1",
      type: "1099",
      title: "1099-NEC Form (2023)",
      description: "Nonemployee Compensation",
      year: 2023,
      totalEarnings: 45750,
      status: "available",
      generatedDate: new Date("2024-01-31"),
      downloadUrl: "#"
    },
    {
      id: "2",
      type: "earnings_statement",
      title: "Q4 2023 Earnings Statement",
      description: "Quarterly earnings breakdown",
      year: 2023,
      quarter: 4,
      totalEarnings: 15250,
      status: "available",
      generatedDate: new Date("2024-01-05"),
      downloadUrl: "#"
    },
    {
      id: "3",
      type: "tax_summary",
      title: "2023 Tax Summary",
      description: "Annual tax summary report",
      year: 2023,
      totalEarnings: 45750,
      status: "available",
      generatedDate: new Date("2024-02-01"),
      downloadUrl: "#"
    },
    {
      id: "4",
      type: "1099",
      title: "1099-NEC Form (2024)",
      description: "Nonemployee Compensation (Estimated)",
      year: 2024,
      totalEarnings: 12500,
      status: "generating",
    }
  ]);

  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    type: "earnings_statement" as TaxDocument["type"],
    year: new Date().getFullYear(),
    quarter: undefined as number | undefined,
  });

  const { toast } = useToast();

  const getDocumentIcon = (type: TaxDocument["type"]) => {
    switch (type) {
      case "1099": return <FileCheck className="w-5 h-5 text-blue-600" />;
      case "W9": return <FileText className="w-5 h-5 text-green-600" />;
      case "invoice_summary": return <Receipt className="w-5 h-5 text-purple-600" />;
      case "earnings_statement": return <FileSpreadsheet className="w-5 h-5 text-orange-600" />;
      case "tax_summary": return <Building className="w-5 h-5 text-red-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: TaxDocument["status"]) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Available</Badge>;
      case "generating":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Generating</Badge>;
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const yearMatch = selectedYear === "all" || doc.year.toString() === selectedYear;
    const typeMatch = selectedType === "all" || doc.type === selectedType;
    return yearMatch && typeMatch;
  });

  const handleDownload = async (document: TaxDocument) => {
    if (document.status !== "available") {
      toast({
        title: "Document not ready",
        description: "This document is still being generated. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    // Simulate download
    const link = document.createElement("a");
    link.href = "#"; // In real implementation, this would be the actual file URL
    link.download = `${document.title.replace(/\s+/g, "_")}.pdf`;
    link.click();

    toast({
      title: "Download started",
      description: `${document.title} is being downloaded`,
    });
  };

  const handleRequestDocument = async () => {
    const newDocument: TaxDocument = {
      id: Date.now().toString(),
      ...requestForm,
      title: `${requestForm.type.replace("_", " ").toUpperCase()} ${requestForm.year}${requestForm.quarter ? ` Q${requestForm.quarter}` : ""}`,
      description: "Custom requested document",
      totalEarnings: 0,
      status: "generating",
    };

    setDocuments(prev => [...prev, newDocument]);
    setShowRequestModal(false);
    setRequestForm({
      type: "earnings_statement",
      year: new Date().getFullYear(),
      quarter: undefined,
    });

    toast({
      title: "Document requested",
      description: "Your document is being generated and will be available shortly",
    });

    // Simulate document generation
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => 
        doc.id === newDocument.id 
          ? { ...doc, status: "available" as const, generatedDate: new Date(), totalEarnings: Math.floor(Math.random() * 20000) + 5000 }
          : doc
      ));
      
      toast({
        title: "Document ready",
        description: `${newDocument.title} is now available for download`,
      });
    }, 3000);
  };

  const availableYears = Array.from(new Set(documents.map(doc => doc.year))).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tax Documents</h2>
          <p className="text-gray-600 dark:text-gray-400">Download tax forms and earnings statements</p>
        </div>
        
        <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Request Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Tax Document</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="doc-type">Document Type</Label>
                <Select 
                  value={requestForm.type} 
                  onValueChange={(value) => setRequestForm(prev => ({ ...prev, type: value as TaxDocument["type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="earnings_statement">Earnings Statement</SelectItem>
                    <SelectItem value="1099">1099-NEC Form</SelectItem>
                    <SelectItem value="invoice_summary">Invoice Summary</SelectItem>
                    <SelectItem value="tax_summary">Tax Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="doc-year">Year</Label>
                <Select 
                  value={requestForm.year.toString()} 
                  onValueChange={(value) => setRequestForm(prev => ({ ...prev, year: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {requestForm.type === "earnings_statement" && (
                <div>
                  <Label htmlFor="doc-quarter">Quarter (Optional)</Label>
                  <Select 
                    value={requestForm.quarter?.toString() || "all"} 
                    onValueChange={(value) => setRequestForm(prev => ({ 
                      ...prev, 
                      quarter: value === "all" ? undefined : parseInt(value) 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Year</SelectItem>
                      <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                      <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                      <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                      <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleRequestDocument} className="flex-1">
                  Request Document
                </Button>
                <Button variant="outline" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-40">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {availableYears.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="1099">1099 Forms</SelectItem>
            <SelectItem value="earnings_statement">Earnings Statements</SelectItem>
            <SelectItem value="tax_summary">Tax Summaries</SelectItem>
            <SelectItem value="invoice_summary">Invoice Summaries</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getDocumentIcon(document.type)}
                  <div>
                    <CardTitle className="text-sm font-semibold">{document.title}</CardTitle>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{document.description}</p>
                  </div>
                </div>
                {getStatusBadge(document.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Earnings:</span>
                <span className="font-semibold text-green-600">
                  ${document.totalEarnings.toLocaleString()}
                </span>
              </div>
              
              {document.quarter && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Quarter:</span>
                  <span className="font-medium">Q{document.quarter}</span>
                </div>
              )}
              
              {document.generatedDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Generated:</span>
                  <span className="text-gray-900 dark:text-white">
                    {document.generatedDate.toLocaleDateString()}
                  </span>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(document)}
                  disabled={document.status !== "available"}
                  className="flex-1 flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  Download
                </Button>
                
                {document.status === "available" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No documents found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedYear !== "all" || selectedType !== "all" 
                ? "Try adjusting your filter criteria"
                : "Request your first tax document to get started"
              }
            </p>
            <Button onClick={() => setShowRequestModal(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Request Document
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tax Information Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Tax Information</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• 1099-NEC forms are generated annually for earnings over $600</li>
                <li>• Earnings statements are available quarterly and annually</li>
                <li>• Keep all documents for your tax records</li>
                <li>• Consult a tax professional for specific tax advice</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelanceTaxDocuments;
