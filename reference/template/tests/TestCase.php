<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Http\Request;
use Laravel\Fortify\Features;
use Symfony\Component\HttpFoundation\Request as SymfonyRequest;
use Tests\Support\InertiaContracts;
use Tests\Support\InputReads;
use Tests\Support\RouteKeyChecks;
use Tests\Support\TrackedRequest;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        InertiaContracts::listen();
        InputReads::listen($this->app);
        RouteKeyChecks::listen($this->app);

        if (in_array(RefreshDatabase::class, class_uses_recursive($this), true)) {
            RouteKeyChecks::useDisjointIds();
        }
    }

    /**
     * Requests record the input keys the app reads (InputReads).
     *
     * @param  SymfonyRequest  $symfonyRequest
     */
    protected function createTestRequest($symfonyRequest): Request
    {
        return TrackedRequest::createFromBase($symfonyRequest);
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
