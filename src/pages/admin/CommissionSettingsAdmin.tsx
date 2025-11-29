import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Edit2, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface CommissionSetting {
  id: string;
  service_type: string;
  operator_id: number | null;
  commission_type: 'percentage' | 'fixed_amount' | 'none';
  commission_value: number;
  min_amount?: number;
  max_amount?: number;
  is_active: boolean;
  created_at: string;
}

const CommissionSettingsAdmin = () => {
  const { session } = useAuth();
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    service_type: 'airtime',
    operator_id: '',
    commission_type: 'percentage',
    commission_value: '0',
    min_amount: '',
    max_amount: '',
    is_active: true
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/commission/settings', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
      } else {
        toast.error('Failed to load commission settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load commission settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.service_type || !formData.commission_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.commission_value) < 0) {
      toast.error('Commission value cannot be negative');
      return;
    }

    if (formData.commission_type === 'percentage' && parseFloat(formData.commission_value) > 100) {
      toast.error('Percentage commission cannot exceed 100%');
      return;
    }

    setLoading(true);
    try {
      const url = editingId
        ? `/api/commission/settings/${editingId}`
        : '/api/commission/settings';

      const method = editingId ? 'PUT' : 'POST';

      const body = {
        service_type: formData.service_type,
        operator_id: formData.operator_id ? parseInt(formData.operator_id) : null,
        commission_type: formData.commission_type,
        commission_value: parseFloat(formData.commission_value),
        min_amount: formData.min_amount ? parseFloat(formData.min_amount) : undefined,
        max_amount: formData.max_amount ? parseFloat(formData.max_amount) : undefined,
        is_active: formData.is_active
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingId ? 'Commission setting updated' : 'Commission setting created');
        fetchSettings();
        resetForm();
      } else {
        toast.error(result.error || 'Failed to save setting');
      }
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.error('Failed to save commission setting');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this commission setting?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/commission/settings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Commission setting deleted');
        fetchSettings();
      } else {
        toast.error('Failed to delete setting');
      }
    } catch (error) {
      console.error('Error deleting setting:', error);
      toast.error('Failed to delete commission setting');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting: CommissionSetting) => {
    setFormData({
      service_type: setting.service_type,
      operator_id: setting.operator_id?.toString() || '',
      commission_type: setting.commission_type,
      commission_value: setting.commission_value.toString(),
      min_amount: setting.min_amount?.toString() || '',
      max_amount: setting.max_amount?.toString() || '',
      is_active: setting.is_active
    });
    setEditingId(setting.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      service_type: 'airtime',
      operator_id: '',
      commission_type: 'percentage',
      commission_value: '0',
      min_amount: '',
      max_amount: '',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getServiceIcon = (serviceType: string) => {
    const icons: Record<string, string> = {
      airtime: '📱',
      data: '📊',
      utilities: '⚡',
      gift_cards: '🎁'
    };
    return icons[serviceType] || '💰';
  };

  const getCommissionDisplay = (setting: CommissionSetting) => {
    if (setting.commission_type === 'percentage') {
      return `${setting.commission_value}%`;
    } else if (setting.commission_type === 'fixed_amount') {
      return `₦${setting.commission_value.toLocaleString()}`;
    }
    return 'No commission';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commission Settings</h1>
          <p className="text-gray-600 mt-2">Manage pricing margins and commissions</p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Commission Rule
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Commission Setting' : 'Create New Commission Setting'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <Select value={formData.service_type} onValueChange={(value) => setFormData({ ...formData, service_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="airtime">Airtime</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="gift_cards">Gift Cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operator ID (Leave empty for global)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 1 for MTN"
                    value={formData.operator_id}
                    onChange={(e) => setFormData({ ...formData, operator_id: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Type *
                  </label>
                  <Select value={formData.commission_type} onValueChange={(value) => setFormData({ ...formData, commission_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount (₦)</SelectItem>
                      <SelectItem value="none">No Commission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Value *
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.commission_value}
                    onChange={(e) => setFormData({ ...formData, commission_value: e.target.value })}
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Amount (Optional)
                  </label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Amount (Optional)
                  </label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={formData.max_amount}
                    onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Settings List */}
      {loading && !showForm ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-600 mt-2">Loading settings...</p>
        </div>
      ) : settings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No commission settings found</p>
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="mt-4"
            >
              Create your first commission rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {settings.map((setting) => (
            <Card key={setting.id} className={!setting.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getServiceIcon(setting.service_type)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {setting.service_type}
                          {setting.operator_id && ` - Operator ${setting.operator_id}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {setting.is_active ? '✓ Active' : '✗ Inactive'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Commission</p>
                        <p className="font-semibold text-lg text-blue-600">
                          {getCommissionDisplay(setting)}
                        </p>
                      </div>
                      
                      {(setting.min_amount || setting.max_amount) && (
                        <div>
                          <p className="text-gray-600">Amount Range</p>
                          <p className="text-sm">
                            {setting.min_amount && `Min: ₦${setting.min_amount.toLocaleString()}`}
                            {setting.min_amount && setting.max_amount && ' - '}
                            {setting.max_amount && `Max: ₦${setting.max_amount.toLocaleString()}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(setting)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(setting.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommissionSettingsAdmin;
