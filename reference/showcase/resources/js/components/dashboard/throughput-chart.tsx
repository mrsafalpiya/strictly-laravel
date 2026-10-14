import type { ThroughputWeekData } from '@/types';

const WIDTH = 560;
const HEIGHT = 180;
const AXIS = 20;
const series = [
    {
        key: 'created',
        label: 'Created',
        className: 'fill-[#2a78d6] dark:fill-[#3987e5]',
        swatch: 'bg-[#2a78d6] dark:bg-[#3987e5]',
    },
    {
        key: 'completed',
        label: 'Completed',
        className: 'fill-[#eb6834] dark:fill-[#d95926]',
        swatch: 'bg-[#eb6834] dark:bg-[#d95926]',
    },
] as const satisfies {
    key: keyof Omit<ThroughputWeekData, 'weekStart'>;
    label: string;
    className: string;
    swatch: string;
}[];

function formatWeek(weekStart: string): string {
    return new Date(`${weekStart}T00:00:00`).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
}

/** Grouped bars per week: issues created vs completed. */
export function ThroughputChart({ weeks }: { weeks: ThroughputWeekData[] }) {
    const max = Math.max(
        1,
        ...weeks.flatMap((week) => series.map(({ key }) => week[key])),
    );
    const group = WIDTH / Math.max(1, weeks.length);
    const bar = Math.min(18, (group - 12) / series.length);
    const plot = HEIGHT - AXIS;

    return (
        <figure className="flex flex-col gap-2">
            <div className="flex gap-4 text-xs text-muted-foreground">
                {series.map(({ key, label, swatch }) => (
                    <span key={key} className="flex items-center gap-1.5">
                        <span className={`size-2.5 rounded-sm ${swatch}`} />
                        {label}
                    </span>
                ))}
            </div>
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="h-auto w-full"
                role="img"
                aria-label="Issues created and completed per week"
            >
                <line
                    x1={0}
                    x2={WIDTH}
                    y1={plot}
                    y2={plot}
                    className="stroke-border"
                />
                {weeks.map((week, index) => {
                    const x0 =
                        index * group + (group - bar * series.length - 2) / 2;

                    return (
                        <g key={week.weekStart}>
                            {series.map(({ key, label, className }, s) => {
                                const height = (week[key] / max) * (plot - 8);

                                return (
                                    <rect
                                        key={key}
                                        x={x0 + s * (bar + 2)}
                                        y={plot - height}
                                        width={bar}
                                        height={height}
                                        rx={2}
                                        className={className}
                                    >
                                        <title>{`Week of ${formatWeek(week.weekStart)}: ${week[key]} ${label.toLowerCase()}`}</title>
                                    </rect>
                                );
                            })}
                            <text
                                x={index * group + group / 2}
                                y={HEIGHT - 4}
                                textAnchor="middle"
                                className="fill-muted-foreground text-[10px]"
                            >
                                {formatWeek(week.weekStart)}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <table className="sr-only">
                <caption>Issues per week</caption>
                <thead>
                    <tr>
                        <th>Week of</th>
                        {series.map(({ key, label }) => (
                            <th key={key}>{label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week) => (
                        <tr key={week.weekStart}>
                            <td>{week.weekStart}</td>
                            {series.map(({ key }) => (
                                <td key={key}>{week[key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
}
