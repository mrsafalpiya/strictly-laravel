<?php

namespace App\Http\Controllers;

use App\Data\SearchHitData;
use App\Data\SearchQueryData;
use App\Data\SearchResultsData;
use App\Data\SearchStatsData;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

final class SearchController extends Controller
{
    public function search(SearchQueryData $data): SearchResultsData
    {
        return new SearchResultsData(
            query: $data->q,
            hits: [new SearchHitData(id: 1, title: "{$data->q} plan")],
        );
    }

    public function stats(): SearchStatsData
    {
        // Counted elsewhere and asserted to be the declared shape: the response sends whatever was cached.
        /** @var array{documents: int, projects: int} $counts */
        $counts = Cache::get('search.counts', ['documents' => 0, 'projects' => 0]);

        return new SearchStatsData(indexed: 42, counts: $counts);
    }

    public function health(): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }
}
