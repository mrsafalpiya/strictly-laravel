import { Field } from '@/components/field';
import { ColorPicker } from '@/components/projects/color-picker';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { UpdateProjectData, UserSummaryData } from '@/generated';
import { t } from '@/generated/translations';

const NONE = '__none';

/**
 * The fields create and edit have in common (everything but the key). Typed by UpdateProjectData,
 * which StoreProjectData is a superset of, so both forms can pass `form.data` / `form.setData`.
 */
export function ProjectFields({
    data,
    errors,
    setData,
    members,
}: {
    data: UpdateProjectData;
    errors: Partial<Record<keyof UpdateProjectData, string>>;
    /**
     * The object form of useRouteForm's setData. A generic `(key: K, value: T[K])` callback can't be
     * forwarded to setData: TS can't prove `T[K]` assignable to `FormDataValues<TForm, K>`.
     */
    setData: (changes: Partial<UpdateProjectData>) => void;
    members: UserSummaryData[];
}) {
    return (
        <>
            <Field
                label={t('projects.fields.name')}
                htmlFor="name"
                error={errors.name}
            >
                <Input
                    id="name"
                    value={data.name}
                    maxLength={100}
                    onChange={(event) => setData({ name: event.target.value })}
                />
            </Field>

            <Field
                label={t('projects.fields.description')}
                htmlFor="description"
                error={errors.description}
            >
                <Textarea
                    id="description"
                    rows={4}
                    value={data.description ?? ''}
                    onChange={(event) =>
                        setData({
                            description:
                                event.target.value === ''
                                    ? null
                                    : event.target.value,
                        })
                    }
                />
            </Field>

            <Field label={t('projects.fields.color')} error={errors.color}>
                <ColorPicker
                    value={data.color}
                    onChange={(color) => setData({ color })}
                />
            </Field>

            <Field label={t('projects.fields.lead')} error={errors.leadId}>
                <Select
                    value={data.leadId === null ? NONE : String(data.leadId)}
                    onValueChange={(value) =>
                        setData({
                            leadId: value === NONE ? null : Number(value),
                        })
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={NONE}>
                            {t('projects.fields.no_lead')}
                        </SelectItem>
                        {members.map((member) => (
                            <SelectItem
                                key={member.id}
                                value={String(member.id)}
                            >
                                {member.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
        </>
    );
}
