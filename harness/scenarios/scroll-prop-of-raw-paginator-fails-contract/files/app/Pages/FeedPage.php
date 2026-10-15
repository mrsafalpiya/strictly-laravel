<?php

namespace App\Pages;

use App\Data\EntryData;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\ScrollProp;
use StrictlyLaravel\Inertia\Page;

final class FeedPage extends Page
{
    public function __construct(
        /** @var ScrollProp<LengthAwarePaginator<int, EntryData>> Infinite scroll: `<InfiniteScroll data="entries">`. */
        public ScrollProp $entries,
    ) {}

    public static function of(EntryData ...$entries): self
    {
        $paginator = new LengthAwarePaginator(array_values($entries), count($entries), 10, 1, ['path' => '/feed']);

        return new self(entries: new ScrollProp($paginator));
    }
}
