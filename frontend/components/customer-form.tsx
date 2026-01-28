'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, XCircle } from 'lucide-react';

interface CustomerFormData {
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

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  customerId?: string;
  mode: 'create' | 'edit';
}

export default function CustomerForm({ initialData, customerId, mode }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    customerId: initialData?.customerId || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone1: initialData?.phone1 || '',
    phone2: initialData?.phone2 || '',
    company: initialData?.company || '',
    city: initialData?.city || '',
    country: initialData?.country || '',
    website: initialData?.website || '',
    subscriptionDate: initialData?.subscriptionDate
      ? new Date(initialData.subscriptionDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    description: initialData?.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        subscriptionDate: new Date(formData.subscriptionDate).toISOString(),
      };

      if (mode === 'create') {
        await customerAPI.create(submitData);
        router.push('/customers');
      } else {
        await customerAPI.update(customerId!, submitData);
        router.push(`/customers/${customerId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${mode} customer`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Customer ID</label>
              <Input
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required
                disabled={mode === 'edit'}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">First Name</label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Company</label>
              <Input
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subscription Date</label>
              <Input
                name="subscriptionDate"
                type="date"
                value={formData.subscriptionDate}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Phone 1</label>
              <Input
                name="phone1"
                value={formData.phone1}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone 2</label>
              <Input
                name="phone2"
                value={formData.phone2}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Website</label>
              <Input
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">City</label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <Input
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Create Customer' : 'Save Changes'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
