import assert from 'node:assert/strict'
import test from 'node:test'
import {
  countSwipeActions,
  removeSwipeFromState,
  saveSwipeToState,
  toSwipeMap,
} from '../src/lib/swipeState.js'

test('turns persisted rows into a listing-action map', () => {
  assert.deepEqual(toSwipeMap([
    { house_id: 12, action: 'like' },
    { house_id: 19, action: 'pass' },
  ]), {
    12: 'like',
    19: 'pass',
  })
})

test('summarizes saved and passed decisions', () => {
  assert.deepEqual(countSwipeActions({ 12: 'like', 19: 'pass', 22: 'like' }), {
    liked: 2,
    passed: 1,
    total: 3,
  })
})

test('saving and undoing a decision does not mutate existing state', () => {
  const current = { 12: 'like' }
  const withNewDecision = saveSwipeToState(current, 19, 'pass')

  assert.deepEqual(current, { 12: 'like' })
  assert.deepEqual(withNewDecision, { 12: 'like', 19: 'pass' })
  assert.deepEqual(removeSwipeFromState(withNewDecision, 19), { 12: 'like' })
})
