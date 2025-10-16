import React, { useState, useEffect } from 'react';
import { smsService } from '@/services/smsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SMSTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    is_active: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const templates = await smsService.getSMSTemplates();
      setTemplates(templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch SMS templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: 'Error',
        description: 'Please enter both name and content for the template',
        variant: 'destructive',
      });
      return;
    }

    try {
      // In a real implementation, you would call an API to create the template
      // For now, we'll just add it to the local state
      const template: SMSTemplate = {
        id: `template_${Date.now()}`,
        name: newTemplate.name,
        content: newTemplate.content,
        variables: {},
        is_active: newTemplate.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setTemplates(prev => [...prev, template]);
      setNewTemplate({ name: '', content: '', is_active: true });
      
      toast({
        title: 'Success',
        description: 'Template created successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create template',
        variant: 'destructive',
      });
    }
  };

  const toggleTemplateStatus = async (templateId: string, currentStatus: boolean) => {
    try {
      // In a real implementation, you would call an API to update the template
      // For now, we'll just update the local state
      setTemplates(prev => 
        prev.map(template => 
          template.id === templateId 
            ? { ...template, is_active: !currentStatus, updated_at: new Date().toISOString() } 
            : template
        )
      );
      
      toast({
        title: 'Success',
        description: `Template ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update template',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SMS Templates</CardTitle>
          <CardDescription>Manage your SMS message templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SMS Templates</CardTitle>
          <CardDescription>Manage your SMS message templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Templates</CardTitle>
        <CardDescription>Manage your SMS message templates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Create New Template</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Welcome Message"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-content">Template Content</Label>
                <Textarea
                  id="template-content"
                  placeholder="Enter your template content here..."
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  Use variables like {{name}} or {{code}} to personalize messages
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="template-active"
                  checked={newTemplate.is_active}
                  onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="template-active">Active</Label>
              </div>
              
              <Button onClick={handleCreateTemplate}>
                Create Template
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Existing Templates</h3>
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No templates found
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {template.content}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTemplateStatus(template.id, template.is_active)}
                        >
                          {template.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm text-gray-500">
                        Created: {new Date(template.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Updated: {new Date(template.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SMSTemplates;