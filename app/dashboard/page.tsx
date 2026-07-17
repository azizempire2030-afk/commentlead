'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching leads:', error);
      else setLeads(data || []);
    };
    fetchLeads();
  }, []);

  return (
    <main className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">CommentLeads</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800 text-gray-200">
            <th className="p-2 text-left">Sender</th>
            <th className="p-2 text-left">Comment</th>
            <th className="p-2 text-left">Intent</th>
            <th className="p-2 text-left">Product</th>
            <th className="p-2 text-left">Reply</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-gray-700 bg-gray-900 text-gray-200">
              <td className="p-2">{lead.sender_name}</td>
              <td className="p-2">{lead.comment_text}</td>
              <td className="p-2">{lead.intent}</td>
              <td className="p-2">{lead.product_mentioned || '—'}</td>
              <td className="p-2 text-sm">{lead.generated_reply || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}