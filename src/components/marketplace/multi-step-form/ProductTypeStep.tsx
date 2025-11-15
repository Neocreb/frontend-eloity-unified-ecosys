// @ts-nocheck
import { Card, CardContent } from '@/components/ui/card';
import { Package, Download, FileText } from 'lucide-react';

interface FormData {
  productType: "physical" | "digital" | "service";
}

export const ProductTypeStep = ({ formData, updateFormData }: { 
  formData: FormData; 
  updateFormData: (data: Partial<FormData>) => void 
}) => {
  const productTypes = [
    {
      id: 'physical',
      title: 'Physical Product',
      description: 'Tangible items that require shipping',
      icon: Package,
      color: 'blue'
    },
    {
      id: 'digital',
      title: 'Digital Product',
      description: 'Downloadable files and digital content',
      icon: Download,
      color: 'green'
    },
    {
      id: 'service',
      title: 'Service',
      description: 'Professional services and consultations',
      icon: FileText,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {productTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card 
              key={type.id}
              className={`border-2 cursor-pointer transition-all ${
                formData.productType === type.id
                  ? `border-${type.color}-500 bg-${type.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateFormData({ productType: type.id as "physical" | "digital" | "service" })}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full bg-${type.color}-100`}>
                    <Icon className={`w-6 h-6 text-${type.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{type.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{type.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Product Type Information</h4>
        <p className="text-blue-700 text-sm">
          {formData.productType === 'physical' && 
            "Physical products require shipping and handling. You'll need to provide dimensions, weight, and packaging information."}
          {formData.productType === 'digital' && 
            "Digital products are downloadable files. You'll need to provide download links, file formats, and licensing information."}
          {formData.productType === 'service' && 
            "Services are intangible offerings. You'll need to describe the service details, delivery method, and terms."}
        </p>
      </div>
    </div>
  );
};