'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { customerAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Pencil } from 'lucide-react';
import Link from 'next/link';

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
  createdAt: string;
  updatedAt: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
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
            <h1 className="text-3xl font-bold tracking-tight">Customer Details</h1>
            <p className="text-slate-600 mt-1">ID: {customer.customerId}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/customers/${customer.id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-600">First Name</label>
                <p className="text-base font-medium mt-1">{customer.firstName}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Last Name</label>
                <p className="text-base font-medium mt-1">{customer.lastName}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <p className="text-base font-medium mt-1">{customer.email}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Company</label>
                <p className="text-base font-medium mt-1">{customer.company || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-600">Phone 1</label>
                <p className="text-base font-medium mt-1">{customer.phone1}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Phone 2</label>
                <p className="text-base font-medium mt-1">{customer.phone2 || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Website</label>
                <p className="text-base font-medium mt-1">{customer.website || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Subscription Date</label>
                <p className="text-base font-medium mt-1">
                  {new Date(customer.subscriptionDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-600">City</label>
                <p className="text-base font-medium mt-1">{customer.city}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Country</label>
                <p className="text-base font-medium mt-1">{customer.country}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {customer.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base">{customer.description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-600">Created At</label>
                <p className="text-base font-medium mt-1">
                  {new Date(customer.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Updated At</label>
                <p className="text-base font-medium mt-1">
                  {new Date(customer.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
