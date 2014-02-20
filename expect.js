(function(global, module) {
  'use strict';
  /**
   * Super amazing, cross browser property function, based on http://thewikies.com/
   * @param obj
   * @param name
   * @param onGet
   * @param onSet
   * @api private
   */
  var defineProperty = function defineProperty(obj, name, onGet, onSet) {

    // wrapper functions
    var oldValue = obj[name];
    var getFn = function() {
      return onGet.apply(obj, [oldValue]);
    };
    var setFn = function(newValue) {
      oldValue = onSet.apply(obj, [newValue]);
      return oldValue;
    };

    // Modern browsers, IE9+, and IE8 (must be a DOM object),
    if (Object.defineProperty) {
      Object.defineProperty(obj, name, {
        get: getFn,
        set: setFn
      });

      // Older Mozilla
    } else {
      if (obj.__defineGetter__) {
        obj.__defineGetter__(name, getFn);
        obj.__defineSetter__(name, setFn);
        // IE6-7
        // must be a real DOM object (to have attachEvent) and must be attached to document (for onpropertychange to fire)
      } else {
        var onPropertyChange = function() {
          if (event.propertyName === name) {
            // temporarily remove the event so it doesn't fire again and create a loop
            obj.detachEvent("onpropertychange", onPropertyChange);
            // get the changed value, run it through the set function
            setFn(obj[name]);
            // restore the get function
            obj[name] = getFn;
            obj[name].toString = getFn;
            // restore the event
            obj.attachEvent("onpropertychange", onPropertyChange);
          }
        };
        obj[name] = getFn;
        obj[name].toString = getFn;
        obj.attachEvent("onpropertychange", onPropertyChange);

      }
    }
  };
  // http://blogs.msdn.com/b/giorgio/archive/2009/04/14/how-to-detect-ie8-using-javascript-client-side.aspx
  (function getInternetExplorerVersion() {
    var rv = 0; // Return value assumes failure.
    if ('undefined' !== typeof navigator && navigator.appName === 'Microsoft Internet Explorer') {
      var ua = navigator.userAgent;
      var re = /MSIE ([0-9]+[\.0-9]*)/;
      if (re.exec(ua) !== null) {
        rv = parseFloat(RegExp.$1);
      }
    }
    if (rv > 0 && rv < 9) {
      defineProperty.isIe8 = true;
    }
  })();
  var exports = module.exports;

  /**
   *
   * @param obj
   * @returns {*}
   */
  var expect = function expect(obj) {
    var assertion;
    if (defineProperty.isIe8) {
      // assertion is a DOM element
      assertion = document.createElement('fake');
      // this DOM element must be appended in document
      document.body.appendChild(assertion);
      // this DOM element must "inherits" real Assertion
      for (var k in Assertion.prototype) {
        assertion[k] = Assertion.prototype[k];
      }
      // prepare by calling constructor
      Assertion.call(assertion, obj);
    } else {
      assertion = new Assertion(obj);
    }
    return assertion;
  };

  var utils = (function() {

    // https://gist.github.com/1044128/
    var getOuterHTML = function getOuterHTML(element) {
      if ('outerHTML' in element) {
        return element.outerHTML;
      }
      var ns = "http://www.w3.org/1999/xhtml";
      var container = document.createElementNS(ns, '_');
      var xmlSerializer = new XMLSerializer();
      var html;
      if (document.xmlVersion) {
        return xmlSerializer.serializeToString(element);
      } else {
        container.appendChild(element.cloneNode(false));
        html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
        container.innerHTML = '';
        return html;
      }
    };

    // Returns true if object is a DOM element.
    var isDOMElement = function isDOMElement(object) {
      if (typeof HTMLElement === 'object') {
        return object instanceof HTMLElement;
      } else {
        return object && typeof object === 'object' && object.nodeType === 1 && typeof object.nodeName === 'string';
      }
    };

    var json = (function() {

      if ('object' === typeof JSON) {
        return JSON;
      }

      var shimJSON = {};

      function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
      }

      function date(d) {
        return isFinite(d.valueOf()) ? d.getUTCFullYear() + '-' + f(d.getUTCMonth() + 1) + '-' + f(d.getUTCDate()) + 'T' + f(d.getUTCHours()) + ':' +
          f(d.getUTCMinutes()) + ':' + f(d.getUTCSeconds()) + 'Z' : null;
      }

      var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
      var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
      var gap;
      var indent;
      var meta = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
      }, rep;

      function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
          var c = meta[a];
          return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
      }

      function str(key, holder) {

        // Produce a string from holder[key].

        var i,          // The loop counter.
          k,          // The member key.
          v,          // The member value.
          length, mind = gap, partial, value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value instanceof Date) {
          value = date(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
          return quote(value);

        case 'number':

          // JSON numbers must be finite. Encode non-finite numbers as null.

          return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

          // If the value is a boolean or null, convert it to a string. Note:
          // typeof null does not produce 'null'. The case is included here in
          // the remote chance that this gets fixed someday.

          return String(value);

          // If the type is 'object', we might be dealing with an object or an array or
          // null.

        case 'object':

          // Due to a specification blunder in ECMAScript, typeof null is 'object',
          // so watch out for that case.

          if (!value) {
            return 'null';
          }

          // Make an array to hold the partial results of stringifying this object value.

          gap += indent;
          partial = [];

          // Is the value an array?

          if (Object.prototype.toString.apply(value) === '[object Array]') {

            // The value is an array. Stringify every element. Use null as a placeholder
            // for non-JSON values.

            length = value.length;
            for (i = 0; i < length; i += 1) {
              partial[i] = str(i, value) || 'null';
            }

            // Join all of the elements together, separated with commas, and wrap them in
            // brackets.

            v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
            gap = mind;
            return v;
          }

          // If the replacer is an array, use it to select the members to be stringified.

          if (rep && typeof rep === 'object') {
            length = rep.length;
            for (i = 0; i < length; i += 1) {
              if (typeof rep[i] === 'string') {
                k = rep[i];
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ': ' : ':') + v);
                }
              }
            }
          } else {

            // Otherwise, iterate through all of the keys in the object.

            for (k in value) {
              if (Object.prototype.hasOwnProperty.call(value, k)) {
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ': ' : ':') + v);
                }
              }
            }
          }

          // Join all of the member texts together, separated with commas,
          // and wrap them in braces.

          v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
          gap = mind;
          return v;
        }
      }

      // If the JSON object does not yet have a stringify method, give it one.

      shimJSON.stringify = function(value, replacer, space) {

        // The stringify method takes a value and an optional replacer, and an optional
        // space parameter, and returns a JSON text. The replacer can be a function
        // that can replace values, or an array of strings that will select the keys.
        // A default replacer method can be provided. Use of the space parameter can
        // produce text that is more easily readable.

        var i;
        gap = '';
        indent = '';

        // If the space parameter is a number, make an indent string containing that
        // many spaces.

        if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
            indent += ' ';
          }

          // If the space parameter is a string, it will be used as the indent string.

        } else {
          if (typeof space === 'string') {
            indent = space;
          }
        }

        // If there is a replacer, it must be a function or an array.
        // Otherwise, throw an error.

        rep = replacer;
        if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify');
        }

        // Make a fake root object containing our value under the key of ''.
        // Return the result of stringifying the value.

        return str('', {'': value});
      };

      // If the JSON object does not yet have a parse method, give it one.

      shimJSON.parse = function(text, reviver) {
        // The parse method takes a text and an optional reviver function, and returns
        // a JavaScript value if the text is a valid JSON text.

        var j;

        function walk(holder, key) {

          // The walk method is used to recursively walk the resulting structure so
          // that modifications can be made.

          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
            for (k in value) {
              if (Object.prototype.hasOwnProperty.call(value, k)) {
                v = walk(value, k);
                if (v !== undefined) {
                  value[k] = v;
                } else {
                  delete value[k];
                }
              }
            }
          }
          return reviver.call(holder, key, value);
        }

        // Parsing happens in four stages. In the first stage, we replace certain
        // Unicode characters with escape sequences. JavaScript handles many characters
        // incorrectly, either silently deleting them, or treating them as line endings.

        text = String(text);
        cx.lastIndex = 0;
        if (cx.test(text)) {
          text = text.replace(cx, function(a) {
            return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
        }

        // In the second stage, we run the text against regular expressions that look
        // for non-JSON patterns. We are especially concerned with '()' and 'new'
        // because they can cause invocation, and '=' because it can cause mutation.
        // But just to be safe, we want to reject all unexpected forms.

        // We split the second stage into 4 regexp operations in order to work around
        // crippling inefficiencies in IE's and Safari's regexp engines. First we
        // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
        // replace all simple value tokens with ']' characters. Third, we delete all
        // open brackets that follow a colon or comma or that begin the text. Finally,
        // we look to see that the remaining characters are only whitespace or ']' or
        // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

        if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
          .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
          .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

          // In the third stage we use the eval function to compile the text into a
          // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
          // in JavaScript: it can begin a block or an object literal. We wrap the text
          // in parens to eliminate the ambiguity.
          /*jshint evil:true*/
          j = eval('(' + text + ')');
          /*jshint evil:false*/

          // In the optional fourth stage, we recursively walk the new structure, passing
          // each name/value pair to a reviver function for possible transformation.

          return typeof reviver === 'function' ? walk({'': j}, '') : j;
        }

        // If the text is not JSON parseable, then a SyntaxError is thrown.

        throw new SyntaxError('JSON.parse');
      };

      return shimJSON;
    })();

    var isArray = function isArray(ar) {
      return Object.prototype.toString.call(ar) === '[object Array]';
    };

    /**
     * Array indexOf compatibility.
     *
     * @see bit.ly/a5Dxa2
     * @api public
     */
    var indexOf = function indexOf(arr, o, i) {
      if (Array.prototype.indexOf) {
        return Array.prototype.indexOf.call(arr, o, i);
      }

      if (arr.length === undefined) {
        return -1;
      }
      var j;
      /*jshint noempty:false*/
      for (j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0; i < j && arr[i] !== o; i++){}

      return j <= i ? -1 : i;
    };
    /*jshint noempty:true*/

    /**
     * Inspects an object.
     *
     * @see taken from node.js `util` module (copyright Joyent, MIT license)
     * @api private
     */
    var inspect = function inspect(obj, showHidden, depth) {
      var seen = [];

      function stylize(str) {
        return str;
      }

      function format(value, recurseTimes) {
        // Provide a hook for user-specified inspect functions.
        // Check that value is an object with an inspect function on it
        if (value && typeof value.inspect === 'function' && // Filter out the util module, it's inspect function is special
          value !== exports && // Also filter out any prototype objects using the circular check.
          !(value.constructor && value.constructor.prototype === value)) {
          return value.inspect(recurseTimes);
        }

        // Primitive types cannot have properties
        switch (typeof value) {
        case 'undefined':
          return stylize('undefined', 'undefined');

        case 'string':
          var simple = '\'' + json.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
          return stylize(simple, 'string');

        case 'number':
          return stylize('' + value, 'number');

        case 'boolean':
          return stylize('' + value, 'boolean');
        }
        // For some reason typeof null is "object", so special case here.
        if (value === null) {
          return stylize('null', 'null');
        }

        if (isDOMElement(value)) {
          return getOuterHTML(value);
        }

        // Look up the keys of the object.
        var visible_keys = keys(value);
        var $keys = showHidden ? Object.getOwnPropertyNames(value) : visible_keys;

        // Functions without properties can be shortcutted.
        if (typeof value === 'function' && $keys.length === 0) {
          if (isRegExp(value)) {
            return stylize('' + value, 'regexp');
          } else {
            var name = value.name ? ': ' + value.name : '';
            return stylize('[Function' + name + ']', 'special');
          }
        }

        // Dates without properties can be shortcutted
        if (isDate(value) && $keys.length === 0) {
          return stylize(value.toUTCString(), 'date');
        }

        // Error objects can be shortcutted
        if (value instanceof Error) {
          return stylize("[" + value.toString() + "]", 'Error');
        }

        var base, type, braces;
        // Determine the object type
        if (isArray(value)) {
          type = 'Array';
          braces = ['[', ']'];
        } else {
          type = 'Object';
          braces = ['{', '}'];
        }

        // Make functions say that they are functions
        if (typeof value === 'function') {
          var n = value.name ? ': ' + value.name : '';
          base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
        } else {
          base = '';
        }

        // Make dates with properties first say the date
        if (isDate(value)) {
          base = ' ' + value.toUTCString();
        }

        if ($keys.length === 0) {
          return braces[0] + base + braces[1];
        }

        if (recurseTimes < 0) {
          if (isRegExp(value)) {
            return stylize('' + value, 'regexp');
          } else {
            return stylize('[Object]', 'special');
          }
        }

        seen.push(value);

        var output = map($keys, function(key) {
          var name, str;
          if (value.__lookupGetter__) {
            if (value.__lookupGetter__(key)) {
              if (value.__lookupSetter__(key)) {
                str = stylize('[Getter/Setter]', 'special');
              } else {
                str = stylize('[Getter]', 'special');
              }
            } else {
              if (value.__lookupSetter__(key)) {
                str = stylize('[Setter]', 'special');
              }
            }
          }
          if (indexOf(visible_keys, key) < 0) {
            name = '[' + key + ']';
          }
          if (!str) {
            if (indexOf(seen, value[key]) < 0) {
              if (recurseTimes === null) {
                str = format(value[key]);
              } else {
                str = format(value[key], recurseTimes - 1);
              }
              if (str.indexOf('\n') > -1) {
                if (isArray(value)) {
                  str = map(str.split('\n'),function(line) {
                    return '  ' + line;
                  }).join('\n').substr(2);
                } else {
                  str = '\n' + map(str.split('\n'),function(line) {
                    return '   ' + line;
                  }).join('\n');
                }
              }
            } else {
              str = stylize('[Circular]', 'special');
            }
          }
          if (typeof name === 'undefined') {
            if (type === 'Array' && key.match(/^\d+$/)) {
              return str;
            }
            name = json.stringify('' + key);
            if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
              name = name.substr(1, name.length - 2);
              name = stylize(name, 'name');
            } else {
              name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
              name = stylize(name, 'string');
            }
          }

          return name + ': ' + str;
        });

        seen.pop();

        var numLinesEst = 0;
        var length = reduce(output, function(prev, cur) {
          numLinesEst++;
          if (indexOf(cur, '\n') >= 0) {
            numLinesEst++;
          }
          return prev + cur.length + 1;
        }, 0);

        if (length > 50) {
          output = braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];

        } else {
          output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
        }

        return output;
      }

      return format(obj, (typeof depth === 'undefined' ? 2 : depth));
    };

    /**
     *
     * @param re
     * @returns {*}
     */
    var isRegExp = function isRegExp(re) {
      var s;
      try {
        s = '' + re;
      } catch (e) {
        return false;
      }

      return re instanceof RegExp || // easy case
        // duck-type for context-switching evalcx case
        typeof(re) === 'function' && re.constructor.name === 'RegExp' && re.compile && re.test && re.exec && s.match(/^\/.*\/[gim]{0,3}$/);
    };

    /**
     *
     * @param d
     * @returns {boolean}
     */
    var isDate = function isDate(d) {
      return d instanceof Date;
    };

    /**
     *
     * @param obj
     * @returns {Array}
     */
    var keys = function keys(obj) {
      if (Object.keys) {
        return Object.keys(obj);
      }

      var r = [];

      for (var i in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, i)) {
          r.push(i);
        }
      }

      return r;
    };

    /**
     *
     * @param arr
     * @param mapper
     * @param that
     * @returns {*}
     */
    var map = function map(arr, mapper, that) {
      if (Array.prototype.map) {
        return Array.prototype.map.call(arr, mapper, that);
      }

      var other = new Array(arr.length);

      for (var i = 0, n = arr.length; i < n; i++) {
        if (i in arr) {
          other[i] = mapper.call(that, arr[i], i, arr);
        }
      }

      return other;
    };

    /**
     *
     * @param arr
     * @param fun
     * @returns {*}
     */
    var reduce = function reduce(arr, fun) {
      if (Array.prototype.reduce) {
        return Array.prototype.reduce.apply(arr, Array.prototype.slice.call(arguments, 1));
      }

      var len = +this.length;

      if (typeof fun !== "function") {
        throw new TypeError();
      }

      // no value to return if no initial value and an empty array
      if (len === 0 && arguments.length === 1) {
        throw new TypeError();
      }

      var i = 0;
      var rv;
      if (arguments.length >= 2) {
        rv = arguments[1];
      } else {
        do {
          if (i in this) {
            rv = this[i++];
            break;
          }

          // if array contains no values, no initial value to return
          if (++i >= len) {
            throw new TypeError();
          }
        } while (true);
      }

      for (; i < len; i++) {
        if (i in this) {
          rv = fun.call(null, rv, this[i], i, this);
        }
      }

      return rv;
    };

    /**
     * Array every compatibility
     *
     * @see bit.ly/5Fq1N2
     * @api public
     */

    function every(arr, fn, thisObj) {
      var scope = thisObj || global;
      for (var i = 0, j = arr.length; i < j; ++i) {
        if (!fn.call(scope, arr[i], i, arr)) {
          return false;
        }
      }
      return true;
    }

    /**
     * Asserts deep equality
     *
     * @see taken from node.js `assert` module (copyright Joyent, MIT license)
     * @api private
     */
    var equal = function equal(actual, expected) {
      // 7.1. All identical values are equivalent, as determined by ===.
      if (actual === expected) {
        return true;
      }
      // 7.1bis compare 2 buffer
      if ('undefined' !== typeof Buffer && Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
        if (actual.length !== expected.length) {
          return false;
        }

        for (var i = 0; i < actual.length; i++) {
          if (actual[i] !== expected[i]) {
            return false;
          }
        }
        return true;
      }
      // 7.2. If the expected value is a Date object, the actual value is
      // equivalent if it is also a Date object that refers to the same time.
      if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();
      }
      // 7.3. Other pairs that do not both pass typeof value == "object",
      // equivalence is determined by ===.
      if (typeof actual !== 'object' && typeof expected !== 'object') {
        return actual === expected;
      }

      // If both are regular expression use the special `regExpEquiv` method
      // to determine equivalence.
      if (isRegExp(actual) && isRegExp(expected)) {
        return regExpEquiv(actual, expected);
      }
      // 7.4. For all other Object pairs, including Array objects, equivalence is
      // determined by having the same number of owned properties (as verified
      // with Object.prototype.hasOwnProperty.call), the same set of keys
      // (although not necessarily the same order), equivalent values for every
      // corresponding key, and an identical "prototype" property. Note: this
      // accounts for both named and indexed properties on Arrays.
      return objEquiv(actual, expected);

    };

    /**
     *
     * @param value
     * @returns {boolean}
     */
    function isUndefinedOrNull(value) {
      return value === null || value === undefined;
    }

    /**
     *
     * @param object
     * @returns {boolean}
     */
    function isArguments(object) {
      return Object.prototype.toString.call(object) === '[object Arguments]';
    }

    function regExpEquiv(a, b) {
      return a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline;
    }

    var pSlice = Array.prototype.slice;

    function objEquiv(a, b) {
      if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) {
        return false;
      }
      // an identical "prototype" property.
      if (a.prototype !== b.prototype) {
        return false;
      }
      //~~~I've managed to break Object.keys through screwy arguments passing.
      //   Converting to array solves the problem.
      if (isArguments(a)) {
        if (!isArguments(b)) {
          return false;
        }
        a = pSlice.call(a);
        b = pSlice.call(b);
        return equal(a, b);
      }
      var ka;
      var kb;
      var key, i;
      try {
        ka = keys(a);
        kb = keys(b);
      } catch (e) {//happens when one is a string literal and the other isn't
        return false;
      }
      // having the same number of owned properties (keys incorporates hasOwnProperty)
      if (ka.length !== kb.length) {
        return false;
      }
      //the same set of keys (although not necessarily the same order),
      ka.sort();
      kb.sort();
      //~~~cheap key test
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] !== kb[i]) {
          return false;
        }
      }
      //equivalent values for every corresponding key, and
      //~~~possibly expensive deep test
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (equal(a[key], a) && equal(b[key], b)) {
          break;
        }
        if (!equal(a[key], b[key])) {
          return false;
        }
      }
      return true;
    }

    return {
      isArray: isArray,
      indexOf: indexOf,
      inspect: inspect,
      isRegExp: isRegExp,
      isDate: isDate,
      keys: keys,
      every: every,
      map: map,
      equal: equal,
      reduce: reduce
    };
  })();
  expect.use = function(plugin) {
    plugin.call(utils, expect, utils);
  };
  /**
   * Exports version.
   */

  expect.version = '0.3.0-dev';
  expect.propertyHandler = function defaultPropertyHandler() {
  };
  expect.methodHandler = function defaultMethodHandler() {
  };

  expect.flagHandlerMap = {};
  expect.aliasMap = {};
  /**
   *
   * @param name
   * @param {Function} handler
   * @returns {Function}
   */
  utils.addProperty = function addProperty(name, handler) {
    expect.flagHandlerMap[name] = handler;
    return utils;
  };
  /**
   *
   * @param name
   * @param methodHandler
   * @returns {Function}
   */
  utils.addChainableMethod = function addChainableMethod(name, methodHandler) {
    Assertion.prototype[name] = function() {

      var r = methodHandler.apply(this, arguments);
      if (r) {
        return r;
      }
      return this;
    };
    return utils;
  };
  /**
   *
   * @param alias
   * @param realName
   * @returns {Function}
   */
  utils.addAlias = function addAlias(alias, realName) {
    expect.aliasMap[alias] = realName;
    return utils;
  };

  function propertyHandlerClosure(flagHandler) {
    return function getter() {
      if (!flagHandler) {
        flagHandler = expect.propertyHandler;
      }
      var res = flagHandler.call(this);
      if (res) {
        return res;
      }
      return this;
    };
  }

  /**
   * Constructor
   *
   * @api private
   */

  var Assertion = function Assertion(obj) {
    this.obj = obj;
    this.flags = {};
    for (var name in expect.flagHandlerMap) {
      var handler = expect.flagHandlerMap[name];
      defineProperty(this, name, propertyHandlerClosure(handler));
    }
    for (var alias in expect.aliasMap) {
      var realName = expect.aliasMap[alias];
      this[alias] = this[realName];
    }

  };

  /**
   * Performs an assertion
   *
   * @api private
   */

  Assertion.prototype.assert = function(truth, message, expected) {
    var ok;
    if (this.flags.not) {
      message = 'expected ' + utils.inspect(this.obj) + ' not to ' + message;
      ok = !truth;
    } else {
      message = 'expected ' + utils.inspect(this.obj) + ' to ' + message;
      ok = truth;
    }
    if (!ok) {
      var err;
      if (arguments.length > 2) {
        err = new Error(message + ' ' + utils.inspect(expected));
        err.actual = this.obj;
        err.expected = expected;
        err.showDiff = true;
      } else {
        err = new Error(message);
      }
      throw err;
    }
  };
  /**
   * Exports.
   */

  module.exports = expect;
  expect.Assertion = Assertion;


  expect.core = function(expect, utils){

    /**
     * Checks if the both objects are identical.
     *
     * @api public
     */
    utils
      .addProperty('and', function() {
        return expect(this.obj);
      })
      .addProperty('to', function() {
        this.flags.to = 1;
      })
      .addProperty('include', function() {
        this.flags.include = 1;
      })
      .addProperty('not', function() {
        this.flags.not = 1;
      })
      .addProperty('have', function() {
        this.flags.have = 1;
      })
      .addProperty('own', function() {
        this.flags.own = 1;
      })
      .addProperty('only', function() {
        this.flags.only = 1;
      })
      .addProperty('be', function() {
        this.flags.be = 1;
      })
    /**
     *
     */
      .addChainableMethod('identical', function(obj) {
        this.assert(obj === this.obj, 'identical', utils.inspect(obj));
      })
    /**
     * Check if the value is truthy
     *
     * http://boards.straightdope.com/sdmb/showpost.php?p=8741075&postcount=28
     * @api public
     */
      .addChainableMethod('truthy', function() {
        this.assert(!!this.obj, 'be truthy');
      })
      .addAlias('ok', 'truthy')
    /**
     * Creates an anonymous function which calls fn with arguments.
     *
     * @api public
     */.addChainableMethod('withArgs', function() {
        expect(this.obj).a('function');
        var fn = this.obj;
        var args = Array.prototype.slice.call(arguments);
        return expect(function() {
          fn.apply(null, args);
        });
      })/**
     * Assert that the function throws.
     *
     * @param {Function|RegExp} callback, or regexp to match error string against
     * @api public
     */.addChainableMethod('throw', function(fn) {
        expect(this.obj).a('function');

        var thrown = false
          , not = this.flags.not;

        try {
          this.obj();
        } catch (e) {
          if (utils.isRegExp(fn)) {
            var subject = 'string' === typeof e ? e : e.message;
            if (not) {
              expect(subject).to.not.match(fn);
            } else {
              expect(subject).to.match(fn);
            }
          } else {
            if ('function' === typeof fn) {
              fn(e);
            }
          }
          thrown = true;
        }

        if (utils.isRegExp(fn) && not) {
          // in the presence of a matcher, ensure the `not` only applies to
          // the matching.
          this.flags.not = false;
        }
        this.assert(thrown, 'throw an exception');
      })
      .addAlias('throwError', 'throw').addAlias('throwException', 'throw')
    /**
     * Checks if the array is empty.
     *
     * @api public
     */.addChainableMethod('empty', function() {
        var expectation;

        if ('object' === typeof this.obj && null !== this.obj && !utils.isArray(this.obj)) {
          if ('number' === typeof this.obj.length) {
            expectation = !this.obj.length;
          } else {
            expectation = !utils.keys(this.obj).length;
          }
        } else {
          if ('string' !== typeof this.obj) {
            expect(this.obj).an('object');
          }
          expect(this.obj).to.only.have.property('length');
          expectation = !this.obj.length;
        }

        this.assert(expectation, 'be empty');
      })
    /**
     * Checks if the obj equals another.
     *
     * @api public
     */
      .addChainableMethod('equal', function(obj) {
        this.assert(utils.equal(this.obj, obj), 'equal', obj);
      })
      .addAlias('eql', 'equal')
    /**
     * Checks if the obj equals another.
     *
     * @api public
     */
      .addChainableMethod('resemble', function(obj) {
        /* jshint eqeqeq:false*/
        this.assert( this.obj == obj, 'resemble', obj);
        /* jshint eqeqeq:true*/
        return this;
      })
    /**
     * Assert within start to finish (inclusive).
     *
     * @param {Number} start
     * @param {Number} finish
     * @api public
     */
      .addChainableMethod('within', function(start, finish) {
        var range = start + '..' + finish;
        this.assert(this.obj >= start && this.obj <= finish, 'be within ' + range);
        return this;
      })
      .addAlias('between', 'within')
    /**
     * Assert within value +- delta (inclusive).
     *
     * @param {Number} value
     * @param {Number} delta
     * @api public
     */.addChainableMethod('approximate', function(value, delta) {
        this.assert(Math.abs(this.obj - value) <= delta, 'approximate ' + value + ' +- ' + delta);
        return this;
      }).addAlias('approximately', 'approximate')/**
     * Assert typeof / instance of
     *
     * @api public
     */.addChainableMethod('a', function(type) {
        if ('string' === typeof type) {
          // proper english in error msg
          var n = /^[aeiou]/.test(type) ? 'n' : '';

          // typeof with support for 'array'
          this.assert('array' === type ?
            utils.isArray(this.obj) : 'regexp' === type ?
            utils.isRegExp(this.obj) : 'object' === type ?
            'object' === typeof this.obj && null !== this.obj : type === typeof this.obj, 'be a' + n + ' ' + type);
        } else {
          // instanceof
          var name = type.name || 'supplied constructor';
          this.assert(this.obj instanceof type, 'be an instance of ' + name);
        }
      }).addAlias('an', 'a')/**
     * Assert numeric value above _n_.
     *
     * @param {Number} n
     * @api public
     */.addChainableMethod('above', function(n) {
        this.assert(this.obj > n, 'be above ' + n);
      })
      .addAlias('greaterThan', 'above')
    /**
     * Assert numeric value below _n_.
     *
     * @param {Number} n
     * @api public
     */
      .addChainableMethod('below', function(n) {
        this.assert(this.obj < n, 'be below ' + n);
        return this;
      })
      .addAlias('lessThan', 'below')
    /**
     * Assert string value matches _regexp_.
     *
     * @param {RegExp} regexp
     * @api public
     */
      .addChainableMethod('match', function(regexp) {
        this.assert(regexp.exec(this.obj), 'match ' + regexp);
      })
    /**
     * Assert property "length" exists and has value of _n_.
     *
     * @param {Number} n
     * @api public
     */.addChainableMethod('length', function(n) {
        expect(this.obj).to.have.property('length');
        var len = this.obj.length;
        this.assert(n === len, 'have a length of ' + len);
      })/**
     * Assert property _name_ exists, with optional _val_.
     *
     * @param {String} name
     * @param {Mixed} val
     * @api public
     */.addChainableMethod('property', function(name, val) {
        if (this.flags.own) {
          this.assert(Object.prototype.hasOwnProperty.call(this.obj, name), 'have own property ' + utils.inspect(name));
        }
        if (this.flags.not && undefined !== val) {
          if (undefined === this.obj[name]) {
            throw new Error(utils.inspect(this.obj) + ' has no property ' + utils.inspect(name));
          }
        }
        else {
          var hasProp;
          try {
            hasProp = name in this.obj;
          } catch (e) {
            hasProp = undefined !== this.obj[name];
          }

          this.assert(hasProp, 'have a property ' + utils.inspect(name));
        }
        if (undefined !== val) {
          this.assert(val === this.obj[name], 'have a property ' + utils.inspect(name) + ' of ' + utils.inspect(val));
        }
        this.obj = this.obj[name];
      })/**
     * Assert that the array contains _obj_, string contains _obj_, or object contains _obj_.
     *
     * @param {Mixed} obj|string
     * @api public
     */.addChainableMethod('contain', function(obj) {
        if (('object' === typeof obj) && !utils.isArray(obj)) {
          for (var k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
              this.property(k, obj[k]);
            }
          }
        } else {
          /* jshint bitwise:false */
          if ('string' === typeof this.obj) {
            this.assert(~this.obj.indexOf(obj), 'contain ' + utils.inspect(obj));
          } else {
            this.assert(~utils.indexOf(this.obj, obj), 'contain ' + utils.inspect(obj));
          }
          /* jshint bitwise:true */
        }
      }).addAlias('string', 'contain')/**
     * Assert exact keys or inclusion of keys by using
     * the `.own` modifier.
     *
     * @param {Array|String ...} keys
     * @api public
     */.addChainableMethod('key', function($keys) {
        var str
          , ok = true;

        $keys = utils.isArray($keys) ? $keys : Array.prototype.slice.call(arguments);

        if (!$keys.length) {
          throw new Error('keys required');
        }

        var actual = utils.keys(this.obj)
          , len = $keys.length;

        // Inclusion
        /* jshint bitwise:false */
        ok = utils.every($keys, function(key) {
          return ~utils.indexOf(actual, key);
        });
        /* jshint bitwise:true */

        // Strict
        if (!this.flags.not && this.flags.only) {
          ok = ok && $keys.length === actual.length;
        }

        // Key string
        if (len > 1) {
          $keys = utils.map($keys, function(key) {
            return utils.inspect(key);
          });
          var last = $keys.pop();
          str = $keys.join(', ') + ', and ' + last;
        } else {
          str = utils.inspect($keys[0]);
        }

        // Form
        str = (len > 1 ? 'keys ' : 'key ') + str;

        // Have / include
        str = (!this.flags.only ? 'include ' : 'only have ') + str;

        // Assertion
        this.assert(ok, str);

        return this;
      }).addAlias('keys', 'key')/**
     * Assert a failure.
     *
     * @param {String ...} custom message
     * @api public
     */.addChainableMethod('fail', function(msg) {
        msg = msg || "explicitly fail";
        this.assert(false, msg);
      })
    ;
  };

  expect.use(expect.core);
  if ('undefined' !== typeof window) {
    window.expect = module.exports;
  }

})(this, 'undefined' !== typeof module ? module : {exports: {}});
