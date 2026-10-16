<?php

namespace App\Data;

use App\Models\Issue;
use App\Models\User;
use Spatie\LaravelData\Attributes\Validation\Min;
use StrictlyLaravel\Data\InputData;
use StrictlyLaravel\Data\KeyOf;

final class BulkUpdateIssuesData extends InputData
{
    public function __construct(
        /** @var list<int> */
        #[KeyOf(Issue::class), Min(1)]
        public array $ids,
        #[KeyOf(User::class)]
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
