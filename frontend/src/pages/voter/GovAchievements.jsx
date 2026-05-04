import React from 'react';
import { Link } from 'react-router-dom';

export default function GovAchievements() {
  const achievements = [
    { 
      title: "Digital India 2.0", 
      desc: "Successfully onboarded 1.4 billion citizens to the Triple-Lock Voting System.", 
      impact: "100% Secure Voting", 
      icon: "🌐",
      color: "bg-blue-500"
    },
    { 
      title: "Renewable Energy Milestone", 
      desc: "Achieved 500GW of solar and wind energy capacity, exceeding 2030 targets early.", 
      impact: "Net Zero Path", 
      icon: "☀️",
      color: "bg-green-500"
    },
    { 
      title: "Healthcare Revolution", 
      desc: "Established 50,000 new AI-powered medical centers in rural constituencies.", 
      impact: "Healthcare for All", 
      icon: "🏥",
      color: "bg-red-500"
    },
    { 
      title: "Infrastructure Expansion", 
      desc: "Completed the National Smart Highway Grid connecting all major ports.", 
      impact: "30% Logistics Savings", 
      icon: "🛣️",
      color: "bg-orange-500"
    }
  ];

  const stats = [
    { label: "GDP Growth", value: "8.2%", trend: "+0.5%" },
    { label: "Literacy Rate", value: "92%", trend: "+4%" },
    { label: "Unemployment", value: "3.1%", trend: "-1.2%" },
    { label: "Digital Payments", value: "250B+", trend: "+45%" }
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Government Deeds</h1>
          <p className="text-slate-500 font-medium mt-1">National Progress Report & Administration Milestones</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Administration</span>
          <p className="font-bold text-slate-700">Vision 2026</p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900">{s.value}</span>
              <span className={`text-[10px] font-bold ${s.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Major Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {achievements.map((a, i) => (
          <div key={i} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 group hover:border-primary transition-colors relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${a.color} opacity-[0.03] rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150`}></div>
            <div className="flex items-start space-x-6">
              <div className={`w-16 h-16 ${a.color} text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-gray-100`}>
                {a.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 mb-2">{a.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{a.desc}</p>
                <div className="inline-block bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Impact: {a.impact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Section */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary opacity-10 rounded-full blur-3xl -mb-32 -mr-32"></div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-3xl font-black mb-4">Transparent Governance</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            This data is verified by independent audit commissions and recorded on the IVC Ledger for absolute transparency. As a citizen, you can request deep-dive audits for any of these milestones.
          </p>
          <button className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-sm hover:bg-slate-100 transition-colors shadow-xl">
            Request Detailed Audit
          </button>
        </div>
      </div>
    </div>
  );
}
