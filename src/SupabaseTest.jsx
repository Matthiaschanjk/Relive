import React, { useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function SupabaseTest() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from('reviews')        // use an existing table in your Supabase project
        .select('*')
        .limit(1);

      if (error) {
        console.error('Supabase error:', error);
        alert(`Supabase error: ${error.message}`);
      } else {
        console.log('Supabase data:', data);
        alert('Supabase connection successful! Check console for data.');
      }
    }

    testConnection();
  }, []);

  return (
    <div>
      <h2>Supabase Connection Test</h2>
      <p>Check your browser console and alerts for status.</p>
    </div>
  );
}
