import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { harnessShard, type ShardedTest, testsInShard } from '../src/shard.ts';

const tests: ShardedTest[] = [30, 18, 18, 18, 10, 10, 7, 7, 7, 7, 5, 2, 2].map((cost, i) => ({
    name: `test ${i}`,
    cost,
    fn: async () => {},
}));

describe('harness shards', () => {
    test('the shards together run every test exactly once, each in its original order', () => {
        const shards = [1, 2, 3, 4].map((index) => testsInShard(tests, { index, total: 4 }));
        const names = shards.flat().map((test) => test.name);

        assert.deepEqual([...names].sort(), tests.map((test) => test.name).sort());

        for (const shard of shards) {
            assert.deepEqual(shard, [...shard].sort((a, b) => tests.indexOf(a) - tests.indexOf(b)));
        }
    });

    test('the shards take about as long as each other', () => {
        const loads = [1, 2, 3, 4].map((index) => testsInShard(tests, { index, total: 4 }).reduce((sum, test) => sum + test.cost, 0));

        assert.ok(Math.max(...loads) - Math.min(...loads) <= 5, `loads ${loads.join(', ')}`);
    });

    test('without a shard every test runs, and one shard of one is every test too', () => {
        assert.deepEqual(testsInShard(tests, null), tests);
        assert.deepEqual(testsInShard(tests, { index: 1, total: 1 }), tests);
    });

    test('STRICTLY_HARNESS_SHARD is <index>/<total>, 1-based', () => {
        assert.equal(harnessShard(undefined), null);
        assert.equal(harnessShard(''), null);
        assert.deepEqual(harnessShard('2/8'), { index: 2, total: 8 });

        for (const value of ['0/4', '5/4', '1/0', '2', 'a/b', '1/4/2']) {
            assert.throws(() => harnessShard(value), /STRICTLY_HARNESS_SHARD must be <index>\/<total>/);
        }
    });
});
