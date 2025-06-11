/**
 * Utility functions for the shardable ledger
 * Standard tools for data manipulation and deep operations
 */

/**
 * Removes a nested property from an object using a key path
 * @param {Object} obj - The object to modify
 * @param {Array<string>} keyPath - Array of keys representing the path to the property
 * @returns {Object} New object with the property removed
 */
export function dissocIn(obj, keyPath) {
  if (!obj || !Array.isArray(keyPath) || keyPath.length === 0) {
    return obj;
  }
  
  if (keyPath.length === 1) {
    const { [keyPath[0]]: removed, ...rest } = obj;
    return rest;
  }
  
  const [firstKey, ...restKeys] = keyPath;
  if (obj[firstKey] === undefined) {
    return obj;
  }
  
  return {
    ...obj,
    [firstKey]: dissocIn(obj[firstKey], restKeys)
  };
}

/**
 * Deeply merges multiple objects
 * @param {...Object} objects - Objects to merge
 * @returns {Object} Deeply merged object
 */
export function mergeDeep(...objects) {
  if (objects.length === 0) {
    return {};
  }
  
  if (objects.length === 1) {
    return objects[0] || {};
  }
  
  const [first, second, ...rest] = objects;
  
  function mergeTwoObjects(obj1, obj2) {
    if (!obj1 || typeof obj1 !== 'object') return obj2;
    if (!obj2 || typeof obj2 !== 'object') return obj1;
    
    const result = { ...obj1 };
    
    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && 
            !Array.isArray(obj1[key]) && !Array.isArray(obj2[key]) &&
            obj1[key] !== null && obj2[key] !== null) {
          result[key] = mergeTwoObjects(obj1[key], obj2[key]);
        } else {
          result[key] = obj2[key];
        }
      }
    }
    
    return result;
  }
  
  const merged = mergeTwoObjects(first, second);
  
  if (rest.length === 0) {
    return merged;
  }
  
  return mergeDeep(merged, ...rest);
}

/**
 * Sets a nested property in an object using a key path
 * @param {Object} obj - The object to modify
 * @param {Array<string>} keyPath - Array of keys representing the path to the property
 * @param {any} value - The value to set
 * @returns {Object} New object with the property set
 */
export function setIn(obj, keyPath, value) {
  if (!Array.isArray(keyPath) || keyPath.length === 0) {
    return obj;
  }
  
  if (keyPath.length === 1) {
    return { ...obj, [keyPath[0]]: value };
  }
  
  const [firstKey, ...restKeys] = keyPath;
  const currentValue = obj?.[firstKey] || {};
  
  return {
    ...obj,
    [firstKey]: setIn(currentValue, restKeys, value)
  };
}

/**
 * Gets a nested property from an object using a key path
 * @param {Object} obj - The object to read from
 * @param {Array<string>} keyPath - Array of keys representing the path to the property
 * @param {any} defaultValue - Default value if property doesn't exist
 * @returns {any} The value at the key path or default value
 */
export function getIn(obj, keyPath, defaultValue = undefined) {
  if (!obj || !Array.isArray(keyPath) || keyPath.length === 0) {
    return defaultValue;
  }
  
  let current = obj;
  for (const key of keyPath) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current === undefined ? defaultValue : current;
}

/**
 * Updates a nested property in an object using a key path and update function
 * @param {Object} obj - The object to modify
 * @param {Array<string>} keyPath - Array of keys representing the path to the property
 * @param {Function} updateFn - Function to apply to the current value
 * @param {...any} args - Additional arguments for the update function
 * @returns {Object} New object with the property updated
 */
export function updateIn(obj, keyPath, updateFn, ...args) {
  if (!Array.isArray(keyPath) || keyPath.length === 0) {
    return obj;
  }
  
  const currentValue = getIn(obj, keyPath);
  const newValue = updateFn(currentValue, ...args);
  
  return setIn(obj, keyPath, newValue);
} 