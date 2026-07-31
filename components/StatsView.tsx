"use client";

import Link from 'next/link';
import { TrainingCycle, WorkoutSession } from '../types';
import { parseWeight } from '../lib/exerciseValues';
import { Screen, ScreenHeader } from './ui/Screen';
import Card from './ui/Card';
import IconButton from './ui/IconButton';
import EmptyState from './ui/EmptyState';
import { EditIcon } from './ui/icons';

interface StatsViewProps {
  cycle: TrainingCycle;
  history: WorkoutSession[];
}

export default function StatsView({ cycle, history }: StatsViewProps) {
  // Aggregate data: Exercise Name -> list of { date: string, weight: number }
  const exerciseStats: Record<string, { date: string, weight: number, session: WorkoutSession }[]> = {};

  // Find all unique exercises registered in the cycle template
  const cycleExercises = new Set<string>();
  cycle.templates.forEach(t => t.exercises.forEach(e => cycleExercises.add(e)));

  // If we also want to display exercises mapped historically that are no longer in template
  history.forEach(session => {
    session.data.forEach(ex => {
       if (parseWeight(ex.weight) !== null) {
         cycleExercises.add(ex.name);
       }
    });
  });

  cycleExercises.forEach(name => {
    exerciseStats[name] = [];
  });

  // Sort history ascending to have correct temporal chart
  const sortedHistory = [...history].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedHistory.forEach(session => {
    session.data.forEach(ex => {
      const weight = parseWeight(ex.weight);
      if (weight !== null && exerciseStats[ex.name]) {
        exerciseStats[ex.name].push({ date: session.date, weight, session });
      }
    });
  });

  // Remove exercises with no data
  Object.keys(exerciseStats).forEach(name => {
    if (exerciseStats[name].length === 0) delete exerciseStats[name];
  });

  return (
    <Screen>
      <ScreenHeader
        left={
          <Link href={`/cycles/${cycle.id}`} className="text-card-muted-fg font-bold hover:text-page-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">
            ← Back
          </Link>
        }
        title="Statistics"
        subtitle={cycle.name}
      />

      {Object.keys(exerciseStats).length === 0 ? (
        <EmptyState>No results recorded for statistics yet.</EmptyState>
      ) : (
        <div className="space-y-6">
          {Object.entries(exerciseStats).map(([name, dataList]) => {
            const weights = dataList.map(d => d.weight);
            const maxW = Math.max(...weights);
            const minW = Math.max(0, Math.min(...weights) - 10); // buffer for bottom
            return (
              <Card key={name}>
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold leading-tight">{name}</h3>
                   <span className="text-[10px] uppercase font-black tracking-wider text-success-muted-fg bg-success-muted-bg px-3 py-1 rounded-full">
                     Max {maxW} kg
                   </span>
                </div>

                {/* Chart view */}
                <div className="relative h-32 w-full mb-4 pb-2">
                   <div className="absolute bottom-2 w-full border-b-2 border-card-border"></div>
                   <svg className="absolute inset-0 w-full h-full overflow-visible">
                      {/* Lines */}
                      {dataList.map((d, i) => {
                        if (i === dataList.length - 1) return null;
                        const N = dataList.length;
                        const getX = (idx: number) => N === 1 ? 50 : 5 + (idx / (N-1)) * 90;
                        const getY = (val: number) => {
                           const p = maxW === minW ? 50 : ((val - minW) / (maxW - minW)) * 100;
                           return 100 - (15 + p * 0.7);
                        };

                        return (
                           <line
                             key={`line-${i}`}
                             x1={`${getX(i)}%`} y1={`${getY(d.weight)}%`}
                             x2={`${getX(i+1)}%`} y2={`${getY(dataList[i+1].weight)}%`}
                             className="stroke-card-fg opacity-30"
                             strokeWidth="3"
                             strokeLinecap="round"
                           />
                        );
                      })}
                      {/* Points */}
                      {dataList.map((d, i) => {
                        const N = dataList.length;
                        const x = N === 1 ? 50 : 5 + (i / (N-1)) * 90;
                        const p = maxW === minW ? 50 : ((d.weight - minW) / (maxW - minW)) * 100;
                        const y = 100 - (15 + p * 0.7);

                        return (
                           <circle
                             key={`pt-${i}`}
                             cx={`${x}%`} cy={`${y}%`}
                             r="5"
                             className="fill-card-bg stroke-card-fg transition-all duration-300 pointer-events-none"
                             strokeWidth="3"
                           />
                        );
                     })}
                   </svg>

                   {/* Tooltips */}
                   {dataList.map((d, i) => {
                      const N = dataList.length;
                      const x = N === 1 ? 50 : 5 + (i / (N-1)) * 90;
                      const p = maxW === minW ? 50 : ((d.weight - minW) / (maxW - minW)) * 100;
                      const y = 100 - (15 + p * 0.7);
                      return (
                         <div
                           key={`tooltip-${i}`}
                           className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                           style={{ left: `${x}%`, top: `${y}%` }}
                         >
                           <div className="absolute -top-7 left-1/2 -translate-x-1/2 surface-card-inverted text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                             {d.weight} kg
                           </div>
                           {/* Hover effect for the point */}
                           <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-card-fg transition-all scale-50 group-hover:scale-100 opacity-20 pointer-events-none"></div>
                         </div>
                      );
                   })}
                </div>

                {/* Table view */}
                <div className="space-y-1.5 mt-6">
                   {dataList.slice().reverse().slice(0, 3).map((d, i) => (
                     <div key={i} className="flex justify-between items-center surface-muted px-4 py-2.5 rounded-xl text-sm">
                       <span className="text-muted-muted-fg font-medium text-xs">{d.date}</span>
                       <span className="font-black">{d.weight} kg</span>
                       <IconButton href={`/workouts/${d.session.id}`} label="Edit workout" icon={<EditIcon />} />
                     </div>
                   ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
