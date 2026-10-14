<?php

namespace App\Http\Controllers;

use App\Data\SearchHitData;
use App\Data\SearchQueryData;
use App\Data\SearchResultsData;
use App\Data\SearchStatsData;
use Illuminate\Http\JsonResponse;

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
        return new SearchStatsData(indexed: 42);
    }

    public function health(): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }
}
