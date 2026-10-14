export default function Index({ projects }: { projects: string[] }) {
    return (
        <ul>
            {projects.map((project) => (
                <li key={project}>{project}</li>
            ))}
        </ul>
    );
}
