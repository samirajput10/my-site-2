
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-center">
          <p>This is the Privacy Policy page. Add your website's privacy policy details here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
