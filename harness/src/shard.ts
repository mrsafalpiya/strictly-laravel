// STRICTLY_HARNESS_SHARD=<index>/<total> (1-based) runs only one share of the fixture-app tests, so CI can split the
// suite across parallel jobs. Tests are dealt out by estimated cost, costliest first, each to the shard with the least
// cost so far, so the shards take about as long as each other. The deal is deterministic: every shard computes the same
// one from the same tests, and together the shards run every test exactly once.

export interface Shard {
    readonly index: number;
    readonly total: number;
}

export interface ShardedTest {
    readonly name: string;
    /** Rough seconds the test takes on its own. Only the relative sizes matter. */
    readonly cost: number;
    readonly fn: () => Promise<void>;
}

/** The shard a STRICTLY_HARNESS_SHARD value names, or null (unset or empty) to run every test. */
export function harnessShard(value: string | undefined): Shard | null {
    if (value === undefined || value === '') {
        return null;
    }

    const match = /^(\d+)\/(\d+)$/.exec(value);
    const index = Number(match?.[1]);
    const total = Number(match?.[2]);

    if (match === null || total < 1 || index < 1 || index > total) {
        throw new Error(`STRICTLY_HARNESS_SHARD must be <index>/<total> with 1 <= index <= total, got "${value}"`);
    }

    return { index, total };
}

/** The tests the shard runs, in their original order; every test when there's no shard. */
export function testsInShard(tests: readonly ShardedTest[], shard: Shard | null): ShardedTest[] {
    if (shard === null) {
        return [...tests];
    }

    const loads = Array.from({ length: shard.total }, () => 0);
    const shardOf = new Map<ShardedTest, number>();
    const costliestFirst = tests
        .map((test, position) => ({ test, position }))
        .sort((a, b) => b.test.cost - a.test.cost || a.position - b.position);

    for (const { test } of costliestFirst) {
        const lightest = loads.indexOf(Math.min(...loads));
        loads[lightest] = (loads[lightest] ?? 0) + test.cost;
        shardOf.set(test, lightest + 1);
    }

    return tests.filter((test) => shardOf.get(test) === shard.index);
}
