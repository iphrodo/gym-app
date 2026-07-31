"use client";

import { useGymData } from '../../../lib/data/GymDataProvider';
import CalendarView from '../../../components/CalendarView';

export default function CalendarClient() {
  const { history } = useGymData();
  return <CalendarView history={history} />;
}
