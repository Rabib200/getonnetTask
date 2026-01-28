'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CustomerForm from '@/components/customer-form';

export default function NewCustomerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Customer</h1>
            <p className="text-slate-600 mt-1">Add a new customer to the database</p>
          </div>
          <Link href="/customers">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        <CustomerForm mode="create" />
      </div>
    </div>
  );
}
