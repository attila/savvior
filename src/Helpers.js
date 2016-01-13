/* eslint-disable no-unused-vars*/
/**
 * Helper function for setting data attributes in a compatible way.
 *
 * @param {Element} element    Element to act on.
 * @param {String} key         Attribute name.
 * @param {String} value       Attribute value.
 * @param {Bool} forceCompat   Set to true to ensure compatibility.
 */
function addToDataset(element, key, value, forceCompat) {
  // Use dataset property or a fallback if unsupported.
  if (forceCompat || !element.dataset) {
    element.setAttribute('data-' + key, value);
  }
  else {
    element.dataset[key] = value;
  }

  return;
}

/**
 * Helper function for iterating over a collection.
 *
 * @param  {Mixed} collection  The collection to act on.
 * @param  {Function} fn       Iterator function called with value and key.
 * @param  {Object}   scope    Value of `this`.
 */
function each(collection, fn, scope) {
  var i = 0;
  var cont;

  for (i; i < collection.length; i++) {
    cont = fn.call(scope, collection[i], i);
    if (cont === false) {
      break; // Allow early exit.
    }
  }
}

/**
 * Helper function for determining whether target object is a function
 *
 * @param {Mixed} target  The object under test.
 *
 * @return {Boolean}  True if function, false otherwise.
 */
function isFunction(target) {
  return typeof target === 'function';
}

/**
 * Helper function to determine if an object or array is empty.
 *
 * @param  {Mixed}  obj  The object or array to check.
 * @param  {Mixed}  p    Optional object literal.
 * @return {Boolean}     TRUE if empty, FALSE if not.
 */
function isEmpty(obj, p) {
  for (p in obj) {
    if ({}.hasOwnProperty.call(obj, p)) {
      return !1;
    }
  }

  return !0;
}

/**
 * Dirt simple extend.
 *
 * @param  {Object} source  Object to extend.
 * @param  {Object} target  Object to extend with.
 *
 * @return {Object} The extended object.
 */
function extend(source, target) {
  for (var prop in source) {
    if ({}.hasOwnProperty.call(source, prop)) {
      target[prop] = source[prop];
    }
  }

  return target;
}
