import React, { useState } from 'react';
import { MapPin, AlertTriangle, ShieldAlert, CheckCircle2, TrendingUp, Users, Building, Activity } from 'lucide-react';
import { AnalyticsData, Complaint, CampusZone } from '../types';

interface CampusHeatmapProps {
  analytics: AnalyticsData | null;
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
}

export const CampusHeatmap: React.FC<CampusHeatmapProps> = ({
  analytics,
  complaints,
  onSelectComplaint,
}) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  if (!analytics) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Loading Campus Grievance Geographic Telemetry...
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-500 border-red-300 text-white shadow-red-200';
      case 'HIGH':
        return 'bg-orange-500 border-orange-300 text-white shadow-orange-200';
      case 'MEDIUM':
        return 'bg-amber-500 border-amber-300 text-white shadow-amber-200';
      default:
        return 'bg-emerald-500 border-emerald-300 text-white shadow-emerald-200';
    }
  };

  const activeZoneData = selectedZone
    ? analytics.campusZones.find((z: CampusZone) => z.zone === selectedZone)
    : null;

  const filteredComplaints = selectedZone
    ? complaints.filter((c: Complaint) => {
        if (selectedZone.includes('Hostel')) return c.category === 'Hostel';
        if (selectedZone.includes('North Gate')) return c.category === 'Ragging';
        if (selectedZone.includes('Library')) return c.category === 'Academic';
        if (selectedZone.includes('Lab Annex')) return c.category === 'Infrastructure';
        if (selectedZone.includes('Mechanical')) return c.category === 'Safety';
        if (selectedZone.includes('EEE')) return c.category === 'Faculty Issue';
        return true;
      })
    : complaints;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-800/80 text-blue-200 border border-blue-700 mb-3">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Live Spatial Geospatial Grievance Matrix
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Grievance Heatmap & Risk Zones
          </h1>
          <p className="text-sm text-blue-200 mt-2 leading-relaxed">
            Correlates anonymous student endorsements across physical campus facilities. High endorsement density automatically triggers priority institutional inspection alerts.
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Zone Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Map Layout (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Campus Facility Layout Map</h2>
              <p className="text-xs text-slate-500">Click any zone pin to filter grievances</p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal
              </span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Watch
              </span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High
              </span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span> Critical
              </span>
            </div>
          </div>

          {/* Interactive Campus Blueprint Canvas */}
          <div className="relative bg-slate-950 rounded-2xl h-[380px] w-full border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Architectural Grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>

            {/* Campus Map Perimeter outline */}
            <div className="absolute inset-4 rounded-xl border border-dashed border-blue-900/60 pointer-events-none flex items-center justify-center">
              <span className="text-[10px] text-slate-700 tracking-widest uppercase font-mono">
                BVRIT HYDERABAD MAIN CAMPUS ZONE
              </span>
            </div>

            {/* Zone Pins */}
            {analytics.campusZones.map((zone: CampusZone) => {
              const isSelected = selectedZone === zone.zone;
              return (
                <div
                  key={zone.zone}
                  style={{ top: `${zone.coordinates.y}%`, left: `${zone.coordinates.x}%` }}
                  onClick={() => setSelectedZone(isSelected ? null : zone.zone)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 transition-transform hover:scale-110"
                >
                  <div
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-lg transition-all ${getRiskColor(
                      zone.riskLevel
                    )} ${isSelected ? 'ring-4 ring-white' : ''}`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <div className="text-left leading-tight">
                      <div className="text-xs font-bold whitespace-nowrap">{zone.zone}</div>
                      <div className="text-[9px] opacity-90 font-mono">
                        {zone.supporterTraction} Student Endorsements
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reset selection */}
          {selectedZone && (
            <div className="mt-3 flex items-center justify-between bg-blue-50 text-blue-900 px-4 py-2 rounded-xl text-xs">
              <span>
                Filtering by <strong>{selectedZone}</strong>
              </span>
              <button
                onClick={() => setSelectedZone(null)}
                className="font-bold text-blue-700 hover:text-blue-950"
              >
                Clear Filter (Show All)
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Zone Intelligence Card & Department Stats */}
        <div className="space-y-6">
          {/* Selected Zone Deep Dive */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Zone Threat Intelligence
            </h3>
            {activeZoneData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900">{activeZoneData.zone}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      activeZoneData.riskLevel === 'CRITICAL'
                        ? 'bg-red-100 text-red-800'
                        : activeZoneData.riskLevel === 'HIGH'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {activeZoneData.riskLevel} Risk
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Anonymous Supporters</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {activeZoneData.supporterTraction}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Open Grievances</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {activeZoneData.activeGrievances}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Institutional mandate: Immediate surveillance and preventive engineering maintenance recommended for this quadrant.
                </p>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                Select a campus building on the map to inspect live endorsement traction and reports.
              </div>
            )}
          </div>

          {/* Department Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Department Grievance Volume
            </h3>
            <div className="space-y-2">
              {Object.entries(analytics.departmentStats).map(([dept, count]) => {
                const countNum = Number(count);
                const percentage = Math.round((countNum / analytics.totalRecords) * 100);
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700 font-medium">
                      <span>{dept}</span>
                      <span className="font-mono text-slate-900">{countNum} reports ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filtered Grievance List Under Heatmap */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Active Grievances in Selected Quad ({filteredComplaints.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComplaints.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectComplaint(c)}
              className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer flex items-start justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  {c.anonymousId}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 line-clamp-1">{c.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{c.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-bold text-blue-600 font-mono block">
                  👍 {c.supportCount}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mt-1">
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
