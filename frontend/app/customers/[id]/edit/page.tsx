'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { customerAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import CustomerForm from '@/components/customer-form';

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone1: string;
  phone2: string;
  company: string;
  city: string;
  country: string;
  website: string;
  subscriptionDate: string;
  description: string;
}

export default function EditCustomerPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const { data } = await customerAPI.getOne(params.id as string);
        setCustomer(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load customer');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-red-600">{error || 'Customer not found'}</p>
              <div className="flex justify-center mt-4">
                <Link href="/customers">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Customers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
            <p className="text-slate-600 mt-1">ID: {customer.customerId}</p>
          </div>
          <Link href={`/customers/${customer.id}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        <CustomerForm mode="edit" initialData={customer} customerId={customer.id} />
      </div>
    </div>
  );
}
