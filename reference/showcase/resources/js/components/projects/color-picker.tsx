import { colors, colorValues } from '@/lib/domain';
import type { FieldName } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { Color } from '@/types';

/**
 * A row of colour swatches backed by native radio inputs, so it works both controlled
 * (`value` + `onChange`, for useForm) and uncontrolled (`name={field('color')}` + `defaultValue`, in <TypedForm>).
 */
export function ColorPicker({
    name,
    value,
    defaultValue,
    onChange,
    label = 'Colour',
    size = 'md',
}: {
    name?: FieldName;
    value?: Color;
    defaultValue?: Color;
    onChange?: (color: Color) => void;
    label?: string;
    size?: 'sm' | 'md';
}) {
    return (
        <div
            role="radiogroup"
            aria-label={label}
            className="flex flex-wrap items-center gap-1.5"
        >
            {colorValues.map((color) => (
                <label key={color} className="cursor-pointer" title={color}>
                    <input
                        type="radio"
                        name={name}
                        value={color}
                        className="peer sr-only"
                        aria-label={color}
                        {...(value === undefined
                            ? { defaultChecked: defaultValue === color }
                            : {
                                  checked: value === color,
                                  onChange: () => onChange?.(color),
                              })}
                    />
                    <span
                        className={cn(
                            'block rounded-full ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                            size === 'sm' ? 'size-4' : 'size-6',
                            colors[color],
                        )}
                    />
                </label>
            ))}
        </div>
    );
}
