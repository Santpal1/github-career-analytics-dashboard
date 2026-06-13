import React from 'react';

function Heatmap({ data = [] }) {
  if (!data || data.length === 0) {
    return <div className="text-slate-400 text-sm">No activity calendar available.</div>;
  }

  // Group days by weeks (7 days per week)
  const weeks = [];
  let currentWeek = [];
  
  // Fill in empty days at start to align weekdays correctly
  const firstDate = new Date(data[0].date);
  const startDay = firstDate.getDay(); // 0 is Sunday, 6 is Saturday
  
  for (let i = 0; i < startDay; i++) {
    currentWeek.push({ isPlaceholder: true });
  }

  data.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ isPlaceholder: true });
    }
    weeks.push(currentWeek);
  }

  // Month labels helper
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabels = [];
  let prevMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const activeDay = week.find(d => !d.isPlaceholder);
    if (activeDay) {
      const d = new Date(activeDay.date);
      const m = d.getMonth();
      if (m !== prevMonth) {
        monthLabels.push({ label: months[m], index: weekIndex });
        prevMonth = m;
      }
    }
  });

  // Level color selector
  const getCellColor = (level) => {
    switch (level) {
      case 1: return 'bg-brand-purple/20 border border-brand-purple/10';
      case 2: return 'bg-brand-purple/50 border border-brand-purple/20';
      case 3: return 'bg-brand-purple/80 border border-brand-purple/30';
      case 4: return 'bg-brand-purple shadow-sm shadow-brand-purple/60 border border-brand-purple/40';
      default: return 'bg-dark-800/80 border border-transparent';
    }
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-2">
      <div className="min-w-[700px] select-none">
        {/* Month labels row */}
        <div className="h-6 flex text-[10px] text-slate-500 relative ml-8">
          {monthLabels.map((ml, idx) => (
            <div 
              key={idx} 
              className="absolute"
              style={{ left: `${ml.index * 13}px` }}
            >
              {ml.label}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex">
          {/* Weekday indicator labels */}
          <div className="flex flex-col justify-around text-[9px] text-slate-500 w-8 h-[98px] pr-2 mt-1 select-none">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* Grid columns */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px]">
                {week.map((day, dIdx) => {
                  if (day.isPlaceholder) {
                    return (
                      <div 
                        key={dIdx} 
                        className="w-2.5 h-2.5 rounded-[2px] bg-transparent"
                      />
                    );
                  }
                  
                  return (
                    <div
                      key={dIdx}
                      className={`w-2.5 h-2.5 rounded-[2px] transition-all duration-150 hover:scale-125 ${getCellColor(day.level)}`}
                      title={`${day.count} contributions on ${day.date}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-end items-center gap-1.5 mt-3 text-[10px] text-slate-500 mr-2">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-dark-800/80" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-brand-purple/20" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-brand-purple/50" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-brand-purple/80" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-brand-purple" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;
