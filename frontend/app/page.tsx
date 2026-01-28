'use client';

import { useState, useEffect } from 'react';
import { importAPI, customerAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatNumber, formatDuration } from '@/lib/utils';
import { Loader2, Upload, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

interface ProgressData {
  jobId: string;
  status: string;
  processedRows: number;
  totalRows: number;
  percentage: number;
  rate: string;
  elapsedTime: string;
  eta: string;
  error?: string;
}

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  country: string;
}

export default function HomePage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseTime = (timeStr: string) => {
    const seconds = parseInt(timeStr.replace('s', ''));
    return formatDuration(seconds);
  };

  const fetchRecentCustomers = async () => {
    try {
      const { data } = await customerAPI.getRecent(10);
      setRecentCustomers(data);
    } catch (err) {
      console.error('Failed to fetch recent customers:', err);
    }
  };

  const fetchProgress = async () => {
    try {
      const { data } = await importAPI.getProgress();
      setProgress(data);

      if (data.status === 'IN_PROGRESS') {
        fetchRecentCustomers();
        setTimeout(fetchProgress, 2000);
      }
    } catch (err: any) {
      if (err.response?.status !== 400) {
        console.error('Failed to fetch progress:', err);
      }
    }
  };

  const handleStartImport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await importAPI.triggerSync();
      fetchProgress();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start import');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const isImporting = progress?.status === 'IN_PROGRESS';
  const isCompleted = progress?.status === 'COMPLETED';
  const isFailed = progress?.status === 'FAILED';

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CSV Import System</h1>
            <p className="text-slate-600 mt-1">Import and manage large customer datasets</p>
          </div>
          <Link href="/customers">
            <Button variant="outline">View Customers</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import Status</CardTitle>
            <CardDescription>
              Trigger a new import or monitor current progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleStartImport}
              disabled={isLoading || isImporting}
              className="w-full"
              size="lg"
            >
              {isLoading || isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isImporting ? 'Import Running...' : 'Starting...'}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Start CSV Import
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {progress && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-slate-600">
                    {formatNumber(progress.processedRows)} / {formatNumber(progress.totalRows)}
                  </span>
                </div>

                <Progress value={progress.percentage} className="h-2" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Status:</span>
                    <span className="ml-2 font-medium">
                      {isImporting && <span className="text-blue-600">Importing...</span>}
                      {isCompleted && <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" />Completed</span>}
                      {isFailed && <span className="text-red-600 flex items-center gap-1"><XCircle className="h-4 w-4" />Failed</span>}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Rate:</span>
                    <span className="ml-2 font-medium">{progress.rate}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Elapsed:</span>
                    <span className="ml-2 font-medium">{parseTime(progress.elapsedTime)}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">ETA:</span>
                    <span className="ml-2 font-medium">{parseTime(progress.eta)}</span>
                  </div>
                </div>

                {progress.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{progress.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {recentCustomers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recently Imported Customers</CardTitle>
              <CardDescription>
                Last {recentCustomers.length} customers added to the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-600">{customer.customerId}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {customer.firstName} {customer.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{customer.email}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {customer.city}, {customer.country}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
