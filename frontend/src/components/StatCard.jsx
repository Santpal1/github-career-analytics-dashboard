import React from 'react';

function StatCard({ title, value, icon: Icon, description, trend, colorClass = 'brand-purple' }) {
  const colorMap = {
    'brand-purple': 'from-brand-purple/20 to-brand-purple/5 text-brand-purple border-brand-purple/20',
    'brand-pink': 'from-brand-pink/20 to-brand-pink/5 text-brand-pink border-brand-pink/20',
    'brand-blue': 'from-brand-blue/20 to-brand-blue/5 text-brand-blue border-brand-blue/20',
    'brand-cyan': 'from-brand-cyan/20 to-brand-cyan/5 text-brand-cyan border-brand-cyan/20',
    'brand-green': 'from-brand-green/20 to-brand-green/5 text-brand-green border-brand-green/20',
    'brand-gold': 'from-brand-gold/20 to-brand-gold/5 text-brand-gold border-brand-gold/20',
  };

  const bgGradient = colorMap[colorClass] || colorMap['brand-purple'];

  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
      <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br opacity-10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-300 ${bgGradient.split(' ')[0]}`} />
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br border ${bgGradient}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="mt-4">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {trend && (
          <span className="ml-2 text-xs font-semibold text-brand-green bg-brand-green/10 border border-brand-green/25 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export default StatCard;
