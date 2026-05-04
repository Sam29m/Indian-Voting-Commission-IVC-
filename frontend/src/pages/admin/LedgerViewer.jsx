import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function LedgerViewer() {
  const [chainData, setChainData] = useState(null);

  useEffect(() => {
    const fetchChain = async () => {
      try {
        const res = await api.get('/audit/verify-chain');
        setChainData(res.data);
      } catch (err) { console.error(err); }
    };
    fetchChain();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Tamper-Evident Ledger Viewer</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        {chainData ? (
          <div>
            <div className={`p-4 rounded mb-6 text-center text-lg font-bold ${chainData.chainValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {chainData.message}
            </div>
            <p>Total Ledger Entries Checked: {chainData.totalEntries}</p>
            <p className="mt-4 text-sm text-gray-500">
              The ledger uses SHA-256 cryptographic hashing to chain audit logs and votes.
              Any unauthorized modification to database records will immediately invalidate the chain and be detected here.
            </p>
          </div>
        ) : (
          <p>Analyzing cryptographic ledger chain...</p>
        )}
      </div>
    </div>
  );
}
