type Props = {
    title: string;
    owner: string;
};

export default function Show({ title, owner }: Props) {
    return (
        <h1>
            {title} by {owner}
        </h1>
    );
}
