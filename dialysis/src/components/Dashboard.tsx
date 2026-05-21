import { 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { PDDRegistration } from '../types';
import { motion } from 'motion/react';

interface DashboardProps {
  registrations: PDDRegistration[];
}

export default function Dashboard({ registrations }: DashboardProps) {
  const latestReg = registrations[0];
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Hello, Juan Dela Cruz</h1>
          <p className="text-slate-500 mt-2">Manage your PhilHealth Dialysis Database registration here.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-400">Current Date</p>
          <p className="text-lg font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Main Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative group">
             <div className="relative z-10">
               <h3 className="text-xl font-bold text-slate-800 mb-6 font-sans">Latest Application Status</h3>
               
               {latestReg ? (
                 <div className="flex items-center gap-8">
                   <div className="w-24 h-24 rounded-2xl bg-emerald-50 flex flex-col items-center justify-center border-2 border-emerald-100 group-hover:scale-105 transition-transform">
                     <span className="text-2xl font-bold text-emerald-700">2026</span>
                     <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Year</span>
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-2">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                         latestReg.recordStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                         latestReg.recordStatus === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                       }`}>
                         {latestReg.recordStatus}
                       </span>
                       <span className="text-xs text-slate-400 font-medium">Applied on {new Date(latestReg.createdAt).toLocaleDateString()}</span>
                     </div>
                     <p className="text-lg font-bold text-slate-800">PhilHealth Dialysis Registry Path</p>
                     <p className="text-sm text-slate-500 mt-1 italic font-serif">"Your application is currently being reviewed by the Medical Evaluation Team."</p>
                   </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium font-sans">You haven't submitted any registrations yet.</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-xs">Start your PhilHealth Dialysis Database registration by clicking 'Apply Now'.</p>
                 </div>
               )}
             </div>
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
               <Activity className="w-32 h-32" />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <h4 className="font-bold text-emerald-800 mb-2 font-sans flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Benefit Status
                </h4>
                <p className="text-sm text-emerald-700/80 leading-relaxed font-sans">
                  You are currently covered under the <span className="font-bold">Z Benefit Package</span> for dialysis treatment.
                </p>
             </div>
             <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2 font-sans flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Health Records
                </h4>
                <p className="text-sm text-blue-700/80 leading-relaxed font-sans">
                  Your last medical clearance was verified on <span className="font-bold">May 10, 2026</span>.
                </p>
             </div>
          </div>
        </div>

        {/* Sidebar Help */}
        <div className="space-y-6">
          <div className="bg-emerald-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10 font-sans">
               <h3 className="text-lg font-bold text-yellow-400 mb-4 tracking-tight">Need Assistance?</h3>
               <p className="text-sm text-emerald-100 mb-6 leading-relaxed">Contact your hospital coordinator or visit the nearest PhilHealth office for live support.</p>
               <button className="w-full py-3 bg-yellow-400 text-emerald-900 font-bold rounded-xl text-sm hover:bg-white transition-colors">
                 Contact Coordinator
               </button>
             </div>
             {/* Decor */}
             <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 font-sans">
             <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Quick Actions</h4>
             <div className="space-y-2">
                <button className="w-full p-3 flex items-center justify-between rounded-xl hover:bg-slate-50 transition-colors group">
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-emerald-600">Download Case Rate Guide</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                </button>
                <button className="w-full p-3 flex items-center justify-between rounded-xl hover:bg-slate-50 transition-colors group">
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-emerald-600">Update Profile Info</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
