import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as lib from './index.js';

describe('formatRange', () => {
	it('replaces a hyphen between numbers with an en dash', () => {
		assert.equal(typeof lib.formatRange, 'function');
		assert.equal(lib.formatRange('7-8'), '7–8');
		assert.equal(lib.formatRange('25 - 26'), '25–26');
	});

	it('leaves single values untouched', () => {
		assert.equal(lib.formatRange(28), '28');
		assert.equal(lib.formatRange('14'), '14');
	});
});

describe('matchesQuery', () => {
	const entry = {
		bean: 'Grizzly Claw',
		roaster: 'Kick Horse',
		notes: 'Dark roast with little bitterness.',
		'grind(K6)': 28
	};

	it('matches any field case-insensitively', () => {
		assert.equal(typeof lib.matchesQuery, 'function');
		assert.equal(lib.matchesQuery(entry, 'grizzly'), true);
		assert.equal(lib.matchesQuery(entry, 'KICK'), true);
		assert.equal(lib.matchesQuery(entry, 'bitterness'), true);
		assert.equal(lib.matchesQuery(entry, 'k6'), true);
	});

	it('returns false when nothing matches', () => {
		assert.equal(lib.matchesQuery(entry, 'ethiopia'), false);
	});

	it('matches everything on an empty or blank query', () => {
		assert.equal(lib.matchesQuery(entry, ''), true);
		assert.equal(lib.matchesQuery(entry, '   '), true);
		assert.equal(lib.matchesQuery(entry, undefined), true);
	});
});

describe('getGrinds', () => {
	it('returns typed grind settings in entry order', () => {
		assert.equal(typeof lib.getGrinds, 'function');
		assert.deepEqual(lib.getGrinds({ 'grind(Niche Zero)': 15, 'grind(DF64)': '7-8' }), [
			{ setting: 15, type: 'Niche Zero' },
			{ setting: '7-8', type: 'DF64' }
		]);
	});

	it('falls back to legacy grind setting without a type', () => {
		assert.equal(typeof lib.getGrinds, 'function');
		assert.deepEqual(lib.getGrinds({ grind: '14-15' }), [{ setting: '14-15', type: null }]);
	});

	it('omits grind when neither format is present', () => {
		assert.equal(typeof lib.getGrinds, 'function');
		assert.deepEqual(lib.getGrinds({ bean: 'Espresso' }), []);
	});
});
