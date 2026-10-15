<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Min;
use StrictlyLaravel\Data\InputData;

final class BulkUpdateIssuesData extends InputData
{
    public function __construct(
        /** @var list<int> */
        #[Min(1)]
        public array $ids,
        public ?int $assigneeId,
    ) {}

    /**
     * @return array<string, list<string>>
     */
    public static function rules(): array
    {
        return [
            'ids.*' => ['exists:issues,id'],
            'assigneeId' => ['exists:users,id'],
        ];
    }
}
