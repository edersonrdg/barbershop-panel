import { CheckboxField } from '@/components/checkbox-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { checkedOf, valueOf, type FormValues } from '@/lib/forms';
import { weekFieldNames, type WeekHours } from '@/lib/week-hours';
import { WEEKDAY_LABELS, WEEKDAYS, type Weekday } from '@/lib/weekdays';

interface WeekHoursFieldsProps {
  initial: WeekHours;
  values?: FormValues;
  errors: Partial<Record<Weekday, string>>;
  openLabel: string;
  startLabel: string;
  endLabel: string;
}

const DEFAULT_START = '09:00';
const DEFAULT_END = '19:00';

// The time fields show only while their checkbox is checked, with CSS `:has`
// instead of state, so the form works the same without JavaScript.
export function WeekHoursFields({
  initial,
  values,
  errors,
  openLabel,
  startLabel,
  endLabel,
}: WeekHoursFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      {WEEKDAYS.map((day) => {
        const names = weekFieldNames(day);
        const dayInitial = initial[day];
        const errorId = `${day}-hours-error`;
        const timeProps = {
          'aria-invalid': Boolean(errors[day]),
          'aria-describedby': errorId,
          className: 'h-11 text-base',
        };

        return (
          <fieldset
            key={day}
            className="group/day flex flex-col gap-2 rounded-xl border p-3"
          >
            <legend className="px-1 text-sm font-medium">
              {WEEKDAY_LABELS[day]}
            </legend>
            <CheckboxField
              name={names.open}
              label={openLabel}
              data-role="open"
              defaultChecked={checkedOf(
                values,
                names.open,
                dayInitial !== null,
              )}
            />

            <div className="hidden flex-col gap-3 group-has-[[data-role=open]:checked]/day:flex">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor={names.start}>{startLabel}</Label>
                  <Input
                    id={names.start}
                    name={names.start}
                    type="time"
                    defaultValue={
                      valueOf(values, names.start) ??
                      dayInitial?.start ??
                      DEFAULT_START
                    }
                    {...timeProps}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={names.end}>{endLabel}</Label>
                  <Input
                    id={names.end}
                    name={names.end}
                    type="time"
                    defaultValue={
                      valueOf(values, names.end) ??
                      dayInitial?.end ??
                      DEFAULT_END
                    }
                    {...timeProps}
                  />
                </div>
              </div>

              <div className="group/break flex flex-col gap-2">
                <CheckboxField
                  name={names.hasBreak}
                  label="Tem intervalo"
                  data-role="break"
                  defaultChecked={checkedOf(
                    values,
                    names.hasBreak,
                    Boolean(dayInitial?.break),
                  )}
                />
                <div className="hidden grid-cols-2 gap-3 group-has-[[data-role=break]:checked]/break:grid">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={names.breakStart}>
                      Início do intervalo
                    </Label>
                    <Input
                      id={names.breakStart}
                      name={names.breakStart}
                      type="time"
                      defaultValue={
                        valueOf(values, names.breakStart) ??
                        dayInitial?.break?.start ??
                        '12:00'
                      }
                      {...timeProps}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={names.breakEnd}>Fim do intervalo</Label>
                    <Input
                      id={names.breakEnd}
                      name={names.breakEnd}
                      type="time"
                      defaultValue={
                        valueOf(values, names.breakEnd) ??
                        dayInitial?.break?.end ??
                        '13:00'
                      }
                      {...timeProps}
                    />
                  </div>
                </div>
              </div>
            </div>

            <p id={errorId} className="text-sm text-destructive empty:hidden">
              {errors[day]}
            </p>
          </fieldset>
        );
      })}
    </div>
  );
}
