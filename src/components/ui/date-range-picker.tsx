import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateRangePickerProps {
  onUpdate: (values: { range: DateRange }) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onUpdate, className }) => {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  const handleSelect = (selectedRange: DateRange | undefined) => {
    if (selectedRange) {
      setRange(selectedRange);
      onUpdate({ range: selectedRange });
    }
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !range && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {
              range?.from ? (
                range.to ? (
                  <>
                    {format(range.from, "LLL dd, y")} - {format(range.to, "LLL dd, y")}
                  </>
                ) : (
                  format(range.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <DayPicker
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
