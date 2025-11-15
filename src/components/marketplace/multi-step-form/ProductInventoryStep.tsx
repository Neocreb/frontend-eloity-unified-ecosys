// @ts-nocheck
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FormData {
  inStock: boolean;
  stockQuantity?: string;
  isNew: boolean;
  assemblyRequired?: boolean;
  assemblyTime?: string;
}

export const ProductInventoryStep = ({ 
  formData, 
  updateFormData,
  productType
}: { 
  formData: FormData; 
  updateFormData: (data: Partial<FormData>) => void;
  productType: "physical" | "digital" | "service";
}) => {
  const [assemblyRequired, setAssemblyRequired] = useState(formData.assemblyRequired || false);
  
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Inventory Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">In Stock</Label>
              <p className="text-sm text-gray-500">
                Is this product currently available for purchase?
              </p>
            </div>
            <Switch
              checked={formData.inStock}
              onCheckedChange={(checked) => updateFormData({ inStock: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">New Product</Label>
              <p className="text-sm text-gray-500">
                Mark as a new arrival to highlight in your store
              </p>
            </div>
            <Switch
              checked={formData.isNew}
              onCheckedChange={(checked) => updateFormData({ isNew: checked })}
            />
          </div>
        </div>
        
        {productType !== 'digital' && (
          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Stock Quantity</Label>
            <Input
              id="stockQuantity"
              type="number"
              value={formData.stockQuantity || ''}
              onChange={(e) => updateFormData({ stockQuantity: e.target.value })}
              placeholder="Enter quantity"
            />
            <p className="text-sm text-gray-500">
              Number of items available in stock
            </p>
          </div>
        )}
      </div>
      
      {productType === 'physical' && (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold">Assembly Information</h3>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">Assembly Required</Label>
              <p className="text-sm text-gray-500">
                Does this product require assembly?
              </p>
            </div>
            <Switch
              checked={assemblyRequired}
              onCheckedChange={(checked) => {
                setAssemblyRequired(checked);
                updateFormData({ assemblyRequired: checked });
              }}
            />
          </div>
          
          {assemblyRequired && (
            <div className="space-y-2">
              <Label htmlFor="assemblyTime">Assembly Time</Label>
              <Input
                id="assemblyTime"
                value={formData.assemblyTime || ''}
                onChange={(e) => updateFormData({ assemblyTime: e.target.value })}
                placeholder="e.g., 30 minutes, 2 hours"
              />
              <p className="text-sm text-gray-500">
                Estimated time required for assembly
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Inventory Tips</h4>
        <ul className="text-blue-700 text-sm list-disc pl-5 space-y-1">
          <li>Keep your inventory updated to avoid overselling</li>
          <li>Mark products as "New" to attract customer attention</li>
          <li>For digital products, inventory is unlimited by default</li>
          <li>For services, inventory represents available time slots</li>
        </ul>
      </div>
    </div>
  );
};