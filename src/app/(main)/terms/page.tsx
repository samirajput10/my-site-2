
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-center">
          <p>This is the Terms of Service page. Add your website's terms and conditions here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
