
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-center">
          <p>This is the FAQ page. You can add common questions and answers here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
