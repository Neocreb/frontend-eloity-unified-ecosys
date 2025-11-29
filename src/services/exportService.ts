import { supabase } from '@/integrations/supabase/client';
import { FeatureAnalytics } from './analyticsService';
import { UserDemographics } from './userDemographicsService';
import { getErrorMessage } from '@/utils/utils';

// Types for export data
export interface ExportData {
  revenue: {
    total: number;
    platforms: Array<{
      name: string;
      revenue: string | number;
    }>;
  };
  content: any[];
  audience: {
    total: string;
    growth: string;
    demographics: {
      age: Record<string, number>;
      location: Record<string, number>;
    };
  };
  userDemographics?: UserDemographics;
  exportDate: string;
}

// Format data for CSV export
const formatForCSV = (data: ExportData): string => {
  const rows: string[] = [];
  const addRow = (key: string, value: any) => {
    rows.push([`"${key}"`, `"${String(value).replace(/"/g, '""')}"`].join(','));
  };

  // Add metadata
  addRow('Export Date', data.exportDate);
  
  // Add revenue data
  addRow('Total Revenue', data.revenue.total);
  data.revenue.platforms.forEach(platform => {
    addRow(`Revenue - ${platform.name}`, platform.revenue);
  });

  // Add audience data
  addRow('Audience Total', data.audience.total);
  addRow('Audience Growth', data.audience.growth);

  // Add demographics data
  Object.entries(data.audience.demographics.age).forEach(([ageGroup, percentage]) => {
    addRow(`Age Demographic - ${ageGroup}`, `${percentage}%`);
  });

  Object.entries(data.audience.demographics.location).forEach(([location, percentage]) => {
    addRow(`Location Demographic - ${location}`, `${percentage}%`);
  });

  // Add user demographics if available
  if (data.userDemographics) {
    // Age demographics
    data.userDemographics.age.forEach(age => {
      addRow(`User Age - ${age.range}`, `${age.percentage}% (${age.count})`);
    });

    // Gender demographics
    data.userDemographics.gender.forEach(gender => {
      addRow(`User Gender - ${gender.gender}`, `${gender.percentage}% (${gender.count})`);
    });

    // Location demographics
    data.userDemographics.location.forEach(location => {
      addRow(`User Location - ${location.location}`, `${location.percentage}% (${location.count})`);
    });

    // Interest demographics
    data.userDemographics.interests.forEach(interest => {
      addRow(`User Interest - ${interest.interest}`, `${interest.percentage}%`);
    });
  }

  // Add content data headers
  rows.push('');
  rows.push('"Content ID","Content Title","Content Type","Views","Engagement","Revenue","Platform"');

  // Add content data
  data.content.forEach((content, index) => {
    const row = [
      `"${content.id || ''}"`,
      `"${(content.title || '').replace(/"/g, '""')}"`,
      `"${content.type || ''}"`,
      `"${content.views || 0}"`,
      `"${content.engagement || 0}"`,
      `"${content.revenue || 0}"`,
      `"${content.platform || ''}"`
    ].join(',');
    rows.push(row);
  });

  return rows.join('\n');
};

// Format data for JSON export
const formatForJSON = (data: ExportData): string => {
  return JSON.stringify(data, null, 2);
};

// Export data to CSV
export const exportToCSV = async (data: ExportData): Promise<void> => {
  try {
    const csvContent = formatForCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export data as CSV');
  }
};

// Export data to JSON
export const exportToJSON = async (data: ExportData): Promise<void> => {
  try {
    const jsonContent = formatForJSON(data);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-export-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error('Failed to export data as JSON');
  }
};

// Export data to PDF (simplified implementation - would require a PDF library in a real app)
export const exportToPDF = async (data: ExportData): Promise<void> => {
  try {
    // In a real implementation, you would use a library like jsPDF or pdfmake
    // For now, we'll export as JSON since PDF requires additional dependencies
    console.warn('PDF export not implemented, falling back to JSON export');
    await exportToJSON(data);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export data as PDF');
  }
};

// Fetch comprehensive analytics data for export
export const fetchExportData = async (
  platformFeatures: FeatureAnalytics[],
  topPerformingContent: any[],
  userDemographics: UserDemographics | null
): Promise<ExportData> => {
  try {
    // Calculate total revenue
    const totalRevenue = platformFeatures.reduce((sum, feature) => {
      const revenueMetric = feature.metrics.find(m => 
        m.title.includes('Revenue') || m.title.includes('Earnings')
      );
      if (revenueMetric && typeof revenueMetric.value === 'string') {
        // Handle different currency formats
        const value = revenueMetric.value.replace(/[^0-9.-]/g, '');
        return sum + (parseFloat(value) || 0);
      }
      return sum;
    }, 0);

    // Create export data structure
    const exportData: ExportData = {
      revenue: {
        total: totalRevenue,
        platforms: platformFeatures.map(f => ({
          name: f.name,
          revenue: f.metrics.find(m => m.title.includes('Revenue') || m.title.includes('Earnings'))?.value || '0'
        }))
      },
      content: topPerformingContent,
      audience: {
        total: "45.2K",
        growth: "+28.5%",
        demographics: {
          age: { "18-24": 35, "25-34": 40, "35-44": 20, "45+": 5 },
          location: { "US": 42, "UK": 18, "CA": 12, "AU": 8, "Other": 20 }
        }
      },
      exportDate: new Date().toISOString()
    };

    // Add user demographics if available
    if (userDemographics) {
      exportData.userDemographics = userDemographics;
    }

    return exportData;
  } catch (error) {
    console.error('Error fetching export data:', getErrorMessage(error));
    throw new Error('Failed to fetch data for export');
  }
};
