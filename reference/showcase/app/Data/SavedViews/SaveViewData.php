<?php

namespace App\Data\SavedViews;

use App\Data\Issues\IssueFiltersData;
use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Support\Data\InputData;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;

final class SaveViewData extends InputData
{
    public function __construct(
        #[Min(1), Max(60)]
        public string $name,
        public IssueFiltersData $filters,
    ) {}

    /**
     * IssueFiltersData has no rules() of its own (it is normally built leniently by fromQuery()), so the
     * nested lists are validated here: laravel-data infers `required` for them (rejecting `[]`, the
     * default!) and generates no rule at all for the items of a `list<IssueStatus>` docblock array.
     *
     * @return array<string, list<mixed>>
     */
    public static function rules(): array
    {
        return [
            'filters.statuses' => ['present', 'array'],
            'filters.statuses.*' => [Rule::enum(IssueStatus::class)],
            'filters.priorities' => ['present', 'array'],
            'filters.priorities.*' => [Rule::enum(IssuePriority::class)],
            'filters.labelIds' => ['present', 'array'],
            'filters.labelIds.*' => ['integer'],
        ];
    }
}
