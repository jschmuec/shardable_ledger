/**
 * Unit tests for the utilities module
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';

import {
  dissocIn,
  mergeDeep,
  setIn,
  getIn,
  updateIn
} from '../src/tools.js';

describe('Utilities Module', () => {
  describe('dissocIn', () => {
    test('removes top-level property', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = dissocIn(obj, ['b']);
      
      assert.deepStrictEqual(result, { a: 1, c: 3 }, 'Should remove top-level property');
      assert.deepStrictEqual(obj, { a: 1, b: 2, c: 3 }, 'Original object should be unchanged');
    });
    
    test('removes nested property', () => {
      const obj = { a: { b: { c: 1, d: 2 }, e: 3 }, f: 4 };
      const result = dissocIn(obj, ['a', 'b', 'c']);
      
      assert.deepStrictEqual(result, { a: { b: { d: 2 }, e: 3 }, f: 4 }, 'Should remove nested property');
    });
    
    test('handles non-existent path', () => {
      const obj = { a: 1 };
      const result = dissocIn(obj, ['b', 'c']);
      
      assert.deepStrictEqual(result, obj, 'Should return original object if path does not exist');
    });
    
    test('handles empty key path', () => {
      const obj = { a: 1 };
      const result = dissocIn(obj, []);
      
      assert.deepStrictEqual(result, obj, 'Should return original object with empty key path');
    });
  });
  
  describe('mergeDeep', () => {
    test('merges two simple objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const result = mergeDeep(obj1, obj2);
      
      assert.deepStrictEqual(result, { a: 1, b: 3, c: 4 }, 'Should merge objects with obj2 taking precedence');
    });
    
    test('merges nested objects deeply', () => {
      const obj1 = { a: { x: 1, y: 2 }, b: 3 };
      const obj2 = { a: { y: 4, z: 5 }, c: 6 };
      const result = mergeDeep(obj1, obj2);
      
      assert.deepStrictEqual(result, { 
        a: { x: 1, y: 4, z: 5 }, 
        b: 3, 
        c: 6 
      }, 'Should deeply merge nested objects');
    });
    
    test('handles multiple objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const obj3 = { c: 3 };
      const result = mergeDeep(obj1, obj2, obj3);
      
      assert.deepStrictEqual(result, { a: 1, b: 2, c: 3 }, 'Should merge multiple objects');
    });
    
    test('handles empty objects', () => {
      const result = mergeDeep();
      assert.deepStrictEqual(result, {}, 'Should return empty object with no arguments');
    });
  });
  
  describe('setIn', () => {
    test('sets top-level property', () => {
      const obj = { a: 1 };
      const result = setIn(obj, ['b'], 2);
      
      assert.deepStrictEqual(result, { a: 1, b: 2 }, 'Should set top-level property');
      assert.deepStrictEqual(obj, { a: 1 }, 'Original object should be unchanged');
    });
    
    test('sets nested property', () => {
      const obj = { a: { b: 1 } };
      const result = setIn(obj, ['a', 'c'], 2);
      
      assert.deepStrictEqual(result, { a: { b: 1, c: 2 } }, 'Should set nested property');
    });
    
    test('creates nested structure', () => {
      const obj = {};
      const result = setIn(obj, ['a', 'b', 'c'], 'value');
      
      assert.deepStrictEqual(result, { a: { b: { c: 'value' } } }, 'Should create nested structure');
    });
  });
  
  describe('getIn', () => {
    test('gets top-level property', () => {
      const obj = { a: 1, b: 2 };
      const result = getIn(obj, ['a']);
      
      assert.strictEqual(result, 1, 'Should get top-level property');
    });
    
    test('gets nested property', () => {
      const obj = { a: { b: { c: 'value' } } };
      const result = getIn(obj, ['a', 'b', 'c']);
      
      assert.strictEqual(result, 'value', 'Should get nested property');
    });
    
    test('returns default for non-existent property', () => {
      const obj = { a: 1 };
      const result = getIn(obj, ['b'], 'default');
      
      assert.strictEqual(result, 'default', 'Should return default value');
    });
    
    test('returns undefined for non-existent property without default', () => {
      const obj = { a: 1 };
      const result = getIn(obj, ['b']);
      
      assert.strictEqual(result, undefined, 'Should return undefined');
    });
  });
  
  describe('updateIn', () => {
    test('updates existing property', () => {
      const obj = { a: { b: 5 } };
      const result = updateIn(obj, ['a', 'b'], (x) => x * 2);
      
      assert.deepStrictEqual(result, { a: { b: 10 } }, 'Should update existing property');
    });
    
    test('creates property if it does not exist', () => {
      const obj = { a: {} };
      const result = updateIn(obj, ['a', 'b'], (x) => (x || 0) + 1);
      
      assert.deepStrictEqual(result, { a: { b: 1 } }, 'Should create property with update function');
    });
    
    test('passes additional arguments to update function', () => {
      const obj = { count: 5 };
      const result = updateIn(obj, ['count'], (current, increment) => current + increment, 3);
      
      assert.deepStrictEqual(result, { count: 8 }, 'Should pass additional arguments to update function');
    });
  });
}); 