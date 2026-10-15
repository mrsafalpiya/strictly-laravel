import { daysBetween, formatDateOnly } from '@/components/cycles/dates';
import type { CycleData, CycleStatsData } from '@/generated';

const WIDTH = 600;
const HEIGHT = 200;
const PAD = 24;

/**
 * Remaining issues per day (solid) against an ideal straight line to zero at the end of the
 * cycle (dashed). The x axis spans the whole cycle; the series stops at today.
 */
export function BurndownChart({
    cycle,
    stats,
}: {
    cycle: CycleData;
    stats: CycleStatsData;
}) {
    const lastDay = Math.max(daysBetween(cycle.startsOn, cycle.endsOn), 1);
    const top = Math.max(stats.scope, 1);
    const x = (day: number) => PAD + (day / lastDay) * (WIDTH - 2 * PAD);
    const y = (remaining: number) =>
        HEIGHT - PAD - (remaining / top) * (HEIGHT - 2 * PAD);

    const actual = stats.burndown
        .map(
            (point) =>
                `${x(daysBetween(cycle.startsOn, point.date))},${y(point.remaining)}`,
        )
        .join(' ');
    const latest = stats.burndown.at(-1);

    return (
        <figure className="flex flex-col gap-1">
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="h-auto w-full text-muted-foreground"
                role="img"
                aria-label={`Burndown: ${latest?.remaining ?? stats.scope} of ${stats.scope} issues remaining`}
            >
                <line
                    x1={PAD}
                    y1={HEIGHT - PAD}
                    x2={WIDTH - PAD}
                    y2={HEIGHT - PAD}
                    stroke="currentColor"
                    strokeOpacity={0.3}
                />
                <line
                    x1={PAD}
                    y1={PAD}
                    x2={PAD}
                    y2={HEIGHT - PAD}
                    stroke="currentColor"
                    strokeOpacity={0.3}
                />
                <line
                    x1={x(0)}
                    y1={y(stats.scope)}
                    x2={x(lastDay)}
                    y2={y(0)}
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                />
                {stats.burndown.length > 0 && (
                    <polyline
                        points={actual}
                        fill="none"
                        className="stroke-emerald-500"
                        strokeWidth={2}
                        strokeLinejoin="round"
                    />
                )}
                {stats.burndown.map((point) => (
                    <circle
                        key={point.date}
                        cx={x(daysBetween(cycle.startsOn, point.date))}
                        cy={y(point.remaining)}
                        r={2.5}
                        className="fill-emerald-500"
                    >
                        <title>
                            {formatDateOnly(point.date)}: {point.remaining}{' '}
                            remaining
                        </title>
                    </circle>
                ))}
                <text x={PAD} y={HEIGHT - 6} fontSize={10} fill="currentColor">
                    {formatDateOnly(cycle.startsOn)}
                </text>
                <text
                    x={WIDTH - PAD}
                    y={HEIGHT - 6}
                    fontSize={10}
                    fill="currentColor"
                    textAnchor="end"
                >
                    {formatDateOnly(cycle.endsOn)}
                </text>
                <text x={4} y={PAD} fontSize={10} fill="currentColor">
                    {stats.scope}
                </text>
            </svg>
            {stats.burndown.length === 0 && (
                <figcaption className="text-xs text-muted-foreground">
                    The cycle has not started yet.
                </figcaption>
            )}
        </figure>
    );
}
