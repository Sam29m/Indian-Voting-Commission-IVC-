import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets');
        setTickets(res.data.tickets || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) return <div>Loading support tickets...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 border-b pb-4">Support Tickets</h1>
      <div className="grid gap-4">
        {tickets.map(ticket => (
          <div key={ticket._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{ticket.subject}</h3>
                <p className="text-sm text-gray-500">Submitted by: {ticket.user?.name || 'Unknown'}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {ticket.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        ))}
        {tickets.length === 0 && <div className="text-gray-500 text-center py-8">No open support tickets.</div>}
      </div>
    </div>
  );
}
