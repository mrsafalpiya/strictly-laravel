import type { PageProps } from '@/generated';

type Props = Pick<PageProps<'auth/login'>, 'status'>;

export default function LoginStatus({ status }: Props) {
    if (status === null) {
        return null;
    }

    return (
        <div className="text-center text-sm font-medium text-green-600">
            {status}
        </div>
    );
}
