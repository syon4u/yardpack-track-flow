
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { EnvironmentService } from '@/services/environmentService';

const ProductionSetupGuide: React.FC = () => {
  const envConfig = EnvironmentService.getEnvironmentConfig();
  const currentEnv = EnvironmentService.getEnvironmentName();

  const setupSteps = [
    {
      title: 'Environment Detection',
      status: 'complete',
      description: `Currently running in ${currentEnv} mode`,
      details: `App URL: ${envConfig.appUrl}`
    },
    {
      title: 'Supabase Site URL Configuration',
      status: envConfig.isProduction ? 'action-required' : 'optional',
      description: 'Configure Site URL and Redirect URLs in Supabase Dashboard',
      details: 'Required for production authentication to work properly',
      actionUrl: 'https://supabase.com/dashboard/project/lkvelwwrztkmnvgeknpa/auth/url-configuration'
    },
    {
      title: 'Production Domain Setup',
      status: envConfig.isProduction ? 'action-required' : 'optional',
      description: 'Configure your custom domain for production',
      details: 'Set up DNS and SSL for your production domain'
    },
    {
      title: 'API Keys Configuration',
      status: 'action-required',
      description: 'Configure external API keys (USPS, etc.)',
      details: 'Set up API keys in Supabase Edge Functions secrets'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Complete</Badge>;
      case 'action-required':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Action Required</Badge>;
      case 'optional':
        return <Badge variant="secondary">Optional</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Production Setup Guide</h2>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Current environment: <strong>{currentEnv}</strong> - App URL: <strong>{envConfig.appUrl}</strong>
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid gap-4">
        {setupSteps.map((step, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{step.title}</CardTitle>
                {getStatusBadge(step.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{step.description}</p>
              <p className="text-xs text-gray-500 mb-3">{step.details}</p>
              {step.actionUrl && (
                <a
                  href={step.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  Open in Supabase Dashboard <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Required Supabase Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Site URL</h4>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{envConfig.appUrl}</code>
          </div>
          <div>
            <h4 className="font-medium mb-2">Redirect URLs (add all that apply)</h4>
            <div className="space-y-1">
              <div><code className="text-sm bg-gray-100 px-2 py-1 rounded">{envConfig.appUrl}</code></div>
              <div><code className="text-sm bg-gray-100 px-2 py-1 rounded">{envConfig.appUrl}/auth</code></div>
              <div><code className="text-sm bg-gray-100 px-2 py-1 rounded">{envConfig.appUrl}/dashboard</code></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionSetupGuide;
