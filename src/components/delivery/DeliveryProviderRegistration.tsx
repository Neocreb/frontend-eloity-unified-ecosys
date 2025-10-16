// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  Camera,
  Shield,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface ServiceArea {
  city: string;
  state: string;
  country: string;
  radius: number;
  postalCodes: string[];
}

interface OperatingHours {
  [key: string]: {
    start: string;
    end: string;
    isOpen: boolean;
  };
}

interface DeliveryProviderFormData {
  businessName: string;
  businessRegistrationNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  alternatePhone: string;
  serviceAreas: ServiceArea[];
  coverageRadius: number;
  vehicleTypes: string[];
  maxWeight: number;
  maxDimensions: {
    length: number;
    width: number;
    height: number;
  };
  servicesOffered: string[];
  specialServices: string[];
  baseRate: number;
  ratePerKm: number;
  ratePerKg: number;
  expressMultiplier: number;
  fuelSurcharge: number;
  operatingHours: OperatingHours;
  timeZone: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  taxId: string;
}

const initialFormData: DeliveryProviderFormData = {
  businessName: "",
  businessRegistrationNumber: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  alternatePhone: "",
  serviceAreas: [
    {
      city: "",
      state: "",
      country: "",
      radius: 10,
      postalCodes: [],
    },
  ],
  coverageRadius: 10,
  vehicleTypes: [],
  maxWeight: 0,
  maxDimensions: {
    length: 0,
    width: 0,
    height: 0,
  },
  servicesOffered: [],
  specialServices: [],
  baseRate: 0,
  ratePerKm: 0,
  ratePerKg: 0,
  expressMultiplier: 1.5,
  fuelSurcharge: 0,
  operatingHours: {
    monday: { start: "09:00", end: "17:00", isOpen: true },
    tuesday: { start: "09:00", end: "17:00", isOpen: true },
    wednesday: { start: "09:00", end: "17:00", isOpen: true },
    thursday: { start: "09:00", end: "17:00", isOpen: true },
    friday: { start: "09:00", end: "17:00", isOpen: true },
    saturday: { start: "09:00", end: "17:00", isOpen: false },
    sunday: { start: "09:00", end: "17:00", isOpen: false },
  },
  timeZone: "UTC",
  bankAccountName: "",
  bankAccountNumber: "",
  bankName: "",
  taxId: "",
};

const vehicleOptions = [
  { value: "bike", label: "Motorcycle/Bike", icon: "🏍️" },
  { value: "car", label: "Car", icon: "🚗" },
  { value: "van", label: "Van", icon: "🚐" },
  { value: "truck", label: "Truck", icon: "🚛" },
];

const serviceOptions = [
  { value: "same_day", label: "Same Day Delivery" },
  { value: "next_day", label: "Next Day Delivery" },
  { value: "express", label: "Express Delivery (2-4 hours)" },
  { value: "standard", label: "Standard Delivery" },
  { value: "scheduled", label: "Scheduled Delivery" },
];

const specialServiceOptions = [
  { value: "fragile", label: "Fragile Items" },
  { value: "cold_chain", label: "Cold Chain (Refrigerated)" },
  { value: "documents", label: "Documents & Papers" },
  { value: "heavy_items", label: "Heavy Items (>20kg)" },
  { value: "oversized", label: "Oversized Items" },
  { value: "valuable", label: "High-Value Items" },
];

