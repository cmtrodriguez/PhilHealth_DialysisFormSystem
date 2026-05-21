import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ShieldAlert, Award, ChevronUp, UserCheck } from 'lucide-react';

export type UserRole = 'patient' | 'admin_encoder' | 'doctor';

interface PersonaSwitcherProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export default function PersonaSwitcher({ currentRole, onChangeRole }: PersonaSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const personas = [
    {
      id: 'patient' as UserRole,
      name: 'Juan Dela Cruz',
      title: 'Patient',
      desc: 'Submit, review, & print own registrations',
      icon: User,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50',
      activeColor: 'bg-emerald-700 text-white shadow-emerald-200 shadow-md',
    },
    {
      id: 'admin_encoder' as UserRole,
      name: 'Maria Santos',
      title: 'HCI Encoder (Admin)',
      desc: 'Verify applications, log sessions, track 156 limit',
      icon: ShieldAlert,
      color: 'bg-yellow-50 text-emerald-950 border-yellow-100 hover:bg-yellow-100/50',
      activeColor: 'bg-yellow-400 text-emerald-950 shadow-yellow-100 shadow-md',
    },
    {
      id: 'doctor' as UserRole,
      name: 'Dr. Perez, MD',
      title: 'Attending Nephrologist',
      desc: 'Certify CKD5, manage clinical clearances',
      icon: Award,
      color: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/50',
      activeColor: 'bg-blue-600 text-white shadow-blue-200 shadow-md',
    },
  ];

  const currentPersona = personas.find((p) => p.id === currentRole) || personas[0];

  return (
    /* Changed to motion.div and added drag properties */
      <motion.div 
        drag="x" // Restricts movement to the horizontal axis only
        dragMomentum={false}
        dragConstraints={{ 
          left: 0, 
          right: window.innerWidth - 240 // Prevents the button from sliding off the right side
        }}
        className="fixed bottom-6 left-6 z-50 font-sans cursor-grab active:cursor-grabbing"
      >
      <div className="relative">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute bottom-full left-0 mb-3 w-[290px] bg-white/95 backdrop-blur-xl border border-slate-200/60 p-4 rounded-3xl shadow-2xl space-y-2.5 overflow-hidden"
            >
              <div className="px-1 py-0.5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Demo User Switcher
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Switch roles instantly to demonstrate all clinical & admin workflows:
                </p>
              </div>

              <div className="space-y-1.5">
                {personas.map((persona) => {
                  const isActive = currentRole === persona.id;
                  const Icon = persona.icon;

                  return (
                    <button
                      key={persona.id}
                      onClick={() => {
                        onChangeRole(persona.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 flex items-start gap-3 active:scale-[0.98] ${
                        isActive
                          ? persona.activeColor
                          : `${persona.color} border-slate-100`
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white border border-slate-100'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm leading-tight">
                            {persona.name}
                          </span>
                          {isActive && <UserCheck size={13} className="shrink-0" />}
                        </div>
                        <p
                          className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                            isActive ? 'text-white/80' : 'text-slate-400'
                          }`}
                        >
                          {persona.title}
                        </p>
                        <p
                          className={`text-[10px] leading-relaxed mt-1 font-medium ${
                            isActive ? 'text-white/70' : 'text-slate-500'
                          }`}
                        >
                          {persona.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 px-5 py-3.5 rounded-full border border-slate-200/50 shadow-lg text-slate-800 font-extrabold text-xs tracking-wider transition-all duration-300 ${
            isOpen
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-white/90 backdrop-blur-md hover:bg-white'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
            {currentPersona.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="text-left leading-tight pr-2">
            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
              Mode: {currentPersona.title}
            </p>
            <p className={`text-[11px] font-extrabold ${isOpen ? 'text-white' : 'text-slate-800'}`}>
              {currentPersona.name}
            </p>
          </div>
          <ChevronUp
            size={16}
            className={`text-slate-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </motion.button>
      </div>
    </motion.div>
  );
}