import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [hour, minute, period] = value.split(/:| /);

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minute} ${period}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour}:${newMinute} ${period}`);
  };

  const handlePeriodChange = (newPeriod: string) => {
    onChange(`${hour}:${minute} ${newPeriod}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={handleHourChange} value={hour}>
        <SelectTrigger>
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
            <SelectItem key={h} value={h.toString().padStart(2, '0')}>{h.toString().padStart(2, '0')}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span>:</span>
      <Select onValueChange={handleMinuteChange} value={minute}>
        <SelectTrigger>
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 60 }, (_, i) => i).map(m => (
            <SelectItem key={m} value={m.toString().padStart(2, '0')}>{m.toString().padStart(2, '0')}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={handlePeriodChange} value={period}>
        <SelectTrigger>
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimePicker;
