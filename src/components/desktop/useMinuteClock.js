import { useEffect, useState } from 'react';

// Re-renders at the start of each minute only, so the demand-rendered desk can sleep in between.
export default function useMinuteClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let interval;
    const timeout = setTimeout(() => {
      setNow(new Date());
      interval = setInterval(() => setNow(new Date()), 60000);
    }, 60000 - (Date.now() % 60000));
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []);
  return now;
}

export const formatClock = date => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
