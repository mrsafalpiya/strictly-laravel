import { useRouteHttp } from '@mrsafalpiya/strictly-laravel/react';
import { index, store } from '@/actions/App/Http/Controllers/MeetingController';

// A datetime is sent as JavaScript writes it: toISOString(), milliseconds and all.
export default function ScheduleMeeting() {
    const meeting = useRouteHttp(store(), {
        title: '',
        startsAt: new Date().toISOString(),
        reminders: [],
    });
    const upcoming = useRouteHttp(
        index({ query: { from: new Date().toISOString() } }),
    );

    const remindAt = (minutesBefore: number) => {
        const startsAt = new Date(meeting.data.startsAt);
        startsAt.setMinutes(startsAt.getMinutes() - minutesBefore);
        meeting.setData('reminders', [
            ...meeting.data.reminders,
            startsAt.toISOString(),
        ]);
    };

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                void meeting.submit();
            }}
        >
            <input
                value={meeting.data.title}
                onChange={(event) =>
                    meeting.setData('title', event.target.value)
                }
            />
            <input
                type="datetime-local"
                onChange={(event) =>
                    meeting.setData(
                        'startsAt',
                        new Date(event.target.value).toISOString(),
                    )
                }
            />
            {meeting.errors.startsAt && <p>{meeting.errors.startsAt}</p>}
            <button type="button" onClick={() => remindAt(15)}>
                Remind me 15 minutes before
            </button>
            <button type="button" onClick={() => void upcoming.submit()}>
                Upcoming
            </button>
            <button disabled={meeting.processing}>Schedule</button>
        </form>
    );
}
