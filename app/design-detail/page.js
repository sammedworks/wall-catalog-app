'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DesignDetailPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/designs');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Redirecting...</p>
      </div>
    </div>
  );
}