const daysOfWeek = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function DeliveryProviderRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DeliveryProviderFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<{ [key: string]: File[] }>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();

  const totalSteps = 6;

  const steps = [
    { id: 1, title: "Business Info", icon: FileText, description: "Basic business details" },
    { id: 2, title: "Service Area", icon: MapPin, description: "Coverage areas" },
    { id: 3, title: "Vehicle & Capacity", icon: Truck, description: "Fleet information" },
    { id: 4, title: "Services", icon: Shield, description: "Service offerings" },
    { id: 5, title: "Pricing & Hours", icon: DollarSign, description: "Rates and availability" },
    { id: 6, title: "Documents", icon: Camera, description: "Verification documents" },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value,
      },
    }));
  };

  const handleServiceAreaChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.map((area, i) =>
        i === index ? { ...area, [field]: value } : area
      ),
    }));
  };

  const addServiceArea = () => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: [
        ...prev.serviceAreas,
        {
          city: "",
          state: "",
          country: "",
          radius: 10,
          postalCodes: [],
        },
      ],
    }));
  };

  const removeServiceArea = (index: number) => {
    if (formData.serviceAreas.length > 1) {
      setFormData(prev => ({
        ...prev,
        serviceAreas: prev.serviceAreas.filter((_, i) => i !== index),
      }));
    }
  };

  const handleOperatingHoursChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleFileUpload = (category: string, files: FileList | null) => {
    if (files) {
      setDocuments(prev => ({
        ...prev,
        [category]: Array.from(files),
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In a real implementation, you'd upload documents first
      const response = await fetch("/api/delivery/providers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowSuccessDialog(true);
        toast({
          title: "Registration Submitted",
          description: "Your delivery provider registration has been submitted for review.",
        });
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.businessName &&
          formData.contactName &&
          formData.contactEmail &&
          formData.contactPhone
        );
      case 2:
        return formData.serviceAreas.every(area => area.city && area.state && area.country);
      case 3:
        return !!(formData.vehicleTypes.length > 0 && formData.maxWeight > 0);
      case 4:
        return formData.servicesOffered.length > 0;
      case 5:
        return !!(formData.baseRate > 0 && formData.ratePerKm > 0);
      case 6:
        return Object.keys(documents).length >= 2; // At least 2 document types
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                  placeholder="Your delivery service business name"
                />
              </div>
              <div>
                <Label htmlFor="businessRegNumber">Business Registration Number</Label>
                <Input
                  id="businessRegNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) => handleInputChange("businessRegistrationNumber", e.target.value)}
                  placeholder="Optional registration number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange("contactName", e.target.value)}
                  placeholder="Primary contact person"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="business@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPhone">Primary Phone *</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input
                  id="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                  placeholder="Optional backup number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxId">Tax ID / Business License</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange("taxId", e.target.value)}
                  placeholder="Tax identification number"
                />
              </div>
              <div>
                <Label htmlFor="timeZone">Time Zone</Label>
                <Select
                  value={formData.timeZone}
                  onValueChange={(value) => handleInputChange("timeZone", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Service Coverage Areas</h3>
              <Button type="button" onClick={addServiceArea} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Area
              </Button>
            </div>

            {formData.serviceAreas.map((area, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Service Area {index + 1}</h4>
                  {formData.serviceAreas.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeServiceArea(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input
                      value={area.city}
                      onChange={(e) => handleServiceAreaChange(index, "city", e.target.value)}
                      placeholder="City name"
                    />
                  </div>
                  <div>
                    <Label>State/Province *</Label>
                    <Input
                      value={area.state}
                      onChange={(e) => handleServiceAreaChange(index, "state", e.target.value)}
                      placeholder="State or province"
                    />
                  </div>
                  <div>
                    <Label>Country *</Label>
                    <Input
                      value={area.country}
                      onChange={(e) => handleServiceAreaChange(index, "country", e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Coverage Radius (km)</Label>
                  <Input
                    type="number"
                    value={area.radius}
                    onChange={(e) => handleServiceAreaChange(index, "radius", parseInt(e.target.value))}
                    placeholder="10"
                    min="1"
                    max="100"
                  />
                </div>
              </Card>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Vehicle Types *</Label>
              <div className="grid grid-cols-2 gap-4">
                {vehicleOptions.map((vehicle) => (
                  <div key={vehicle.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={vehicle.value}
                      checked={formData.vehicleTypes.includes(vehicle.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleInputChange("vehicleTypes", [...formData.vehicleTypes, vehicle.value]);
                        } else {
                          handleInputChange(
                            "vehicleTypes",
                            formData.vehicleTypes.filter((v) => v !== vehicle.value)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={vehicle.value} className="flex items-center gap-2 cursor-pointer">
                      <span className="text-lg">{vehicle.icon}</span>
                      {vehicle.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxWeight">Maximum Weight Capacity (kg) *</Label>
                <Input
                  id="maxWeight"
                  type="number"
                  value={formData.maxWeight}
                  onChange={(e) => handleInputChange("maxWeight", parseFloat(e.target.value))}
                  placeholder="50"
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-4 block">Maximum Dimensions (cm)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maxLength">Length</Label>
                  <Input
                    id="maxLength"
                    type="number"
                    value={formData.maxDimensions.length}
                    onChange={(e) =>
                      handleNestedInputChange("maxDimensions", "length", parseFloat(e.target.value))
                    }
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="maxWidth">Width</Label>
                  <Input
                    id="maxWidth"
                    type="number"
                    value={formData.maxDimensions.width}
                    onChange={(e) =>
                      handleNestedInputChange("maxDimensions", "width", parseFloat(e.target.value))
                    }
                    placeholder="80"
                  />
                </div>
                <div>
                  <Label htmlFor="maxHeight">Height</Label>
                  <Input
                    id="maxHeight"
                    type="number"
                    value={formData.maxDimensions.height}
                    onChange={(e) =>
                      handleNestedInputChange("maxDimensions", "height", parseFloat(e.target.value))
                    }
                    placeholder="60"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Services Offered *</Label>
              <div className="grid grid-cols-1 gap-3">
                {serviceOptions.map((service) => (
                  <div key={service.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.value}
                      checked={formData.servicesOffered.includes(service.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleInputChange("servicesOffered", [...formData.servicesOffered, service.value]);
                        } else {
                          handleInputChange(
                            "servicesOffered",
                            formData.servicesOffered.filter((s) => s !== service.value)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={service.value} className="cursor-pointer">
                      {service.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-4 block">Special Services</Label>
              <div className="grid grid-cols-1 gap-3">
                {specialServiceOptions.map((service) => (
                  <div key={service.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.value}
                      checked={formData.specialServices.includes(service.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleInputChange("specialServices", [...formData.specialServices, service.value]);
                        } else {
                          handleInputChange(
                            "specialServices",
                            formData.specialServices.filter((s) => s !== service.value)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={service.value} className="cursor-pointer">
                      {service.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Pricing Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseRate">Base Rate ($) *</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    step="0.01"
                    value={formData.baseRate}
                    onChange={(e) => handleInputChange("baseRate", parseFloat(e.target.value))}
                    placeholder="5.00"
                  />
                </div>
                <div>
                  <Label htmlFor="ratePerKm">Rate per km ($) *</Label>
                  <Input
                    id="ratePerKm"
                    type="number"
                    step="0.01"
                    value={formData.ratePerKm}
                    onChange={(e) => handleInputChange("ratePerKm", parseFloat(e.target.value))}
                    placeholder="1.50"
                  />
                </div>
                <div>
                  <Label htmlFor="ratePerKg">Rate per kg ($)</Label>
                  <Input
                    id="ratePerKg"
                    type="number"
                    step="0.01"
                    value={formData.ratePerKg}
                    onChange={(e) => handleInputChange("ratePerKg", parseFloat(e.target.value))}
                    placeholder="0.50"
                  />
                </div>
                <div>
                  <Label htmlFor="expressMultiplier">Express Multiplier</Label>
                  <Input
                    id="expressMultiplier"
                    type="number"
                    step="0.1"
                    value={formData.expressMultiplier}
                    onChange={(e) => handleInputChange("expressMultiplier", parseFloat(e.target.value))}
                    placeholder="1.5"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Operating Hours</h3>
              <div className="space-y-3">
                {daysOfWeek.map((day) => (
                  <div key={day.key} className="flex items-center space-x-4">
                    <div className="w-24">
                      <Checkbox
                        id={day.key}
                        checked={formData.operatingHours[day.key].isOpen}
                        onCheckedChange={(checked) =>
                          handleOperatingHoursChange(day.key, "isOpen", checked)
                        }
                      />
                      <Label htmlFor={day.key} className="ml-2 cursor-pointer">
                        {day.label}
                      </Label>
                    </div>
                    {formData.operatingHours[day.key].isOpen && (
                      <>
                        <Input
                          type="time"
                          value={formData.operatingHours[day.key].start}
                          onChange={(e) =>
                            handleOperatingHoursChange(day.key, "start", e.target.value)
                          }
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={formData.operatingHours[day.key].end}
                          onChange={(e) =>
                            handleOperatingHoursChange(day.key, "end", e.target.value)
                          }
                          className="w-32"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankAccountName">Account Holder Name</Label>
                  <Input
                    id="bankAccountName"
                    value={formData.bankAccountName}
                    onChange={(e) => handleInputChange("bankAccountName", e.target.value)}
                    placeholder="Business account name"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    placeholder="Bank name"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bankAccountNumber">Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                    placeholder="Bank account number"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">Upload Verification Documents</h3>
              <p className="text-sm text-gray-600">
                Please upload the required documents for verification. All documents will be
                reviewed by our team.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <h4 className="font-medium mb-2">Driver's License</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a clear photo of your driver's license
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload("license", e.target.files)}
                    className="hidden"
                    id="license-upload"
                  />
                  <Label htmlFor="license-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" className="w-full">
                      Choose Files
                    </Button>
                  </Label>
                  {documents.license && (
                    <p className="text-sm text-green-600 mt-2">
                      {documents.license.length} file(s) selected
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <h4 className="font-medium mb-2">Vehicle Registration</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload vehicle registration documents
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload("registration", e.target.files)}
                    className="hidden"
                    id="registration-upload"
                  />
                  <Label htmlFor="registration-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" className="w-full">
                      Choose Files
                    </Button>
                  </Label>
                  {documents.registration && (
                    <p className="text-sm text-green-600 mt-2">
                      {documents.registration.length} file(s) selected
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <h4 className="font-medium mb-2">Insurance Certificate</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload current vehicle insurance certificate
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload("insurance", e.target.files)}
                    className="hidden"
                    id="insurance-upload"
                  />
                  <Label htmlFor="insurance-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" className="w-full">
                      Choose Files
                    </Button>
                  </Label>
                  {documents.insurance && (
                    <p className="text-sm text-green-600 mt-2">
                      {documents.insurance.length} file(s) selected
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <h4 className="font-medium mb-2">Business License</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload business license or permit (if applicable)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload("business", e.target.files)}
                    className="hidden"
                    id="business-upload"
                  />
                  <Label htmlFor="business-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" className="w-full">
                      Choose Files
                    </Button>
                  </Label>
                  {documents.business && (
                    <p className="text-sm text-green-600 mt-2">
                      {documents.business.length} file(s) selected
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Become a Delivery Provider</h1>
          <p className="text-gray-600">
            Join our delivery network and start earning by providing delivery services to customers
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                  currentStep >= step.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-gray-300 text-gray-500"
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-3 hidden md:block">
                <div
                  className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id ? "text-primary" : "text-gray-500"
                  )}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-4 h-0.5 w-16 transition-colors hidden md:block",
                    currentStep > step.id ? "bg-primary" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const StepIcon = steps[currentStep - 1].icon;
                return <StepIcon className="h-5 w-5" />;
              })()}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                    disabled={!isStepValid(currentStep)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isStepValid(currentStep) || isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Application Submitted Successfully!
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <p>
                Thank you for applying to become a delivery provider with our platform. Your
                application has been submitted and is now under review.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Our team will review your application within 2-3 business days</li>
                  <li>• We'll verify your documents and information</li>
                  <li>• You'll receive an email with the verification result</li>
                  <li>• Once approved, you can start accepting delivery requests</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                You can check your application status in your dashboard. If you have any questions,
                please contact our support team.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessDialog(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
