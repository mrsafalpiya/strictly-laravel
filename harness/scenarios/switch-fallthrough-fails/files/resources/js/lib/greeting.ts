export function greeting(hour: number): string {
    let text = '';

    switch (hour) {
        case 0:
            text = 'Midnight';
        case 12:
            text = 'Noon';
            break;
    }

    return text;
}
