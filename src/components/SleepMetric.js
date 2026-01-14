import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './SleepMetric.css';

const SleepMetric = ({ type }) => {
  const [sleepData, setSleepData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayValue, setTodayValue] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const [averageValue, setAverageValue] = useState(0);

  const title = type === 'asleep' ? 'Hours Asleep' : 'Time Awake';
  const isAsleep = type === 'asleep';

  // Format value as hours and minutes (e.g., "8h 15m" or "52m")
  const formatValue = (value) => {
    const totalMinutes = Math.round(value * 60);

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    } else {
      return `${totalMinutes}m`;
    }
  };

  useEffect(() => {
    fetchSleepData();
  }, [type]);

  const fetchSleepData = async () => {
    try {
      setLoading(true);

      // Fetch all sleep logs to calculate overall average
      const { data: allData, error: allError } = await supabase
        .from('sleep_logs')
        .select('date, total_minutes, awake_minutes')
        .order('date', { ascending: false });

      console.log('All data from Supabase:', allData);
      console.log('Supabase error:', allError);

      if (allError) {
        console.error('Supabase query error:', allError);
        throw allError;
      }


      // Process data for last 7 days using the allData we already fetched
      const last7Days = [];
      const now = new Date();

      // Helper function to get local date string in YYYY-MM-DD format
      const getLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      for (let i = 3; i >= 0; i--) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() - i);
        const dateStr = getLocalDateString(targetDate);

        console.log(`Looking for date: ${dateStr}`);
        const entry = allData?.find(d => d.date === dateStr);
        console.log(`Found entry:`, entry);

        if (entry) {
          const value = isAsleep
            ? (entry.total_minutes - entry.awake_minutes) / 60
            : entry.awake_minutes / 60;
          last7Days.push({ date: dateStr, value, raw: entry });
        } else {
          last7Days.push({ date: dateStr, value: 0, raw: null });
        }
      }

      console.log('Processed last 4 days:', last7Days);
      setSleepData(last7Days);

      // Calculate average for last 4 days
      const validDays = last7Days.filter(d => d.value > 0);
      if (validDays.length > 0) {
        const total = validDays.reduce((sum, d) => sum + d.value, 0);
        const avg = total / validDays.length;
        console.log(`Average for ${type}:`, avg, 'from', validDays.length, 'valid days');
        console.log('Valid day values:', validDays.map(d => d.value));
        setAverageValue(avg);
      }

      // Set today's value (last item in the array)
      if (last7Days.length > 0) {
        const todayData = last7Days[last7Days.length - 1].value;
        const yesterdayData = last7Days.length > 1 ? last7Days[last7Days.length - 2].value : todayData;

        console.log('Today value:', todayData);
        console.log('Yesterday value:', yesterdayData);

        setTodayValue(todayData);

        if (yesterdayData > 0) {
          const change = ((todayData - yesterdayData) / yesterdayData) * 100;
          setPercentageChange(change);
        } else if (todayData > 0) {
          setPercentageChange(100); // 100% increase from 0
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getCurrentDate = () => {
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[today.getMonth()]} ${today.getDate()}`;
  };

  const maxValue = Math.max(...sleepData.map(d => d.value), averageValue);

  if (loading) {
    return (
      <div className="metric-card">
        <div className="metric-header-row">
          <h3>{title}</h3>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>Loading sleep data...</div>
      </div>
    );
  }

  // Show message only if there's absolutely no data at all
  if (sleepData.length === 0) {
    return (
      <div className="metric-card">
        <div className="metric-header-row">
          <h3>{title}</h3>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999', fontSize: '15px' }}>
          <div>No sleep data found</div>
          <div style={{ fontSize: '13px', marginTop: '8px', color: '#bbb' }}>
            Check browser console for errors
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="metric-card">
      <div className="metric-header-row">
        <h3>{title}</h3>
      </div>

      <div className="value-display">
        <span className="main-value">
          {todayValue === 0 ? '--' : formatValue(todayValue)}
        </span>
        {percentageChange !== 0 && todayValue !== 0 && (
          <span className={`percentage-change ${
            isAsleep
              ? (percentageChange >= 0 ? 'positive' : 'negative')
              : (percentageChange >= 0 ? 'negative' : 'positive')
          }`}>
            {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
          </span>
        )}
      </div>

      <div className="chart-container">
        <div className="bars-container">
          {sleepData.map((day, index) => {
            const heightPercent = maxValue > 0 ? (day.value / maxValue) * 100 : 0;
            const isToday = index === sleepData.length - 1;

            return (
              <div key={day.date} className="bar-column">
                <div className="bar-wrapper">
                  <div
                    className={`bar ${isToday ? 'bar-active' : ''}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`day-label ${isToday ? 'day-active' : ''}`}>
                  {formatDate(day.date)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Average line */}
        <div
          className="average-line"
          style={{
            bottom: `${maxValue > 0 ? ((averageValue / maxValue) * 90) : 0}px`
          }}
        />
      </div>
    </div>
  );
};

export default SleepMetric;
