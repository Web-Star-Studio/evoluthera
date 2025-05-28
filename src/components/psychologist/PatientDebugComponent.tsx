import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DebugInfo {
  success: boolean;
  error: string | null;
  dataCount: number;
  data: unknown;
  psychologistId: string | undefined;
}

const PatientDebugComponent = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useAuth();

  const testQuery = useCallback(async () => {
    setIsLoading(true);
    console.log('[DEBUG] Starting query test...');
    
    try {
      // Test the exact query
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          profiles (
            id,
            name,
            email,
            created_at,
            user_type
          )
        `)
        .eq('psychologist_id', profile?.id)
        .eq('status', 'active');

      console.log('[DEBUG] Query result:', { data, error });
      
      setDebugInfo({
        success: !error,
        error: error?.message || null,
        dataCount: data?.length || 0,
        data: data,
        psychologistId: profile?.id
      });
    } catch (err) {
      console.error('[DEBUG] Query error:', err);
      setDebugInfo({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        dataCount: 0,
        data: null,
        psychologistId: profile?.id
      });
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      testQuery();
    }
  }, [profile?.id, testQuery]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Patient Query Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testQuery} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test Query'}
        </Button>
        
        {debugInfo && (
          <div className="space-y-2">
            <div>
              <strong>Psychologist ID:</strong> {debugInfo.psychologistId || 'Not found'}
            </div>
            <div>
              <strong>Success:</strong> {debugInfo.success ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Data Count:</strong> {debugInfo.dataCount}
            </div>
            {debugInfo.error && (
              <div className="text-red-600">
                <strong>Error:</strong> {debugInfo.error}
              </div>
            )}
            <div>
              <strong>Raw Data:</strong>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(debugInfo.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientDebugComponent; 