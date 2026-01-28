'use client';

import { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { customerAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: customers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 53,
    overscan: 10,
  });

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const { data } = await customerAPI.getAll(page, 50);

        if (Array.isArray(data)) {
          setCustomers((prev) => [...prev, ...data]);
          setHasMore(data.length === 50);
        } else if (data.customers) {
          setCustomers((prev) => [...prev, ...data.customers]);
          setHasMore(data.customers.length === 50);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [page]);

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage > 0.8 && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-slate-600 mt-1">
              {customers.length} customers loaded
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/customers/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Customer
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Import
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          {!loading && customers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">
                No customers found. Start an import to add customers.
              </p>
            </div>
          ) : (
            <>
              <div
                ref={parentRef}
                className="overflow-auto"
                style={{ height: '600px' }}
              >
                <table className="w-full">
                  <thead className="border-b bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 w-32">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 w-48">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 w-56">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 w-40">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 w-48">Company</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ height: `${virtualizer.getTotalSize()}px` }} />
                  </tbody>
                </table>

                <div
                  style={{
                    position: 'relative',
                    height: `${virtualizer.getTotalSize()}px`,
                    marginTop: `-${virtualizer.getTotalSize()}px`,
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualRow: any) => {
                    const customer = customers[virtualRow.index];
                    return (
                      <div
                        key={customer.id}
                        onClick={() => router.push(`/customers/${customer.id}`)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer border-b absolute top-0 left-0 w-full flex"
                        style={{
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div className="px-4 py-3 text-sm text-slate-600 w-32 flex-shrink-0">{customer.customerId}</div>
                        <div className="px-4 py-3 text-sm font-medium w-48 flex-shrink-0">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="px-4 py-3 text-sm text-slate-600 w-56 flex-shrink-0">{customer.email}</div>
                        <div className="px-4 py-3 text-sm text-slate-600 w-40 flex-shrink-0">{customer.phone1}</div>
                        <div className="px-4 py-3 text-sm text-slate-600 w-48 flex-shrink-0">{customer.company || '-'}</div>
                        <div className="px-4 py-3 text-sm text-slate-600 flex-1">
                          {customer.city}, {customer.country}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {loading && (
                <div className="flex justify-center py-4 border-t">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              )}

              {!hasMore && customers.length > 0 && (
                <p className="text-center text-slate-500 py-4 border-t text-sm">
                  All customers loaded
                </p>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
