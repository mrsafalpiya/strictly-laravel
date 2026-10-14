type Props = {
    title: string;
    subtitle?: string;
};

export default function Show({ title, subtitle = 'No subtitle' }: Props) {
    return (
        <h1>
            {title}: {subtitle}
        </h1>
    );
}
