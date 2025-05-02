
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthHistoryFormContent } from './HealthHistoryFormContent';

export const HealthHistoryForm = () => {
  return (
    <Card className="w-full shadow-md mt-6">
      <CardHeader>
        <CardTitle className="text-2xl">Health History</CardTitle>
      </CardHeader>
      <CardContent>
        <HealthHistoryFormContent />
      </CardContent>
    </Card>
  );
};
