import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Zap, BarChart3, Settings, Play } from 'lucide-react';

interface BoostConfig {
  id: string;
  boostType: string;
  multiplier: number;
  durationDays: number;
  description: string;
  enabled: boolean;
}

interface BoostStats {
  totalActiveBoosts: number;
  boostsByType: Record<string, number>;
  totalBoostedEarnings: number;
  averageMultiplier: number;
}

export const CreatorBoostManagement: React.FC = () => {
  const [configs, setConfigs] = useState<BoostConfig[]>([]);
  const [stats, setStats] = useState<BoostStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<BoostConfig>>({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [newBoost, setNewBoost] = useState({
    boostType: '',
    multiplier: 1.25,
    durationDays: 14,
    description: ''
  });
  const [applyingBoost, setApplyingBoost] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch configurations
      const configRes = await fetch('/api/creator-boost/admin/configurations');
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfigs(configData.data || []);
      }

      // Fetch statistics
      const statsRes = await fetch('/api/creator-boost/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || null);
      }
    } catch (error) {
      console.error('Error fetching boost data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditConfig = (config: BoostConfig) => {
    setEditingConfig(config.id);
    setEditValues({
      multiplier: config.multiplier,
      durationDays: config.durationDays,
      description: config.description,
      enabled: config.enabled
    });
  };

  const handleSaveConfig = async () => {
    if (!editingConfig) return;

    try {
      const response = await fetch(`/api/creator-boost/admin/configurations/${editingConfig}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues)
      });

      if (response.ok) {
        setEditingConfig(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const handleCreateBoost = async () => {
    if (!newBoost.boostType || !newBoost.description) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/creator-boost/admin/configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoost)
      });

      if (response.ok) {
        setShowNewForm(false);
        setNewBoost({
          boostType: '',
          multiplier: 1.25,
          durationDays: 14,
          description: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating boost:', error);
    }
  };

  const handleApplyBoost = async (configId: string) => {
    setApplyingBoost(configId);

    try {
      const response = await fetch(`/api/creator-boost/admin/seasonal/apply/${configId}`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Boost applied to ${data.data.appliedCount} creators`);
        fetchData();
      }
    } catch (error) {
      console.error('Error applying boost:', error);
      alert('Failed to apply boost');
    } finally {
      setApplyingBoost(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading boost management...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Boosts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalActiveBoosts}
              </div>
              <p className="text-xs text-gray-500 mt-1">Creators with active multipliers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Multiplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.averageMultiplier}x
              </div>
              <p className="text-xs text-gray-500 mt-1">Average boost rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Boost Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                ${stats.totalBoostedEarnings.toFixed(0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total boosted earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {configs.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active boost types</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Boost Configurations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Boost Configurations
            </CardTitle>
            <CardDescription>Manage creator earning boost multipliers</CardDescription>
          </div>
          <Button
            onClick={() => setShowNewForm(!showNewForm)}
            size="sm"
            variant={showNewForm ? 'secondary' : 'default'}
          >
            {showNewForm ? 'Cancel' : 'New Configuration'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Configuration Form */}
          {showNewForm && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <div>
                <label className="text-sm font-medium">Boost Type</label>
                <input
                  type="text"
                  placeholder="e.g., summer_promo, holiday_special"
                  value={newBoost.boostType}
                  onChange={(e) => setNewBoost({ ...newBoost, boostType: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1"
                    max="3"
                    value={newBoost.multiplier}
                    onChange={(e) => setNewBoost({ ...newBoost, multiplier: parseFloat(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={newBoost.durationDays}
                    onChange={(e) => setNewBoost({ ...newBoost, durationDays: parseInt(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border rounded text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Describe this boost campaign"
                  value={newBoost.description}
                  onChange={(e) => setNewBoost({ ...newBoost, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded text-sm"
                  rows={2}
                />
              </div>
              <Button onClick={handleCreateBoost} className="w-full">
                Create Configuration
              </Button>
            </div>
          )}

          {/* Configuration List */}
          <div className="space-y-3">
            {configs.map((config) => (
              <div key={config.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold capitalize">{config.boostType.replace('_', ' ')}</h3>
                      <Badge variant={config.enabled ? 'default' : 'secondary'}>
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={editingConfig === config.id ? 'default' : 'outline'}
                      onClick={() => {
                        if (editingConfig === config.id) {
                          handleSaveConfig();
                        } else {
                          handleEditConfig(config);
                        }
                      }}
                    >
                      {editingConfig === config.id ? 'Save' : 'Edit'}
                    </Button>
                    {config.boostType !== 'tier_upgrade' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyBoost(config.id)}
                        disabled={applyingBoost === config.id}
                        className="gap-1"
                      >
                        <Play className="h-3 w-3" />
                        {applyingBoost === config.id ? 'Applying...' : 'Apply'}
                      </Button>
                    )}
                  </div>
                </div>

                {editingConfig === config.id ? (
                  <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded">
                    <div>
                      <label className="text-xs font-medium">Multiplier</label>
                      <input
                        type="number"
                        step="0.05"
                        value={editValues.multiplier || 1}
                        onChange={(e) =>
                          setEditValues({ ...editValues, multiplier: parseFloat(e.target.value) })
                        }
                        className="w-full mt-1 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Duration (days)</label>
                      <input
                        type="number"
                        value={editValues.durationDays || 14}
                        onChange={(e) =>
                          setEditValues({ ...editValues, durationDays: parseInt(e.target.value) })
                        }
                        className="w-full mt-1 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Enabled</label>
                      <select
                        value={editValues.enabled ? 'true' : 'false'}
                        onChange={(e) =>
                          setEditValues({ ...editValues, enabled: e.target.value === 'true' })
                        }
                        className="w-full mt-1 px-2 py-1 border rounded text-sm"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Multiplier</p>
                      <p className="font-bold text-green-600">{config.multiplier}x</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-bold">{config.durationDays} days</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Extra Earnings</p>
                      <p className="font-bold text-orange-600">+{Math.round((config.multiplier - 1) * 100)}%</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Information */}
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>Tier Upgrade Boost:</strong> Automatically applied when users complete KYC verification
          (1.5x for 30 days). Other boosts must be manually applied or triggered by specific conditions.
        </AlertDescription>
      </Alert>
    </div>
  );
};
