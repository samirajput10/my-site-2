
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <Truck className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Shipping & Returns</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-center">
          <p>This is the Shipping & Returns page. Add your shipping policy and return instructions here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
