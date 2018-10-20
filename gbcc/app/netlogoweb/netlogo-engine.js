tortoise_require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":32}],4:[function(require,module,exports){
(function (global){
'use strict';

var buffer = require('buffer');
var Buffer = buffer.Buffer;
var SlowBuffer = buffer.SlowBuffer;
var MAX_LEN = buffer.kMaxLength || 2147483647;
exports.alloc = function alloc(size, fill, encoding) {
  if (typeof Buffer.alloc === 'function') {
    return Buffer.alloc(size, fill, encoding);
  }
  if (typeof encoding === 'number') {
    throw new TypeError('encoding must not be number');
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  var enc = encoding;
  var _fill = fill;
  if (_fill === undefined) {
    enc = undefined;
    _fill = 0;
  }
  var buf = new Buffer(size);
  if (typeof _fill === 'string') {
    var fillBuf = new Buffer(_fill, enc);
    var flen = fillBuf.length;
    var i = -1;
    while (++i < size) {
      buf[i] = fillBuf[i % flen];
    }
  } else {
    buf.fill(_fill);
  }
  return buf;
}
exports.allocUnsafe = function allocUnsafe(size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    return Buffer.allocUnsafe(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new Buffer(size);
}
exports.from = function from(value, encodingOrOffset, length) {
  if (typeof Buffer.from === 'function' && (!global.Uint8Array || Uint8Array.from !== Buffer.from)) {
    return Buffer.from(value, encodingOrOffset, length);
  }
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }
  if (typeof value === 'string') {
    return new Buffer(value, encodingOrOffset);
  }
  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    var offset = encodingOrOffset;
    if (arguments.length === 1) {
      return new Buffer(value);
    }
    if (typeof offset === 'undefined') {
      offset = 0;
    }
    var len = length;
    if (typeof len === 'undefined') {
      len = value.byteLength - offset;
    }
    if (offset >= value.byteLength) {
      throw new RangeError('\'offset\' is out of bounds');
    }
    if (len > value.byteLength - offset) {
      throw new RangeError('\'length\' is out of bounds');
    }
    return new Buffer(value.slice(offset, offset + len));
  }
  if (Buffer.isBuffer(value)) {
    var out = new Buffer(value.length);
    value.copy(out, 0, 0, value.length);
    return out;
  }
  if (value) {
    if (Array.isArray(value) || (typeof ArrayBuffer !== 'undefined' && value.buffer instanceof ArrayBuffer) || 'length' in value) {
      return new Buffer(value);
    }
    if (value.type === 'Buffer' && Array.isArray(value.data)) {
      return new Buffer(value.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ' + 'ArrayBuffer, Array, or array-like object.');
}
exports.allocUnsafeSlow = function allocUnsafeSlow(size) {
  if (typeof Buffer.allocUnsafeSlow === 'function') {
    return Buffer.allocUnsafeSlow(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size >= MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new SlowBuffer(size);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"buffer":5}],5:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":1,"ieee754":10}],6:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":17}],7:[function(require,module,exports){
(function (process,Buffer){
// Generated by CoffeeScript 1.10.0
var Parser, StringDecoder, stream, util;

stream = require('stream');

util = require('util');

StringDecoder = require('string_decoder').StringDecoder;

module.exports = function() {
  var callback, called, chunks, data, options, parser;
  if (arguments.length === 3) {
    data = arguments[0];
    options = arguments[1];
    callback = arguments[2];
    if (typeof callback !== 'function') {
      throw Error("Invalid callback argument: " + (JSON.stringify(callback)));
    }
    if (!(typeof data === 'string' || Buffer.isBuffer(arguments[0]))) {
      return callback(Error("Invalid data argument: " + (JSON.stringify(data))));
    }
  } else if (arguments.length === 2) {
    if (typeof arguments[0] === 'string' || Buffer.isBuffer(arguments[0])) {
      data = arguments[0];
    } else {
      options = arguments[0];
    }
    if (typeof arguments[1] === 'function') {
      callback = arguments[1];
    } else {
      options = arguments[1];
    }
  } else if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      callback = arguments[0];
    } else {
      options = arguments[0];
    }
  }
  if (options == null) {
    options = {};
  }
  parser = new Parser(options);
  if (data != null) {
    process.nextTick(function() {
      parser.write(data);
      return parser.end();
    });
  }
  if (callback) {
    called = false;
    chunks = options.objname ? {} : [];
    parser.on('readable', function() {
      var chunk, results;
      results = [];
      while (chunk = parser.read()) {
        if (options.objname) {
          results.push(chunks[chunk[0]] = chunk[1]);
        } else {
          results.push(chunks.push(chunk));
        }
      }
      return results;
    });
    parser.on('error', function(err) {
      called = true;
      return callback(err);
    });
    parser.on('end', function() {
      if (!called) {
        return callback(null, chunks);
      }
    });
  }
  return parser;
};

Parser = function(options) {
  var base, base1, base10, base11, base12, base13, base14, base15, base16, base2, base3, base4, base5, base6, base7, base8, base9, k, v;
  if (options == null) {
    options = {};
  }
  options.objectMode = true;
  this.options = {};
  for (k in options) {
    v = options[k];
    this.options[k] = v;
  }
  stream.Transform.call(this, this.options);
  if ((base = this.options).rowDelimiter == null) {
    base.rowDelimiter = null;
  }
  if (typeof this.options.rowDelimiter === 'string') {
    this.options.rowDelimiter = [this.options.rowDelimiter];
  }
  if ((base1 = this.options).delimiter == null) {
    base1.delimiter = ',';
  }
  if ((base2 = this.options).quote == null) {
    base2.quote = '"';
  }
  if ((base3 = this.options).escape == null) {
    base3.escape = '"';
  }
  if ((base4 = this.options).columns == null) {
    base4.columns = null;
  }
  if ((base5 = this.options).comment == null) {
    base5.comment = '';
  }
  if ((base6 = this.options).objname == null) {
    base6.objname = false;
  }
  if ((base7 = this.options).trim == null) {
    base7.trim = false;
  }
  if ((base8 = this.options).ltrim == null) {
    base8.ltrim = false;
  }
  if ((base9 = this.options).rtrim == null) {
    base9.rtrim = false;
  }
  if ((base10 = this.options).auto_parse == null) {
    base10.auto_parse = false;
  }
  if ((base11 = this.options).auto_parse_date == null) {
    base11.auto_parse_date = false;
  }
  if ((base12 = this.options).relax == null) {
    base12.relax = false;
  }
  if ((base13 = this.options).relax_column_count == null) {
    base13.relax_column_count = false;
  }
  if ((base14 = this.options).skip_empty_lines == null) {
    base14.skip_empty_lines = false;
  }
  if ((base15 = this.options).max_limit_on_data_read == null) {
    base15.max_limit_on_data_read = 128000;
  }
  if ((base16 = this.options).skip_lines_with_empty_values == null) {
    base16.skip_lines_with_empty_values = false;
  }
  this.lines = 0;
  this.count = 0;
  this.skipped_line_count = 0;
  this.empty_line_count = 0;
  this.is_int = /^(\-|\+)?([1-9]+[0-9]*)$/;
  this.is_float = function(value) {
    return (value - parseFloat(value) + 1) >= 0;
  };
  this._ = {};
  this._.decoder = new StringDecoder();
  this._.quoting = false;
  this._.commenting = false;
  this._.field = null;
  this._.nextChar = null;
  this._.closingQuote = 0;
  this._.line = [];
  this._.chunks = [];
  this._.rawBuf = '';
  this._.buf = '';
  if (this.options.rowDelimiter) {
    this._.rowDelimiterLength = Math.max.apply(Math, this.options.rowDelimiter.map(function(v) {
      return v.length;
    }));
  }
  return this;
};

util.inherits(Parser, stream.Transform);

module.exports.Parser = Parser;

Parser.prototype._transform = function(chunk, encoding, callback) {
  var err, error;
  if (chunk instanceof Buffer) {
    chunk = this._.decoder.write(chunk);
  }
  try {
    this.__write(chunk, false);
    return callback();
  } catch (error) {
    err = error;
    return this.emit('error', err);
  }
};

Parser.prototype._flush = function(callback) {
  var err, error;
  try {
    this.__write(this._.decoder.end(), true);
    if (this._.quoting) {
      this.emit('error', new Error("Quoted field not terminated at line " + (this.lines + 1)));
      return;
    }
    if (this._.line.length > 0) {
      this.__push(this._.line);
    }
    return callback();
  } catch (error) {
    err = error;
    return this.emit('error', err);
  }
};

Parser.prototype.__push = function(line) {
  var field, i, j, len, lineAsColumns, rawBuf, row;
  if (this.options.skip_lines_with_empty_values && line.join('').trim() === '') {
    return;
  }
  row = null;
  if (this.options.columns === true) {
    this.options.columns = line;
    rawBuf = '';
    return;
  } else if (typeof this.options.columns === 'function') {
    this.options.columns = this.options.columns(line);
    rawBuf = '';
    return;
  }
  if (!this._.line_length && line.length > 0) {
    this._.line_length = this.options.columns ? this.options.columns.length : line.length;
  }
  if (line.length === 1 && line[0] === '') {
    this.empty_line_count++;
  } else if (line.length !== this._.line_length) {
    if (this.options.relax_column_count) {
      this.skipped_line_count++;
    } else if (this.options.columns != null) {
      throw Error("Number of columns on line " + this.lines + " does not match header");
    } else {
      throw Error("Number of columns is inconsistent on line " + this.lines);
    }
  } else {
    this.count++;
  }
  if (this.options.columns != null) {
    lineAsColumns = {};
    for (i = j = 0, len = line.length; j < len; i = ++j) {
      field = line[i];
      if (this.options.columns[i] === false) {
        continue;
      }
      lineAsColumns[this.options.columns[i]] = field;
    }
    if (this.options.objname) {
      row = [lineAsColumns[this.options.objname], lineAsColumns];
    } else {
      row = lineAsColumns;
    }
  } else {
    row = line;
  }
  if (this.count < this.options.from) {
    return;
  }
  if (this.count > this.options.to) {
    return;
  }
  if (this.options.raw) {
    this.push({
      raw: this._.rawBuf,
      row: row
    });
    return this._.rawBuf = '';
  } else {
    return this.push(row);
  }
};

Parser.prototype.__write = function(chars, end) {
  var areNextCharsDelimiter, areNextCharsRowDelimiters, auto_parse, char, escapeIsQuote, i, isDelimiter, isEscape, isNextCharAComment, isQuote, isRowDelimiter, isRowDelimiterLength, is_float, is_int, l, ltrim, nextCharPos, ref, ref1, ref2, ref3, ref4, remainingBuffer, results, rowDelimiter, rtrim, wasCommenting;
  is_int = (function(_this) {
    return function(value) {
      if (typeof _this.is_int === 'function') {
        return _this.is_int(value);
      } else {
        return _this.is_int.test(value);
      }
    };
  })(this);
  is_float = (function(_this) {
    return function(value) {
      if (typeof _this.is_float === 'function') {
        return _this.is_float(value);
      } else {
        return _this.is_float.test(value);
      }
    };
  })(this);
  auto_parse = (function(_this) {
    return function(value) {
      var m;
      if (!_this.options.auto_parse) {
        return value;
      }
      if (is_int(value)) {
        value = parseInt(value);
      } else if (is_float(value)) {
        value = parseFloat(value);
      } else if (_this.options.auto_parse_date) {
        m = Date.parse(value);
        if (!isNaN(m)) {
          value = new Date(m);
        }
      }
      return value;
    };
  })(this);
  ltrim = this.options.trim || this.options.ltrim;
  rtrim = this.options.trim || this.options.rtrim;
  chars = this._.buf + chars;
  l = chars.length;
  i = 0;
  if (this.lines === 0 && 0xFEFF === chars.charCodeAt(0)) {
    i++;
  }
  while (i < l) {
    if (!end) {
      remainingBuffer = chars.substr(i, l - i);
      if ((!this.options.rowDelimiter && i + 3 > l) || (!this._.commenting && l - i < this.options.comment.length && this.options.comment.substr(0, l - i) === remainingBuffer) || (this.options.rowDelimiter && l - i < this._.rowDelimiterLength && this.options.rowDelimiter.some(function(rd) {
        return rd.substr(0, l - i) === remainingBuffer;
      })) || (this.options.rowDelimiter && this._.quoting && l - i < (this.options.quote.length + this._.rowDelimiterLength) && this.options.rowDelimiter.some((function(_this) {
        return function(rd) {
          return (_this.options.quote + rd).substr(0, l - i) === remainingBuffer;
        };
      })(this))) || (l - i <= this.options.delimiter.length && this.options.delimiter.substr(0, l - i) === remainingBuffer) || (l - i <= this.options.escape.length && this.options.escape.substr(0, l - i) === remainingBuffer)) {
        break;
      }
    }
    char = this._.nextChar ? this._.nextChar : chars.charAt(i);
    this._.nextChar = l > i + 1 ? chars.charAt(i + 1) : '';
    if (this.options.raw) {
      this._.rawBuf += char;
    }
    if (this.options.rowDelimiter == null) {
      nextCharPos = i;
      rowDelimiter = null;
      if (!this._.quoting && (char === '\n' || char === '\r')) {
        rowDelimiter = char;
        nextCharPos += 1;
      } else if (!(!this._.quoting && char === this.options.quote) && (this._.nextChar === '\n' || this._.nextChar === '\r')) {
        rowDelimiter = this._.nextChar;
        nextCharPos += 2;
        if (this.raw) {
          rawBuf += this._.nextChar;
        }
      }
      if (rowDelimiter) {
        if (rowDelimiter === '\r' && chars.charAt(nextCharPos) === '\n') {
          rowDelimiter += '\n';
        }
        this.options.rowDelimiter = [rowDelimiter];
        this._.rowDelimiterLength = rowDelimiter.length;
      }
    }
    if (!this._.commenting && char === this.options.escape) {
      escapeIsQuote = this.options.escape === this.options.quote;
      isEscape = this._.nextChar === this.options.escape;
      isQuote = this._.nextChar === this.options.quote;
      if (!(escapeIsQuote && (this._.field == null) && !this._.quoting) && (isEscape || isQuote)) {
        i++;
        char = this._.nextChar;
        this._.nextChar = chars.charAt(i + 1);
        if (this._.field == null) {
          this._.field = '';
        }
        this._.field += char;
        if (this.options.raw) {
          this._.rawBuf += char;
        }
        i++;
        continue;
      }
    }
    if (!this._.commenting && char === this.options.quote) {
      if (this._.quoting) {
        areNextCharsRowDelimiters = this.options.rowDelimiter && this.options.rowDelimiter.some(function(rd) {
          return chars.substr(i + 1, rd.length) === rd;
        });
        areNextCharsDelimiter = chars.substr(i + 1, this.options.delimiter.length) === this.options.delimiter;
        isNextCharAComment = this._.nextChar === this.options.comment;
        if (this._.nextChar && !areNextCharsRowDelimiters && !areNextCharsDelimiter && !isNextCharAComment) {
          if (this.options.relax) {
            this._.quoting = false;
            this._.field = "" + this.options.quote + this._.field;
          } else {
            throw Error("Invalid closing quote at line " + (this.lines + 1) + "; found " + (JSON.stringify(this._.nextChar)) + " instead of delimiter " + (JSON.stringify(this.options.delimiter)));
          }
        } else {
          this._.quoting = false;
          this._.closingQuote = this.options.quote.length;
          i++;
          if (end && i === l) {
            this._.line.push(auto_parse(this._.field || ''));
            this._.field = null;
          }
          continue;
        }
      } else if (!this._.field) {
        this._.quoting = true;
        i++;
        continue;
      } else if ((this._.field != null) && !this.options.relax) {
        throw Error("Invalid opening quote at line " + (this.lines + 1));
      }
    }
    isRowDelimiter = this.options.rowDelimiter && this.options.rowDelimiter.some(function(rd) {
      return chars.substr(i, rd.length) === rd;
    });
    if (isRowDelimiter) {
      isRowDelimiterLength = this.options.rowDelimiter.filter(function(rd) {
        return chars.substr(i, rd.length) === rd;
      })[0].length;
    }
    if (isRowDelimiter || (end && i === l - 1)) {
      this.lines++;
    }
    wasCommenting = false;
    if (!this._.commenting && !this._.quoting && this.options.comment && chars.substr(i, this.options.comment.length) === this.options.comment) {
      this._.commenting = true;
    } else if (this._.commenting && isRowDelimiter) {
      wasCommenting = true;
      this._.commenting = false;
    }
    isDelimiter = chars.substr(i, this.options.delimiter.length) === this.options.delimiter;
    if (!this._.commenting && !this._.quoting && (isDelimiter || isRowDelimiter)) {
      if (isRowDelimiter && this._.line.length === 0 && (this._.field == null)) {
        if (wasCommenting || this.options.skip_empty_lines) {
          i += isRowDelimiterLength;
          this._.nextChar = chars.charAt(i);
          continue;
        }
      }
      if (rtrim) {
        if (!this._.closingQuote) {
          this._.field = (ref = this._.field) != null ? ref.trimRight() : void 0;
        }
      }
      this._.line.push(auto_parse(this._.field || ''));
      this._.closingQuote = 0;
      this._.field = null;
      if (isDelimiter) {
        i += this.options.delimiter.length;
        this._.nextChar = chars.charAt(i);
        if (end && !this._.nextChar) {
          isRowDelimiter = true;
          this._.line.push('');
        }
      }
      if (isRowDelimiter) {
        this.__push(this._.line);
        this._.line = [];
        i += isRowDelimiterLength;
        this._.nextChar = chars.charAt(i);
        continue;
      }
    } else if (!this._.commenting && !this._.quoting && (char === ' ' || char === '\t')) {
      if (this._.field == null) {
        this._.field = '';
      }
      if (!(ltrim && !this._.field)) {
        this._.field += char;
      }
      i++;
    } else if (!this._.commenting) {
      if (this._.field == null) {
        this._.field = '';
      }
      this._.field += char;
      i++;
    } else {
      i++;
    }
    if (!this._.commenting && ((ref1 = this._.field) != null ? ref1.length : void 0) > this.options.max_limit_on_data_read) {
      throw Error("Delimiter not found in the file " + (JSON.stringify(this.options.delimiter)));
    }
    if (!this._.commenting && ((ref2 = this._.line) != null ? ref2.length : void 0) > this.options.max_limit_on_data_read) {
      throw Error("Row delimiter not found in the file " + (JSON.stringify(this.options.rowDelimiter)));
    }
  }
  if (end) {
    if (this._.field != null) {
      if (rtrim) {
        if (!this._.closingQuote) {
          this._.field = (ref3 = this._.field) != null ? ref3.trimRight() : void 0;
        }
      }
      this._.line.push(auto_parse(this._.field || ''));
      this._.field = null;
    }
    if (((ref4 = this._.field) != null ? ref4.length : void 0) > this.options.max_limit_on_data_read) {
      throw Error("Delimiter not found in the file " + (JSON.stringify(this.options.delimiter)));
    }
    if (l === 0) {
      this.lines++;
    }
    if (this._.line.length > this.options.max_limit_on_data_read) {
      throw Error("Row delimiter not found in the file " + (JSON.stringify(this.options.rowDelimiter)));
    }
  }
  this._.buf = '';
  results = [];
  while (i < l) {
    this._.buf += chars.charAt(i);
    results.push(i++);
  }
  return results;
};

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":20,"buffer":5,"stream":33,"string_decoder":3,"util":38}],8:[function(require,module,exports){
(function (Buffer){
// Generated by CoffeeScript 1.10.0
var StringDecoder, parse;

StringDecoder = require('string_decoder').StringDecoder;

parse = require('./index');

module.exports = function(data, options) {
  var decoder, parser, records;
  if (options == null) {
    options = {};
  }
  records = options.objname ? {} : [];
  if (data instanceof Buffer) {
    decoder = new StringDecoder();
    data = decoder.write(data);
  }
  parser = new parse.Parser(options);
  parser.push = function(record) {
    if (options.objname) {
      return records[record[0]] = record[1];
    } else {
      return records.push(record);
    }
  };
  parser.__write(data, false);
  if (data instanceof Buffer) {
    parser.__write(data.end(), true);
  }
  parser._flush((function() {}));
  return records;
};

}).call(this,require("buffer").Buffer)
},{"./index":7,"buffer":5,"string_decoder":3}],9:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],10:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],11:[function(require,module,exports){
var structuredClone = require('./structured-clone');
var HELLO_INTERVAL_LENGTH = 200;
var HELLO_TIMEOUT_LENGTH = 60000;

function IFrameEndpoint() {
  var listeners = {};
  var isInitialized = false;
  var connected = false;
  var postMessageQueue = [];
  var helloInterval;

  function postToParent(message) {
    // See http://dev.opera.com/articles/view/window-postmessage-messagechannel/#crossdoc
    //     https://github.com/Modernizr/Modernizr/issues/388
    //     http://jsfiddle.net/ryanseddon/uZTgD/2/
    if (structuredClone.supported()) {
      window.parent.postMessage(message, '*');
    } else {
      window.parent.postMessage(JSON.stringify(message), '*');
    }
  }

  function post(type, content) {
    var message;
    // Message object can be constructed from 'type' and 'content' arguments or it can be passed
    // as the first argument.
    if (arguments.length === 1 && typeof type === 'object' && typeof type.type === 'string') {
      message = type;
    } else {
      message = {
        type: type,
        content: content
      };
    }
    if (connected) {
      postToParent(message);
    } else {
      postMessageQueue.push(message);
    }
  }

  function postHello() {
    postToParent({
      type: 'hello'
    });
  }

  function addListener(type, fn) {
    listeners[type] = fn;
  }

  function removeAllListeners() {
    listeners = {};
  }

  function getListenerNames() {
    return Object.keys(listeners);
  }

  function messageListener(message) {
    // Anyone can send us a message. Only pay attention to messages from parent.
    if (message.source !== window.parent) return;
    var messageData = message.data;
    if (typeof messageData === 'string') messageData = JSON.parse(messageData);

    if (!connected && messageData.type === 'hello') {
      connected = true;
      stopPostingHello();
      while (postMessageQueue.length > 0) {
        post(postMessageQueue.shift());
      }
    }

    if (connected && listeners[messageData.type]) {
      listeners[messageData.type](messageData.content);
    }
  }

  function disconnect() {
    connected = false;
    stopPostingHello();
    window.removeEventListener('message', messsageListener);
  }

  /**
    Initialize communication with the parent frame. This should not be called until the app's custom
    listeners are registered (via our 'addListener' public method) because, once we open the
    communication, the parent window may send any messages it may have queued. Messages for which
    we don't have handlers will be silently ignored.
  */
  function initialize() {
    if (isInitialized) {
      return;
    }
    isInitialized = true;
    if (window.parent === window) return;

    // We kick off communication with the parent window by sending a "hello" message. Then we wait
    // for a handshake (another "hello" message) from the parent window.
    startPostingHello();
    window.addEventListener('message', messageListener, false);
  }

  function startPostingHello() {
    if (helloInterval) {
      stopPostingHello();
    }
    helloInterval = window.setInterval(postHello, HELLO_INTERVAL_LENGTH);
    window.setTimeout(stopPostingHello, HELLO_TIMEOUT_LENGTH);
    // Post the first msg immediately.
    postHello();
  }

  function stopPostingHello() {
    window.clearInterval(helloInterval);
    helloInterval = null;
  }

  // Public API.
  return {
    initialize: initialize,
    getListenerNames: getListenerNames,
    addListener: addListener,
    removeAllListeners: removeAllListeners,
    disconnect: disconnect,
    post: post
  };
}

var instance = null;

// IFrameEndpoint is a singleton, as iframe can't have multiple parents anyway.
module.exports = function getIFrameEndpoint() {
  if (!instance) {
    instance = new IFrameEndpoint();
  }
  return instance;
};

},{"./structured-clone":14}],12:[function(require,module,exports){
var ParentEndpoint = require('./parent-endpoint');
var getIFrameEndpoint = require('./iframe-endpoint');

// Not a real UUID as there's an RFC for that (needed for proper distributed computing).
// But in this fairly parochial situation, we just need to be fairly sure to avoid repeats.
function getPseudoUUID() {
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var len = chars.length;
  var ret = [];

  for (var i = 0; i < 10; i++) {
    ret.push(chars[Math.floor(Math.random() * len)]);
  }
  return ret.join('');
}

module.exports = function IframePhoneRpcEndpoint(handler, namespace, targetWindow, targetOrigin, phone) {
  var pendingCallbacks = Object.create({});

  // if it's a non-null object, rather than a function, 'handler' is really an options object
  if (handler && typeof handler === 'object') {
    namespace = handler.namespace;
    targetWindow = handler.targetWindow;
    targetOrigin = handler.targetOrigin;
    phone = handler.phone;
    handler = handler.handler;
  }

  if (!phone) {
    if (targetWindow === window.parent) {
      phone = getIFrameEndpoint();
      phone.initialize();
    } else {
      phone = new ParentEndpoint(targetWindow, targetOrigin);
    }
  }

  phone.addListener(namespace, function (message) {
    var callbackObj;

    if (message.messageType === 'call' && typeof this.handler === 'function') {
      this.handler.call(undefined, message.value, function (returnValue) {
        phone.post(namespace, {
          messageType: 'returnValue',
          uuid: message.uuid,
          value: returnValue
        });
      });
    } else if (message.messageType === 'returnValue') {
      callbackObj = pendingCallbacks[message.uuid];

      if (callbackObj) {
        window.clearTimeout(callbackObj.timeout);
        if (callbackObj.callback) {
          callbackObj.callback.call(undefined, message.value);
        }
        pendingCallbacks[message.uuid] = null;
      }
    }
  }.bind(this));

  function call(message, callback) {
    var uuid = getPseudoUUID();

    pendingCallbacks[uuid] = {
      callback: callback,
      timeout: window.setTimeout(function () {
        if (callback) {
          callback(undefined, new Error("IframePhone timed out waiting for reply"));
        }
      }, 2000)
    };

    phone.post(namespace, {
      messageType: 'call',
      uuid: uuid,
      value: message
    });
  }

  function disconnect() {
    phone.disconnect();
  }

  this.handler = handler;
  this.call = call.bind(this);
  this.disconnect = disconnect.bind(this);
};

},{"./iframe-endpoint":11,"./parent-endpoint":13}],13:[function(require,module,exports){
var structuredClone = require('./structured-clone');

/**
  Call as:
    new ParentEndpoint(targetWindow, targetOrigin, afterConnectedCallback)
      targetWindow is a WindowProxy object. (Messages will be sent to it)

      targetOrigin is the origin of the targetWindow. (Messages will be restricted to this origin)

      afterConnectedCallback is an optional callback function to be called when the connection is
        established.

  OR (less secure):
    new ParentEndpoint(targetIframe, afterConnectedCallback)

      targetIframe is a DOM object (HTMLIframeElement); messages will be sent to its contentWindow.

      afterConnectedCallback is an optional callback function

    In this latter case, targetOrigin will be inferred from the value of the src attribute of the
    provided DOM object at the time of the constructor invocation. This is less secure because the
    iframe might have been navigated to an unexpected domain before constructor invocation.

  Note that it is important to specify the expected origin of the iframe's content to safeguard
  against sending messages to an unexpected domain. This might happen if our iframe is navigated to
  a third-party URL unexpectedly. Furthermore, having a reference to Window object (as in the first
  form of the constructor) does not protect against sending a message to the wrong domain. The
  window object is actualy a WindowProxy which transparently proxies the Window object of the
  underlying iframe, so that when the iframe is navigated, the "same" WindowProxy now references a
  completely differeent Window object, possibly controlled by a hostile domain.

  See http://www.esdiscuss.org/topic/a-dom-use-case-that-can-t-be-emulated-with-direct-proxies for
  more about this weird behavior of WindowProxies (the type returned by <iframe>.contentWindow).
*/

module.exports = function ParentEndpoint(targetWindowOrIframeEl, targetOrigin, afterConnectedCallback) {
  var postMessageQueue = [];
  var connected = false;
  var handlers = {};
  var targetWindowIsIframeElement;

  function getIframeOrigin(iframe) {
    return iframe.src.match(/(.*?\/\/.*?)\//)[1];
  }

  function post(type, content) {
    var message;
    // Message object can be constructed from 'type' and 'content' arguments or it can be passed
    // as the first argument.
    if (arguments.length === 1 && typeof type === 'object' && typeof type.type === 'string') {
      message = type;
    } else {
      message = {
        type: type,
        content: content
      };
    }
    if (connected) {
      var tWindow = getTargetWindow();
      // if we are laready connected ... send the message
      // See http://dev.opera.com/articles/view/window-postmessage-messagechannel/#crossdoc
      //     https://github.com/Modernizr/Modernizr/issues/388
      //     http://jsfiddle.net/ryanseddon/uZTgD/2/
      if (structuredClone.supported()) {
        tWindow.postMessage(message, targetOrigin);
      } else {
        tWindow.postMessage(JSON.stringify(message), targetOrigin);
      }
    } else {
      // else queue up the messages to send after connection complete.
      postMessageQueue.push(message);
    }
  }

  function addListener(messageName, func) {
    handlers[messageName] = func;
  }

  function removeListener(messageName) {
    handlers[messageName] = null;
  }

  // Note that this function can't be used when IFrame element hasn't been added to DOM yet
  // (.contentWindow would be null). At the moment risk is purely theoretical, as the parent endpoint
  // only listens for an incoming 'hello' message and the first time we call this function
  // is in #receiveMessage handler (so iframe had to be initialized before, as it could send 'hello').
  // It would become important when we decide to refactor the way how communication is initialized.
  function getTargetWindow() {
    if (targetWindowIsIframeElement) {
      var tWindow = targetWindowOrIframeEl.contentWindow;
      if (!tWindow) {
        throw "IFrame element needs to be added to DOM before communication " +
              "can be started (.contentWindow is not available)";
      }
      return tWindow;
    }
    return targetWindowOrIframeEl;
  }

  function receiveMessage(message) {
    var messageData;
    if (message.source === getTargetWindow() && (targetOrigin === '*' || message.origin === targetOrigin)) {
      messageData = message.data;
      if (typeof messageData === 'string') {
        messageData = JSON.parse(messageData);
      }
      if (handlers[messageData.type]) {
        handlers[messageData.type](messageData.content);
      } else {
        console.log("cant handle type: " + messageData.type);
      }
    }
  }

  function disconnect() {
    connected = false;
    window.removeEventListener('message', receiveMessage);
  }

  // handle the case that targetWindowOrIframeEl is actually an <iframe> rather than a Window(Proxy) object
  // Note that if it *is* a WindowProxy, this probe will throw a SecurityException, but in that case
  // we also don't need to do anything
  try {
    targetWindowIsIframeElement = targetWindowOrIframeEl.constructor === HTMLIFrameElement;
  } catch (e) {
    targetWindowIsIframeElement = false;
  }

  if (targetWindowIsIframeElement) {
    // Infer the origin ONLY if the user did not supply an explicit origin, i.e., if the second
    // argument is empty or is actually a callback (meaning it is supposed to be the
    // afterConnectionCallback)
    if (!targetOrigin || targetOrigin.constructor === Function) {
      afterConnectedCallback = targetOrigin;
      targetOrigin = getIframeOrigin(targetWindowOrIframeEl);
    }
  }

  // Handle pages served through file:// protocol. Behaviour varies in different browsers. Safari sets origin
  // to 'file://' and everything works fine, but Chrome and Safari set message.origin to null.
  // Also, https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage says:
  //  > Lastly, posting a message to a page at a file: URL currently requires that the targetOrigin argument be "*".
  //  > file:// cannot be used as a security restriction; this restriction may be modified in the future.
  // So, using '*' seems like the only possible solution.
  if (targetOrigin === 'file://') {
    targetOrigin = '*';
  }

  // when we receive 'hello':
  addListener('hello', function () {
    connected = true;

    // send hello response
    post({
      type: 'hello',
      // `origin` property isn't used by IframeEndpoint anymore (>= 1.2.0), but it's being sent to be
      // backward compatible with old IframeEndpoint versions (< v1.2.0).
      origin: window.location.href.match(/(.*?\/\/.*?)\//)[1]
    });

    // give the user a chance to do things now that we are connected
    // note that is will happen before any queued messages
    if (afterConnectedCallback && typeof afterConnectedCallback === "function") {
      afterConnectedCallback();
    }

    // Now send any messages that have been queued up ...
    while (postMessageQueue.length > 0) {
      post(postMessageQueue.shift());
    }
  });

  window.addEventListener('message', receiveMessage, false);

  // Public API.
  return {
    post: post,
    addListener: addListener,
    removeListener: removeListener,
    disconnect: disconnect,
    getTargetWindow: getTargetWindow,
    targetOrigin: targetOrigin
  };
};

},{"./structured-clone":14}],14:[function(require,module,exports){
var featureSupported = false;

(function () {
  var result = 0;

  if (!!window.postMessage) {
    try {
      // Safari 5.1 will sometimes throw an exception and sometimes won't, lolwut?
      // When it doesn't we capture the message event and check the
      // internal [[Class]] property of the message being passed through.
      // Safari will pass through DOM nodes as Null iOS safari on the other hand
      // passes it through as DOMWindow, gotcha.
      window.onmessage = function (e) {
        var type = Object.prototype.toString.call(e.data);
        result = (type.indexOf("Null") != -1 || type.indexOf("DOMWindow") != -1) ? 1 : 0;
        featureSupported = {
          'structuredClones': result
        };
      };
      // Spec states you can't transmit DOM nodes and it will throw an error
      // postMessage implimentations that support cloned data will throw.
      window.postMessage(document.createElement("a"), "*");
    } catch (e) {
      // BBOS6 throws but doesn't pass through the correct exception
      // so check error message
      result = (e.DATA_CLONE_ERR || e.message == "Cannot post cyclic structures.") ? 1 : 0;
      featureSupported = {
        'structuredClones': result
      };
    }
  }
}());

exports.supported = function supported() {
  return featureSupported && featureSupported.structuredClones > 0;
};

},{}],15:[function(require,module,exports){
module.exports = {
  /**
   * Allows to communicate with an iframe.
   */
  ParentEndpoint:  require('./lib/parent-endpoint'),
  /**
   * Allows to communicate with a parent page.
   * IFrameEndpoint is a singleton, as iframe can't have multiple parents anyway.
   */
  getIFrameEndpoint: require('./lib/iframe-endpoint'),
  structuredClone: require('./lib/structured-clone'),

  // TODO: May be misnamed
  IframePhoneRpcEndpoint: require('./lib/iframe-phone-rpc-endpoint')

};

},{"./lib/iframe-endpoint":11,"./lib/iframe-phone-rpc-endpoint":12,"./lib/parent-endpoint":13,"./lib/structured-clone":14}],16:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],17:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],18:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],19:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

}).call(this,require('_process'))
},{"_process":20}],20:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],21:[function(require,module,exports){
module.exports = require("./lib/_stream_duplex.js")

},{"./lib/_stream_duplex.js":22}],22:[function(require,module,exports){
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
},{"./_stream_readable":24,"./_stream_writable":26,"core-util-is":6,"inherits":16,"process-nextick-args":19}],23:[function(require,module,exports){
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":25,"core-util-is":6,"inherits":16}],24:[function(require,module,exports){
(function (process){
'use strict';

module.exports = Readable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = require('st' + 'ream');
  } catch (_) {} finally {
    if (!Stream) Stream = require('events').EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var StringDecoder;

util.inherits(Readable, Stream);

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function') this._read = options.read;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = bufferShim.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');
      stream.emit('error', _e);
    } else {
      var skipAdd;
      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false;

      // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode
      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function (ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = bufferShim.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'))
},{"./_stream_duplex":22,"./internal/streams/BufferList":27,"_process":20,"buffer":5,"buffer-shims":4,"core-util-is":6,"events":9,"inherits":16,"isarray":18,"process-nextick-args":19,"string_decoder/":34,"util":2}],25:[function(require,module,exports){
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er, data) {
      done(stream, er, data);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data !== null && data !== undefined) stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":22,"core-util-is":6,"inherits":16}],26:[function(require,module,exports){
(function (process){
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

module.exports = Writable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = require('st' + 'ream');
  } catch (_) {} finally {
    if (!Stream) Stream = require('events').EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

util.inherits(Writable, Stream);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;
  // Always throw error if a null is written
  // if we are not in object mode then throw
  // if it is not a buffer, string, or undefined.
  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = bufferShim.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) processNextTick(cb, er);else cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
        afterWrite(stream, state, finished, cb);
      }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}
}).call(this,require('_process'))
},{"./_stream_duplex":22,"_process":20,"buffer":5,"buffer-shims":4,"core-util-is":6,"events":9,"inherits":16,"process-nextick-args":19,"util-deprecate":35}],27:[function(require,module,exports){
'use strict';

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

module.exports = BufferList;

function BufferList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

BufferList.prototype.push = function (v) {
  var entry = { data: v, next: null };
  if (this.length > 0) this.tail.next = entry;else this.head = entry;
  this.tail = entry;
  ++this.length;
};

BufferList.prototype.unshift = function (v) {
  var entry = { data: v, next: this.head };
  if (this.length === 0) this.tail = entry;
  this.head = entry;
  ++this.length;
};

BufferList.prototype.shift = function () {
  if (this.length === 0) return;
  var ret = this.head.data;
  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
  --this.length;
  return ret;
};

BufferList.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

BufferList.prototype.join = function (s) {
  if (this.length === 0) return '';
  var p = this.head;
  var ret = '' + p.data;
  while (p = p.next) {
    ret += s + p.data;
  }return ret;
};

BufferList.prototype.concat = function (n) {
  if (this.length === 0) return bufferShim.alloc(0);
  if (this.length === 1) return this.head.data;
  var ret = bufferShim.allocUnsafe(n >>> 0);
  var p = this.head;
  var i = 0;
  while (p) {
    p.data.copy(ret, i);
    i += p.data.length;
    p = p.next;
  }
  return ret;
};
},{"buffer":5,"buffer-shims":4}],28:[function(require,module,exports){
module.exports = require("./lib/_stream_passthrough.js")

},{"./lib/_stream_passthrough.js":23}],29:[function(require,module,exports){
(function (process){
var Stream = (function (){
  try {
    return require('st' + 'ream'); // hack to fix a circular dependency issue when used with browserify
  } catch(_){}
}());
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = Stream || exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

if (!process.browser && process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream;
}

}).call(this,require('_process'))
},{"./lib/_stream_duplex.js":22,"./lib/_stream_passthrough.js":23,"./lib/_stream_readable.js":24,"./lib/_stream_transform.js":25,"./lib/_stream_writable.js":26,"_process":20}],30:[function(require,module,exports){
module.exports = require("./lib/_stream_transform.js")

},{"./lib/_stream_transform.js":25}],31:[function(require,module,exports){
module.exports = require("./lib/_stream_writable.js")

},{"./lib/_stream_writable.js":26}],32:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":5}],33:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":9,"inherits":16,"readable-stream/duplex.js":21,"readable-stream/passthrough.js":28,"readable-stream/readable.js":29,"readable-stream/transform.js":30,"readable-stream/writable.js":31}],34:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":5}],35:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],36:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"dup":16}],37:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],38:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":37,"_process":20,"inherits":36}],"agentmodel":[function(require,module,exports){
(function() {
  var AgentModel;

  module.exports = AgentModel = (function() {
    var mergeObjectInto;

    function AgentModel() {
      this.turtles = {};
      this.patches = {};
      this.links = {};
      this.observer = {};
      this.world = {};
      this.drawingEvents = [];
    }

    AgentModel.prototype.updates = function(modelUpdates) {
      var i, len, u;
      for (i = 0, len = modelUpdates.length; i < len; i++) {
        u = modelUpdates[i];
        this.update(u);
      }
    };

    AgentModel.prototype.update = function(arg) {
      var coll, drawingEvents, i, id, len, linkBundle, links, observer, patchBundle, patches, ref, ref1, turtleBundle, turtles, typeCanDie, updates, varUpdates, world;
      links = arg.links, observer = arg.observer, patches = arg.patches, turtles = arg.turtles, world = arg.world, drawingEvents = arg.drawingEvents;
      turtleBundle = {
        updates: turtles,
        coll: this.turtles,
        typeCanDie: true
      };
      patchBundle = {
        updates: patches,
        coll: this.patches,
        typeCanDie: false
      };
      linkBundle = {
        updates: links,
        coll: this.links,
        typeCanDie: true
      };
      ref = [turtleBundle, patchBundle, linkBundle];
      for (i = 0, len = ref.length; i < len; i++) {
        ref1 = ref[i], coll = ref1.coll, typeCanDie = ref1.typeCanDie, updates = ref1.updates;
        for (id in updates) {
          varUpdates = updates[id];
          if (varUpdates != null) {
            if (typeCanDie && varUpdates.WHO === -1) {
              delete coll[id];
            } else {
              mergeObjectInto(varUpdates, this._itemById(coll, id));
            }
          }
        }
      }
      if ((observer != null ? observer[0] : void 0) != null) {
        mergeObjectInto(observer[0], this.observer);
      }
      if ((world != null ? world[0] : void 0) != null) {
        mergeObjectInto(world[0], this.world);
      }
      if (drawingEvents != null) {
        this.drawingEvents = this.drawingEvents.concat(drawingEvents);
      }
    };

    AgentModel.prototype._itemById = function(coll, id) {
      if (coll[id] == null) {
        coll[id] = {};
      }
      return coll[id];
    };

    mergeObjectInto = function(updatedObject, targetObject) {
      var value, variable;
      for (variable in updatedObject) {
        value = updatedObject[variable];
        targetObject[variable.toLowerCase()] = value;
      }
    };

    return AgentModel;

  })();

}).call(this);

},{}],"bootstrap":[function(require,module,exports){

/*
  `Workspace` is needed to do anything.  If you want the core of Tortoise, do `require('engine/workspace')`.
  If you want the peripheral stuff (i.e. because you're a compiler or test infrastructure),
  the other things you might want ought to get initialized by RequireJS here. --JAB (5/7/14)
 */

(function() {
  require('./agentmodel');

  require('./engine/workspace');

  require('./engine/prim/prims');

  require('./engine/prim/tasks');

  require('./extensions/all');

  require('./util/notimplemented');

  module.exports = function() {};

}).call(this);

},{"./agentmodel":"agentmodel","./engine/prim/prims":"engine/prim/prims","./engine/prim/tasks":"engine/prim/tasks","./engine/workspace":"engine/workspace","./extensions/all":"extensions/all","./util/notimplemented":"util/notimplemented"}],"brazier/array":[function(require,module,exports){
(function() {
  var None, Something, arrayOps, eq, isArray, maybe, ref;

  eq = require('./equals').eq;

  ref = require('./maybe'), maybe = ref.maybe, None = ref.None, Something = ref.Something;

  isArray = require('./type').isArray;

  arrayOps = {
    all: function(f) {
      return function(arr) {
        var j, len, x;
        for (j = 0, len = arr.length; j < len; j++) {
          x = arr[j];
          if (!f(x)) {
            return false;
          }
        }
        return true;
      };
    },
    concat: function(xs) {
      return function(ys) {
        return xs.concat(ys);
      };
    },
    contains: function(x) {
      return function(arr) {
        var item, j, len;
        for (j = 0, len = arr.length; j < len; j++) {
          item = arr[j];
          if (eq(x)(item)) {
            return true;
          }
        }
        return false;
      };
    },
    countBy: function(f) {
      return function(arr) {
        var acc, j, key, len, ref1, value, x;
        acc = {};
        for (j = 0, len = arr.length; j < len; j++) {
          x = arr[j];
          key = f(x);
          value = (ref1 = acc[key]) != null ? ref1 : 0;
          acc[key] = value + 1;
        }
        return acc;
      };
    },
    difference: function(xs) {
      return function(arr) {
        var acc, badBoys, j, len, x;
        acc = [];
        badBoys = arrayOps.unique(arr);
        for (j = 0, len = xs.length; j < len; j++) {
          x = xs[j];
          if (!arrayOps.contains(x)(badBoys)) {
            acc.push(x);
          }
        }
        return acc;
      };
    },
    exists: function(f) {
      return function(arr) {
        var j, len, x;
        for (j = 0, len = arr.length; j < len; j++) {
          x = arr[j];
          if (f(x)) {
            return true;
          }
        }
        return false;
      };
    },
    filter: function(f) {
      return function(arr) {
        var j, len, results, x;
        results = [];
        for (j = 0, len = arr.length; j < len; j++) {
          x = arr[j];
          if (f(x)) {
            results.push(x);
          }
        }
        return results;
      };
    },
    find: function(f) {
      return function(arr) {
        var j, len, x;
        for (j = 0, len = arr.length; j < len; j++) {
          x = arr[j];
          if (f(x)) {
            return Something(x);
          }
        }
        return None;
      };
    },
    findIndex: function(f) {
      return function(arr) {
        var i, j, len, x;
        for (i = j = 0, len = arr.length; j < len; i = ++j) {
          x = arr[i];
          if (f(x)) {
            return Something(i);
          }
        }
        return None;
      };
    },
    flatMap: function(f) {
      return function(arr) {
        var arrs, ref1, x;
        arrs = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = arr.length; j < len; j++) {
            x = arr[j];
            results.push(f(x));
          }
          return results;
        })();
        return (ref1 = []).concat.apply(ref1, arrs);
      };
    },
    flattenDeep: function(arr) {
      var acc, j, len, x;
      acc = [];
      for (j = 0, len = arr.length; j < len; j++) {
        x = arr[j];
        if (isArray(x)) {
          acc = acc.concat(arrayOps.flattenDeep(x));
        } else {
          acc.push(x);
        }
      }
      return acc;
    },
    foldl: function(f) {
      return function(acc) {
        return function(arr) {
          var j, len, out, x;
          out = acc;
          for (j = 0, len = arr.length; j < len; j++) {
            x = arr[j];
            out = f(out, x);
          }
          return out;
        };
      };
    },
    forEach: function(f) {
      return function(arr) {
        var j, len, x;
        for (j = 0, len = arr.length; j < len; j++) {
          x = arr[j];
          f(x);
        }
      };
    },
    head: function(arr) {
      return arrayOps.item(0)(arr);
    },
    isEmpty: function(arr) {
      return arr.length === 0;
    },
    item: function(index) {
      return function(xs) {
        if ((0 <= index && index < xs.length)) {
          return Something(xs[index]);
        } else {
          return None;
        }
      };
    },
    last: function(arr) {
      return arr[arr.length - 1];
    },
    length: function(arr) {
      return arr.length;
    },
    map: function(f) {
      return function(arr) {
        var j, len, results, x;
        results = [];
        for (j = 0, len = arr.length; j < len; j++) {
          x = arr[j];
          results.push(f(x));
        }
        return results;
      };
    },
    maxBy: function(f) {
      return function(arr) {
        var j, len, maxX, maxY, x, y;
        maxX = void 0;
        maxY = -Infinity;
        for (j = 0, len = arr.length; j < len; j++) {
          x = arr[j];
          y = f(x);
          if (y > maxY) {
            maxX = x;
            maxY = y;
          }
        }
        return maybe(maxX);
      };
    },
    reverse: function(xs) {
      return xs.slice(0).reverse();
    },
    singleton: function(x) {
      return [x];
    },
    sortBy: function(f) {
      return function(arr) {
        var g;
        g = function(x, y) {
          var fx, fy;
          fx = f(x);
          fy = f(y);
          if (fx < fy) {
            return -1;
          } else if (fx > fy) {
            return 1;
          } else {
            return 0;
          }
        };
        return arr.slice(0).sort(g);
      };
    },
    sortedIndexBy: function(f) {
      return function(arr) {
        return function(x) {
          var i, item, j, len, y;
          y = f(x);
          for (i = j = 0, len = arr.length; j < len; i = ++j) {
            item = arr[i];
            if (y <= f(item)) {
              return i;
            }
          }
          return arr.length;
        };
      };
    },
    tail: function(arr) {
      return arr.slice(1);
    },
    toObject: function(arr) {
      var a, b, j, len, out, ref1;
      out = {};
      for (j = 0, len = arr.length; j < len; j++) {
        ref1 = arr[j], a = ref1[0], b = ref1[1];
        out[a] = b;
      }
      return out;
    },
    unique: function(arr) {
      var acc, j, len, x;
      acc = [];
      for (j = 0, len = arr.length; j < len; j++) {
        x = arr[j];
        if (!arrayOps.contains(x)(acc)) {
          acc.push(x);
        }
      }
      return acc;
    },
    uniqueBy: function(f) {
      return function(arr) {
        var acc, j, len, seen, x, y;
        acc = [];
        seen = [];
        for (j = 0, len = arr.length; j < len; j++) {
          x = arr[j];
          y = f(x);
          if (!arrayOps.contains(y)(seen)) {
            seen.push(y);
            acc.push(x);
          }
        }
        return acc;
      };
    },
    zip: function(xs) {
      return function(arr) {
        var i, j, length, out, ref1;
        out = [];
        length = Math.min(xs.length, arr.length);
        for (i = j = 0, ref1 = length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
          out.push([xs[i], arr[i]]);
        }
        return out;
      };
    }
  };

  module.exports = arrayOps;

}).call(this);

},{"./equals":"brazier/equals","./maybe":"brazier/maybe","./type":"brazier/type"}],"brazier/equals":[function(require,module,exports){
(function() {
  var arrayEquals, booleanEquals, eq, isArray, isBoolean, isNumber, isObject, isString, numberEquals, objectEquals, ref, stringEquals;

  ref = require('./type'), isArray = ref.isArray, isBoolean = ref.isBoolean, isNumber = ref.isNumber, isObject = ref.isObject, isString = ref.isString;

  arrayEquals = function(x) {
    return function(y) {
      var helper;
      helper = function(a, b) {
        var index, item, j, len;
        for (index = j = 0, len = a.length; j < len; index = ++j) {
          item = a[index];
          if (!eq(item)(b[index])) {
            return false;
          }
        }
        return true;
      };
      return (x === y) || (x.length === y.length && helper(x, y));
    };
  };

  booleanEquals = function(x) {
    return function(y) {
      return x === y;
    };
  };

  eq = function(x) {
    return function(y) {
      return (x === y) || (x === void 0 && y === void 0) || (x === null && y === null) || (isNumber(x) && isNumber(y) && ((isNaN(x) && isNaN(y)) || numberEquals(x)(y))) || (isBoolean(x) && isBoolean(y) && booleanEquals(x)(y)) || (isString(x) && isString(y) && stringEquals(x)(y)) || (isObject(x) && isObject(y) && objectEquals(x)(y)) || (isArray(x) && isArray(y) && arrayEquals(x)(y));
    };
  };

  numberEquals = function(x) {
    return function(y) {
      return x === y;
    };
  };

  objectEquals = function(x) {
    return function(y) {
      var helper, xKeys;
      xKeys = Object.keys(x);
      helper = function(a, b) {
        var i, j, key, ref1;
        for (i = j = 0, ref1 = xKeys.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
          key = xKeys[i];
          if (!eq(x[key])(y[key])) {
            return false;
          }
        }
        return true;
      };
      return (x === y) || (xKeys.length === Object.keys(y).length && helper(x, y));
    };
  };

  stringEquals = function(x) {
    return function(y) {
      return x === y;
    };
  };

  module.exports = {
    arrayEquals: arrayEquals,
    booleanEquals: booleanEquals,
    eq: eq,
    numberEquals: numberEquals,
    objectEquals: objectEquals,
    stringEquals: stringEquals
  };

}).call(this);

},{"./type":"brazier/type"}],"brazier/function":[function(require,module,exports){
(function() {
  var slice = [].slice;

  module.exports = {
    apply: function(f) {
      return function(x) {
        return f(x);
      };
    },
    constantly: function(x) {
      return function() {
        return x;
      };
    },
    curry: function(f) {
      var argsToArray, curryMaster;
      argsToArray = function(args) {
        return Array.prototype.slice.call(args, 0);
      };
      curryMaster = function() {
        var argsThusFar;
        argsThusFar = argsToArray(arguments);
        if (argsThusFar.length >= f.length) {
          return f.apply(null, argsThusFar);
        } else {
          return function() {
            var nextTierArgs;
            nextTierArgs = argsToArray(arguments);
            return curryMaster.apply(null, argsThusFar.concat(nextTierArgs));
          };
        }
      };
      return curryMaster;
    },
    flip: function(f) {
      return function(x) {
        return function(y) {
          return f(y)(x);
        };
      };
    },
    id: function(x) {
      return x;
    },
    pipeline: function() {
      var functions;
      functions = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return function() {
        var args, f, fs, h, i, len, out;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        h = functions[0], fs = 2 <= functions.length ? slice.call(functions, 1) : [];
        out = h.apply(null, args);
        for (i = 0, len = fs.length; i < len; i++) {
          f = fs[i];
          out = f(out);
        }
        return out;
      };
    },
    tee: function(f) {
      return function(g) {
        return function(x) {
          return [f(x), g(x)];
        };
      };
    },
    uncurry: function(f) {
      return function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return args.reduce((function(acc, arg) {
          return acc(arg);
        }), f);
      };
    }
  };

}).call(this);

},{}],"brazier/maybe":[function(require,module,exports){
(function() {
  var maybeOps;

  maybeOps = {
    None: {},
    Something: function(x) {
      return {
        _type: "something",
        _value: x
      };
    },
    filter: function(f) {
      return function(maybe) {
        return maybeOps.flatMap(function(x) {
          if (f(x)) {
            return maybeOps.Something(x);
          } else {
            return maybeOps.None;
          }
        })(maybe);
      };
    },
    flatMap: function(f) {
      return function(maybe) {
        return maybeOps.fold(function() {
          return maybeOps.None;
        })(f)(maybe);
      };
    },
    fold: function(ifNone) {
      return function(ifSomething) {
        return function(maybe) {
          if (maybeOps.isSomething(maybe)) {
            return ifSomething(maybe._value);
          } else {
            return ifNone();
          }
        };
      };
    },
    isSomething: function(arg) {
      var _type;
      _type = arg._type;
      return _type === "something";
    },
    map: function(f) {
      return function(maybe) {
        return maybeOps.fold(function() {
          return maybeOps.None;
        })(function(x) {
          return maybeOps.Something(f(x));
        })(maybe);
      };
    },
    maybe: function(x) {
      if (x != null) {
        return maybeOps.Something(x);
      } else {
        return maybeOps.None;
      }
    },
    toArray: function(maybe) {
      return maybeOps.fold(function() {
        return [];
      })(function(x) {
        return [x];
      })(maybe);
    }
  };

  module.exports = maybeOps;

}).call(this);

},{}],"brazier/number":[function(require,module,exports){
(function() {
  module.exports = {
    multiply: function(x) {
      return function(y) {
        return x * y;
      };
    },
    plus: function(x) {
      return function(y) {
        return x + y;
      };
    },
    rangeTo: function(start) {
      return function(end) {
        var i, results;
        if (start <= end) {
          return (function() {
            results = [];
            for (var i = start; start <= end ? i <= end : i >= end; start <= end ? i++ : i--){ results.push(i); }
            return results;
          }).apply(this);
        } else {
          return [];
        }
      };
    },
    rangeUntil: function(start) {
      return function(end) {
        var i, results;
        if (start < end) {
          return (function() {
            results = [];
            for (var i = start; start <= end ? i < end : i > end; start <= end ? i++ : i--){ results.push(i); }
            return results;
          }).apply(this);
        } else {
          return [];
        }
      };
    }
  };

}).call(this);

},{}],"brazier/object":[function(require,module,exports){
(function() {
  var None, Something, ref;

  ref = require('./maybe'), None = ref.None, Something = ref.Something;

  module.exports = {
    clone: function(obj) {
      var acc, i, j, key, keys, ref1;
      acc = {};
      keys = Object.keys(obj);
      for (i = j = 0, ref1 = keys.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
        key = keys[i];
        acc[key] = obj[key];
      }
      return acc;
    },
    keys: function(obj) {
      return Object.keys(obj);
    },
    lookup: function(key) {
      return function(obj) {
        if (obj.hasOwnProperty(key)) {
          return Something(obj[key]);
        } else {
          return None;
        }
      };
    },
    pairs: function(obj) {
      var i, j, key, keys, ref1, results;
      keys = Object.keys(obj);
      results = [];
      for (i = j = 0, ref1 = keys.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
        key = keys[i];
        results.push([key, obj[key]]);
      }
      return results;
    },
    values: function(obj) {
      var i, j, keys, ref1, results;
      keys = Object.keys(obj);
      results = [];
      for (i = j = 0, ref1 = keys.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
        results.push(obj[keys[i]]);
      }
      return results;
    }
  };

}).call(this);

},{"./maybe":"brazier/maybe"}],"brazier/type":[function(require,module,exports){
(function() {
  module.exports = {
    isArray: function(x) {
      return Array.isArray(x);
    },
    isBoolean: function(x) {
      return typeof x === "boolean";
    },
    isFunction: function(x) {
      return typeof x === "function";
    },
    isNumber: function(x) {
      return typeof x === "number" && !isNaN(x);
    },
    isObject: function(x) {
      return typeof x === "object" && x !== null && !Array.isArray(x);
    },
    isString: function(x) {
      return typeof x === "string";
    }
  };

}).call(this);

},{}],"engine/core/abstractagentset":[function(require,module,exports){
(function() {
  var AbstractAgentSet, Death, Iterator, NLType, Shufflerator, foldl, keys, map, pipeline, projectionSort, ref, stableSort;

  projectionSort = require('./projectionsort');

  NLType = require('./typechecker');

  Iterator = require('util/iterator');

  Shufflerator = require('util/shufflerator');

  stableSort = require('util/stablesort');

  ref = require('brazierjs/array'), foldl = ref.foldl, map = ref.map;

  pipeline = require('brazierjs/function').pipeline;

  keys = require('brazierjs/object').keys;

  Death = require('util/exception').DeathInterrupt;

  module.exports = AbstractAgentSet = (function() {
    function AbstractAgentSet(_agentArr, _world, _agentTypeName, _specialName) {
      this._agentArr = _agentArr;
      this._world = _world;
      this._agentTypeName = _agentTypeName;
      this._specialName = _specialName;
    }

    AbstractAgentSet.prototype.agentFilter = function(f) {
      return this.filter(Iterator.withBoolCheck(this._world.selfManager.askAgent(f)));
    };

    AbstractAgentSet.prototype.agentAll = function(f) {
      return this._unsafeIterator().all(this._world.selfManager.askAgent(f));
    };

    AbstractAgentSet.prototype.ask = function(f, shouldShuffle) {
      var base, iter;
      iter = shouldShuffle ? this.shufflerator() : this.iterator();
      iter.forEach(this._world.selfManager.askAgent(f));
      if (typeof (base = this._world.selfManager.self()).isDead === "function" ? base.isDead() : void 0) {
        throw new Death;
      }
    };

    AbstractAgentSet.prototype.atPoints = function(points) {
      var getPatchAt, getSelf;
      getSelf = (function(_this) {
        return function() {
          return _this._world.selfManager.self();
        };
      })(this);
      getPatchAt = (function(_this) {
        return function(x, y) {
          return _this._world.getPatchAt(x, y);
        };
      })(this);
      return require('./agentset/atpoints')(this._world.dump, getSelf, getPatchAt).call(this, points);
    };

    AbstractAgentSet.prototype.contains = function(item) {
      return this._unsafeIterator().contains(item);
    };

    AbstractAgentSet.prototype.copyWithNewAgents = function(agents) {
      return this._generateFrom(agents);
    };

    AbstractAgentSet.prototype.exists = function(pred) {
      return this._unsafeIterator().exists(pred);
    };

    AbstractAgentSet.prototype.filter = function(pred) {
      return this._generateFrom(this._unsafeIterator().filter(pred));
    };

    AbstractAgentSet.prototype.forEach = function(f) {
      this.iterator().forEach(f);
    };

    AbstractAgentSet.prototype.getSpecialName = function() {
      return this._specialName;
    };

    AbstractAgentSet.prototype.isEmpty = function() {
      return this.size() === 0;
    };

    AbstractAgentSet.prototype.iterator = function() {
      return new Iterator(this._agentArr.slice(0));
    };

    AbstractAgentSet.prototype._unsafeIterator = function() {
      return new Iterator(this._agentArr);
    };

    AbstractAgentSet.prototype.maxesBy = function(f) {
      return this.copyWithNewAgents(this._findMaxesBy(f));
    };

    AbstractAgentSet.prototype.maxNOf = function(n, f) {
      if (n > this.size()) {
        throw new Error("Requested " + n + " random agents from a set of only " + (this.size()) + " agents.");
      }
      if (n < 0) {
        throw new Error("First input to MAX-N-OF can't be negative.");
      }
      return this._findBestNOf(n, f, function(x, y) {
        if (x === y) {
          return 0;
        } else if (x > y) {
          return -1;
        } else {
          return 1;
        }
      });
    };

    AbstractAgentSet.prototype.maxOneOf = function(f) {
      return this._randomOneOf(this._findMaxesBy(f));
    };

    AbstractAgentSet.prototype.minNOf = function(n, f) {
      if (n > this.size()) {
        throw new Error("Requested " + n + " random agents from a set of only " + (this.size()) + " agents.");
      }
      if (n < 0) {
        throw new Error("First input to MIN-N-OF can't be negative.");
      }
      return this._findBestNOf(n, f, function(x, y) {
        if (x === y) {
          return 0;
        } else if (x < y) {
          return -1;
        } else {
          return 1;
        }
      });
    };

    AbstractAgentSet.prototype.minOneOf = function(f) {
      return this._randomOneOf(this._findMinsBy(f));
    };

    AbstractAgentSet.prototype.minsBy = function(f) {
      return this.copyWithNewAgents(this._findMinsBy(f));
    };

    AbstractAgentSet.prototype.projectionBy = function(f) {
      return this.shufflerator().map(this._world.selfManager.askAgent(f));
    };

    AbstractAgentSet.prototype.randomAgent = function() {
      var choice, count, iter;
      iter = this._unsafeIterator();
      count = iter.size();
      if (count === 0) {
        return Nobody;
      } else {
        choice = this._world.rng.nextInt(count);
        return iter.nthItem(choice);
      }
    };

    AbstractAgentSet.prototype.shuffled = function() {
      return this.copyWithNewAgents(this.shufflerator().toArray());
    };

    AbstractAgentSet.prototype.shufflerator = function() {
      return new Shufflerator(this.toArray(), (function(agent) {
        return (agent != null ? agent.id : void 0) >= 0;
      }), this._world.rng.nextInt);
    };

    AbstractAgentSet.prototype.size = function() {
      return this._unsafeIterator().size();
    };

    AbstractAgentSet.prototype.sort = function() {
      if (this.isEmpty()) {
        return this.toArray();
      } else {
        return stableSort(this._unsafeIterator().toArray())(function(x, y) {
          return x.compare(y).toInt;
        });
      }
    };

    AbstractAgentSet.prototype.sortOn = function(f) {
      return projectionSort(this.shufflerator().toArray())(f);
    };

    AbstractAgentSet.prototype.toArray = function() {
      this._agentArr = this._unsafeIterator().toArray();
      return this._agentArr.slice(0);
    };

    AbstractAgentSet.prototype.toString = function() {
      var ref1, ref2;
      return (ref1 = (ref2 = this._specialName) != null ? ref2.toLowerCase() : void 0) != null ? ref1 : "(agentset, " + (this.size()) + " " + this._agentTypeName + ")";
    };

    AbstractAgentSet.prototype._findBestNOf = function(n, f, cStyleComparator) {
      var appendAgent, ask, best, collectWinners, groupByValue, ref1, valueToAgentsMap;
      ask = this._world.selfManager.askAgent(f);
      groupByValue = function(acc, agent) {
        var entry, result;
        result = ask(agent);
        if (NLType(result).isNumber()) {
          entry = acc[result];
          if (entry != null) {
            entry.push(agent);
          } else {
            acc[result] = [agent];
          }
        }
        return acc;
      };
      appendAgent = function(arg, agent) {
        var numAdded, winners;
        winners = arg[0], numAdded = arg[1];
        if (numAdded < n) {
          winners.push(agent);
          return [winners, numAdded + 1];
        } else {
          return [winners, numAdded];
        }
      };
      collectWinners = function(arg, agents) {
        var numAdded, winners;
        winners = arg[0], numAdded = arg[1];
        if (numAdded < n) {
          return foldl(appendAgent)([winners, numAdded])(agents);
        } else {
          return [winners, numAdded];
        }
      };
      valueToAgentsMap = foldl(groupByValue)({})(this.shufflerator().toArray());
      ref1 = pipeline(keys, map(parseFloat), (function(x) {
        return x.sort(cStyleComparator);
      }), map(function(value) {
        return valueToAgentsMap[value];
      }), foldl(collectWinners)([[], 0]))(valueToAgentsMap), best = ref1[0], ref1[1];
      return this._generateFrom(best);
    };

    AbstractAgentSet.prototype._randomOneOf = function(agents) {
      if (agents.length === 0) {
        return Nobody;
      } else {
        return agents[this._world.rng.nextInt(agents.length)];
      }
    };

    AbstractAgentSet.prototype._findBestOf = function(worstPossible, findIsBetter, f) {
      var foldFunc, ref1, winners;
      foldFunc = (function(_this) {
        return function(arg, agent) {
          var currentBest, currentWinners, result;
          currentBest = arg[0], currentWinners = arg[1];
          result = _this._world.selfManager.askAgent(f)(agent);
          if (result === currentBest) {
            currentWinners.push(agent);
            return [currentBest, currentWinners];
          } else if (NLType(result).isNumber() && findIsBetter(result, currentBest)) {
            return [result, [agent]];
          } else {
            return [currentBest, currentWinners];
          }
        };
      })(this);
      ref1 = foldl(foldFunc)([worstPossible, []])(this._unsafeIterator().toArray()), ref1[0], winners = ref1[1];
      return winners;
    };

    AbstractAgentSet.prototype._findMaxesBy = function(f) {
      return this._findBestOf(-Infinity, (function(result, currentBest) {
        return result > currentBest;
      }), f);
    };

    AbstractAgentSet.prototype._findMinsBy = function(f) {
      return this._findBestOf(Infinity, (function(result, currentBest) {
        return result < currentBest;
      }), f);
    };

    AbstractAgentSet.prototype._generateFrom = function(newAgentArr) {
      return new this.constructor(newAgentArr, this._world);
    };

    AbstractAgentSet.prototype._optimalOtherWith = function(f) {
      var filterer, self;
      self = this._world.selfManager.self();
      filterer = function(x) {
        if (x !== self) {
          return Iterator.boolOrError(x, x.projectionBy(f));
        } else {
          return false;
        }
      };
      return this.copyWithNewAgents(this._unsafeIterator().filter(filterer));
    };

    AbstractAgentSet.prototype._optimalOneOfWith = function(f) {
      var finder;
      finder = function(x) {
        var y;
        return y = Iterator.boolOrError(x, x.projectionBy(f));
      };
      return this.shufflerator().find(finder, Nobody);
    };

    AbstractAgentSet.prototype._optimalAnyWith = function(f) {
      return this.exists(this._world.selfManager.askAgent(f));
    };

    AbstractAgentSet.prototype._optimalAnyOtherWith = function(f) {
      var checker, self;
      self = this._world.selfManager.self();
      checker = function(x) {
        return x !== self && Iterator.boolOrError(x, x.projectionBy(f));
      };
      return this.exists(checker);
    };

    AbstractAgentSet.prototype._optimalCountOtherWith = function(f) {
      var filterer, self;
      self = this._world.selfManager.self();
      filterer = function(x) {
        return x !== self && Iterator.boolOrError(x, x.projectionBy(f));
      };
      return this._unsafeIterator().filter(filterer).length;
    };

    return AbstractAgentSet;

  })();

}).call(this);

},{"./agentset/atpoints":"engine/core/agentset/atpoints","./projectionsort":"engine/core/projectionsort","./typechecker":"engine/core/typechecker","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/object":"brazier/object","util/exception":"util/exception","util/iterator":"util/iterator","util/shufflerator":"util/shufflerator","util/stablesort":"util/stablesort"}],"engine/core/agentset/atpoints":[function(require,module,exports){
(function() {
  var NLType, filter, flatMap, genPatchGrabber, getPatchesAtPoints, map, pipeline, ref, unique;

  NLType = require('../typechecker');

  ref = require('brazierjs/array'), filter = ref.filter, flatMap = ref.flatMap, map = ref.map, unique = ref.unique;

  pipeline = require('brazierjs/function').pipeline;

  genPatchGrabber = function(self, worldPatchAt) {
    if (self === 0) {
      return worldPatchAt;
    } else if (NLType(self).isTurtle() || NLType(self).isPatch()) {
      return self.patchAt;
    } else {
      return function() {
        return Nobody;
      };
    }
  };

  getPatchesAtPoints = function(dump, patchAt, points) {
    var f;
    f = function(point) {
      if (NLType(point).isList() && point.length === 2 && NLType(point[0]).isNumber() && NLType(point[1]).isNumber()) {
        return patchAt.apply(null, point);
      } else {
        throw new Error("Invalid list of points: " + (dump(points)));
      }
    };
    return pipeline(map(f), filter(function(x) {
      return x !== Nobody;
    }))(points);
  };

  module.exports = function(dump, getSelf, getPatchAt) {
    return function(points) {
      var breedName, copyThatFloppy, filterContaining, newAgents, patchAt, patches, turtlesOnPatches, upperBreedName;
      filterContaining = filter((function(_this) {
        return function(x) {
          return _this.contains(x);
        };
      })(this));
      breedName = this.getSpecialName();
      patchAt = genPatchGrabber(getSelf(), getPatchAt);
      patches = getPatchesAtPoints(dump, patchAt, points);
      newAgents = NLType(this).isPatchSet() ? breedName === "patches" ? patches : filterContaining(patches) : NLType(this).isTurtleSet() ? (turtlesOnPatches = pipeline(flatMap(function(p) {
        return p.turtlesHere().toArray();
      }), unique)(patches), breedName === "turtles" ? turtlesOnPatches : breedName != null ? (upperBreedName = breedName.toUpperCase(), filter(function(x) {
        return upperBreedName === x.getBreedName();
      })(turtlesOnPatches)) : filterContaining(turtlesOnPatches)) : [];
      copyThatFloppy = (function(_this) {
        return function(x) {
          return _this.copyWithNewAgents.call(_this, x);
        };
      })(this);
      return pipeline(unique, copyThatFloppy)(newAgents);
    };
  };

}).call(this);

},{"../typechecker":"engine/core/typechecker","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function"}],"engine/core/agenttoint":[function(require,module,exports){
(function() {
  var NLType;

  NLType = require('./typechecker');

  module.exports = function(agent) {
    var type;
    type = NLType(agent);
    if (type.isTurtle()) {
      return 1;
    } else if (type.isPatch()) {
      return 2;
    } else if (type.isLink()) {
      return 3;
    } else {
      return 0;
    }
  };

}).call(this);

},{"./typechecker":"engine/core/typechecker"}],"engine/core/breedmanager":[function(require,module,exports){
(function() {
  var Breed, BreedManager, count, foldl, getNextOrdinal, isEmpty, last, map, pipeline, ref, sortedIndexBy, toObject, values;

  ref = require('brazierjs/array'), foldl = ref.foldl, isEmpty = ref.isEmpty, last = ref.last, map = ref.map, sortedIndexBy = ref.sortedIndexBy, toObject = ref.toObject;

  pipeline = require('brazierjs/function').pipeline;

  values = require('brazierjs/object').values;

  count = 0;

  getNextOrdinal = function() {
    return count++;
  };

  Breed = (function() {
    Breed.prototype.ordinal = void 0;

    function Breed(name1, singular, _manager, varNames, _isDirectedLinkBreed, _shape, members) {
      this.name = name1;
      this.singular = singular;
      this._manager = _manager;
      this.varNames = varNames != null ? varNames : [];
      this._isDirectedLinkBreed = _isDirectedLinkBreed;
      this._shape = _shape != null ? _shape : void 0;
      this.members = members != null ? members : [];
      this.ordinal = getNextOrdinal();
    }

    Breed.prototype.getShape = function() {
      var ref1;
      return (ref1 = this._shape) != null ? ref1 : (this.isLinky() ? this._manager.links()._shape : this._manager.turtles()._shape);
    };

    Breed.prototype.setShape = function(newShape) {
      this._shape = newShape;
    };

    Breed.prototype.add = function(newAgent) {
      var howManyToThrowOut, whatToInsert;
      if (isEmpty(this.members) || last(this.members).id < newAgent.id) {
        this.members.push(newAgent);
      } else {
        this.members.splice(this._getAgentIndex(newAgent), howManyToThrowOut = 0, whatToInsert = newAgent);
      }
    };

    Breed.prototype.contains = function(agent) {
      return this.members.indexOf(agent) !== -1;
    };

    Breed.prototype.remove = function(agent) {
      var howManyToThrowOut;
      this.members.splice(this._getAgentIndex(agent), howManyToThrowOut = 1);
    };

    Breed.prototype.isLinky = function() {
      return this._isDirectedLinkBreed != null;
    };

    Breed.prototype.isUndirected = function() {
      return this._isDirectedLinkBreed === false;
    };

    Breed.prototype.isDirected = function() {
      return this._isDirectedLinkBreed === true;
    };

    Breed.prototype._getAgentIndex = function(agent) {
      return sortedIndexBy(function(a) {
        return a.id;
      })(this.members)(agent);
    };

    return Breed;

  })();

  module.exports = BreedManager = (function() {
    BreedManager.prototype._breeds = void 0;

    BreedManager.prototype._singularBreeds = void 0;

    function BreedManager(breedObjs, turtlesOwns, linksOwns) {
      var defaultBreeds;
      if (turtlesOwns == null) {
        turtlesOwns = [];
      }
      if (linksOwns == null) {
        linksOwns = [];
      }
      defaultBreeds = {
        TURTLES: new Breed("TURTLES", "turtle", this, turtlesOwns, void 0, "default"),
        LINKS: new Breed("LINKS", "link", this, linksOwns, false, "default")
      };
      this._breeds = foldl((function(_this) {
        return function(acc, breedObj) {
          var ref1, trueName, trueSingular, trueVarNames;
          trueName = breedObj.name.toUpperCase();
          trueSingular = breedObj.singular.toLowerCase();
          trueVarNames = (ref1 = breedObj.varNames) != null ? ref1 : [];
          acc[trueName] = new Breed(trueName, trueSingular, _this, trueVarNames, breedObj.isDirected);
          return acc;
        };
      })(this))(defaultBreeds)(breedObjs);
      this._singularBreeds = pipeline(values, map(function(b) {
        return [b.singular, b];
      }), toObject)(this._breeds);
    }

    BreedManager.prototype.breeds = function() {
      return this._breeds;
    };

    BreedManager.prototype.orderedBreeds = function() {
      if (this._orderedBreeds == null) {
        this._orderedBreeds = Object.getOwnPropertyNames(this._breeds).sort((function(_this) {
          return function(a, b) {
            return _this._breeds[a].ordinal - _this._breeds[b].ordinal;
          };
        })(this));
      }
      return this._orderedBreeds;
    };

    BreedManager.prototype.orderedLinkBreeds = function() {
      if (this._orderedLinkBreeds == null) {
        this._orderedLinkBreeds = this.orderedBreeds().filter((function(_this) {
          return function(b) {
            return _this._breeds[b].isLinky();
          };
        })(this));
      }
      return this._orderedLinkBreeds;
    };

    BreedManager.prototype.orderedTurtleBreeds = function() {
      if (this._orderedTurtleBreeds == null) {
        this._orderedTurtleBreeds = this.orderedBreeds().filter((function(_this) {
          return function(b) {
            return !_this._breeds[b].isLinky();
          };
        })(this));
      }
      return this._orderedTurtleBreeds;
    };

    BreedManager.prototype.get = function(name) {
      return this._breeds[name.toUpperCase()];
    };

    BreedManager.prototype.getSingular = function(name) {
      return this._singularBreeds[name.toLowerCase()];
    };

    BreedManager.prototype.setDefaultShape = function(breedName, shape) {
      this.get(breedName).setShape(shape.toLowerCase());
    };

    BreedManager.prototype.setUnbreededLinksUndirected = function() {
      this.links()._isDirectedLinkBreed = false;
    };

    BreedManager.prototype.setUnbreededLinksDirected = function() {
      this.links()._isDirectedLinkBreed = true;
    };

    BreedManager.prototype.turtles = function() {
      return this.get("TURTLES");
    };

    BreedManager.prototype.links = function() {
      return this.get("LINKS");
    };

    return BreedManager;

  })();

}).call(this);

},{"brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/object":"brazier/object"}],"engine/core/colormodel":[function(require,module,exports){
(function() {
  var BaseColors, BaseRGBs, ColorMax, JSType, NLMath, NamesToIndicesMap, RGBCache, RGBMap, StrictMath, attenuate, attenuateRGB, componentsToKey, foldl, keyToComponents, map, pairs, pipeline, rangeUntil, ref, ref1;

  NLMath = require('util/nlmath');

  JSType = require('util/typechecker');

  StrictMath = require('shim/strictmath');

  ref = require('brazierjs/array'), foldl = ref.foldl, map = ref.map;

  pipeline = require('brazierjs/function').pipeline;

  rangeUntil = require('brazierjs/number').rangeUntil;

  pairs = require('brazierjs/object').pairs;

  attenuate = function(lowerBound, upperBound) {
    return function(x) {
      if (x < lowerBound) {
        return lowerBound;
      } else if (x > upperBound) {
        return upperBound;
      } else {
        return x;
      }
    };
  };

  attenuateRGB = attenuate(0, 255);

  componentsToKey = function(r, g, b) {
    return r + "_" + g + "_" + b;
  };

  keyToComponents = function(key) {
    return key.split('_').map(parseFloat);
  };

  ColorMax = 140;

  BaseColors = map(function(n) {
    return (n * 10) + 5;
  })(rangeUntil(0)(ColorMax / 10));

  NamesToIndicesMap = (function() {
    var color, i, j, len, ref1, temp;
    temp = {};
    ref1 = ['gray', 'red', 'orange', 'brown', 'yellow', 'green', 'lime', 'turqoise', 'cyan', 'sky', 'blue', 'violet', 'magenta', 'pink', 'black', 'white'];
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      color = ref1[i];
      temp[color] = i;
    }
    return temp;
  })();

  BaseRGBs = [[140, 140, 140], [215, 48, 39], [241, 105, 19], [156, 109, 70], [237, 237, 47], [87, 176, 58], [42, 209, 57], [27, 158, 119], [82, 196, 196], [43, 140, 190], [50, 92, 168], [123, 78, 163], [166, 25, 105], [224, 126, 149], [0, 0, 0], [255, 255, 255]];

  ref1 = (function() {
    var baseIndex, clamp, colorTimesTen, finalRGB, rgb, rgbCache, rgbMap, step;
    rgbMap = {};
    rgbCache = (function() {
      var j, ref1, results;
      results = [];
      for (colorTimesTen = j = 0, ref1 = ColorMax * 10; 0 <= ref1 ? j < ref1 : j > ref1; colorTimesTen = 0 <= ref1 ? ++j : --j) {
        finalRGB = colorTimesTen === 0 ? [0, 0, 0] : colorTimesTen === 99 ? [255, 255, 255] : (baseIndex = StrictMath.floor(colorTimesTen / 100), rgb = BaseRGBs[baseIndex], step = (colorTimesTen % 100 - 50) / 50.48 + 0.012, clamp = step <= 0 ? function(x) {
          return x;
        } : function(x) {
          return 0xFF - x;
        }, rgb.map(function(x) {
          return x + StrictMath.truncate(clamp(x) * step);
        }));
        rgbMap[componentsToKey.apply(null, finalRGB)] = colorTimesTen / 10;
        results.push(finalRGB);
      }
      return results;
    })();
    return [rgbCache, rgbMap];
  })(), RGBCache = ref1[0], RGBMap = ref1[1];

  module.exports = {
    COLOR_MAX: ColorMax,
    BASE_COLORS: BaseColors,
    areRelatedByShade: function(color1, color2) {
      return this._colorIntegral(color1) === this._colorIntegral(color2);
    },
    colorToRGB: function(color) {
      var type;
      type = JSType(color);
      if (type.isNumber()) {
        return RGBCache[StrictMath.floor(this.wrapColor(color) * 10)];
      } else if (type.isArray()) {
        return color.map(StrictMath.round);
      } else if (type.isString()) {
        return this._nameToRGB(color);
      } else {
        throw new Error("Unrecognized color format: " + color);
      }
    },
    colorToHSB: function(color) {
      var b, g, r, ref2, type;
      type = JSType(color);
      ref2 = (function() {
        if (type.isNumber()) {
          return this.colorToRGB(color);
        } else if (type.isArray()) {
          return color;
        } else {
          throw new Error("Unrecognized color format: " + color);
        }
      }).call(this), r = ref2[0], g = ref2[1], b = ref2[2];
      return this.rgbToHSB(r, g, b);
    },
    genRGBFromComponents: function(r, g, b) {
      return [r, g, b].map(attenuateRGB);
    },
    hsbToRGB: function(rawH, rawS, rawB) {
      var b, f, h, i, p, q, rgb, s, t;
      h = attenuate(0, 360)(rawH) / 360;
      s = attenuate(0, 100)(rawS) / 100;
      b = attenuate(0, 100)(rawB) / 100;
      i = StrictMath.floor(h * 6);
      f = h * 6 - i;
      p = b * (1 - s);
      q = b * (1 - f * s);
      t = b * (1 - (1 - f) * s);
      rgb = (function() {
        switch (i % 6) {
          case 0:
            return [b, t, p];
          case 1:
            return [q, b, p];
          case 2:
            return [p, b, t];
          case 3:
            return [p, q, b];
          case 4:
            return [t, p, b];
          case 5:
            return [b, p, q];
        }
      })();
      return rgb.map(function(x) {
        return StrictMath.round(x * 255);
      });
    },
    nearestColorNumberOfHSB: function(h, s, b) {
      return this.nearestColorNumberOfRGB.apply(this, this.hsbToRGB(h, s, b));
    },
    nearestColorNumberOfRGB: function(r, g, b) {
      var blue, colorNumber, green, red, ref2;
      red = attenuateRGB(r);
      green = attenuateRGB(g);
      blue = attenuateRGB(b);
      colorNumber = (ref2 = RGBMap[componentsToKey(red, green, blue)]) != null ? ref2 : this._estimateColorNumber(red, green, blue);
      return NLMath.validateNumber(colorNumber);
    },
    nthColor: function(n) {
      var index;
      index = n % BaseColors.length;
      return BaseColors[index];
    },
    randomColor: function(nextInt) {
      var index;
      index = nextInt(BaseColors.length);
      return BaseColors[index];
    },
    rgbToHSB: function(rawR, rawG, rawB) {
      var b, brightness, difference, g, hue, max, min, r, saturation;
      r = attenuateRGB(rawR);
      g = attenuateRGB(rawG);
      b = attenuateRGB(rawB);
      max = NLMath.max(r, g, b);
      min = NLMath.min(r, g, b);
      difference = max - min;
      hue = (function() {
        switch (max) {
          case min:
            return 0;
          case r:
            return ((g - b) + difference * (g < b ? 6 : 0)) / (6 * difference);
          case g:
            return ((b - r) + difference * 2) / (6 * difference);
          case b:
            return ((r - g) + difference * 4) / (6 * difference);
        }
      })();
      saturation = max === 0 ? 0 : difference / max;
      brightness = max / 255;
      return [hue * 360, saturation * 100, brightness * 100].map(function(x) {
        return NLMath.precision(x, 3);
      });
    },
    wrapColor: function(color) {
      var modColor;
      if (JSType(color).isArray()) {
        return color;
      } else {
        modColor = color % ColorMax;
        if (modColor >= 0) {
          return modColor;
        } else {
          return ColorMax + modColor;
        }
      }
    },
    scaleColor: function(color, number, min, max) {
      var finalPercent, percent, percent10, tempmax, tempval;
      percent = min > max ? number < max ? 1.0 : number > min ? 0.0 : (tempval = min - number, tempmax = min - max, tempval / tempmax) : number > max ? 1.0 : number < min ? 0.0 : (tempval = number - min, tempmax = max - min, tempval / tempmax);
      percent10 = percent * 10;
      finalPercent = percent10 >= 9.9999 ? 9.9999 : percent10 < 0 ? 0 : percent10;
      return this._colorIntegral(color) * 10 + finalPercent;
    },
    _colorIntegral: function(color) {
      return StrictMath.floor(this.wrapColor(color) / 10);
    },
    _nameToRGB: function(name) {
      return BaseRGBs[NamesToIndicesMap[name]];
    },
    _estimateColorNumber: function(r, g, b) {
      var f;
      f = (function(_this) {
        return function(acc, arg) {
          var cb, cg, cr, dist, k, ref2, v;
          k = arg[0], v = arg[1];
          ref2 = keyToComponents(k), cr = ref2[0], cg = ref2[1], cb = ref2[2];
          dist = _this._colorDistance(r, g, b, cr, cg, cb);
          if (dist < acc[1]) {
            return [v, dist];
          } else {
            return acc;
          }
        };
      })(this);
      return pipeline(pairs, foldl(f)([0, Number.MAX_VALUE]))(RGBMap)[0];
    },
    _colorDistance: function(r1, g1, b1, r2, g2, b2) {
      var bDiff, gDiff, rDiff, rMean;
      rMean = r1 + r2 / 2;
      rDiff = r1 - r2;
      gDiff = g1 - g2;
      bDiff = b1 - b2;
      return (((512 + rMean) * rDiff * rDiff) >> 8) + 4 * gDiff * gDiff + (((767 - rMean) * bDiff * bDiff) >> 8);
    }
  };

}).call(this);

},{"brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/number":"brazier/number","brazierjs/object":"brazier/object","shim/strictmath":"shim/strictmath","util/nlmath":"util/nlmath","util/typechecker":"util/typechecker"}],"engine/core/hubnetmanager":[function(require,module,exports){
(function() {
  var HubnetManager,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports = HubnetManager = (function() {
    function HubnetManager() {
      this.hubnetBroadcast = bind(this.hubnetBroadcast, this);
      this.hubnetSend = bind(this.hubnetSend, this);
      this.hubnetFetchMessage = bind(this.hubnetFetchMessage, this);
      this.hubnetMessageWaiting = false;
      this.hubnetEnterMessage = false;
      this.hubnetExitMessage = false;
      this.hubnetMessage = "";
      this.hubnetMessageSource = "";
      this.hubnetMessageTag = "";
    }

    HubnetManager.prototype.hubnetFetchMessage = function() {
      this.processCommand(commandQueue.shift());
    };

    HubnetManager.prototype.hubnetSend = function(messageSource, messageTag, message) {
      socket.emit('send reporter', {
        hubnetMessageSource: messageSource,
        hubnetMessageTag: messageTag,
        hubnetMessage: message
      });
    };

    HubnetManager.prototype.hubnetBroadcast = function(messageTag, message) {
      socket.emit('send reporter', {
        hubnetMessageSource: "all-users",
        hubnetMessageTag: messageTag,
        hubnetMessage: message
      });
    };

    HubnetManager.prototype.processCommand = function(m) {
      if (commandQueue.length === 0) {
        world.hubnetManager.hubnetMessageWaiting = false;
      }
      world.hubnetManager.hubnetEnterMessage = false;
      world.hubnetManager.hubnetExitMessage = false;
      world.hubnetManager.hubnetMessageSource = m.messageSource;
      world.hubnetManager.hubnetMessageTag = m.messageTag;
      world.hubnetManager.hubnetMessage = m.message;
      if (m.messageTag === 'hubnet-enter-message') {
        world.hubnetManager.hubnetEnterMessage = true;
      }
      if (m.messageTag === 'hubnet-exit-message') {
        world.hubnetManager.hubnetExitMessage = true;
      }
    };

    return HubnetManager;

  })();

}).call(this);

},{}],"engine/core/link/linkvariables":[function(require,module,exports){
(function() {
  var ColorModel, ImmutableVariableSpec, MutableVariableSpec, NLType, Setters, VariableSpecs, ref, setBreed, setColor, setEnd1, setEnd2, setIsHidden, setLabel, setLabelColor, setShape, setThickness, setTieMode;

  ColorModel = require('engine/core/colormodel');

  NLType = require('../typechecker');

  ref = require('../structure/variablespec'), ImmutableVariableSpec = ref.ImmutableVariableSpec, MutableVariableSpec = ref.MutableVariableSpec;

  setShape = function(shape) {
    this._shape = shape.toLowerCase();
    this._genVarUpdate("shape");
  };

  setBreed = function(breed) {
    var newNames, oldNames, ref1, ref2, ref3, specialName, trueBreed, type;
    type = NLType(breed);
    trueBreed = (function() {
      if (type.isString()) {
        return this.world.breedManager.get(breed);
      } else if (type.isAgentSet()) {
        specialName = breed.getSpecialName();
        if ((specialName != null) && this.world.breedManager.get(specialName).isLinky()) {
          return this.world.breedManager.get(specialName);
        } else {
          throw new Error("You can't set BREED to a non-link-breed agentset.");
        }
      } else {
        return breed;
      }
    }).call(this);
    this.world.linkManager.trackBreedChange(this, trueBreed, (ref1 = (ref2 = this._breed) != null ? ref2.name : void 0) != null ? ref1 : "");
    if (this._breed !== trueBreed) {
      trueBreed.add(this);
      if ((ref3 = this._breed) != null) {
        ref3.remove(this);
      }
      newNames = this._varNamesForBreed(trueBreed);
      oldNames = this._varNamesForBreed(this._breed);
      this._varManager.refineBy(oldNames, newNames);
    }
    this._breed = trueBreed;
    this._genVarUpdate("breed");
    setShape.call(this, trueBreed.getShape());
    this._refreshName();
    if (!this.world.breedManager.links().contains(this)) {
      this.world.breedManager.links().add(this);
    }
  };

  setColor = function(color) {
    this._color = ColorModel.wrapColor(color);
    this._genVarUpdate("color");
  };

  setEnd1 = function(turtle) {
    this.end1 = turtle;
    this._genVarUpdate("end1");
  };

  setEnd2 = function(turtle) {
    this.end2 = turtle;
    this._genVarUpdate("end2");
  };

  setIsHidden = function(isHidden) {
    this._isHidden = isHidden;
    this._genVarUpdate("hidden?");
  };

  setLabel = function(label) {
    this._label = label;
    this._genVarUpdate("label");
  };

  setLabelColor = function(color) {
    this._labelcolor = ColorModel.wrapColor(color);
    this._genVarUpdate("label-color");
  };

  setThickness = function(thickness) {
    this._thickness = thickness;
    this._genVarUpdate("thickness");
  };

  setTieMode = function(mode) {
    this.tiemode = mode;
    this._genVarUpdate("tie-mode");
  };

  Setters = {
    setBreed: setBreed,
    setColor: setColor,
    setEnd1: setEnd1,
    setEnd2: setEnd2,
    setIsHidden: setIsHidden,
    setLabel: setLabel,
    setLabelColor: setLabelColor,
    setShape: setShape,
    setThickness: setThickness,
    setTieMode: setTieMode
  };

  VariableSpecs = [
    new MutableVariableSpec('breed', (function() {
      return this._getLinksByBreedName(this._breed.name);
    }), setBreed), new MutableVariableSpec('color', (function() {
      return this._color;
    }), setColor), new MutableVariableSpec('end1', (function() {
      return this.end1;
    }), setEnd1), new MutableVariableSpec('end2', (function() {
      return this.end2;
    }), setEnd2), new MutableVariableSpec('hidden?', (function() {
      return this._isHidden;
    }), setIsHidden), new MutableVariableSpec('label', (function() {
      return this._label;
    }), setLabel), new MutableVariableSpec('label-color', (function() {
      return this._labelcolor;
    }), setLabelColor), new MutableVariableSpec('shape', (function() {
      return this._shape;
    }), setShape), new MutableVariableSpec('thickness', (function() {
      return this._thickness;
    }), setThickness), new MutableVariableSpec('tie-mode', (function() {
      return this.tiemode;
    }), setTieMode)
  ];

  module.exports = {
    Setters: Setters,
    VariableSpecs: VariableSpecs
  };

}).call(this);

},{"../structure/variablespec":"engine/core/structure/variablespec","../typechecker":"engine/core/typechecker","engine/core/colormodel":"engine/core/colormodel"}],"engine/core/linkset":[function(require,module,exports){
(function() {
  var AbstractAgentSet, DeadSkippingIterator, JSType, LinkSet,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  AbstractAgentSet = require('./abstractagentset');

  DeadSkippingIterator = require('./structure/deadskippingiterator');

  JSType = require('util/typechecker');

  module.exports = LinkSet = (function(superClass) {
    extend(LinkSet, superClass);

    function LinkSet(_agents, world, specialName) {
      this._agents = _agents;
      LinkSet.__super__.constructor.call(this, this._unwrap(this._agents), world, "links", specialName);
    }

    LinkSet.prototype.iterator = function() {
      return new DeadSkippingIterator(this._unwrap(this._agents, true));
    };

    LinkSet.prototype._unsafeIterator = function() {
      return new DeadSkippingIterator(this._unwrap(this._agents, false));
    };

    LinkSet.prototype._unwrap = function(agents, copy) {
      if (JSType(agents).isFunction()) {
        return agents();
      } else if (copy) {
        return agents.slice(0);
      } else {
        return agents;
      }
    };

    return LinkSet;

  })(AbstractAgentSet);

}).call(this);

},{"./abstractagentset":"engine/core/abstractagentset","./structure/deadskippingiterator":"engine/core/structure/deadskippingiterator","util/typechecker":"util/typechecker"}],"engine/core/link":[function(require,module,exports){
(function() {
  var AbstractAgentSet, AgentException, ColorModel, Death, EQ, ExtraVariableSpec, GT, LT, Link, Setters, Stamp, StampErase, StampMode, TurtleSet, VariableManager, VariableSpecs, linkCompare, ref, ref1, ref2;

  AbstractAgentSet = require('./abstractagentset');

  ColorModel = require('./colormodel');

  linkCompare = require('./structure/linkcompare');

  VariableManager = require('./structure/variablemanager');

  TurtleSet = require('./turtleset');

  ref = require('util/comparator'), EQ = ref.EQUALS, GT = ref.GREATER_THAN, LT = ref.LESS_THAN;

  ref1 = require('util/exception'), AgentException = ref1.AgentException, Death = ref1.DeathInterrupt;

  ref2 = require('./link/linkvariables'), Setters = ref2.Setters, VariableSpecs = ref2.VariableSpecs;

  ExtraVariableSpec = require('./structure/variablespec').ExtraVariableSpec;

  StampMode = (function() {
    function StampMode(name1) {
      this.name = name1;
    }

    return StampMode;

  })();

  Stamp = new StampMode("normal");

  StampErase = new StampMode("erase");

  module.exports = Link = (function() {
    Link.prototype._breed = void 0;

    Link.prototype._name = void 0;

    Link.prototype._updateVarsByName = void 0;

    Link.prototype._varManager = void 0;

    function Link(id, isDirected, end1, end2, world, genUpdate, _registerDeath, _registerRemoval, _registerLinkStamp, _getLinksByBreedName, breed, _color, _isHidden, _label, _labelcolor, _shape, _thickness, tiemode) {
      var varNames;
      this.id = id;
      this.isDirected = isDirected;
      this.end1 = end1;
      this.end2 = end2;
      this.world = world;
      this._registerDeath = _registerDeath;
      this._registerRemoval = _registerRemoval;
      this._registerLinkStamp = _registerLinkStamp;
      this._getLinksByBreedName = _getLinksByBreedName;
      if (breed == null) {
        breed = this.world.breedManager.links();
      }
      this._color = _color != null ? _color : 5;
      this._isHidden = _isHidden != null ? _isHidden : false;
      this._label = _label != null ? _label : "";
      this._labelcolor = _labelcolor != null ? _labelcolor : 9.9;
      this._shape = _shape != null ? _shape : "default";
      this._thickness = _thickness != null ? _thickness : 0;
      this.tiemode = tiemode != null ? tiemode : "none";
      this._updateVarsByName = genUpdate(this);
      varNames = this._varNamesForBreed(breed);
      this._varManager = this._genVarManager(varNames);
      Setters.setBreed.call(this, breed);
      this.end1.linkManager.add(this);
      this.end2.linkManager.add(this);
      this.updateEndRelatedVars();
      this._updateVarsByName("directed?");
    }

    Link.prototype.getBreedName = function() {
      return this._breed.name;
    };

    Link.prototype.getBreedNameSingular = function() {
      return this._breed.singular;
    };

    Link.prototype.getBreedOrdinal = function() {
      return this._breed.ordinal;
    };

    Link.prototype.getName = function() {
      return this._name;
    };

    Link.prototype.getVariable = function(varName) {
      return this._varManager[varName];
    };

    Link.prototype.setVariable = function(varName, value) {
      this._varManager[varName] = value;
    };

    Link.prototype.die = function() {
      this._breed.remove(this);
      if (!this.isDead()) {
        this.end1.linkManager.remove(this);
        this.end2.linkManager.remove(this);
        this._registerRemoval(this);
        this._seppuku();
        this.id = -1;
      }
      throw new Death("Call only from inside an askAgent block");
    };

    Link.prototype.stamp = function() {
      this._drawStamp(Stamp);
    };

    Link.prototype.stampErase = function() {
      this._drawStamp(StampErase);
    };

    Link.prototype.bothEnds = function() {
      return new TurtleSet([this.end1, this.end2], this.world);
    };

    Link.prototype.otherEnd = function() {
      if (this.end1 === this.world.selfManager.myself()) {
        return this.end2;
      } else {
        return this.end1;
      }
    };

    Link.prototype.tie = function() {
      Setters.setTieMode.call(this, "fixed");
    };

    Link.prototype.untie = function() {
      Setters.setTieMode.call(this, "none");
    };

    Link.prototype.updateEndRelatedVars = function() {
      this._updateVarsByName("heading", "size", "midpointx", "midpointy");
    };

    Link.prototype.toString = function() {
      if (!this.isDead()) {
        return "(" + (this.getName()) + ")";
      } else {
        return "nobody";
      }
    };

    Link.prototype.getCoords = function() {
      return [this.getMidpointX(), this.getMidpointY()];
    };

    Link.prototype.getHeading = function() {
      var error, error1;
      try {
        return this.world.topology.towards(this.end1.xcor, this.end1.ycor, this.end2.xcor, this.end2.ycor);
      } catch (error1) {
        error = error1;
        if (error instanceof AgentException) {
          throw new Error("there is no heading of a link whose endpoints are in the same position");
        } else {
          throw error;
        }
      }
    };

    Link.prototype.getMidpointX = function() {
      return this.world.topology.midpointx(this.end1.xcor, this.end2.xcor);
    };

    Link.prototype.getMidpointY = function() {
      return this.world.topology.midpointy(this.end1.ycor, this.end2.ycor);
    };

    Link.prototype.getSize = function() {
      return this.world.topology.distanceXY(this.end1.xcor, this.end1.ycor, this.end2.xcor, this.end2.ycor);
    };

    Link.prototype.isBreed = function(breedName) {
      return this._breed.name.toUpperCase() === breedName.toUpperCase();
    };

    Link.prototype.isDead = function() {
      return this.id === -1;
    };

    Link.prototype.ask = function(f) {
      var base;
      if (!this.isDead()) {
        this.world.selfManager.askAgent(f)(this);
        if (typeof (base = this.world.selfManager.self()).isDead === "function" ? base.isDead() : void 0) {
          throw new Death;
        }
      } else {
        throw new Error("That " + (this.getBreedNameSingular()) + " is dead.");
      }
    };

    Link.prototype.projectionBy = function(f) {
      if (!this.isDead()) {
        return this.world.selfManager.askAgent(f)(this);
      } else {
        throw new Error("That " + this._breed.singular + " is dead.");
      }
    };

    Link.prototype.compare = function(x) {
      switch (linkCompare(this, x)) {
        case -1:
          return LT;
        case 0:
          return EQ;
        case 1:
          return GT;
        default:
          throw new Error("Comparison should only yield an integer within the interval [-1,1]");
      }
    };

    Link.prototype.varNames = function() {
      return this._varManager.names();
    };

    Link.prototype._drawStamp = function(mode) {
      var color, e1x, e1y, e2x, e2y, error, midX, midY, ref3, ref4, stampHeading;
      ref3 = this.end1, e1x = ref3.xcor, e1y = ref3.ycor;
      ref4 = this.end2, e2x = ref4.xcor, e2y = ref4.ycor;
      stampHeading = (function() {
        var error1;
        try {
          return this.world.topology.towards(e1x, e1y, e2x, e2y);
        } catch (error1) {
          error = error1;
          if (error instanceof AgentException) {
            return 0;
          } else {
            throw error;
          }
        }
      }).call(this);
      color = ColorModel.colorToRGB(this._color);
      midX = this.getMidpointX();
      midY = this.getMidpointY();
      this._registerLinkStamp(e1x, e1y, e2x, e2y, midX, midY, stampHeading, color, this._shape, this._thickness, this.isDirected, this.getSize(), this._isHidden, mode.name);
    };

    Link.prototype._refreshName = function() {
      this._name = this._breed.singular + " " + this.end1.id + " " + this.end2.id;
    };

    Link.prototype._varNamesForBreed = function(breed) {
      var linksBreed;
      linksBreed = this.world.breedManager.links();
      if (breed === linksBreed || (breed == null)) {
        return linksBreed.varNames;
      } else {
        return linksBreed.varNames.concat(breed.varNames);
      }
    };

    Link.prototype._seppuku = function() {
      this._registerDeath(this.id);
    };

    Link.prototype._genVarManager = function(extraVarNames) {
      var allSpecs, extraSpecs;
      extraSpecs = extraVarNames.map(function(name) {
        return new ExtraVariableSpec(name);
      });
      allSpecs = VariableSpecs.concat(extraSpecs);
      return new VariableManager(this, allSpecs);
    };

    Link.prototype._genVarUpdate = function(varName) {
      this._updateVarsByName(varName);
    };

    return Link;

  })();

}).call(this);

},{"./abstractagentset":"engine/core/abstractagentset","./colormodel":"engine/core/colormodel","./link/linkvariables":"engine/core/link/linkvariables","./structure/linkcompare":"engine/core/structure/linkcompare","./structure/variablemanager":"engine/core/structure/variablemanager","./structure/variablespec":"engine/core/structure/variablespec","./turtleset":"engine/core/turtleset","util/comparator":"util/comparator","util/exception":"util/exception"}],"engine/core/observer":[function(require,module,exports){
(function() {
  var ExtraVariableSpec, Follow, NLType, Observe, Observer, Ride, VariableManager, Watch, agentToInt, difference, forEach, perspectiveFromNum, perspectiveFromString, perspectiveToNum, perspectiveToString, ref;

  Observe = {};

  Ride = {};

  Follow = {};

  Watch = {};

  agentToInt = require('./agenttoint');

  NLType = require('./typechecker');

  VariableManager = require('./structure/variablemanager');

  ref = require('brazierjs/array'), difference = ref.difference, forEach = ref.forEach;

  ExtraVariableSpec = require('./structure/variablespec').ExtraVariableSpec;

  perspectiveFromNum = function(num) {
    switch (num) {
      case 0:
        return Observe;
      case 1:
        return Ride;
      case 2:
        return Follow;
      case 3:
        return Watch;
      default:
        throw new Error("Invalid perspective number: " + num);
    }
  };

  perspectiveToNum = function(p) {
    switch (p) {
      case Observe:
        return 0;
      case Ride:
        return 1;
      case Follow:
        return 2;
      case Watch:
        return 3;
      default:
        throw new Error("Invalid perspective: " + p);
    }
  };

  perspectiveFromString = function(str) {
    switch (str) {
      case 'observe':
        return Observe;
      case 'ride':
        return Ride;
      case 'follow':
        return Follow;
      case 'watch':
        return Watch;
      default:
        throw new Error("Invalid perspective string: " + str);
    }
  };

  perspectiveToString = function(p) {
    switch (p) {
      case Observe:
        return 'observe';
      case Ride:
        return 'ride';
      case Follow:
        return 'follow';
      case Watch:
        return 'watch';
      default:
        throw new Error("Invalid perspective: " + p);
    }
  };

  module.exports.Perspective = {
    Observe: Observe,
    Ride: Ride,
    Follow: Follow,
    Watch: Watch,
    perspectiveFromNum: perspectiveFromNum,
    perspectiveToNum: perspectiveToNum,
    perspectiveFromString: perspectiveFromString,
    perspectiveToString: perspectiveToString
  };

  module.exports.Observer = Observer = (function() {
    Observer.prototype.id = 0;

    Observer.prototype._varManager = void 0;

    Observer.prototype._perspective = void 0;

    Observer.prototype._targetAgent = void 0;

    Observer.prototype._codeGlobalNames = void 0;

    Observer.prototype._updateVarsByName = void 0;

    function Observer(genUpdate, _globalNames, _interfaceGlobalNames) {
      var globalSpecs;
      this._globalNames = _globalNames;
      this._interfaceGlobalNames = _interfaceGlobalNames;
      this._updateVarsByName = genUpdate(this);
      this.resetPerspective();
      globalSpecs = this._globalNames.map(function(name) {
        return new ExtraVariableSpec(name);
      });
      this._varManager = new VariableManager(this, globalSpecs);
      this._codeGlobalNames = difference(this._globalNames)(this._interfaceGlobalNames);
    }

    Observer.prototype.clearCodeGlobals = function() {
      forEach((function(_this) {
        return function(name) {
          _this._varManager[name] = 0;
        };
      })(this))(this._codeGlobalNames);
    };

    Observer.prototype.follow = function(turtle) {
      this._perspective = Follow;
      this._targetAgent = turtle;
      this._updatePerspective();
    };

    Observer.prototype.getGlobal = function(varName) {
      return this._varManager[varName];
    };

    Observer.prototype.getVariable = function(varName) {
      return this.getGlobal(varName);
    };

    Observer.prototype.getPerspective = function() {
      return this._perspective;
    };

    Observer.prototype.setPerspective = function(perspective, subject) {
      this._perspective = perspective;
      this._targetAgent = subject;
      this._updatePerspective();
    };

    Observer.prototype.resetPerspective = function() {
      this._perspective = Observe;
      this._targetAgent = null;
      this._updatePerspective();
    };

    Observer.prototype.ride = function(turtle) {
      this._perspective = Ride;
      this._targetAgent = turtle;
      this._updatePerspective();
    };

    Observer.prototype.setGlobal = function(varName, value) {
      this._varManager[varName] = value;
    };

    Observer.prototype.setVariable = function(varName, value) {
      this.setGlobal(varName, value);
    };

    Observer.prototype.subject = function() {
      var ref1;
      return (ref1 = this._targetAgent) != null ? ref1 : Nobody;
    };

    Observer.prototype.unfocus = function(turtle) {
      if (this._targetAgent === turtle) {
        this.resetPerspective();
      }
    };

    Observer.prototype.varNames = function() {
      return this._varManager.names();
    };

    Observer.prototype.watch = function(agent) {
      var type;
      type = NLType(agent);
      this._perspective = Watch;
      this._targetAgent = type.isTurtle() || type.isPatch() ? agent : Nobody;
      this._updatePerspective();
    };

    Observer.prototype._updatePerspective = function() {
      this._updateVarsByName("perspective", "targetAgent");
    };

    Observer.prototype._getTargetAgentUpdate = function() {
      if (this._targetAgent != null) {
        return [agentToInt(this._targetAgent), this._targetAgent.id];
      } else {
        return null;
      }
    };

    return Observer;

  })();

}).call(this);

},{"./agenttoint":"engine/core/agenttoint","./structure/variablemanager":"engine/core/structure/variablemanager","./structure/variablespec":"engine/core/structure/variablespec","./typechecker":"engine/core/typechecker","brazierjs/array":"brazier/array"}],"engine/core/patch/patchvariables":[function(require,module,exports){
(function() {
  var ColorModel, ImmutableVariableSpec, MutableVariableSpec, Setters, VariableSpecs, ref, setPcolor, setPlabel, setPlabelColor;

  ColorModel = require('engine/core/colormodel');

  ref = require('../structure/variablespec'), ImmutableVariableSpec = ref.ImmutableVariableSpec, MutableVariableSpec = ref.MutableVariableSpec;

  setPcolor = function(color) {
    var wrappedColor;
    wrappedColor = ColorModel.wrapColor(color);
    if (this._pcolor !== wrappedColor) {
      this._pcolor = wrappedColor;
      this._genVarUpdate("pcolor");
      if (wrappedColor !== 0) {
        this._declareNonBlackPatch();
      }
    }
  };

  setPlabel = function(label) {
    var isEmpty, wasEmpty;
    wasEmpty = this._plabel === "";
    isEmpty = label === "";
    this._plabel = label;
    this._genVarUpdate("plabel");
    if (isEmpty && !wasEmpty) {
      this._decrementPatchLabelCount();
    } else if (!isEmpty && wasEmpty) {
      this._incrementPatchLabelCount();
    }
  };

  setPlabelColor = function(color) {
    this._plabelcolor = ColorModel.wrapColor(color);
    this._genVarUpdate("plabel-color");
  };

  Setters = {
    setPcolor: setPcolor,
    setPlabel: setPlabel,
    setPlabelColor: setPlabelColor
  };

  VariableSpecs = [
    new ImmutableVariableSpec('pxcor', function() {
      return this.pxcor;
    }), new ImmutableVariableSpec('pycor', function() {
      return this.pycor;
    }), new MutableVariableSpec('pcolor', (function() {
      return this._pcolor;
    }), setPcolor), new MutableVariableSpec('plabel', (function() {
      return this._plabel;
    }), setPlabel), new MutableVariableSpec('plabel-color', (function() {
      return this._plabelcolor;
    }), setPlabelColor)
  ];

  module.exports = {
    Setters: Setters,
    VariableSpecs: VariableSpecs
  };

}).call(this);

},{"../structure/variablespec":"engine/core/structure/variablespec","engine/core/colormodel":"engine/core/colormodel"}],"engine/core/patchset":[function(require,module,exports){
(function() {
  var AbstractAgentSet, Iterator, PatchSet,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  AbstractAgentSet = require('./abstractagentset');

  Iterator = require('util/iterator');

  module.exports = PatchSet = (function(superClass) {
    extend(PatchSet, superClass);

    function PatchSet(agents, world, specialName) {
      PatchSet.__super__.constructor.call(this, agents, world, "patches", specialName);
    }

    return PatchSet;

  })(AbstractAgentSet);

}).call(this);

},{"./abstractagentset":"engine/core/abstractagentset","util/iterator":"util/iterator"}],"engine/core/patch":[function(require,module,exports){
(function() {
  var Comparator, Death, ExtraVariableSpec, Patch, Setters, TopologyInterrupt, TurtleSet, VariableManager, VariableSpecs, filter, foldl, ref, ref1, ref2,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  TurtleSet = require('./turtleset');

  VariableManager = require('./structure/variablemanager');

  Comparator = require('util/comparator');

  ref = require('brazierjs/array'), filter = ref.filter, foldl = ref.foldl;

  ref1 = require('util/exception'), Death = ref1.DeathInterrupt, TopologyInterrupt = ref1.TopologyInterrupt;

  ref2 = require('./patch/patchvariables'), Setters = ref2.Setters, VariableSpecs = ref2.VariableSpecs;

  ExtraVariableSpec = require('./structure/variablespec').ExtraVariableSpec;

  module.exports = Patch = (function() {
    Patch.prototype._turtles = void 0;

    Patch.prototype._varManager = void 0;

    function Patch(id, pxcor, pycor, world, _genUpdate, _declareNonBlackPatch, _decrementPatchLabelCount, _incrementPatchLabelCount, _pcolor, _plabel, _plabelcolor) {
      this.id = id;
      this.pxcor = pxcor;
      this.pycor = pycor;
      this.world = world;
      this._genUpdate = _genUpdate;
      this._declareNonBlackPatch = _declareNonBlackPatch;
      this._decrementPatchLabelCount = _decrementPatchLabelCount;
      this._incrementPatchLabelCount = _incrementPatchLabelCount;
      this._pcolor = _pcolor != null ? _pcolor : 0.0;
      this._plabel = _plabel != null ? _plabel : "";
      this._plabelcolor = _plabelcolor != null ? _plabelcolor : 9.9;
      this.patchAt = bind(this.patchAt, this);
      this._turtles = [];
      this._varManager = this._genVarManager(this.world.patchesOwnNames);
    }

    Patch.prototype.getName = function() {
      return "patch " + this.pxcor + " " + this.pycor;
    };

    Patch.prototype.getVariable = function(varName) {
      return this._varManager[varName];
    };

    Patch.prototype.setVariable = function(varName, value) {
      this._varManager[varName] = value;
    };

    Patch.prototype.getPatchVariable = function(varName) {
      return this._varManager[varName];
    };

    Patch.prototype.setPatchVariable = function(varName, value) {
      this._varManager[varName] = value;
    };

    Patch.prototype.untrackTurtle = function(turtle) {
      this._turtles.splice(this._turtles.indexOf(turtle, 0), 1);
    };

    Patch.prototype.trackTurtle = function(turtle) {
      this._turtles.push(turtle);
    };

    Patch.prototype.getCoords = function() {
      return [this.pxcor, this.pycor];
    };

    Patch.prototype.distance = function(agent) {
      return this.world.topology.distance(this.pxcor, this.pycor, agent);
    };

    Patch.prototype.distanceXY = function(x, y) {
      return this.world.topology.distanceXY(this.pxcor, this.pycor, x, y);
    };

    Patch.prototype.towards = function(agent) {
      var ref3, x, y;
      ref3 = agent.getCoords(), x = ref3[0], y = ref3[1];
      return this.towardsXY(x, y);
    };

    Patch.prototype.towardsXY = function(x, y) {
      return this.world.topology.towards(this.pxcor, this.pycor, x, y);
    };

    Patch.prototype.turtlesHere = function() {
      return new TurtleSet(this._turtles.slice(0), this.world);
    };

    Patch.prototype.ask = function(f) {
      var base;
      this.world.selfManager.askAgent(f)(this);
      if (typeof (base = this.world.selfManager.self()).isDead === "function" ? base.isDead() : void 0) {
        throw new Death;
      }
    };

    Patch.prototype.projectionBy = function(f) {
      return this.world.selfManager.askAgent(f)(this);
    };

    Patch.prototype.getNeighbors = function() {
      return this.world.getNeighbors(this.pxcor, this.pycor);
    };

    Patch.prototype.getNeighbors4 = function() {
      return this.world.getNeighbors4(this.pxcor, this.pycor);
    };

    Patch.prototype.sprout = function(n, breedName) {
      return this.world.turtleManager.createTurtles(n, breedName, this.pxcor, this.pycor);
    };

    Patch.prototype.breedHere = function(breedName) {
      return new TurtleSet(this.breedHereArray(breedName), this.world);
    };

    Patch.prototype.breedHereArray = function(breedName) {
      return filter(function(turtle) {
        return turtle.getBreedName() === breedName;
      })(this._turtles);
    };

    Patch.prototype.turtlesAt = function(dx, dy) {
      return this.patchAt(dx, dy).turtlesHere();
    };

    Patch.prototype.breedAt = function(breedName, dx, dy) {
      return this.patchAt(dx, dy).breedHere(breedName);
    };

    Patch.prototype.patchAt = function(dx, dy) {
      return this.patchAtCoords(this.pxcor + dx, this.pycor + dy);
    };

    Patch.prototype.patchAtCoords = function(x, y) {
      return this.world.patchAtCoords(x, y);
    };

    Patch.prototype.patchAtHeadingAndDistance = function(angle, distance) {
      return this.world.patchAtHeadingAndDistanceFrom(angle, distance, this.pxcor, this.pycor);
    };

    Patch.prototype.watchMe = function() {
      this.world.observer.watch(this);
    };

    Patch.prototype.inRadius = function(agents, radius) {
      return this.world.topology.inRadius(this.pxcor, this.pycor, agents, radius);
    };

    Patch.prototype.compare = function(x) {
      return Comparator.numericCompare(this.id, x.id);
    };

    Patch.prototype.isDead = function() {
      return false;
    };

    Patch.prototype.toString = function() {
      return "(" + (this.getName()) + ")";
    };

    Patch.prototype.reset = function() {
      this._varManager = this._genVarManager(this.world.patchesOwnNames);
      Setters.setPcolor.call(this, 0);
      Setters.setPlabel.call(this, '');
      Setters.setPlabelColor.call(this, 9.9);
    };

    Patch.prototype.varNames = function() {
      return this._varManager.names();
    };

    Patch.prototype._genVarManager = function(extraVarNames) {
      var allSpecs, extraSpecs;
      extraSpecs = extraVarNames.map(function(name) {
        return new ExtraVariableSpec(name);
      });
      allSpecs = VariableSpecs.concat(extraSpecs);
      return new VariableManager(this, allSpecs);
    };

    Patch.prototype._genVarUpdate = function(varName) {
      this._genUpdate(this)(varName);
    };

    Patch.prototype._neighborSum = function(nbs, varName) {
      var f;
      f = function(acc, neighbor) {
        var x;
        x = neighbor.getVariable(varName);
        if (NLType(x).isNumber()) {
          return acc + x;
        } else {
          throw new Exception("noSumOfListWithNonNumbers, " + x);
        }
      };
      return foldl(f)(0)(nbs.iterator().toArray());
    };

    Patch.prototype._optimalNSum = function(varName) {
      return this._neighborSum(this.getNeighbors(), varName);
    };

    Patch.prototype._optimalNSum4 = function(varName) {
      return this._neighborSum(this.getNeighbors4(), varName);
    };

    Patch.prototype._ifFalse = function(value, replacement) {
      if (value === false) {
        return replacement;
      } else {
        return value;
      }
    };

    Patch.prototype._optimalPatchHereInternal = function() {
      return this;
    };

    Patch.prototype._optimalPatchNorth = function() {
      return this.world.topology._getPatchNorth(this.pxcor, this.pycor) || Nobody;
    };

    Patch.prototype._optimalPatchEast = function() {
      return this.world.topology._getPatchEast(this.pxcor, this.pycor) || Nobody;
    };

    Patch.prototype._optimalPatchSouth = function() {
      return this.world.topology._getPatchSouth(this.pxcor, this.pycor) || Nobody;
    };

    Patch.prototype._optimalPatchWest = function() {
      return this.world.topology._getPatchWest(this.pxcor, this.pycor) || Nobody;
    };

    Patch.prototype._optimalPatchNorthEast = function() {
      return this.world.topology._getPatchNorthEast(this.pxcor, this.pycor) || Nobody;
    };

    Patch.prototype._optimalPatchSouthEast = function() {
      return this.world.topology._getPatchSouthEast(this.pxcor, this.pycor) || Nobody;
    };

    Patch.prototype._optimalPatchSouthWest = function() {
      return this.world.topology._getPatchSouthWest(this.pxcor, this.pycor) || Nobody;
    };

    Patch.prototype._optimalPatchNorthWest = function() {
      return this.world.topology._getPatchNorthWest(this.pxcor, this.pycor) || Nobody;
    };

    return Patch;

  })();

}).call(this);

},{"./patch/patchvariables":"engine/core/patch/patchvariables","./structure/variablemanager":"engine/core/structure/variablemanager","./structure/variablespec":"engine/core/structure/variablespec","./turtleset":"engine/core/turtleset","brazierjs/array":"brazier/array","util/comparator":"util/comparator","util/exception":"util/exception"}],"engine/core/projectionsort":[function(require,module,exports){
(function() {
  var AgentKey, Comparator, NLType, NumberKey, OtherKey, StringKey, filter, foldl, initializeDictionary, isEmpty, map, pairs, pipeline, ref, stableSort;

  NLType = require('./typechecker');

  Comparator = require('util/comparator');

  stableSort = require('util/stablesort');

  ref = require('brazierjs/array'), filter = ref.filter, foldl = ref.foldl, isEmpty = ref.isEmpty, map = ref.map;

  pipeline = require('brazierjs/function').pipeline;

  pairs = require('brazierjs/object').pairs;

  NumberKey = "number";

  StringKey = "string";

  AgentKey = "agent";

  OtherKey = "other";

  initializeDictionary = function(keys, generator) {
    var f;
    f = function(acc, key) {
      acc[key] = generator(key);
      return acc;
    };
    return foldl(f)({})(keys);
  };

  module.exports = function(agents) {
    return function(f) {
      var agentValuePairs, baseAcc, first, mapBuildFunc, ref1, sortingFunc, typeName, typeNameToPairsMap, typesInMap;
      if (agents.length < 2) {
        return agents;
      } else {
        mapBuildFunc = function(acc, agent) {
          var key, pair, type, value;
          value = agent.projectionBy(f);
          pair = [agent, value];
          type = NLType(value);
          key = type.isNumber() ? NumberKey : type.isString() ? StringKey : type.isAgent() ? AgentKey : OtherKey;
          acc[key].push(pair);
          return acc;
        };
        first = function(arg) {
          var _, x;
          x = arg[0], _ = arg[1];
          return x;
        };
        baseAcc = initializeDictionary([NumberKey, StringKey, AgentKey, OtherKey], function() {
          return [];
        });
        typeNameToPairsMap = foldl(mapBuildFunc)(baseAcc)(agents);
        typesInMap = pipeline(pairs, filter(function(arg) {
          var _, x;
          _ = arg[0], x = arg[1];
          return !isEmpty(x);
        }), map(first))(typeNameToPairsMap);
        ref1 = (function() {
          switch (typesInMap.join(" ")) {
            case NumberKey:
              return [
                NumberKey, function(arg, arg1) {
                  var n1, n2;
                  arg[0], n1 = arg[1];
                  arg1[0], n2 = arg1[1];
                  return Comparator.numericCompare(n1, n2).toInt;
                }
              ];
            case StringKey:
              return [
                StringKey, function(arg, arg1) {
                  var s1, s2;
                  arg[0], s1 = arg[1];
                  arg1[0], s2 = arg1[1];
                  return Comparator.stringCompare(s1, s2).toInt;
                }
              ];
            case AgentKey:
              return [
                AgentKey, function(arg, arg1) {
                  var a1, a2;
                  arg[0], a1 = arg[1];
                  arg1[0], a2 = arg1[1];
                  return a1.compare(a2).toInt;
                }
              ];
            default:
              throw new Error("SORT-ON works on numbers, strings, or agents of the same type.");
          }
        })(), typeName = ref1[0], sortingFunc = ref1[1];
        agentValuePairs = typeNameToPairsMap[typeName];
        return map(first)(stableSort(agentValuePairs)(sortingFunc));
      }
    };
  };

}).call(this);

},{"./typechecker":"engine/core/typechecker","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/object":"brazier/object","util/comparator":"util/comparator","util/stablesort":"util/stablesort"}],"engine/core/structure/builtins":[function(require,module,exports){
(function() {
  module.exports = {
    turtleBuiltins: ["who", "color", "heading", "xcor", "ycor", "shape", "label", "label-color", "breed", "hidden?", "size", "pen-size", "pen-mode"],
    patchBuiltins: ["pxcor", "pycor", "pcolor", "plabel", "plabel-color"],
    linkBuiltins: ["end1", "end2", "color", "label", "label-color", "hidden?", "breed", "thickness", "shape", "tie-mode"],
    linkExtras: ["heading", "size", "lcolor", "llabel", "llabelcolor", "lhidden", "lbreed", "lshape", "midpointx", "midpointy"]
  };

}).call(this);

},{}],"engine/core/structure/deadskippingiterator":[function(require,module,exports){
(function() {
  var DeadSkippingIterator, Iterator,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Iterator = require('util/iterator');

  module.exports = DeadSkippingIterator = (function(superClass) {
    extend(DeadSkippingIterator, superClass);

    DeadSkippingIterator.prototype._i = void 0;

    function DeadSkippingIterator(items) {
      DeadSkippingIterator.__super__.constructor.call(this, items);
      this._i = 0;
    }

    DeadSkippingIterator.prototype.all = function(f) {
      var j, len, ref, x;
      ref = this._items;
      for (j = 0, len = ref.length; j < len; j++) {
        x = ref[j];
        if (!x.isDead()) {
          if (!f(x)) {
            return false;
          }
        }
      }
      return true;
    };

    DeadSkippingIterator.prototype.contains = function(x) {
      var j, len, ref, y;
      ref = this._items;
      for (j = 0, len = ref.length; j < len; j++) {
        y = ref[j];
        if (!x.isDead()) {
          if (x === y) {
            return true;
          }
        }
      }
      return false;
    };

    DeadSkippingIterator.prototype.exists = function(f) {
      var j, len, ref, x;
      ref = this._items;
      for (j = 0, len = ref.length; j < len; j++) {
        x = ref[j];
        if (!x.isDead()) {
          if (f(x)) {
            return true;
          }
        }
      }
      return false;
    };

    DeadSkippingIterator.prototype.filter = function(f) {
      var j, len, ref, results, x;
      ref = this._items;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        x = ref[j];
        if ((!x.isDead()) && f(x)) {
          results.push(x);
        }
      }
      return results;
    };

    DeadSkippingIterator.prototype.map = function(f) {
      var acc;
      acc = [];
      while (this._hasNext()) {
        acc.push(f(this._next()));
      }
      return acc;
    };

    DeadSkippingIterator.prototype.forEach = function(f) {
      while (this._hasNext()) {
        f(this._next());
      }
    };

    DeadSkippingIterator.prototype.nthItem = function(n) {
      var i;
      i = 0;
      while (i <= n) {
        if (this._items[i].isDead()) {
          n++;
        }
        i++;
      }
      return this._items[n];
    };

    DeadSkippingIterator.prototype.size = function() {
      return this._items.reduce(function(acc, item) {
        return acc + (item.isDead() ? 0 : 1);
      }, 0);
    };

    DeadSkippingIterator.prototype.toArray = function() {
      var acc;
      acc = [];
      while (this._hasNext()) {
        acc.push(this._next());
      }
      return acc;
    };

    DeadSkippingIterator.prototype._hasNext = function() {
      this._skipToNext();
      return this._isntEmpty();
    };

    DeadSkippingIterator.prototype._next = function() {
      this._skipToNext();
      return this._items[this._i++];
    };

    DeadSkippingIterator.prototype._skipToNext = function() {
      while (this._isntEmpty() && this._items[this._i].isDead()) {
        this._i++;
      }
    };

    DeadSkippingIterator.prototype._isntEmpty = function() {
      return this._i < this._items.length;
    };

    return DeadSkippingIterator;

  })(Iterator);

}).call(this);

},{"util/iterator":"util/iterator"}],"engine/core/structure/linkcompare":[function(require,module,exports){
(function() {
  module.exports = function(a, b) {
    if (a === b) {
      return 0;
    } else if (a.isDead() && b.isDead()) {
      return 0;
    } else if (a.end1.id < b.end1.id) {
      return -1;
    } else if (a.end1.id > b.end1.id) {
      return 1;
    } else if (a.end2.id < b.end2.id) {
      return -1;
    } else if (a.end2.id > b.end2.id) {
      return 1;
    } else if (a.getBreedName() === b.getBreedName()) {
      return 0;
    } else if (a.getBreedName() === "LINKS") {
      return -1;
    } else if (b.getBreedName() === "LINKS") {
      return 1;
    } else if (a.getBreedOrdinal() < b.getBreedOrdinal()) {
      return -1;
    } else if (a.getBreedOrdinal() > b.getBreedOrdinal()) {
      return 1;
    } else {
      return 0;
    }
  };

}).call(this);

},{}],"engine/core/structure/penmanager":[function(require,module,exports){
(function() {
  var Down, Erase, PenManager, PenStatus, Up;

  PenStatus = (function() {
    function PenStatus(_name) {
      this._name = _name;
    }

    PenStatus.prototype.toString = function() {
      return this._name;
    };

    return PenStatus;

  })();

  Up = new PenStatus("up");

  Down = new PenStatus("down");

  Erase = new PenStatus("erase");

  PenManager = (function() {
    function PenManager(_updateFunc, _size, _status) {
      this._updateFunc = _updateFunc;
      this._size = _size != null ? _size : 1.0;
      this._status = _status != null ? _status : Up;
    }

    PenManager.prototype.getSize = function() {
      return this._size;
    };

    PenManager.prototype.getMode = function() {
      return this._status;
    };

    PenManager.prototype.setPenMode = function(position) {
      if (position === Up.toString()) {
        this.raisePen();
      } else if (position === Erase.toString()) {
        this.useEraser();
      } else {
        this.lowerPen();
      }
    };

    PenManager.prototype.raisePen = function() {
      this._updateStatus(Up);
    };

    PenManager.prototype.lowerPen = function() {
      this._updateStatus(Down);
    };

    PenManager.prototype.useEraser = function() {
      this._updateStatus(Erase);
    };

    PenManager.prototype.setSize = function(size) {
      this._updateSize(size);
    };

    PenManager.prototype.clone = function(updateFunc) {
      return new PenManager(updateFunc, this._size, this._status);
    };

    PenManager.prototype._updateSize = function(newSize) {
      this._size = newSize;
      this._updateFunc("pen-size");
    };

    PenManager.prototype._updateStatus = function(newStatus) {
      this._status = newStatus;
      this._updateFunc("pen-mode");
    };

    return PenManager;

  })();

  module.exports = {
    PenManager: PenManager,
    PenStatus: {
      Up: Up,
      Down: Down,
      Erase: Erase
    }
  };

}).call(this);

},{}],"engine/core/structure/selfmanager":[function(require,module,exports){
(function() {
  var DeathInterrupt, SelfManager, ignorantly, ignoring, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ref = require('util/exception'), DeathInterrupt = ref.DeathInterrupt, ignoring = ref.ignoring;

  ignorantly = ignoring(DeathInterrupt);

  module.exports = SelfManager = (function() {
    SelfManager.prototype._self = void 0;

    SelfManager.prototype._myself = void 0;

    function SelfManager() {
      this.askAgent = bind(this.askAgent, this);
      this.self = bind(this.self, this);
      this._self = 0;
      this._myself = 0;
    }

    SelfManager.prototype.self = function() {
      return this._self;
    };

    SelfManager.prototype.myself = function() {
      if (this._myself !== 0) {
        return this._myself;
      } else {
        throw new Error("There is no agent for MYSELF to refer to.");
      }
    };

    SelfManager.prototype.askAgent = function(f) {
      var at;
      at = this;
      return function(agent) {
        var oldAgent, oldMyself;
        oldMyself = at._myself;
        oldAgent = at._self;
        at._myself = at._self;
        at._self = agent;
        try {
          return ignorantly(f);
        } finally {
          at._self = oldAgent;
          at._myself = oldMyself;
        }
      };
    };

    return SelfManager;

  })();

}).call(this);

},{"util/exception":"util/exception"}],"engine/core/structure/variablemanager":[function(require,module,exports){
(function() {
  var ExtraVariableSpec, ImmutableVariableSpec, MutableVariableSpec, VariableManager, difference, ref;

  difference = require('brazierjs/array').difference;

  ref = require('./variablespec'), ExtraVariableSpec = ref.ExtraVariableSpec, ImmutableVariableSpec = ref.ImmutableVariableSpec, MutableVariableSpec = ref.MutableVariableSpec;

  module.exports = VariableManager = (function() {
    VariableManager.prototype._names = void 0;

    function VariableManager(agent, varSpecs) {
      var name;
      this.agent = agent;
      this._addVarsBySpec(varSpecs);
      this._names = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = varSpecs.length; i < len; i++) {
          name = varSpecs[i].name;
          results.push(name);
        }
        return results;
      })();
    }

    VariableManager.prototype.names = function() {
      return this._names;
    };

    VariableManager.prototype.refineBy = function(oldNames, newNames) {
      var freshNames, i, invalidatedSetter, len, name, obsoletedNames, specs;
      invalidatedSetter = function(name) {
        return function(value) {
          throw new Error(name + " is no longer a valid variable.");
        };
      };
      obsoletedNames = difference(oldNames)(newNames);
      freshNames = difference(newNames)(oldNames);
      specs = freshNames.map(function(name) {
        return new ExtraVariableSpec(name);
      });
      for (i = 0, len = obsoletedNames.length; i < len; i++) {
        name = obsoletedNames[i];
        this._defineProperty(name, {
          get: void 0,
          set: invalidatedSetter(name),
          configurable: true
        });
      }
      this._addVarsBySpec(specs);
      this._names = difference(this._names)(obsoletedNames).concat(freshNames);
    };

    VariableManager.prototype._addVarsBySpec = function(varSpecs) {
      var get, i, len, obj, set, spec;
      for (i = 0, len = varSpecs.length; i < len; i++) {
        spec = varSpecs[i];
        obj = (function() {
          if (spec instanceof ExtraVariableSpec) {
            return {
              configurable: true,
              value: 0,
              writable: true
            };
          } else if (spec instanceof MutableVariableSpec) {
            get = (function(spec) {
              return function() {
                return spec.get.call(this.agent);
              };
            })(spec);
            set = (function(spec) {
              return function(x) {
                return spec.set.call(this.agent, x);
              };
            })(spec);
            return {
              configurable: true,
              get: get,
              set: set
            };
          } else if (spec instanceof ImmutableVariableSpec) {
            return {
              value: spec.get.call(this.agent),
              writable: false
            };
          } else {
            throw new Error("Non-exhaustive spec type match: " + (typeof spec) + "!");
          }
        }).call(this);
        this._defineProperty(spec.name, obj);
      }
    };

    VariableManager.prototype._defineProperty = function(propName, config) {
      Object.defineProperty(this, propName, config);
    };

    return VariableManager;

  })();

}).call(this);

},{"./variablespec":"engine/core/structure/variablespec","brazierjs/array":"brazier/array"}],"engine/core/structure/variablespec":[function(require,module,exports){
(function() {
  var ExtraVariableSpec, ImmutableVariableSpec, MutableVariableSpec, VariableSpec,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  VariableSpec = (function() {
    function VariableSpec(name1) {
      this.name = name1;
    }

    return VariableSpec;

  })();

  ExtraVariableSpec = (function(superClass) {
    extend(ExtraVariableSpec, superClass);

    function ExtraVariableSpec() {
      return ExtraVariableSpec.__super__.constructor.apply(this, arguments);
    }

    return ExtraVariableSpec;

  })(VariableSpec);

  ImmutableVariableSpec = (function(superClass) {
    extend(ImmutableVariableSpec, superClass);

    function ImmutableVariableSpec(name, get) {
      this.get = get;
      ImmutableVariableSpec.__super__.constructor.call(this, name);
    }

    return ImmutableVariableSpec;

  })(VariableSpec);

  MutableVariableSpec = (function(superClass) {
    extend(MutableVariableSpec, superClass);

    function MutableVariableSpec(name, get, set) {
      this.get = get;
      this.set = set;
      MutableVariableSpec.__super__.constructor.call(this, name);
    }

    return MutableVariableSpec;

  })(VariableSpec);

  module.exports = {
    ExtraVariableSpec: ExtraVariableSpec,
    ImmutableVariableSpec: ImmutableVariableSpec,
    MutableVariableSpec: MutableVariableSpec,
    VariableSpec: VariableSpec
  };

}).call(this);

},{}],"engine/core/topology/box":[function(require,module,exports){
(function() {
  var Box, Topology,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Topology = require('./topology');

  module.exports = Box = (function(superClass) {
    extend(Box, superClass);

    function Box() {
      this._shortestY = bind(this._shortestY, this);
      this._shortestX = bind(this._shortestX, this);
      return Box.__super__.constructor.apply(this, arguments);
    }

    Box.prototype._wrapInX = false;

    Box.prototype._wrapInY = false;

    Box.prototype.wrapX = function(pos) {
      return this._wrapXCautiously(pos);
    };

    Box.prototype.wrapY = function(pos) {
      return this._wrapYCautiously(pos);
    };

    Box.prototype._getPatchNorth = function(pxcor, pycor) {
      return (pycor !== this.maxPycor) && this._getPatchAt(pxcor, pycor + 1);
    };

    Box.prototype._getPatchSouth = function(pxcor, pycor) {
      return (pycor !== this.minPycor) && this._getPatchAt(pxcor, pycor - 1);
    };

    Box.prototype._getPatchEast = function(pxcor, pycor) {
      return (pxcor !== this.maxPxcor) && this._getPatchAt(pxcor + 1, pycor);
    };

    Box.prototype._getPatchWest = function(pxcor, pycor) {
      return (pxcor !== this.minPxcor) && this._getPatchAt(pxcor - 1, pycor);
    };

    Box.prototype._getPatchNorthWest = function(pxcor, pycor) {
      return (pycor !== this.maxPycor) && (pxcor !== this.minPxcor) && this._getPatchAt(pxcor - 1, pycor + 1);
    };

    Box.prototype._getPatchSouthWest = function(pxcor, pycor) {
      return (pycor !== this.minPycor) && (pxcor !== this.minPxcor) && this._getPatchAt(pxcor - 1, pycor - 1);
    };

    Box.prototype._getPatchSouthEast = function(pxcor, pycor) {
      return (pycor !== this.minPycor) && (pxcor !== this.maxPxcor) && this._getPatchAt(pxcor + 1, pycor - 1);
    };

    Box.prototype._getPatchNorthEast = function(pxcor, pycor) {
      return (pycor !== this.maxPycor) && (pxcor !== this.maxPxcor) && this._getPatchAt(pxcor + 1, pycor + 1);
    };

    Box.prototype._shortestX = function(x1, x2) {
      return this._shortestNotWrapped(x1, x2);
    };

    Box.prototype._shortestY = function(y1, y2) {
      return this._shortestNotWrapped(y1, y2);
    };

    return Box;

  })(Topology);

}).call(this);

},{"./topology":"engine/core/topology/topology"}],"engine/core/topology/diffuser":[function(require,module,exports){
(function() {
  var Diffuser;

  module.exports = Diffuser = (function() {
    Diffuser.CENTER = 0;

    Diffuser.WEST = -1;

    Diffuser.EAST = 1;

    Diffuser.NORTH = -1;

    Diffuser.SOUTH = 1;

    Diffuser.CURRENT = Object.freeze({
      x: 0,
      y: 0
    });

    Diffuser.EAST_NORTH = Object.freeze({
      x: 1,
      y: -1
    });

    Diffuser.WEST_SOUTH = Object.freeze({
      x: -1,
      y: 1
    });

    Diffuser.EAST_SOUTH = Object.freeze({
      x: 1,
      y: 1
    });

    Diffuser.WEST_NORTH = Object.freeze({
      x: -1,
      y: -1
    });

    function Diffuser(_setPatchVariable, _width, _height, wrapInX, wrapInY) {
      this._setPatchVariable = _setPatchVariable;
      this._width = _width;
      this._height = _height;
      this._wrapWest = wrapInX ? this._width - 1 : Diffuser.CENTER;
      this._wrapEast = wrapInX ? 1 - this._width : Diffuser.CENTER;
      this._wrapNorth = wrapInY ? this._height - 1 : Diffuser.CENTER;
      this._wrapSouth = wrapInY ? 1 - this._height : Diffuser.CENTER;
    }

    Diffuser.prototype.diffuse4 = function(varName, coefficient, scratch) {
      this._center4(varName, coefficient, scratch);
      this._xBorders4(varName, coefficient, scratch);
      this._yBorders4(varName, coefficient, scratch);
      return this._corners4(varName, coefficient, scratch);
    };

    Diffuser.prototype.diffuse8 = function(varName, coefficient, scratch) {
      this._center8(varName, coefficient, scratch);
      this._xBorders8(varName, coefficient, scratch);
      this._yBorders8(varName, coefficient, scratch);
      return this._corners8(varName, coefficient, scratch);
    };

    Diffuser.prototype._center4 = function(varName, coefficient, scratch) {
      var lastX, lastY, x, y;
      lastX = this._width - 1;
      lastY = this._height - 1;
      x = 1;
      while (x < lastX) {
        y = 1;
        while (y < lastY) {
          this._patch4(x, y, varName, coefficient, scratch, Diffuser.WEST, Diffuser.EAST, Diffuser.NORTH, Diffuser.SOUTH);
          y += 1;
        }
        x += 1;
      }
    };

    Diffuser.prototype._center8 = function(varName, coefficient, scratch) {
      var lastX, lastY, x, y;
      lastX = this._width - 1;
      lastY = this._height - 1;
      x = 1;
      while (x < lastX) {
        y = 1;
        while (y < lastY) {
          this._patch8(x, y, varName, coefficient, scratch, Diffuser.WEST, Diffuser.EAST, Diffuser.NORTH, Diffuser.SOUTH, Diffuser.EAST_NORTH, Diffuser.WEST_NORTH, Diffuser.EAST_SOUTH, Diffuser.WEST_SOUTH);
          y += 1;
        }
        x += 1;
      }
    };

    Diffuser.prototype._yBorders4 = function(varName, coefficient, scratch) {
      var lastX, x, y;
      lastX = this._width - 1;
      x = 1;
      while (x < lastX) {
        y = 0;
        this._patch4(x, y, varName, coefficient, scratch, Diffuser.WEST, Diffuser.EAST, this._wrapNorth, Diffuser.SOUTH);
        y = this._height - 1;
        this._patch4(x, y, varName, coefficient, scratch, Diffuser.WEST, Diffuser.EAST, Diffuser.NORTH, this._wrapSouth);
        x += 1;
      }
    };

    Diffuser.prototype._yBorders8 = function(varName, coefficient, scratch) {
      var eastNorth, eastSouth, lastX, westNorth, westSouth, x, y;
      lastX = this._width - 1;
      eastNorth = (this._wrapNorth === 0 ? Diffuser.CURRENT : {
        x: 1,
        y: this._wrapNorth
      });
      westNorth = (this._wrapNorth === 0 ? Diffuser.CURRENT : {
        x: -1,
        y: this._wrapNorth
      });
      eastSouth = (this._wrapSouth === 0 ? Diffuser.CURRENT : {
        x: 1,
        y: this._wrapSouth
      });
      westSouth = (this._wrapSouth === 0 ? Diffuser.CURRENT : {
        x: -1,
        y: this._wrapSouth
      });
      x = 1;
      while (x < lastX) {
        y = 0;
        this._patch8(x, y, varName, coefficient, scratch, Diffuser.WEST, Diffuser.EAST, this._wrapNorth, Diffuser.SOUTH, eastNorth, westNorth, Diffuser.EAST_SOUTH, Diffuser.WEST_SOUTH);
        y = this._height - 1;
        this._patch8(x, y, varName, coefficient, scratch, Diffuser.WEST, Diffuser.EAST, Diffuser.NORTH, this._wrapSouth, Diffuser.EAST_NORTH, Diffuser.WEST_NORTH, eastSouth, westSouth);
        x += 1;
      }
    };

    Diffuser.prototype._xBorders4 = function(varName, coefficient, scratch) {
      var lastY, x, y;
      lastY = this._height - 1;
      y = 1;
      while (y < lastY) {
        x = 0;
        this._patch4(x, y, varName, coefficient, scratch, this._wrapWest, Diffuser.EAST, Diffuser.NORTH, Diffuser.SOUTH);
        x = this._width - 1;
        this._patch4(x, y, varName, coefficient, scratch, Diffuser.WEST, this._wrapEast, Diffuser.NORTH, Diffuser.SOUTH);
        y += 1;
      }
    };

    Diffuser.prototype._xBorders8 = function(varName, coefficient, scratch) {
      var eastNorth, eastSouth, lastY, westNorth, westSouth, x, y;
      lastY = this._height - 1;
      eastNorth = (this._wrapEast === 0 ? Diffuser.CURRENT : {
        x: this._wrapEast,
        y: -1
      });
      westNorth = (this._wrapWest === 0 ? Diffuser.CURRENT : {
        x: this._wrapWest,
        y: -1
      });
      eastSouth = (this._wrapEast === 0 ? Diffuser.CURRENT : {
        x: this._wrapEast,
        y: 1
      });
      westSouth = (this._wrapWest === 0 ? Diffuser.CURRENT : {
        x: this._wrapWest,
        y: 1
      });
      y = 1;
      while (y < lastY) {
        x = 0;
        this._patch8(x, y, varName, coefficient, scratch, this._wrapWest, Diffuser.EAST, Diffuser.NORTH, Diffuser.SOUTH, Diffuser.EAST_NORTH, westNorth, Diffuser.EAST_SOUTH, westSouth);
        x = this._width - 1;
        this._patch8(x, y, varName, coefficient, scratch, Diffuser.WEST, this._wrapEast, Diffuser.NORTH, Diffuser.SOUTH, eastNorth, Diffuser.WEST_NORTH, eastSouth, Diffuser.WEST_SOUTH);
        y += 1;
      }
    };

    Diffuser.prototype._corners4 = function(varName, coefficient, scratch) {
      var x, y;
      x = 0;
      y = 0;
      this._patch4(x, y, varName, coefficient, scratch, this._wrapWest, Diffuser.EAST, this._wrapNorth, Diffuser.SOUTH);
      x = 0;
      y = this._height - 1;
      this._patch4(x, y, varName, coefficient, scratch, this._wrapWest, Diffuser.EAST, Diffuser.NORTH, this._wrapSouth);
      x = this._width - 1;
      y = 0;
      this._patch4(x, y, varName, coefficient, scratch, Diffuser.WEST, this._wrapEast, this._wrapNorth, Diffuser.SOUTH);
      x = this._width - 1;
      y = this._height - 1;
      this._patch4(x, y, varName, coefficient, scratch, Diffuser.WEST, this._wrapEast, Diffuser.NORTH, this._wrapSouth);
    };

    Diffuser.prototype._corners8 = function(varName, coefficient, scratch) {
      var eastNorth, eastSouth, westNorth, westSouth, x, y;
      x = 0;
      y = 0;
      eastNorth = (this._wrapNorth === 0 ? Diffuser.CURRENT : {
        x: 1,
        y: this._wrapNorth
      });
      westNorth = (this._wrapWest === 0 || this._wrapNorth === 0 ? Diffuser.CURRENT : {
        x: this._wrapWest,
        y: this._wrapNorth
      });
      westSouth = (this._wrapWest === 0 ? Diffuser.CURRENT : {
        x: this._wrapWest,
        y: 1
      });
      this._patch8(x, y, varName, coefficient, scratch, this._wrapWest, Diffuser.EAST, this._wrapNorth, Diffuser.SOUTH, eastNorth, westNorth, Diffuser.EAST_SOUTH, westSouth);
      x = 0;
      y = this._height - 1;
      westNorth = (this._wrapWest === 0 ? Diffuser.CURRENT : {
        x: this._wrapWest,
        y: -1
      });
      eastSouth = (this._wrapSouth === 0 ? Diffuser.CURRENT : {
        x: 1,
        y: this._wrapSouth
      });
      westSouth = (this._wrapWest === 0 || this._wrapSouth === 0 ? Diffuser.CURRENT : {
        x: this._wrapWest,
        y: this._wrapSouth
      });
      this._patch8(x, y, varName, coefficient, scratch, this._wrapWest, Diffuser.EAST, Diffuser.NORTH, this._wrapSouth, Diffuser.EAST_NORTH, westNorth, eastSouth, westSouth);
      x = this._width - 1;
      y = 0;
      eastNorth = (this._wrapEast === 0 || this._wrapNorth === 0 ? Diffuser.CURRENT : {
        x: this._wrapEast,
        y: this._wrapNorth
      });
      westNorth = (this._wrapNorth === 0 ? Diffuser.CURRENT : {
        x: -1,
        y: this._wrapNorth
      });
      eastSouth = (this._wrapEast === 0 ? Diffuser.CURRENT : {
        x: this._wrapEast,
        y: 1
      });
      this._patch8(x, y, varName, coefficient, scratch, Diffuser.WEST, this._wrapEast, this._wrapNorth, Diffuser.SOUTH, eastNorth, westNorth, eastSouth, Diffuser.WEST_SOUTH);
      x = this._width - 1;
      y = this._height - 1;
      eastNorth = (this._wrapEast === 0 ? Diffuser.CURRENT : {
        x: this._wrapEast,
        y: -1
      });
      eastSouth = (this._wrapEast === 0 || this._wrapSouth === 0 ? Diffuser.CURRENT : {
        x: this._wrapEast,
        y: this._wrapSouth
      });
      westSouth = (this._wrapSouth === 0 ? Diffuser.CURRENT : {
        x: -1,
        y: this._wrapSouth
      });
      this._patch8(x, y, varName, coefficient, scratch, Diffuser.WEST, this._wrapEast, Diffuser.NORTH, this._wrapSouth, eastNorth, Diffuser.WEST_NORTH, eastSouth, westSouth);
    };

    Diffuser.prototype._patch4 = function(x, y, varName, coefficient, scratch, west, east, north, south) {
      var cn, cs, ec, newVal, oldVal, wc;
      oldVal = scratch[x][y];
      ec = scratch[x + east][y];
      cn = scratch[x][y + north];
      cs = scratch[x][y + south];
      wc = scratch[x + west][y];
      newVal = this._patchVal4(coefficient, oldVal, ec, cn, cs, wc);
      this._setPatchVariable(x, y, varName, newVal, oldVal);
    };

    Diffuser.prototype._patch8 = function(x, y, varName, coefficient, scratch, west, east, north, south, eastNorth, westNorth, eastSouth, westSouth) {
      var cn, cs, ec, en, es, newVal, oldVal, wc, wn, ws;
      oldVal = scratch[x][y];
      ec = scratch[x + east][y];
      cn = scratch[x][y + north];
      cs = scratch[x][y + south];
      wc = scratch[x + west][y];
      en = scratch[x + eastNorth.x][y + eastNorth.y];
      wn = scratch[x + westNorth.x][y + westNorth.y];
      es = scratch[x + eastSouth.x][y + eastSouth.y];
      ws = scratch[x + westSouth.x][y + westSouth.y];
      newVal = this._patchVal8(coefficient, oldVal, ec, cn, cs, wc, en, wn, es, ws);
      this._setPatchVariable(x, y, varName, newVal, oldVal);
    };

    Diffuser.prototype._patchVal = function(coefficient, oldVal, sum, dirCount) {
      return oldVal + coefficient * (sum / dirCount - oldVal);
    };

    Diffuser.prototype._patchVal4 = function(coefficient, oldVal, a, b, c, d) {
      var sum;
      sum = this._sum4(a, b, c, d);
      return this._patchVal(coefficient, oldVal, sum, 4);
    };

    Diffuser.prototype._patchVal8 = function(coefficient, oldVal, a, b, c, d, e, f, g, h) {
      var sum;
      sum = this._sum8(a, b, c, d, e, f, g, h);
      return this._patchVal(coefficient, oldVal, sum, 8);
    };

    Diffuser.prototype._sum8 = function(a, b, c, d, e, f, g, h) {
      var sum;
      sum = this._sum4(a, b, c, d);
      return sum + this._sum4(e, f, g, h);
    };

    Diffuser.prototype._sum4 = function(a, b, c, d) {
      var high1, high2, low1, low2;
      if (a < b) {
        low1 = a;
        high1 = b;
      } else {
        low1 = b;
        high1 = a;
      }
      if (c < d) {
        low2 = c;
        high2 = d;
      } else {
        low2 = d;
        high2 = c;
      }
      if (low2 < high1 && low1 < high2) {
        return (low1 + low2) + (high1 + high2);
      } else {
        return (low1 + high1) + (low2 + high2);
      }
    };

    return Diffuser;

  })();

}).call(this);

},{}],"engine/core/topology/factory":[function(require,module,exports){
(function() {
  var Box, HorizCylinder, Torus, VertCylinder;

  Box = require('./box');

  HorizCylinder = require('./horizcylinder');

  Torus = require('./torus');

  VertCylinder = require('./vertcylinder');

  module.exports = function(wrapsInX, wrapsInY, minX, maxX, minY, maxY, getPatchesFunc, getPatchAtFunc) {
    var TopoClass;
    TopoClass = wrapsInX && wrapsInY ? Torus : wrapsInX ? VertCylinder : wrapsInY ? HorizCylinder : Box;
    return new TopoClass(minX, maxX, minY, maxY, getPatchesFunc, getPatchAtFunc);
  };

}).call(this);

},{"./box":"engine/core/topology/box","./horizcylinder":"engine/core/topology/horizcylinder","./torus":"engine/core/topology/torus","./vertcylinder":"engine/core/topology/vertcylinder"}],"engine/core/topology/horizcylinder":[function(require,module,exports){
(function() {
  var HorizCylinder, Topology,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Topology = require('./topology');

  module.exports = HorizCylinder = (function(superClass) {
    extend(HorizCylinder, superClass);

    function HorizCylinder() {
      this._shortestY = bind(this._shortestY, this);
      this._shortestX = bind(this._shortestX, this);
      return HorizCylinder.__super__.constructor.apply(this, arguments);
    }

    HorizCylinder.prototype._wrapInX = false;

    HorizCylinder.prototype._wrapInY = true;

    HorizCylinder.prototype.wrapX = function(pos) {
      return this._wrapXCautiously(pos);
    };

    HorizCylinder.prototype.wrapY = function(pos) {
      return this._wrapYLeniently(pos);
    };

    HorizCylinder.prototype._getPatchEast = function(pxcor, pycor) {
      return (pxcor !== this.maxPxcor) && this._getPatchAt(pxcor + 1, pycor);
    };

    HorizCylinder.prototype._getPatchWest = function(pxcor, pycor) {
      return (pxcor !== this.minPxcor) && this._getPatchAt(pxcor - 1, pycor);
    };

    HorizCylinder.prototype._getPatchNorth = function(pxcor, pycor) {
      if (pycor === this.maxPycor) {
        return this._getPatchAt(pxcor, this.minPycor);
      } else {
        return this._getPatchAt(pxcor, pycor + 1);
      }
    };

    HorizCylinder.prototype._getPatchSouth = function(pxcor, pycor) {
      if (pycor === this.minPycor) {
        return this._getPatchAt(pxcor, this.maxPycor);
      } else {
        return this._getPatchAt(pxcor, pycor - 1);
      }
    };

    HorizCylinder.prototype._getPatchNorthWest = function(pxcor, pycor) {
      if (pxcor === this.minPxcor) {
        return false;
      } else if (pycor === this.maxPycor) {
        return this._getPatchAt(pxcor - 1, this.minPycor);
      } else {
        return this._getPatchAt(pxcor - 1, pycor + 1);
      }
    };

    HorizCylinder.prototype._getPatchSouthWest = function(pxcor, pycor) {
      if (pxcor === this.minPxcor) {
        return false;
      } else if (pycor === this.minPycor) {
        return this._getPatchAt(pxcor - 1, this.maxPycor);
      } else {
        return this._getPatchAt(pxcor - 1, pycor - 1);
      }
    };

    HorizCylinder.prototype._getPatchSouthEast = function(pxcor, pycor) {
      if (pxcor === this.maxPxcor) {
        return false;
      } else if (pycor === this.minPycor) {
        return this._getPatchAt(pxcor + 1, this.maxPycor);
      } else {
        return this._getPatchAt(pxcor + 1, pycor - 1);
      }
    };

    HorizCylinder.prototype._getPatchNorthEast = function(pxcor, pycor) {
      if (pxcor === this.maxPxcor) {
        return false;
      } else if (pycor === this.maxPycor) {
        return this._getPatchAt(pxcor + 1, this.minPycor);
      } else {
        return this._getPatchAt(pxcor + 1, pycor + 1);
      }
    };

    HorizCylinder.prototype._shortestX = function(x1, x2) {
      return this._shortestNotWrapped(x1, x2);
    };

    HorizCylinder.prototype._shortestY = function(y1, y2) {
      return this._shortestYWrapped(y1, y2);
    };

    return HorizCylinder;

  })(Topology);

}).call(this);

},{"./topology":"engine/core/topology/topology"}],"engine/core/topology/incone":[function(require,module,exports){
(function() {
  var NLMath, NLType, findCircleBounds;

  NLMath = require('util/nlmath');

  NLType = require('../typechecker');

  findCircleBounds = function(wrapsInDim, worldSpan, distance, minDim, maxDim, currentDim) {
    var diff, dist, halfSpan, max, min;
    dist = NLMath.ceil(distance);
    if (wrapsInDim) {
      halfSpan = worldSpan / 2;
      if (dist < halfSpan) {
        return [-dist, dist];
      } else {
        return [-NLMath.ceil(halfSpan - 1), NLMath.floor(halfSpan)];
      }
    } else {
      diff = minDim - currentDim;
      min = NLMath.abs(diff) < dist ? diff : -dist;
      max = NLMath.min(maxDim - currentDim, dist);
      return [min, max];
    }
  };

  module.exports = function(x, y, turtleHeading, agents, distance, angle) {
    var dx, dxMax, dxMin, dy, dyMax, dyMin, findWrapCount, goodTurtles, i, isInSector, isInWrappableSector, isPatchSet, isTurtleSet, j, patch, patchIsGood, patchIsGood_, pxcor, pycor, ref, ref1, ref2, ref3, ref4, ref5, ref6, result, turtleIsGood, turtleIsGood_, wrapCountInX, wrapCountInY;
    findWrapCount = function(wrapsInDim, dimSize) {
      if (wrapsInDim) {
        return NLMath.ceil(distance / dimSize);
      } else {
        return 0;
      }
    };
    isInSector = (function(_this) {
      return function(ax, ay, cx, cy, radius, heading) {
        var isTheSameSpot, isWithinArc, isWithinRange;
        isWithinArc = function() {
          var diff, half, theta;
          theta = _this._towardsNotWrapped(cx, cy, ax, ay);
          diff = NLMath.abs(theta - heading);
          half = angle / 2;
          return (diff <= half) || ((360 - diff) <= half);
        };
        isWithinRange = function() {
          return NLMath.distance4_2D(cx, cy, ax, ay) <= radius;
        };
        isTheSameSpot = ax === cx && ay === cy;
        return isTheSameSpot || (isWithinRange() && isWithinArc());
      };
    })(this);
    isInWrappableSector = (function(_this) {
      return function(agentX, agentY, xBound, yBound) {
        var i, j, ref, ref1, ref2, ref3, xWrapCoefficient, yWrapCoefficient;
        for (xWrapCoefficient = i = ref = -xBound, ref1 = xBound; ref <= ref1 ? i <= ref1 : i >= ref1; xWrapCoefficient = ref <= ref1 ? ++i : --i) {
          for (yWrapCoefficient = j = ref2 = -yBound, ref3 = yBound; ref2 <= ref3 ? j <= ref3 : j >= ref3; yWrapCoefficient = ref2 <= ref3 ? ++j : --j) {
            if (isInSector(agentX + _this.width * xWrapCoefficient, agentY + _this.height * yWrapCoefficient, x, y, distance, turtleHeading)) {
              return true;
            }
          }
        }
        return false;
      };
    })(this);
    patchIsGood = (function(_this) {
      return function(wrapCountInX, wrapCountInY) {
        return function(patch) {
          var isPlausible;
          isPlausible = agents.getSpecialName() === "patches" || agents.contains(patch);
          return isPlausible && isInWrappableSector(patch.pxcor, patch.pycor, wrapCountInX, wrapCountInY);
        };
      };
    })(this);
    turtleIsGood = (function(_this) {
      return function(wrapCountInX, wrapCountInY) {
        return function(turtle) {
          var breedName, isPlausible;
          breedName = agents.getSpecialName();
          isPlausible = breedName === "turtles" || ((breedName != null) && breedName === turtle.getBreedName()) || ((breedName == null) && agents.contains(turtle));
          return isPlausible && isInWrappableSector(turtle.xcor, turtle.ycor, wrapCountInX, wrapCountInY);
        };
      };
    })(this);
    ref = this._getPatchAt(x, y), pxcor = ref.pxcor, pycor = ref.pycor;
    wrapCountInX = findWrapCount(this._wrapInX, this.width);
    wrapCountInY = findWrapCount(this._wrapInY, this.height);
    patchIsGood_ = patchIsGood(wrapCountInX, wrapCountInY);
    turtleIsGood_ = turtleIsGood(wrapCountInX, wrapCountInY);
    ref1 = findCircleBounds(this._wrapInX, this.width, distance, this.minPxcor, this.maxPxcor, pxcor), dxMin = ref1[0], dxMax = ref1[1];
    ref2 = findCircleBounds(this._wrapInY, this.height, distance, this.minPycor, this.maxPycor, pycor), dyMin = ref2[0], dyMax = ref2[1];
    isPatchSet = NLType(agents).isPatchSet();
    isTurtleSet = NLType(agents).isTurtleSet();
    result = [];
    for (dy = i = ref3 = dyMin, ref4 = dyMax; ref3 <= ref4 ? i <= ref4 : i >= ref4; dy = ref3 <= ref4 ? ++i : --i) {
      for (dx = j = ref5 = dxMin, ref6 = dxMax; ref5 <= ref6 ? j <= ref6 : j >= ref6; dx = ref5 <= ref6 ? ++j : --j) {
        patch = this._getPatchAt(pxcor + dx, pycor + dy);
        if (!NLType(patch).isNobody()) {
          if (isPatchSet && patchIsGood_(patch)) {
            result.push(patch);
          } else if (isTurtleSet && NLMath.distance2_2D(dx, dy) <= distance + 1.415) {
            goodTurtles = patch.turtlesHere().toArray().filter((function(_this) {
              return function(turtle) {
                return turtleIsGood_(turtle);
              };
            })(this));
            result = result.concat(goodTurtles);
          }
        }
      }
    }
    return agents.copyWithNewAgents(result);
  };

}).call(this);

},{"../typechecker":"engine/core/typechecker","util/nlmath":"util/nlmath"}],"engine/core/topology/topology":[function(require,module,exports){
(function() {
  var AgentException, Diffuser, StrictMath, Topology, TopologyInterrupt, abstractMethod, filter, inCone, pipeline, ref, ref1, unique,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  inCone = require('./incone');

  Topology = require('./topology');

  Diffuser = require('./diffuser');

  StrictMath = require('shim/strictmath');

  abstractMethod = require('util/abstractmethoderror');

  ref = require('brazierjs/array'), filter = ref.filter, unique = ref.unique;

  pipeline = require('brazierjs/function').pipeline;

  ref1 = require('util/exception'), AgentException = ref1.AgentException, TopologyInterrupt = ref1.TopologyInterrupt;

  module.exports = Topology = (function() {
    Topology.prototype._wrapInX = void 0;

    Topology.prototype._wrapInY = void 0;

    Topology.prototype.height = void 0;

    Topology.prototype.width = void 0;

    Topology.prototype._neighborCache = void 0;

    Topology.prototype._neighbor4Cache = void 0;

    function Topology(minPxcor, maxPxcor, minPycor, maxPycor, _getPatches, _getPatchAt) {
      this.minPxcor = minPxcor;
      this.maxPxcor = maxPxcor;
      this.minPycor = minPycor;
      this.maxPycor = maxPycor;
      this._getPatches = _getPatches;
      this._getPatchAt = _getPatchAt;
      this._shortestY = bind(this._shortestY, this);
      this._shortestX = bind(this._shortestX, this);
      this._setPatchVariable = bind(this._setPatchVariable, this);
      this.height = 1 + this.maxPycor - this.minPycor;
      this.width = 1 + this.maxPxcor - this.minPxcor;
      this.diffuser = new Diffuser(this._setPatchVariable, this.width, this.height, this._wrapInX, this._wrapInY);
      this._neighborCache = {};
      this._neighbor4Cache = {};
    }

    Topology.prototype.diffuse = function(varName, coefficient, fourWay) {
      var mapAll, scratch, xx, yy;
      yy = this.height;
      xx = this.width;
      mapAll = function(f) {
        var i, ref2, results, x, y;
        results = [];
        for (x = i = 0, ref2 = xx; 0 <= ref2 ? i < ref2 : i > ref2; x = 0 <= ref2 ? ++i : --i) {
          results.push((function() {
            var j, ref3, results1;
            results1 = [];
            for (y = j = 0, ref3 = yy; 0 <= ref3 ? j < ref3 : j > ref3; y = 0 <= ref3 ? ++j : --j) {
              results1.push(f(x, y));
            }
            return results1;
          })());
        }
        return results;
      };
      scratch = mapAll((function(_this) {
        return function(x, y) {
          return _this._getPatchAt(x + _this.minPxcor, y + _this.minPycor).getVariable(varName);
        };
      })(this));
      if (fourWay) {
        this.diffuser.diffuse4(varName, coefficient, scratch);
      } else {
        this.diffuser.diffuse8(varName, coefficient, scratch);
      }
    };

    Topology.prototype._setPatchVariable = function(x, y, varName, newVal, oldVal) {
      if (newVal !== oldVal) {
        return this._getPatchAt(x + this.minPxcor, y + this.minPycor).setVariable(varName, newVal);
      }
    };

    Topology.prototype.getNeighbors = function(pxcor, pycor) {
      var key;
      key = "(" + pxcor + ", " + pycor + ")";
      if (this._neighborCache.hasOwnProperty(key)) {
        return this._neighborCache[key];
      } else {
        return this._neighborCache[key] = this._filterNeighbors(this._getNeighbors(pxcor, pycor));
      }
    };

    Topology.prototype.getNeighbors4 = function(pxcor, pycor) {
      var key;
      key = "(" + pxcor + ", " + pycor + ")";
      if (this._neighbor4Cache.hasOwnProperty(key)) {
        return this._neighbor4Cache[key];
      } else {
        return this._neighbor4Cache[key] = this._filterNeighbors(this._getNeighbors4(pxcor, pycor));
      }
    };

    Topology.prototype._filterNeighbors = function(neighbors) {
      return pipeline(filter(function(patch) {
        return patch !== false;
      }), unique)(neighbors);
    };

    Topology.prototype.distanceXY = function(x1, y1, x2, y2) {
      var a2, b2;
      a2 = StrictMath.pow(this._shortestX(x1, x2), 2);
      b2 = StrictMath.pow(this._shortestY(y1, y2), 2);
      return StrictMath.sqrt(a2 + b2);
    };

    Topology.prototype.distance = function(x1, y1, agent) {
      var ref2, x2, y2;
      ref2 = agent.getCoords(), x2 = ref2[0], y2 = ref2[1];
      return this.distanceXY(x1, y1, x2, y2);
    };

    Topology.prototype.distanceToLine = function(x1, y1, x2, y2, xcor, ycor) {
      var closestPoint, closestX, closestY, isInBounds, ref2, wrappedX1, wrappedX2, wrappedXcor, wrappedY1, wrappedY2, wrappedYcor, xDiff, yDiff;
      closestPoint = function(x1, y1, x2, y2, xDiff, yDiff) {
        var u, x, y;
        u = ((x1 - x2) * xDiff + (y1 - y2) * yDiff) / (xDiff * xDiff + yDiff * yDiff);
        x = x2 + u * xDiff;
        y = y2 + u * yDiff;
        return {
          x: x,
          y: y
        };
      };
      isInBounds = function(x1, y1, x2, y2, pointX, pointY) {
        var bottom, left, ref2, ref3, right, top;
        ref2 = y1 > y2 ? [y2, y1] : [y1, y2], bottom = ref2[0], top = ref2[1];
        ref3 = x1 > x2 ? [x2, x1] : [x1, x2], left = ref3[0], right = ref3[1];
        return pointX <= right && pointX >= left && pointY <= top && pointY >= bottom;
      };
      wrappedX1 = this.wrapX(x1);
      wrappedX2 = this.wrapX(x2);
      wrappedXcor = this.wrapX(xcor);
      wrappedY1 = this.wrapY(y1);
      wrappedY2 = this.wrapY(y2);
      wrappedYcor = this.wrapY(ycor);
      xDiff = wrappedX2 - wrappedX1;
      yDiff = wrappedY2 - wrappedY1;
      ref2 = closestPoint(wrappedXcor, wrappedYcor, wrappedX1, wrappedY1, xDiff, yDiff), closestX = ref2.x, closestY = ref2.y;
      if (isInBounds(wrappedX1, wrappedY1, wrappedX2, wrappedY2, closestX, closestY)) {
        return this.distanceXY(closestX, closestY, wrappedXcor, wrappedYcor);
      } else {
        return Math.min(this.distanceXY(x1, y1, xcor, ycor), this.distanceXY(x2, y2, xcor, ycor));
      }
    };

    Topology.prototype.towards = function(x1, y1, x2, y2) {
      return this._towards(x1, y1, x2, y2, this._shortestX, this._shortestY);
    };

    Topology.prototype.midpointx = function(x1, x2) {
      var pos;
      pos = (x1 + (x1 + this._shortestX(x1, x2))) / 2;
      return this._wrap(pos, this.minPxcor - 0.5, this.maxPxcor + 0.5);
    };

    Topology.prototype.midpointy = function(y1, y2) {
      var pos;
      pos = (y1 + (y1 + this._shortestY(y1, y2))) / 2;
      return this._wrap(pos, this.minPycor - 0.5, this.maxPycor + 0.5);
    };

    Topology.prototype.inCone = function(x, y, heading, agents, distance, angle) {
      return inCone.call(this, x, y, heading, agents, distance, angle);
    };

    Topology.prototype.inRadius = function(x, y, agents, radius) {
      return agents.filter((function(_this) {
        return function(agent) {
          var ref2, xcor, ycor;
          ref2 = agent.getCoords(), xcor = ref2[0], ycor = ref2[1];
          return _this.distanceXY(xcor, ycor, x, y) <= radius;
        };
      })(this));
    };

    Topology.prototype._getNeighbors = function(pxcor, pycor) {
      if (pxcor === this.maxPxcor && pxcor === this.minPxcor) {
        if (pycor === this.maxPycor && pycor === this.minPycor) {
          return [];
        } else {
          return [this._getPatchNorth(pxcor, pycor), this._getPatchSouth(pxcor, pycor)];
        }
      } else if (pycor === this.maxPycor && pycor === this.minPycor) {
        return [this._getPatchEast(pxcor, pycor), this._getPatchWest(pxcor, pycor)];
      } else {
        return [this._getPatchNorth(pxcor, pycor), this._getPatchEast(pxcor, pycor), this._getPatchSouth(pxcor, pycor), this._getPatchWest(pxcor, pycor), this._getPatchNorthEast(pxcor, pycor), this._getPatchSouthEast(pxcor, pycor), this._getPatchSouthWest(pxcor, pycor), this._getPatchNorthWest(pxcor, pycor)];
      }
    };

    Topology.prototype._getNeighbors4 = function(pxcor, pycor) {
      if (pxcor === this.maxPxcor && pxcor === this.minPxcor) {
        if (pycor === this.maxPycor && pycor === this.minPycor) {
          return [];
        } else {
          return [this._getPatchNorth(pxcor, pycor), this._getPatchSouth(pxcor, pycor)];
        }
      } else if (pycor === this.maxPycor && pycor === this.minPycor) {
        return [this._getPatchEast(pxcor, pycor), this._getPatchWest(pxcor, pycor)];
      } else {
        return [this._getPatchNorth(pxcor, pycor), this._getPatchEast(pxcor, pycor), this._getPatchSouth(pxcor, pycor), this._getPatchWest(pxcor, pycor)];
      }
    };

    Topology.prototype._shortestNotWrapped = function(cor1, cor2) {
      return StrictMath.abs(cor1 - cor2) * (cor1 > cor2 ? -1 : 1);
    };

    Topology.prototype._shortestWrapped = function(cor1, cor2, limit) {
      var absDist;
      absDist = StrictMath.abs(cor1 - cor2);
      if (absDist > limit / 2) {
        return (limit - absDist) * (cor2 > cor1 ? -1 : 1);
      } else {
        return this._shortestNotWrapped(cor1, cor2);
      }
    };

    Topology.prototype._shortestXWrapped = function(cor1, cor2) {
      return this._shortestWrapped(cor1, cor2, this.width);
    };

    Topology.prototype._shortestYWrapped = function(cor1, cor2) {
      return this._shortestWrapped(cor1, cor2, this.height);
    };

    Topology.prototype._towards = function(x1, y1, x2, y2, findXDist, findYDist) {
      var dx, dy;
      if ((x1 !== x2) || (y1 !== y2)) {
        dx = findXDist(x1, x2);
        dy = findYDist(y1, y2);
        if (dx === 0) {
          if (dy >= 0) {
            return 0;
          } else {
            return 180;
          }
        } else if (dy === 0) {
          if (dx >= 0) {
            return 90;
          } else {
            return 270;
          }
        } else {
          return (270 + StrictMath.toDegrees(StrictMath.PI() + StrictMath.atan2(-dy, dx))) % 360;
        }
      } else {
        throw new AgentException("No heading is defined from a point (" + x1 + "," + x2 + ") to that same point.");
      }
    };

    Topology.prototype._towardsNotWrapped = function(x1, y1, x2, y2) {
      return this._towards(x1, y1, x2, y2, this._shortestNotWrapped, this._shortestNotWrapped);
    };

    Topology.prototype._wrap = function(pos, min, max) {
      var result;
      if (pos >= max) {
        return min + ((pos - max) % (max - min));
      } else if (pos < min) {
        result = max - ((min - pos) % (max - min));
        if (result < max) {
          return result;
        } else {
          return min;
        }
      } else {
        return pos;
      }
    };

    Topology.prototype._wrapXCautiously = function(pos) {
      return this._wrapCautiously(this.minPxcor, this.maxPxcor, pos);
    };

    Topology.prototype._wrapXLeniently = function(pos) {
      return this._wrapLeniently(this.minPxcor, this.maxPxcor, pos);
    };

    Topology.prototype._wrapYCautiously = function(pos) {
      return this._wrapCautiously(this.minPycor, this.maxPycor, pos);
    };

    Topology.prototype._wrapYLeniently = function(pos) {
      return this._wrapLeniently(this.minPycor, this.maxPycor, pos);
    };

    Topology.prototype._wrapCautiously = function(minCor, maxCor, pos) {
      var max, min;
      min = minCor - 0.5;
      max = maxCor + 0.5;
      if ((min <= pos && pos < max)) {
        return pos;
      } else {
        throw new TopologyInterrupt("Cannot move turtle beyond the world's edge.");
      }
    };

    Topology.prototype._wrapLeniently = function(minCor, maxCor, pos) {
      return this._wrap(pos, minCor - 0.5, maxCor + 0.5);
    };

    Topology.prototype.wrapX = function(pos) {
      return abstractMethod('Topology.wrapX');
    };

    Topology.prototype.wrapY = function(pos) {
      return abstractMethod('Topology.wrapY');
    };

    Topology.prototype._shortestX = function(x1, x2) {
      return abstractMethod('Topology._shortestX');
    };

    Topology.prototype._shortestY = function(y1, y2) {
      return abstractMethod('Topology._shortestY');
    };

    Topology.prototype._getPatchNorth = function(x, y) {
      return abstractMethod('Topology._getPatchNorth');
    };

    Topology.prototype._getPatchEast = function(x, y) {
      return abstractMethod('Topology._getPatchEast');
    };

    Topology.prototype._getPatchSouth = function(x, y) {
      return abstractMethod('Topology._getPatchSouth');
    };

    Topology.prototype._getPatchWest = function(x, y) {
      return abstractMethod('Topology._getPatchWest');
    };

    Topology.prototype._getPatchNorthEast = function(x, y) {
      return abstractMethod('Topology._getPatchNorthEast');
    };

    Topology.prototype._getPatchSouthEast = function(x, y) {
      return abstractMethod('Topology._getPatchSouthEast');
    };

    Topology.prototype._getPatchSouthWest = function(x, y) {
      return abstractMethod('Topology._getPatchSouthWest');
    };

    Topology.prototype._getPatchNorthWest = function(x, y) {
      return abstractMethod('Topology._getPatchNorthWest');
    };

    return Topology;

  })();

}).call(this);

},{"./diffuser":"engine/core/topology/diffuser","./incone":"engine/core/topology/incone","./topology":"engine/core/topology/topology","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","shim/strictmath":"shim/strictmath","util/abstractmethoderror":"util/abstractmethoderror","util/exception":"util/exception"}],"engine/core/topology/torus":[function(require,module,exports){
(function() {
  var Topology, Torus, add, foldl, map, pipeline, rangeUntil, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Topology = require('./topology');

  ref = require('brazierjs/array'), foldl = ref.foldl, map = ref.map;

  pipeline = require('brazierjs/function').pipeline;

  rangeUntil = require('brazierjs/number').rangeUntil;

  add = function(a, b) {
    return a + b;
  };

  module.exports = Torus = (function(superClass) {
    extend(Torus, superClass);

    function Torus() {
      this._shortestY = bind(this._shortestY, this);
      this._shortestX = bind(this._shortestX, this);
      return Torus.__super__.constructor.apply(this, arguments);
    }

    Torus.prototype._wrapInX = true;

    Torus.prototype._wrapInY = true;

    Torus.prototype.wrapX = function(pos) {
      return this._wrapXLeniently(pos);
    };

    Torus.prototype.wrapY = function(pos) {
      return this._wrapYLeniently(pos);
    };

    Torus.prototype._getPatchNorth = function(pxcor, pycor) {
      if (pycor === this.maxPycor) {
        return this._getPatchAt(pxcor, this.minPycor);
      } else {
        return this._getPatchAt(pxcor, pycor + 1);
      }
    };

    Torus.prototype._getPatchSouth = function(pxcor, pycor) {
      if (pycor === this.minPycor) {
        return this._getPatchAt(pxcor, this.maxPycor);
      } else {
        return this._getPatchAt(pxcor, pycor - 1);
      }
    };

    Torus.prototype._getPatchEast = function(pxcor, pycor) {
      if (pxcor === this.maxPxcor) {
        return this._getPatchAt(this.minPxcor, pycor);
      } else {
        return this._getPatchAt(pxcor + 1, pycor);
      }
    };

    Torus.prototype._getPatchWest = function(pxcor, pycor) {
      if (pxcor === this.minPxcor) {
        return this._getPatchAt(this.maxPxcor, pycor);
      } else {
        return this._getPatchAt(pxcor - 1, pycor);
      }
    };

    Torus.prototype._getPatchNorthWest = function(pxcor, pycor) {
      if (pycor === this.maxPycor) {
        if (pxcor === this.minPxcor) {
          return this._getPatchAt(this.maxPxcor, this.minPycor);
        } else {
          return this._getPatchAt(pxcor - 1, this.minPycor);
        }
      } else if (pxcor === this.minPxcor) {
        return this._getPatchAt(this.maxPxcor, pycor + 1);
      } else {
        return this._getPatchAt(pxcor - 1, pycor + 1);
      }
    };

    Torus.prototype._getPatchSouthWest = function(pxcor, pycor) {
      if (pycor === this.minPycor) {
        if (pxcor === this.minPxcor) {
          return this._getPatchAt(this.maxPxcor, this.maxPycor);
        } else {
          return this._getPatchAt(pxcor - 1, this.maxPycor);
        }
      } else if (pxcor === this.minPxcor) {
        return this._getPatchAt(this.maxPxcor, pycor - 1);
      } else {
        return this._getPatchAt(pxcor - 1, pycor - 1);
      }
    };

    Torus.prototype._getPatchSouthEast = function(pxcor, pycor) {
      if (pycor === this.minPycor) {
        if (pxcor === this.maxPxcor) {
          return this._getPatchAt(this.minPxcor, this.maxPycor);
        } else {
          return this._getPatchAt(pxcor + 1, this.maxPycor);
        }
      } else if (pxcor === this.maxPxcor) {
        return this._getPatchAt(this.minPxcor, pycor - 1);
      } else {
        return this._getPatchAt(pxcor + 1, pycor - 1);
      }
    };

    Torus.prototype._getPatchNorthEast = function(pxcor, pycor) {
      if (pycor === this.maxPycor) {
        if (pxcor === this.maxPxcor) {
          return this._getPatchAt(this.minPxcor, this.minPycor);
        } else {
          return this._getPatchAt(pxcor + 1, this.minPycor);
        }
      } else if (pxcor === this.maxPxcor) {
        return this._getPatchAt(this.minPxcor, pycor + 1);
      } else {
        return this._getPatchAt(pxcor + 1, pycor + 1);
      }
    };

    Torus.prototype._shortestX = function(x1, x2) {
      return this._shortestXWrapped(x1, x2);
    };

    Torus.prototype._shortestY = function(y1, y2) {
      return this._shortestYWrapped(y1, y2);
    };

    return Torus;

  })(Topology);

}).call(this);

},{"./topology":"engine/core/topology/topology","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/number":"brazier/number"}],"engine/core/topology/vertcylinder":[function(require,module,exports){
(function() {
  var Topology, VertCylinder,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Topology = require('./topology');

  module.exports = VertCylinder = (function(superClass) {
    extend(VertCylinder, superClass);

    function VertCylinder() {
      this._shortestY = bind(this._shortestY, this);
      this._shortestX = bind(this._shortestX, this);
      return VertCylinder.__super__.constructor.apply(this, arguments);
    }

    VertCylinder.prototype._wrapInX = true;

    VertCylinder.prototype._wrapInY = false;

    VertCylinder.prototype.wrapX = function(pos) {
      return this._wrapXLeniently(pos);
    };

    VertCylinder.prototype.wrapY = function(pos) {
      return this._wrapYCautiously(pos);
    };

    VertCylinder.prototype._getPatchNorth = function(pxcor, pycor) {
      return (pycor !== this.maxPycor) && this._getPatchAt(pxcor, pycor + 1);
    };

    VertCylinder.prototype._getPatchSouth = function(pxcor, pycor) {
      return (pycor !== this.minPycor) && this._getPatchAt(pxcor, pycor - 1);
    };

    VertCylinder.prototype._getPatchEast = function(pxcor, pycor) {
      if (pxcor === this.maxPxcor) {
        return this._getPatchAt(this.minPxcor, pycor);
      } else {
        return this._getPatchAt(pxcor + 1, pycor);
      }
    };

    VertCylinder.prototype._getPatchWest = function(pxcor, pycor) {
      if (pxcor === this.minPxcor) {
        return this._getPatchAt(this.maxPxcor, pycor);
      } else {
        return this._getPatchAt(pxcor - 1, pycor);
      }
    };

    VertCylinder.prototype._getPatchNorthWest = function(pxcor, pycor) {
      if (pycor === this.maxPycor) {
        return false;
      } else if (pxcor === this.minPxcor) {
        return this._getPatchAt(this.maxPxcor, pycor + 1);
      } else {
        return this._getPatchAt(pxcor - 1, pycor + 1);
      }
    };

    VertCylinder.prototype._getPatchSouthWest = function(pxcor, pycor) {
      if (pycor === this.minPycor) {
        return false;
      } else if (pxcor === this.minPxcor) {
        return this._getPatchAt(this.maxPxcor, pycor - 1);
      } else {
        return this._getPatchAt(pxcor - 1, pycor - 1);
      }
    };

    VertCylinder.prototype._getPatchSouthEast = function(pxcor, pycor) {
      if (pycor === this.minPycor) {
        return false;
      } else if (pxcor === this.maxPxcor) {
        return this._getPatchAt(this.minPxcor, pycor - 1);
      } else {
        return this._getPatchAt(pxcor + 1, pycor - 1);
      }
    };

    VertCylinder.prototype._getPatchNorthEast = function(pxcor, pycor) {
      if (pycor === this.maxPycor) {
        return false;
      } else if (pxcor === this.maxPxcor) {
        return this._getPatchAt(this.minPxcor, pycor + 1);
      } else {
        return this._getPatchAt(pxcor + 1, pycor + 1);
      }
    };

    VertCylinder.prototype._shortestX = function(x1, x2) {
      return this._shortestXWrapped(x1, x2);
    };

    VertCylinder.prototype._shortestY = function(y1, y2) {
      return this._shortestNotWrapped(y1, y2);
    };

    return VertCylinder;

  })(Topology);

}).call(this);

},{"./topology":"engine/core/topology/topology"}],"engine/core/turtle/makepenlines":[function(require,module,exports){
(function() {
  var NLMath, Trail, distanceFromLegs, lazyWrapValue, makePenLines, makePenLinesHelper, makeTrails;

  NLMath = require('util/nlmath');

  Trail = (function() {
    function Trail(x1, y1, x2, y2, dist) {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
      this.dist = dist;
    }

    return Trail;

  })();

  lazyWrapValue = function(min, max) {
    return function(value) {
      if (value <= min) {
        return max;
      } else if (value >= max) {
        return min;
      } else {
        return value;
      }
    };
  };

  distanceFromLegs = function(l1, l2) {
    var square;
    square = function(x) {
      return NLMath.pow(x, 2);
    };
    return NLMath.sqrt(square(l1) + square(l2));
  };

  makeTrails = function(heading, minX, maxX, minY, maxY) {
    return function(x, y, jumpDist) {
      var baseTrails, dx, dy, interceptX, interceptY, makeTrailComponent, rawX, rawY, tan, xInterceptTrails, xcomp, yInterceptTrails, ycomp;
      xcomp = NLMath.squash(NLMath.sin(heading));
      ycomp = NLMath.squash(NLMath.cos(heading));
      tan = NLMath.squash(NLMath.tan(heading));
      rawX = x + xcomp * jumpDist;
      rawY = y + ycomp * jumpDist;
      baseTrails = [new Trail(x, y, rawX, rawY, jumpDist < 0 ? jumpDist * -1 : jumpDist)];
      makeTrailComponent = function(endX, endY, dx, dy) {
        return [new Trail(x, y, endX, endY, distanceFromLegs(dx, dy))];
      };
      yInterceptTrails = rawX > maxX ? (dx = maxX - x, dy = dx / tan, interceptY = y + dy, makeTrailComponent(maxX, interceptY, dx, dy)) : rawX < minX ? (dx = x - minX, dy = dx / tan, interceptY = y - dy, makeTrailComponent(minX, interceptY, dx, dy)) : [];
      xInterceptTrails = rawY > maxY ? (dy = maxY - y, dx = dy * tan, interceptX = x + dx, makeTrailComponent(interceptX, maxY, dx, dy)) : rawY < minY ? (dy = y - minY, dx = dy * tan, interceptX = x - dx, makeTrailComponent(interceptX, minY, dx, dy)) : [];
      return baseTrails.concat(xInterceptTrails, yInterceptTrails);
    };
  };

  makePenLines = function(x, y, heading, jumpDist, minX, maxX, minY, maxY) {
    var lazyWrapX, lazyWrapY, makeTrailsBy;
    makeTrailsBy = makeTrails(heading, minX, maxX, minY, maxY);
    lazyWrapX = lazyWrapValue(minX, maxX);
    lazyWrapY = lazyWrapValue(minY, maxY);
    return makePenLinesHelper(makeTrailsBy, lazyWrapX, lazyWrapY)(x, y, jumpDist, []);
  };

  makePenLinesHelper = function(makeTrailsBy, lazyWrapX, lazyWrapY) {
    var inner;
    inner = function(x, y, jumpDist, acc) {
      var newAcc, newX, newY, nextJumpDist, trail, trails;
      trails = makeTrailsBy(x, y, jumpDist);
      trail = trails.sort(function(arg, arg1) {
        var distA, distB;
        distA = arg.dist;
        distB = arg1.dist;
        if (distA < distB) {
          return -1;
        } else if (distA === distB) {
          return 0;
        } else {
          return 1;
        }
      })[0];
      newAcc = acc.concat([trail]);
      nextJumpDist = jumpDist >= 0 ? jumpDist - trail.dist : jumpDist + trail.dist;
      if (nextJumpDist === 0) {
        return newAcc;
      } else {
        newX = lazyWrapX(trail.x2);
        newY = lazyWrapY(trail.y2);
        return inner(newX, newY, nextJumpDist, newAcc);
      }
    };
    return inner;
  };

  module.exports = makePenLines;

}).call(this);

},{"util/nlmath":"util/nlmath"}],"engine/core/turtle/turtlevariables":[function(require,module,exports){
(function() {
  var ColorModel, ImmutableVariableSpec, MutableVariableSpec, NLMath, NLType, Setters, StrictMath, TopologyInterrupt, VariableSpecs, _handleTiesForHeadingChange, clone, getBreed, ignorantly, ignoring, ref, ref1, setBreed, setBreedShape, setColor, setHeading, setIsHidden, setLabel, setLabelColor, setShape, setSize, setXcor, setYcor;

  ColorModel = require('engine/core/colormodel');

  NLType = require('../typechecker');

  StrictMath = require('shim/strictmath');

  NLMath = require('util/nlmath');

  clone = require('brazierjs/object').clone;

  ref = require('../structure/variablespec'), ImmutableVariableSpec = ref.ImmutableVariableSpec, MutableVariableSpec = ref.MutableVariableSpec;

  ref1 = require('util/exception'), ignoring = ref1.ignoring, TopologyInterrupt = ref1.TopologyInterrupt;


  /*
   "Jason, this is craziness!", you say.  "Not quite," I say.  It _is_ kind of lame, but changing turtle members
   needs to be controlled, so that all changes cause updates to be triggered.  And since the `VariableManager` needs
   to know how to set all of the variables, we may as well declare the code for that in a place where it can be
   easily reused. --JAB (6/2/14, 8/28/15)
   */

  ignorantly = ignoring(TopologyInterrupt);

  setXcor = function(newX, seenTurtlesSet) {
    var dx, f, oldX, originPatch;
    if (seenTurtlesSet == null) {
      seenTurtlesSet = {};
    }
    originPatch = this.getPatchHere();
    oldX = this.xcor;
    this.xcor = this.world.topology.wrapX(newX);
    this._updateVarsByName("xcor");
    this._drawLine(oldX, this.ycor, newX, this.ycor);
    if (originPatch !== this.getPatchHere()) {
      originPatch.untrackTurtle(this);
      this.getPatchHere().trackTurtle(this);
    }
    this.linkManager._refresh();
    dx = newX - oldX;
    f = (function(_this) {
      return function(seenTurtles) {
        return function(turtle) {
          return ignorantly(function() {
            return setXcor.call(turtle, turtle.xcor + dx, seenTurtles);
          });
        };
      };
    })(this);
    this._withEachTiedTurtle(f, seenTurtlesSet);
  };

  setYcor = function(newY, seenTurtlesSet) {
    var dy, f, oldY, originPatch;
    if (seenTurtlesSet == null) {
      seenTurtlesSet = {};
    }
    originPatch = this.getPatchHere();
    oldY = this.ycor;
    this.ycor = this.world.topology.wrapY(newY);
    this._updateVarsByName("ycor");
    this._drawLine(this.xcor, oldY, this.xcor, newY);
    if (originPatch !== this.getPatchHere()) {
      originPatch.untrackTurtle(this);
      this.getPatchHere().trackTurtle(this);
    }
    this.linkManager._refresh();
    dy = newY - oldY;
    f = (function(_this) {
      return function(seenTurtles) {
        return function(turtle) {
          return ignorantly(function() {
            return setYcor.call(turtle, turtle.ycor + dy, seenTurtles);
          });
        };
      };
    })(this);
    this._withEachTiedTurtle(f, seenTurtlesSet);
  };

  setBreedShape = function(shape) {
    this._breedShape = shape.toLowerCase();
    if (this._givenShape == null) {
      this._genVarUpdate("shape");
    }
  };

  setBreed = function(breed) {
    var newNames, oldNames, ref2, specialName, trueBreed, type;
    type = NLType(breed);
    trueBreed = (function() {
      if (type.isString()) {
        return this.world.breedManager.get(breed);
      } else if (type.isAgentSet()) {
        specialName = breed.getSpecialName();
        if ((specialName != null) && !this.world.breedManager.get(specialName).isLinky()) {
          return this.world.breedManager.get(specialName);
        } else {
          throw new Error("You can't set BREED to a non-breed agentset.");
        }
      } else {
        return breed;
      }
    }).call(this);
    if ((this._breed != null) && this._breed !== trueBreed) {
      this._givenShape = void 0;
    }
    if (this._breed !== trueBreed) {
      trueBreed.add(this);
      if ((ref2 = this._breed) != null) {
        ref2.remove(this);
      }
      newNames = this._varNamesForBreed(trueBreed);
      oldNames = this._varNamesForBreed(this._breed);
      this._varManager.refineBy(oldNames, newNames);
    }
    this._breed = trueBreed;
    this._genVarUpdate("breed");
    setBreedShape.call(this, trueBreed.getShape());
    this._refreshName();
    if (!this.world.breedManager.turtles().contains(this)) {
      this.world.breedManager.turtles().add(this);
    }
  };

  setColor = function(color) {
    this._color = ColorModel.wrapColor(color);
    this._genVarUpdate("color");
  };

  setHeading = function(heading, seenTurtlesSet) {
    var dh, oldHeading;
    if (seenTurtlesSet == null) {
      seenTurtlesSet = {};
    }
    oldHeading = this._heading;
    this._heading = NLMath.normalizeHeading(heading);
    this._genVarUpdate("heading");
    dh = NLMath.subtractHeadings(this._heading, oldHeading);
    _handleTiesForHeadingChange.call(this, seenTurtlesSet, dh);
  };

  setIsHidden = function(isHidden) {
    this._hidden = isHidden;
    this._genVarUpdate("hidden?");
  };

  setLabel = function(label) {
    this._label = label;
    this._genVarUpdate("label");
  };

  setLabelColor = function(color) {
    this._labelcolor = ColorModel.wrapColor(color);
    this._genVarUpdate("label-color");
  };

  setShape = function(shape) {
    this._givenShape = shape.toLowerCase();
    this._genVarUpdate("shape");
  };

  setSize = function(size) {
    this._size = size;
    this._genVarUpdate("size");
  };

  _handleTiesForHeadingChange = function(seenTurtlesSet, dh) {
    var filteredPairs, ref2, turtleModePairs, x, y;
    ref2 = this.getCoords(), x = ref2[0], y = ref2[1];
    turtleModePairs = this.linkManager.myOutLinks("LINKS").toArray().map((function(_this) {
      return function(arg) {
        var end1, end2, tiemode;
        end1 = arg.end1, end2 = arg.end2, tiemode = arg.tiemode;
        return [(end1 === _this ? end2 : end1), tiemode];
      };
    })(this));
    seenTurtlesSet[this.id] = true;
    filteredPairs = turtleModePairs.filter(function(arg) {
      var id, mode, ref3, result;
      (ref3 = arg[0], id = ref3.id), mode = arg[1];
      result = (seenTurtlesSet[id] == null) && mode !== "none";
      seenTurtlesSet[id] = true;
      return result;
    });
    filteredPairs.forEach((function(_this) {
      return function(arg) {
        var ex, mode, newX, newY, r, theta, turtle, wentBoom;
        turtle = arg[0], mode = arg[1];
        wentBoom = (function() {
          var error;
          try {
            r = this.distance(turtle);
            if (r !== 0) {
              theta = this.towards(turtle) + dh;
              newX = x + r * NLMath.squash(NLMath.sin(theta));
              newY = y + r * NLMath.squash(NLMath.cos(theta));
              turtle.setXY(newX, newY, clone(seenTurtlesSet));
            }
            return false;
          } catch (error) {
            ex = error;
            if (ex instanceof TopologyInterrupt) {
              return true;
            } else {
              throw ex;
            }
          }
        }).call(_this);
        if (mode === "fixed" && !wentBoom) {
          return turtle.right(dh, clone(seenTurtlesSet));
        }
      };
    })(this));
  };

  Setters = {
    setXcor: setXcor,
    setYcor: setYcor,
    setBreed: setBreed,
    setColor: setColor,
    setHeading: setHeading,
    setIsHidden: setIsHidden,
    setLabel: setLabel,
    setLabelColor: setLabelColor,
    setShape: setShape,
    setSize: setSize
  };

  getBreed = (function() {
    return this.world.turtleManager.turtlesOfBreed(this._breed.name);
  });

  VariableSpecs = [
    new ImmutableVariableSpec('who', function() {
      return this.id;
    }), new MutableVariableSpec('breed', getBreed, setBreed), new MutableVariableSpec('color', (function() {
      return this._color;
    }), setColor), new MutableVariableSpec('heading', (function() {
      return this._heading;
    }), setHeading), new MutableVariableSpec('hidden?', (function() {
      return this._hidden;
    }), setIsHidden), new MutableVariableSpec('label', (function() {
      return this._label;
    }), setLabel), new MutableVariableSpec('label-color', (function() {
      return this._labelcolor;
    }), setLabelColor), new MutableVariableSpec('pen-mode', (function() {
      return this.penManager.getMode().toString();
    }), (function(x) {
      return this.penManager.setPenMode(x);
    })), new MutableVariableSpec('pen-size', (function() {
      return this.penManager.getSize();
    }), (function(x) {
      return this.penManager.setSize(x);
    })), new MutableVariableSpec('shape', (function() {
      return this._getShape();
    }), setShape), new MutableVariableSpec('size', (function() {
      return this._size;
    }), setSize), new MutableVariableSpec('xcor', (function() {
      return this.xcor;
    }), setXcor), new MutableVariableSpec('ycor', (function() {
      return this.ycor;
    }), setYcor)
  ];

  module.exports = {
    Setters: Setters,
    VariableSpecs: VariableSpecs
  };

}).call(this);

},{"../structure/variablespec":"engine/core/structure/variablespec","../typechecker":"engine/core/typechecker","brazierjs/object":"brazier/object","engine/core/colormodel":"engine/core/colormodel","shim/strictmath":"shim/strictmath","util/exception":"util/exception","util/nlmath":"util/nlmath"}],"engine/core/turtlelinkmanager":[function(require,module,exports){
(function() {
  var All, DeathInterrupt, In, LinkManager, LinkSet, Out, TurtleSet, filter, flatMap, ignorantly, ignoring, linkBreedMatches, map, otherEnd, pipeline, ref, ref1, unique;

  LinkSet = require('./linkset');

  TurtleSet = require('./turtleset');

  ref = require('brazierjs/array'), filter = ref.filter, flatMap = ref.flatMap, map = ref.map, unique = ref.unique;

  pipeline = require('brazierjs/function').pipeline;

  ref1 = require('util/exception'), DeathInterrupt = ref1.DeathInterrupt, ignoring = ref1.ignoring;

  ignorantly = ignoring(DeathInterrupt);

  All = {};

  In = {};

  Out = {};

  otherEnd = function(sourceID) {
    return function(arg) {
      var end1, end2;
      end1 = arg.end1, end2 = arg.end2;
      if (end1.id === sourceID) {
        return end2;
      } else {
        return end1;
      }
    };
  };

  linkBreedMatches = function(breedName) {
    return function(directedness) {
      return function(ownerID) {
        return function(link) {
          return (breedName === "LINKS" || breedName === link.getBreedName()) && ((directedness === All) || (!link.isDirected) || (directedness === In && link.end2.id === ownerID) || (directedness === Out && link.end1.id === ownerID));
        };
      };
    };
  };

  module.exports = LinkManager = (function() {
    LinkManager._links = void 0;

    function LinkManager(_ownerID, _world) {
      this._ownerID = _ownerID;
      this._world = _world;
      this.clear();
    }

    LinkManager.prototype.add = function(link) {
      this._links.push(link);
    };

    LinkManager.prototype.clear = function() {
      var oldLinks, ref2;
      oldLinks = (ref2 = this._links) != null ? ref2 : [];
      this._links = [];
      oldLinks.forEach(function(link) {
        return ignorantly((function(_this) {
          return function() {
            return link.die();
          };
        })(this));
      });
    };

    LinkManager.prototype.inLinkFrom = function(breedName, otherTurtle) {
      return this._findLink(otherTurtle, breedName, In);
    };

    LinkManager.prototype.inLinkNeighbors = function(breedName) {
      return this._neighbors(breedName, In);
    };

    LinkManager.prototype.isInLinkNeighbor = function(breedName, turtle) {
      return this.inLinkFrom(breedName, turtle) !== Nobody;
    };

    LinkManager.prototype.isLinkNeighbor = function(breedName, turtle) {
      return this.isOutLinkNeighbor(breedName, turtle) || this.isInLinkNeighbor(breedName, turtle);
    };

    LinkManager.prototype.isOutLinkNeighbor = function(breedName, turtle) {
      return this.outLinkTo(breedName, turtle) !== Nobody;
    };

    LinkManager.prototype.linkWith = function(breedName, otherTurtle) {
      return this._findLink(otherTurtle, breedName, All);
    };

    LinkManager.prototype.linkNeighbors = function(breedName) {
      return this._neighbors(breedName, All);
    };

    LinkManager.prototype.myInLinks = function(breedName) {
      return new LinkSet(this._links.filter(linkBreedMatches(breedName)(In)(this._ownerID)), this._world);
    };

    LinkManager.prototype.myLinks = function(breedName) {
      return new LinkSet(this._links.filter(linkBreedMatches(breedName)(All)(this._ownerID)), this._world);
    };

    LinkManager.prototype.myOutLinks = function(breedName) {
      return new LinkSet(this._links.filter(linkBreedMatches(breedName)(Out)(this._ownerID)), this._world);
    };

    LinkManager.prototype.outLinkNeighbors = function(breedName) {
      return this._neighbors(breedName, Out);
    };

    LinkManager.prototype.outLinkTo = function(breedName, otherTurtle) {
      return this._findLink(otherTurtle, breedName, Out);
    };

    LinkManager.prototype.remove = function(link) {
      this._links.splice(this._links.indexOf(link), 1);
    };

    LinkManager.prototype._findLink = function(otherTurtle, breedName, directedness) {
      var linkDoesMatch, links;
      linkDoesMatch = (function(_this) {
        return function(l) {
          return otherEnd(_this._ownerID)(l) === otherTurtle && linkBreedMatches(breedName)(directedness)(_this._ownerID)(l);
        };
      })(this);
      links = this._links.filter(linkDoesMatch);
      if (links.length === 0) {
        return Nobody;
      } else if (links.length === 1) {
        return links[0];
      } else {
        return links[this._world.rng.nextInt(links.length)];
      }
    };

    LinkManager.prototype.neighborsIn = function(linkSet) {
      var collectOtherEnd;
      collectOtherEnd = (function(_this) {
        return function(arg) {
          var end1, end2, isEnd1, isEnd2;
          end1 = arg.end1, end2 = arg.end2;
          isEnd1 = end1.id === _this._ownerID;
          isEnd2 = end2.id === _this._ownerID;
          if (isEnd1 && (!isEnd2)) {
            return [end2];
          } else if (isEnd2 && (!isEnd1)) {
            return [end1];
          } else {
            return [];
          }
        };
      })(this);
      return pipeline(flatMap(collectOtherEnd), unique)(linkSet.toArray());
    };

    LinkManager.prototype._neighbors = function(breedName, directedness) {
      return pipeline(filter(linkBreedMatches(breedName)(directedness)(this._ownerID)), map(otherEnd(this._ownerID)), unique, ((function(_this) {
        return function(turtles) {
          return new TurtleSet(turtles, _this._world);
        };
      })(this)))(this._links);
    };

    LinkManager.prototype._refresh = function() {
      this._links.forEach(function(link) {
        link.updateEndRelatedVars();
      });
    };

    return LinkManager;

  })();

}).call(this);

},{"./linkset":"engine/core/linkset","./turtleset":"engine/core/turtleset","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","util/exception":"util/exception"}],"engine/core/turtleset":[function(require,module,exports){
(function() {
  var AbstractAgentSet, DeadSkippingIterator, TurtleSet,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  AbstractAgentSet = require('./abstractagentset');

  DeadSkippingIterator = require('./structure/deadskippingiterator');

  module.exports = TurtleSet = (function(superClass) {
    extend(TurtleSet, superClass);

    function TurtleSet(_agents, world, specialName) {
      this._agents = _agents;
      TurtleSet.__super__.constructor.call(this, this._agents, world, "turtles", specialName);
    }

    TurtleSet.prototype.iterator = function() {
      return new DeadSkippingIterator(this._agents.slice(0));
    };

    TurtleSet.prototype._unsafeIterator = function() {
      return new DeadSkippingIterator(this._agents);
    };

    return TurtleSet;

  })(AbstractAgentSet);

}).call(this);

},{"./abstractagentset":"engine/core/abstractagentset","./structure/deadskippingiterator":"engine/core/structure/deadskippingiterator"}],"engine/core/turtle":[function(require,module,exports){
(function() {
  var AbstractAgentSet, ColorModel, Comparator, Death, Down, Erase, ExtraVariableSpec, NLMath, NLType, PenManager, Setters, Stamp, StampErase, StampMode, TopologyInterrupt, Turtle, TurtleLinkManager, TurtleSet, VariableManager, VariableSpecs, foldl, forEach, ignorantly, ignoring, makePenLines, map, rangeUntil, ref, ref1, ref2, ref3, ref4, uniqueBy,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  AbstractAgentSet = require('./abstractagentset');

  ColorModel = require('engine/core/colormodel');

  TurtleLinkManager = require('./turtlelinkmanager');

  TurtleSet = require('./turtleset');

  NLType = require('./typechecker');

  VariableManager = require('./structure/variablemanager');

  makePenLines = require('./turtle/makepenlines');

  Comparator = require('util/comparator');

  NLMath = require('util/nlmath');

  ref = require('brazierjs/array'), foldl = ref.foldl, forEach = ref.forEach, map = ref.map, uniqueBy = ref.uniqueBy;

  rangeUntil = require('brazierjs/number').rangeUntil;

  ref1 = require('./structure/penmanager'), PenManager = ref1.PenManager, (ref2 = ref1.PenStatus, Down = ref2.Down, Erase = ref2.Erase);

  ExtraVariableSpec = require('./structure/variablespec').ExtraVariableSpec;

  ref3 = require('util/exception'), Death = ref3.DeathInterrupt, ignoring = ref3.ignoring, TopologyInterrupt = ref3.TopologyInterrupt;

  ref4 = require('./turtle/turtlevariables'), Setters = ref4.Setters, VariableSpecs = ref4.VariableSpecs;

  ignorantly = ignoring(TopologyInterrupt);

  StampMode = (function() {
    function StampMode(name1) {
      this.name = name1;
    }

    return StampMode;

  })();

  Stamp = new StampMode("normal");

  StampErase = new StampMode("erase");

  module.exports = Turtle = (function() {
    Turtle.prototype._breed = void 0;

    Turtle.prototype._breedShape = void 0;

    Turtle.prototype._name = void 0;

    Turtle.prototype._updateVarsByName = void 0;

    Turtle.prototype._varManager = void 0;

    Turtle.prototype.linkManager = void 0;

    function Turtle(world, id1, _genUpdate, _registerLineDraw, _registerTurtleStamp, _registerDeath, _createTurtle, _removeTurtle, _color, _heading, xcor1, ycor1, breed, _label, _labelcolor, _hidden, _size, _givenShape, genPenManager) {
      var varNames;
      this.world = world;
      this.id = id1;
      this._genUpdate = _genUpdate;
      this._registerLineDraw = _registerLineDraw;
      this._registerTurtleStamp = _registerTurtleStamp;
      this._registerDeath = _registerDeath;
      this._createTurtle = _createTurtle;
      this._removeTurtle = _removeTurtle;
      this._color = _color != null ? _color : 0;
      this._heading = _heading != null ? _heading : 0;
      this.xcor = xcor1 != null ? xcor1 : 0;
      this.ycor = ycor1 != null ? ycor1 : 0;
      if (breed == null) {
        breed = this.world.breedManager.turtles();
      }
      this._label = _label != null ? _label : "";
      this._labelcolor = _labelcolor != null ? _labelcolor : 9.9;
      this._hidden = _hidden != null ? _hidden : false;
      this._size = _size != null ? _size : 1.0;
      this._givenShape = _givenShape;
      if (genPenManager == null) {
        genPenManager = (function(_this) {
          return function(self) {
            return new PenManager(_this._genUpdate(self));
          };
        })(this);
      }
      this.patchAt = bind(this.patchAt, this);
      this._updateVarsByName = this._genUpdate(this);
      this.penManager = genPenManager(this);
      this.linkManager = new TurtleLinkManager(this.id, this.world);
      varNames = this._varNamesForBreed(breed);
      this._varManager = this._genVarManager(varNames);
      Setters.setBreed.call(this, breed);
      if (this._givenShape != null) {
        Setters.setShape.call(this, this._givenShape);
      }
      this.getPatchHere().trackTurtle(this);
    }

    Turtle.prototype.getBreedName = function() {
      return this._breed.name;
    };

    Turtle.prototype.getBreedNameSingular = function() {
      return this._breed.singular;
    };

    Turtle.prototype.getName = function() {
      return this._name;
    };

    Turtle.prototype.canMove = function(distance) {
      return this.patchAhead(distance) !== Nobody;
    };

    Turtle.prototype.distance = function(agent) {
      return this.world.topology.distance(this.xcor, this.ycor, agent);
    };

    Turtle.prototype.distanceXY = function(x, y) {
      return this.world.topology.distanceXY(this.xcor, this.ycor, x, y);
    };

    Turtle.prototype.getCoords = function() {
      return [this.xcor, this.ycor];
    };

    Turtle.prototype.towards = function(agent) {
      var ref5, x, y;
      ref5 = agent.getCoords(), x = ref5[0], y = ref5[1];
      return this.towardsXY(x, y);
    };

    Turtle.prototype.towardsXY = function(x, y) {
      return this.world.topology.towards(this.xcor, this.ycor, x, y);
    };

    Turtle.prototype.faceXY = function(x, y) {
      if (x !== this.xcor || y !== this.ycor) {
        Setters.setHeading.call(this, this.world.topology.towards(this.xcor, this.ycor, x, y));
      }
    };

    Turtle.prototype.face = function(agent) {
      var ref5, x, y;
      ref5 = agent.getCoords(), x = ref5[0], y = ref5[1];
      this.faceXY(x, y);
    };

    Turtle.prototype.inCone = function(agents, distance, angle) {
      if (distance < 0) {
        throw new Error("IN-CONE cannot take a negative radius.");
      } else if (angle < 0) {
        throw new Error("IN-CONE cannot take a negative angle.");
      } else if (angle > 360) {
        throw new Error("IN-CONE cannot take an angle greater than 360.");
      } else {
        return this.world.topology.inCone(this.xcor, this.ycor, NLMath.normalizeHeading(this._heading), agents, distance, angle);
      }
    };

    Turtle.prototype.inRadius = function(agents, radius) {
      return this.world.topology.inRadius(this.xcor, this.ycor, agents, radius);
    };

    Turtle.prototype.patchAt = function(dx, dy) {
      return this.world.patchAtCoords(this.xcor + dx, this.ycor + dy);
    };

    Turtle.prototype.turtlesAt = function(dx, dy) {
      return this.getPatchHere().turtlesAt(dx, dy);
    };

    Turtle.prototype.breedAt = function(breedName, dx, dy) {
      return this.getPatchHere().breedAt(breedName, dx, dy);
    };

    Turtle.prototype.otherEnd = function() {
      if (this === this.world.selfManager.myself().end1) {
        return this.world.selfManager.myself().end2;
      } else {
        return this.world.selfManager.myself().end1;
      }
    };

    Turtle.prototype.patchAtHeadingAndDistance = function(angle, distance) {
      return this.world.patchAtHeadingAndDistanceFrom(angle, distance, this.xcor, this.ycor);
    };

    Turtle.prototype.patchRightAndAhead = function(angle, distance) {
      return this.patchAtHeadingAndDistance(this._heading + angle, distance);
    };

    Turtle.prototype.patchLeftAndAhead = function(angle, distance) {
      return this.patchRightAndAhead(-angle, distance);
    };

    Turtle.prototype.patchAhead = function(distance) {
      return this.patchRightAndAhead(0, distance);
    };

    Turtle.prototype.ask = function(f) {
      var base;
      if (!this.isDead()) {
        this.world.selfManager.askAgent(f)(this);
        if (typeof (base = this.world.selfManager.self()).isDead === "function" ? base.isDead() : void 0) {
          throw new Death;
        }
      } else {
        throw new Error("That " + (this.getBreedNameSingular()) + " is dead.");
      }
    };

    Turtle.prototype.projectionBy = function(f) {
      if (!this.isDead()) {
        return this.world.selfManager.askAgent(f)(this);
      } else {
        throw new Error("That " + this._breed.singular + " is dead.");
      }
    };

    Turtle.prototype.fd = function(distance) {
      var increment, remaining;
      increment = distance > 0 ? 1 : -1;
      remaining = distance;
      if (distance > 0) {
        while (remaining >= increment && this.jumpIfAble(increment)) {
          remaining -= increment;
        }
      } else if (distance < 0) {
        while (remaining <= increment && this.jumpIfAble(increment)) {
          remaining -= increment;
        }
      }
      if (remaining !== 0) {
        this.jumpIfAble(remaining);
      }
    };

    Turtle.prototype._optimalFdOne = function() {
      this.jumpIfAble(1);
    };

    Turtle.prototype._optimalFdLessThan1 = function(distance) {
      this.jumpIfAble(distance);
    };

    Turtle.prototype._optimalNSum = function(varName) {
      return this.getPatchHere()._optimalNSum(varName);
    };

    Turtle.prototype._optimalNSum4 = function(varName) {
      return this.getPatchHere()._optimalNSum4(varName);
    };

    Turtle.prototype.jumpIfAble = function(distance) {
      var canMove;
      canMove = this.canMove(distance);
      if (canMove) {
        this._jump(distance);
      }
      return canMove;
    };

    Turtle.prototype._jump = function(distance) {
      this._drawJumpLine(this.xcor, this.ycor, distance);
      this._setXandY(this.xcor + distance * this.dx(), this.ycor + distance * this.dy());
    };

    Turtle.prototype.dx = function() {
      return NLMath.squash(NLMath.sin(this._heading));
    };

    Turtle.prototype.dy = function() {
      return NLMath.squash(NLMath.cos(this._heading));
    };

    Turtle.prototype.right = function(angle, seenTurtlesSet) {
      var newHeading;
      if (seenTurtlesSet == null) {
        seenTurtlesSet = {};
      }
      newHeading = this._heading + angle;
      Setters.setHeading.call(this, newHeading, seenTurtlesSet);
    };

    Turtle.prototype.setXY = function(x, y, seenTurtlesSet) {
      var error, error1, origXcor, origYcor;
      if (seenTurtlesSet == null) {
        seenTurtlesSet = {};
      }
      origXcor = this.xcor;
      origYcor = this.ycor;
      try {
        this._setXandY(x, y, seenTurtlesSet);
        this._drawLine(origXcor, origYcor, x, y);
      } catch (error1) {
        error = error1;
        this._setXandY(origXcor, origYcor, seenTurtlesSet);
        if (error instanceof TopologyInterrupt) {
          throw new TopologyInterrupt("The point [ " + x + " , " + y + " ] is outside of the boundaries of the world and wrapping is not permitted in one or both directions.");
        } else {
          throw error;
        }
      }
    };

    Turtle.prototype.goHome = function() {
      this.setXY(0, 0);
    };

    Turtle.prototype.hideTurtle = function(shouldHide) {
      Setters.setIsHidden.call(this, shouldHide);
    };

    Turtle.prototype.isBreed = function(breedName) {
      return this._breed.name.toUpperCase() === breedName.toUpperCase();
    };

    Turtle.prototype.isDead = function() {
      return this.id === -1;
    };

    Turtle.prototype.die = function() {
      this._breed.remove(this);
      if (!this.isDead()) {
        this._removeTurtle(this.id);
        this._seppuku();
        this.linkManager.clear();
        this.id = -1;
        this.getPatchHere().untrackTurtle(this);
        this.world.observer.unfocus(this);
      }
      throw new Death("Call only from inside an askAgent block");
    };

    Turtle.prototype.getVariable = function(varName) {
      return this._varManager[varName];
    };

    Turtle.prototype.setVariable = function(varName, value) {
      this._varManager[varName] = value;
    };

    Turtle.prototype.getPatchHere = function() {
      return this.world.getPatchAt(this.xcor, this.ycor);
    };

    Turtle.prototype.getPatchVariable = function(varName) {
      return this.getPatchHere().getVariable(varName);
    };

    Turtle.prototype.setPatchVariable = function(varName, value) {
      this.getPatchHere().setVariable(varName, value);
    };

    Turtle.prototype.getNeighbors = function() {
      return this.getPatchHere().getNeighbors();
    };

    Turtle.prototype.getNeighbors4 = function() {
      return this.getPatchHere().getNeighbors4();
    };

    Turtle.prototype.turtlesHere = function() {
      return this.getPatchHere().turtlesHere();
    };

    Turtle.prototype.breedHere = function(breedName) {
      return this.getPatchHere().breedHere(breedName);
    };

    Turtle.prototype.hatch = function(n, breedName) {
      var breed, isNameValid, newTurtles, num;
      num = n >= 0 ? n : 0;
      isNameValid = (breedName != null) && breedName !== "";
      breed = isNameValid ? this.world.breedManager.get(breedName) : this._breed;
      newTurtles = map((function(_this) {
        return function() {
          return _this._makeTurtleCopy(breed);
        };
      })(this))(rangeUntil(0)(num));
      return new TurtleSet(newTurtles, this.world);
    };

    Turtle.prototype._makeTurtleCopy = function(breed) {
      var shape, turtle, varNames;
      shape = breed === this._breed ? this._givenShape : void 0;
      turtle = this._createTurtle(this._color, this._heading, this.xcor, this.ycor, breed, this._label, this._labelcolor, this._hidden, this._size, shape, (function(_this) {
        return function(self) {
          return _this.penManager.clone(_this._genUpdate(self));
        };
      })(this));
      varNames = this._varNamesForBreed(breed);
      forEach((function(_this) {
        return function(varName) {
          var ref5;
          turtle.setVariable(varName, (ref5 = _this.getVariable(varName)) != null ? ref5 : 0);
        };
      })(this))(varNames);
      return turtle;
    };

    Turtle.prototype._varNamesForBreed = function(breed) {
      var turtlesBreed;
      turtlesBreed = this.world.breedManager.turtles();
      if (breed === turtlesBreed || (breed == null)) {
        return turtlesBreed.varNames;
      } else {
        return turtlesBreed.varNames.concat(breed.varNames);
      }
    };

    Turtle.prototype.moveTo = function(agent) {
      var ref5, x, y;
      ref5 = agent.getCoords(), x = ref5[0], y = ref5[1];
      this.setXY(x, y);
    };

    Turtle.prototype.followMe = function() {
      this.world.observer.follow(this);
    };

    Turtle.prototype.rideMe = function() {
      this.world.observer.ride(this);
    };

    Turtle.prototype.watchMe = function() {
      this.world.observer.watch(this);
    };

    Turtle.prototype.stamp = function() {
      this._drawStamp(Stamp);
    };

    Turtle.prototype.stampErase = function() {
      this._drawStamp(StampErase);
    };

    Turtle.prototype.compare = function(x) {
      if (NLType(x).isTurtle()) {
        return Comparator.numericCompare(this.id, x.id);
      } else {
        return Comparator.NOT_EQUALS;
      }
    };

    Turtle.prototype.toString = function() {
      if (!this.isDead()) {
        return "(" + (this.getName()) + ")";
      } else {
        return "nobody";
      }
    };

    Turtle.prototype.varNames = function() {
      return this._varManager.names();
    };

    Turtle.prototype._drawStamp = function(mode) {
      this._registerTurtleStamp(this.xcor, this.ycor, this._size, this._heading, ColorModel.colorToRGB(this._color), this._getShape(), mode.name);
    };

    Turtle.prototype._drawLine = function(oldX, oldY, newX, newY) {
      var penMode, wrappedX, wrappedY;
      penMode = this.penManager.getMode();
      if ((penMode === Down || penMode === Erase) && (oldX !== newX || oldY !== newY)) {
        wrappedX = this.world.topology.wrapX(newX);
        wrappedY = this.world.topology.wrapY(newY);
        this._registerLineDraw(oldX, oldY, wrappedX, wrappedY, ColorModel.colorToRGB(this._color), this.penManager.getSize(), this.penManager.getMode().toString());
      }
    };

    Turtle.prototype._drawJumpLine = function(x, y, dist) {
      var color, lines, maxPxcor, maxPycor, minPxcor, minPycor, mode, penMode, ref5, size;
      penMode = this.penManager.getMode();
      if (penMode === Down || penMode === Erase) {
        color = ColorModel.colorToRGB(this._color);
        size = this.penManager.getSize();
        mode = this.penManager.getMode().toString();
        ref5 = this.world.topology, minPxcor = ref5.minPxcor, maxPxcor = ref5.maxPxcor, minPycor = ref5.minPycor, maxPycor = ref5.maxPycor;
        lines = makePenLines(x, y, NLMath.normalizeHeading(this._heading), dist, minPxcor - 0.5, maxPxcor + 0.5, minPycor - 0.5, maxPycor + 0.5);
        forEach((function(_this) {
          return function(arg) {
            var x1, x2, y1, y2;
            x1 = arg.x1, y1 = arg.y1, x2 = arg.x2, y2 = arg.y2;
            _this._registerLineDraw(x1, y1, x2, y2, color, size, mode);
          };
        })(this))(lines);
      }
    };

    Turtle.prototype._getShape = function() {
      var ref5;
      return (ref5 = this._givenShape) != null ? ref5 : this._breedShape;
    };

    Turtle.prototype._linkBreedMatches = function(breedName) {
      return function(link) {
        return breedName === "LINKS" || breedName === link.getBreedName();
      };
    };

    Turtle.prototype._seppuku = function() {
      this._registerDeath(this.id);
    };

    Turtle.prototype._tiedTurtlesRaw = function() {
      var f, fixeds, links, others, ref5;
      links = this.linkManager.myOutLinks("LINKS").toArray().filter(function(l) {
        return l.tiemode !== "none";
      });
      f = (function(_this) {
        return function(arg, arg1) {
          var end1, end2, fixeds, others, tiemode, turtle;
          fixeds = arg[0], others = arg[1];
          end1 = arg1.end1, end2 = arg1.end2, tiemode = arg1.tiemode;
          turtle = end1 === _this ? end2 : end1;
          if (tiemode === "fixed") {
            return [fixeds.concat([turtle]), others];
          } else {
            return [fixeds, others.concat([turtle])];
          }
        };
      })(this);
      ref5 = foldl(f)([[], []])(links), fixeds = ref5[0], others = ref5[1];
      return {
        fixeds: fixeds,
        others: others
      };
    };

    Turtle.prototype._tiedTurtles = function() {
      var fixeds, others, ref5;
      ref5 = this._tiedTurtlesRaw(), fixeds = ref5.fixeds, others = ref5.others;
      return this._uniqueTurtles(fixeds.concat(others));
    };

    Turtle.prototype._fixedTiedTurtles = function() {
      return this._uniqueTurtles(this._tiedTurtlesRaw().fixeds);
    };

    Turtle.prototype._uniqueTurtles = function(turtles) {
      return uniqueBy(function(t) {
        return t.id;
      })(turtles);
    };

    Turtle.prototype._genVarManager = function(extraVarNames) {
      var allSpecs, extraSpecs;
      extraSpecs = extraVarNames.map(function(name) {
        return new ExtraVariableSpec(name);
      });
      allSpecs = VariableSpecs.concat(extraSpecs);
      return new VariableManager(this, allSpecs);
    };

    Turtle.prototype._genVarUpdate = function(varName) {
      this._updateVarsByName(varName);
    };

    Turtle.prototype._refreshName = function() {
      this._name = this._breed.singular + " " + this.id;
    };

    Turtle.prototype._setXandY = function(newX, newY, seenTurtlesSet) {
      var dx, dy, f, oldX, oldY, originPatch, xcor, ycor;
      if (seenTurtlesSet == null) {
        seenTurtlesSet = {};
      }
      originPatch = this.getPatchHere();
      oldX = this.xcor;
      oldY = this.ycor;
      xcor = this.world.topology.wrapX(newX);
      ycor = this.world.topology.wrapY(newY);
      this.xcor = xcor;
      this.ycor = ycor;
      this._updateVarsByName("xcor", "ycor");
      if (originPatch !== this.getPatchHere()) {
        originPatch.untrackTurtle(this);
        this.getPatchHere().trackTurtle(this);
      }
      this.linkManager._refresh();
      dx = newX - oldX;
      dy = newY - oldY;
      f = (function(_this) {
        return function(seenTurtles) {
          return function(turtle) {
            return ignorantly(function() {
              return turtle._setXandY(turtle.xcor + dx, turtle.ycor + dy, seenTurtles);
            });
          };
        };
      })(this);
      this._withEachTiedTurtle(f, seenTurtlesSet);
    };

    Turtle.prototype._withEachTiedTurtle = function(f, seenTurtlesSet) {
      var turtles;
      seenTurtlesSet[this.id] = true;
      turtles = this._tiedTurtles().filter(function(arg) {
        var id;
        id = arg.id;
        return seenTurtlesSet[id] == null;
      });
      turtles.forEach(function(arg) {
        var id;
        id = arg.id;
        return seenTurtlesSet[id] = true;
      });
      turtles.forEach(f(seenTurtlesSet));
    };

    Turtle.prototype._optimalPatchHereInternal = function() {
      return this.getPatchHere();
    };

    Turtle.prototype._optimalPatchNorth = function() {
      return this.getPatchHere()._optimalPatchNorth();
    };

    Turtle.prototype._optimalPatchEast = function() {
      return this.getPatchHere()._optimalPatchEast();
    };

    Turtle.prototype._optimalPatchSouth = function() {
      return this.getPatchHere()._optimalPatchSouth();
    };

    Turtle.prototype._optimalPatchWest = function() {
      return this.getPatchHere()._optimalPatchWest();
    };

    Turtle.prototype._optimalPatchNorthEast = function() {
      return this.getPatchHere()._optimalPatchNorthEast();
    };

    Turtle.prototype._optimalPatchSouthEast = function() {
      return this.getPatchHere()._optimalPatchSouthEast();
    };

    Turtle.prototype._optimalPatchSouthWest = function() {
      return this.getPatchHere()._optimalPatchSouthWest();
    };

    Turtle.prototype._optimalPatchNorthWest = function() {
      return this.getPatchHere()._optimalPatchNorthWest();
    };

    return Turtle;

  })();

}).call(this);

},{"./abstractagentset":"engine/core/abstractagentset","./structure/penmanager":"engine/core/structure/penmanager","./structure/variablemanager":"engine/core/structure/variablemanager","./structure/variablespec":"engine/core/structure/variablespec","./turtle/makepenlines":"engine/core/turtle/makepenlines","./turtle/turtlevariables":"engine/core/turtle/turtlevariables","./turtlelinkmanager":"engine/core/turtlelinkmanager","./turtleset":"engine/core/turtleset","./typechecker":"engine/core/typechecker","brazierjs/array":"brazier/array","brazierjs/number":"brazier/number","engine/core/colormodel":"engine/core/colormodel","util/comparator":"util/comparator","util/exception":"util/exception","util/nlmath":"util/nlmath"}],"engine/core/typechecker":[function(require,module,exports){
(function() {
  var AbstractAgentSet, JSType, Link, LinkSet, NLType, Patch, PatchSet, Turtle, TurtleSet;

  NLType = (function() {
    function NLType(_x) {
      this._x = _x;
    }

    return NLType;

  })();

  module.exports = function(x) {
    return new NLType(x);
  };

  AbstractAgentSet = require('./abstractagentset');

  Link = require('./link');

  LinkSet = require('./linkset');

  Patch = require('./patch');

  PatchSet = require('./patchset');

  Turtle = require('./turtle');

  TurtleSet = require('./turtleset');

  JSType = require('util/typechecker');

  NLType.prototype.isAgent = function() {
    return this.isTurtle() || this.isPatch() || this.isLink();
  };

  NLType.prototype.isAgentSet = function() {
    return this._x instanceof AbstractAgentSet;
  };

  NLType.prototype.isBoolean = function() {
    return JSType(this._x).isBoolean();
  };

  NLType.prototype.isBreed = function(breedName) {
    var base, base1;
    return !(typeof (base = this._x).isDead === "function" ? base.isDead() : void 0) && (typeof (base1 = this._x).isBreed === "function" ? base1.isBreed(breedName) : void 0) === true;
  };

  NLType.prototype.isBreedSet = function(breedName) {
    return this.isAgentSet() && (this._x.getSpecialName() != null) && this._x.getSpecialName() === breedName;
  };

  NLType.prototype.isCommandLambda = function() {
    return JSType(this._x).isFunction() && !this._x.isReporter;
  };

  NLType.prototype.isDirectedLink = function() {
    return this.isLink() && this._x.isDirected;
  };

  NLType.prototype.isLinkSet = function() {
    return this._x instanceof LinkSet;
  };

  NLType.prototype.isLink = function() {
    return this._x instanceof Link;
  };

  NLType.prototype.isList = function() {
    return JSType(this._x).isArray();
  };

  NLType.prototype.isNobody = function() {
    return this._x === Nobody;
  };

  NLType.prototype.isNumber = function() {
    return JSType(this._x).isNumber();
  };

  NLType.prototype.isPatchSet = function() {
    return this._x instanceof PatchSet;
  };

  NLType.prototype.isPatch = function() {
    return this._x instanceof Patch;
  };

  NLType.prototype.isReporterLambda = function() {
    return JSType(this._x).isFunction() && this._x.isReporter;
  };

  NLType.prototype.isString = function() {
    return JSType(this._x).isString();
  };

  NLType.prototype.isTurtleSet = function() {
    return this._x instanceof TurtleSet;
  };

  NLType.prototype.isTurtle = function() {
    return this._x instanceof Turtle;
  };

  NLType.prototype.isUndirectedLink = function() {
    return this.isLink() && !this._x.isDirected;
  };

  NLType.prototype.isValidAgent = function() {
    return this.isValidTurtle() || this.isPatch() || this.isValidLink();
  };

  NLType.prototype.isValidDirectedLink = function() {
    return this.isDirectedLink() && !this._x.isDead();
  };

  NLType.prototype.isValidLink = function() {
    return this.isLink() && !this._x.isDead();
  };

  NLType.prototype.isValidTurtle = function() {
    return this.isTurtle() && !this._x.isDead();
  };

  NLType.prototype.isValidUndirectedLink = function() {
    return this.isUndirectedLink() && !this._x.isDead();
  };

}).call(this);

},{"./abstractagentset":"engine/core/abstractagentset","./link":"engine/core/link","./linkset":"engine/core/linkset","./patch":"engine/core/patch","./patchset":"engine/core/patchset","./turtle":"engine/core/turtle","./turtleset":"engine/core/turtleset","util/typechecker":"util/typechecker"}],"engine/core/world/export":[function(require,module,exports){
(function() {
  var AgentReference, BreedNamePair, BreedReference, ExportAllPlotsData, ExportPlotData, ExportWorldData, ExportedAgent, ExportedAgentSet, ExportedColorNum, ExportedCommandLambda, ExportedExtension, ExportedGlobals, ExportedLink, ExportedLinkSet, ExportedPatch, ExportedPatchSet, ExportedPen, ExportedPlot, ExportedPlotManager, ExportedPoint, ExportedRGB, ExportedRGBA, ExportedReporterLambda, ExportedTurtle, ExportedTurtleSet, LinkReference, Metadata, NLType, NobodyReference, PatchReference, TurtleReference, difference, displayModeToString, exportAgent, exportAgentReference, exportBreedReference, exportColor, exportGlobals, exportLinkReference, exportMetadata, exportMiniGlobals, exportPatchReference, exportPlot, exportPlotManager, exportTurtleReference, exportWildcardVar, find, fold, id, isEmpty, linkBuiltins, patchBuiltins, penModeToBool, perspectiveToString, ref, ref1, ref2, ref3, ref4, ref5, ref6, tee, toObject, turtleBuiltins, version,
    slice = [].slice;

  version = require('meta').version;

  ref = require('serialize/exportstructures'), AgentReference = ref.AgentReference, BreedNamePair = ref.BreedNamePair, BreedReference = ref.BreedReference, ExportAllPlotsData = ref.ExportAllPlotsData, ExportedAgent = ref.ExportedAgent, ExportedAgentSet = ref.ExportedAgentSet, ExportedColorNum = ref.ExportedColorNum, ExportedCommandLambda = ref.ExportedCommandLambda, ExportedExtension = ref.ExportedExtension, ExportedGlobals = ref.ExportedGlobals, ExportedLink = ref.ExportedLink, ExportedLinkSet = ref.ExportedLinkSet, ExportedPatch = ref.ExportedPatch, ExportedPatchSet = ref.ExportedPatchSet, ExportedPen = ref.ExportedPen, ExportedPlot = ref.ExportedPlot, ExportedPlotManager = ref.ExportedPlotManager, ExportedPoint = ref.ExportedPoint, ExportedReporterLambda = ref.ExportedReporterLambda, ExportedRGB = ref.ExportedRGB, ExportedRGBA = ref.ExportedRGBA, ExportedTurtle = ref.ExportedTurtle, ExportedTurtleSet = ref.ExportedTurtleSet, ExportPlotData = ref.ExportPlotData, ExportWorldData = ref.ExportWorldData, LinkReference = ref.LinkReference, Metadata = ref.Metadata, NobodyReference = ref.NobodyReference, PatchReference = ref.PatchReference, TurtleReference = ref.TurtleReference;

  perspectiveToString = require('../observer').Perspective.perspectiveToString;

  ref1 = require('../structure/builtins'), linkBuiltins = ref1.linkBuiltins, patchBuiltins = ref1.patchBuiltins, turtleBuiltins = ref1.turtleBuiltins;

  ref2 = require('engine/plot/pen'), (ref3 = ref2.DisplayMode, displayModeToString = ref3.displayModeToString), (ref4 = ref2.PenMode, penModeToBool = ref4.penModeToBool);

  ref5 = require('brazierjs/array'), difference = ref5.difference, find = ref5.find, isEmpty = ref5.isEmpty, toObject = ref5.toObject;

  ref6 = require('brazierjs/function'), id = ref6.id, tee = ref6.tee;

  fold = require('brazierjs/maybe').fold;

  NLType = require('../typechecker');

  exportColor = function(color) {
    var a, b, g, r;
    if (NLType(color).isNumber()) {
      return new ExportedColorNum(color);
    } else if (NLType(color).isList()) {
      r = color[0], g = color[1], b = color[2], a = color[3];
      if (a != null) {
        return new ExportedRGBA(r, g, b, a);
      } else {
        return new ExportedRGB(r, g, b);
      }
    } else {
      throw new Error("Unrecognized color format: " + (JSON.stringify(color)));
    }
  };

  exportBreedReference = function(breedName) {
    return new BreedReference(breedName.toLowerCase());
  };

  exportPatchReference = function(patch) {
    return new PatchReference(patch.pxcor, patch.pycor);
  };

  exportTurtleReference = function(turtle) {
    var breed;
    breed = new BreedNamePair(turtle.getBreedNameSingular(), turtle.getBreedName().toLowerCase());
    return new TurtleReference(breed, turtle.id);
  };

  exportLinkReference = function(link) {
    var breed;
    breed = new BreedNamePair(link.getBreedNameSingular(), link.getBreedName().toLowerCase());
    return new LinkReference(breed, link.end1.id, link.end2.id);
  };

  exportAgentReference = function(agent) {
    var type;
    type = NLType(agent);
    if (type.isNobody() || agent.isDead()) {
      return NobodyReference;
    } else if (type.isLink()) {
      return exportLinkReference(agent);
    } else if (type.isPatch()) {
      return exportPatchReference(agent);
    } else if (type.isTurtle()) {
      return exportTurtleReference(agent);
    } else {
      throw new Error("Cannot make agent reference out of: " + (JSON.stringify(agent)));
    }
  };

  exportWildcardVar = function(agent) {
    return function(varName) {
      var exportWildcardValue;
      exportWildcardValue = function(value) {
        var type;
        type = NLType(value);
        if (type.isAgent() || type.isNobody()) {
          return exportAgentReference(value);
        } else if ((typeof value.getSpecialName === "function" ? value.getSpecialName() : void 0) != null) {
          return new BreedReference(value.getSpecialName().toLowerCase());
        } else if (type.isLinkSet()) {
          return new ExportedLinkSet(value.toArray().map(exportLinkReference));
        } else if (type.isPatchSet()) {
          return new ExportedPatchSet(value.toArray().map(exportPatchReference));
        } else if (type.isTurtleSet()) {
          return new ExportedTurtleSet(value.toArray().map(exportTurtleReference));
        } else if (type.isCommandLambda()) {
          return new ExportedCommandLambda(value.nlogoBody);
        } else if (type.isReporterLambda()) {
          return new ExportedReporterLambda(value.nlogoBody);
        } else if (type.isList()) {
          return value.map(exportWildcardValue);
        } else {
          return value;
        }
      };
      return exportWildcardValue(agent.getVariable(varName));
    };
  };

  exportMetadata = function() {
    return new Metadata(version, '[IMPLEMENT .NLOGO]', new Date());
  };

  exportAgent = function(clazz, builtInsMappings) {
    return function(agent) {
      var builtInsNames, builtInsValues, extras, extrasNames;
      builtInsValues = builtInsMappings.map(function(arg) {
        var f, name;
        name = arg[0], f = arg[1];
        return f(agent.getVariable(name));
      });
      builtInsNames = builtInsMappings.map(function(arg) {
        var name;
        name = arg[0];
        return name;
      });
      extrasNames = difference(agent.varNames())(builtInsNames);
      extras = toObject(extrasNames.map(tee(id)(exportWildcardVar(agent))));
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(clazz, slice.call(builtInsValues).concat([extras]), function(){});
    };
  };

  exportPlot = function(plot) {
    var currentPenNameOrNull, exportPen, isAutoplotting, isLegendOpen, name, pens, xMax, xMin, yMax, yMin;
    exportPen = function(pen) {
      var color, exportPoint, interval, isPenDown, mode, name, points, x;
      exportPoint = function(arg) {
        var color, penMode, x, y;
        x = arg.x, y = arg.y, penMode = arg.penMode, color = arg.color;
        return new ExportedPoint(x, y, penModeToBool(penMode), color);
      };
      color = pen.getColor();
      interval = pen.getInterval();
      isPenDown = penModeToBool(pen.getPenMode());
      mode = displayModeToString(pen.getDisplayMode());
      name = pen.name;
      points = pen.getPoints().map(exportPoint);
      x = pen.getPenX();
      return new ExportedPen(color, interval, isPenDown, mode, name, points, x);
    };
    currentPenNameOrNull = fold(function() {
      return null;
    })(function(cp) {
      return cp.name;
    })(plot.getCurrentPenMaybe());
    isAutoplotting = plot.isAutoplotting;
    isLegendOpen = plot.isLegendEnabled;
    name = plot.name;
    pens = plot.getPens().map(exportPen);
    xMax = plot.xMax;
    xMin = plot.xMin;
    yMax = plot.yMax;
    yMin = plot.yMin;
    return new ExportedPlot(currentPenNameOrNull, isAutoplotting, isLegendOpen, name, pens, xMax, xMin, yMax, yMin);
  };

  exportPlotManager = function() {
    var currentPlotNameOrNull, plots;
    currentPlotNameOrNull = fold(function() {
      return null;
    })(function(cp) {
      return cp.name;
    })(this._plotManager.getCurrentPlotMaybe());
    plots = this._plotManager.getPlots().map(exportPlot);
    return new ExportedPlotManager(currentPlotNameOrNull, plots);
  };

  exportMiniGlobals = function() {
    var namesNotDeleted;
    namesNotDeleted = this.observer.varNames().filter((function(_this) {
      return function(name) {
        return _this.observer.getVariable(name) != null;
      };
    })(this)).sort();
    return toObject(namesNotDeleted.map(tee(id)(exportWildcardVar(this.observer))));
  };

  exportGlobals = function() {
    var codeGlobals, linkDirectedness, maxPxcor, maxPycor, minPxcor, minPycor, nextWhoNumber, noUnbreededLinks, perspective, subject, ticks;
    noUnbreededLinks = isEmpty(this.links().toArray().filter(function(l) {
      return l.getBreedName().toUpperCase() === "LINKS";
    }));
    linkDirectedness = noUnbreededLinks ? 'neither' : this.breedManager.links().isDirected() ? 'directed' : 'undirected';
    maxPxcor = this.topology.maxPxcor;
    maxPycor = this.topology.maxPycor;
    minPxcor = this.topology.minPxcor;
    minPycor = this.topology.minPycor;
    nextWhoNumber = this.turtleManager.peekNextID();
    perspective = perspectiveToString(this.observer.getPerspective());
    subject = exportAgentReference(this.observer.subject());
    ticks = this.ticker.ticksAreStarted() ? this.ticker.tickCount() : -1;
    codeGlobals = exportMiniGlobals.call(this);
    return new ExportedGlobals(linkDirectedness, maxPxcor, maxPycor, minPxcor, minPycor, nextWhoNumber, perspective, subject, ticks, codeGlobals);
  };

  module.exports.exportAllPlots = function() {
    var metadata, miniGlobals, plots;
    metadata = exportMetadata.call(this);
    miniGlobals = exportMiniGlobals.call(this);
    plots = this._plotManager.getPlots().map(exportPlot);
    return new ExportAllPlotsData(metadata, miniGlobals, plots);
  };

  module.exports.exportPlot = function(plotName) {
    var desiredPlotMaybe, metadata, miniGlobals, plot;
    desiredPlotMaybe = find(function(x) {
      return x.name === plotName;
    })(this._plotManager.getPlots());
    metadata = exportMetadata.call(this);
    miniGlobals = exportMiniGlobals.call(this);
    plot = fold(function() {
      throw new Error("no such plot: \"" + plotName + "\"");
    })(desiredPlotMaybe);
    return new ExportPlotData(metadata, miniGlobals, plot);
  };

  module.exports.exportWorld = function() {
    var extensions, globals, linkMapper, links, makeMappings, metadata, output, patchMapper, patches, plotManager, randomState, turtleMapper, turtles;
    makeMappings = function(builtins) {
      return function(mapper) {
        return builtins.map(tee(id)(mapper));
      };
    };
    patchMapper = function(varName) {
      switch (varName) {
        case "pcolor":
        case "plabel-color":
          return function(color) {
            return exportColor(color);
          };
        default:
          return id;
      }
    };
    turtleMapper = function(varName) {
      switch (varName) {
        case "breed":
          return function(breed) {
            return exportBreedReference(breed.toString());
          };
        case "color":
        case "label-color":
          return function(color) {
            return exportColor(color);
          };
        default:
          return id;
      }
    };
    linkMapper = function(varName) {
      switch (varName) {
        case "breed":
          return function(breed) {
            return exportBreedReference(breed.toString());
          };
        case "color":
        case "label-color":
          return function(color) {
            return exportColor(color);
          };
        case "end1":
        case "end2":
          return function(end) {
            return exportTurtleReference(end);
          };
        default:
          return id;
      }
    };
    metadata = exportMetadata.call(this);
    randomState = this.rng.exportState();
    globals = exportGlobals.call(this, false);
    patches = this.patches().toArray().map(exportAgent(ExportedPatch, makeMappings(patchBuiltins)(patchMapper)));
    turtles = this.turtleManager.turtles().toArray().map(exportAgent(ExportedTurtle, makeMappings(turtleBuiltins)(turtleMapper)));
    links = this.linkManager.links().toArray().map(exportAgent(ExportedLink, makeMappings(linkBuiltins)(linkMapper)));
    output = this._getOutput();
    plotManager = exportPlotManager.call(this);
    extensions = [];
    return new ExportWorldData(metadata, randomState, globals, patches, turtles, links, output, plotManager, extensions);
  };

}).call(this);

},{"../observer":"engine/core/observer","../structure/builtins":"engine/core/structure/builtins","../typechecker":"engine/core/typechecker","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/maybe":"brazier/maybe","engine/plot/pen":"engine/plot/pen","meta":"meta","serialize/exportstructures":"serialize/exportstructures"}],"engine/core/world/hubnetmanager":[function(require,module,exports){
(function() {
  var HubnetManager, TurtleSet,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  TurtleSet = require('../turtleset');

  module.exports = HubnetManager = (function() {
    function HubnetManager() {
      this.hubnetSendOverride = bind(this.hubnetSendOverride, this);
      this.hubnetSendFollow = bind(this.hubnetSendFollow, this);
      this.hubnetResetPerspective = bind(this.hubnetResetPerspective, this);
      this.hubnetSendWatch = bind(this.hubnetSendWatch, this);
      this.hubnetClearOverrides = bind(this.hubnetClearOverrides, this);
      this.hubnetClearOverride = bind(this.hubnetClearOverride, this);
      this.hubnetBroadcast = bind(this.hubnetBroadcast, this);
      this.hubnetSend = bind(this.hubnetSend, this);
      this.hubnetFetchMessage = bind(this.hubnetFetchMessage, this);
      this.hubnetMessageWaiting = false;
      this.hubnetEnterMessage = false;
      this.hubnetExitMessage = false;
      this.hubnetMessage = "";
      this.hubnetMessageSource = "";
      this.hubnetMessageTag = "";
    }

    HubnetManager.prototype.hubnetFetchMessage = function() {
      this.processCommand(commandQueue.shift());
    };

    HubnetManager.prototype.hubnetSend = function(messageSource, messageTag, message) {
      socket.emit('send reporter', {
        hubnetMessageSource: messageSource,
        hubnetMessageTag: messageTag,
        hubnetMessage: message
      });
    };

    HubnetManager.prototype.hubnetBroadcast = function(messageTag, message) {
      socket.emit('send reporter', {
        hubnetMessageSource: "all-users",
        hubnetMessageTag: messageTag,
        hubnetMessage: message
      });
    };

    HubnetManager.prototype.hubnetClearOverride = function(messageSource, agentOrSet, messageTag) {
      socket.emit('send override', {
        hubnetMessageType: "clear-override",
        hubnetAgentOrSet: this.getAgents(agentOrSet),
        hubnetMessageSource: messageSource,
        hubnetMessageTag: messageTag
      });
    };

    HubnetManager.prototype.hubnetClearOverrides = function(messageSource) {
      socket.emit('send override', {
        hubnetMessageType: "clear-overrides",
        hubnetMessageSource: messageSource
      });
    };

    HubnetManager.prototype.hubnetSendWatch = function(messageSource, agent) {
      socket.emit('send override', {
        hubnetMessageType: "send-watch",
        hubnetAgentOrSet: this.getAgents(agent),
        hubnetMessageSource: messageSource
      });
    };

    HubnetManager.prototype.hubnetResetPerspective = function(messageSource) {
      socket.emit('send override', {
        hubnetMessageType: "reset-perspective",
        hubnetMessageSource: messageSource
      });
    };

    HubnetManager.prototype.hubnetSendFollow = function(messageSource, agent, radius) {
      socket.emit('send override', {
        hubnetMessageType: "send-follow",
        hubnetAgentOrSet: this.getAgents(agent),
        hubnetMessageSource: messageSource,
        hubnetMessage: radius
      });
    };

    HubnetManager.prototype.hubnetSendOverride = function(messageSource, agentOrSet, messageTag, message) {
      socket.emit('send override', {
        hubnetMessageType: "send-override",
        hubnetAgentOrSet: this.getAgents(agentOrSet),
        hubnetMessageSource: messageSource,
        hubnetMessageTag: messageTag,
        hubnetMessage: message
      });
    };

    HubnetManager.prototype.getAgents = function(agents) {
      var a, agentObj, agentType, i, ids, len;
      ids = [];
      agentType = agents.constructor.name;
      if (agentType === "Turtle" || agentType === "Patch" || agentType === "Link") {
        ids.push(agents.id);
      } else {
        agentObj = agents._agentArr;
        for (i = 0, len = agentObj.length; i < len; i++) {
          a = agentObj[i];
          ids.push(a.id);
        }
      }
      if (agentType.indexOf("Turtle") > -1) {
        agentType = "turtles";
      }
      if (agentType.indexOf("Patch") > -1) {
        agentType = "patches";
      }
      if (agentType.indexOf("Link") > -1) {
        agentType = "links";
      }
      return {
        agentType: agentType,
        ids: ids
      };
    };

    HubnetManager.prototype.processCommand = function(m) {
      if (commandQueue.length === 0) {
        world.hubnetManager.hubnetMessageWaiting = false;
      }
      world.hubnetManager.hubnetEnterMessage = false;
      world.hubnetManager.hubnetExitMessage = false;
      world.hubnetManager.hubnetMessageSource = m.messageSource;
      world.hubnetManager.hubnetMessageTag = m.messageTag;
      world.hubnetManager.hubnetMessage = m.message;
      if (m.messageTag === 'hubnet-enter-message') {
        world.hubnetManager.hubnetEnterMessage = true;
      }
      if (m.messageTag === 'hubnet-exit-message') {
        world.hubnetManager.hubnetExitMessage = true;
      }
    };

    return HubnetManager;

  })();

}).call(this);

},{"../turtleset":"engine/core/turtleset"}],"engine/core/world/idmanager":[function(require,module,exports){
(function() {
  var IDManager;

  module.exports = IDManager = (function() {
    IDManager.prototype._count = void 0;

    function IDManager() {
      this.reset();
    }

    IDManager.prototype.getCount = function() {
      return this._count;
    };

    IDManager.prototype.reset = function() {
      this._count = 0;
    };

    IDManager.prototype.next = function() {
      return this._count++;
    };

    IDManager.prototype.setCount = function(_count) {
      this._count = _count;
    };

    IDManager.prototype.suspendDuring = function(f) {
      var oldCount;
      oldCount = this._count;
      f();
      this._count = oldCount;
    };

    return IDManager;

  })();

}).call(this);

},{}],"engine/core/world/import":[function(require,module,exports){
(function() {
  var BreedReference, ExportedColorNum, ExportedCommandLambda, ExportedLinkSet, ExportedPatchSet, ExportedRGB, ExportedRGBA, ExportedReporterLambda, ExportedTurtleSet, LinkReference, LinkSet, NobodyReference, PatchReference, PatchSet, TurtleReference, TurtleSet, perspectiveFromString, ref, reifyExported,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  LinkSet = require('../linkset');

  PatchSet = require('../patchset');

  TurtleSet = require('../turtleset');

  perspectiveFromString = require('../observer').Perspective.perspectiveFromString;

  ref = require('serialize/exportstructures'), BreedReference = ref.BreedReference, ExportedColorNum = ref.ExportedColorNum, ExportedCommandLambda = ref.ExportedCommandLambda, ExportedLinkSet = ref.ExportedLinkSet, ExportedPatchSet = ref.ExportedPatchSet, ExportedRGB = ref.ExportedRGB, ExportedRGBA = ref.ExportedRGBA, ExportedReporterLambda = ref.ExportedReporterLambda, ExportedTurtleSet = ref.ExportedTurtleSet, LinkReference = ref.LinkReference, NobodyReference = ref.NobodyReference, PatchReference = ref.PatchReference, TurtleReference = ref.TurtleReference;

  reifyExported = function(getTurtle, getPatch, getLink, getAllPatches, getBreed, world) {
    var helper;
    return helper = function(x) {
      var fn, links, patches, turtles, type;
      type = NLType(x);
      if (type.isList()) {
        return x.map(helper);
      } else if (type.isBoolean() || type.isNumber() || type.isString()) {
        return x;
      } else if (x === NobodyReference) {
        return Nobody;
      } else if (x instanceof BreedReference) {
        switch (x.breedName) {
          case "PATCHES":
            return getAllPatches();
          default:
            return getBreed(x.breedName);
        }
      } else if (x instanceof LinkReference) {
        return getLink(x.id1, x.id2, x.breed.plural);
      } else if (x instanceof PatchReference) {
        return getPatch(x.pxcor, x.pycor);
      } else if (x instanceof TurtleReference) {
        return getTurtle(x.id);
      } else if (x instanceof ExportedLinkSet) {
        links = x.references.map(function(arg) {
          var id1, id2, plural, ref1;
          id1 = arg.id1, id2 = arg.id2, (ref1 = arg.breed, plural = ref1.plural);
          return getLink(id1, id2, plural);
        });
        return new LinkSet(links, world);
      } else if (x instanceof ExportedPatchSet) {
        patches = x.references.map(function(arg) {
          var pxcor, pycor;
          pxcor = arg.pxcor, pycor = arg.pycor;
          return getPatch(pxcor, pycor);
        });
        return new PatchSet(patches, world);
      } else if (x instanceof ExportedTurtleSet) {
        turtles = x.references.map(function(arg) {
          var id;
          id = arg.id;
          return getTurtle(id);
        });
        return new TurtleSet(turtles, world);
      } else if (x instanceof ExportedCommandLambda) {
        fn = (function() {
          throw new Error("Importing and then running lambdas is not supported!");
        });
        fn.isReporter = false;
        fn.nlogoBody = x.source;
        return fn;
      } else if (x instanceof ExportedReporterLambda) {
        fn = (function() {
          throw new Error("Importing and then running lambdas is not supported!");
        });
        fn.isReporter = true;
        fn.nlogoBody = x.source;
        return fn;
      } else {
        throw new Error("Unknown item for reification: " + (JSON.stringify(x)));
      }
    };
  };

  module.exports.importWorld = function(arg) {
    var codeGlobals, directedLinks, extractColor, linkFinishFs, links, maxPxcor, maxPycor, minPxcor, minPycor, nextWhoNumber, output, patchFinishFs, patches, perspective, plotManager, randomState, ref1, reify, subject, ticks, trueSubject, turtleFinishFs, turtles, value, varName;
    (ref1 = arg.globals, directedLinks = ref1.linkDirectedness, maxPxcor = ref1.maxPxcor, maxPycor = ref1.maxPycor, minPxcor = ref1.minPxcor, minPycor = ref1.minPycor, nextWhoNumber = ref1.nextWhoNumber, perspective = ref1.perspective, subject = ref1.subject, ticks = ref1.ticks, codeGlobals = ref1.codeGlobals), links = arg.links, patches = arg.patches, plotManager = arg.plotManager, randomState = arg.randomState, turtles = arg.turtles, output = arg.output;
    reify = reifyExported(this.turtleManager.getTurtle.bind(this.turtleManager), this.getPatchAt.bind(this), this.linkManager.getLink.bind(this.linkManager), this.patches.bind(this), this.breedManager.get.bind(this.breedManager), this);
    this.clearAll();
    if (directedLinks === "DIRECTED") {
      this._setUnbreededLinksDirected();
    } else {
      this._setUnbreededLinksUndirected();
    }
    this._resizeHelper(minPxcor, maxPxcor, minPycor, maxPycor, this.topology._wrapInX, this.topology._wrapInY);
    extractColor = function(color) {
      if (color instanceof ExportedColorNum) {
        return color.value;
      } else if (color instanceof ExportedRGB) {
        return [color.r, color.g, color.b];
      } else if (color instanceof ExportedRGBA) {
        return [color.r, color.g, color.b, color.a];
      } else {
        throw new Error("Unknown color: " + (JSON.stringify(color)));
      }
    };
    patchFinishFs = patches.map((function(_this) {
      return function(arg1) {
        var patch, patchesOwns, pcolor, plabel, plabelColor, pxcor, pycor;
        pxcor = arg1.pxcor, pycor = arg1.pycor, pcolor = arg1.pcolor, plabel = arg1.plabel, plabelColor = arg1.plabelColor, patchesOwns = arg1.patchesOwns;
        patch = _this.patchAtCoords(pxcor, pycor);
        patch.setVariable('pcolor', extractColor(pcolor));
        patch.setVariable('plabel-color', extractColor(plabelColor));
        return function() {
          var results, value, varName;
          patch.setVariable('plabel', reify(plabel));
          results = [];
          for (varName in patchesOwns) {
            value = patchesOwns[varName];
            if (indexOf.call(patch.varNames(), varName) >= 0) {
              results.push(patch.setVariable(varName, reify(value)));
            }
          }
          return results;
        };
      };
    })(this));
    turtleFinishFs = turtles.map((function(_this) {
      return function(arg1) {
        var args, breedName, breedsOwns, color, heading, isHidden, label, labelColor, newTurtle, penMode, penSize, realBreed, ref2, ref3, ref4, shape, size, who, xcor, ycor;
        who = arg1.who, color = arg1.color, heading = arg1.heading, xcor = arg1.xcor, ycor = arg1.ycor, shape = arg1.shape, label = arg1.label, labelColor = arg1.labelColor, (ref2 = arg1.breed, breedName = ref2.breedName), isHidden = arg1.isHidden, size = arg1.size, penSize = arg1.penSize, penMode = arg1.penMode, breedsOwns = arg1.breedsOwns;
        realBreed = (ref3 = _this.breedManager.get(breedName)) != null ? ref3 : _this.breedManager.turtles();
        args = [who, extractColor(color), heading, xcor, ycor, realBreed, "", extractColor(labelColor), isHidden, size, shape];
        newTurtle = (ref4 = _this.turtleManager)._createTurtle.apply(ref4, args);
        newTurtle.penManager.setPenMode(penMode);
        newTurtle.penManager.setSize(penSize);
        return function() {
          var results, value, varName;
          newTurtle.setVariable('label', reify(label));
          results = [];
          for (varName in breedsOwns) {
            value = breedsOwns[varName];
            if (indexOf.call(newTurtle.varNames(), varName) >= 0) {
              results.push(newTurtle.setVariable(varName, reify(value)));
            }
          }
          return results;
        };
      };
    })(this));
    this.turtleManager._idManager.setCount(nextWhoNumber);
    linkFinishFs = links.map((function(_this) {
      return function(arg1) {
        var breedName, breedsOwns, color, end1, end2, isHidden, label, labelColor, newLink, realBreed, realEnd1, realEnd2, ref2, ref3, shape, thickness, tieMode;
        (ref2 = arg1.breed, breedName = ref2.breedName), end1 = arg1.end1, end2 = arg1.end2, color = arg1.color, isHidden = arg1.isHidden, label = arg1.label, labelColor = arg1.labelColor, shape = arg1.shape, thickness = arg1.thickness, tieMode = arg1.tieMode, breedsOwns = arg1.breedsOwns;
        realEnd1 = _this.turtleManager.getTurtleOfBreed(end1.breed.plural, end1.id);
        realEnd2 = _this.turtleManager.getTurtleOfBreed(end2.breed.plural, end2.id);
        realBreed = (ref3 = _this.breedManager.get(breedName)) != null ? ref3 : _this.breedManager.links();
        newLink = _this.linkManager._createLink(realBreed.isDirected(), realEnd1, realEnd2, realBreed.name);
        newLink.setVariable('color', extractColor(color));
        newLink.setVariable('hidden?', isHidden);
        newLink.setVariable('label-color', extractColor(labelColor));
        newLink.setVariable('shape', shape);
        newLink.setVariable('thickness', thickness);
        newLink.setVariable('tie-mode', tieMode);
        return function() {
          var results, value, varName;
          newLink.setVariable('label', reify(label));
          results = [];
          for (varName in breedsOwns) {
            value = breedsOwns[varName];
            if (indexOf.call(newLink.varNames(), varName) >= 0) {
              results.push(newLink.setVariable(varName, reify(value)));
            }
          }
          return results;
        };
      };
    })(this));
    [].concat(patchFinishFs, turtleFinishFs, linkFinishFs).forEach(function(f) {
      return f();
    });
    for (varName in codeGlobals) {
      value = codeGlobals[varName];
      if (indexOf.call(this.observer.varNames(), varName) >= 0) {
        this.observer.setGlobal(varName, reify(value));
      }
    }
    trueSubject = reify(subject);
    if (trueSubject !== Nobody) {
      this.observer.setPerspective(perspectiveFromString(perspective), trueSubject);
    }
    this._plotManager.importState(plotManager);
    this.ticker.importTicks(ticks);
    this.rng.importState(randomState);
    if (output != null) {
      this._setOutput(output);
    }
  };

}).call(this);

},{"../linkset":"engine/core/linkset","../observer":"engine/core/observer","../patchset":"engine/core/patchset","../turtleset":"engine/core/turtleset","serialize/exportstructures":"serialize/exportstructures"}],"engine/core/world/linkmanager":[function(require,module,exports){
(function() {
  var Builtins, IDManager, Link, LinkManager, LinkSet, SortedLinks, contains, exists, filter, isEmpty, map, pairs, pipeline, ref, ref1, stableSort, values,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Link = require('../link');

  LinkSet = require('../linkset');

  Builtins = require('../structure/builtins');

  IDManager = require('./idmanager');

  SortedLinks = require('./sortedlinks');

  stableSort = require('util/stablesort');

  ref = require('brazierjs/array'), contains = ref.contains, exists = ref.exists, filter = ref.filter, isEmpty = ref.isEmpty, map = ref.map;

  pipeline = require('brazierjs/function').pipeline;

  ref1 = require('brazierjs/object'), pairs = ref1.pairs, values = ref1.values;

  module.exports = LinkManager = (function() {
    LinkManager.prototype._linkArrCache = void 0;

    LinkManager.prototype._links = void 0;

    LinkManager.prototype._linksFrom = void 0;

    LinkManager.prototype._idManager = void 0;

    LinkManager.prototype._linksTo = void 0;

    function LinkManager(_world, _breedManager, _updater, _notifyIsDirected, _notifyIsUndirected) {
      this._world = _world;
      this._breedManager = _breedManager;
      this._updater = _updater;
      this._notifyIsDirected = _notifyIsDirected;
      this._notifyIsUndirected = _notifyIsUndirected;
      this._createLinksBy = bind(this._createLinksBy, this);
      this._removeLink = bind(this._removeLink, this);
      this.linksOfBreed = bind(this.linksOfBreed, this);
      this.clear();
    }

    LinkManager.prototype.clear = function() {
      this._linkArrCache = void 0;
      this._links = new SortedLinks;
      this._linksFrom = {};
      this._idManager = new IDManager;
      return this._linksTo = {};
    };

    LinkManager.prototype.createDirectedLink = function(from, to, breedName) {
      if (breedName.toUpperCase() === "LINKS") {
        this._notifyIsDirected();
      }
      return this._createLink(true, from, to, breedName);
    };

    LinkManager.prototype.createDirectedLinks = function(source, others, breedName) {
      if (breedName.toUpperCase() === "LINKS") {
        this._notifyIsDirected();
      }
      return this._createLinksBy((function(_this) {
        return function(turtle) {
          return _this._createLink(true, source, turtle, breedName);
        };
      })(this))(others);
    };

    LinkManager.prototype.createReverseDirectedLinks = function(source, others, breedName) {
      if (breedName.toUpperCase() === "LINKS") {
        this._notifyIsDirected();
      }
      return this._createLinksBy((function(_this) {
        return function(turtle) {
          return _this._createLink(true, turtle, source, breedName);
        };
      })(this))(others);
    };

    LinkManager.prototype.createUndirectedLink = function(source, other, breedName) {
      return this._createLink(false, source, other, breedName);
    };

    LinkManager.prototype.createUndirectedLinks = function(source, others, breedName) {
      return this._createLinksBy((function(_this) {
        return function(turtle) {
          return _this._createLink(false, source, turtle, breedName);
        };
      })(this))(others);
    };

    LinkManager.prototype.getLink = function(fromId, toId, breedName) {
      var findFunc, isDirected, ref2;
      if (breedName == null) {
        breedName = "LINKS";
      }
      isDirected = this._breedManager.get(breedName).isDirected();
      findFunc = function(link) {
        return link.getBreedName().toLowerCase() === breedName.toLowerCase() && ((link.end1.id === fromId && link.end2.id === toId) || (!isDirected && link.end1.id === toId && link.end2.id === fromId));
      };
      return (ref2 = this._links.find(findFunc)) != null ? ref2 : Nobody;
    };

    LinkManager.prototype.importState = function(linkState) {
      linkState.forEach((function(_this) {
        return function(arg) {
          var breed, color, end1, end2, isHidden, labelColor, newLink, shape, thickness, tieMode;
          breed = arg.breed, end1 = arg.end1, end2 = arg.end2, color = arg.color, isHidden = arg.isHidden, labelColor = arg.labelColor, shape = arg.shape, thickness = arg.thickness, tieMode = arg.tieMode;
          newLink = _this._createLink(breed.isDirected(), end1, end2, breed.name);
          newLink.setVariable('color', color);
          newLink.setVariable('hidden?', isHidden);
          newLink.setVariable('label-color', labelColor);
          newLink.setVariable('shape', shape);
          newLink.setVariable('thickness', thickness);
          newLink.setVariable('tie-mode', tieMode);
        };
      })(this));
    };

    LinkManager.prototype.links = function() {
      var thunk;
      thunk = ((function(_this) {
        return function() {
          return _this._linkArray();
        };
      })(this));
      return new LinkSet(thunk, this._world, "links");
    };

    LinkManager.prototype.linksOfBreed = function(breedName) {
      var thunk;
      thunk = ((function(_this) {
        return function() {
          return stableSort(_this._breedManager.get(breedName).members)(function(x, y) {
            return x.compare(y).toInt;
          });
        };
      })(this));
      return new LinkSet(thunk, this._world, breedName);
    };

    LinkManager.prototype._linkArray = function() {
      if (this._linkArrCache == null) {
        this._linkArrCache = this._links.toArray();
      }
      return this._linkArrCache;
    };

    LinkManager.prototype.trackBreedChange = function(link, breed, oldBreedName) {
      var end1, end2, existingLink, isDirected;
      end1 = link.end1, end2 = link.end2, isDirected = link.isDirected;
      this._errorIfBreedIsIncompatible(breed.name);
      existingLink = this.getLink(end1.id, end2.id, breed.name);
      if (existingLink !== link && existingLink !== Nobody) {
        throw new Error("there is already a " + (breed.singular.toUpperCase()) + " with endpoints " + (end1.getName()) + " and " + (end2.getName()));
      } else {
        this._removeFromSets(end1.id, end2.id, isDirected, oldBreedName);
        this._insertIntoSets(end1.id, end2.id, isDirected, breed.name);
      }
    };

    LinkManager.prototype._removeLink = function(link) {
      var l;
      l = this._links.find(function(arg) {
        var id;
        id = arg.id;
        return id === link.id;
      });
      this._links = this._links.remove(l);
      this._linkArrCache = void 0;
      if (this._links.isEmpty()) {
        this._notifyIsUndirected();
      }
      this._removeFromSets(link.end1.id, link.end2.id, link.isDirected, link.getBreedName());
    };

    LinkManager.prototype._createLink = function(isDirected, from, to, breedName) {
      var breed, end1, end2, link, ref2;
      ref2 = from.id < to.id || isDirected ? [from, to] : [to, from], end1 = ref2[0], end2 = ref2[1];
      if (!this._linkExists(end1.id, end2.id, isDirected, breedName)) {
        breed = this._breedManager.get(breedName);
        link = new Link(this._idManager.next(), isDirected, end1, end2, this._world, this._updater.updated, this._updater.registerDeadLink, this._removeLink, this._updater.registerLinkStamp, this.linksOfBreed, breed);
        this._updater.updated(link).apply(null, Builtins.linkBuiltins);
        this._updater.updated(link).apply(null, Builtins.linkExtras);
        this._links.insert(link);
        this._linkArrCache = void 0;
        return link;
      } else {
        return Nobody;
      }
    };

    LinkManager.prototype._createLinksBy = function(mkLink) {
      return (function(_this) {
        return function(turtles) {
          var isLink, links;
          isLink = function(other) {
            return other !== Nobody;
          };
          links = pipeline(map(mkLink), filter(isLink))(turtles.toArray());
          return new LinkSet(links, _this._world);
        };
      })(this);
    };

    LinkManager.prototype._errorIfBreedIsIncompatible = function(breedName) {
      if ((breedName === "LINKS" && this._hasBreededs()) || (breedName !== "LINKS" && this._hasUnbreededs())) {
        throw new Error("You cannot have both breeded and unbreeded links in the same world.");
      }
    };

    LinkManager.prototype._hasBreededs = function() {
      var allPairs;
      allPairs = pairs(this._linksTo).concat(pairs(this._linksFrom));
      return exists(function(arg) {
        var key, value;
        key = arg[0], value = arg[1];
        return key !== "LINKS" && exists(function(x) {
          return !isEmpty(x);
        })(values(value));
      })(allPairs);
    };

    LinkManager.prototype._hasUnbreededs = function() {
      var hasUnbreededs;
      hasUnbreededs = function(bin) {
        var ref2;
        return exists(function(x) {
          return !isEmpty(x);
        })(values((ref2 = bin["LINKS"]) != null ? ref2 : {}));
      };
      return hasUnbreededs(this._linksFrom) || hasUnbreededs(this._linksTo);
    };

    LinkManager.prototype._insertIntoSets = function(fromID, toID, isDirected, breedName) {
      var insertIntoSet;
      insertIntoSet = function(set, id1, id2) {
        var neighbors;
        if (set[breedName] == null) {
          set[breedName] = {};
        }
        neighbors = set[breedName][id1];
        if (neighbors != null) {
          return neighbors.push(id2);
        } else {
          return set[breedName][id1] = [id2];
        }
      };
      insertIntoSet(this._linksFrom, fromID, toID);
      if (!isDirected) {
        insertIntoSet(this._linksTo, toID, fromID);
      }
    };

    LinkManager.prototype._linkExists = function(id1, id2, isDirected, breedName) {
      var ref2, ref3, ref4, ref5, weCanHaz;
      weCanHaz = pipeline(values, contains(id2));
      return weCanHaz((ref2 = (ref3 = this._linksFrom[breedName]) != null ? ref3[id1] : void 0) != null ? ref2 : {}) || (!isDirected && weCanHaz((ref4 = (ref5 = this._linksTo[breedName]) != null ? ref5[id1] : void 0) != null ? ref4 : {}));
    };

    LinkManager.prototype._removeFromSets = function(fromID, toID, isDirected, breedName) {
      var remove;
      remove = function(set, id1, id2) {
        if ((set != null ? set[id1] : void 0) != null) {
          return set[id1] = filter(function(x) {
            return x !== id2;
          })(set[id1]);
        }
      };
      remove(this._linksFrom[breedName], fromID, toID);
      if (!isDirected) {
        remove(this._linksTo[breedName], toID, fromID);
      }
    };

    return LinkManager;

  })();

}).call(this);

},{"../link":"engine/core/link","../linkset":"engine/core/linkset","../structure/builtins":"engine/core/structure/builtins","./idmanager":"engine/core/world/idmanager","./sortedlinks":"engine/core/world/sortedlinks","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/object":"brazier/object","util/stablesort":"util/stablesort"}],"engine/core/world/sortedlinks":[function(require,module,exports){
(function() {
  var Mori, SortedLinks, linkCompare;

  linkCompare = require('../structure/linkcompare');

  Mori = require('mori');

  module.exports = SortedLinks = (function() {
    SortedLinks._links = void 0;

    function SortedLinks() {
      this._links = Mori.sortedSetBy(linkCompare);
    }

    SortedLinks.prototype.insert = function(link) {
      this._links = Mori.conj(this._links, link);
      return this;
    };

    SortedLinks.prototype.remove = function(link) {
      this._links = Mori.disj(this._links, link);
      return this;
    };

    SortedLinks.prototype.find = function(pred) {
      return Mori.first(Mori.filter(pred, this._links));
    };

    SortedLinks.prototype.isEmpty = function() {
      return Mori.isEmpty(this._links);
    };

    SortedLinks.prototype.toArray = function() {
      return Mori.toJs(this._links);
    };

    return SortedLinks;

  })();

}).call(this);

},{"../structure/linkcompare":"engine/core/structure/linkcompare","mori":"mori"}],"engine/core/world/ticker":[function(require,module,exports){
(function() {
  var EvilSentinel, Exception, Ticker;

  Exception = require('util/exception');

  EvilSentinel = -1;

  module.exports = Ticker = (function() {
    Ticker.prototype._count = void 0;

    function Ticker(_onReset, _onTick, _updateFunc) {
      this._onReset = _onReset;
      this._onTick = _onTick;
      this._updateFunc = _updateFunc;
      this._count = EvilSentinel;
    }

    Ticker.prototype.reset = function() {
      this._updateTicks(function() {
        return 0;
      });
      this._onReset();
      this._onTick();
    };

    Ticker.prototype.clear = function() {
      this._updateTicks(function() {
        return EvilSentinel;
      });
    };

    Ticker.prototype.importTicks = function(numTicks) {
      this._updateTicks(function() {
        return numTicks;
      });
    };

    Ticker.prototype.tick = function() {
      if (this.ticksAreStarted()) {
        this._updateTicks(function(counter) {
          return counter + 1;
        });
      } else {
        throw new Error("The tick counter has not been started yet. Use RESET-TICKS.");
      }
      this._onTick();
    };

    Ticker.prototype.tickAdvance = function(n) {
      if (n < 0) {
        throw new Error("Cannot advance the tick counter by a negative amount.");
      } else if (this.ticksAreStarted()) {
        return this._updateTicks(function(counter) {
          return counter + n;
        });
      } else {
        throw new Error("The tick counter has not been started yet. Use RESET-TICKS.");
      }
    };

    Ticker.prototype.ticksAreStarted = function() {
      return this._count !== EvilSentinel;
    };

    Ticker.prototype.tickCount = function() {
      if (this.ticksAreStarted()) {
        return this._count;
      } else {
        throw new Error("The tick counter has not been started yet. Use RESET-TICKS.");
      }
    };

    Ticker.prototype._updateTicks = function(updateCountFunc) {
      this._count = updateCountFunc(this._count);
      this._updateFunc("ticks");
    };

    return Ticker;

  })();

}).call(this);

},{"util/exception":"util/exception"}],"engine/core/world/turtlemanager":[function(require,module,exports){
(function() {
  var Builtins, ColorModel, DeathInterrupt, IDManager, Turtle, TurtleManager, TurtleSet, ignorantly, ignoring, map, rangeUntil, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ColorModel = require('engine/core/colormodel');

  Turtle = require('../turtle');

  TurtleSet = require('../turtleset');

  Builtins = require('../structure/builtins');

  IDManager = require('./idmanager');

  map = require('brazierjs/array').map;

  rangeUntil = require('brazierjs/number').rangeUntil;

  ref = require('util/exception'), DeathInterrupt = ref.DeathInterrupt, ignoring = ref.ignoring;

  ignorantly = ignoring(DeathInterrupt);

  module.exports = TurtleManager = (function() {
    TurtleManager.prototype._idManager = void 0;

    TurtleManager.prototype._turtles = void 0;

    TurtleManager.prototype._turtlesById = void 0;

    function TurtleManager(_world, _breedManager, _updater, _nextInt) {
      this._world = _world;
      this._breedManager = _breedManager;
      this._updater = _updater;
      this._nextInt = _nextInt;
      this._removeTurtle = bind(this._removeTurtle, this);
      this._createNewTurtle = bind(this._createNewTurtle, this);
      this.turtlesOfBreed = bind(this.turtlesOfBreed, this);
      this._idManager = new IDManager;
      this._turtles = [];
      this._turtlesById = {};
    }

    TurtleManager.prototype.clearTurtles = function() {
      this.turtles().forEach(function(turtle) {
        return ignorantly((function(_this) {
          return function() {
            return turtle.die();
          };
        })(this));
      });
      this._idManager.reset();
    };

    TurtleManager.prototype.createOrderedTurtles = function(n, breedName) {
      var num, turtles;
      num = n >= 0 ? n : 0;
      turtles = map((function(_this) {
        return function(index) {
          var color, heading;
          color = ColorModel.nthColor(index);
          heading = (360 * index) / num;
          return _this._createNewTurtle(color, heading, 0, 0, _this._breedManager.get(breedName));
        };
      })(this))(rangeUntil(0)(num));
      return new TurtleSet(turtles, this._world);
    };

    TurtleManager.prototype.createTurtles = function(n, breedName, xcor, ycor) {
      var num, turtles;
      if (xcor == null) {
        xcor = 0;
      }
      if (ycor == null) {
        ycor = 0;
      }
      num = n >= 0 ? n : 0;
      turtles = map((function(_this) {
        return function() {
          var color, heading;
          color = ColorModel.randomColor(_this._nextInt);
          heading = _this._nextInt(360);
          return _this._createNewTurtle(color, heading, xcor, ycor, _this._breedManager.get(breedName));
        };
      })(this))(rangeUntil(0)(num));
      return new TurtleSet(turtles, this._world);
    };

    TurtleManager.prototype.getTurtle = function(id) {
      var ref1;
      return (ref1 = this._turtlesById[id]) != null ? ref1 : Nobody;
    };

    TurtleManager.prototype.getTurtleOfBreed = function(breedName, id) {
      var turtle;
      turtle = this.getTurtle(id);
      if (turtle.getBreedName().toUpperCase() === breedName.toUpperCase()) {
        return turtle;
      } else {
        return Nobody;
      }
    };

    TurtleManager.prototype.importState = function(turtleState, nextIndex) {
      turtleState.forEach((function(_this) {
        return function(arg) {
          var breed, color, heading, isHidden, labelColor, newTurtle, penMode, penSize, shape, size, who, xcor, ycor;
          who = arg.who, color = arg.color, heading = arg.heading, xcor = arg.xcor, ycor = arg.ycor, shape = arg.shape, labelColor = arg.labelColor, breed = arg.breed, isHidden = arg.isHidden, size = arg.size, penSize = arg.penSize, penMode = arg.penMode;
          newTurtle = _this._createTurtle(who, color, heading, xcor, ycor, breed, "", labelColor, isHidden, size, shape);
          newTurtle.penManager.setPenMode(penMode);
          return newTurtle.penManager.setSize(penSize);
        };
      })(this));
      this._idManager.setCount(nextIndex);
    };

    TurtleManager.prototype.peekNextID = function() {
      return this._idManager.getCount();
    };

    TurtleManager.prototype.turtles = function() {
      return new TurtleSet(this._turtles, this._world, "turtles");
    };

    TurtleManager.prototype.turtlesOfBreed = function(breedName) {
      var breed;
      breed = this._breedManager.get(breedName);
      return new TurtleSet(breed.members, this._world, breedName);
    };

    TurtleManager.prototype._clearTurtlesSuspended = function() {
      this._idManager.suspendDuring((function(_this) {
        return function() {
          return _this.clearTurtles();
        };
      })(this));
    };

    TurtleManager.prototype._createNewTurtle = function(color, heading, xcor, ycor, breed, label, lcolor, isHidden, size, shape, genPenManager) {
      return this._createTurtle(this._idManager.next(), color, heading, xcor, ycor, breed, label, lcolor, isHidden, size, shape, genPenManager);
    };

    TurtleManager.prototype._createTurtle = function(id, color, heading, xcor, ycor, breed, label, lcolor, isHidden, size, shape, genPenManager) {
      var turtle;
      turtle = new Turtle(this._world, id, this._updater.updated, this._updater.registerPenTrail, this._updater.registerTurtleStamp, this._updater.registerDeadTurtle, this._createNewTurtle, this._removeTurtle, color, heading, xcor, ycor, breed, label, lcolor, isHidden, size, shape, genPenManager);
      this._updater.updated(turtle).apply(null, Builtins.turtleBuiltins);
      this._turtles.push(turtle);
      this._turtlesById[id] = turtle;
      return turtle;
    };

    TurtleManager.prototype._removeTurtle = function(id) {
      var turtle;
      turtle = this._turtlesById[id];
      this._turtles.splice(this._turtles.indexOf(turtle), 1);
      delete this._turtlesById[id];
    };

    return TurtleManager;

  })();

}).call(this);

},{"../structure/builtins":"engine/core/structure/builtins","../turtle":"engine/core/turtle","../turtleset":"engine/core/turtleset","./idmanager":"engine/core/world/idmanager","brazierjs/array":"brazier/array","brazierjs/number":"brazier/number","engine/core/colormodel":"engine/core/colormodel","util/exception":"util/exception"}],"engine/core/world":[function(require,module,exports){
(function() {
  var HubnetManager, LinkManager, NLMath, Observer, Patch, PatchSet, Ticker, TopologyInterrupt, TurtleManager, World, exportAllPlots, exportPlot, exportWorld, filter, flatMap, importWorld, linkBuiltins, patchBuiltins, pipeline, ref, ref1, ref2, topologyFactory, turtleBuiltins, values, worldDataToCSV,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Patch = require('./patch');

  PatchSet = require('./patchset');

  topologyFactory = require('./topology/factory');

  LinkManager = require('./world/linkmanager');

  Ticker = require('./world/ticker');

  HubnetManager = require('./world/hubnetmanager');

  TurtleManager = require('./world/turtlemanager');

  NLMath = require('util/nlmath');

  ref = require('brazier/array'), filter = ref.filter, flatMap = ref.flatMap;

  pipeline = require('brazier/function').pipeline;

  values = require('brazier/object').values;

  Observer = require('./observer').Observer;

  ref1 = require('./structure/builtins'), linkBuiltins = ref1.linkBuiltins, patchBuiltins = ref1.patchBuiltins, turtleBuiltins = ref1.turtleBuiltins;

  worldDataToCSV = require('serialize/exportcsv').worldDataToCSV;

  TopologyInterrupt = require('util/exception').TopologyInterrupt;

  ref2 = require('./world/export'), exportWorld = ref2.exportWorld, exportPlot = ref2.exportPlot, exportAllPlots = ref2.exportAllPlots;

  importWorld = require('./world/import').importWorld;

  module.exports = World = (function() {
    World.prototype.id = 0;

    World.prototype.breedManager = void 0;

    World.prototype.linkManager = void 0;

    World.prototype.observer = void 0;

    World.prototype.rng = void 0;

    World.prototype.selfManager = void 0;

    World.prototype.ticker = void 0;

    World.prototype.topology = void 0;

    World.prototype.turtleManager = void 0;

    World.prototype.hubnetManager = void 0;

    World.prototype._patches = void 0;

    World.prototype._plotManager = void 0;

    World.prototype._updater = void 0;

    World.prototype._outputClear = void 0;

    World.prototype._patchesAllBlack = void 0;

    World.prototype._patchesWithLabels = void 0;

    function World(miniWorkspace, _config, _outputClear, _getOutput, _setOutput, dump, globalNames, interfaceGlobalNames, patchesOwnNames, minPxcor, maxPxcor, minPycor, maxPycor, patchSize, wrappingAllowedInX, wrappingAllowedInY, turtleShapeMap, linkShapeMap, onTickFunction) {
      var onTick;
      this._config = _config;
      this._outputClear = _outputClear;
      this._getOutput = _getOutput;
      this._setOutput = _setOutput;
      this.dump = dump;
      this.patchesOwnNames = patchesOwnNames;
      this.patchSize = patchSize;
      this.turtleShapeMap = turtleShapeMap;
      this.linkShapeMap = linkShapeMap;
      this._declarePatchesNotAllBlack = bind(this._declarePatchesNotAllBlack, this);
      this._setUnbreededLinksUndirected = bind(this._setUnbreededLinksUndirected, this);
      this._setUnbreededLinksDirected = bind(this._setUnbreededLinksDirected, this);
      this._decrementPatchLabelCount = bind(this._decrementPatchLabelCount, this);
      this._incrementPatchLabelCount = bind(this._incrementPatchLabelCount, this);
      this._thisWrapY = bind(this._thisWrapY, this);
      this._thisWrapX = bind(this._thisWrapX, this);
      this.zoom = bind(this.zoom, this);
      this.getPatchAt = bind(this.getPatchAt, this);
      this.patches = bind(this.patches, this);
      this.selfManager = miniWorkspace.selfManager, this._updater = miniWorkspace.updater, this.rng = miniWorkspace.rng, this.breedManager = miniWorkspace.breedManager, this._plotManager = miniWorkspace.plotManager;
      this._patchesAllBlack = true;
      this._patchesWithLabels = 0;
      this._updater.collectUpdates();
      this._updater.registerWorldState({
        worldWidth: maxPxcor - minPxcor + 1,
        worldHeight: maxPycor - minPycor + 1,
        minPxcor: minPxcor,
        minPycor: minPycor,
        maxPxcor: maxPxcor,
        maxPycor: maxPycor,
        linkBreeds: this.breedManager.orderedLinkBreeds(),
        linkShapeList: this.linkShapeMap,
        patchSize: this.patchSize,
        patchesAllBlack: this._patchesAllBlack,
        patchesWithLabels: this._patchesWithLabels,
        ticks: -1,
        turtleBreeds: this.breedManager.orderedTurtleBreeds(),
        turtleShapeList: this.turtleShapeMap,
        unbreededLinksAreDirected: false,
        wrappingAllowedInX: wrappingAllowedInX,
        wrappingAllowedInY: wrappingAllowedInY
      });
      onTick = (function(_this) {
        return function() {
          _this.rng.withAux(onTickFunction);
          return _this._plotManager.updatePlots();
        };
      })(this);
      this.linkManager = new LinkManager(this, this.breedManager, this._updater, this._setUnbreededLinksDirected, this._setUnbreededLinksUndirected);
      this.observer = new Observer(this._updater.updated, globalNames, interfaceGlobalNames);
      this.ticker = new Ticker(this._plotManager.setupPlots, onTick, this._updater.updated(this));
      this.topology = null;
      this.turtleManager = new TurtleManager(this, this.breedManager, this._updater, this.rng.nextInt);
      this.hubnetManager = new HubnetManager();
      this._patches = [];
      this._resizeHelper(minPxcor, maxPxcor, minPycor, maxPycor, wrappingAllowedInX, wrappingAllowedInY);
    }

    World.prototype.links = function() {
      return this.linkManager.links();
    };

    World.prototype.turtles = function() {
      return this.turtleManager.turtles();
    };

    World.prototype.patches = function() {
      return new PatchSet(this._patches, this, "patches");
    };

    World.prototype.resize = function(minPxcor, maxPxcor, minPycor, maxPycor, wrapsInX, wrapsInY) {
      if (wrapsInX == null) {
        wrapsInX = this.topology._wrapInX;
      }
      if (wrapsInY == null) {
        wrapsInY = this.topology._wrapInY;
      }
      this._resizeHelper(minPxcor, maxPxcor, minPycor, maxPycor, wrapsInX, wrapsInY);
      return this.clearDrawing();
    };

    World.prototype._resizeHelper = function(minPxcor, maxPxcor, minPycor, maxPycor, wrapsInX, wrapsInY) {
      var ref3, ref4, ref5, ref6;
      if (wrapsInX == null) {
        wrapsInX = this.topology._wrapInX;
      }
      if (wrapsInY == null) {
        wrapsInY = this.topology._wrapInY;
      }
      if (!((minPxcor <= 0 && 0 <= maxPxcor) && (minPycor <= 0 && 0 <= maxPycor))) {
        throw new Error("You must include the point (0, 0) in the world.");
      }
      if (minPxcor !== ((ref3 = this.topology) != null ? ref3.minPxcor : void 0) || minPycor !== ((ref4 = this.topology) != null ? ref4.minPycor : void 0) || maxPxcor !== ((ref5 = this.topology) != null ? ref5.maxPxcor : void 0) || maxPycor !== ((ref6 = this.topology) != null ? ref6.maxPycor : void 0)) {
        this._config.resizeWorld();
        this.turtleManager._clearTurtlesSuspended();
        this.changeTopology(wrapsInX, wrapsInY, minPxcor, maxPxcor, minPycor, maxPycor);
        this._createPatches();
        this._declarePatchesAllBlack();
        this._resetPatchLabelCount();
        this._updater.updated(this)("width", "height", "minPxcor", "minPycor", "maxPxcor", "maxPycor");
      }
    };

    World.prototype.changeTopology = function(wrapsInX, wrapsInY, minX, maxX, minY, maxY) {
      if (minX == null) {
        minX = this.topology.minPxcor;
      }
      if (maxX == null) {
        maxX = this.topology.maxPxcor;
      }
      if (minY == null) {
        minY = this.topology.minPycor;
      }
      if (maxY == null) {
        maxY = this.topology.maxPycor;
      }
      this.topology = topologyFactory(wrapsInX, wrapsInY, minX, maxX, minY, maxY, this.patches, this.getPatchAt);
      this._updater.updated(this)("wrappingAllowedInX", "wrappingAllowedInY");
    };

    World.prototype.getPatchAt = function(x, y) {
      var error, error1, index, roundedX, roundedY;
      try {
        roundedX = this._roundXCor(x);
        roundedY = this._roundYCor(y);
        index = (this.topology.maxPycor - roundedY) * this.topology.width + (roundedX - this.topology.minPxcor);
        return this._patches[index];
      } catch (error1) {
        error = error1;
        if (error instanceof TopologyInterrupt) {
          return Nobody;
        } else {
          throw error;
        }
      }
    };

    World.prototype.patchAtCoords = function(x, y) {
      var error, error1, newX, newY;
      try {
        newX = this.topology.wrapX(x);
        newY = this.topology.wrapY(y);
        return this.getPatchAt(newX, newY);
      } catch (error1) {
        error = error1;
        if (error instanceof TopologyInterrupt) {
          return Nobody;
        } else {
          throw error;
        }
      }
    };

    World.prototype.patchAtHeadingAndDistanceFrom = function(angle, distance, x, y) {
      var heading, targetX, targetY;
      heading = NLMath.normalizeHeading(angle);
      targetX = x + distance * NLMath.squash(NLMath.sin(heading));
      targetY = y + distance * NLMath.squash(NLMath.cos(heading));
      return this.patchAtCoords(targetX, targetY);
    };

    World.prototype.setPatchSize = function(patchSize) {
      this.patchSize = patchSize;
      this._updater.updated(this)("patchSize");
    };

    World.prototype.clearAll = function() {
      this.observer.clearCodeGlobals();
      this.observer.resetPerspective();
      this.turtleManager.clearTurtles();
      this.clearPatches();
      this.clearLinks();
      this._declarePatchesAllBlack();
      this._resetPatchLabelCount();
      this.ticker.clear();
      this._plotManager.clearAllPlots();
      this._outputClear();
      this.clearDrawing();
    };

    World.prototype.clearDrawing = function() {
      this._updater.clearDrawing();
    };

    World.prototype.zoom = function(scale) {
      this._updater.zoom(scale);
    };

    World.prototype.resetZoom = function() {
      this._updater.resetZoom();
    };

    World.prototype.triggerUpdate = function() {
      this._updater.triggerUpdate();
    };

    World.prototype.importDrawing = function(sourcePath) {
      this._updater.importDrawing(sourcePath);
    };

    World.prototype.clearLinks = function() {
      this.linkManager.clear();
      this.turtles().ask((function() {
        return SelfManager.self().linkManager.clear();
      }), false);
    };

    World.prototype.clearPatches = function() {
      this.patches().forEach(function(patch) {
        patch.reset();
      });
      this._declarePatchesAllBlack();
      this._resetPatchLabelCount();
    };

    World.prototype.exportState = function() {
      return exportWorld.call(this);
    };

    World.prototype.exportAllPlotsCSV = function() {
      return allPlotsDataToCSV(exportAllPlots.call(this));
    };

    World.prototype.exportPlotCSV = function(name) {
      return plotDataToCSV(exportPlot.call(this, name));
    };

    World.prototype.exportCSV = function() {
      var allLinksOwnsNames, allTurtlesOwnsNames, state, varNamesForBreedsMatching;
      varNamesForBreedsMatching = (function(_this) {
        return function(pred) {
          return pipeline(values, filter(pred), flatMap(function(x) {
            return x.varNames;
          }))(_this.breedManager.breeds());
        };
      })(this);
      allTurtlesOwnsNames = varNamesForBreedsMatching(function(breed) {
        return !breed.isLinky();
      });
      allLinksOwnsNames = varNamesForBreedsMatching(function(breed) {
        return breed.isLinky();
      });
      state = exportWorld.call(this);
      return worldDataToCSV(allTurtlesOwnsNames, allLinksOwnsNames, patchBuiltins, turtleBuiltins, linkBuiltins)(state);
    };

    World.prototype.getNeighbors = function(pxcor, pycor) {
      return new PatchSet(this.topology.getNeighbors(pxcor, pycor), this);
    };

    World.prototype.getNeighbors4 = function(pxcor, pycor) {
      return new PatchSet(this.topology.getNeighbors4(pxcor, pycor), this);
    };

    World.prototype.importState = function() {
      return importWorld.apply(this, arguments);
    };

    World.prototype._thisWrapX = function(x) {
      return this.topology.wrapX(x);
    };

    World.prototype._thisWrapY = function(y) {
      return this.topology.wrapY(y);
    };

    World.prototype._roundXCor = function(x) {
      var wrappedX;
      wrappedX = this._wrapC(x, this._thisWrapX);
      return this._roundCoordinate(wrappedX);
    };

    World.prototype._roundYCor = function(y) {
      var wrappedY;
      wrappedY = this._wrapC(y, this._thisWrapY);
      return this._roundCoordinate(wrappedY);
    };

    World.prototype._wrapC = function(c, wrapper) {
      var error, error1, trueError, wrappedC;
      wrappedC = void 0;
      try {
        wrappedC = wrapper(c);
      } catch (error1) {
        error = error1;
        trueError = error instanceof TopologyInterrupt ? new TopologyInterrupt("Cannot access patches beyond the limits of current world.") : error;
        throw trueError;
      }
      return wrappedC;
    };

    World.prototype._roundCoordinate = function(wrappedC) {
      var fractional, integral;
      if (wrappedC > 0) {
        return (wrappedC + 0.5) | 0;
      } else {
        integral = wrappedC | 0;
        fractional = integral - wrappedC;
        if (fractional > 0.5) {
          return integral - 1;
        } else {
          return integral;
        }
      }
    };

    World.prototype._createPatches = function() {
      var i, id, len, nested, patch, ref3, ref4, x, y;
      nested = (function() {
        var i, ref3, ref4, results;
        results = [];
        for (y = i = ref3 = this.topology.maxPycor, ref4 = this.topology.minPycor; ref3 <= ref4 ? i <= ref4 : i >= ref4; y = ref3 <= ref4 ? ++i : --i) {
          results.push((function() {
            var j, ref5, ref6, results1;
            results1 = [];
            for (x = j = ref5 = this.topology.minPxcor, ref6 = this.topology.maxPxcor; ref5 <= ref6 ? j <= ref6 : j >= ref6; x = ref5 <= ref6 ? ++j : --j) {
              id = (this.topology.width * (this.topology.maxPycor - y)) + x - this.topology.minPxcor;
              results1.push(new Patch(id, x, y, this, this._updater.updated, this._declarePatchesNotAllBlack, this._decrementPatchLabelCount, this._incrementPatchLabelCount));
            }
            return results1;
          }).call(this));
        }
        return results;
      }).call(this);
      this._patches = (ref3 = []).concat.apply(ref3, nested);
      ref4 = this._patches;
      for (i = 0, len = ref4.length; i < len; i++) {
        patch = ref4[i];
        this._updater.updated(patch)("pxcor", "pycor", "pcolor", "plabel", "plabel-color");
      }
    };

    World.prototype._optimalPatchCol = function(xcor) {
      var maxX, maxY, minX, minY, ref3;
      ref3 = this.topology, maxX = ref3.maxPxcor, maxY = ref3.maxPycor, minX = ref3.minPxcor, minY = ref3.minPycor;
      return this._optimalPatchSequence(xcor, minX, maxX, minY, maxY, (function(_this) {
        return function(y) {
          return _this.getPatchAt(xcor, y);
        };
      })(this));
    };

    World.prototype._optimalPatchRow = function(ycor) {
      var maxX, maxY, minX, minY, ref3;
      ref3 = this.topology, maxX = ref3.maxPxcor, maxY = ref3.maxPycor, minX = ref3.minPxcor, minY = ref3.minPycor;
      return this._optimalPatchSequence(ycor, minY, maxY, minX, maxX, (function(_this) {
        return function(x) {
          return _this.getPatchAt(x, ycor);
        };
      })(this));
    };

    World.prototype._optimalPatchSequence = function(cor, boundaryMin, boundaryMax, seqStart, seqEnd, getPatch) {
      var n, ref3, ret;
      ret = (boundaryMin <= cor && cor <= boundaryMax) ? (ref3 = []).concat.apply(ref3, (function() {
        var i, ref3, ref4, results;
        results = [];
        for (n = i = ref3 = seqStart, ref4 = seqEnd; ref3 <= ref4 ? i <= ref4 : i >= ref4; n = ref3 <= ref4 ? ++i : --i) {
          results.push(getPatch(n));
        }
        return results;
      })()) : [];
      return new PatchSet(ret, this);
    };

    World.prototype._incrementPatchLabelCount = function() {
      this._setPatchLabelCount(function(count) {
        return count + 1;
      });
    };

    World.prototype._decrementPatchLabelCount = function() {
      this._setPatchLabelCount(function(count) {
        return count - 1;
      });
    };

    World.prototype._resetPatchLabelCount = function() {
      this._setPatchLabelCount(function() {
        return 0;
      });
    };

    World.prototype._setPatchLabelCount = function(updateCountFunc) {
      this._patchesWithLabels = updateCountFunc(this._patchesWithLabels);
      this._updater.updated(this)("patchesWithLabels");
    };

    World.prototype._setUnbreededLinksDirected = function() {
      this.breedManager.setUnbreededLinksDirected();
      this._updater.updated(this)("unbreededLinksAreDirected");
    };

    World.prototype._setUnbreededLinksUndirected = function() {
      this.breedManager.setUnbreededLinksUndirected();
      this._updater.updated(this)("unbreededLinksAreDirected");
    };

    World.prototype._declarePatchesAllBlack = function() {
      if (!this._patchesAllBlack) {
        this._patchesAllBlack = true;
        this._updater.updated(this)("patchesAllBlack");
      }
    };

    World.prototype._declarePatchesNotAllBlack = function() {
      if (this._patchesAllBlack) {
        this._patchesAllBlack = false;
        this._updater.updated(this)("patchesAllBlack");
      }
    };

    return World;

  })();

}).call(this);

},{"./observer":"engine/core/observer","./patch":"engine/core/patch","./patchset":"engine/core/patchset","./structure/builtins":"engine/core/structure/builtins","./topology/factory":"engine/core/topology/factory","./world/export":"engine/core/world/export","./world/hubnetmanager":"engine/core/world/hubnetmanager","./world/import":"engine/core/world/import","./world/linkmanager":"engine/core/world/linkmanager","./world/ticker":"engine/core/world/ticker","./world/turtlemanager":"engine/core/world/turtlemanager","brazier/array":"brazier/array","brazier/function":"brazier/function","brazier/object":"brazier/object","serialize/exportcsv":"serialize/exportcsv","util/exception":"util/exception","util/nlmath":"util/nlmath"}],"engine/dump":[function(require,module,exports){
(function() {
  var NLType, Tasks, apply, dump, find, flip, fold, map, pipeline, ref, ref1;

  NLType = require('./core/typechecker');

  Tasks = require('./prim/tasks');

  ref = require('brazierjs/array'), find = ref.find, map = ref.map;

  ref1 = require('brazierjs/function'), apply = ref1.apply, flip = ref1.flip, pipeline = ref1.pipeline;

  fold = require('brazierjs/maybe').fold;

  dump = function(extensionDumpers) {
    var helper;
    helper = function(x, isReadable) {
      var itemStr, type;
      if (isReadable == null) {
        isReadable = false;
      }
      type = NLType(x);
      if (type.isList()) {
        itemStr = map(function(y) {
          return helper(y, isReadable);
        })(x).join(" ");
        return "[" + itemStr + "]";
      } else if (type.isReporterLambda()) {
        return "(anonymous reporter: " + x.nlogoBody + ")";
      } else if (type.isCommandLambda()) {
        return "(anonymous command: " + x.nlogoBody + ")";
      } else if (type.isString()) {
        if (isReadable) {
          return '"' + x + '"';
        } else {
          return x;
        }
      } else if (type.isNumber()) {
        return String(x).toUpperCase();
      } else {
        return pipeline(find(function(d) {
          return d.canDump(x);
        }), fold(function() {
          return String;
        })(function(d) {
          return d.dump;
        }), flip(apply)(x))(extensionDumpers);
      }
    };
    return helper;
  };

  module.exports = dump;

}).call(this);

},{"./core/typechecker":"engine/core/typechecker","./prim/tasks":"engine/prim/tasks","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/maybe":"brazier/maybe"}],"engine/hasher":[function(require,module,exports){
(function() {
  var AbstractAgentSet, Hasher, Link, NLType, Turtle, foldl;

  AbstractAgentSet = require('./core/abstractagentset');

  Link = require('./core/link');

  Turtle = require('./core/turtle');

  NLType = require('./core/typechecker');

  foldl = require('brazierjs/array').foldl;

  Hasher = function(x) {
    var f, type;
    type = NLType(x);
    if (type.isTurtle() || type.isLink()) {
      return x.constructor.name + " | " + x.id;
    } else if (x === Nobody) {
      return "nobody: -1";
    } else if (type.isList()) {
      f = function(acc, x) {
        return "31 *" + acc + (x != null ? Hasher(x) : "0");
      };
      return (foldl(f)(1)(x)).toString();
    } else if (type.isAgentSet()) {
      return (x.toString()) + " | " + (Hasher(x.toArray()));
    } else {
      return x.toString();
    }
  };

  module.exports = Hasher;

}).call(this);

},{"./core/abstractagentset":"engine/core/abstractagentset","./core/link":"engine/core/link","./core/turtle":"engine/core/turtle","./core/typechecker":"engine/core/typechecker","brazierjs/array":"brazier/array"}],"engine/plot/pen":[function(require,module,exports){
(function() {
  var Bar, ColorModel, Counter, Down, Line, Pen, PlotPoint, Point, State, StrictMath, Up, countBy, displayModeFromNum, displayModeFromString, displayModeToNum, displayModeToString, filter, forEach, id, isNumber, map, pairs, pipeline, ref, ref1;

  StrictMath = require('shim/strictmath');

  ref = require('brazierjs/array'), countBy = ref.countBy, filter = ref.filter, forEach = ref.forEach, map = ref.map;

  ref1 = require('brazierjs/function'), id = ref1.id, pipeline = ref1.pipeline;

  pairs = require('brazierjs/object').pairs;

  isNumber = require('brazierjs/type').isNumber;

  ColorModel = require('engine/core/colormodel');

  Up = {};

  Down = {};

  module.exports.PenMode = {
    Up: Up,
    Down: Down,
    penModeToBool: function(penDown) {
      if (penDown === Up) {
        return false;
      } else {
        return true;
      }
    }
  };

  Line = {};

  Bar = {};

  Point = {};

  displayModeFromNum = function(num) {
    switch (num) {
      case 0:
        return Line;
      case 1:
        return Bar;
      case 2:
        return Point;
      default:
        throw new Error("Pen display mode expected `0` (line), `1` (bar), or `2` (point), but got `" + num + "`");
    }
  };

  displayModeToNum = function(mode) {
    switch (mode) {
      case Line:
        return 0;
      case Bar:
        return 1;
      case Point:
        return 2;
      default:
        throw new Error("Invalid display mode: " + mode);
    }
  };

  displayModeFromString = function(num) {
    switch (num) {
      case 'line':
        return Line;
      case 'bar':
        return Bar;
      case 'point':
        return Point;
      default:
        throw new Error("Pen display mode expected 'line', 'bar', or 'point', but got `" + num + "`");
    }
  };

  displayModeToString = function(mode) {
    switch (mode) {
      case Line:
        return 'line';
      case Bar:
        return 'bar';
      case Point:
        return 'point';
      default:
        throw new Error("Invalid display mode: " + mode);
    }
  };

  module.exports.DisplayMode = {
    Line: Line,
    Bar: Bar,
    Point: Point,
    displayModeFromNum: displayModeFromNum,
    displayModeFromString: displayModeFromString,
    displayModeToNum: displayModeToNum,
    displayModeToString: displayModeToString
  };

  PlotPoint = (function() {
    function PlotPoint(x1, y1, penMode, color1) {
      this.x = x1;
      this.y = y1;
      this.penMode = penMode;
      this.color = color1;
    }

    return PlotPoint;

  })();

  Counter = (function() {
    function Counter(_count, _atFirst) {
      this._count = _count != null ? _count : 0;
      this._atFirst = _atFirst != null ? _atFirst : true;
    }

    Counter.prototype.next = function(interval) {
      if (this._atFirst) {
        this._atFirst = false;
        return 0;
      } else {
        return this._count += interval;
      }
    };

    return Counter;

  })();

  module.exports.State = State = (function() {
    State.prototype._counter = void 0;

    function State(color1, interval1, displayMode, mode1) {
      this.color = color1 != null ? color1 : 0;
      this.interval = interval1 != null ? interval1 : 1;
      this.displayMode = displayMode != null ? displayMode : Line;
      this.mode = mode1 != null ? mode1 : Down;
      this.resetCounter();
    }

    State.prototype.clone = function() {
      return new State(this.color, this.interval, this.displayMode, this.mode);
    };

    State.prototype.leapCounterTo = function(x) {
      this._counter = new Counter(x, false);
    };

    State.prototype.getPenX = function() {
      return this._counter._count;
    };

    State.prototype.nextX = function() {
      return this._counter.next(this.interval);
    };

    State.prototype.partiallyReset = function() {
      return new State(this.color, this.interval, this.displayMode, Down);
    };

    State.prototype.resetCounter = function() {
      this._counter = new Counter();
    };

    return State;

  })();

  module.exports.Pen = Pen = (function() {
    Pen.prototype._bounds = void 0;

    Pen.prototype._ops = void 0;

    Pen.prototype._points = void 0;

    Pen.prototype._state = void 0;

    function Pen(name, genOps, isTemp, _defaultState, _setupThis, _updateThis) {
      this.name = name;
      this.isTemp = isTemp != null ? isTemp : false;
      this._defaultState = _defaultState != null ? _defaultState : new State();
      this._setupThis = _setupThis != null ? _setupThis : (function() {});
      this._updateThis = _updateThis != null ? _updateThis : (function() {});
      this._ops = genOps(this);
      this.reset();
    }

    Pen.prototype.addValue = function(y) {
      this._addPoint(this._state.nextX(), y);
    };

    Pen.prototype.addXY = function(x, y) {
      this._addPoint(x, y);
      this._state.leapCounterTo(x);
    };

    Pen.prototype.bounds = function() {
      return this._bounds;
    };

    Pen.prototype.drawHistogramFrom = function(ys, xMin, xMax) {
      var determineBucket, interval, isValid, plotBucket;
      this.reset(true);
      interval = this.getInterval();
      isValid = (function(_this) {
        return function(x) {
          return ((xMin / interval) <= x && x <= (xMax / interval));
        };
      })(this);
      determineBucket = function(x) {
        return StrictMath.floor((x / interval) * (1 + 3.2e-15));
      };
      plotBucket = ((function(_this) {
        return function(arg) {
          var bucketNum, count;
          bucketNum = arg[0], count = arg[1];
          _this.addXY(Number(bucketNum) * interval, count);
        };
      })(this));
      pipeline(filter(isNumber), map(determineBucket), filter(isValid), countBy(id), pairs, forEach(plotBucket))(ys);
    };

    Pen.prototype.getColor = function() {
      return this._state.color;
    };

    Pen.prototype.getPenMode = function() {
      return this._state.mode;
    };

    Pen.prototype.getDisplayMode = function() {
      return this._state.displayMode;
    };

    Pen.prototype.getInterval = function() {
      return this._state.interval;
    };

    Pen.prototype.getPenX = function() {
      return this._state.getPenX();
    };

    Pen.prototype.getPoints = function() {
      return this._points;
    };

    Pen.prototype.importState = function(arg) {
      var interval, isPenDown, mode, penColor, penX, points, xs, ys;
      penColor = arg.color, interval = arg.interval, mode = arg.mode, isPenDown = arg.isPenDown, points = arg.points, penX = arg.x;
      points.forEach((function(_this) {
        return function(arg1) {
          var color, isPointVisible, x, y;
          color = arg1.color, isPointVisible = arg1.isPenDown, x = arg1.x, y = arg1.y;
          _this._points.push(new PlotPoint(x, y, (isPointVisible ? Down : Up), color));
          _this._ops.addPoint(x, y);
        };
      })(this));
      xs = this._points.map(function(p) {
        return p.x;
      });
      ys = this._points.map(function(p) {
        return p.y;
      });
      this._bounds = [Math.min.apply(Math, xs), Math.max.apply(Math, xs), Math.min.apply(Math, ys), Math.max.apply(Math, ys)];
      if (isPenDown) {
        this.lower();
      } else {
        this.raise();
      }
      this.setColor(penColor);
      this.setInterval(interval);
      this._state.leapCounterTo(penX);
      this.updateDisplayMode(displayModeFromString(mode));
    };

    Pen.prototype.lower = function() {
      this._state.mode = Down;
    };

    Pen.prototype.raise = function() {
      this._state.mode = Up;
    };

    Pen.prototype.reset = function(isSoftResetting) {
      if (isSoftResetting == null) {
        isSoftResetting = false;
      }
      this._bounds = void 0;
      this._state = (this._state != null) && (isSoftResetting || this.isTemp) ? this._state.partiallyReset() : this._defaultState.clone();
      this._points = [];
      this._ops.reset();
      this._ops.updateMode(this._state.displayMode);
    };

    Pen.prototype.setColor = function(color) {
      var trueColor;
      trueColor = isNumber(color) ? color : ColorModel.nearestColorNumberOfRGB.apply(ColorModel, color);
      this._state.color = trueColor;
      this._ops.updateColor(trueColor);
    };

    Pen.prototype.setInterval = function(interval) {
      this._state.interval = interval;
    };

    Pen.prototype.setup = function() {
      this._setupThis();
    };

    Pen.prototype.update = function() {
      this._updateThis();
    };

    Pen.prototype.updateDisplayMode = function(newMode) {
      this._state.displayMode = newMode;
      this._ops.updateMode(newMode);
    };

    Pen.prototype._addPoint = function(x, y) {
      this._points.push(new PlotPoint(x, y, this._state.mode, this._state.color));
      this._updateBounds(x, y);
      this._ops.addPoint(x, y);
    };

    Pen.prototype._updateBounds = function(x, y) {
      var maxX, maxY, minX, minY, ref2;
      this._bounds = this._bounds != null ? ((ref2 = this._bounds, minX = ref2[0], maxX = ref2[1], minY = ref2[2], maxY = ref2[3], ref2), [Math.min(minX, x), Math.max(maxX, x), Math.min(minY, y), Math.max(maxY, y)]) : [x, x, y, y];
    };

    return Pen;

  })();

}).call(this);

},{"brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/object":"brazier/object","brazierjs/type":"brazier/type","engine/core/colormodel":"engine/core/colormodel","shim/strictmath":"shim/strictmath"}],"engine/plot/plotmanager":[function(require,module,exports){
(function() {
  var PlotManager, displayModeFromNum, filter, flatMapMaybe, flip, fold, forEach, isNumber, map, mapMaybe, maybe, pipeline, ref, ref1, ref2, toObject, values, zip,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  displayModeFromNum = require('./pen').DisplayMode.displayModeFromNum;

  ref = require('brazierjs/array'), filter = ref.filter, forEach = ref.forEach, map = ref.map, toObject = ref.toObject, zip = ref.zip;

  ref1 = require('brazierjs/function'), flip = ref1.flip, pipeline = ref1.pipeline;

  ref2 = require('brazierjs/maybe'), flatMapMaybe = ref2.flatMap, fold = ref2.fold, mapMaybe = ref2.map, maybe = ref2.maybe;

  values = require('brazierjs/object').values;

  isNumber = require('brazierjs/type').isNumber;

  module.exports = PlotManager = (function() {
    PlotManager.prototype._currentPlotMaybe = void 0;

    PlotManager.prototype._plotMap = void 0;

    function PlotManager(plots) {
      this.updatePlots = bind(this.updatePlots, this);
      this.setupPlots = bind(this.setupPlots, this);
      var toName;
      toName = function(p) {
        return p.name.toUpperCase();
      };
      this._currentPlotMaybe = maybe(plots[plots.length - 1]);
      this._plotMap = pipeline(map(toName), flip(zip)(plots), toObject)(plots);
    }

    PlotManager.prototype.clearAllPlots = function() {
      this._forAllPlots(function(plot) {
        return plot.clear();
      });
    };

    PlotManager.prototype.clearPlot = function() {
      this._withPlot(function(plot) {
        return plot.clear();
      });
    };

    PlotManager.prototype.createTemporaryPen = function(name) {
      this._withPlot(function(plot) {
        return plot.createTemporaryPen(name);
      });
    };

    PlotManager.prototype.disableAutoplotting = function() {
      this._withPlot(function(plot) {
        return plot.disableAutoplotting();
      });
    };

    PlotManager.prototype.drawHistogramFrom = function(list) {
      this._withPlot(function(plot) {
        var numbers;
        numbers = filter(isNumber)(list);
        return plot.drawHistogramFrom(numbers);
      });
    };

    PlotManager.prototype.enableAutoplotting = function() {
      this._withPlot(function(plot) {
        return plot.enableAutoplotting();
      });
    };

    PlotManager.prototype.getCurrentPlotMaybe = function() {
      return this._currentPlotMaybe;
    };

    PlotManager.prototype.getPlotName = function() {
      return this._withPlot(function(plot) {
        return plot.name;
      });
    };

    PlotManager.prototype.getPlots = function() {
      return values(this._plotMap);
    };

    PlotManager.prototype.getPlotXMax = function() {
      return this._withPlot(function(plot) {
        return plot.xMax;
      });
    };

    PlotManager.prototype.getPlotXMin = function() {
      return this._withPlot(function(plot) {
        return plot.xMin;
      });
    };

    PlotManager.prototype.getPlotYMax = function() {
      return this._withPlot(function(plot) {
        return plot.yMax;
      });
    };

    PlotManager.prototype.getPlotYMin = function() {
      return this._withPlot(function(plot) {
        return plot.yMin;
      });
    };

    PlotManager.prototype.hasPenWithName = function(name) {
      return this._withPlot(function(plot) {
        return plot.hasPenWithName(name);
      });
    };

    PlotManager.prototype.importState = function(arg) {
      var currentPlotNameOrNull, plots;
      currentPlotNameOrNull = arg.currentPlotNameOrNull, plots = arg.plots;
      plots.forEach((function(_this) {
        return function(plot) {
          var ref3;
          return (ref3 = _this._plotMap[plot.name.toUpperCase()]) != null ? ref3.importState(plot) : void 0;
        };
      })(this));
      this._currentPlotMaybe = flatMapMaybe((function(_this) {
        return function(name) {
          return maybe(_this._plotMap[name.toUpperCase()]);
        };
      })(this))(maybe(currentPlotNameOrNull));
    };

    PlotManager.prototype.isAutoplotting = function() {
      return this._withPlot(function(plot) {
        return plot.isAutoplotting;
      });
    };

    PlotManager.prototype.lowerPen = function() {
      this._withPlot(function(plot) {
        return plot.lowerPen();
      });
    };

    PlotManager.prototype.plotPoint = function(x, y) {
      this._withPlot(function(plot) {
        return plot.plotPoint(x, y);
      });
    };

    PlotManager.prototype.plotValue = function(value) {
      this._withPlot(function(plot) {
        return plot.plotValue(value);
      });
    };

    PlotManager.prototype.raisePen = function() {
      this._withPlot(function(plot) {
        return plot.raisePen();
      });
    };

    PlotManager.prototype.resetPen = function() {
      this._withPlot(function(plot) {
        return plot.resetPen();
      });
    };

    PlotManager.prototype.setCurrentPen = function(name) {
      this._withPlot(function(plot) {
        return plot.setCurrentPen(name);
      });
    };

    PlotManager.prototype.setCurrentPlot = function(name) {
      var plot;
      plot = this._plotMap[name.toUpperCase()];
      if (plot != null) {
        this._currentPlotMaybe = maybe(plot);
      } else {
        throw new Error("no such plot: \"" + name + "\"");
      }
    };

    PlotManager.prototype.setHistogramBarCount = function(num) {
      if (num > 0) {
        this._withPlot(function(plot) {
          return plot.setHistogramBarCount(num);
        });
      } else {
        throw new Error("You cannot make a histogram with " + num + " bars.");
      }
    };

    PlotManager.prototype.setPenColor = function(color) {
      this._withPlot(function(plot) {
        return plot.setPenColor(color);
      });
    };

    PlotManager.prototype.setPenInterval = function(color) {
      this._withPlot(function(plot) {
        return plot.setPenInterval(color);
      });
    };

    PlotManager.prototype.setPenMode = function(num) {
      this._withPlot(function(plot) {
        return plot.updateDisplayMode(displayModeFromNum(num));
      });
    };

    PlotManager.prototype.setupPlots = function() {
      this._forAllPlots(function(plot) {
        return plot.setup();
      });
    };

    PlotManager.prototype.setXRange = function(min, max) {
      this._withPlot(function(plot) {
        return plot.setXRange(min, max);
      });
    };

    PlotManager.prototype.setYRange = function(min, max) {
      this._withPlot(function(plot) {
        return plot.setYRange(min, max);
      });
    };

    PlotManager.prototype.updatePlots = function() {
      this._forAllPlots(function(plot) {
        return plot.update();
      });
    };

    PlotManager.prototype.withTemporaryContext = function(plotName, penName) {
      return (function(_this) {
        return function(f) {
          var oldPlotMaybe, result, tempPlotMaybe;
          oldPlotMaybe = _this._currentPlotMaybe;
          tempPlotMaybe = maybe(_this._plotMap[plotName.toUpperCase()]);
          _this._currentPlotMaybe = tempPlotMaybe;
          result = penName != null ? mapMaybe(function(tempPlot) {
            return tempPlot.withTemporaryContext(penName)(f);
          })(tempPlotMaybe) : f();
          _this._currentPlotMaybe = oldPlotMaybe;
          return result;
        };
      })(this);
    };

    PlotManager.prototype._forAllPlots = function(f) {
      pipeline(values, forEach(f))(this._plotMap);
    };

    PlotManager.prototype._withPlot = function(f) {
      var error;
      error = new Error("There is no current plot. Please select a current plot using the set-current-plot command.");
      return fold(function() {
        throw error;
      })(f)(this._currentPlotMaybe);
    };

    return PlotManager;

  })();

}).call(this);

},{"./pen":"engine/plot/pen","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/maybe":"brazier/maybe","brazierjs/object":"brazier/object","brazierjs/type":"brazier/type"}],"engine/plot/plotops":[function(require,module,exports){
(function() {
  var ColorModel, PenOps, PlottingOps,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ColorModel = require('../core/colormodel');

  PenOps = (function() {
    PenOps.prototype.addPoint = void 0;

    PenOps.prototype.reset = void 0;

    PenOps.prototype.updateMode = void 0;

    PenOps.prototype.updateColor = void 0;

    function PenOps(plottingOps, pen) {
      this.addPoint = plottingOps.addPoint(pen);
      this.reset = plottingOps.resetPen(pen);
      this.updateMode = plottingOps.updatePenMode(pen);
      this.updateColor = plottingOps.updatePenColor(pen);
    }

    return PenOps;

  })();

  module.exports = PlottingOps = (function() {
    function PlottingOps(resize, reset, registerPen, resetPen, addPoint, updatePenMode, updatePenColor) {
      this.resize = resize;
      this.reset = reset;
      this.registerPen = registerPen;
      this.resetPen = resetPen;
      this.addPoint = addPoint;
      this.updatePenMode = updatePenMode;
      this.updatePenColor = updatePenColor;
      this.makePenOps = bind(this.makePenOps, this);
    }

    PlottingOps.prototype.colorToRGBString = function(color) {
      var b, g, r, ref;
      ref = ColorModel.colorToRGB(color), r = ref[0], g = ref[1], b = ref[2];
      return "rgb(" + r + ", " + g + ", " + b + ")";
    };

    PlottingOps.prototype.makePenOps = function(pen) {
      return new PenOps(this, pen);
    };

    return PlottingOps;

  })();

}).call(this);

},{"../core/colormodel":"engine/core/colormodel"}],"engine/plot/plot":[function(require,module,exports){
(function() {
  var Pen, Plot, Stop, StrictMath, filter, flip, fold, forEach, id, isEmpty, isSomething, lookup, map, maxBy, maybe, pipeline, ref, ref1, ref2, ref3, toObject, values, zip;

  Pen = require('./pen').Pen;

  StrictMath = require('shim/strictmath');

  ref = require('brazierjs/array'), filter = ref.filter, forEach = ref.forEach, isEmpty = ref.isEmpty, map = ref.map, maxBy = ref.maxBy, toObject = ref.toObject, zip = ref.zip;

  ref1 = require('brazierjs/function'), flip = ref1.flip, id = ref1.id, pipeline = ref1.pipeline;

  ref2 = require('brazierjs/maybe'), fold = ref2.fold, isSomething = ref2.isSomething, maybe = ref2.maybe;

  ref3 = require('brazierjs/object'), lookup = ref3.lookup, values = ref3.values;

  Stop = require('util/exception').StopInterrupt;

  module.exports = Plot = (function() {
    Plot.prototype._currentPenMaybe = void 0;

    Plot.prototype._originalBounds = void 0;

    Plot.prototype._penMap = void 0;

    Plot.prototype.name = void 0;

    function Plot(name1, pens, _ops, xLabel, yLabel, isLegendEnabled, isAutoplotting, xMin, xMax, yMin, yMax, _setupThis, _updateThis) {
      var toName;
      this.name = name1;
      if (pens == null) {
        pens = [];
      }
      this._ops = _ops;
      this.xLabel = xLabel;
      this.yLabel = yLabel;
      this.isLegendEnabled = isLegendEnabled != null ? isLegendEnabled : true;
      this.isAutoplotting = isAutoplotting != null ? isAutoplotting : true;
      this.xMin = xMin != null ? xMin : 0;
      this.xMax = xMax != null ? xMax : 10;
      this.yMin = yMin != null ? yMin : 0;
      this.yMax = yMax != null ? yMax : 10;
      this._setupThis = _setupThis != null ? _setupThis : (function() {});
      this._updateThis = _updateThis != null ? _updateThis : (function() {});
      toName = function(p) {
        return p.name.toUpperCase();
      };
      this._currentPenMaybe = maybe(pens[0]);
      this._originalBounds = [this.xMin, this.xMax, this.yMin, this.yMax];
      this._penMap = pipeline(map(toName), flip(zip)(pens), toObject)(pens);
      this.clear();
    }

    Plot.prototype.clear = function() {
      var deletePen, pens, ref4, resetPen;
      ref4 = this._originalBounds, this.xMin = ref4[0], this.xMax = ref4[1], this.yMin = ref4[2], this.yMax = ref4[3];
      this._ops.reset(this);
      this._resize();
      pens = this.getPens();
      deletePen = ((function(_this) {
        return function(x) {
          delete _this._penMap[x.name.toUpperCase()];
        };
      })(this));
      resetPen = ((function(_this) {
        return function(pen) {
          pen.reset();
          _this._ops.registerPen(pen);
        };
      })(this));
      pipeline(filter(function(x) {
        return x.isTemp;
      }), forEach(deletePen))(pens);
      pipeline(filter(function(x) {
        return !x.isTemp;
      }), forEach(resetPen))(pens);
      if (fold(function() {
        return false;
      })(function(cp) {
        return cp.isTemp;
      })(this._currentPenMaybe)) {
        this._currentPenMaybe = maybe(isEmpty(pens) ? (this._penMap.DEFAULT = new Pen("DEFAULT", this._ops.makePenOps), this._penMap.DEFAULT) : pens[0]);
      }
    };

    Plot.prototype.createTemporaryPen = function(name) {
      this._currentPenMaybe = maybe(this._createAndReturnTemporaryPen(name));
    };

    Plot.prototype.disableAutoplotting = function() {
      this.isAutoplotting = false;
    };

    Plot.prototype.drawHistogramFrom = function(list) {
      this._withPen((function(_this) {
        return function(pen) {
          if (pen.getInterval() > 0) {
            pen.drawHistogramFrom(list, _this.xMin, _this.xMax);
            return _this._verifyHistogramSize(pen);
          } else {
            throw new Error("You cannot histogram with a plot-pen-interval of " + pen.interval + ".");
          }
        };
      })(this));
    };

    Plot.prototype.enableAutoplotting = function() {
      this.isAutoplotting = true;
    };

    Plot.prototype.getCurrentPenMaybe = function() {
      return this._currentPenMaybe;
    };

    Plot.prototype.getPens = function() {
      return values(this._penMap);
    };

    Plot.prototype.hasPenWithName = function(name) {
      return pipeline(this._getPenMaybeByName.bind(this), isSomething)(name);
    };

    Plot.prototype.importState = function(arg) {
      var currentPenNameOrNull, pens;
      currentPenNameOrNull = arg.currentPenNameOrNull, this.isAutoplotting = arg.isAutoplotting, this.isLegendEnabled = arg.isLegendOpen, pens = arg.pens, this.xMax = arg.xMax, this.xMin = arg.xMin, this.yMax = arg.yMax, this.yMin = arg.yMin;
      pens.forEach((function(_this) {
        return function(pen) {
          return _this._createAndReturnTemporaryPen(pen.name).importState(pen);
        };
      })(this));
      this._currentPenMaybe = this._getPenMaybeByName(currentPenNameOrNull);
      this._resize();
    };

    Plot.prototype.lowerPen = function() {
      this._withPen(function(pen) {
        return pen.lower();
      });
    };

    Plot.prototype.plotPoint = function(x, y) {
      this._withPen((function(_this) {
        return function(pen) {
          pen.addXY(x, y);
          return _this._verifySize(pen);
        };
      })(this));
    };

    Plot.prototype.plotValue = function(value) {
      this._withPen((function(_this) {
        return function(pen) {
          pen.addValue(value);
          return _this._verifySize(pen);
        };
      })(this));
    };

    Plot.prototype.raisePen = function() {
      this._withPen(function(pen) {
        return pen.raise();
      });
    };

    Plot.prototype.resetPen = function() {
      this._withPen(function(pen) {
        return pen.reset();
      });
    };

    Plot.prototype.setCurrentPen = function(name) {
      var penMaybe;
      penMaybe = this._getPenMaybeByName(name);
      if (isSomething(penMaybe)) {
        this._currentPenMaybe = penMaybe;
      } else {
        throw new Error("There is no pen named \"" + name + "\" in the current plot");
      }
    };

    Plot.prototype.setHistogramBarCount = function(num) {
      this._withPen((function(_this) {
        return function(pen) {
          var interval;
          if (num >= 1) {
            interval = (_this.xMax - _this.xMin) / num;
            return pen.setInterval(interval);
          } else {
            throw new Error("You cannot make a histogram with " + num + " bars.");
          }
        };
      })(this));
    };

    Plot.prototype.setPenColor = function(color) {
      this._withPen(function(pen) {
        return pen.setColor(color);
      });
    };

    Plot.prototype.setPenInterval = function(num) {
      this._withPen(function(pen) {
        return pen.setInterval(num);
      });
    };

    Plot.prototype.setup = function() {
      var setupResult;
      setupResult = this._setupThis();
      if (!(setupResult instanceof Stop)) {
        this.getPens().forEach(function(pen) {
          return pen.setup();
        });
      }
    };

    Plot.prototype.setXRange = function(min, max) {
      if (min >= max) {
        throw new Error("the minimum must be less than the maximum, but " + min + " is greater than or equal to " + max);
      }
      this.xMin = min;
      this.xMax = max;
      this._resize();
    };

    Plot.prototype.setYRange = function(min, max) {
      if (min >= max) {
        throw new Error("the minimum must be less than the maximum, but " + min + " is greater than or equal to " + max);
      }
      this.yMin = min;
      this.yMax = max;
      this._resize();
    };

    Plot.prototype.update = function() {
      var updateResult;
      updateResult = this._updateThis();
      if (!(updateResult instanceof Stop)) {
        this.getPens().forEach(function(pen) {
          return pen.update();
        });
      }
    };

    Plot.prototype.updateDisplayMode = function(newMode) {
      this._withPen(function(pen) {
        return pen.updateDisplayMode(newMode);
      });
    };

    Plot.prototype.withTemporaryContext = function(penName) {
      return (function(_this) {
        return function(f) {
          var oldPenMaybe;
          oldPenMaybe = _this._currentPenMaybe;
          _this._currentPenMaybe = _this._getPenMaybeByName(penName);
          f();
          _this._currentPenMaybe = oldPenMaybe;
        };
      })(this);
    };

    Plot.prototype._createAndReturnTemporaryPen = function(name) {
      var makeNew;
      makeNew = (function(_this) {
        return function() {
          var pen;
          pen = new Pen(name, _this._ops.makePenOps, true);
          _this._penMap[pen.name.toUpperCase()] = pen;
          _this._ops.registerPen(pen);
          return pen;
        };
      })(this);
      return pipeline(this._getPenMaybeByName.bind(this), fold(makeNew)(id))(name);
    };

    Plot.prototype._getPenMaybeByName = function(name) {
      return lookup(name.toUpperCase())(this._penMap);
    };

    Plot.prototype._resize = function() {
      return this._ops.resize(this.xMin, this.xMax, this.yMin, this.yMax);
    };

    Plot.prototype._verifyHistogramSize = function(pen) {
      var isWithinBounds, penYMax;
      isWithinBounds = (function(_this) {
        return function(arg) {
          var x;
          x = arg.x;
          return x >= _this.xMin && x <= _this.xMax;
        };
      })(this);
      penYMax = pipeline(filter(isWithinBounds), map(function(p) {
        return p.y;
      }), maxBy(id), fold(function() {
        return 0;
      })(id))(pen.getPoints());
      if (penYMax > this.yMax && this.isAutoplotting) {
        this.yMax = penYMax;
      }
      this._resize();
    };

    Plot.prototype._verifySize = function(pen) {
      var bounds, bumpMax, bumpMin, currentBounds, maxXs, maxYs, minXs, minYs, newXMax, newXMin, newYMax, newYMin, ref4, ref5;
      if (pen.bounds() != null) {
        bounds = pen.bounds();
        currentBounds = [this.xMin, this.xMax, this.yMin, this.yMax];
        ref4 = zip(bounds)(currentBounds), minXs = ref4[0], maxXs = ref4[1], minYs = ref4[2], maxYs = ref4[3];
        bumpMin = function(arg, currentMax) {
          var currentMin, expandedRange, newMin, newValue, range;
          newMin = arg[0], currentMin = arg[1];
          if (newMin < currentMin) {
            range = currentMax - newMin;
            expandedRange = range * 1.2;
            newValue = currentMax - expandedRange;
            return StrictMath.floor(newValue);
          } else {
            return currentMin;
          }
        };
        bumpMax = function(arg, currentMin) {
          var currentMax, expandedRange, newMax, newValue, range;
          newMax = arg[0], currentMax = arg[1];
          if (newMax > currentMax) {
            range = newMax - currentMin;
            expandedRange = range * 1.2;
            newValue = currentMin + expandedRange;
            return StrictMath.ceil(newValue);
          } else {
            return currentMax;
          }
        };
        ref5 = [bumpMin(minXs, this.xMax), bumpMax(maxXs, this.xMin), bumpMin(minYs, this.yMax), bumpMax(maxYs, this.yMin)], newXMin = ref5[0], newXMax = ref5[1], newYMin = ref5[2], newYMax = ref5[3];
        if (newXMin !== this.xMin || newXMax !== this.xMax || newYMin !== this.yMin || newYMax !== this.yMax) {
          if (this.isAutoplotting) {
            this.xMin = newXMin;
            this.xMax = newXMax;
            this.yMin = newYMin;
            this.yMax = newYMax;
          }
          this._resize();
        }
      }
    };

    Plot.prototype._withPen = function(f) {
      return fold(function() {
        throw new Error("Plot '" + this.name + "' has no pens!");
      })(f)(this._currentPenMaybe);
    };

    return Plot;

  })();

}).call(this);

},{"./pen":"engine/plot/pen","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/maybe":"brazier/maybe","brazierjs/object":"brazier/object","shim/strictmath":"shim/strictmath","util/exception":"util/exception"}],"engine/prim/evalprims":[function(require,module,exports){
(function() {
  var EvalPrims, evalCache, globalEval, readFromString, scalaJSEvalCode;

  globalEval = eval;

  readFromString = function(str) {
    var error, ex;
    try {
      return Converter.stringToJSValue(str);
    } catch (error) {
      ex = error;
      throw new Error(ex.message);
    }
  };

  evalCache = {};

  scalaJSEvalCode = function(code, widgets, runString, isRunResult, procVars) {
    var compileParams, fun, js, result, runFun, runKey, varNames, varString;
    varNames = Object.keys(procVars).sort();
    varString = varNames.join(' ');
    runKey = varString + " => " + runString;
    runFun = (evalCache[runKey] != null) ? evalCache[runKey] : (compileParams = {
      code: code,
      widgets: widgets,
      commands: [],
      reporters: [],
      turtleShapes: [],
      linkShapes: []
    }, js = Converter.compileRunString(compileParams, runString, isRunResult, varString), fun = globalEval(js), evalCache[runKey] = fun, fun);
    result = runFun(varNames.map((function(_this) {
      return function(vn) {
        return procVars[vn];
      };
    })(this)));
    if (isRunResult) {
      return result;
    } else {

    }
  };

  module.exports = EvalPrims = (function() {
    function EvalPrims(code, widgets, readFromString1) {
      this.readFromString = readFromString1 != null ? readFromString1 : readFromString;
      this.runCode = function(runString, isRunResult, procVars) {
        return scalaJSEvalCode(code, widgets, runString, isRunResult, procVars);
      };
    }

    return EvalPrims;

  })();

}).call(this);

},{}],"engine/prim/gamma":[function(require,module,exports){
(function() {
  var StrictMath, calcQ, calcQ0, calcT, calcVars, calcW, gdsFromAcceptanceRejection, gdsFromDoubleExponential;

  StrictMath = require('shim/strictmath');

  calcQ = function(t, s, ss, q0) {
    var a1, a2, a3, a4, a5, a6, a7, a8, a9, v;
    a1 = 0.333333333;
    a2 = -0.249999949;
    a3 = 0.199999867;
    a4 = -0.166677482;
    a5 = 0.142873973;
    a6 = -0.124385581;
    a7 = 0.110368310;
    a8 = -0.112750886;
    a9 = 0.104089866;
    v = t / (s + s);
    if (StrictMath.abs(v) > 0.25) {
      return q0 - s * t + 0.25 * t * t + (ss + ss) * StrictMath.log(1 + v);
    } else {
      return q0 + 0.5 * t * t * ((((((((a9 * v + a8) * v + a7) * v + a6) * v + a5) * v + a4) * v + a3) * v + a2) * v + a1) * v;
    }
  };

  calcQ0 = function(alpha) {
    var q1, q2, q3, q4, q5, q6, q7, q8, q9, r;
    q1 = 0.0416666664;
    q2 = 0.0208333723;
    q3 = 0.0079849875;
    q4 = 0.0015746717;
    q5 = -0.0003349403;
    q6 = 0.0003340332;
    q7 = 0.0006053049;
    q8 = -0.0004701849;
    q9 = 0.0001710320;
    r = 1 / alpha;
    return ((((((((q9 * r + q8) * r + q7) * r + q6) * r + q5) * r + q4) * r + q3) * r + q2) * r + q1) * r;
  };

  calcT = function(randomGenerator) {
    var generateVs, ref, v1, v12;
    generateVs = function() {
      var v1, v12, v2;
      v1 = 2 * randomGenerator.nextDouble() - 1;
      v2 = 2 * randomGenerator.nextDouble() - 1;
      v12 = v1 * v1 + v2 * v2;
      if (v12 <= 1) {
        return [v1, v12];
      } else {
        return generateVs();
      }
    };
    ref = generateVs(), v1 = ref[0], v12 = ref[1];
    return v1 * StrictMath.sqrt(-2 * StrictMath.log(v12) / v12);
  };

  calcVars = function(b, si, randomGenerator) {
    var e, signU, t, u, uTemp;
    e = -StrictMath.log(randomGenerator.nextDouble());
    uTemp = randomGenerator.nextDouble();
    u = uTemp + uTemp - 1;
    signU = u > 0 ? 1 : -1;
    t = b + (e * si) * signU;
    if (t > -0.71874483771719) {
      return [e, signU, u, t];
    } else {
      return calcVars(b, si, randomGenerator);
    }
  };

  calcW = function(q) {
    var e1, e2, e3, e4, e5, e6, e7;
    e1 = 1.000000000;
    e2 = 0.499999994;
    e3 = 0.166666848;
    e4 = 0.041664508;
    e5 = 0.008345522;
    e6 = 0.001353826;
    e7 = 0.000247453;
    if (q > 0.5) {
      return StrictMath.exp(q) - 1.0;
    } else {
      return ((((((e7 * q + e6) * q + e5) * q + e4) * q + e3) * q + e2) * q + e1) * q;
    }
  };

  gdsFromAcceptanceRejection = function(alpha, randomGenerator) {
    var b, generateNumbersUntilHappy;
    b = 1 + 0.36788794412 * alpha;
    generateNumbersUntilHappy = function() {
      var gdsHighP, gdsLowP, logRand, p;
      p = b * randomGenerator.nextDouble();
      logRand = StrictMath.log(randomGenerator.nextDouble());
      gdsLowP = StrictMath.exp(StrictMath.log(p) / alpha);
      gdsHighP = -StrictMath.log((b - p) / alpha);
      if (p <= 1 && logRand <= -gdsLowP) {
        return gdsLowP;
      } else if (p > 1 && logRand <= ((alpha - 1) * StrictMath.log(gdsHighP))) {
        return gdsHighP;
      } else {
        return generateNumbersUntilHappy();
      }
    };
    return generateNumbersUntilHappy();
  };

  gdsFromDoubleExponential = function(b, si, c, s, ss, q0, randomGenerator) {
    var tryAgain;
    tryAgain = function() {
      var e, q, ref, signU, t, u, x;
      ref = calcVars(b, si, randomGenerator), e = ref[0], signU = ref[1], u = ref[2], t = ref[3];
      q = calcQ(t, s, ss, q0);
      if ((q > 0) && (c * u * signU <= calcW(q) * StrictMath.exp(e - 0.5 * t * t))) {
        x = s + 0.5 * t;
        return x * x;
      } else {
        return tryAgain();
      }
    };
    return tryAgain();
  };


  /*
  
  Gamma Distribution - Acceptance Rejection combined with Acceptance Complement
  
  See: J.H. Ahrens, U. Dieter (1974): Computer methods for sampling from gamma, beta, Poisson and binomial distributions, Computing 12, 223-246.
  See: J.H. Ahrens, U. Dieter (1982): Generating gamma variates by a modified rejection technique, Communications of the ACM 25, 47-54.
   */

  module.exports = function(randomGenerator, alpha, lambda) {
    var b, c, d, gds, q0, ref, s, si, ss, t, u, x;
    gds = alpha < 1 ? gdsFromAcceptanceRejection(alpha, randomGenerator) : (ss = alpha - 0.5, s = StrictMath.sqrt(ss), d = 5.656854249 - 12 * s, t = calcT(randomGenerator), x = s + 0.5 * t, t >= 0 ? x * x : (u = randomGenerator.nextDouble(), d * u <= t * t * t ? x * x : (q0 = calcQ0(alpha), (x > 0) && (StrictMath.log(1 - u) <= calcQ(t, s, ss, q0)) ? x * x : ((ref = alpha > 13.022 ? [1.77, 0.75, 0.1515 / s] : alpha > 3.686 ? [1.654 + 0.0076 * ss, 1.68 / s + 0.275, 0.062 / s + 0.024] : [0.463 + s - 0.178 * ss, 1.235, 0.195 / s - 0.079 + 0.016 * s], b = ref[0], si = ref[1], c = ref[2], ref), gdsFromDoubleExponential(b, si, c, s, ss, q0, randomGenerator)))));
    return gds / lambda;
  };

}).call(this);

},{"shim/strictmath":"shim/strictmath"}],"engine/prim/importexportprims":[function(require,module,exports){
(function() {
  var ImportExportConfig, ImportExportPrims;

  module.exports.Config = ImportExportConfig = (function() {
    function ImportExportConfig(exportAllPlots1, exportFile1, exportOutput, exportPlot1, exportView, exportWorld1, importDrawing1, importWorld1) {
      this.exportAllPlots = exportAllPlots1 != null ? exportAllPlots1 : (function() {
        return function() {};
      });
      this.exportFile = exportFile1 != null ? exportFile1 : (function() {
        return function() {};
      });
      this.exportOutput = exportOutput != null ? exportOutput : (function() {});
      this.exportPlot = exportPlot1 != null ? exportPlot1 : (function() {
        return function() {};
      });
      this.exportView = exportView != null ? exportView : (function() {});
      this.exportWorld = exportWorld1 != null ? exportWorld1 : (function() {
        return function() {};
      });
      this.importDrawing = importDrawing1 != null ? importDrawing1 : (function() {
        return function() {};
      });
      this.importWorld = importWorld1 != null ? importWorld1 : (function() {
        return function() {};
      });
    }

    return ImportExportConfig;

  })();

  module.exports.Prims = ImportExportPrims = (function() {
    function ImportExportPrims(arg, exportWorldRaw, exportAllPlotsRaw, exportPlotRaw, importDrawingRaw, importWorldRaw) {
      var exportAllPlots, exportFile, exportPlot, exportWorld, importDrawing, importWorld;
      exportAllPlots = arg.exportAllPlots, exportFile = arg.exportFile, this.exportOutput = arg.exportOutput, exportPlot = arg.exportPlot, this.exportView = arg.exportView, exportWorld = arg.exportWorld, importDrawing = arg.importDrawing, importWorld = arg.importWorld;
      this.importDrawingRaw = importDrawingRaw;
      this.importWorldRaw = importWorldRaw;
      this.exportWorld = function(filename) {
        return exportFile(exportWorldRaw())(filename);
      };
      this.exportAllPlots = function(filename) {
        return exportFile(exportAllPlotsRaw())(filename);
      };
      this.exportPlot = function(plot, filename) {
        return exportFile(exportPlotRaw(plot))(filename);
      };
      this.importDrawing = function(filename) {
        return importDrawing(this.importDrawingRaw)(filename);
      };
      this.importWorld = function(filename) {
        return importWorld(this.importWorldRaw)(filename);
      };
    }

    return ImportExportPrims;

  })();

}).call(this);

},{}],"engine/prim/inspectionprims":[function(require,module,exports){
(function() {
  var InspectionConfig, InspectionPrims;

  module.exports.Config = InspectionConfig = (function() {
    function InspectionConfig(inspect1, stopInspecting, clearDead) {
      this.inspect = inspect1 != null ? inspect1 : (function() {});
      this.stopInspecting = stopInspecting != null ? stopInspecting : (function() {});
      this.clearDead = clearDead != null ? clearDead : (function() {});
    }

    return InspectionConfig;

  })();

  module.exports.Prims = InspectionPrims = (function() {
    function InspectionPrims(arg) {
      var inspect;
      inspect = arg.inspect, this.stopInspecting = arg.stopInspecting, this.clearDead = arg.clearDead;
      this.inspect = function(agent) {
        if (!agent.isDead()) {
          return inspect(agent);
        } else {
          throw new Error("That " + (agent.getBreedNameSingular()) + " is dead.");
        }
      };
    }

    return InspectionPrims;

  })();

}).call(this);

},{}],"engine/prim/layoutmanager":[function(require,module,exports){
(function() {
  var LayoutManager, NLMath, NLType, TreeNode, contains, filter, flatMap, fold, foldl, forEach, id, map, maxBy, pipeline, rangeUntil, ref, ref1, unique, values, zip;

  NLMath = require('util/nlmath');

  NLType = require('../core/typechecker');

  ref = require('brazierjs/array'), contains = ref.contains, filter = ref.filter, flatMap = ref.flatMap, foldl = ref.foldl, forEach = ref.forEach, map = ref.map, maxBy = ref.maxBy, unique = ref.unique, zip = ref.zip;

  ref1 = require('brazierjs/function'), id = ref1.id, pipeline = ref1.pipeline;

  fold = require('brazierjs/maybe').fold;

  rangeUntil = require('brazierjs/number').rangeUntil;

  values = require('brazierjs/object').values;

  TreeNode = (function() {
    TreeNode.prototype._angle = void 0;

    TreeNode.prototype._children = void 0;

    TreeNode.prototype._depth = void 0;

    TreeNode.prototype._val = void 0;

    function TreeNode(_turtle, _depth) {
      this._turtle = _turtle;
      this._depth = _depth;
      this._angle = 0.0;
      this._children = [];
    }

    TreeNode.prototype.addChild = function(child) {
      this._children.push(child);
    };

    TreeNode.prototype.getAngle = function() {
      return this._angle;
    };

    TreeNode.prototype.getDepth = function() {
      return this._depth;
    };

    TreeNode.prototype.getTurtle = function() {
      return this._turtle;
    };

    TreeNode.prototype.getWeight = function() {
      var maxChildWeight;
      maxChildWeight = pipeline(map(function(c) {
        return c.getWeight();
      }), maxBy(id), fold(function() {
        return 0;
      })(id))(this._children);
      return NLMath.max(maxChildWeight * 0.8, this._children.length + 1);
    };

    TreeNode.prototype.layoutRadial = function(arcStart, arcEnd) {
      var f, weightSum;
      this._angle = (arcStart + arcEnd) / 2;
      weightSum = foldl(function(acc, x) {
        return acc + x.getWeight();
      })(0)(this._children);
      f = function(childStart, child) {
        var childEnd;
        childEnd = childStart + (arcEnd - arcStart) * child.getWeight() / weightSum;
        child.layoutRadial(childStart, childEnd);
        return childEnd;
      };
      return foldl(f)(arcStart)(this._children);
    };

    return TreeNode;

  })();

  module.exports = LayoutManager = (function() {
    function LayoutManager(_world, _nextDouble) {
      this._world = _world;
      this._nextDouble = _nextDouble;
    }

    LayoutManager.prototype.layoutCircle = function(agentsOrList, radius) {
      var midx, midy, n, turtles;
      turtles = NLType(agentsOrList).isList() ? agentsOrList : agentsOrList.shufflerator().toArray();
      n = turtles.length;
      midx = this._world.topology.minPxcor + NLMath.floor(this._world.topology.width / 2);
      midy = this._world.topology.minPycor + NLMath.floor(this._world.topology.height / 2);
      return rangeUntil(0)(n).forEach(function(i) {
        var heading, turtle;
        heading = (i * 360) / n;
        turtle = turtles[i];
        turtle.patchAtHeadingAndDistance(heading, radius);
        turtle.setXY(midx, midy);
        turtle.setVariable("heading", heading);
        return turtle.jumpIfAble(radius);
      });
    };

    LayoutManager.prototype.layoutSpring = function(nodeSet, linkSet, spr, len, rep) {
      var agt, ax, ay, degCounts, nodeCount, ref2, tMap;
      if (!nodeSet.isEmpty()) {
        ref2 = this._initialize(nodeSet), ax = ref2[0], ay = ref2[1], tMap = ref2[2], agt = ref2[3];
        nodeCount = nodeSet.size();
        degCounts = this._calcDegreeCounts(linkSet, tMap, nodeCount);
        this._updateXYArraysForNeighbors(ax, ay, linkSet, tMap, degCounts, spr, len);
        this._updateXYArraysForAll(ax, ay, agt, degCounts, nodeCount, rep);
        this._moveTurtles(ax, ay, agt, nodeCount);
      }
    };

    LayoutManager.prototype.layoutTutte = function(nodeSet, linkSet, radius) {
      var anchors, turtleXYTriplets;
      anchors = pipeline(flatMap(function(arg) {
        var end1, end2;
        end1 = arg.end1, end2 = arg.end2;
        return [end1, end2];
      }), unique, filter(function(t) {
        return !nodeSet.contains(t);
      }))(linkSet.toArray());
      this.layoutCircle(anchors, radius);
      turtleXYTriplets = nodeSet.shuffled().toArray().map((function(_this) {
        return function(turtle) {
          var allOfMyLinks, compute, computeCor, degree, neighbors, relevantLinks, x, y;
          computeCor = function(turtle, neighbors, degree) {
            return function(getCor, max, min) {
              var adjustedValue, limit, limitedValue, readjustedValue, value;
              value = pipeline(map(getCor), foldl(function(a, b) {
                return a + b;
              })(0))(neighbors);
              adjustedValue = (value / degree) - getCor(turtle);
              limit = 100;
              limitedValue = adjustedValue > limit ? limit : adjustedValue < -limit ? -limit : adjustedValue;
              readjustedValue = limitedValue + getCor(turtle);
              if (readjustedValue > max) {
                return max;
              } else if (readjustedValue < min) {
                return min;
              } else {
                return readjustedValue;
              }
            };
          };
          allOfMyLinks = turtle.linkManager.myLinks("LINKS").toArray();
          relevantLinks = pipeline(unique, filter(function(link) {
            return linkSet.contains(link);
          }))(allOfMyLinks);
          neighbors = relevantLinks.map(function(arg) {
            var end1, end2;
            end1 = arg.end1, end2 = arg.end2;
            if (end1 === turtle) {
              return end2;
            } else {
              return end1;
            }
          });
          degree = relevantLinks.length;
          compute = computeCor(turtle, neighbors, degree);
          x = compute((function(t) {
            return t.xcor;
          }), _this._world.topology.maxPxcor, _this._world.topology.minPxcor);
          y = compute((function(t) {
            return t.ycor;
          }), _this._world.topology.maxPycor, _this._world.topology.minPycor);
          return [turtle, x, y];
        };
      })(this));
      turtleXYTriplets.forEach(function(arg) {
        var turtle, x, y;
        turtle = arg[0], x = arg[1], y = arg[2];
        return turtle.setXY(x, y);
      });
    };

    LayoutManager.prototype.layoutRadial = function(nodeSet, linkSet, root) {
      var adjustPosition, allowedTurtleIDs, lastNode, layerGap, maxDepth, maxPxcor, maxPycor, minPxcor, minPycor, nodeTable, queue, ref2, rootNode, rootX, rootY, turtleIsAllowed, visitNeighbors, xDistToEdge, yDistToEdge;
      ref2 = this._world.topology, maxPxcor = ref2.maxPxcor, maxPycor = ref2.maxPycor, minPxcor = ref2.minPxcor, minPycor = ref2.minPycor;
      rootX = (maxPxcor + minPxcor) / 2;
      rootY = (maxPycor + minPycor) / 2;
      rootNode = new TreeNode(root, 0);
      queue = [rootNode];
      nodeTable = {};
      nodeTable[rootNode.getTurtle().id] = rootNode;
      turtleIsAllowed = linkSet.getSpecialName() == null ? (allowedTurtleIDs = pipeline(flatMap(function(arg) {
        var end1, end2;
        end1 = arg.end1, end2 = arg.end2;
        return [end1, end2];
      }), foldl(function(acc, arg) {
        var id;
        id = arg.id;
        acc[id] = true;
        return acc;
      })({}))(linkSet.toArray()), function(arg) {
        var id;
        id = arg.id;
        return allowedTurtleIDs[id] === true;
      }) : function() {
        return true;
      };
      visitNeighbors = function(queue, last) {
        var node;
        if (queue.length === 0) {
          return last;
        } else {
          node = queue.shift();
          node.getTurtle().linkManager.neighborsIn(linkSet).forEach(function(t) {
            var child;
            if (nodeSet.contains(t) && (nodeTable[t.id] == null) && turtleIsAllowed(t)) {
              child = new TreeNode(t, node.getDepth() + 1);
              node.addChild(child);
              nodeTable[t.id] = child;
              queue.push(child);
            }
          });
          return visitNeighbors(queue, node);
        }
      };
      lastNode = visitNeighbors(queue, rootNode);
      rootNode.layoutRadial(0, 360);
      maxDepth = NLMath.max(1, lastNode.getDepth() + .2);
      xDistToEdge = NLMath.min(maxPxcor - rootX, rootX - minPxcor);
      yDistToEdge = NLMath.min(maxPycor - rootY, rootY - minPycor);
      layerGap = NLMath.min(xDistToEdge, yDistToEdge) / maxDepth;
      adjustPosition = function(node) {
        var turtle;
        turtle = node.getTurtle();
        turtle.setXY(rootX, rootY);
        turtle.setVariable("heading", node.getAngle());
        turtle.jumpIfAble(node.getDepth() * layerGap);
      };
      pipeline(values, forEach(adjustPosition))(nodeTable);
    };

    LayoutManager.prototype._initialize = function(nodeSet) {
      var agt, ax, ay, tMap, turtles;
      ax = [];
      ay = [];
      tMap = [];
      agt = [];
      turtles = nodeSet.shuffled().toArray();
      forEach(function(i) {
        var turtle;
        turtle = turtles[i];
        agt[i] = turtle;
        tMap[turtle.id] = i;
        ax[i] = 0.0;
        ay[i] = 0.0;
      })(rangeUntil(0)(turtles.length));
      return [ax, ay, tMap, agt];
    };

    LayoutManager.prototype._calcDegreeCounts = function(links, idToIndexMap, nodeCount) {
      var baseCounts;
      baseCounts = map(function() {
        return 0;
      })(rangeUntil(0)(nodeCount));
      links.forEach(function(arg) {
        var f, t1, t2;
        t1 = arg.end1, t2 = arg.end2;
        f = function(turtle) {
          var index;
          index = idToIndexMap[turtle.id];
          if (index != null) {
            return baseCounts[index]++;
          }
        };
        f(t1);
        f(t2);
      });
      return baseCounts;
    };

    LayoutManager.prototype._updateXYArraysForNeighbors = function(ax, ay, links, idToIndexMap, degCounts, spr, len) {
      var indexAndCountOf;
      indexAndCountOf = function(turtle) {
        var index;
        index = idToIndexMap[turtle.id];
        if (index != null) {
          return [index, degCounts[index]];
        } else {
          return [-1, 0];
        }
      };
      links.forEach(function(arg) {
        var degCount1, degCount2, dist, div, dx, dy, f, newDX, newDY, ref2, ref3, ref4, t1, t1Index, t2, t2Index;
        t1 = arg.end1, t2 = arg.end2;
        ref2 = indexAndCountOf(t1), t1Index = ref2[0], degCount1 = ref2[1];
        ref3 = indexAndCountOf(t2), t2Index = ref3[0], degCount2 = ref3[1];
        dist = t1.distance(t2);
        div = NLMath.max((degCount1 + degCount2) / 2.0, 1.0);
        ref4 = dist === 0 ? [(spr * len) / div, 0] : (f = spr * (dist - len) / div, newDX = f * (t2.xcor - t1.xcor) / dist, newDY = f * (t2.ycor - t1.ycor) / dist, [newDX, newDY]), dx = ref4[0], dy = ref4[1];
        if (t1Index !== -1) {
          ax[t1Index] += dx;
          ay[t1Index] += dy;
        }
        if (t2Index !== -1) {
          ax[t2Index] -= dx;
          ay[t2Index] -= dy;
        }
      });
    };

    LayoutManager.prototype._updateXYArraysForAll = function(ax, ay, agents, degCounts, nodeCount, rep) {
      var ang, dist, div, dx, dy, f, i, j, k, l, newDX, newDY, ref2, ref3, ref4, ref5, t1, t2;
      for (i = k = 0, ref2 = nodeCount; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
        t1 = agents[i];
        for (j = l = ref3 = i + 1, ref4 = nodeCount; ref3 <= ref4 ? l < ref4 : l > ref4; j = ref3 <= ref4 ? ++l : --l) {
          t2 = agents[j];
          div = NLMath.max((degCounts[i] + degCounts[j]) / 2.0, 1.0);
          ref5 = t2.xcor === t1.xcor && t2.ycor === t1.ycor ? (ang = 360 * this._nextDouble(), newDX = -(rep / div * NLMath.squash(NLMath.sin(ang))), newDY = -(rep / div * NLMath.squash(NLMath.cos(ang))), [newDX, newDY]) : (dist = t1.distance(t2), f = rep / (dist * dist) / div, newDX = -(f * (t2.xcor - t1.xcor) / dist), newDY = -(f * (t2.ycor - t1.ycor) / dist), [newDX, newDY]), dx = ref5[0], dy = ref5[1];
          ax[i] += dx;
          ay[i] += dy;
          ax[j] -= dx;
          ay[j] -= dy;
        }
      }
    };

    LayoutManager.prototype._moveTurtles = function(ax, ay, agt, nodeCount) {
      var bounded, calculateLimit, calculateXCor, calculateYCor, height, limit, maxX, maxY, minX, minY, perturbment, width;
      maxX = this._world.topology.maxPxcor;
      minX = this._world.topology.minPxcor;
      maxY = this._world.topology.maxPycor;
      minY = this._world.topology.minPycor;
      height = this._world.topology.height;
      width = this._world.topology.width;
      if (nodeCount > 1) {
        perturbment = (width + height) / 1.0e10;
        ax[0] += this._nextDouble() * perturbment - perturbment / 2.0;
        ay[0] += this._nextDouble() * perturbment - perturbment / 2.0;
      }
      limit = (width + height) / 50.0;
      bounded = function(min, max) {
        return function(x) {
          if (x < min) {
            return min;
          } else if (x > max) {
            return max;
          } else {
            return x;
          }
        };
      };
      calculateLimit = bounded(-limit, limit);
      calculateXCor = bounded(minX, maxX);
      calculateYCor = bounded(minY, maxY);
      forEach(function(i) {
        var newX, newY, turtle;
        turtle = agt[i];
        newX = calculateXCor(turtle.xcor + calculateLimit(ax[i]));
        newY = calculateYCor(turtle.ycor + calculateLimit(ay[i]));
        turtle.setXY(newX, newY);
      })(rangeUntil(0)(nodeCount));
    };

    return LayoutManager;

  })();

}).call(this);

},{"../core/typechecker":"engine/core/typechecker","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/maybe":"brazier/maybe","brazierjs/number":"brazier/number","brazierjs/object":"brazier/object","util/nlmath":"util/nlmath"}],"engine/prim/linkprims":[function(require,module,exports){
(function() {
  var LinkPrims;

  module.exports = LinkPrims = (function() {
    LinkPrims._linkManager = void 0;

    LinkPrims._self = void 0;

    function LinkPrims(arg) {
      var linkManager, selfManager;
      linkManager = arg.linkManager, selfManager = arg.selfManager;
      this._linkManager = linkManager;
      this._self = selfManager.self;
    }

    LinkPrims.prototype.createLinkFrom = function(otherTurtle, breedName) {
      return this._linkManager.createDirectedLink(otherTurtle, this._self(), breedName);
    };

    LinkPrims.prototype.createLinksFrom = function(otherTurtles, breedName) {
      return this._linkManager.createReverseDirectedLinks(this._self(), otherTurtles.shuffled(), breedName);
    };

    LinkPrims.prototype.createLinkTo = function(otherTurtle, breedName) {
      return this._linkManager.createDirectedLink(this._self(), otherTurtle, breedName);
    };

    LinkPrims.prototype.createLinksTo = function(otherTurtles, breedName) {
      return this._linkManager.createDirectedLinks(this._self(), otherTurtles.shuffled(), breedName);
    };

    LinkPrims.prototype.createLinkWith = function(otherTurtle, breedName) {
      return this._linkManager.createUndirectedLink(this._self(), otherTurtle, breedName);
    };

    LinkPrims.prototype.createLinksWith = function(otherTurtles, breedName) {
      return this._linkManager.createUndirectedLinks(this._self(), otherTurtles.shuffled(), breedName);
    };

    LinkPrims.prototype.isInLinkNeighbor = function(breedName, otherTurtle) {
      return this._self().linkManager.isInLinkNeighbor(breedName, otherTurtle);
    };

    LinkPrims.prototype.isLinkNeighbor = function(breedName, otherTurtle) {
      return this._self().linkManager.isLinkNeighbor(breedName, otherTurtle);
    };

    LinkPrims.prototype.isOutLinkNeighbor = function(breedName, otherTurtle) {
      return this._self().linkManager.isOutLinkNeighbor(breedName, otherTurtle);
    };

    LinkPrims.prototype.inLinkFrom = function(breedName, otherTurtle) {
      return this._self().linkManager.inLinkFrom(breedName, otherTurtle);
    };

    LinkPrims.prototype.linkWith = function(breedName, otherTurtle) {
      return this._self().linkManager.linkWith(breedName, otherTurtle);
    };

    LinkPrims.prototype.outLinkTo = function(breedName, otherTurtle) {
      return this._self().linkManager.outLinkTo(breedName, otherTurtle);
    };

    LinkPrims.prototype.inLinkNeighbors = function(breedName) {
      return this._self().linkManager.inLinkNeighbors(breedName);
    };

    LinkPrims.prototype.linkNeighbors = function(breedName) {
      return this._self().linkManager.linkNeighbors(breedName);
    };

    LinkPrims.prototype.outLinkNeighbors = function(breedName) {
      return this._self().linkManager.outLinkNeighbors(breedName);
    };

    LinkPrims.prototype.myInLinks = function(breedName) {
      return this._self().linkManager.myInLinks(breedName);
    };

    LinkPrims.prototype.myLinks = function(breedName) {
      return this._self().linkManager.myLinks(breedName);
    };

    LinkPrims.prototype.myOutLinks = function(breedName) {
      return this._self().linkManager.myOutLinks(breedName);
    };

    return LinkPrims;

  })();

}).call(this);

},{}],"engine/prim/listprims":[function(require,module,exports){
(function() {
  var AbstractAgentSet, Comparator, Exception, Link, ListPrims, NLMath, NLType, Patch, StrictMath, Turtle, all, arrayLength, exists, filter, find, findIndex, fold, foldl, id, isEmpty, last, pipeline, ref, ref1, sortBy, stableSort, tail,
    slice = [].slice;

  AbstractAgentSet = require('../core/abstractagentset');

  Link = require('../core/link');

  Patch = require('../core/patch');

  Turtle = require('../core/turtle');

  NLType = require('../core/typechecker');

  StrictMath = require('shim/strictmath');

  Comparator = require('util/comparator');

  Exception = require('util/exception');

  NLMath = require('util/nlmath');

  stableSort = require('util/stablesort');

  ref = require('brazierjs/array'), all = ref.all, exists = ref.exists, filter = ref.filter, find = ref.find, findIndex = ref.findIndex, foldl = ref.foldl, isEmpty = ref.isEmpty, arrayLength = ref.length, last = ref.last, sortBy = ref.sortBy, tail = ref.tail;

  ref1 = require('brazierjs/function'), id = ref1.id, pipeline = ref1.pipeline;

  fold = require('brazierjs/maybe').fold;

  module.exports = ListPrims = (function() {
    function ListPrims(_dump, _hasher, _equality, _nextInt) {
      this._dump = _dump;
      this._hasher = _hasher;
      this._equality = _equality;
      this._nextInt = _nextInt;
    }

    ListPrims.prototype.butFirst = function(xs) {
      return tail(xs);
    };

    ListPrims.prototype.butLast = function(xs) {
      return xs.slice(0, xs.length - 1);
    };

    ListPrims.prototype.empty = function(xs) {
      return isEmpty(xs);
    };

    ListPrims.prototype.first = function(xs) {
      return xs[0];
    };

    ListPrims.prototype.fput = function(x, xs) {
      return [x].concat(xs);
    };

    ListPrims.prototype.insertItem = function(n, xs, x) {
      var chars, clone, typeName;
      if (n < 0) {
        throw new Error(n + " isn't greater than or equal to zero.");
      } else if (n > xs.length) {
        typeName = NLType(xs).isList() ? "list" : NLType(xs).isString() ? "string" : "unknown";
        throw new Error("Can't find element " + n + " of the " + typeName + " " + (this._dump(xs)) + ", which is only of length " + xs.length + ".");
      } else {
        if (NLType(xs).isString()) {
          if (NLType(x).isString()) {
            chars = xs.split('');
            chars.splice(n, 0, x);
            return chars.join('');
          } else {
            throw new Error("INSERT-ITEM expected input to be a string but got the " + (typeof x) + " " + (this._dump(x)) + " instead.");
          }
        } else if (NLType(xs).isList()) {
          clone = xs.slice(0);
          clone.splice(n, 0, x);
          return clone;
        } else {
          throw new Error("Unrecognized type of collection for `insert-item`: " + (this._dump(xs)));
        }
      }
    };

    ListPrims.prototype.item = function(n, xs) {
      return xs[NLMath.floor(n)];
    };

    ListPrims.prototype.last = function(xs) {
      return last(xs);
    };

    ListPrims.prototype.length = function(xs) {
      return arrayLength(xs);
    };

    ListPrims.prototype.list = function() {
      var xs;
      xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return xs;
    };

    ListPrims.prototype.lput = function(x, xs) {
      var result;
      result = xs.slice(0);
      result.push(x);
      return result;
    };

    ListPrims.prototype.max = function(xs) {
      return Math.max.apply(Math, xs);
    };

    ListPrims.prototype.mean = function(xs) {
      return this.sum(xs) / xs.length;
    };

    ListPrims.prototype.median = function(xs) {
      var length, middleIndex, middleNum, nums, subMiddleNum;
      nums = pipeline(filter(function(x) {
        return NLType(x).isNumber();
      }), sortBy(id))(xs);
      length = nums.length;
      if (length !== 0) {
        middleIndex = StrictMath.floor(length / 2);
        middleNum = nums[middleIndex];
        if (length % 2 === 1) {
          return middleNum;
        } else {
          subMiddleNum = nums[middleIndex - 1];
          return NLMath.validateNumber((middleNum + subMiddleNum) / 2);
        }
      } else {
        throw new Error("Can't find the median of a list with no numbers: " + (this._dump(xs)) + ".");
      }
    };

    ListPrims.prototype.member = function(x, xs) {
      var type;
      type = NLType(xs);
      if (type.isList()) {
        return exists((function(_this) {
          return function(y) {
            return _this._equality(x, y);
          };
        })(this))(xs);
      } else if (type.isString()) {
        return xs.indexOf(x) !== -1;
      } else {
        return xs.exists(function(a) {
          return x === a;
        });
      }
    };

    ListPrims.prototype.min = function(xs) {
      return Math.min.apply(Math, xs);
    };

    ListPrims.prototype.modes = function(items) {
      var calculateModes, genItemCountPairs, ref2, result;
      genItemCountPairs = (function(_this) {
        return function(xs) {
          var incrementCount, k, len, pairMaybe, pairs, pushNewPair, x;
          pairs = [];
          for (k = 0, len = xs.length; k < len; k++) {
            x = xs[k];
            pushNewPair = function() {
              return pairs.push([x, 1]);
            };
            incrementCount = function(pair) {
              return pair[1] += 1;
            };
            pairMaybe = find(function(arg) {
              var c, item;
              item = arg[0], c = arg[1];
              return _this._equality(item, x);
            })(pairs);
            fold(pushNewPair)(incrementCount)(pairMaybe);
          }
          return pairs;
        };
      })(this);
      calculateModes = function(xsToCounts) {
        var f;
        f = function(arg, arg1) {
          var bestCount, bests, count, item;
          bests = arg[0], bestCount = arg[1];
          item = arg1[0], count = arg1[1];
          if (count > bestCount) {
            return [[item], count];
          } else if (count < bestCount) {
            return [bests, bestCount];
          } else {
            return [bests.concat([item]), bestCount];
          }
        };
        return foldl(f)([[], 0])(xsToCounts);
      };
      ref2 = calculateModes(genItemCountPairs(items)), result = ref2[0], ref2[1];
      return result;
    };

    ListPrims.prototype.nOf = function(n, agentsOrList) {
      var items, newItems, type;
      type = NLType(agentsOrList);
      if (type.isList()) {
        return this._nOfArray(n, agentsOrList);
      } else if (type.isAgentSet()) {
        items = agentsOrList.iterator().toArray();
        newItems = this._nOfArray(n, items);
        return agentsOrList.copyWithNewAgents(newItems);
      } else {
        throw new Error("N-OF expected input to be a list or agentset but got " + (this._dump(agentsOrList)) + " instead.");
      }
    };

    ListPrims.prototype.oneOf = function(agentsOrList) {
      var type;
      type = NLType(agentsOrList);
      if (type.isAgentSet()) {
        return agentsOrList.randomAgent();
      } else {
        if (agentsOrList.length === 0) {
          return Nobody;
        } else {
          return agentsOrList[this._nextInt(agentsOrList.length)];
        }
      }
    };

    ListPrims.prototype.position = function(x, xs) {
      var index, type;
      type = NLType(xs);
      index = type.isList() ? pipeline(findIndex((function(_this) {
        return function(y) {
          return _this._equality(x, y);
        };
      })(this)), fold(function() {
        return -1;
      })(id))(xs) : xs.indexOf(x);
      if (index !== -1) {
        return index;
      } else {
        return false;
      }
    };

    ListPrims.prototype.remove = function(x, xs) {
      var type;
      type = NLType(xs);
      if (type.isList()) {
        return filter((function(_this) {
          return function(y) {
            return !_this._equality(x, y);
          };
        })(this))(xs);
      } else {
        return xs.replace(new RegExp(x, "g"), "");
      }
    };

    ListPrims.prototype.removeDuplicates = function(xs) {
      var f, out, ref2;
      if (xs.length < 2) {
        return xs;
      } else {
        f = (function(_this) {
          return function(arg, x) {
            var accArr, accSet, hash, values;
            accArr = arg[0], accSet = arg[1];
            hash = _this._hasher(x);
            values = accSet[hash];
            if (values != null) {
              if (!exists(function(y) {
                return _this._equality(x, y);
              })(values)) {
                accArr.push(x);
                values.push(x);
              }
            } else {
              accArr.push(x);
              accSet[hash] = [x];
            }
            return [accArr, accSet];
          };
        })(this);
        ref2 = xs.reduce(f, [[], {}]), out = ref2[0], ref2[1];
        return out;
      }
    };

    ListPrims.prototype.removeItem = function(n, xs) {
      var post, pre, temp, type;
      type = NLType(xs);
      if (type.isList()) {
        temp = xs.slice(0);
        temp.splice(n, 1);
        return temp;
      } else {
        pre = xs.slice(0, n);
        post = xs.slice(n + 1);
        return pre + post;
      }
    };

    ListPrims.prototype.replaceItem = function(n, xs, x) {
      var post, pre, temp, type;
      type = NLType(xs);
      if (type.isList()) {
        temp = xs.slice(0);
        temp.splice(n, 1, x);
        return temp;
      } else {
        pre = xs.slice(0, n);
        post = xs.slice(n + 1);
        return pre + x + post;
      }
    };

    ListPrims.prototype.reverse = function(xs) {
      var type;
      type = NLType(xs);
      if (type.isList()) {
        return xs.slice(0).reverse();
      } else if (type.isString()) {
        return xs.split("").reverse().join("");
      } else {
        throw new Error("can only reverse lists and strings");
      }
    };

    ListPrims.prototype.sentence = function() {
      var f, xs;
      xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      f = function(acc, x) {
        if (NLType(x).isList()) {
          return acc.concat(x);
        } else {
          acc.push(x);
          return acc;
        }
      };
      return foldl(f)([])(xs);
    };

    ListPrims.prototype.shuffle = function(xs) {
      var i, out, swap;
      swap = function(arr, i, j) {
        var tmp;
        tmp = arr[i];
        arr[i] = arr[j];
        return arr[j] = tmp;
      };
      out = xs.slice(0);
      i = out.length;
      while (i > 1) {
        swap(out, i - 1, this._nextInt(i));
        i--;
      }
      return out;
    };

    ListPrims.prototype.sort = function(xs) {
      var Agent, None, Number, String, f, filteredItems, filteredType, ref2, type;
      type = NLType(xs);
      if (type.isList()) {
        Number = {};
        String = {};
        Agent = {};
        None = {};
        f = function(acc, x) {
          var arr, xType;
          xType = NLType(x).isNumber() ? Number : NLType(x).isString() ? String : ((x instanceof Turtle) || (x instanceof Patch) || (x instanceof Link)) && (x.id !== -1) ? Agent : None;
          type = acc[0], arr = acc[1];
          switch (xType) {
            case Number:
              switch (type) {
                case Number:
                  return [Number, arr.concat([x])];
                default:
                  return [Number, [x]];
              }
              break;
            case String:
              switch (type) {
                case String:
                  return [String, arr.concat([x])];
                case Agent:
                case None:
                  return [String, [x]];
                default:
                  return acc;
              }
              break;
            case Agent:
              switch (type) {
                case Agent:
                  return [Agent, arr.concat([x])];
                case None:
                  return [Agent, [x]];
                default:
                  return acc;
              }
              break;
            default:
              return acc;
          }
        };
        ref2 = foldl(f)([None, []])(xs), filteredType = ref2[0], filteredItems = ref2[1];
        switch (filteredType) {
          case None:
            return filteredItems;
          case Number:
            return filteredItems.sort(function(x, y) {
              return Comparator.numericCompare(x, y).toInt;
            });
          case String:
            return filteredItems.sort();
          case Agent:
            return stableSort(filteredItems)(function(x, y) {
              return x.compare(y).toInt;
            });
          default:
            throw new Error("We don't know how to sort your kind here!");
        }
      } else if (type.isAgentSet()) {
        return xs.sort();
      } else {
        throw new Error("can only sort lists and agentsets");
      }
    };

    ListPrims.prototype.sortBy = function(task, xs) {
      var arr, f, taskIsTrue, type;
      type = NLType(xs);
      arr = (function() {
        if (type.isList()) {
          return xs;
        } else if (type.isAgentSet()) {
          return xs.shufflerator().toArray();
        } else {
          throw new Error("can only sort lists and agentsets");
        }
      })();
      taskIsTrue = function(a, b) {
        var value;
        value = task(a, b);
        if (value === true || value === false) {
          return value;
        } else {
          throw new Error("SORT-BY expected input to be a TRUE/FALSE but got " + value + " instead.");
        }
      };
      f = function(x, y) {
        var xy, yx;
        xy = taskIsTrue(x, y);
        yx = taskIsTrue(y, x);
        if (xy === yx) {
          return 0;
        } else if (xy) {
          return -1;
        } else {
          return 1;
        }
      };
      return stableSort(arr)(f);
    };

    ListPrims.prototype.standardDeviation = function(xs) {
      var mean, nums, squareDiff, stdDev;
      nums = xs.filter(function(x) {
        return NLType(x).isNumber();
      });
      if (nums.length > 1) {
        mean = this.sum(xs) / xs.length;
        squareDiff = foldl(function(acc, x) {
          return acc + StrictMath.pow(x - mean, 2);
        })(0)(xs);
        stdDev = StrictMath.sqrt(squareDiff / (nums.length - 1));
        return NLMath.validateNumber(stdDev);
      } else {
        throw new Error("Can't find the standard deviation of a list without at least two numbers: " + (this._dump(xs)));
      }
    };

    ListPrims.prototype.sublist = function(xs, n1, n2) {
      return xs.slice(n1, n2);
    };

    ListPrims.prototype.substring = function(xs, n1, n2) {
      return xs.substr(n1, n2 - n1);
    };

    ListPrims.prototype.sum = function(xs) {
      return xs.reduce((function(a, b) {
        return a + b;
      }), 0);
    };

    ListPrims.prototype.variance = function(xs) {
      var count, mean, numbers, squareOfDifference, sum;
      numbers = filter(function(x) {
        return NLType(x).isNumber();
      })(xs);
      count = numbers.length;
      if (count < 2) {
        throw new Error("Can't find the variance of a list without at least two numbers");
      }
      sum = numbers.reduce((function(acc, x) {
        return acc + x;
      }), 0);
      mean = sum / count;
      squareOfDifference = numbers.reduce((function(acc, x) {
        return acc + StrictMath.pow(x - mean, 2);
      }), 0);
      return squareOfDifference / (count - 1);
    };

    ListPrims.prototype._nOfArray = function(n, items) {
      var i, index1, index2, j, newIndex1, newIndex2, ref2, result;
      switch (n) {
        case 0:
          return [];
        case 1:
          return [items[this._nextInt(items.length)]];
        case 2:
          index1 = this._nextInt(items.length);
          index2 = this._nextInt(items.length - 1);
          ref2 = index2 >= index1 ? [index1, index2 + 1] : [index2, index1], newIndex1 = ref2[0], newIndex2 = ref2[1];
          return [items[newIndex1], items[newIndex2]];
        default:
          i = 0;
          j = 0;
          result = [];
          while (j < n) {
            if (this._nextInt(items.length - i) < n - j) {
              result.push(items[i]);
              j += 1;
            }
            i += 1;
          }
          return result;
      }
    };

    return ListPrims;

  })();

}).call(this);

},{"../core/abstractagentset":"engine/core/abstractagentset","../core/link":"engine/core/link","../core/patch":"engine/core/patch","../core/turtle":"engine/core/turtle","../core/typechecker":"engine/core/typechecker","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/maybe":"brazier/maybe","shim/strictmath":"shim/strictmath","util/comparator":"util/comparator","util/exception":"util/exception","util/nlmath":"util/nlmath","util/stablesort":"util/stablesort"}],"engine/prim/mouseprims":[function(require,module,exports){
(function() {
  var MouseConfig, MousePrims;

  module.exports.Config = MouseConfig = (function() {
    function MouseConfig(peekIsDown, peekIsInside, peekX, peekY) {
      this.peekIsDown = peekIsDown != null ? peekIsDown : (function() {
        return false;
      });
      this.peekIsInside = peekIsInside != null ? peekIsInside : (function() {
        return false;
      });
      this.peekX = peekX != null ? peekX : (function() {
        return 0;
      });
      this.peekY = peekY != null ? peekY : (function() {
        return 0;
      });
    }

    return MouseConfig;

  })();

  module.exports.Prims = MousePrims = (function() {
    function MousePrims(arg) {
      this.isDown = arg.peekIsDown, this.isInside = arg.peekIsInside, this.getX = arg.peekX, this.getY = arg.peekY;
    }

    return MousePrims;

  })();

}).call(this);

},{}],"engine/prim/outputprims":[function(require,module,exports){
(function() {
  var OutputConfig, OutputPrims, genPrintBundle;

  genPrintBundle = require('./printbundle');

  module.exports.Config = OutputConfig = (function() {
    function OutputConfig(clear1, write1) {
      this.clear = clear1 != null ? clear1 : (function() {});
      this.write = write1 != null ? write1 : (function() {});
    }

    return OutputConfig;

  })();

  module.exports.Prims = OutputPrims = (function() {
    OutputPrims.prototype.clear = void 0;

    OutputPrims.prototype.print = void 0;

    OutputPrims.prototype.show = void 0;

    OutputPrims.prototype.type = void 0;

    OutputPrims.prototype.write = void 0;

    function OutputPrims(arg, writeToStore, clearStored, dump) {
      var clear, ref, write, writePlus;
      clear = arg.clear, write = arg.write;
      this.clear = (function() {
        clearStored();
        return clear();
      });
      writePlus = (function(x) {
        writeToStore(x);
        return write(x);
      });
      ref = genPrintBundle(writePlus, dump), this.print = ref.print, this.show = ref.show, this.type = ref.type, this.write = ref.write;
    }

    return OutputPrims;

  })();

}).call(this);

},{"./printbundle":"engine/prim/printbundle"}],"engine/prim/prims":[function(require,module,exports){
(function() {
  var AbstractAgentSet, EQ, Exception, GT, Gamma, LT, Link, LinkSet, MersenneTwisterFast, NLMath, NLType, Patch, PatchSet, Prims, StrictMath, Timer, Turtle, TurtleSet, flatMap, flattenDeep, getNeighbors, getNeighbors4, greaterThan, isEmpty, lessThan, map, range, ref, ref1,
    slice = [].slice;

  AbstractAgentSet = require('../core/abstractagentset');

  Link = require('../core/link');

  LinkSet = require('../core/linkset');

  Patch = require('../core/patch');

  PatchSet = require('../core/patchset');

  Turtle = require('../core/turtle');

  TurtleSet = require('../core/turtleset');

  NLType = require('../core/typechecker');

  StrictMath = require('shim/strictmath');

  Exception = require('util/exception');

  NLMath = require('util/nlmath');

  Timer = require('util/timer');

  Gamma = require('./gamma');

  ref = require('brazierjs/array'), flatMap = ref.flatMap, flattenDeep = ref.flattenDeep, isEmpty = ref.isEmpty, map = ref.map;

  MersenneTwisterFast = require('shim/engine-scala').MersenneTwisterFast;

  ref1 = require('util/comparator'), EQ = ref1.EQUALS, GT = ref1.GREATER_THAN, LT = ref1.LESS_THAN;

  getNeighbors = function(patch) {
    return patch.getNeighbors();
  };

  getNeighbors4 = function(patch) {
    return patch.getNeighbors4();
  };

  lessThan = function(a, b) {
    return a < b;
  };

  greaterThan = function(a, b) {
    return a > b;
  };

  range = function(lowerBound, upperBound, stepSize) {
    var j, ref2, ref3, ref4, results, x;
    results = [];
    for (x = j = ref2 = lowerBound, ref3 = upperBound, ref4 = stepSize; ref4 > 0 ? j < ref3 : j > ref3; x = j += ref4) {
      results.push(x);
    }
    return results;
  };

  module.exports = Prims = (function() {
    Prims.prototype._everyMap = void 0;

    function Prims(_dumper, _hasher, _rng, _world, _evalPrims) {
      this._dumper = _dumper;
      this._hasher = _hasher;
      this._rng = _rng;
      this._world = _world;
      this._evalPrims = _evalPrims;
      this._everyMap = {};
    }

    Prims.prototype.boom = function() {
      throw new Error("boom!");
    };

    Prims.prototype.breedOn = function(breedName, x) {
      var patches, turtles, type;
      type = NLType(x);
      patches = (function() {
        if (type.isPatch()) {
          return [x];
        } else if (type.isTurtle()) {
          return [x.getPatchHere()];
        } else if (type.isPatchSet()) {
          return x.toArray();
        } else if (type.isTurtleSet()) {
          return map(function(t) {
            return t.getPatchHere();
          })(x.iterator().toArray());
        } else {
          throw new Error("`breed-on` unsupported for class '" + (typeof x) + "'");
        }
      })();
      turtles = flatMap(function(p) {
        return p.breedHereArray(breedName);
      })(patches);
      return new TurtleSet(turtles, this._world);
    };

    Prims.prototype.div = function(a, b) {
      if (b !== 0) {
        return a / b;
      } else {
        throw new Error("Division by zero.");
      }
    };

    Prims.prototype.equality = function(a, b) {
      var subsumes, typeA, typeB;
      if ((a != null) && (b != null)) {
        typeA = NLType(a);
        typeB = NLType(b);
        return (a === b) || typeA.isBreedSet(typeof b.getSpecialName === "function" ? b.getSpecialName() : void 0) || typeB.isBreedSet(typeof a.getSpecialName === "function" ? a.getSpecialName() : void 0) || (a === Nobody && (typeof b.isDead === "function" ? b.isDead() : void 0)) || (b === Nobody && (typeof a.isDead === "function" ? a.isDead() : void 0)) || ((typeA.isTurtle() || (typeA.isLink() && b !== Nobody)) && a.compare(b) === EQ) || (typeA.isList() && typeB.isList() && a.length === b.length && a.every((function(_this) {
          return function(elem, i) {
            return _this.equality(elem, b[i]);
          };
        })(this))) || (typeA.isAgentSet() && typeB.isAgentSet() && a.size() === b.size() && Object.getPrototypeOf(a) === Object.getPrototypeOf(b) && (subsumes = (function(_this) {
          return function(xs, ys) {
            var index, j, len, x;
            for (index = j = 0, len = xs.length; j < len; index = ++j) {
              x = xs[index];
              if (!_this.equality(ys[index], x)) {
                return false;
              }
            }
            return true;
          };
        })(this), subsumes(a.sort(), b.sort())));
      } else {
        throw new Error("Checking equality on undefined is an invalid condition");
      }
    };

    Prims.prototype.dateAndTime = function() {
      var amOrPM, calendarComponent, clockTime, d, date, hours, hoursNum, millis, minutes, modHours, month, numberToMonth, seconds, withThreeDigits, withTwoDigits, year;
      withTwoDigits = function(x) {
        return (x < 10 ? "0" : "") + x;
      };
      withThreeDigits = function(x) {
        return (x < 10 ? "00" : x < 100 ? "0" : "") + x;
      };
      numberToMonth = {
        1: "Jan",
        2: "Feb",
        3: "Mar",
        4: "Apr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Aug",
        9: "Sep",
        10: "Oct",
        11: "Nov",
        12: "Dec"
      };
      d = new Date;
      hoursNum = d.getHours();
      modHours = hoursNum === 0 || hoursNum === 12 ? 12 : hoursNum % 12;
      hours = withTwoDigits(modHours);
      minutes = withTwoDigits(d.getMinutes());
      seconds = withTwoDigits(d.getSeconds());
      clockTime = hours + ":" + minutes + ":" + seconds;
      millis = withThreeDigits(d.getMilliseconds());
      amOrPM = hoursNum >= 12 ? "PM" : "AM";
      date = withTwoDigits(d.getDate());
      month = numberToMonth[d.getMonth() + 1];
      year = d.getFullYear();
      calendarComponent = date + "-" + month + "-" + year;
      return clockTime + "." + millis + " " + amOrPM + " " + calendarComponent;
    };

    Prims.prototype.isThrottleTimeElapsed = function(commandID, agent, timeLimit) {
      var entry;
      entry = this._everyMap[this._genEveryKey(commandID, agent)];
      return (entry == null) || entry.elapsed() >= timeLimit;
    };

    Prims.prototype.resetThrottleTimerFor = function(commandID, agent) {
      return this._everyMap[this._genEveryKey(commandID, agent)] = new Timer();
    };

    Prims.prototype.generateNewSeed = (function() {
      var helper, lastSeed;
      lastSeed = 0;
      helper = function() {
        var seed;
        seed = (new MersenneTwisterFast).nextInt();
        if (seed !== lastSeed) {
          lastSeed = seed;
          return seed;
        } else {
          return helper();
        }
      };
      return helper;
    })();

    Prims.prototype.gt = function(a, b) {
      var typeA, typeB;
      typeA = NLType(a);
      typeB = NLType(b);
      if ((typeA.isString() && typeB.isString()) || (typeA.isNumber() && typeB.isNumber())) {
        return a > b;
      } else if (typeof a === typeof b && (a.compare != null) && (b.compare != null)) {
        return a.compare(b) === GT;
      } else {
        throw new Error("Invalid operands to `gt`");
      }
    };

    Prims.prototype.gte = function(a, b) {
      return this.gt(a, b) || this.equality(a, b);
    };

    Prims.prototype.linkSet = function() {
      var inputs;
      inputs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this._createAgentSet(inputs, Link, LinkSet);
    };

    Prims.prototype.lt = function(a, b) {
      var typeA, typeB;
      typeA = NLType(a);
      typeB = NLType(b);
      if ((typeA.isString() && typeB.isString()) || (typeA.isNumber() && typeB.isNumber())) {
        return a < b;
      } else if (typeof a === typeof b && (a.compare != null) && (b.compare != null)) {
        return a.compare(b) === LT;
      } else {
        throw new Error("Invalid operands to `lt`");
      }
    };

    Prims.prototype.lte = function(a, b) {
      return this.lt(a, b) || this.equality(a, b);
    };

    Prims.prototype.nanoTime = function() {
      var nanos, ref2;
      nanos = ((ref2 = typeof performance !== "undefined" && performance !== null ? typeof performance.now === "function" ? performance.now() : void 0 : void 0) != null ? ref2 : Date.now()) * 1e6;
      return StrictMath.floor(nanos);
    };

    Prims.prototype.patchSet = function() {
      var inputs;
      inputs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this._createAgentSet(inputs, Patch, PatchSet);
    };

    Prims.prototype.random = function(n) {
      var truncated;
      truncated = n >= 0 ? StrictMath.ceil(n) : StrictMath.floor(n);
      if (truncated === 0) {
        return 0;
      } else if (truncated > 0) {
        return this._rng.nextLong(truncated);
      } else {
        return -this._rng.nextLong(-truncated);
      }
    };

    Prims.prototype.randomCoord = function(min, max) {
      return min - 0.5 + this._rng.nextDouble() * (max - min + 1);
    };

    Prims.prototype.randomFloat = function(n) {
      return n * this._rng.nextDouble();
    };

    Prims.prototype.randomNormal = function(mean, stdDev) {
      if (stdDev >= 0) {
        return NLMath.validateNumber(mean + stdDev * this._rng.nextGaussian());
      } else {
        throw new Error("random-normal's second input can't be negative.");
      }
    };

    Prims.prototype.randomExponential = function(mean) {
      return NLMath.validateNumber(-mean * StrictMath.log(this._rng.nextDouble()));
    };

    Prims.prototype.randomPatchCoord = function(min, max) {
      return min + this._rng.nextInt(max - min + 1);
    };

    Prims.prototype.randomPoisson = function(mean) {
      var q, sum;
      q = 0;
      sum = -StrictMath.log(1 - this._rng.nextDouble());
      while (sum <= mean) {
        q += 1;
        sum -= StrictMath.log(1 - this._rng.nextDouble());
      }
      return q;
    };

    Prims.prototype.randomGamma = function(alpha, lambda) {
      if (alpha <= 0 || lambda <= 0) {
        throw new Error("Both Inputs to RANDOM-GAMMA must be positive.");
      }
      return Gamma(this._rng, alpha, lambda);
    };

    Prims.prototype.rangeUnary = function(upperBound) {
      return range(0, upperBound, 1);
    };

    Prims.prototype.rangeBinary = function(lowerBound, upperBound) {
      return range(lowerBound, upperBound, 1);
    };

    Prims.prototype.rangeTernary = function(lowerBound, upperBound, stepSize) {
      if (stepSize !== 0) {
        return range(lowerBound, upperBound, stepSize);
      } else {
        throw new Error("The step-size for range must be non-zero.");
      }
    };

    Prims.prototype.readFromString = function(str) {
      return this._evalPrims.readFromString(str);
    };

    Prims.prototype.runCode = function() {
      var args, f, isRunResult, procVars;
      isRunResult = arguments[0], procVars = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      f = args[0];
      if (NLType(f).isString()) {
        if (args.length === 1) {
          return this._evalPrims.runCode(f, isRunResult, procVars);
        } else {
          throw new Error((isRunResult ? "runresult" : "run") + " doesn't accept further inputs if the first is a string");
        }
      } else {
        return f.apply(null, args.slice(1));
      }
    };

    Prims.prototype.stdout = function(x) {
      var dumpedX;
      dumpedX = this._dumper(x);
      if (typeof console !== "undefined" && console !== null) {
        console.log(dumpedX);
      } else if (typeof print !== "undefined" && print !== null) {
        print(dumpedX);
      } else {
        throw new Error("We don't know how to output text on this platform.  But, if it helps you any, here's the thing you wanted to see: " + dumpedX);
      }
    };

    Prims.prototype.turtleSet = function() {
      var inputs;
      inputs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this._createAgentSet(inputs, Turtle, TurtleSet);
    };

    Prims.prototype.turtlesOn = function(agentsOrAgent) {
      var turtles, type;
      type = NLType(agentsOrAgent);
      if (type.isAgentSet()) {
        turtles = flatMap(function(agent) {
          return agent.turtlesHere().toArray();
        })(agentsOrAgent.iterator().toArray());
        return new TurtleSet(turtles, this._world);
      } else {
        return agentsOrAgent.turtlesHere();
      }
    };

    Prims.prototype.wait = function(seconds) {
      var startTime;
      startTime = this.nanoTime();
      while (((this.nanoTime() - startTime) / 1e9) < seconds) {}
    };

    Prims.prototype.uphill = function(varName) {
      this._moveUpOrDownhill(-Infinity, greaterThan, getNeighbors, varName);
    };

    Prims.prototype.uphill4 = function(varName) {
      this._moveUpOrDownhill(-Infinity, greaterThan, getNeighbors4, varName);
    };

    Prims.prototype.downhill = function(varName) {
      this._moveUpOrDownhill(Infinity, lessThan, getNeighbors, varName);
    };

    Prims.prototype.downhill4 = function(varName) {
      this._moveUpOrDownhill(Infinity, lessThan, getNeighbors4, varName);
    };

    Prims.prototype._moveUpOrDownhill = function(worstPossible, findIsBetter, getNeighbors, varName) {
      var patch, turtle, winner, winners, winningValue;
      turtle = SelfManager.self();
      patch = turtle.getPatchHere();
      winningValue = worstPossible;
      winners = [];
      getNeighbors(patch).forEach(function(neighbor) {
        var value;
        value = neighbor.getPatchVariable(varName);
        if (NLType(value).isNumber()) {
          if (findIsBetter(value, winningValue)) {
            winningValue = value;
            return winners = [neighbor];
          } else if (winningValue === value) {
            return winners.push(neighbor);
          }
        }
      });
      if (winners.length !== 0 && findIsBetter(winningValue, patch.getPatchVariable(varName))) {
        winner = winners[this._rng.nextInt(winners.length)];
        turtle.face(winner);
        turtle.moveTo(winner);
      }
    };

    Prims.prototype._genEveryKey = function(commandID, agent) {
      var agentID;
      agentID = agent === 0 ? "observer" : this._dumper(agent);
      return commandID + "__" + agentID;
    };

    Prims.prototype._createAgentSet = function(inputs, tClass, outClass) {
      var addT, buildFromAgentSet, buildItems, flattened, hashIt, hashSet, head, makeOutie, result;
      flattened = flattenDeep(inputs);
      makeOutie = (function(_this) {
        return function(agents) {
          return new outClass(agents, _this._world);
        };
      })(this);
      if (isEmpty(flattened)) {
        return makeOutie([]);
      } else if (flattened.length === 1) {
        head = flattened[0];
        if (head instanceof outClass) {
          return head;
        } else if (head instanceof tClass) {
          return makeOutie([head]);
        } else {
          return makeOutie([]);
        }
      } else {
        result = [];
        hashSet = {};
        hashIt = this._hasher;
        addT = function(p) {
          var hash;
          hash = hashIt(p);
          if (!hashSet.hasOwnProperty(hash)) {
            result.push(p);
            hashSet[hash] = true;
          }
        };
        buildFromAgentSet = function(agentSet) {
          return agentSet.forEach(addT);
        };
        buildItems = (function(_this) {
          return function(inputs) {
            var input, j, len, results;
            results = [];
            for (j = 0, len = inputs.length; j < len; j++) {
              input = inputs[j];
              if (NLType(input).isList()) {
                results.push(buildItems(input));
              } else if (input instanceof tClass) {
                results.push(addT(input));
              } else if (input !== Nobody) {
                results.push(buildFromAgentSet(input));
              } else {
                results.push(void 0);
              }
            }
            return results;
          };
        })(this);
        buildItems(flattened);
        return makeOutie(result);
      }
    };

    return Prims;

  })();

}).call(this);

},{"../core/abstractagentset":"engine/core/abstractagentset","../core/link":"engine/core/link","../core/linkset":"engine/core/linkset","../core/patch":"engine/core/patch","../core/patchset":"engine/core/patchset","../core/turtle":"engine/core/turtle","../core/turtleset":"engine/core/turtleset","../core/typechecker":"engine/core/typechecker","./gamma":"engine/prim/gamma","brazierjs/array":"brazier/array","shim/engine-scala":"shim/engine-scala","shim/strictmath":"shim/strictmath","util/comparator":"util/comparator","util/exception":"util/exception","util/nlmath":"util/nlmath","util/timer":"util/timer"}],"engine/prim/printbundle":[function(require,module,exports){
(function() {
  var PrintBundle, pipeline,
    slice = [].slice;

  pipeline = require('brazierjs/function').pipeline;

  PrintBundle = (function() {
    function PrintBundle(print1, type1, write1, show1) {
      this.print = print1;
      this.type = type1;
      this.write = write1;
      this.show = show1;
    }

    return PrintBundle;

  })();

  module.exports = function(printFunc, dump) {
    var dumpWrapped, newLine, preSpace, prependAgent, print, show, type, write, writeAfter;
    preSpace = function(s) {
      return " " + s;
    };
    newLine = function(s) {
      return s + "\n";
    };
    dumpWrapped = function(s) {
      return dump(s, true);
    };
    prependAgent = function(thunk) {
      return function(s) {
        var agentOrZero, agentStr;
        agentOrZero = thunk();
        agentStr = agentOrZero === 0 ? "observer" : dump(agentOrZero);
        return agentStr + ": " + s;
      };
    };
    writeAfter = function() {
      var fs;
      fs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return pipeline.apply(null, slice.call(fs).concat([printFunc]));
    };
    print = writeAfter(dump, newLine);
    type = writeAfter(dump);
    write = writeAfter(dumpWrapped, preSpace);
    show = function(agentThunk) {
      return writeAfter(dumpWrapped, prependAgent(agentThunk), newLine);
    };
    return new PrintBundle(print, type, write, show);
  };

}).call(this);

},{"brazierjs/function":"brazier/function"}],"engine/prim/printprims":[function(require,module,exports){
(function() {
  var PrintConfig, PrintPrims, genPrintBundle;

  genPrintBundle = require('./printbundle');

  module.exports.Config = PrintConfig = (function() {
    function PrintConfig(write1) {
      this.write = write1 != null ? write1 : (function() {});
    }

    return PrintConfig;

  })();

  module.exports.Prims = PrintPrims = (function() {
    PrintPrims.prototype.print = void 0;

    PrintPrims.prototype.show = void 0;

    PrintPrims.prototype.type = void 0;

    PrintPrims.prototype.write = void 0;

    function PrintPrims(arg, dump) {
      var ref, write;
      write = arg.write;
      ref = genPrintBundle(write, dump), this.print = ref.print, this.show = ref.show, this.type = ref.type, this.write = ref.write;
    }

    return PrintPrims;

  })();

}).call(this);

},{"./printbundle":"engine/prim/printbundle"}],"engine/prim/selfprims":[function(require,module,exports){
(function() {
  var SelfPrims, TypeSet, linkType, mempty, observerType, patchType, turtleType;

  TypeSet = (function() {
    function TypeSet(link1, observer1, patch1, turtle1) {
      this.link = link1;
      this.observer = observer1;
      this.patch = patch1;
      this.turtle = turtle1;
    }

    TypeSet.prototype.mergeWith = function(arg) {
      var link, observer, patch, turtle;
      link = arg.link, observer = arg.observer, patch = arg.patch, turtle = arg.turtle;
      return new TypeSet(this.link || link, this.observer || observer, this.patch || patch, this.turtle || turtle);
    };

    TypeSet.prototype.mappend = function(ts) {
      return this.mergeWith(ts);
    };

    return TypeSet;

  })();

  mempty = new TypeSet(false, false, false, false);

  linkType = new TypeSet(true, false, false, false);

  observerType = new TypeSet(false, true, false, false);

  patchType = new TypeSet(false, false, true, false);

  turtleType = new TypeSet(false, false, false, true);

  module.exports = SelfPrims = (function() {
    function SelfPrims(_getSelf) {
      this._getSelf = _getSelf;
    }

    SelfPrims.prototype.other = function(agentSet) {
      var self;
      self = this._getSelf();
      return agentSet.filter((function(_this) {
        return function(agent) {
          return agent !== self;
        };
      })(this));
    };

    SelfPrims.prototype._optimalAnyOther = function(agentSet) {
      var self;
      self = this._getSelf();
      return agentSet.exists(function(agent) {
        return agent !== self;
      });
    };

    SelfPrims.prototype._optimalCountOther = function(agentSet) {
      var self;
      self = this._getSelf();
      return (agentSet.filter(function(agent) {
        return agent !== self;
      })).size();
    };

    SelfPrims.prototype.linkHeading = function() {
      return this._getSelfSafe(linkType).getHeading();
    };

    SelfPrims.prototype.linkLength = function() {
      return this._getSelfSafe(linkType).getSize();
    };

    SelfPrims.prototype._getSelfSafe = function(typeSet) {
      var agentStr, allowsL, allowsP, allowsT, part1, part2, self, type, typeStr;
      allowsL = typeSet.link, allowsP = typeSet.patch, allowsT = typeSet.turtle;
      self = this._getSelf();
      type = NLType(self);
      if ((type.isTurtle() && allowsT) || (type.isPatch() && allowsP) || (type.isLink() && allowsL)) {
        return self;
      } else {
        typeStr = this._nlTypeToString(type);
        part1 = "this code can't be run by " + typeStr;
        agentStr = this._typeSetToAgentString(typeSet);
        part2 = agentStr.length !== 0 ? ", only " + agentStr : "";
        throw new Error(part1 + part2);
      }
    };

    SelfPrims.prototype._nlTypeToString = function(nlType) {
      if (nlType.isTurtle()) {
        return "a turtle";
      } else if (nlType.isPatch()) {
        return "a patch";
      } else if (nlType.isLink()) {
        return "a link";
      } else {
        return "";
      }
    };

    SelfPrims.prototype._typeSetToAgentString = function(typeSet) {
      if (typeSet.turtle) {
        return "a turtle";
      } else if (typeSet.patch) {
        return "a patch";
      } else if (typeSet.link) {
        return "a link";
      } else {
        return "";
      }
    };

    return SelfPrims;

  })();

}).call(this);

},{}],"engine/prim/tasks":[function(require,module,exports){
(function() {
  var Exception, all, length, map, pipeline, rangeUntil, ref,
    slice = [].slice;

  ref = require('brazierjs/array'), all = ref.all, length = ref.length, map = ref.map;

  pipeline = require('brazierjs/function').pipeline;

  rangeUntil = require('brazierjs/number').rangeUntil;

  Exception = require('util/exception');

  module.exports = {
    commandTask: function(fn, body) {
      fn.isReporter = false;
      fn.nlogoBody = body;
      return fn;
    },
    reporterTask: function(fn, body) {
      fn.isReporter = true;
      fn.nlogoBody = body;
      return fn;
    },
    apply: function(fn, args) {
      var pluralStr;
      if (args.length >= fn.length) {
        return fn.apply(fn, args);
      } else {
        pluralStr = fn.length === 1 ? "" : "s";
        throw new Error("anonymous procedure expected " + fn.length + " input" + pluralStr + ", but only got " + args.length);
      }
    },
    map: function() {
      var fn, lists;
      fn = arguments[0], lists = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return this._processLists(fn, lists, "map");
    },
    nValues: function(n, fn) {
      return map(fn)(rangeUntil(0)(n));
    },
    forEach: function() {
      var fn, lists;
      fn = arguments[0], lists = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return this._processLists(fn, lists, "foreach");
    },
    _processLists: function(fn, lists, primName) {
      var head, i, j, newArr, numLists, ref1, res, results, x;
      numLists = lists.length;
      head = lists[0];
      if (numLists === 1) {
        if (fn.isReporter) {
          return map(fn)(head);
        } else {
          newArr = (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = head.length; j < len; j++) {
              x = head[j];
              res = fn(x);
              if ((res != null)) {
                break;
              } else {
                results.push(void 0);
              }
            }
            return results;
          })();
          if (res != null) {
            return res;
          }
        }
      } else if (all(function(l) {
        return l.length === head.length;
      })(lists)) {
        results = [];
        for (i = j = 0, ref1 = head.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
          results.push(fn.apply(null, map(function(list) {
            return list[i];
          })(lists)));
        }
        return results;
      } else {
        throw new Error("All the list arguments to " + (primName.toUpperCase()) + " must be the same length.");
      }
    }
  };

}).call(this);

},{"brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/number":"brazier/number","util/exception":"util/exception"}],"engine/prim/userdialogprims":[function(require,module,exports){
(function() {
  var HaltInterrupt, UserDialogConfig, UserDialogPrims;

  HaltInterrupt = require('util/exception').HaltInterrupt;

  module.exports.Config = UserDialogConfig = (function() {
    function UserDialogConfig(notify, confirm, yesOrNo, input) {
      this.notify = notify != null ? notify : (function() {});
      this.confirm = confirm != null ? confirm : (function() {
        return true;
      });
      this.yesOrNo = yesOrNo != null ? yesOrNo : (function() {
        return true;
      });
      this.input = input != null ? input : (function() {
        return "dummy implementation";
      });
    }

    return UserDialogConfig;

  })();

  module.exports.Prims = UserDialogPrims = (function() {
    function UserDialogPrims(arg) {
      this._confirm = arg.confirm, this._input = arg.input, this._yesOrNo = arg.yesOrNo;
    }

    UserDialogPrims.prototype.confirm = function(msg) {
      if (!this._confirm(msg)) {
        throw new HaltInterrupt;
      }
    };

    UserDialogPrims.prototype.input = function(msg) {
      var ref;
      return (function() {
        if ((ref = this._input(msg)) != null) {
          return ref;
        } else {
          throw new HaltInterrupt;
        }
      }).call(this);
    };

    UserDialogPrims.prototype.yesOrNo = function(msg) {
      var ref;
      return (function() {
        if ((ref = this._yesOrNo(msg)) != null) {
          return ref;
        } else {
          throw new HaltInterrupt;
        }
      }).call(this);
    };

    return UserDialogPrims;

  })();

}).call(this);

},{"util/exception":"util/exception"}],"engine/updater":[function(require,module,exports){
(function() {
  var Link, Observer, Patch, Turtle, Update, Updater, World, ignored, perspectiveToNum, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice;

  Link = require('./core/link');

  Patch = require('./core/patch');

  Turtle = require('./core/turtle');

  World = require('./core/world');

  ref = require('./core/observer'), (ref1 = ref.Perspective, perspectiveToNum = ref1.perspectiveToNum), Observer = ref.Observer;

  ignored = [
    "", function() {
      return "";
    }
  ];

  Update = (function() {
    function Update(turtles, patches, links, observer1, world1, drawingEvents) {
      this.turtles = turtles != null ? turtles : {};
      this.patches = patches != null ? patches : {};
      this.links = links != null ? links : {};
      this.observer = observer1 != null ? observer1 : {};
      this.world = world1 != null ? world1 : {};
      this.drawingEvents = drawingEvents != null ? drawingEvents : [];
    }

    return Update;

  })();

  module.exports = Updater = (function() {
    Updater.prototype._hasUpdates = void 0;

    Updater.prototype._updates = void 0;

    function Updater(_dump) {
      this._dump = _dump;
      this.updated = bind(this.updated, this);
      this.registerLinkStamp = bind(this.registerLinkStamp, this);
      this.registerTurtleStamp = bind(this.registerTurtleStamp, this);
      this.registerPenTrail = bind(this.registerPenTrail, this);
      this.registerDeadTurtle = bind(this.registerDeadTurtle, this);
      this.registerDeadLink = bind(this.registerDeadLink, this);
      this.zoom = bind(this.zoom, this);
      this._flushUpdates();
    }

    Updater.prototype.clearDrawing = function() {
      this._reportDrawingEvent({
        type: "clear-drawing"
      });
    };

    Updater.prototype.zoom = function(scale) {
      this._reportDrawingEvent({
        type: "zoom",
        scale: scale
      });
    };

    Updater.prototype.resetZoom = function() {
      this._reportDrawingEvent({
        type: "reset-zoom"
      });
    };

    Updater.prototype.importDrawing = function(sourcePath) {
      this._reportDrawingEvent({
        type: "import-drawing",
        sourcePath: sourcePath
      });
    };

    Updater.prototype.collectUpdates = function() {
      var temp;
      temp = this._updates;
      this._flushUpdates();
      return temp;
    };

    Updater.prototype.hasUpdates = function() {
      return this._hasUpdates;
    };

    Updater.prototype.registerDeadLink = function(id) {
      this._update("links", id, {
        WHO: -1
      });
    };

    Updater.prototype.registerDeadTurtle = function(id) {
      this._update("turtles", id, {
        WHO: -1
      });
    };

    Updater.prototype.registerPenTrail = function(fromX, fromY, toX, toY, rgb, size, penMode) {
      this._reportDrawingEvent({
        type: "line",
        fromX: fromX,
        fromY: fromY,
        toX: toX,
        toY: toY,
        rgb: rgb,
        size: size,
        penMode: penMode
      });
    };

    Updater.prototype.registerTurtleStamp = function(x, y, size, heading, color, shapeName, stampMode) {
      this._reportDrawingEvent({
        type: "stamp-image",
        agentType: "turtle",
        stamp: {
          x: x,
          y: y,
          size: size,
          heading: heading,
          color: color,
          shapeName: shapeName,
          stampMode: stampMode
        }
      });
    };

    Updater.prototype.registerLinkStamp = function(x1, y1, x2, y2, midpointX, midpointY, heading, color, shapeName, thickness, isDirected, size, isHidden, stampMode) {
      this._reportDrawingEvent({
        type: "stamp-image",
        agentType: "link",
        stamp: {
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2,
          midpointX: midpointX,
          midpointY: midpointY,
          heading: heading,
          color: color,
          shapeName: shapeName,
          thickness: thickness,
          'directed?': isDirected,
          size: size,
          'hidden?': isHidden,
          stampMode: stampMode
        }
      });
    };

    Updater.prototype.registerWorldState = function(state, id) {
      if (id == null) {
        id = 0;
      }
      this._update("world", id, state);
    };

    Updater.prototype.updated = function(obj) {
      return (function(_this) {
        return function() {
          var entry, entryUpdate, getter, i, len, mapping, objMap, ref2, ref3, update, v, varName, vars;
          vars = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          _this._hasUpdates = true;
          update = _this._updates[0];
          ref2 = (function() {
            if (obj instanceof Turtle) {
              return [update.turtles, this._turtleMap()];
            } else if (obj instanceof Patch) {
              return [update.patches, this._patchMap()];
            } else if (obj instanceof Link) {
              return [update.links, this._linkMap()];
            } else if (obj instanceof World) {
              return [update.world, this._worldMap()];
            } else if (obj instanceof Observer) {
              return [update.observer, this._observerMap()];
            } else {
              throw new Error("Unrecognized update type");
            }
          }).call(_this), entry = ref2[0], objMap = ref2[1];
          entryUpdate = (ref3 = entry[obj.id]) != null ? ref3 : {};
          if (entryUpdate['WHO'] < 0) {
            delete entryUpdate['WHO'];
          }
          for (i = 0, len = vars.length; i < len; i++) {
            v = vars[i];
            mapping = objMap[v];
            if (mapping != null) {
              if (mapping !== ignored) {
                varName = mapping[0], getter = mapping[1];
                entryUpdate[varName] = getter(obj);
                entry[obj.id] = entryUpdate;
              }
            } else {
              throw new Error("Unknown " + obj.constructor.name + " variable for update: " + v);
            }
          }
        };
      })(this);
    };

    Updater.prototype._turtleMap = function() {
      return {
        breed: [
          "BREED", function(turtle) {
            return turtle.getBreedName();
          }
        ],
        color: [
          "COLOR", function(turtle) {
            return turtle._color;
          }
        ],
        heading: [
          "HEADING", function(turtle) {
            return turtle._heading;
          }
        ],
        who: [
          "WHO", function(turtle) {
            return turtle.id;
          }
        ],
        'label-color': [
          "LABEL-COLOR", function(turtle) {
            return turtle._labelcolor;
          }
        ],
        'hidden?': [
          "HIDDEN?", function(turtle) {
            return turtle._hidden;
          }
        ],
        label: [
          "LABEL", (function(_this) {
            return function(turtle) {
              return _this._dump(turtle._label);
            };
          })(this)
        ],
        'pen-size': [
          "PEN-SIZE", function(turtle) {
            return turtle.penManager.getSize();
          }
        ],
        'pen-mode': [
          "PEN-MODE", function(turtle) {
            return turtle.penManager.getMode().toString();
          }
        ],
        shape: [
          "SHAPE", function(turtle) {
            return turtle._getShape();
          }
        ],
        size: [
          "SIZE", function(turtle) {
            return turtle._size;
          }
        ],
        xcor: [
          "XCOR", function(turtle) {
            return turtle.xcor;
          }
        ],
        ycor: [
          "YCOR", function(turtle) {
            return turtle.ycor;
          }
        ]
      };
    };

    Updater.prototype._patchMap = function() {
      return {
        id: [
          "WHO", function(patch) {
            return patch.id;
          }
        ],
        pcolor: [
          "PCOLOR", function(patch) {
            return patch._pcolor;
          }
        ],
        plabel: [
          "PLABEL", (function(_this) {
            return function(patch) {
              return _this._dump(patch._plabel);
            };
          })(this)
        ],
        'plabel-color': [
          "PLABEL-COLOR", function(patch) {
            return patch._plabelcolor;
          }
        ],
        pxcor: [
          "PXCOR", function(patch) {
            return patch.pxcor;
          }
        ],
        pycor: [
          "PYCOR", function(patch) {
            return patch.pycor;
          }
        ]
      };
    };

    Updater.prototype._linkMap = function() {
      return {
        breed: [
          "BREED", function(link) {
            return link.getBreedName();
          }
        ],
        color: [
          "COLOR", function(link) {
            return link._color;
          }
        ],
        end1: [
          "END1", function(link) {
            return link.end1.id;
          }
        ],
        end2: [
          "END2", function(link) {
            return link.end2.id;
          }
        ],
        heading: [
          "HEADING", function(link) {
            var _, error;
            try {
              return link.getHeading();
            } catch (error) {
              _ = error;
              return 0;
            }
          }
        ],
        'hidden?': [
          "HIDDEN?", function(link) {
            return link._isHidden;
          }
        ],
        id: [
          "ID", function(link) {
            return link.id;
          }
        ],
        'directed?': [
          "DIRECTED?", function(link) {
            return link.isDirected;
          }
        ],
        label: [
          "LABEL", (function(_this) {
            return function(link) {
              return _this._dump(link._label);
            };
          })(this)
        ],
        'label-color': [
          "LABEL-COLOR", function(link) {
            return link._labelcolor;
          }
        ],
        midpointx: [
          "MIDPOINTX", function(link) {
            return link.getMidpointX();
          }
        ],
        midpointy: [
          "MIDPOINTY", function(link) {
            return link.getMidpointY();
          }
        ],
        shape: [
          "SHAPE", function(link) {
            return link._shape;
          }
        ],
        size: [
          "SIZE", function(link) {
            return link.getSize();
          }
        ],
        thickness: [
          "THICKNESS", function(link) {
            return link._thickness;
          }
        ],
        'tie-mode': [
          "TIE-MODE", function(link) {
            return link.tiemode;
          }
        ],
        lcolor: ignored,
        llabel: ignored,
        llabelcolor: ignored,
        lhidden: ignored,
        lbreed: ignored,
        lshape: ignored
      };
    };

    Updater.prototype._worldMap = function() {
      return {
        height: [
          "worldHeight", function(world) {
            return world.topology.height;
          }
        ],
        id: [
          "WHO", function(world) {
            return world.id;
          }
        ],
        patchesAllBlack: [
          "patchesAllBlack", function(world) {
            return world._patchesAllBlack;
          }
        ],
        patchesWithLabels: [
          "patchesWithLabels", function(world) {
            return world._patchesWithLabels;
          }
        ],
        maxPxcor: [
          "MAXPXCOR", function(world) {
            return world.topology.maxPxcor;
          }
        ],
        maxPycor: [
          "MAXPYCOR", function(world) {
            return world.topology.maxPycor;
          }
        ],
        minPxcor: [
          "MINPXCOR", function(world) {
            return world.topology.minPxcor;
          }
        ],
        minPycor: [
          "MINPYCOR", function(world) {
            return world.topology.minPycor;
          }
        ],
        patchSize: [
          "patchSize", function(world) {
            return world.patchSize;
          }
        ],
        ticks: [
          "ticks", function(world) {
            return world.ticker._count;
          }
        ],
        unbreededLinksAreDirected: [
          "unbreededLinksAreDirected", function(world) {
            return world.breedManager.links().isDirected();
          }
        ],
        width: [
          "worldWidth", function(world) {
            return world.topology.width;
          }
        ],
        wrappingAllowedInX: [
          "wrappingAllowedInX", function(world) {
            return world.topology._wrapInX;
          }
        ],
        wrappingAllowedInY: [
          "wrappingAllowedInY", function(world) {
            return world.topology._wrapInY;
          }
        ]
      };
    };

    Updater.prototype._observerMap = function() {
      return {
        id: [
          "WHO", function(observer) {
            return observer.id;
          }
        ],
        perspective: [
          "perspective", function(observer) {
            return perspectiveToNum(observer.getPerspective());
          }
        ],
        targetAgent: [
          "targetAgent", function(observer) {
            return observer._getTargetAgentUpdate();
          }
        ]
      };
    };

    Updater.prototype._update = function(agentType, id, newAgent) {
      this._hasUpdates = true;
      this._updates[0][agentType][id] = newAgent;
    };

    Updater.prototype.triggerUpdate = function() {
      this._hasUpdates = true;
    };

    Updater.prototype._reportDrawingEvent = function(event) {
      this._hasUpdates = true;
      this._updates[0].drawingEvents.push(event);
    };

    Updater.prototype._flushUpdates = function() {
      this._hasUpdates = false;
      this._updates = [new Update()];
    };

    return Updater;

  })();

}).call(this);

},{"./core/link":"engine/core/link","./core/observer":"engine/core/observer","./core/patch":"engine/core/patch","./core/turtle":"engine/core/turtle","./core/world":"engine/core/world"}],"engine/workspace":[function(require,module,exports){
(function() {
  var BreedManager, Dump, EvalPrims, Hasher, ImportExportConfig, ImportExportPrims, InspectionConfig, InspectionPrims, LayoutManager, LinkPrims, ListPrims, Meta, MiniWorkspace, MouseConfig, MousePrims, NLType, OutputConfig, OutputPrims, PlotManager, Prims, PrintConfig, PrintPrims, RNG, SelfManager, SelfPrims, Timer, Updater, UserDialogConfig, UserDialogPrims, World, WorldConfig, csvToWorldState, fold, id, lookup, ref, ref1, ref2, ref3, ref4, ref5, ref6, toObject, values,
    slice = [].slice;

  WorldConfig = (function() {
    function WorldConfig(resizeWorld) {
      this.resizeWorld = resizeWorld != null ? resizeWorld : (function() {});
    }

    return WorldConfig;

  })();

  BreedManager = require('./core/breedmanager');

  Dump = require('./dump');

  EvalPrims = require('./prim/evalprims');

  Hasher = require('./hasher');

  LayoutManager = require('./prim/layoutmanager');

  LinkPrims = require('./prim/linkprims');

  ListPrims = require('./prim/listprims');

  NLType = require('./core/typechecker');

  PlotManager = require('./plot/plotmanager');

  Prims = require('./prim/prims');

  RNG = require('util/rng');

  SelfManager = require('./core/structure/selfmanager');

  SelfPrims = require('./prim/selfprims');

  Timer = require('util/timer');

  Updater = require('./updater');

  World = require('./core/world');

  csvToWorldState = require('serialize/importcsv');

  toObject = require('brazier/array').toObject;

  fold = require('brazier/maybe').fold;

  id = require('brazier/function').id;

  ref = require('brazier/object'), lookup = ref.lookup, values = ref.values;

  ref1 = require('./prim/inspectionprims'), InspectionConfig = ref1.Config, InspectionPrims = ref1.Prims;

  ref2 = require('./prim/importexportprims'), ImportExportConfig = ref2.Config, ImportExportPrims = ref2.Prims;

  ref3 = require('./prim/mouseprims'), MouseConfig = ref3.Config, MousePrims = ref3.Prims;

  ref4 = require('./prim/outputprims'), OutputConfig = ref4.Config, OutputPrims = ref4.Prims;

  ref5 = require('./prim/printprims'), PrintConfig = ref5.Config, PrintPrims = ref5.Prims;

  ref6 = require('./prim/userdialogprims'), UserDialogConfig = ref6.Config, UserDialogPrims = ref6.Prims;

  Meta = require('meta');

  MiniWorkspace = (function() {
    function MiniWorkspace(selfManager1, updater1, breedManager1, rng1, plotManager1) {
      this.selfManager = selfManager1;
      this.updater = updater1;
      this.breedManager = breedManager1;
      this.rng = rng1;
      this.plotManager = plotManager1;
    }

    return MiniWorkspace;

  })();

  module.exports = function(modelConfig) {
    return function(breedObjs) {
      return function(turtlesOwns, linksOwns) {
        return function(code) {
          return function(widgets) {
            return function(extensionDumpers) {
              return function() {
                var breedManager, dialogConfig, dump, evalPrims, importExportConfig, importExportPrims, importWorldFromCSV, inspectionConfig, inspectionPrims, layoutManager, linkPrims, listPrims, mouseConfig, mousePrims, outputConfig, outputPrims, outputStore, plotManager, plots, prims, printConfig, printPrims, ref10, ref11, ref12, ref13, ref14, ref15, ref7, ref8, ref9, rng, selfManager, selfPrims, timer, typechecker, updater, userDialogPrims, world, worldArgs, worldConfig;
                worldArgs = arguments;
                dialogConfig = (ref7 = modelConfig != null ? modelConfig.dialog : void 0) != null ? ref7 : new UserDialogConfig;
                importExportConfig = (ref8 = modelConfig != null ? modelConfig.importExport : void 0) != null ? ref8 : new ImportExportConfig;
                inspectionConfig = (ref9 = modelConfig != null ? modelConfig.inspection : void 0) != null ? ref9 : new InspectionConfig;
                mouseConfig = (ref10 = modelConfig != null ? modelConfig.mouse : void 0) != null ? ref10 : new MouseConfig;
                outputConfig = (ref11 = modelConfig != null ? modelConfig.output : void 0) != null ? ref11 : new OutputConfig;
                plots = (ref12 = modelConfig != null ? modelConfig.plots : void 0) != null ? ref12 : [];
                printConfig = (ref13 = modelConfig != null ? modelConfig.print : void 0) != null ? ref13 : new PrintConfig;
                worldConfig = (ref14 = modelConfig != null ? modelConfig.world : void 0) != null ? ref14 : new WorldConfig;
                Meta.version = (ref15 = modelConfig != null ? modelConfig.version : void 0) != null ? ref15 : Meta.version;
                dump = Dump(extensionDumpers);
                rng = new RNG;
                typechecker = NLType;
                outputStore = "";
                selfManager = new SelfManager;
                breedManager = new BreedManager(breedObjs, turtlesOwns, linksOwns);
                plotManager = new PlotManager(plots);
                timer = new Timer;
                updater = new Updater(dump);
                world = (function(func, args, ctor) {
                  ctor.prototype = func.prototype;
                  var child = new ctor, result = func.apply(child, args);
                  return Object(result) === result ? result : child;
                })(World, [new MiniWorkspace(selfManager, updater, breedManager, rng, plotManager), worldConfig, (function() {
                  outputConfig.clear();
                  return outputStore = "";
                }), (function() {
                  return outputStore;
                }), (function(text) {
                  return outputStore = text;
                }), dump].concat(slice.call(worldArgs)), function(){});
                layoutManager = new LayoutManager(world, rng.nextDouble);
                evalPrims = new EvalPrims(code, widgets);
                prims = new Prims(dump, Hasher, rng, world, evalPrims);
                selfPrims = new SelfPrims(selfManager.self);
                linkPrims = new LinkPrims(world);
                listPrims = new ListPrims(dump, Hasher, prims.equality.bind(prims), rng.nextInt);
                inspectionPrims = new InspectionPrims(inspectionConfig);
                mousePrims = new MousePrims(mouseConfig);
                outputPrims = new OutputPrims(outputConfig, (function(x) {
                  return outputStore += x;
                }), (function() {
                  return outputStore = "";
                }), dump);
                printPrims = new PrintPrims(printConfig, dump);
                userDialogPrims = new UserDialogPrims(dialogConfig);
                importWorldFromCSV = function(csvText) {
                  var breedNamePairs, functionify, pluralToSingular, ptsObject, singularToPlural, stpObject, worldState;
                  functionify = function(obj) {
                    return function(x) {
                      var msg;
                      msg = "Cannot find corresponding breed name for " + x + "!";
                      return fold(function() {
                        throw new Error(msg);
                      })(id)(lookup(x)(obj));
                    };
                  };
                  breedNamePairs = values(breedManager.breeds()).map(function(arg) {
                    var name, singular;
                    name = arg.name, singular = arg.singular;
                    return [name, singular];
                  });
                  ptsObject = toObject(breedNamePairs);
                  stpObject = toObject(breedNamePairs.map(function(arg) {
                    var p, s;
                    p = arg[0], s = arg[1];
                    return [s, p];
                  }));
                  pluralToSingular = functionify(ptsObject);
                  singularToPlural = functionify(stpObject);
                  worldState = csvToWorldState(singularToPlural, pluralToSingular)(csvText);
                  return world.importState(worldState);
                };
                importExportPrims = new ImportExportPrims(importExportConfig, (function() {
                  return world.exportCSV();
                }), (function() {
                  return world.exportAllPlotsCSV();
                }), (function(plot) {
                  return world.exportPlotCSV(plot);
                }), (function(path) {
                  return world.importDrawing(path);
                }), importWorldFromCSV);
                return {
                  selfManager: selfManager,
                  breedManager: breedManager,
                  dump: dump,
                  importExportPrims: importExportPrims,
                  inspectionPrims: inspectionPrims,
                  layoutManager: layoutManager,
                  linkPrims: linkPrims,
                  listPrims: listPrims,
                  mousePrims: mousePrims,
                  outputPrims: outputPrims,
                  plotManager: plotManager,
                  evalPrims: evalPrims,
                  prims: prims,
                  printPrims: printPrims,
                  rng: rng,
                  selfPrims: selfPrims,
                  timer: timer,
                  typechecker: typechecker,
                  updater: updater,
                  userDialogPrims: userDialogPrims,
                  world: world
                };
              };
            };
          };
        };
      };
    };
  };

}).call(this);

},{"./core/breedmanager":"engine/core/breedmanager","./core/structure/selfmanager":"engine/core/structure/selfmanager","./core/typechecker":"engine/core/typechecker","./core/world":"engine/core/world","./dump":"engine/dump","./hasher":"engine/hasher","./plot/plotmanager":"engine/plot/plotmanager","./prim/evalprims":"engine/prim/evalprims","./prim/importexportprims":"engine/prim/importexportprims","./prim/inspectionprims":"engine/prim/inspectionprims","./prim/layoutmanager":"engine/prim/layoutmanager","./prim/linkprims":"engine/prim/linkprims","./prim/listprims":"engine/prim/listprims","./prim/mouseprims":"engine/prim/mouseprims","./prim/outputprims":"engine/prim/outputprims","./prim/prims":"engine/prim/prims","./prim/printprims":"engine/prim/printprims","./prim/selfprims":"engine/prim/selfprims","./prim/userdialogprims":"engine/prim/userdialogprims","./updater":"engine/updater","brazier/array":"brazier/array","brazier/function":"brazier/function","brazier/maybe":"brazier/maybe","brazier/object":"brazier/object","meta":"meta","serialize/importcsv":"serialize/importcsv","util/rng":"util/rng","util/timer":"util/timer"}],"extensions/all":[function(require,module,exports){
(function() {
  var dumpers, extensionPaths;

  extensionPaths = ['codap', 'logging', 'nlmap', 'http-req', 'gbcc', 'graph', 'maps', 'physics', 'image'];

  dumpers = extensionPaths.map(function(path) {
    return require("extensions/" + path).dumper;
  }).filter(function(x) {
    return x != null;
  });

  module.exports = {
    initialize: function(workspace) {
      var extObj;
      extObj = {};
      extensionPaths.forEach(function(path) {
        var e;
        e = require("extensions/" + path).init(workspace);
        return extObj[e.name.toUpperCase()] = e;
      });
      return extObj;
    },
    dumpers: function() {
      return dumpers;
    }
  };

}).call(this);

},{}],"extensions/codap":[function(require,module,exports){
(function() {
  var IFramePhone;

  IFramePhone = require('iframe-phone');

  module.exports = {
    dumper: void 0,
    init: function(workspace) {
      var phone;
      phone = void 0;
      return {
        name: "codap",
        prims: {
          INIT: function(handler) {
            var ref;
            phone = ((typeof window !== "undefined" && window !== null ? window.parent : void 0) != null) && window.parent !== window ? new IFramePhone.IframePhoneRpcEndpoint(handler, "data-interactive", window.parent) : (((ref = typeof console !== "undefined" && console !== null ? console.log : void 0) != null ? ref : print)("CODAP Extension: Not in a frame; calls will have no effect."), {
              call: function(x) {
                var ref1;
                return ((ref1 = typeof console !== "undefined" && console !== null ? console.log : void 0) != null ? ref1 : print)("CODAP Extension: Not in a frame; doing nothing; received:", x);
              }
            });
            phone.call({
              action: "update",
              resource: "interactiveFrame",
              values: {
                preventDataContextReorg: false,
                title: "NetLogo Web"
              }
            });
          },
          CALL: function(argObj) {
            phone.call(argObj);
          }
        }
      };
    }
  };

}).call(this);

},{"iframe-phone":15}],"extensions/gbcc":[function(require,module,exports){
(function() {
  module.exports = {
    dumper: void 0,
    init: function(workspace) {
      var addToStream, adoptCanvas, broadcast, broadcastAvatar, broadcastPlot, broadcastText, broadcastView, clearBroadcast, clearBroadcasts, cloneCanvas, compileObserverCode, compilePatchCode, compileTurtleCode, exportMyData, exportOurData, get, getActiveUserList, getCanvasList, getFileList, getFromUser, getStream, getStreamFromUser, getUserList, getVacantIndices, hidePatches, importMyData, importMyDataFile, importOurData, importOurDataFile, removeCanvas, restoreGlobals, restoreGlobalsFromUser, runObserverCode, runPatchCode, runTurtleCode, send, set, showPatches, storeGlobals, whoAmI;
      set = function(messageTag, message) {
        socket.emit('send reporter', {
          hubnetMessageSource: "server",
          hubnetMessageTag: messageTag,
          hubnetMessage: message
        });
      };
      get = function(messageTag) {
        if (userData[myUserId][messageTag] != null) {
          return userData[myUserId][messageTag];
        } else {
          return "undefined";
        }
      };
      getFromUser = function(messageSource, messageTag) {
        if (userData[messageSource] && (userData[messageSource][messageTag] != null)) {
          return userData[messageSource][messageTag];
        } else {
          return "undefined";
        }
      };
      storeGlobals = function() {
        var globalVar, globalVars, results;
        globalVars = world.observer.varNames();
        results = [];
        for (globalVar in globalVars) {
          results.push(socket.emit('send reporter', {
            hubnetMessageSource: 'server',
            hubnetMessageTag: globalVars[globalVar],
            hubnetMessage: world.observer.getGlobal(globalVars[globalVar])
          }));
        }
        return results;
      };
      restoreGlobals = function() {
        var globalVar, globalVars, results;
        globalVars = world.observer.varNames();
        results = [];
        for (globalVar in globalVars) {
          results.push(socket.emit('get reporter', {
            hubnetMessageSource: myUserId,
            hubnetMessageTag: globalVars[globalVar],
            hubnetMessage: world.observer.getGlobal(globalVars[globalVar])
          }));
        }
        return results;
      };
      restoreGlobalsFromUser = function(messageSource) {
        var globalVar, globalVars, results;
        globalVars = world.observer.varNames();
        results = [];
        for (globalVar in globalVars) {
          results.push(socket.emit('get reporter', {
            hubnetMessageSource: messageSource,
            hubnetMessageTag: globalVars[globalVar],
            hubnetMessage: world.observer.getGlobal(globalVars[globalVar])
          }));
        }
        return results;
      };
      broadcastView = function(name) {
        return Gallery.broadcastView(name);
      };
      broadcastPlot = function(name) {
        return Gallery.broadcastPlot(name);
      };
      broadcastText = function(text) {
        return Gallery.broadcastText(text);
      };
      broadcastAvatar = function(shape, color, text) {
        return Gallery.broadcastAvatar(shape, color, text);
      };
      clearBroadcasts = function() {
        return Gallery.clearBroadcasts();
      };
      clearBroadcast = function(name) {
        return Gallery.clearBroadcast(name);
      };
      compileObserverCode = function(key, value) {
        return session.compileObserverCode(key, value);
      };
      compileTurtleCode = function(who, key, value) {
        return session.compileTurtleCode(who, key, value);
      };
      compilePatchCode = function(pxcor, pycor, key, value) {
        return session.compilePatchCode(pxcor, pycor, key, value);
      };
      runObserverCode = function(key) {
        return session.runObserverCode(key);
      };
      runTurtleCode = function(who, key) {
        return session.runTurtleCode(who, key);
      };
      runPatchCode = function(pxcor, pycor, key) {
        return session.runPatchCode(pxcor, pycor, key);
      };
      whoAmI = function() {
        return Gallery.whoAmI();
      };
      addToStream = function(messageTag, message) {
        socket.emit('send stream reporter', {
          hubnetMessageSource: "server",
          hubnetMessageTag: messageTag,
          hubnetMessage: message
        });
      };
      getStream = function(messageTag) {
        if (myStreamData[messageTag] != null) {
          return myStreamData[messageTag];
        } else {
          return [];
        }
      };
      getStreamFromUser = function(messageSource, messageTag) {
        var stream;
        if (userStreamData[messageSource] && (userStreamData[messageSource][messageTag] != null)) {
          stream = userStreamData[messageSource][messageTag];
          userStreamData[messageSource][messageTag] = [];
          return stream;
        } else {
          return [];
        }
      };
      showPatches = function() {
        return Gallery.showPatches();
      };
      hidePatches = function() {
        return Gallery.hidePatches();
      };
      importOurDataFile = function(filename) {
        return GbccFileManager.importOurDataFile(filename);
      };
      importOurData = function() {
        return GbccFileManager.importOurData();
      };
      exportOurData = function(filename) {
        return GbccFileManager.exportOurData(filename);
      };
      importMyDataFile = function(filename) {
        return GbccFileManager.importMyDataFile(filename);
      };
      importMyData = function() {
        return GbccFileManager.importMyData();
      };
      exportMyData = function(filename) {
        return GbccFileManager.exportMyData(filename);
      };
      send = function(messageSource, messageTag, message) {
        socket.emit('send message reporter', {
          hubnetMessageSource: messageSource,
          hubnetMessageTag: messageTag,
          hubnetMessage: message
        });
      };
      broadcast = function(messageTag, message) {
        socket.emit('send message reporter', {
          hubnetMessageSource: 'all-users',
          hubnetMessageTag: messageTag,
          hubnetMessage: message
        });
      };
      adoptCanvas = function(userId, canvasId) {
        return Gallery.adoptCanvas(userId, canvasId);
      };
      getCanvasList = function() {
        return Gallery.getCanvasList();
      };
      getUserList = function() {
        return Gallery.getUserList();
      };
      getVacantIndices = function() {
        return Gallery.getVacantIndices();
      };
      getUserList = function() {
        return Gallery.getUserList();
      };
      getActiveUserList = function() {
        return Gallery.getActiveUserList();
      };
      getFileList = function() {
        return GbccFileManager.getFileList();
      };
      cloneCanvas = function() {
        return Gallery.cloneCanvas();
      };
      removeCanvas = function(userId) {
        return Gallery.cloneCanvas(userId);
      };
      return {
        name: "gbcc",
        prims: {
          "SET": set,
          "GET": get,
          "GET-FROM-USER": getFromUser,
          "STORE-GLOBALS": storeGlobals,
          "RESTORE-GLOBALS": restoreGlobals,
          "RESTORE-GLOBALS-FROM-USER": restoreGlobalsFromUser,
          "BROADCAST-VIEW": broadcastView,
          "BROADCAST-PLOT": broadcastPlot,
          "BROADCAST-AVATAR": broadcastAvatar,
          "BROADCAST-TEXT": broadcastText,
          "CLEAR-BROADCASTS": clearBroadcasts,
          "CLEAR-BROADCAST": clearBroadcast,
          "COMPILE-OBSERVER-CODE": compileObserverCode,
          "COMPILE-TURTLE-CODE": compileTurtleCode,
          "COMPILE-PATCH-CODE": compilePatchCode,
          "RUN-OBSERVER-CODE": runObserverCode,
          "RUN-TURTLE-CODE": runTurtleCode,
          "RUN-PATCH-CODE": runPatchCode,
          "WHO-AM-I": whoAmI,
          "ADD-TO-STREAM": addToStream,
          "GET-STREAM": getStream,
          "GET-STREAM-FROM-USER": getStreamFromUser,
          "SHOW-PATCHES": showPatches,
          "HIDE-PATCHES": hidePatches,
          "IMPORT-OUR-DATA": importOurData,
          "EXPORT-OUR-DATA": exportOurData,
          "IMPORT-OUR-DATA-FILE": importOurDataFile,
          "IMPORT-MY-DATA": importMyData,
          "EXPORT-MY-DATA": exportMyData,
          "IMPORT-MY-DATA-FILE": importMyDataFile,
          "SEND": send,
          "BROADCAST": broadcast,
          "GET-FILE-LIST": getFileList,
          "GET-CANVAS-LIST": getCanvasList,
          "GET-VACANT-INDICES": getVacantIndices,
          "GET-USER-LIST": getUserList,
          "GET-ACTIVE-USER-LIST": getActiveUserList,
          "ADOPT-CANVAS": adoptCanvas,
          "CLONE-CANVAS": cloneCanvas,
          "REMOVE-CANVAS": removeCanvas
        }
      };
    }
  };

}).call(this);

},{}],"extensions/graph":[function(require,module,exports){
(function() {
  module.exports = {
    dumper: void 0,
    init: function(workspace) {
      var bringToFront, centerView, createObject, createObjects, createPoint, createPoints, deleteObject, deleteObjects, deletePoint, deletePoints, evalCommand, evalReporter, exportGgb, getAll, getCommandString, getData, getDraggable, getGgbList, getGraphOffset, getObject, getObjectType, getObjects, getOpacity, getPoint, getPoints, getPointsString, getValue, getValueString, getX, getXy, getY, graphToPatch, hideGraph, hideObject, hideObjectLabel, hideToolbar, importGgb, importGgbFile, mouseOff, mouseOn, objectExists, patchToGraph, renameObject, sendToBack, setAll, setData, setDraggable, setGraphOffset, setOpacity, setX, setXy, setY, showGraph, showObject, showObjectLabel, showToolbar, updateGraph;
      hideGraph = function() {
        return Graph.hideGraph();
      };
      showGraph = function() {
        return Graph.showGraph();
      };
      setData = function(data) {
        return Graph.setData(data);
      };
      importGgbFile = function(filename) {
        return Graph.importGgbFile(filename);
      };
      getData = function() {
        return Graph.getData();
      };
      createPoint = function(name, center) {
        return Graph.createPoint(name, center);
      };
      setOpacity = function(opacity) {
        return Graph.setOpacity(opacity);
      };
      getOpacity = function() {
        return Graph.getOpacity();
      };
      createPoints = function(data) {
        return Graph.createPoints(data);
      };
      getPoints = function() {
        return Graph.getPoints();
      };
      deletePoint = function(name) {
        return Graph.deletePoint(name);
      };
      deletePoints = function() {
        return Graph.deletePoints();
      };
      setX = function(name, xcor) {
        return Graph.setX(name, xcor);
      };
      setY = function(name, ycor) {
        return Graph.setY(name, ycor);
      };
      setXy = function(name, center) {
        return Graph.setXy(name, center);
      };
      setDraggable = function(name, draggable) {
        return Graph.setDraggable(name, draggable);
      };
      getX = function(name) {
        return Graph.getX(name);
      };
      getY = function(name) {
        return Graph.getY(name);
      };
      getXy = function(name) {
        return Graph.getXy(name);
      };
      getObjects = function() {
        return Graph.getObjects();
      };
      deleteObjects = function() {
        return Graph.deleteObjects();
      };
      createObjects = function(objects) {
        return Graph.createObjects(objects);
      };
      getObject = function(name) {
        return Graph.getObject(name);
      };
      createObject = function(object) {
        return Graph.createObject(object);
      };
      getValue = function(name) {
        return Graph.getValue(name);
      };
      getObjectType = function(name) {
        return Graph.getObjectType(name);
      };
      objectExists = function(name) {
        return Graph.objectExists(name);
      };
      renameObject = function(old, next) {
        return Graph.renameObject(old, next);
      };
      deleteObject = function(name) {
        return Graph.deleteObject(name);
      };
      hideObject = function(name) {
        return Graph.hideObject(name);
      };
      showObject = function(name) {
        return Graph.showObject(name);
      };
      graphToPatch = function(coords) {
        return Graph.graphToPatch(coords);
      };
      patchToGraph = function(coords) {
        return Graph.patchToGraph(coords);
      };
      evalCommand = function(command) {
        return Graph.evalCommand(command);
      };
      evalReporter = function(command) {
        return Graph.evalReporter(command);
      };
      getPointsString = function() {
        return Graph.getPointsString();
      };
      updateGraph = function() {
        return Graph.updateGraph();
      };
      showObjectLabel = function(name) {
        return Graph.showObjectLabel(name);
      };
      hideObjectLabel = function(name) {
        return Graph.hideObjectLabel(name);
      };
      showToolbar = function() {
        return Graph.showToolbar();
      };
      hideToolbar = function() {
        return Graph.hideToolbar();
      };
      bringToFront = function() {
        return Graph.bringToFront();
      };
      sendToBack = function() {
        return Graph.sendToBack();
      };
      setAll = function(data) {
        return Graph.setAll(data);
      };
      getAll = function() {
        return Graph.getAll();
      };
      getGraphOffset = function() {
        return Graph.getGraphOffset();
      };
      setGraphOffset = function(offset) {
        return Graph.setGraphOffset(offset);
      };
      getPoint = function(name) {
        return Graph.getPoint(name);
      };
      centerView = function(center) {
        return Graph.centerView(center);
      };
      exportGgb = function(filename) {
        return Graph.exportGgb(filename);
      };
      getDraggable = function(name) {
        return Graph.getDraggable(name);
      };
      mouseOn = function() {
        return Graph.mouseOn();
      };
      mouseOff = function() {
        return Graph.mouseOff();
      };
      getCommandString = function(name) {
        return Graph.getCommandString(name);
      };
      getGgbList = function() {
        return Graph.getGgbList();
      };
      getValueString = function(name) {
        return Graph.getValueString(name);
      };
      importGgb = function() {
        return Graph.importGgb();
      };
      return {
        name: "graph",
        prims: {
          "HIDE-GRAPH": hideGraph,
          "SHOW-GRAPH": showGraph,
          "SET-DATA": setData,
          "IMPORT-GGB-FILE": importGgbFile,
          "GET-DATA": getData,
          "CREATE-POINT": createPoint,
          "SET-OPACITY": setOpacity,
          "GET-OPACITY": getOpacity,
          "CREATE-POINTS": createPoints,
          "GET-POINTS": getPoints,
          "DELETE-POINT": deletePoint,
          "DELETE-POINTS": deletePoints,
          "SET-X": setX,
          "SET-Y": setY,
          "SET-XY": setXy,
          "SET-DRAGGABLE": setDraggable,
          "GET-X": getX,
          "GET-Y": getY,
          "GET-XY": getXy,
          "GET-OBJECTS": getObjects,
          "DELETE-OBJECTS": deleteObjects,
          "CREATE-OBJECTS": createObjects,
          "GET-OBJECT": getObject,
          "CREATE-OBJECT": createObject,
          "GET-VALUE": getValue,
          "GET-OBJECT-TYPE": getObjectType,
          "OBJECT-EXISTS": objectExists,
          "RENAME-OBJECT": renameObject,
          "DELETE-OBJECT": deleteObject,
          "HIDE-OBJECT": hideObject,
          "SHOW-OBJECT": showObject,
          "GRAPH-TO-PATCH": graphToPatch,
          "PATCH-TO-GRAPH": patchToGraph,
          "EVAL-COMMAND": evalCommand,
          "EVAL-REPORTER": evalReporter,
          "GET-POINTS-STRING": getPointsString,
          "UPDATE-GRAPH": updateGraph,
          "SHOW-OBJECT-LABEL": showObjectLabel,
          "HIDE-OBJECT-LABEL": hideObjectLabel,
          "SHOW-TOOLBAR": showToolbar,
          "HIDE-TOOLBAR": hideToolbar,
          "BRING-TO-FRONT": bringToFront,
          "SEND-TO-BACK": sendToBack,
          "SET-ALL": setAll,
          "GET-ALL": getAll,
          "GET-GRAPH-OFFSET": getGraphOffset,
          "SET-GRAPH-OFFSET": setGraphOffset,
          "GET-POINT": getPoint,
          "CENTER-VIEW": centerView,
          "EXPORT-GGB": exportGgb,
          "GET-DRAGGABLE": getDraggable,
          "MOUSE-ON": mouseOn,
          "MOUSE-OFF": mouseOff,
          "GET-COMMAND-STRING": getCommandString,
          "GET-GGB-LIST": getGgbList,
          "GET-VALUE-STRING": getValueString,
          "IMPORT-GGB": importGgb
        }
      };
    }
  };

}).call(this);

},{}],"extensions/http-req":[function(require,module,exports){
(function() {
  module.exports = {
    dumper: void 0,
    init: function(workspace) {
      var get, post, requestor;
      get = function(url) {
        var ref, req;
        req = requestor("GET", url);
        return [req.status, req.statusText, (ref = req.responseText) != null ? ref : ''];
      };
      post = function(url, message, contentType) {
        var req;
        req = requestor("POST", url, message, contentType != null ? contentType : "text/plain");
        return [req.status, req.statusText, req.responseText];
      };
      requestor = function(reqType, url, message, contentType) {
        var ct, req;
        req = new XMLHttpRequest();
        req.open(reqType, url, false);
        if (contentType != null) {
          ct = (function() {
            switch (contentType) {
              case 'json':
                return 'application/json';
              case 'urlencoded':
                return 'application/x-www-form-urlencoded';
              default:
                return contentType;
            }
          })();
          req.setRequestHeader("Content-type", ct);
        }
        req.send(message != null ? message : "");
        return req;
      };
      return {
        name: "http-req",
        prims: {
          "GET": get,
          "POST": post
        }
      };
    }
  };

}).call(this);

},{}],"extensions/image":[function(require,module,exports){
(function() {
  module.exports = {
    dumper: void 0,
    init: function(workspace) {
      var clearImage, importFromUser, importImage, importPcolors, resetZoom, zoom;
      importImage = function(filename) {
        Images.importImage(filename);
      };
      zoom = function(scale) {
        world.zoom(scale);
      };
      resetZoom = function() {
        world.resetZoom();
      };
      importPcolors = function(filename) {
        Images.importPcolors(filename);
      };
      clearImage = function() {
        Images.clearImage();
      };
      importFromUser = function(userId) {
        Images.importFromUser(userId);
      };
      return {
        name: "image",
        prims: {
          "IMPORT": importImage,
          "ZOOM": zoom,
          "RESET-ZOOM": resetZoom,
          "IMPORT-PCOLORS": importPcolors,
          "CLEAR": clearImage,
          "IMPORT-FROM-USER": importFromUser
        }
      };
    }
  };

}).call(this);

},{}],"extensions/logging":[function(require,module,exports){
(function() {
  var contains, filter, flip, foldl, id, isEmpty, map, pipeline, ref, ref1, tail, tee,
    slice = [].slice;

  ref = require('brazierjs/array'), contains = ref.contains, filter = ref.filter, foldl = ref.foldl, isEmpty = ref.isEmpty, map = ref.map, tail = ref.tail;

  ref1 = require('brazierjs/function'), flip = ref1.flip, id = ref1.id, pipeline = ref1.pipeline, tee = ref1.tee;

  module.exports = {
    dumper: void 0,
    init: function(workspace) {
      var allLogs, clearLogs, logBuffer, logGlobals, logMessage;
      logBuffer = [];
      logMessage = function(str) {
        logBuffer.push(str);
      };
      logGlobals = function() {
        var getGlobal, globalNames, join, nameToLog, names, observer, toLogMessage, trueNames;
        names = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        observer = workspace.world.observer;
        globalNames = observer.varNames();
        getGlobal = observer.getGlobal.bind(observer);
        trueNames = isEmpty(names) ? globalNames : filter(flip(contains(globalNames)))(names);
        toLogMessage = function(arg) {
          var name, value;
          name = arg[0], value = arg[1];
          return name + ": " + value;
        };
        nameToLog = pipeline(tee(id)(pipeline(getGlobal, function(x) {
          return workspace.dump(x, true);
        })), toLogMessage);
        join = pipeline(foldl(function(acc, s) {
          return acc + "\n" + s;
        })(""), tail);
        pipeline(map(nameToLog), join, logMessage)(trueNames);
      };
      allLogs = function() {
        return logBuffer.slice(0);
      };
      clearLogs = function() {
        logBuffer = [];
      };
      return {
        name: "logging",
        prims: {
          "ALL-LOGS": allLogs,
          "CLEAR-LOGS": clearLogs,
          "LOG-GLOBALS": logGlobals,
          "LOG-MESSAGE": logMessage
        }
      };
    }
  };

}).call(this);

},{"brazierjs/array":"brazier/array","brazierjs/function":"brazier/function"}],"extensions/maps":[function(require,module,exports){
(function() {
  module.exports = {
    dumper: void 0,
    init: function(workspace) {
      var bringToFront, createMarker, createMarkers, createObject, createObjects, createPath, deleteMarker, deleteMarkers, deleteObject, deleteObjects, deletePath, deletePaths, exportFile, getAll, getCenterLatlng, getDraggable, getLat, getLatlng, getLng, getMapOffset, getMarker, getMarkers, getMyLatlng, getObject, getObjectType, getObjects, getOpacity, getPathColor, getPathVertices, getZoom, hideMap, hideObject, importFile, latlngToPatch, mouseOff, mouseOn, objectExists, patchToLatlng, sendToBack, setAll, setCenterLatlng, setDraggable, setLat, setLatlng, setLng, setMapOffset, setOpacity, setPathColor, setPathVertices, setZoom, showMap, showObject, updateMap, updateMyLatlng;
      hideMap = function() {
        return Maps.hideMap();
      };
      showMap = function() {
        return Maps.showMap();
      };
      importFile = function(filename) {
        return Maps.importFile(filename);
      };
      exportFile = function(filename) {
        return Maps.exportFile(filename);
      };
      setZoom = function(zoom) {
        return Maps.setZoom(zoom);
      };
      getZoom = function() {
        return Maps.getZoom();
      };
      setCenterLatlng = function(coords) {
        return Maps.setCenterLatlng(coords);
      };
      getCenterLatlng = function() {
        return Maps.getCenterLatlng();
      };
      createMarker = function(name, coords) {
        return Maps.createMarker(name, coords);
      };
      createMarkers = function(data) {
        return Maps.createMarkers(data);
      };
      getMarkers = function() {
        return Maps.getMarkers();
      };
      getMarker = function(name) {
        return Maps.getMarker(name);
      };
      hideObject = function(name) {
        return Maps.hideObject(name);
      };
      showObject = function(name) {
        return Maps.showObject(name);
      };
      setLat = function(name, lat) {
        return Maps.setLat(name, lat);
      };
      setLng = function(name, lng) {
        return Maps.setLng(name, lng);
      };
      setLatlng = function(name, latlng) {
        return Maps.setLatlng(name, latlng);
      };
      getLat = function(name) {
        return Maps.getLat(name);
      };
      getLng = function(name) {
        return Maps.getLng(name);
      };
      getLatlng = function(name) {
        return Maps.getLatlng(name);
      };
      deleteMarker = function(name) {
        return Maps.deleteMarker(name);
      };
      deleteMarkers = function() {
        return Maps.deleteMarkers();
      };
      latlngToPatch = function(coords) {
        return Maps.latlngToPatch(coords);
      };
      patchToLatlng = function(coords) {
        return Maps.patchToLatlng(coords);
      };
      objectExists = function(name) {
        return Maps.objectExists(name);
      };
      setOpacity = function(opacity) {
        return Maps.setOpacity(opacity);
      };
      getOpacity = function() {
        return Maps.getOpacity();
      };
      bringToFront = function() {
        return Maps.bringToFront();
      };
      sendToBack = function() {
        return Maps.sendToBack();
      };
      getMapOffset = function() {
        return Maps.getMapOffset();
      };
      setMapOffset = function(offset) {
        return Maps.setMapOffset(offset);
      };
      setAll = function(data) {
        return Maps.setAll(data);
      };
      getAll = function() {
        return Maps.getAll();
      };
      updateMap = function() {
        return Maps.updateMap();
      };
      createPath = function(name, vertices) {
        return Maps.createPath(name, vertices);
      };
      setPathColor = function(name, color) {
        return Maps.setPathColor(name, color);
      };
      getPathColor = function(name) {
        return Maps.getPathColor(name);
      };
      setPathVertices = function(name, vertices) {
        return Maps.setPathVertices(name, vertices);
      };
      getPathVertices = function(name) {
        return Maps.getPathVertices(name);
      };
      hideObject = function(name) {
        return Maps.hideObject(name);
      };
      showObject = function(name) {
        return Maps.showObject(name);
      };
      getObjectType = function(name) {
        return Maps.getObjectType(name);
      };
      createObject = function(object) {
        return Maps.createObject(object);
      };
      createObjects = function(objects) {
        return Maps.createObjects(objects);
      };
      getObject = function(name) {
        return Maps.getObject(name);
      };
      getObjects = function() {
        return Maps.getObjects();
      };
      deleteObject = function(name) {
        return Maps.deleteObject(name);
      };
      deleteObjects = function() {
        return Maps.deleteObjects();
      };
      deletePath = function(name) {
        return Maps.deletePath(name);
      };
      deletePaths = function() {
        return Maps.deletePaths();
      };
      setDraggable = function(name, draggable) {
        return Maps.setDraggable(name, draggable);
      };
      getDraggable = function(name) {
        return Maps.getDraggable(name);
      };
      getMyLatlng = function() {
        return Maps.getMyLatlng();
      };
      updateMyLatlng = function() {
        return Maps.updateMyLatlng();
      };
      mouseOn = function() {
        return Maps.mouseOn();
      };
      mouseOff = function() {
        return Maps.mouseOff();
      };
      return {
        name: "maps",
        prims: {
          "HIDE-MAP": hideMap,
          "SHOW-MAP": showMap,
          "IMPORT-FILE": importFile,
          "EXPORT-FILE": exportFile,
          "SET-ZOOM": setZoom,
          "GET-ZOOM": getZoom,
          "SET-CENTER-LATLNG": setCenterLatlng,
          "GET-CENTER-LATLNG": getCenterLatlng,
          "CREATE-MARKER": createMarker,
          "CREATE-MARKERS": createMarkers,
          "GET-MARKERS": getMarkers,
          "GET-MARKER": getMarker,
          "HIDE-OBJECT": hideObject,
          "SHOW-OBJECT": showObject,
          "SET-LAT": setLat,
          "SET-LNG": setLng,
          "SET-LATLNG": setLatlng,
          "GET-LAT": getLat,
          "GET-LNG": getLng,
          "GET-LATLNG": getLatlng,
          "DELETE-MARKER": deleteMarker,
          "DELETE-MARKERS": deleteMarkers,
          "LATLNG-TO-PATCH": latlngToPatch,
          "PATCH-TO-LATLNG": patchToLatlng,
          "OBJECT-EXISTS": objectExists,
          "SET-OPACITY": setOpacity,
          "GET-OPACITY": getOpacity,
          "BRING-TO-FRONT": bringToFront,
          "SEND-TO-BACK": sendToBack,
          "GET-MAP-OFFSET": getMapOffset,
          "SET-MAP-OFFSET": setMapOffset,
          "SET-ALL": setAll,
          "GET-ALL": getAll,
          "UPDATE-MAP": updateMap,
          "CREATE-PATH": createPath,
          "SET-PATH-COLOR": setPathColor,
          "GET-PATH-COLOR": getPathColor,
          "SET-PATH-VERTICES": setPathVertices,
          "GET-PATH-VERTICES": getPathVertices,
          "HIDE-OBJECT": hideObject,
          "SHOW-OBJECT": showObject,
          "GET-OBJECT-TYPE": getObjectType,
          "CREATE-OBJECT": createObject,
          "CREATE-OBJECTS": createObjects,
          "GET-OBJECT": getObject,
          "GET-OBJECTS": getObjects,
          "DELETE-OBJECT": deleteObject,
          "DELETE-OBJECTS": deleteObjects,
          "DELETE-PATH": deletePath,
          "DELETE-PATHS": deletePaths,
          "SET-DRAGGABLE": setDraggable,
          "GET-DRAGGABLE": getDraggable,
          "GET-MY-LATLNG": getMyLatlng,
          "UPDATE-MY-LATLNG": updateMyLatlng,
          "MOUSE-ON": mouseOn,
          "MOUSE-OFF": mouseOff
        }
      };
    }
  };

}).call(this);

},{}],"extensions/nlmap":[function(require,module,exports){
(function() {
  var isMap,
    hasProp = {}.hasOwnProperty;

  isMap = function(x) {
    return x._type === "ext_map";
  };

  module.exports = {
    dumper: {
      canDump: isMap,
      dump: function(x) {
        return "{{nlmap:  " + (JSON.stringify(x)) + "}}";
      }
    },
    init: function(workspace) {
      var add, fromList, get, jsonToMap, mapToJson, mapToUrlEncoded, newMap, remove, toList, toMap;
      newMap = function() {
        var out;
        out = {};
        return toMap(out);
      };
      toMap = function(obj) {
        Object.defineProperty(obj, "_type", {
          enumerable: false,
          value: "ext_map",
          writable: false
        });
        return obj;
      };
      fromList = function(list) {
        var i, k, len, out, ref, v;
        out = newMap();
        for (i = 0, len = list.length; i < len; i++) {
          ref = list[i], k = ref[0], v = ref[1];
          out[k] = v;
        }
        return out;
      };
      toList = function(extMap) {
        var k, results;
        results = [];
        for (k in extMap) {
          results.push([k, extMap[k]]);
        }
        return results;
      };
      add = function(extMap, key, value) {
        var k, out;
        out = newMap();
        for (k in extMap) {
          out[k] = extMap[k];
        }
        out[key] = value;
        return out;
      };
      get = function(extMap, key) {
        var ref;
        return (function() {
          if ((ref = extMap[key]) != null) {
            return ref;
          } else {
            throw new Error(key + " does not exist in this map");
          }
        })();
      };
      remove = function(extMap, key) {
        var k, out;
        out = newMap();
        for (k in extMap) {
          if (k !== key) {
            out[k] = extMap[k];
          }
        }
        return out;
      };
      mapToJson = function(nlmap) {
        if (nlmap._type !== "ext_map") {
          throw new Error("Only nlmap type values can be converted to JSON format.");
        }
        return JSON.stringify(nlmap);
      };
      mapToUrlEncoded = function(nlmap) {
        var key, kvps, value;
        if (nlmap._type !== "ext_map") {
          throw new Error("Only nlmap type values can be converted to URL format.");
        } else {
          kvps = [];
          for (key in nlmap) {
            if (!hasProp.call(nlmap, key)) continue;
            value = nlmap[key];
            if (typeof value !== 'object') {
              kvps.push((encodeURIComponent(key)) + "=" + (encodeURIComponent(value)));
            }
          }
          return kvps.join('&');
        }
      };
      jsonToMap = function(json) {
        return JSON.parse(json, function(key, value) {
          if (typeof value === 'object') {
            return toMap(value);
          } else {
            return value;
          }
        });
      };
      return {
        name: "nlmap",
        prims: {
          "FROM-LIST": fromList,
          "TO-LIST": toList,
          "IS-MAP?": isMap,
          "ADD": add,
          "GET": get,
          "REMOVE": remove,
          "TO-JSON": mapToJson,
          "TO-URLENC": mapToUrlEncoded,
          "FROM-JSON": jsonToMap
        }
      };
    }
  };

}).call(this);

},{}],"extensions/physics":[function(require,module,exports){
(function() {
  module.exports = {
    dumper: void 0,
    init: function(workspace) {
      var applyAngularImpulse, applyForce, applyForceRelativeAngle, applyLinearImpulse, applyLinearImpulseRelativeAngle, applyTorque, connectWhoToObject, createBody, createCircle, createLine, createObject, createObjects, createPolygon, createRectangle, createTarget, deleteObject, deleteObjects, deleteTargets, disconnectWho, exportWorld, getAll, getAngle, getAngularVelocity, getBehavior, getBodyId, getBodyXy, getCircleCenter, getCircleRadius, getCircleRelativeCenter, getConnected, getDensity, getFriction, getGravityXy, getLineEndpoints, getLineRelativeEndpoints, getLinearVelocity, getObject, getObjectType, getObjects, getPolygonRelativeVertices, getPolygonVertices, getPositionIterations, getRectangleCorners, getRectanglePatch, getRectangleRelativeCorners, getRestitution, getTargetRelativeXy, getTargetXy, getTick, getTimeStep, getVelocityIterations, getWorldOffset, getWrapXy, hideObject, hideObjects, hideToolbar, hideWorld, importWorld, objectExists, repaint, resetTicks, setAll, setAngle, setAngularVelocity, setBehavior, setBodyId, setBodyXy, setCircleCenter, setCircleRadius, setCircleRelativeCenter, setDensity, setFriction, setGravityXy, setLineEndpoints, setLineRelativeEndpoints, setLinearVelocity, setPolygonRelativeVertices, setPolygonVertices, setPositionIterations, setRectangleCorners, setRectanglePatch, setRectangleRelativeCorners, setRestitution, setTargetRelativeXy, setTargetXy, setTimeStep, setVelocityIterations, setWorldOffset, setWrapXy, showObject, showObjects, showToolbar, showWorld, tick, worldOff, worldOn;
      hideWorld = function() {
        return Physics.hideWorld();
      };
      showWorld = function() {
        return Physics.showWorld();
      };
      setGravityXy = function(data) {
        return Physics.setGravityXy(data);
      };
      getGravityXy = function() {
        return Physics.getGravityXy();
      };
      setWrapXy = function(data) {
        return Physics.setWrapXy(data);
      };
      getWrapXy = function() {
        return Physics.getWrapXy();
      };
      setTimeStep = function(time) {
        return Physics.setTimeStep(time);
      };
      getTimeStep = function() {
        return Physics.getTimeStep();
      };
      setVelocityIterations = function(iterations) {
        return Physics.setVelocityIterations(iterations);
      };
      getVelocityIterations = function() {
        return Physics.getVelocityIterations();
      };
      setPositionIterations = function(iterations) {
        return Physics.setPositionIterations(iterations);
      };
      getPositionIterations = function() {
        return Physics.getPositionIterations();
      };
      createBody = function(name) {
        return Physics.createBody(name);
      };
      setBehavior = function(name, behavior) {
        return Physics.setBehavior(name, behavior);
      };
      setBodyXy = function(name, coords) {
        return Physics.setBodyXy(name, coords);
      };
      setAngle = function(name, angle) {
        return Physics.setAngle(name, angle);
      };
      setLinearVelocity = function(name, coords) {
        return Physics.setLinearVelocity(name, coords);
      };
      setAngularVelocity = function(name, velocity) {
        return Physics.setAngularVelocity(name, velocity);
      };
      getBehavior = function(name) {
        return Physics.getBehavior(name);
      };
      getBodyXy = function(name) {
        return Physics.getBodyXy(name);
      };
      getAngle = function(name) {
        return Physics.getAngle(name);
      };
      getLinearVelocity = function(name) {
        return Physics.getLinearVelocity(name);
      };
      getAngularVelocity = function(name) {
        return Physics.getAngularVelocity(name);
      };
      setFriction = function(name, friction) {
        return Physics.setFriction(name, friction);
      };
      setDensity = function(name, density) {
        return Physics.setDensity(name, density);
      };
      setRestitution = function(name, restitution) {
        return Physics.setRestitution(name, restitution);
      };
      getFriction = function(name) {
        return Physics.getFriction(name);
      };
      getDensity = function(name) {
        return Physics.getDensity(name);
      };
      getRestitution = function(name) {
        return Physics.getRestitution(name);
      };
      createLine = function(name, body) {
        return Physics.createLine(name, body);
      };
      setLineRelativeEndpoints = function(name, endpoints) {
        return Physics.setLineRelativeEndpoints(name, endpoints);
      };
      setLineEndpoints = function(name, endpoints) {
        return Physics.setLineEndpoints(name, endpoints);
      };
      getLineRelativeEndpoints = function(name) {
        return Physics.getLineRelativeEndpoints(name);
      };
      getLineEndpoints = function(name) {
        return Physics.getLineEndpoints(name);
      };
      createCircle = function(name, body) {
        return Physics.createCircle(name, body);
      };
      setCircleRadius = function(name, radius) {
        return Physics.setCircleRadius(name, radius);
      };
      setCircleRelativeCenter = function(name, center) {
        return Physics.setCircleRelativeCenter(name, center);
      };
      setCircleCenter = function(name, center) {
        return Physics.setCircleCenter(name, center);
      };
      getCircleRadius = function(name) {
        return Physics.getCircleRadius(name);
      };
      getCircleRelativeCenter = function(name) {
        return Physics.getCircleRelativeCenter(name);
      };
      getCircleCenter = function(name) {
        return Physics.getCircleCenter(name);
      };
      createPolygon = function(name, body) {
        return Physics.createPolygon(name, body);
      };
      setPolygonRelativeVertices = function(name, vertices) {
        return Physics.setPolygonRelativeVertices(name, vertices);
      };
      setPolygonVertices = function(name, vertices) {
        return Physics.setPolygonVertices(name, vertices);
      };
      getPolygonRelativeVertices = function(name) {
        return Physics.getPolygonRelativeVertices(name);
      };
      getPolygonVertices = function(name) {
        return Physics.getPolygonVertices(name);
      };
      createTarget = function(name, body) {
        return Physics.createTarget(name, body);
      };
      setTargetRelativeXy = function(name, center) {
        return Physics.setTargetRelativeXy(name, center);
      };
      setTargetXy = function(name, center) {
        return Physics.setTargetXy(name, center);
      };
      getTargetRelativeXy = function(name) {
        return Physics.getTargetRelativeXy(name);
      };
      getTargetXy = function(name) {
        return Physics.getTargetXy(name);
      };
      setBodyId = function(name, body) {
        return Physics.setBodyId(name, body);
      };
      getBodyId = function(name) {
        return Physics.getBodyId(name);
      };
      createObjects = function(data) {
        return Physics.createObjects(data);
      };
      createObject = function(data) {
        return Physics.createObject(data);
      };
      getObjects = function() {
        return Physics.getObjects();
      };
      getObject = function(name) {
        return Physics.getObject(name);
      };
      getObjectType = function(name) {
        return Physics.getObjectType(name);
      };
      deleteObject = function(name) {
        return Physics.deleteObject(name);
      };
      deleteTargets = function() {
        return Physics.deleteTargets();
      };
      deleteObjects = function() {
        return Physics.deleteObjects();
      };
      applyForce = function(name, force, angle) {
        return Physics.applyForce(name, force, angle);
      };
      applyForceRelativeAngle = function(name, force, angle) {
        return Physics.applyForceRelativeAngle(name, force, angle);
      };
      applyLinearImpulse = function(name, force, angle) {
        return Physics.applyLinearImpulse(name, force, angle);
      };
      applyLinearImpulseRelativeAngle = function(name, force, angle) {
        return Physics.applyLinearImpulseRelativeAngle(name, force, angle);
      };
      applyTorque = function(name, force) {
        return Physics.applyTorque(name, force);
      };
      applyAngularImpulse = function(name, force) {
        return Physics.applyAngularImpulse(name, force);
      };
      connectWhoToObject = function(who, name) {
        return Physics.connectWhoToObject(who, name);
      };
      disconnectWho = function(who) {
        return Physics.disconnectWho(who);
      };
      worldOn = function() {
        return Physics.worldOn();
      };
      worldOff = function() {
        return Physics.worldOff();
      };
      objectExists = function(name) {
        return Physics.objectExists(name);
      };
      getConnected = function() {
        return Physics.getConnected();
      };
      resetTicks = function() {
        return Physics.resetTicks();
      };
      tick = function() {
        return Physics.tick();
      };
      getTick = function() {
        return Physics.getTick();
      };
      repaint = function() {
        return Physics.repaint();
      };
      createRectangle = function(name, body) {
        return Physics.createRectangle(name, body);
      };
      setRectangleRelativeCorners = function(name, vertices) {
        return Physics.setRectangleRelativeCorners(name, vertices);
      };
      setRectangleCorners = function(name, vertices) {
        return Physics.setRectangleCorners(name, vertices);
      };
      getRectangleRelativeCorners = function(name) {
        return Physics.getRectangleRelativeCorners(name);
      };
      getRectangleCorners = function(name) {
        return Physics.getRectangleCorners(name);
      };
      showObject = function(name) {
        return Physics.showObject(name);
      };
      hideObject = function(name) {
        return Physics.hideObject(name);
      };
      showObjects = function() {
        return Physics.showObjects();
      };
      hideObjects = function() {
        return Physics.hideObjects();
      };
      exportWorld = function(filename) {
        return Physics.exportWorld(filename);
      };
      importWorld = function(filename) {
        return Physics.importWorld(filename);
      };
      setRectanglePatch = function(name, coords) {
        return Physics.setRectanglePatch(name, coords);
      };
      getRectanglePatch = function(name) {
        return Physics.getRectanglePatch(name);
      };
      getWorldOffset = function() {
        return Physics.getWorldOffset();
      };
      setWorldOffset = function(offset) {
        return Physics.setWorldOffset(offset);
      };
      setAll = function(data) {
        return Physics.setAll(data);
      };
      getAll = function() {
        return Physics.getAll();
      };
      showToolbar = function() {
        return Physics.showToolbar();
      };
      hideToolbar = function() {
        return Physics.hideToolbar();
      };
      return {
        name: "physics",
        prims: {
          "HIDE-WORLD": hideWorld,
          "SHOW-WORLD": showWorld,
          "SET-GRAVITY-XY": setGravityXy,
          "GET-GRAVITY-XY": getGravityXy,
          "SET-WRAP-XY": setWrapXy,
          "GET-WRAP-XY": getWrapXy,
          "SET-TIME-STEP": setTimeStep,
          "GET-TIME-STEP": getTimeStep,
          "SET-VELOCITY-ITERATIONS": setVelocityIterations,
          "GET-VELOCITY-ITERATIONS": getVelocityIterations,
          "SET-POSITION-ITERATIONS": setPositionIterations,
          "GET-POSITION-ITERATIONS": getPositionIterations,
          "CREATE-BODY": createBody,
          "SET-BEHAVIOR": setBehavior,
          "SET-BODY-XY": setBodyXy,
          "SET-ANGLE": setAngle,
          "SET-LINEAR-VELOCITY": setLinearVelocity,
          "SET-ANGULAR-VELOCITY": setAngularVelocity,
          "GET-BEHAVIOR": getBehavior,
          "GET-BODY-XY": getBodyXy,
          "GET-ANGLE": getAngle,
          "GET-LINEAR-VELOCITY": getLinearVelocity,
          "GET-ANGULAR-VELOCITY": getAngularVelocity,
          "SET-FRICTION": setFriction,
          "SET-DENSITY": setDensity,
          "SET-RESTITUTION": setRestitution,
          "GET-FRICTION": getFriction,
          "GET-DENSITY": getDensity,
          "GET-RESTITUTION": getRestitution,
          "CREATE-LINE": createLine,
          "SET-LINE-RELATIVE-ENDPOINTS": setLineRelativeEndpoints,
          "SET-LINE-ENDPOINTS": setLineEndpoints,
          "GET-LINE-RELATIVE-ENDPOINTS": getLineRelativeEndpoints,
          "GET-LINE-ENDPOINTS": getLineEndpoints,
          "CREATE-CIRCLE": createCircle,
          "SET-CIRCLE-RADIUS": setCircleRadius,
          "SET-CIRCLE-RELATIVE-CENTER": setCircleRelativeCenter,
          "SET-CIRCLE-CENTER": setCircleCenter,
          "GET-CIRCLE-RADIUS": getCircleRadius,
          "GET-CIRCLE-RELATIVE-CENTER": getCircleRelativeCenter,
          "GET-CIRCLE-CENTER": getCircleCenter,
          "CREATE-POLYGON": createPolygon,
          "SET-POLYGON-RELATIVE-VERTICES": setPolygonRelativeVertices,
          "SET-POLYGON-VERTICES": setPolygonVertices,
          "GET-POLYGON-RELATIVE-VERTICES": getPolygonRelativeVertices,
          "GET-POLYGON-VERTICES": getPolygonVertices,
          "CREATE-TARGET": createTarget,
          "SET-TARGET-RELATIVE-XY": setTargetRelativeXy,
          "SET-TARGET-XY": setTargetXy,
          "GET-TARGET-RELATIVE-XY": getTargetRelativeXy,
          "GET-TARGET-XY": getTargetXy,
          "SET-BODY-ID": setBodyId,
          "GET-BODY-ID": getBodyId,
          "CREATE-OBJECTS": createObjects,
          "CREATE-OBJECT": createObject,
          "GET-OBJECTS": getObjects,
          "GET-OBJECT": getObject,
          "GET-OBJECT-TYPE": getObjectType,
          "DELETE-OBJECT": deleteObject,
          "DELETE-TARGETS": deleteTargets,
          "DELETE-OBJECTS": deleteObjects,
          "APPLY-FORCE": applyForce,
          "APPLY-FORCE-RELATIVE-ANGLE": applyForceRelativeAngle,
          "APPLY-LINEAR-IMPULSE": applyLinearImpulse,
          "APPLY-LINEAR-IMPULSE-RELATIVE-ANGLE": applyLinearImpulseRelativeAngle,
          "APPLY-TORQUE": applyTorque,
          "APPLY-ANGULAR-IMPULSE": applyAngularImpulse,
          "CONNECT-WHO-TO-OBJECT": connectWhoToObject,
          "DISCONNECT-WHO": disconnectWho,
          "WORLD-ON": worldOn,
          "WORLD-OFF": worldOff,
          "OBJECT-EXISTS": objectExists,
          "GET-CONNECTED": getConnected,
          "RESET-TICKS": resetTicks,
          "TICK": tick,
          "GET-TICK": getTick,
          "REPAINT": repaint,
          "CREATE-RECTANGLE": createRectangle,
          "SET-RECTANGLE-RELATIVE-CORNERS": setRectangleRelativeCorners,
          "SET-RECTANGLE-CORNERS": setRectangleCorners,
          "GET-RECTANGLE-RELATIVE-CORNERS": getRectangleRelativeCorners,
          "GET-RECTANGLE-CORNERS": getRectangleCorners,
          "SHOW-OBJECT": showObject,
          "HIDE-OBJECT": hideObject,
          "SHOW-OBJECTS": showObjects,
          "HIDE-OBJECTS": hideObjects,
          "EXPORT-WORLD": exportWorld,
          "IMPORT-WORLD": importWorld,
          "SET-RECTANGLE-PATCH": setRectanglePatch,
          "GET-RECTANGLE-PATCH": getRectanglePatch,
          "GET-WORLD-OFFSET": getWorldOffset,
          "SET-WORLD-OFFSET": setWorldOffset,
          "SET-ALL": setAll,
          "GET-ALL": getAll,
          "SHOW-TOOLBAR": showToolbar,
          "HIDE-TOOLBAR": hideToolbar
        }
      };
    }
  };

}).call(this);

},{}],"meta":[function(require,module,exports){
(function() {
  module.exports = {
    isApplet: false,
    isWeb: true,
    behaviorSpaceName: "",
    behaviorSpaceRun: 0,
    version: "1.0"
  };

}).call(this);

},{}],"mori":[function(require,module,exports){
(function(definition){if(typeof exports==="object"){module.exports=definition();}else if(typeof define==="function"&&define.amd){define(definition);}else{mori=definition();}})(function(){return function(){
if(typeof Math.imul == "undefined" || (Math.imul(0xffffffff,5) == 0)) {
    Math.imul = function (a, b) {
        var ah  = (a >>> 16) & 0xffff;
        var al = a & 0xffff;
        var bh  = (b >>> 16) & 0xffff;
        var bl = b & 0xffff;
        // the shift by 0 fixes the sign on the high part
        // the final |0 converts the unsigned value into a signed value
        return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
    }
}

var k,aa=this;
function n(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}var ba="closure_uid_"+(1E9*Math.random()>>>0),ca=0;function r(a,b){var c=a.split("."),d=aa;c[0]in d||!d.execScript||d.execScript("var "+c[0]);for(var e;c.length&&(e=c.shift());)c.length||void 0===b?d=d[e]?d[e]:d[e]={}:d[e]=b};function da(a){return Array.prototype.join.call(arguments,"")};function ea(a,b){for(var c in a)b.call(void 0,a[c],c,a)};function fa(a,b){null!=a&&this.append.apply(this,arguments)}fa.prototype.Za="";fa.prototype.append=function(a,b,c){this.Za+=a;if(null!=b)for(var d=1;d<arguments.length;d++)this.Za+=arguments[d];return this};fa.prototype.clear=function(){this.Za=""};fa.prototype.toString=function(){return this.Za};function ga(a,b){a.sort(b||ha)}function ia(a,b){for(var c=0;c<a.length;c++)a[c]={index:c,value:a[c]};var d=b||ha;ga(a,function(a,b){return d(a.value,b.value)||a.index-b.index});for(c=0;c<a.length;c++)a[c]=a[c].value}function ha(a,b){return a>b?1:a<b?-1:0};var ja;if("undefined"===typeof ka)var ka=function(){throw Error("No *print-fn* fn set for evaluation environment");};var la=null,ma=null;if("undefined"===typeof na)var na=null;function oa(){return new pa(null,5,[sa,!0,ua,!0,wa,!1,ya,!1,za,la],null)}function t(a){return null!=a&&!1!==a}function Aa(a){return t(a)?!1:!0}function w(a,b){return a[n(null==b?null:b)]?!0:a._?!0:!1}function Ba(a){return null==a?null:a.constructor}
function x(a,b){var c=Ba(b),c=t(t(c)?c.Yb:c)?c.Xb:n(b);return Error(["No protocol method ",a," defined for type ",c,": ",b].join(""))}function Da(a){var b=a.Xb;return t(b)?b:""+z(a)}var Ea="undefined"!==typeof Symbol&&"function"===n(Symbol)?Symbol.Cc:"@@iterator";function Fa(a){for(var b=a.length,c=Array(b),d=0;;)if(d<b)c[d]=a[d],d+=1;else break;return c}function Ha(a){for(var b=Array(arguments.length),c=0;;)if(c<b.length)b[c]=arguments[c],c+=1;else return b}
var Ia=function(){function a(a,b){function c(a,b){a.push(b);return a}var g=[];return A.c?A.c(c,g,b):A.call(null,c,g,b)}function b(a){return c.a(null,a)}var c=null,c=function(d,c){switch(arguments.length){case 1:return b.call(this,d);case 2:return a.call(this,0,c)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Ja={},La={};function Ma(a){if(a?a.L:a)return a.L(a);var b;b=Ma[n(null==a?null:a)];if(!b&&(b=Ma._,!b))throw x("ICounted.-count",a);return b.call(null,a)}
function Na(a){if(a?a.J:a)return a.J(a);var b;b=Na[n(null==a?null:a)];if(!b&&(b=Na._,!b))throw x("IEmptyableCollection.-empty",a);return b.call(null,a)}var Qa={};function Ra(a,b){if(a?a.G:a)return a.G(a,b);var c;c=Ra[n(null==a?null:a)];if(!c&&(c=Ra._,!c))throw x("ICollection.-conj",a);return c.call(null,a,b)}
var Ta={},C=function(){function a(a,b,c){if(a?a.$:a)return a.$(a,b,c);var g;g=C[n(null==a?null:a)];if(!g&&(g=C._,!g))throw x("IIndexed.-nth",a);return g.call(null,a,b,c)}function b(a,b){if(a?a.Q:a)return a.Q(a,b);var c;c=C[n(null==a?null:a)];if(!c&&(c=C._,!c))throw x("IIndexed.-nth",a);return c.call(null,a,b)}var c=null,c=function(d,c,f){switch(arguments.length){case 2:return b.call(this,d,c);case 3:return a.call(this,d,c,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),
Ua={};function Va(a){if(a?a.N:a)return a.N(a);var b;b=Va[n(null==a?null:a)];if(!b&&(b=Va._,!b))throw x("ISeq.-first",a);return b.call(null,a)}function Wa(a){if(a?a.S:a)return a.S(a);var b;b=Wa[n(null==a?null:a)];if(!b&&(b=Wa._,!b))throw x("ISeq.-rest",a);return b.call(null,a)}
var Xa={},Za={},$a=function(){function a(a,b,c){if(a?a.s:a)return a.s(a,b,c);var g;g=$a[n(null==a?null:a)];if(!g&&(g=$a._,!g))throw x("ILookup.-lookup",a);return g.call(null,a,b,c)}function b(a,b){if(a?a.t:a)return a.t(a,b);var c;c=$a[n(null==a?null:a)];if(!c&&(c=$a._,!c))throw x("ILookup.-lookup",a);return c.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=
a;return c}(),ab={};function bb(a,b){if(a?a.rb:a)return a.rb(a,b);var c;c=bb[n(null==a?null:a)];if(!c&&(c=bb._,!c))throw x("IAssociative.-contains-key?",a);return c.call(null,a,b)}function cb(a,b,c){if(a?a.Ka:a)return a.Ka(a,b,c);var d;d=cb[n(null==a?null:a)];if(!d&&(d=cb._,!d))throw x("IAssociative.-assoc",a);return d.call(null,a,b,c)}var db={};function eb(a,b){if(a?a.wb:a)return a.wb(a,b);var c;c=eb[n(null==a?null:a)];if(!c&&(c=eb._,!c))throw x("IMap.-dissoc",a);return c.call(null,a,b)}var fb={};
function hb(a){if(a?a.hb:a)return a.hb(a);var b;b=hb[n(null==a?null:a)];if(!b&&(b=hb._,!b))throw x("IMapEntry.-key",a);return b.call(null,a)}function ib(a){if(a?a.ib:a)return a.ib(a);var b;b=ib[n(null==a?null:a)];if(!b&&(b=ib._,!b))throw x("IMapEntry.-val",a);return b.call(null,a)}var jb={};function kb(a,b){if(a?a.Eb:a)return a.Eb(a,b);var c;c=kb[n(null==a?null:a)];if(!c&&(c=kb._,!c))throw x("ISet.-disjoin",a);return c.call(null,a,b)}
function lb(a){if(a?a.La:a)return a.La(a);var b;b=lb[n(null==a?null:a)];if(!b&&(b=lb._,!b))throw x("IStack.-peek",a);return b.call(null,a)}function mb(a){if(a?a.Ma:a)return a.Ma(a);var b;b=mb[n(null==a?null:a)];if(!b&&(b=mb._,!b))throw x("IStack.-pop",a);return b.call(null,a)}var nb={};function pb(a,b,c){if(a?a.Ua:a)return a.Ua(a,b,c);var d;d=pb[n(null==a?null:a)];if(!d&&(d=pb._,!d))throw x("IVector.-assoc-n",a);return d.call(null,a,b,c)}
function qb(a){if(a?a.Ra:a)return a.Ra(a);var b;b=qb[n(null==a?null:a)];if(!b&&(b=qb._,!b))throw x("IDeref.-deref",a);return b.call(null,a)}var rb={};function sb(a){if(a?a.H:a)return a.H(a);var b;b=sb[n(null==a?null:a)];if(!b&&(b=sb._,!b))throw x("IMeta.-meta",a);return b.call(null,a)}var tb={};function ub(a,b){if(a?a.F:a)return a.F(a,b);var c;c=ub[n(null==a?null:a)];if(!c&&(c=ub._,!c))throw x("IWithMeta.-with-meta",a);return c.call(null,a,b)}
var vb={},wb=function(){function a(a,b,c){if(a?a.O:a)return a.O(a,b,c);var g;g=wb[n(null==a?null:a)];if(!g&&(g=wb._,!g))throw x("IReduce.-reduce",a);return g.call(null,a,b,c)}function b(a,b){if(a?a.R:a)return a.R(a,b);var c;c=wb[n(null==a?null:a)];if(!c&&(c=wb._,!c))throw x("IReduce.-reduce",a);return c.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}();
function xb(a,b,c){if(a?a.gb:a)return a.gb(a,b,c);var d;d=xb[n(null==a?null:a)];if(!d&&(d=xb._,!d))throw x("IKVReduce.-kv-reduce",a);return d.call(null,a,b,c)}function yb(a,b){if(a?a.A:a)return a.A(a,b);var c;c=yb[n(null==a?null:a)];if(!c&&(c=yb._,!c))throw x("IEquiv.-equiv",a);return c.call(null,a,b)}function zb(a){if(a?a.B:a)return a.B(a);var b;b=zb[n(null==a?null:a)];if(!b&&(b=zb._,!b))throw x("IHash.-hash",a);return b.call(null,a)}var Bb={};
function Cb(a){if(a?a.D:a)return a.D(a);var b;b=Cb[n(null==a?null:a)];if(!b&&(b=Cb._,!b))throw x("ISeqable.-seq",a);return b.call(null,a)}var Db={},Eb={},Fb={};function Gb(a){if(a?a.ab:a)return a.ab(a);var b;b=Gb[n(null==a?null:a)];if(!b&&(b=Gb._,!b))throw x("IReversible.-rseq",a);return b.call(null,a)}function Hb(a,b){if(a?a.Hb:a)return a.Hb(a,b);var c;c=Hb[n(null==a?null:a)];if(!c&&(c=Hb._,!c))throw x("ISorted.-sorted-seq",a);return c.call(null,a,b)}
function Ib(a,b,c){if(a?a.Ib:a)return a.Ib(a,b,c);var d;d=Ib[n(null==a?null:a)];if(!d&&(d=Ib._,!d))throw x("ISorted.-sorted-seq-from",a);return d.call(null,a,b,c)}function Jb(a,b){if(a?a.Gb:a)return a.Gb(a,b);var c;c=Jb[n(null==a?null:a)];if(!c&&(c=Jb._,!c))throw x("ISorted.-entry-key",a);return c.call(null,a,b)}function Kb(a){if(a?a.Fb:a)return a.Fb(a);var b;b=Kb[n(null==a?null:a)];if(!b&&(b=Kb._,!b))throw x("ISorted.-comparator",a);return b.call(null,a)}
function Lb(a,b){if(a?a.Wb:a)return a.Wb(0,b);var c;c=Lb[n(null==a?null:a)];if(!c&&(c=Lb._,!c))throw x("IWriter.-write",a);return c.call(null,a,b)}var Mb={};function Nb(a,b,c){if(a?a.v:a)return a.v(a,b,c);var d;d=Nb[n(null==a?null:a)];if(!d&&(d=Nb._,!d))throw x("IPrintWithWriter.-pr-writer",a);return d.call(null,a,b,c)}function Ob(a){if(a?a.$a:a)return a.$a(a);var b;b=Ob[n(null==a?null:a)];if(!b&&(b=Ob._,!b))throw x("IEditableCollection.-as-transient",a);return b.call(null,a)}
function Pb(a,b){if(a?a.Sa:a)return a.Sa(a,b);var c;c=Pb[n(null==a?null:a)];if(!c&&(c=Pb._,!c))throw x("ITransientCollection.-conj!",a);return c.call(null,a,b)}function Qb(a){if(a?a.Ta:a)return a.Ta(a);var b;b=Qb[n(null==a?null:a)];if(!b&&(b=Qb._,!b))throw x("ITransientCollection.-persistent!",a);return b.call(null,a)}function Rb(a,b,c){if(a?a.kb:a)return a.kb(a,b,c);var d;d=Rb[n(null==a?null:a)];if(!d&&(d=Rb._,!d))throw x("ITransientAssociative.-assoc!",a);return d.call(null,a,b,c)}
function Sb(a,b){if(a?a.Jb:a)return a.Jb(a,b);var c;c=Sb[n(null==a?null:a)];if(!c&&(c=Sb._,!c))throw x("ITransientMap.-dissoc!",a);return c.call(null,a,b)}function Tb(a,b,c){if(a?a.Ub:a)return a.Ub(0,b,c);var d;d=Tb[n(null==a?null:a)];if(!d&&(d=Tb._,!d))throw x("ITransientVector.-assoc-n!",a);return d.call(null,a,b,c)}function Ub(a){if(a?a.Vb:a)return a.Vb();var b;b=Ub[n(null==a?null:a)];if(!b&&(b=Ub._,!b))throw x("ITransientVector.-pop!",a);return b.call(null,a)}
function Vb(a,b){if(a?a.Tb:a)return a.Tb(0,b);var c;c=Vb[n(null==a?null:a)];if(!c&&(c=Vb._,!c))throw x("ITransientSet.-disjoin!",a);return c.call(null,a,b)}function Xb(a){if(a?a.Pb:a)return a.Pb();var b;b=Xb[n(null==a?null:a)];if(!b&&(b=Xb._,!b))throw x("IChunk.-drop-first",a);return b.call(null,a)}function Yb(a){if(a?a.Cb:a)return a.Cb(a);var b;b=Yb[n(null==a?null:a)];if(!b&&(b=Yb._,!b))throw x("IChunkedSeq.-chunked-first",a);return b.call(null,a)}
function Zb(a){if(a?a.Db:a)return a.Db(a);var b;b=Zb[n(null==a?null:a)];if(!b&&(b=Zb._,!b))throw x("IChunkedSeq.-chunked-rest",a);return b.call(null,a)}function $b(a){if(a?a.Bb:a)return a.Bb(a);var b;b=$b[n(null==a?null:a)];if(!b&&(b=$b._,!b))throw x("IChunkedNext.-chunked-next",a);return b.call(null,a)}function ac(a,b){if(a?a.bb:a)return a.bb(0,b);var c;c=ac[n(null==a?null:a)];if(!c&&(c=ac._,!c))throw x("IVolatile.-vreset!",a);return c.call(null,a,b)}var bc={};
function cc(a){if(a?a.fb:a)return a.fb(a);var b;b=cc[n(null==a?null:a)];if(!b&&(b=cc._,!b))throw x("IIterable.-iterator",a);return b.call(null,a)}function dc(a){this.qc=a;this.q=0;this.j=1073741824}dc.prototype.Wb=function(a,b){return this.qc.append(b)};function ec(a){var b=new fa;a.v(null,new dc(b),oa());return""+z(b)}
var fc="undefined"!==typeof Math.imul&&0!==(Math.imul.a?Math.imul.a(4294967295,5):Math.imul.call(null,4294967295,5))?function(a,b){return Math.imul.a?Math.imul.a(a,b):Math.imul.call(null,a,b)}:function(a,b){var c=a&65535,d=b&65535;return c*d+((a>>>16&65535)*d+c*(b>>>16&65535)<<16>>>0)|0};function gc(a){a=fc(a,3432918353);return fc(a<<15|a>>>-15,461845907)}function hc(a,b){var c=a^b;return fc(c<<13|c>>>-13,5)+3864292196}
function ic(a,b){var c=a^b,c=fc(c^c>>>16,2246822507),c=fc(c^c>>>13,3266489909);return c^c>>>16}var kc={},lc=0;function mc(a){255<lc&&(kc={},lc=0);var b=kc[a];if("number"!==typeof b){a:if(null!=a)if(b=a.length,0<b){for(var c=0,d=0;;)if(c<b)var e=c+1,d=fc(31,d)+a.charCodeAt(c),c=e;else{b=d;break a}b=void 0}else b=0;else b=0;kc[a]=b;lc+=1}return a=b}
function nc(a){a&&(a.j&4194304||a.vc)?a=a.B(null):"number"===typeof a?a=(Math.floor.b?Math.floor.b(a):Math.floor.call(null,a))%2147483647:!0===a?a=1:!1===a?a=0:"string"===typeof a?(a=mc(a),0!==a&&(a=gc(a),a=hc(0,a),a=ic(a,4))):a=a instanceof Date?a.valueOf():null==a?0:zb(a);return a}
function oc(a){var b;b=a.name;var c;a:{c=1;for(var d=0;;)if(c<b.length){var e=c+2,d=hc(d,gc(b.charCodeAt(c-1)|b.charCodeAt(c)<<16));c=e}else{c=d;break a}c=void 0}c=1===(b.length&1)?c^gc(b.charCodeAt(b.length-1)):c;b=ic(c,fc(2,b.length));a=mc(a.ba);return b^a+2654435769+(b<<6)+(b>>2)}function pc(a,b){if(a.ta===b.ta)return 0;var c=Aa(a.ba);if(t(c?b.ba:c))return-1;if(t(a.ba)){if(Aa(b.ba))return 1;c=ha(a.ba,b.ba);return 0===c?ha(a.name,b.name):c}return ha(a.name,b.name)}
function qc(a,b,c,d,e){this.ba=a;this.name=b;this.ta=c;this.Ya=d;this.Z=e;this.j=2154168321;this.q=4096}k=qc.prototype;k.v=function(a,b){return Lb(b,this.ta)};k.B=function(){var a=this.Ya;return null!=a?a:this.Ya=a=oc(this)};k.F=function(a,b){return new qc(this.ba,this.name,this.ta,this.Ya,b)};k.H=function(){return this.Z};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return $a.c(c,this,null);case 3:return $a.c(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return $a.c(c,this,null)};a.c=function(a,c,d){return $a.c(c,this,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.b=function(a){return $a.c(a,this,null)};k.a=function(a,b){return $a.c(a,this,b)};k.A=function(a,b){return b instanceof qc?this.ta===b.ta:!1};
k.toString=function(){return this.ta};var rc=function(){function a(a,b){var c=null!=a?[z(a),z("/"),z(b)].join(""):b;return new qc(a,b,c,null,null)}function b(a){return a instanceof qc?a:c.a(null,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}();
function D(a){if(null==a)return null;if(a&&(a.j&8388608||a.mc))return a.D(null);if(a instanceof Array||"string"===typeof a)return 0===a.length?null:new F(a,0);if(w(Bb,a))return Cb(a);throw Error([z(a),z(" is not ISeqable")].join(""));}function G(a){if(null==a)return null;if(a&&(a.j&64||a.jb))return a.N(null);a=D(a);return null==a?null:Va(a)}function H(a){return null!=a?a&&(a.j&64||a.jb)?a.S(null):(a=D(a))?Wa(a):J:J}function K(a){return null==a?null:a&&(a.j&128||a.xb)?a.T(null):D(H(a))}
var sc=function(){function a(a,b){return null==a?null==b:a===b||yb(a,b)}var b=null,c=function(){function a(b,d,h){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return c.call(this,b,d,l)}function c(a,d,e){for(;;)if(b.a(a,d))if(K(e))a=d,d=G(e),e=K(e);else return b.a(d,G(e));else return!1}a.i=2;a.f=function(a){var b=G(a);a=K(a);var d=G(a);a=H(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return!0;
case 2:return a.call(this,b,e);default:var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new F(h,0)}return c.d(b,e,g)}throw Error("Invalid arity: "+arguments.length);};b.i=2;b.f=c.f;b.b=function(){return!0};b.a=a;b.d=c.d;return b}();function tc(a){this.C=a}tc.prototype.next=function(){if(null!=this.C){var a=G(this.C);this.C=K(this.C);return{done:!1,value:a}}return{done:!0,value:null}};function uc(a){return new tc(D(a))}
function vc(a,b){var c=gc(a),c=hc(0,c);return ic(c,b)}function wc(a){var b=0,c=1;for(a=D(a);;)if(null!=a)b+=1,c=fc(31,c)+nc(G(a))|0,a=K(a);else return vc(c,b)}function xc(a){var b=0,c=0;for(a=D(a);;)if(null!=a)b+=1,c=c+nc(G(a))|0,a=K(a);else return vc(c,b)}La["null"]=!0;Ma["null"]=function(){return 0};Date.prototype.A=function(a,b){return b instanceof Date&&this.toString()===b.toString()};yb.number=function(a,b){return a===b};rb["function"]=!0;sb["function"]=function(){return null};
Ja["function"]=!0;zb._=function(a){return a[ba]||(a[ba]=++ca)};function yc(a){this.o=a;this.q=0;this.j=32768}yc.prototype.Ra=function(){return this.o};function Ac(a){return a instanceof yc}function Bc(a){return Ac(a)?L.b?L.b(a):L.call(null,a):a}function L(a){return qb(a)}
var Cc=function(){function a(a,b,c,d){for(var l=Ma(a);;)if(d<l){var m=C.a(a,d);c=b.a?b.a(c,m):b.call(null,c,m);if(Ac(c))return qb(c);d+=1}else return c}function b(a,b,c){var d=Ma(a),l=c;for(c=0;;)if(c<d){var m=C.a(a,c),l=b.a?b.a(l,m):b.call(null,l,m);if(Ac(l))return qb(l);c+=1}else return l}function c(a,b){var c=Ma(a);if(0===c)return b.l?b.l():b.call(null);for(var d=C.a(a,0),l=1;;)if(l<c){var m=C.a(a,l),d=b.a?b.a(d,m):b.call(null,d,m);if(Ac(d))return qb(d);l+=1}else return d}var d=null,d=function(d,
f,g,h){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,g);case 4:return a.call(this,d,f,g,h)}throw Error("Invalid arity: "+arguments.length);};d.a=c;d.c=b;d.n=a;return d}(),Dc=function(){function a(a,b,c,d){for(var l=a.length;;)if(d<l){var m=a[d];c=b.a?b.a(c,m):b.call(null,c,m);if(Ac(c))return qb(c);d+=1}else return c}function b(a,b,c){var d=a.length,l=c;for(c=0;;)if(c<d){var m=a[c],l=b.a?b.a(l,m):b.call(null,l,m);if(Ac(l))return qb(l);c+=1}else return l}function c(a,
b){var c=a.length;if(0===a.length)return b.l?b.l():b.call(null);for(var d=a[0],l=1;;)if(l<c){var m=a[l],d=b.a?b.a(d,m):b.call(null,d,m);if(Ac(d))return qb(d);l+=1}else return d}var d=null,d=function(d,f,g,h){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,g);case 4:return a.call(this,d,f,g,h)}throw Error("Invalid arity: "+arguments.length);};d.a=c;d.c=b;d.n=a;return d}();function Ec(a){return a?a.j&2||a.cc?!0:a.j?!1:w(La,a):w(La,a)}
function Fc(a){return a?a.j&16||a.Qb?!0:a.j?!1:w(Ta,a):w(Ta,a)}function Gc(a,b){this.e=a;this.m=b}Gc.prototype.ga=function(){return this.m<this.e.length};Gc.prototype.next=function(){var a=this.e[this.m];this.m+=1;return a};function F(a,b){this.e=a;this.m=b;this.j=166199550;this.q=8192}k=F.prototype;k.toString=function(){return ec(this)};k.Q=function(a,b){var c=b+this.m;return c<this.e.length?this.e[c]:null};k.$=function(a,b,c){a=b+this.m;return a<this.e.length?this.e[a]:c};k.vb=!0;
k.fb=function(){return new Gc(this.e,this.m)};k.T=function(){return this.m+1<this.e.length?new F(this.e,this.m+1):null};k.L=function(){return this.e.length-this.m};k.ab=function(){var a=Ma(this);return 0<a?new Hc(this,a-1,null):null};k.B=function(){return wc(this)};k.A=function(a,b){return Ic.a?Ic.a(this,b):Ic.call(null,this,b)};k.J=function(){return J};k.R=function(a,b){return Dc.n(this.e,b,this.e[this.m],this.m+1)};k.O=function(a,b,c){return Dc.n(this.e,b,c,this.m)};k.N=function(){return this.e[this.m]};
k.S=function(){return this.m+1<this.e.length?new F(this.e,this.m+1):J};k.D=function(){return this};k.G=function(a,b){return M.a?M.a(b,this):M.call(null,b,this)};F.prototype[Ea]=function(){return uc(this)};
var Jc=function(){function a(a,b){return b<a.length?new F(a,b):null}function b(a){return c.a(a,0)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Kc=function(){function a(a,b){return Jc.a(a,b)}function b(a){return Jc.a(a,0)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+
arguments.length);};c.b=b;c.a=a;return c}();function Hc(a,b,c){this.qb=a;this.m=b;this.k=c;this.j=32374990;this.q=8192}k=Hc.prototype;k.toString=function(){return ec(this)};k.H=function(){return this.k};k.T=function(){return 0<this.m?new Hc(this.qb,this.m-1,null):null};k.L=function(){return this.m+1};k.B=function(){return wc(this)};k.A=function(a,b){return Ic.a?Ic.a(this,b):Ic.call(null,this,b)};k.J=function(){var a=this.k;return O.a?O.a(J,a):O.call(null,J,a)};
k.R=function(a,b){return P.a?P.a(b,this):P.call(null,b,this)};k.O=function(a,b,c){return P.c?P.c(b,c,this):P.call(null,b,c,this)};k.N=function(){return C.a(this.qb,this.m)};k.S=function(){return 0<this.m?new Hc(this.qb,this.m-1,null):J};k.D=function(){return this};k.F=function(a,b){return new Hc(this.qb,this.m,b)};k.G=function(a,b){return M.a?M.a(b,this):M.call(null,b,this)};Hc.prototype[Ea]=function(){return uc(this)};function Lc(a){return G(K(a))}yb._=function(a,b){return a===b};
var Nc=function(){function a(a,b){return null!=a?Ra(a,b):Ra(J,b)}var b=null,c=function(){function a(b,d,h){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return c.call(this,b,d,l)}function c(a,d,e){for(;;)if(t(e))a=b.a(a,d),d=G(e),e=K(e);else return b.a(a,d)}a.i=2;a.f=function(a){var b=G(a);a=K(a);var d=G(a);a=H(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 0:return Mc;case 1:return b;
case 2:return a.call(this,b,e);default:var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new F(h,0)}return c.d(b,e,g)}throw Error("Invalid arity: "+arguments.length);};b.i=2;b.f=c.f;b.l=function(){return Mc};b.b=function(a){return a};b.a=a;b.d=c.d;return b}();function Oc(a){return null==a?null:Na(a)}
function Q(a){if(null!=a)if(a&&(a.j&2||a.cc))a=a.L(null);else if(a instanceof Array)a=a.length;else if("string"===typeof a)a=a.length;else if(w(La,a))a=Ma(a);else a:{a=D(a);for(var b=0;;){if(Ec(a)){a=b+Ma(a);break a}a=K(a);b+=1}a=void 0}else a=0;return a}
var Pc=function(){function a(a,b,c){for(;;){if(null==a)return c;if(0===b)return D(a)?G(a):c;if(Fc(a))return C.c(a,b,c);if(D(a))a=K(a),b-=1;else return c}}function b(a,b){for(;;){if(null==a)throw Error("Index out of bounds");if(0===b){if(D(a))return G(a);throw Error("Index out of bounds");}if(Fc(a))return C.a(a,b);if(D(a)){var c=K(a),g=b-1;a=c;b=g}else throw Error("Index out of bounds");}}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,
c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),R=function(){function a(a,b,c){if("number"!==typeof b)throw Error("index argument to nth must be a number.");if(null==a)return c;if(a&&(a.j&16||a.Qb))return a.$(null,b,c);if(a instanceof Array||"string"===typeof a)return b<a.length?a[b]:c;if(w(Ta,a))return C.a(a,b);if(a?a.j&64||a.jb||(a.j?0:w(Ua,a)):w(Ua,a))return Pc.c(a,b,c);throw Error([z("nth not supported on this type "),z(Da(Ba(a)))].join(""));}function b(a,b){if("number"!==
typeof b)throw Error("index argument to nth must be a number");if(null==a)return a;if(a&&(a.j&16||a.Qb))return a.Q(null,b);if(a instanceof Array||"string"===typeof a)return b<a.length?a[b]:null;if(w(Ta,a))return C.a(a,b);if(a?a.j&64||a.jb||(a.j?0:w(Ua,a)):w(Ua,a))return Pc.a(a,b);throw Error([z("nth not supported on this type "),z(Da(Ba(a)))].join(""));}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+
arguments.length);};c.a=b;c.c=a;return c}(),S=function(){function a(a,b,c){return null!=a?a&&(a.j&256||a.Rb)?a.s(null,b,c):a instanceof Array?b<a.length?a[b]:c:"string"===typeof a?b<a.length?a[b]:c:w(Za,a)?$a.c(a,b,c):c:c}function b(a,b){return null==a?null:a&&(a.j&256||a.Rb)?a.t(null,b):a instanceof Array?b<a.length?a[b]:null:"string"===typeof a?b<a.length?a[b]:null:w(Za,a)?$a.a(a,b):null}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,
c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),Rc=function(){function a(a,b,c){if(null!=a)a=cb(a,b,c);else a:{a=[b];c=[c];b=a.length;for(var g=0,h=Ob(Qc);;)if(g<b)var l=g+1,h=h.kb(null,a[g],c[g]),g=l;else{a=Qb(h);break a}a=void 0}return a}var b=null,c=function(){function a(b,d,h,l){var m=null;if(3<arguments.length){for(var m=0,p=Array(arguments.length-3);m<p.length;)p[m]=arguments[m+3],++m;m=new F(p,0)}return c.call(this,b,d,h,m)}function c(a,d,e,l){for(;;)if(a=b.c(a,
d,e),t(l))d=G(l),e=Lc(l),l=K(K(l));else return a}a.i=3;a.f=function(a){var b=G(a);a=K(a);var d=G(a);a=K(a);var l=G(a);a=H(a);return c(b,d,l,a)};a.d=c;return a}(),b=function(b,e,f,g){switch(arguments.length){case 3:return a.call(this,b,e,f);default:var h=null;if(3<arguments.length){for(var h=0,l=Array(arguments.length-3);h<l.length;)l[h]=arguments[h+3],++h;h=new F(l,0)}return c.d(b,e,f,h)}throw Error("Invalid arity: "+arguments.length);};b.i=3;b.f=c.f;b.c=a;b.d=c.d;return b}(),Sc=function(){function a(a,
b){return null==a?null:eb(a,b)}var b=null,c=function(){function a(b,d,h){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return c.call(this,b,d,l)}function c(a,d,e){for(;;){if(null==a)return null;a=b.a(a,d);if(t(e))d=G(e),e=K(e);else return a}}a.i=2;a.f=function(a){var b=G(a);a=K(a);var d=G(a);a=H(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return b;case 2:return a.call(this,b,e);
default:var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new F(h,0)}return c.d(b,e,g)}throw Error("Invalid arity: "+arguments.length);};b.i=2;b.f=c.f;b.b=function(a){return a};b.a=a;b.d=c.d;return b}();function Tc(a){var b="function"==n(a);return t(b)?b:a?t(t(null)?null:a.bc)?!0:a.yb?!1:w(Ja,a):w(Ja,a)}function Uc(a,b){this.h=a;this.k=b;this.q=0;this.j=393217}k=Uc.prototype;
k.call=function(){function a(a,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E,N,Y,ra,I){a=this.h;return T.ub?T.ub(a,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E,N,Y,ra,I):T.call(null,a,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E,N,Y,ra,I)}function b(a,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E,N,Y,ra){a=this;return a.h.Fa?a.h.Fa(b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E,N,Y,ra):a.h.call(null,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E,N,Y,ra)}function c(a,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E,N,Y){a=this;return a.h.Ea?a.h.Ea(b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E,N,
Y):a.h.call(null,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E,N,Y)}function d(a,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E,N){a=this;return a.h.Da?a.h.Da(b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E,N):a.h.call(null,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E,N)}function e(a,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E){a=this;return a.h.Ca?a.h.Ca(b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E):a.h.call(null,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B,E)}function f(a,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B){a=this;return a.h.Ba?a.h.Ba(b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B):a.h.call(null,
b,c,d,e,f,g,h,l,m,p,q,u,s,v,y,B)}function g(a,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y){a=this;return a.h.Aa?a.h.Aa(b,c,d,e,f,g,h,l,m,p,q,u,s,v,y):a.h.call(null,b,c,d,e,f,g,h,l,m,p,q,u,s,v,y)}function h(a,b,c,d,e,f,g,h,l,m,p,q,u,s,v){a=this;return a.h.za?a.h.za(b,c,d,e,f,g,h,l,m,p,q,u,s,v):a.h.call(null,b,c,d,e,f,g,h,l,m,p,q,u,s,v)}function l(a,b,c,d,e,f,g,h,l,m,p,q,u,s){a=this;return a.h.ya?a.h.ya(b,c,d,e,f,g,h,l,m,p,q,u,s):a.h.call(null,b,c,d,e,f,g,h,l,m,p,q,u,s)}function m(a,b,c,d,e,f,g,h,l,m,p,q,u){a=this;
return a.h.xa?a.h.xa(b,c,d,e,f,g,h,l,m,p,q,u):a.h.call(null,b,c,d,e,f,g,h,l,m,p,q,u)}function p(a,b,c,d,e,f,g,h,l,m,p,q){a=this;return a.h.wa?a.h.wa(b,c,d,e,f,g,h,l,m,p,q):a.h.call(null,b,c,d,e,f,g,h,l,m,p,q)}function q(a,b,c,d,e,f,g,h,l,m,p){a=this;return a.h.va?a.h.va(b,c,d,e,f,g,h,l,m,p):a.h.call(null,b,c,d,e,f,g,h,l,m,p)}function s(a,b,c,d,e,f,g,h,l,m){a=this;return a.h.Ha?a.h.Ha(b,c,d,e,f,g,h,l,m):a.h.call(null,b,c,d,e,f,g,h,l,m)}function u(a,b,c,d,e,f,g,h,l){a=this;return a.h.Ga?a.h.Ga(b,c,
d,e,f,g,h,l):a.h.call(null,b,c,d,e,f,g,h,l)}function v(a,b,c,d,e,f,g,h){a=this;return a.h.ia?a.h.ia(b,c,d,e,f,g,h):a.h.call(null,b,c,d,e,f,g,h)}function y(a,b,c,d,e,f,g){a=this;return a.h.P?a.h.P(b,c,d,e,f,g):a.h.call(null,b,c,d,e,f,g)}function B(a,b,c,d,e,f){a=this;return a.h.r?a.h.r(b,c,d,e,f):a.h.call(null,b,c,d,e,f)}function E(a,b,c,d,e){a=this;return a.h.n?a.h.n(b,c,d,e):a.h.call(null,b,c,d,e)}function N(a,b,c,d){a=this;return a.h.c?a.h.c(b,c,d):a.h.call(null,b,c,d)}function Y(a,b,c){a=this;
return a.h.a?a.h.a(b,c):a.h.call(null,b,c)}function ra(a,b){a=this;return a.h.b?a.h.b(b):a.h.call(null,b)}function Pa(a){a=this;return a.h.l?a.h.l():a.h.call(null)}var I=null,I=function(I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya,gb,ob,Ab,Wb,jc,zc,Zc,Gd,De,Wf,dh){switch(arguments.length){case 1:return Pa.call(this,I);case 2:return ra.call(this,I,qa);case 3:return Y.call(this,I,qa,ta);case 4:return N.call(this,I,qa,ta,va);case 5:return E.call(this,I,qa,ta,va,xa);case 6:return B.call(this,I,qa,ta,va,xa,Ca);case 7:return y.call(this,
I,qa,ta,va,xa,Ca,Ga);case 8:return v.call(this,I,qa,ta,va,xa,Ca,Ga,Ka);case 9:return u.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa);case 10:return s.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa);case 11:return q.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya);case 12:return p.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya,gb);case 13:return m.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya,gb,ob);case 14:return l.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya,gb,ob,Ab);case 15:return h.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya,gb,
ob,Ab,Wb);case 16:return g.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya,gb,ob,Ab,Wb,jc);case 17:return f.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya,gb,ob,Ab,Wb,jc,zc);case 18:return e.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya,gb,ob,Ab,Wb,jc,zc,Zc);case 19:return d.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya,gb,ob,Ab,Wb,jc,zc,Zc,Gd);case 20:return c.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya,gb,ob,Ab,Wb,jc,zc,Zc,Gd,De);case 21:return b.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya,gb,ob,Ab,Wb,jc,zc,Zc,Gd,De,
Wf);case 22:return a.call(this,I,qa,ta,va,xa,Ca,Ga,Ka,Oa,Sa,Ya,gb,ob,Ab,Wb,jc,zc,Zc,Gd,De,Wf,dh)}throw Error("Invalid arity: "+arguments.length);};I.b=Pa;I.a=ra;I.c=Y;I.n=N;I.r=E;I.P=B;I.ia=y;I.Ga=v;I.Ha=u;I.va=s;I.wa=q;I.xa=p;I.ya=m;I.za=l;I.Aa=h;I.Ba=g;I.Ca=f;I.Da=e;I.Ea=d;I.Fa=c;I.hc=b;I.ub=a;return I}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.l=function(){return this.h.l?this.h.l():this.h.call(null)};
k.b=function(a){return this.h.b?this.h.b(a):this.h.call(null,a)};k.a=function(a,b){return this.h.a?this.h.a(a,b):this.h.call(null,a,b)};k.c=function(a,b,c){return this.h.c?this.h.c(a,b,c):this.h.call(null,a,b,c)};k.n=function(a,b,c,d){return this.h.n?this.h.n(a,b,c,d):this.h.call(null,a,b,c,d)};k.r=function(a,b,c,d,e){return this.h.r?this.h.r(a,b,c,d,e):this.h.call(null,a,b,c,d,e)};k.P=function(a,b,c,d,e,f){return this.h.P?this.h.P(a,b,c,d,e,f):this.h.call(null,a,b,c,d,e,f)};
k.ia=function(a,b,c,d,e,f,g){return this.h.ia?this.h.ia(a,b,c,d,e,f,g):this.h.call(null,a,b,c,d,e,f,g)};k.Ga=function(a,b,c,d,e,f,g,h){return this.h.Ga?this.h.Ga(a,b,c,d,e,f,g,h):this.h.call(null,a,b,c,d,e,f,g,h)};k.Ha=function(a,b,c,d,e,f,g,h,l){return this.h.Ha?this.h.Ha(a,b,c,d,e,f,g,h,l):this.h.call(null,a,b,c,d,e,f,g,h,l)};k.va=function(a,b,c,d,e,f,g,h,l,m){return this.h.va?this.h.va(a,b,c,d,e,f,g,h,l,m):this.h.call(null,a,b,c,d,e,f,g,h,l,m)};
k.wa=function(a,b,c,d,e,f,g,h,l,m,p){return this.h.wa?this.h.wa(a,b,c,d,e,f,g,h,l,m,p):this.h.call(null,a,b,c,d,e,f,g,h,l,m,p)};k.xa=function(a,b,c,d,e,f,g,h,l,m,p,q){return this.h.xa?this.h.xa(a,b,c,d,e,f,g,h,l,m,p,q):this.h.call(null,a,b,c,d,e,f,g,h,l,m,p,q)};k.ya=function(a,b,c,d,e,f,g,h,l,m,p,q,s){return this.h.ya?this.h.ya(a,b,c,d,e,f,g,h,l,m,p,q,s):this.h.call(null,a,b,c,d,e,f,g,h,l,m,p,q,s)};
k.za=function(a,b,c,d,e,f,g,h,l,m,p,q,s,u){return this.h.za?this.h.za(a,b,c,d,e,f,g,h,l,m,p,q,s,u):this.h.call(null,a,b,c,d,e,f,g,h,l,m,p,q,s,u)};k.Aa=function(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v){return this.h.Aa?this.h.Aa(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v):this.h.call(null,a,b,c,d,e,f,g,h,l,m,p,q,s,u,v)};k.Ba=function(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y){return this.h.Ba?this.h.Ba(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y):this.h.call(null,a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y)};
k.Ca=function(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B){return this.h.Ca?this.h.Ca(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B):this.h.call(null,a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B)};k.Da=function(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E){return this.h.Da?this.h.Da(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E):this.h.call(null,a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E)};
k.Ea=function(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N){return this.h.Ea?this.h.Ea(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N):this.h.call(null,a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N)};k.Fa=function(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y){return this.h.Fa?this.h.Fa(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y):this.h.call(null,a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y)};
k.hc=function(a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y,ra){var Pa=this.h;return T.ub?T.ub(Pa,a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y,ra):T.call(null,Pa,a,b,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y,ra)};k.bc=!0;k.F=function(a,b){return new Uc(this.h,b)};k.H=function(){return this.k};function O(a,b){return Tc(a)&&!(a?a.j&262144||a.Bc||(a.j?0:w(tb,a)):w(tb,a))?new Uc(a,b):null==a?null:ub(a,b)}function Vc(a){var b=null!=a;return(b?a?a.j&131072||a.kc||(a.j?0:w(rb,a)):w(rb,a):b)?sb(a):null}
function Wc(a){return null==a?null:lb(a)}
var Xc=function(){function a(a,b){return null==a?null:kb(a,b)}var b=null,c=function(){function a(b,d,h){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return c.call(this,b,d,l)}function c(a,d,e){for(;;){if(null==a)return null;a=b.a(a,d);if(t(e))d=G(e),e=K(e);else return a}}a.i=2;a.f=function(a){var b=G(a);a=K(a);var d=G(a);a=H(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return b;case 2:return a.call(this,
b,e);default:var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new F(h,0)}return c.d(b,e,g)}throw Error("Invalid arity: "+arguments.length);};b.i=2;b.f=c.f;b.b=function(a){return a};b.a=a;b.d=c.d;return b}();function Yc(a){return null==a||Aa(D(a))}function $c(a){return null==a?!1:a?a.j&8||a.tc?!0:a.j?!1:w(Qa,a):w(Qa,a)}function ad(a){return null==a?!1:a?a.j&4096||a.zc?!0:a.j?!1:w(jb,a):w(jb,a)}
function bd(a){return a?a.j&512||a.rc?!0:a.j?!1:w(ab,a):w(ab,a)}function cd(a){return a?a.j&16777216||a.yc?!0:a.j?!1:w(Db,a):w(Db,a)}function dd(a){return null==a?!1:a?a.j&1024||a.ic?!0:a.j?!1:w(db,a):w(db,a)}function ed(a){return a?a.j&16384||a.Ac?!0:a.j?!1:w(nb,a):w(nb,a)}function fd(a){return a?a.q&512||a.sc?!0:!1:!1}function gd(a){var b=[];ea(a,function(a,b){return function(a,c){return b.push(c)}}(a,b));return b}function hd(a,b,c,d,e){for(;0!==e;)c[d]=a[b],d+=1,e-=1,b+=1}
function id(a,b,c,d,e){b+=e-1;for(d+=e-1;0!==e;)c[d]=a[b],d-=1,e-=1,b-=1}var jd={};function kd(a){return null==a?!1:a?a.j&64||a.jb?!0:a.j?!1:w(Ua,a):w(Ua,a)}function ld(a){return a?a.j&8388608||a.mc?!0:a.j?!1:w(Bb,a):w(Bb,a)}function md(a){return t(a)?!0:!1}function nd(a,b){return S.c(a,b,jd)===jd?!1:!0}
function od(a,b){if(a===b)return 0;if(null==a)return-1;if(null==b)return 1;if(Ba(a)===Ba(b))return a&&(a.q&2048||a.sb)?a.tb(null,b):ha(a,b);throw Error("compare on non-nil objects of different types");}
var pd=function(){function a(a,b,c,g){for(;;){var h=od(R.a(a,g),R.a(b,g));if(0===h&&g+1<c)g+=1;else return h}}function b(a,b){var f=Q(a),g=Q(b);return f<g?-1:f>g?1:c.n(a,b,f,0)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 2:return b.call(this,c,e);case 4:return a.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.n=a;return c}();
function qd(a){return sc.a(a,od)?od:function(b,c){var d=a.a?a.a(b,c):a.call(null,b,c);return"number"===typeof d?d:t(d)?-1:t(a.a?a.a(c,b):a.call(null,c,b))?1:0}}
var sd=function(){function a(a,b){if(D(b)){var c=rd.b?rd.b(b):rd.call(null,b),g=qd(a);ia(c,g);return D(c)}return J}function b(a){return c.a(od,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),td=function(){function a(a,b,c){return sd.a(function(c,f){return qd(b).call(null,a.b?a.b(c):a.call(null,c),a.b?a.b(f):a.call(null,f))},c)}function b(a,b){return c.c(a,od,
b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),P=function(){function a(a,b,c){for(c=D(c);;)if(c){var g=G(c);b=a.a?a.a(b,g):a.call(null,b,g);if(Ac(b))return qb(b);c=K(c)}else return b}function b(a,b){var c=D(b);if(c){var g=G(c),c=K(c);return A.c?A.c(a,g,c):A.call(null,a,g,c)}return a.l?a.l():a.call(null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,
c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),A=function(){function a(a,b,c){return c&&(c.j&524288||c.Sb)?c.O(null,a,b):c instanceof Array?Dc.c(c,a,b):"string"===typeof c?Dc.c(c,a,b):w(vb,c)?wb.c(c,a,b):P.c(a,b,c)}function b(a,b){return b&&(b.j&524288||b.Sb)?b.R(null,a):b instanceof Array?Dc.a(b,a):"string"===typeof b?Dc.a(b,a):w(vb,b)?wb.a(b,a):P.a(a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,
c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}();function ud(a){return a}
var vd=function(){function a(a,b){return function(){function c(b,e){return a.a?a.a(b,e):a.call(null,b,e)}function g(a){return b.b?b.b(a):b.call(null,a)}function h(){return a.l?a.l():a.call(null)}var l=null,l=function(a,b){switch(arguments.length){case 0:return h.call(this);case 1:return g.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};l.l=h;l.b=g;l.a=c;return l}()}function b(a){return c.a(a,ud)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,
c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),wd=function(){function a(a,b,c,g){a=a.b?a.b(b):a.call(null,b);c=A.c(a,c,g);return a.b?a.b(c):a.call(null,c)}function b(a,b,f){return c.n(a,b,b.l?b.l():b.call(null),f)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 3:return b.call(this,c,e,f);case 4:return a.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.n=a;return c}(),xd=function(){var a=null,b=function(){function b(a,
c,g){var h=null;if(2<arguments.length){for(var h=0,l=Array(arguments.length-2);h<l.length;)l[h]=arguments[h+2],++h;h=new F(l,0)}return d.call(this,a,c,h)}function d(b,c,d){return A.c(a,b+c,d)}b.i=2;b.f=function(a){var b=G(a);a=K(a);var c=G(a);a=H(a);return d(b,c,a)};b.d=d;return b}(),a=function(a,d,e){switch(arguments.length){case 0:return 0;case 1:return a;case 2:return a+d;default:var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+2],++f;f=new F(g,
0)}return b.d(a,d,f)}throw Error("Invalid arity: "+arguments.length);};a.i=2;a.f=b.f;a.l=function(){return 0};a.b=function(a){return a};a.a=function(a,b){return a+b};a.d=b.d;return a}(),yd=function(){var a=null,b=function(){function a(c,f,g){var h=null;if(2<arguments.length){for(var h=0,l=Array(arguments.length-2);h<l.length;)l[h]=arguments[h+2],++h;h=new F(l,0)}return b.call(this,c,f,h)}function b(a,c,d){for(;;)if(a<c)if(K(d))a=c,c=G(d),d=K(d);else return c<G(d);else return!1}a.i=2;a.f=function(a){var c=
G(a);a=K(a);var g=G(a);a=H(a);return b(c,g,a)};a.d=b;return a}(),a=function(a,d,e){switch(arguments.length){case 1:return!0;case 2:return a<d;default:var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+2],++f;f=new F(g,0)}return b.d(a,d,f)}throw Error("Invalid arity: "+arguments.length);};a.i=2;a.f=b.f;a.b=function(){return!0};a.a=function(a,b){return a<b};a.d=b.d;return a}(),zd=function(){var a=null,b=function(){function a(c,f,g){var h=null;if(2<
arguments.length){for(var h=0,l=Array(arguments.length-2);h<l.length;)l[h]=arguments[h+2],++h;h=new F(l,0)}return b.call(this,c,f,h)}function b(a,c,d){for(;;)if(a<=c)if(K(d))a=c,c=G(d),d=K(d);else return c<=G(d);else return!1}a.i=2;a.f=function(a){var c=G(a);a=K(a);var g=G(a);a=H(a);return b(c,g,a)};a.d=b;return a}(),a=function(a,d,e){switch(arguments.length){case 1:return!0;case 2:return a<=d;default:var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+
2],++f;f=new F(g,0)}return b.d(a,d,f)}throw Error("Invalid arity: "+arguments.length);};a.i=2;a.f=b.f;a.b=function(){return!0};a.a=function(a,b){return a<=b};a.d=b.d;return a}(),Ad=function(){var a=null,b=function(){function a(c,f,g){var h=null;if(2<arguments.length){for(var h=0,l=Array(arguments.length-2);h<l.length;)l[h]=arguments[h+2],++h;h=new F(l,0)}return b.call(this,c,f,h)}function b(a,c,d){for(;;)if(a>c)if(K(d))a=c,c=G(d),d=K(d);else return c>G(d);else return!1}a.i=2;a.f=function(a){var c=
G(a);a=K(a);var g=G(a);a=H(a);return b(c,g,a)};a.d=b;return a}(),a=function(a,d,e){switch(arguments.length){case 1:return!0;case 2:return a>d;default:var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+2],++f;f=new F(g,0)}return b.d(a,d,f)}throw Error("Invalid arity: "+arguments.length);};a.i=2;a.f=b.f;a.b=function(){return!0};a.a=function(a,b){return a>b};a.d=b.d;return a}(),Bd=function(){var a=null,b=function(){function a(c,f,g){var h=null;if(2<
arguments.length){for(var h=0,l=Array(arguments.length-2);h<l.length;)l[h]=arguments[h+2],++h;h=new F(l,0)}return b.call(this,c,f,h)}function b(a,c,d){for(;;)if(a>=c)if(K(d))a=c,c=G(d),d=K(d);else return c>=G(d);else return!1}a.i=2;a.f=function(a){var c=G(a);a=K(a);var g=G(a);a=H(a);return b(c,g,a)};a.d=b;return a}(),a=function(a,d,e){switch(arguments.length){case 1:return!0;case 2:return a>=d;default:var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+
2],++f;f=new F(g,0)}return b.d(a,d,f)}throw Error("Invalid arity: "+arguments.length);};a.i=2;a.f=b.f;a.b=function(){return!0};a.a=function(a,b){return a>=b};a.d=b.d;return a}();function Cd(a,b){var c=(a-a%b)/b;return 0<=c?Math.floor.b?Math.floor.b(c):Math.floor.call(null,c):Math.ceil.b?Math.ceil.b(c):Math.ceil.call(null,c)}function Dd(a){a-=a>>1&1431655765;a=(a&858993459)+(a>>2&858993459);return 16843009*(a+(a>>4)&252645135)>>24}
function Ed(a){var b=1;for(a=D(a);;)if(a&&0<b)b-=1,a=K(a);else return a}
var z=function(){function a(a){return null==a?"":da(a)}var b=null,c=function(){function a(b,d){var h=null;if(1<arguments.length){for(var h=0,l=Array(arguments.length-1);h<l.length;)l[h]=arguments[h+1],++h;h=new F(l,0)}return c.call(this,b,h)}function c(a,d){for(var e=new fa(b.b(a)),l=d;;)if(t(l))e=e.append(b.b(G(l))),l=K(l);else return e.toString()}a.i=1;a.f=function(a){var b=G(a);a=H(a);return c(b,a)};a.d=c;return a}(),b=function(b,e){switch(arguments.length){case 0:return"";case 1:return a.call(this,
b);default:var f=null;if(1<arguments.length){for(var f=0,g=Array(arguments.length-1);f<g.length;)g[f]=arguments[f+1],++f;f=new F(g,0)}return c.d(b,f)}throw Error("Invalid arity: "+arguments.length);};b.i=1;b.f=c.f;b.l=function(){return""};b.b=a;b.d=c.d;return b}();function Ic(a,b){var c;if(cd(b))if(Ec(a)&&Ec(b)&&Q(a)!==Q(b))c=!1;else a:{c=D(a);for(var d=D(b);;){if(null==c){c=null==d;break a}if(null!=d&&sc.a(G(c),G(d)))c=K(c),d=K(d);else{c=!1;break a}}c=void 0}else c=null;return md(c)}
function Fd(a,b,c,d,e){this.k=a;this.first=b;this.M=c;this.count=d;this.p=e;this.j=65937646;this.q=8192}k=Fd.prototype;k.toString=function(){return ec(this)};k.H=function(){return this.k};k.T=function(){return 1===this.count?null:this.M};k.L=function(){return this.count};k.La=function(){return this.first};k.Ma=function(){return Wa(this)};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return ub(J,this.k)};
k.R=function(a,b){return P.a(b,this)};k.O=function(a,b,c){return P.c(b,c,this)};k.N=function(){return this.first};k.S=function(){return 1===this.count?J:this.M};k.D=function(){return this};k.F=function(a,b){return new Fd(b,this.first,this.M,this.count,this.p)};k.G=function(a,b){return new Fd(this.k,b,this,this.count+1,null)};Fd.prototype[Ea]=function(){return uc(this)};function Hd(a){this.k=a;this.j=65937614;this.q=8192}k=Hd.prototype;k.toString=function(){return ec(this)};k.H=function(){return this.k};
k.T=function(){return null};k.L=function(){return 0};k.La=function(){return null};k.Ma=function(){throw Error("Can't pop empty list");};k.B=function(){return 0};k.A=function(a,b){return Ic(this,b)};k.J=function(){return this};k.R=function(a,b){return P.a(b,this)};k.O=function(a,b,c){return P.c(b,c,this)};k.N=function(){return null};k.S=function(){return J};k.D=function(){return null};k.F=function(a,b){return new Hd(b)};k.G=function(a,b){return new Fd(this.k,b,null,1,null)};var J=new Hd(null);
Hd.prototype[Ea]=function(){return uc(this)};function Id(a){return a?a.j&134217728||a.xc?!0:a.j?!1:w(Fb,a):w(Fb,a)}function Jd(a){return Id(a)?Gb(a):A.c(Nc,J,a)}
var Kd=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return b.call(this,d)}function b(a){var b;if(a instanceof F&&0===a.m)b=a.e;else a:{for(b=[];;)if(null!=a)b.push(a.N(null)),a=a.T(null);else break a;b=void 0}a=b.length;for(var e=J;;)if(0<a){var f=a-1,e=e.G(null,b[a-1]);a=f}else return e}a.i=0;a.f=function(a){a=D(a);return b(a)};a.d=b;return a}();
function Ld(a,b,c,d){this.k=a;this.first=b;this.M=c;this.p=d;this.j=65929452;this.q=8192}k=Ld.prototype;k.toString=function(){return ec(this)};k.H=function(){return this.k};k.T=function(){return null==this.M?null:D(this.M)};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(J,this.k)};k.R=function(a,b){return P.a(b,this)};k.O=function(a,b,c){return P.c(b,c,this)};k.N=function(){return this.first};
k.S=function(){return null==this.M?J:this.M};k.D=function(){return this};k.F=function(a,b){return new Ld(b,this.first,this.M,this.p)};k.G=function(a,b){return new Ld(null,b,this,this.p)};Ld.prototype[Ea]=function(){return uc(this)};function M(a,b){var c=null==b;return(c?c:b&&(b.j&64||b.jb))?new Ld(null,a,b,null):new Ld(null,a,D(b),null)}
function Md(a,b){if(a.pa===b.pa)return 0;var c=Aa(a.ba);if(t(c?b.ba:c))return-1;if(t(a.ba)){if(Aa(b.ba))return 1;c=ha(a.ba,b.ba);return 0===c?ha(a.name,b.name):c}return ha(a.name,b.name)}function U(a,b,c,d){this.ba=a;this.name=b;this.pa=c;this.Ya=d;this.j=2153775105;this.q=4096}k=U.prototype;k.v=function(a,b){return Lb(b,[z(":"),z(this.pa)].join(""))};k.B=function(){var a=this.Ya;return null!=a?a:this.Ya=a=oc(this)+2654435769|0};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return S.a(c,this);case 3:return S.c(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return S.a(c,this)};a.c=function(a,c,d){return S.c(c,this,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.b=function(a){return S.a(a,this)};k.a=function(a,b){return S.c(a,this,b)};k.A=function(a,b){return b instanceof U?this.pa===b.pa:!1};
k.toString=function(){return[z(":"),z(this.pa)].join("")};function Nd(a,b){return a===b?!0:a instanceof U&&b instanceof U?a.pa===b.pa:!1}
var Pd=function(){function a(a,b){return new U(a,b,[z(t(a)?[z(a),z("/")].join(""):null),z(b)].join(""),null)}function b(a){if(a instanceof U)return a;if(a instanceof qc){var b;if(a&&(a.q&4096||a.lc))b=a.ba;else throw Error([z("Doesn't support namespace: "),z(a)].join(""));return new U(b,Od.b?Od.b(a):Od.call(null,a),a.ta,null)}return"string"===typeof a?(b=a.split("/"),2===b.length?new U(b[0],b[1],a,null):new U(null,b[0],a,null)):null}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,
c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}();function V(a,b,c,d){this.k=a;this.cb=b;this.C=c;this.p=d;this.q=0;this.j=32374988}k=V.prototype;k.toString=function(){return ec(this)};function Qd(a){null!=a.cb&&(a.C=a.cb.l?a.cb.l():a.cb.call(null),a.cb=null);return a.C}k.H=function(){return this.k};k.T=function(){Cb(this);return null==this.C?null:K(this.C)};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};
k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(J,this.k)};k.R=function(a,b){return P.a(b,this)};k.O=function(a,b,c){return P.c(b,c,this)};k.N=function(){Cb(this);return null==this.C?null:G(this.C)};k.S=function(){Cb(this);return null!=this.C?H(this.C):J};k.D=function(){Qd(this);if(null==this.C)return null;for(var a=this.C;;)if(a instanceof V)a=Qd(a);else return this.C=a,D(this.C)};k.F=function(a,b){return new V(b,this.cb,this.C,this.p)};k.G=function(a,b){return M(b,this)};
V.prototype[Ea]=function(){return uc(this)};function Rd(a,b){this.Ab=a;this.end=b;this.q=0;this.j=2}Rd.prototype.L=function(){return this.end};Rd.prototype.add=function(a){this.Ab[this.end]=a;return this.end+=1};Rd.prototype.ca=function(){var a=new Sd(this.Ab,0,this.end);this.Ab=null;return a};function Td(a){return new Rd(Array(a),0)}function Sd(a,b,c){this.e=a;this.V=b;this.end=c;this.q=0;this.j=524306}k=Sd.prototype;k.R=function(a,b){return Dc.n(this.e,b,this.e[this.V],this.V+1)};
k.O=function(a,b,c){return Dc.n(this.e,b,c,this.V)};k.Pb=function(){if(this.V===this.end)throw Error("-drop-first of empty chunk");return new Sd(this.e,this.V+1,this.end)};k.Q=function(a,b){return this.e[this.V+b]};k.$=function(a,b,c){return 0<=b&&b<this.end-this.V?this.e[this.V+b]:c};k.L=function(){return this.end-this.V};
var Ud=function(){function a(a,b,c){return new Sd(a,b,c)}function b(a,b){return new Sd(a,b,a.length)}function c(a){return new Sd(a,0,a.length)}var d=null,d=function(d,f,g){switch(arguments.length){case 1:return c.call(this,d);case 2:return b.call(this,d,f);case 3:return a.call(this,d,f,g)}throw Error("Invalid arity: "+arguments.length);};d.b=c;d.a=b;d.c=a;return d}();function Vd(a,b,c,d){this.ca=a;this.ra=b;this.k=c;this.p=d;this.j=31850732;this.q=1536}k=Vd.prototype;k.toString=function(){return ec(this)};
k.H=function(){return this.k};k.T=function(){if(1<Ma(this.ca))return new Vd(Xb(this.ca),this.ra,this.k,null);var a=Cb(this.ra);return null==a?null:a};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(J,this.k)};k.N=function(){return C.a(this.ca,0)};k.S=function(){return 1<Ma(this.ca)?new Vd(Xb(this.ca),this.ra,this.k,null):null==this.ra?J:this.ra};k.D=function(){return this};k.Cb=function(){return this.ca};
k.Db=function(){return null==this.ra?J:this.ra};k.F=function(a,b){return new Vd(this.ca,this.ra,b,this.p)};k.G=function(a,b){return M(b,this)};k.Bb=function(){return null==this.ra?null:this.ra};Vd.prototype[Ea]=function(){return uc(this)};function Wd(a,b){return 0===Ma(a)?b:new Vd(a,b,null,null)}function Xd(a,b){a.add(b)}function rd(a){for(var b=[];;)if(D(a))b.push(G(a)),a=K(a);else return b}function Yd(a,b){if(Ec(a))return Q(a);for(var c=a,d=b,e=0;;)if(0<d&&D(c))c=K(c),d-=1,e+=1;else return e}
var $d=function Zd(b){return null==b?null:null==K(b)?D(G(b)):M(G(b),Zd(K(b)))},ae=function(){function a(a,b){return new V(null,function(){var c=D(a);return c?fd(c)?Wd(Yb(c),d.a(Zb(c),b)):M(G(c),d.a(H(c),b)):b},null,null)}function b(a){return new V(null,function(){return a},null,null)}function c(){return new V(null,function(){return null},null,null)}var d=null,e=function(){function a(c,d,e){var f=null;if(2<arguments.length){for(var f=0,q=Array(arguments.length-2);f<q.length;)q[f]=arguments[f+2],++f;
f=new F(q,0)}return b.call(this,c,d,f)}function b(a,c,e){return function q(a,b){return new V(null,function(){var c=D(a);return c?fd(c)?Wd(Yb(c),q(Zb(c),b)):M(G(c),q(H(c),b)):t(b)?q(G(b),K(b)):null},null,null)}(d.a(a,c),e)}a.i=2;a.f=function(a){var c=G(a);a=K(a);var d=G(a);a=H(a);return b(c,d,a)};a.d=b;return a}(),d=function(d,g,h){switch(arguments.length){case 0:return c.call(this);case 1:return b.call(this,d);case 2:return a.call(this,d,g);default:var l=null;if(2<arguments.length){for(var l=0,m=
Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return e.d(d,g,l)}throw Error("Invalid arity: "+arguments.length);};d.i=2;d.f=e.f;d.l=c;d.b=b;d.a=a;d.d=e.d;return d}(),be=function(){function a(a,b,c,d){return M(a,M(b,M(c,d)))}function b(a,b,c){return M(a,M(b,c))}var c=null,d=function(){function a(c,d,e,m,p){var q=null;if(4<arguments.length){for(var q=0,s=Array(arguments.length-4);q<s.length;)s[q]=arguments[q+4],++q;q=new F(s,0)}return b.call(this,c,d,e,m,q)}function b(a,
c,d,e,f){return M(a,M(c,M(d,M(e,$d(f)))))}a.i=4;a.f=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=K(a);var p=G(a);a=H(a);return b(c,d,e,p,a)};a.d=b;return a}(),c=function(c,f,g,h,l){switch(arguments.length){case 1:return D(c);case 2:return M(c,f);case 3:return b.call(this,c,f,g);case 4:return a.call(this,c,f,g,h);default:var m=null;if(4<arguments.length){for(var m=0,p=Array(arguments.length-4);m<p.length;)p[m]=arguments[m+4],++m;m=new F(p,0)}return d.d(c,f,g,h,m)}throw Error("Invalid arity: "+
arguments.length);};c.i=4;c.f=d.f;c.b=function(a){return D(a)};c.a=function(a,b){return M(a,b)};c.c=b;c.n=a;c.d=d.d;return c}();function ce(a){return Qb(a)}
var de=function(){function a(){return Ob(Mc)}var b=null,c=function(){function a(c,d,h){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return b.call(this,c,d,l)}function b(a,c,d){for(;;)if(a=Pb(a,c),t(d))c=G(d),d=K(d);else return a}a.i=2;a.f=function(a){var c=G(a);a=K(a);var d=G(a);a=H(a);return b(c,d,a)};a.d=b;return a}(),b=function(b,e,f){switch(arguments.length){case 0:return a.call(this);case 1:return b;case 2:return Pb(b,
e);default:var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new F(h,0)}return c.d(b,e,g)}throw Error("Invalid arity: "+arguments.length);};b.i=2;b.f=c.f;b.l=a;b.b=function(a){return a};b.a=function(a,b){return Pb(a,b)};b.d=c.d;return b}(),ee=function(){var a=null,b=function(){function a(c,f,g,h){var l=null;if(3<arguments.length){for(var l=0,m=Array(arguments.length-3);l<m.length;)m[l]=arguments[l+3],++l;l=new F(m,0)}return b.call(this,
c,f,g,l)}function b(a,c,d,h){for(;;)if(a=Rb(a,c,d),t(h))c=G(h),d=Lc(h),h=K(K(h));else return a}a.i=3;a.f=function(a){var c=G(a);a=K(a);var g=G(a);a=K(a);var h=G(a);a=H(a);return b(c,g,h,a)};a.d=b;return a}(),a=function(a,d,e,f){switch(arguments.length){case 3:return Rb(a,d,e);default:var g=null;if(3<arguments.length){for(var g=0,h=Array(arguments.length-3);g<h.length;)h[g]=arguments[g+3],++g;g=new F(h,0)}return b.d(a,d,e,g)}throw Error("Invalid arity: "+arguments.length);};a.i=3;a.f=b.f;a.c=function(a,
b,e){return Rb(a,b,e)};a.d=b.d;return a}(),fe=function(){var a=null,b=function(){function a(c,f,g){var h=null;if(2<arguments.length){for(var h=0,l=Array(arguments.length-2);h<l.length;)l[h]=arguments[h+2],++h;h=new F(l,0)}return b.call(this,c,f,h)}function b(a,c,d){for(;;)if(a=Sb(a,c),t(d))c=G(d),d=K(d);else return a}a.i=2;a.f=function(a){var c=G(a);a=K(a);var g=G(a);a=H(a);return b(c,g,a)};a.d=b;return a}(),a=function(a,d,e){switch(arguments.length){case 2:return Sb(a,d);default:var f=null;if(2<
arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+2],++f;f=new F(g,0)}return b.d(a,d,f)}throw Error("Invalid arity: "+arguments.length);};a.i=2;a.f=b.f;a.a=function(a,b){return Sb(a,b)};a.d=b.d;return a}(),ge=function(){var a=null,b=function(){function a(c,f,g){var h=null;if(2<arguments.length){for(var h=0,l=Array(arguments.length-2);h<l.length;)l[h]=arguments[h+2],++h;h=new F(l,0)}return b.call(this,c,f,h)}function b(a,c,d){for(;;)if(a=Vb(a,c),t(d))c=G(d),d=K(d);
else return a}a.i=2;a.f=function(a){var c=G(a);a=K(a);var g=G(a);a=H(a);return b(c,g,a)};a.d=b;return a}(),a=function(a,d,e){switch(arguments.length){case 2:return Vb(a,d);default:var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+2],++f;f=new F(g,0)}return b.d(a,d,f)}throw Error("Invalid arity: "+arguments.length);};a.i=2;a.f=b.f;a.a=function(a,b){return Vb(a,b)};a.d=b.d;return a}();
function he(a,b,c){var d=D(c);if(0===b)return a.l?a.l():a.call(null);c=Va(d);var e=Wa(d);if(1===b)return a.b?a.b(c):a.b?a.b(c):a.call(null,c);var d=Va(e),f=Wa(e);if(2===b)return a.a?a.a(c,d):a.a?a.a(c,d):a.call(null,c,d);var e=Va(f),g=Wa(f);if(3===b)return a.c?a.c(c,d,e):a.c?a.c(c,d,e):a.call(null,c,d,e);var f=Va(g),h=Wa(g);if(4===b)return a.n?a.n(c,d,e,f):a.n?a.n(c,d,e,f):a.call(null,c,d,e,f);var g=Va(h),l=Wa(h);if(5===b)return a.r?a.r(c,d,e,f,g):a.r?a.r(c,d,e,f,g):a.call(null,c,d,e,f,g);var h=Va(l),
m=Wa(l);if(6===b)return a.P?a.P(c,d,e,f,g,h):a.P?a.P(c,d,e,f,g,h):a.call(null,c,d,e,f,g,h);var l=Va(m),p=Wa(m);if(7===b)return a.ia?a.ia(c,d,e,f,g,h,l):a.ia?a.ia(c,d,e,f,g,h,l):a.call(null,c,d,e,f,g,h,l);var m=Va(p),q=Wa(p);if(8===b)return a.Ga?a.Ga(c,d,e,f,g,h,l,m):a.Ga?a.Ga(c,d,e,f,g,h,l,m):a.call(null,c,d,e,f,g,h,l,m);var p=Va(q),s=Wa(q);if(9===b)return a.Ha?a.Ha(c,d,e,f,g,h,l,m,p):a.Ha?a.Ha(c,d,e,f,g,h,l,m,p):a.call(null,c,d,e,f,g,h,l,m,p);var q=Va(s),u=Wa(s);if(10===b)return a.va?a.va(c,d,e,
f,g,h,l,m,p,q):a.va?a.va(c,d,e,f,g,h,l,m,p,q):a.call(null,c,d,e,f,g,h,l,m,p,q);var s=Va(u),v=Wa(u);if(11===b)return a.wa?a.wa(c,d,e,f,g,h,l,m,p,q,s):a.wa?a.wa(c,d,e,f,g,h,l,m,p,q,s):a.call(null,c,d,e,f,g,h,l,m,p,q,s);var u=Va(v),y=Wa(v);if(12===b)return a.xa?a.xa(c,d,e,f,g,h,l,m,p,q,s,u):a.xa?a.xa(c,d,e,f,g,h,l,m,p,q,s,u):a.call(null,c,d,e,f,g,h,l,m,p,q,s,u);var v=Va(y),B=Wa(y);if(13===b)return a.ya?a.ya(c,d,e,f,g,h,l,m,p,q,s,u,v):a.ya?a.ya(c,d,e,f,g,h,l,m,p,q,s,u,v):a.call(null,c,d,e,f,g,h,l,m,p,
q,s,u,v);var y=Va(B),E=Wa(B);if(14===b)return a.za?a.za(c,d,e,f,g,h,l,m,p,q,s,u,v,y):a.za?a.za(c,d,e,f,g,h,l,m,p,q,s,u,v,y):a.call(null,c,d,e,f,g,h,l,m,p,q,s,u,v,y);var B=Va(E),N=Wa(E);if(15===b)return a.Aa?a.Aa(c,d,e,f,g,h,l,m,p,q,s,u,v,y,B):a.Aa?a.Aa(c,d,e,f,g,h,l,m,p,q,s,u,v,y,B):a.call(null,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B);var E=Va(N),Y=Wa(N);if(16===b)return a.Ba?a.Ba(c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E):a.Ba?a.Ba(c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E):a.call(null,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E);var N=
Va(Y),ra=Wa(Y);if(17===b)return a.Ca?a.Ca(c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N):a.Ca?a.Ca(c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N):a.call(null,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N);var Y=Va(ra),Pa=Wa(ra);if(18===b)return a.Da?a.Da(c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y):a.Da?a.Da(c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y):a.call(null,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y);ra=Va(Pa);Pa=Wa(Pa);if(19===b)return a.Ea?a.Ea(c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y,ra):a.Ea?a.Ea(c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y,ra):a.call(null,
c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y,ra);var I=Va(Pa);Wa(Pa);if(20===b)return a.Fa?a.Fa(c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y,ra,I):a.Fa?a.Fa(c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y,ra,I):a.call(null,c,d,e,f,g,h,l,m,p,q,s,u,v,y,B,E,N,Y,ra,I);throw Error("Only up to 20 arguments supported on functions");}
var T=function(){function a(a,b,c,d,e){b=be.n(b,c,d,e);c=a.i;return a.f?(d=Yd(b,c+1),d<=c?he(a,d,b):a.f(b)):a.apply(a,rd(b))}function b(a,b,c,d){b=be.c(b,c,d);c=a.i;return a.f?(d=Yd(b,c+1),d<=c?he(a,d,b):a.f(b)):a.apply(a,rd(b))}function c(a,b,c){b=be.a(b,c);c=a.i;if(a.f){var d=Yd(b,c+1);return d<=c?he(a,d,b):a.f(b)}return a.apply(a,rd(b))}function d(a,b){var c=a.i;if(a.f){var d=Yd(b,c+1);return d<=c?he(a,d,b):a.f(b)}return a.apply(a,rd(b))}var e=null,f=function(){function a(c,d,e,f,g,u){var v=null;
if(5<arguments.length){for(var v=0,y=Array(arguments.length-5);v<y.length;)y[v]=arguments[v+5],++v;v=new F(y,0)}return b.call(this,c,d,e,f,g,v)}function b(a,c,d,e,f,g){c=M(c,M(d,M(e,M(f,$d(g)))));d=a.i;return a.f?(e=Yd(c,d+1),e<=d?he(a,e,c):a.f(c)):a.apply(a,rd(c))}a.i=5;a.f=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=K(a);var f=G(a);a=K(a);var g=G(a);a=H(a);return b(c,d,e,f,g,a)};a.d=b;return a}(),e=function(e,h,l,m,p,q){switch(arguments.length){case 2:return d.call(this,e,h);case 3:return c.call(this,
e,h,l);case 4:return b.call(this,e,h,l,m);case 5:return a.call(this,e,h,l,m,p);default:var s=null;if(5<arguments.length){for(var s=0,u=Array(arguments.length-5);s<u.length;)u[s]=arguments[s+5],++s;s=new F(u,0)}return f.d(e,h,l,m,p,s)}throw Error("Invalid arity: "+arguments.length);};e.i=5;e.f=f.f;e.a=d;e.c=c;e.n=b;e.r=a;e.d=f.d;return e}(),ie=function(){function a(a,b,c,d,e,f){var g=O,v=Vc(a);b=b.r?b.r(v,c,d,e,f):b.call(null,v,c,d,e,f);return g(a,b)}function b(a,b,c,d,e){var f=O,g=Vc(a);b=b.n?b.n(g,
c,d,e):b.call(null,g,c,d,e);return f(a,b)}function c(a,b,c,d){var e=O,f=Vc(a);b=b.c?b.c(f,c,d):b.call(null,f,c,d);return e(a,b)}function d(a,b,c){var d=O,e=Vc(a);b=b.a?b.a(e,c):b.call(null,e,c);return d(a,b)}function e(a,b){var c=O,d;d=Vc(a);d=b.b?b.b(d):b.call(null,d);return c(a,d)}var f=null,g=function(){function a(c,d,e,f,g,h,y){var B=null;if(6<arguments.length){for(var B=0,E=Array(arguments.length-6);B<E.length;)E[B]=arguments[B+6],++B;B=new F(E,0)}return b.call(this,c,d,e,f,g,h,B)}function b(a,
c,d,e,f,g,h){return O(a,T.d(c,Vc(a),d,e,f,Kc([g,h],0)))}a.i=6;a.f=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=K(a);var f=G(a);a=K(a);var g=G(a);a=K(a);var h=G(a);a=H(a);return b(c,d,e,f,g,h,a)};a.d=b;return a}(),f=function(f,l,m,p,q,s,u){switch(arguments.length){case 2:return e.call(this,f,l);case 3:return d.call(this,f,l,m);case 4:return c.call(this,f,l,m,p);case 5:return b.call(this,f,l,m,p,q);case 6:return a.call(this,f,l,m,p,q,s);default:var v=null;if(6<arguments.length){for(var v=
0,y=Array(arguments.length-6);v<y.length;)y[v]=arguments[v+6],++v;v=new F(y,0)}return g.d(f,l,m,p,q,s,v)}throw Error("Invalid arity: "+arguments.length);};f.i=6;f.f=g.f;f.a=e;f.c=d;f.n=c;f.r=b;f.P=a;f.d=g.d;return f}(),je=function(){function a(a,b){return!sc.a(a,b)}var b=null,c=function(){function a(c,d,h){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return b.call(this,c,d,l)}function b(a,c,d){return Aa(T.n(sc,a,c,d))}a.i=
2;a.f=function(a){var c=G(a);a=K(a);var d=G(a);a=H(a);return b(c,d,a)};a.d=b;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return!1;case 2:return a.call(this,b,e);default:var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new F(h,0)}return c.d(b,e,g)}throw Error("Invalid arity: "+arguments.length);};b.i=2;b.f=c.f;b.b=function(){return!1};b.a=a;b.d=c.d;return b}(),qe=function ke(){"undefined"===typeof ja&&(ja=function(b,c){this.pc=
b;this.oc=c;this.q=0;this.j=393216},ja.prototype.ga=function(){return!1},ja.prototype.next=function(){return Error("No such element")},ja.prototype.H=function(){return this.oc},ja.prototype.F=function(b,c){return new ja(this.pc,c)},ja.Yb=!0,ja.Xb="cljs.core/t12660",ja.nc=function(b){return Lb(b,"cljs.core/t12660")});return new ja(ke,new pa(null,5,[le,54,me,2998,ne,3,oe,2994,pe,"/Users/davidnolen/development/clojure/mori/out-mori-adv/cljs/core.cljs"],null))};function re(a,b){this.C=a;this.m=b}
re.prototype.ga=function(){return this.m<this.C.length};re.prototype.next=function(){var a=this.C.charAt(this.m);this.m+=1;return a};function se(a,b){this.e=a;this.m=b}se.prototype.ga=function(){return this.m<this.e.length};se.prototype.next=function(){var a=this.e[this.m];this.m+=1;return a};var te={},ue={};function ve(a,b){this.eb=a;this.Qa=b}ve.prototype.ga=function(){this.eb===te?(this.eb=ue,this.Qa=D(this.Qa)):this.eb===this.Qa&&(this.Qa=K(this.eb));return null!=this.Qa};
ve.prototype.next=function(){if(Aa(this.ga()))throw Error("No such element");this.eb=this.Qa;return G(this.Qa)};function we(a){if(null==a)return qe();if("string"===typeof a)return new re(a,0);if(a instanceof Array)return new se(a,0);if(a?t(t(null)?null:a.vb)||(a.yb?0:w(bc,a)):w(bc,a))return cc(a);if(ld(a))return new ve(te,a);throw Error([z("Cannot create iterator from "),z(a)].join(""));}function xe(a,b){this.fa=a;this.$b=b}
xe.prototype.step=function(a){for(var b=this;;){if(t(function(){var c=null!=a.X;return c?b.$b.ga():c}()))if(Ac(function(){var c=b.$b.next();return b.fa.a?b.fa.a(a,c):b.fa.call(null,a,c)}()))null!=a.M&&(a.M.X=null);else continue;break}return null==a.X?null:b.fa.b?b.fa.b(a):b.fa.call(null,a)};
function ye(a,b){var c=function(){function a(b,c){b.first=c;b.M=new ze(b.X,null,null,null);b.X=null;return b.M}function b(a){(Ac(a)?qb(a):a).X=null;return a}var c=null,c=function(c,f){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,f)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}();return new xe(a.b?a.b(c):a.call(null,c),b)}function Ae(a,b,c){this.fa=a;this.Kb=b;this.ac=c}
Ae.prototype.ga=function(){for(var a=D(this.Kb);;)if(null!=a){var b=G(a);if(Aa(b.ga()))return!1;a=K(a)}else return!0};Ae.prototype.next=function(){for(var a=this.Kb.length,b=0;;)if(b<a)this.ac[b]=this.Kb[b].next(),b+=1;else break;return Jc.a(this.ac,0)};Ae.prototype.step=function(a){for(;;){var b;b=(b=null!=a.X)?this.ga():b;if(t(b))if(Ac(T.a(this.fa,M(a,this.next()))))null!=a.M&&(a.M.X=null);else continue;break}return null==a.X?null:this.fa.b?this.fa.b(a):this.fa.call(null,a)};
var Be=function(){function a(a,b,c){var g=function(){function a(b,c){b.first=c;b.M=new ze(b.X,null,null,null);b.X=null;return b.M}function b(a){a=Ac(a)?qb(a):a;a.X=null;return a}var c=null,c=function(c,d){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,d)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}();return new Ae(a.b?a.b(g):a.call(null,g),b,c)}function b(a,b){return c.c(a,b,Array(b.length))}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,
c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}();function ze(a,b,c,d){this.X=a;this.first=b;this.M=c;this.k=d;this.q=0;this.j=31719628}k=ze.prototype;k.T=function(){null!=this.X&&Cb(this);return null==this.M?null:Cb(this.M)};k.N=function(){null!=this.X&&Cb(this);return null==this.M?null:this.first};k.S=function(){null!=this.X&&Cb(this);return null==this.M?J:this.M};
k.D=function(){null!=this.X&&this.X.step(this);return null==this.M?null:this};k.B=function(){return wc(this)};k.A=function(a,b){return null!=Cb(this)?Ic(this,b):cd(b)&&null==D(b)};k.J=function(){return J};k.G=function(a,b){return M(b,Cb(this))};k.F=function(a,b){return new ze(this.X,this.first,this.M,b)};ze.prototype[Ea]=function(){return uc(this)};
var Ce=function(){function a(a){return kd(a)?a:(a=D(a))?a:J}var b=null,c=function(){function a(c,d,h){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return b.call(this,c,d,l)}function b(a,c,d){d=rd(M(c,d));c=[];d=D(d);for(var e=null,m=0,p=0;;)if(p<m){var q=e.Q(null,p);c.push(we(q));p+=1}else if(d=D(d))e=d,fd(e)?(d=Yb(e),p=Zb(e),e=d,m=Q(d),d=p):(d=G(e),c.push(we(d)),d=K(e),e=null,m=0),p=0;else break;return new ze(Be.c(a,c,
Array(c.length)),null,null,null)}a.i=2;a.f=function(a){var c=G(a);a=K(a);var d=G(a);a=H(a);return b(c,d,a)};a.d=b;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return a.call(this,b);case 2:return new ze(ye(b,we(e)),null,null,null);default:var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new F(h,0)}return c.d(b,e,g)}throw Error("Invalid arity: "+arguments.length);};b.i=2;b.f=c.f;b.b=a;b.a=function(a,b){return new ze(ye(a,
we(b)),null,null,null)};b.d=c.d;return b}();function Ee(a,b){for(;;){if(null==D(b))return!0;var c;c=G(b);c=a.b?a.b(c):a.call(null,c);if(t(c)){c=a;var d=K(b);a=c;b=d}else return!1}}function Fe(a,b){for(;;)if(D(b)){var c;c=G(b);c=a.b?a.b(c):a.call(null,c);if(t(c))return c;c=a;var d=K(b);a=c;b=d}else return null}function Ge(a){if("number"===typeof a&&Aa(isNaN(a))&&Infinity!==a&&parseFloat(a)===parseInt(a,10))return 0===(a&1);throw Error([z("Argument must be an integer: "),z(a)].join(""));}
function He(a){return function(){function b(b,c){return Aa(a.a?a.a(b,c):a.call(null,b,c))}function c(b){return Aa(a.b?a.b(b):a.call(null,b))}function d(){return Aa(a.l?a.l():a.call(null))}var e=null,f=function(){function b(a,d,e){var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+2],++f;f=new F(g,0)}return c.call(this,a,d,f)}function c(b,d,e){return Aa(T.n(a,b,d,e))}b.i=2;b.f=function(a){var b=G(a);a=K(a);var d=G(a);a=H(a);return c(b,d,a)};b.d=c;
return b}(),e=function(a,e,l){switch(arguments.length){case 0:return d.call(this);case 1:return c.call(this,a);case 2:return b.call(this,a,e);default:var m=null;if(2<arguments.length){for(var m=0,p=Array(arguments.length-2);m<p.length;)p[m]=arguments[m+2],++m;m=new F(p,0)}return f.d(a,e,m)}throw Error("Invalid arity: "+arguments.length);};e.i=2;e.f=f.f;e.l=d;e.b=c;e.a=b;e.d=f.d;return e}()}
var Ie=function(){function a(a,b,c){return function(){function d(h,l,m){h=c.c?c.c(h,l,m):c.call(null,h,l,m);h=b.b?b.b(h):b.call(null,h);return a.b?a.b(h):a.call(null,h)}function l(d,h){var l;l=c.a?c.a(d,h):c.call(null,d,h);l=b.b?b.b(l):b.call(null,l);return a.b?a.b(l):a.call(null,l)}function m(d){d=c.b?c.b(d):c.call(null,d);d=b.b?b.b(d):b.call(null,d);return a.b?a.b(d):a.call(null,d)}function p(){var d;d=c.l?c.l():c.call(null);d=b.b?b.b(d):b.call(null,d);return a.b?a.b(d):a.call(null,d)}var q=null,
s=function(){function d(a,b,c,e){var f=null;if(3<arguments.length){for(var f=0,g=Array(arguments.length-3);f<g.length;)g[f]=arguments[f+3],++f;f=new F(g,0)}return h.call(this,a,b,c,f)}function h(d,l,m,p){d=T.r(c,d,l,m,p);d=b.b?b.b(d):b.call(null,d);return a.b?a.b(d):a.call(null,d)}d.i=3;d.f=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var d=G(a);a=H(a);return h(b,c,d,a)};d.d=h;return d}(),q=function(a,b,c,e){switch(arguments.length){case 0:return p.call(this);case 1:return m.call(this,a);case 2:return l.call(this,
a,b);case 3:return d.call(this,a,b,c);default:var f=null;if(3<arguments.length){for(var f=0,g=Array(arguments.length-3);f<g.length;)g[f]=arguments[f+3],++f;f=new F(g,0)}return s.d(a,b,c,f)}throw Error("Invalid arity: "+arguments.length);};q.i=3;q.f=s.f;q.l=p;q.b=m;q.a=l;q.c=d;q.d=s.d;return q}()}function b(a,b){return function(){function c(d,g,h){d=b.c?b.c(d,g,h):b.call(null,d,g,h);return a.b?a.b(d):a.call(null,d)}function d(c,g){var h=b.a?b.a(c,g):b.call(null,c,g);return a.b?a.b(h):a.call(null,h)}
function l(c){c=b.b?b.b(c):b.call(null,c);return a.b?a.b(c):a.call(null,c)}function m(){var c=b.l?b.l():b.call(null);return a.b?a.b(c):a.call(null,c)}var p=null,q=function(){function c(a,b,e,f){var g=null;if(3<arguments.length){for(var g=0,h=Array(arguments.length-3);g<h.length;)h[g]=arguments[g+3],++g;g=new F(h,0)}return d.call(this,a,b,e,g)}function d(c,g,h,l){c=T.r(b,c,g,h,l);return a.b?a.b(c):a.call(null,c)}c.i=3;c.f=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var e=G(a);a=H(a);return d(b,
c,e,a)};c.d=d;return c}(),p=function(a,b,e,f){switch(arguments.length){case 0:return m.call(this);case 1:return l.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,e);default:var p=null;if(3<arguments.length){for(var p=0,E=Array(arguments.length-3);p<E.length;)E[p]=arguments[p+3],++p;p=new F(E,0)}return q.d(a,b,e,p)}throw Error("Invalid arity: "+arguments.length);};p.i=3;p.f=q.f;p.l=m;p.b=l;p.a=d;p.c=c;p.d=q.d;return p}()}var c=null,d=function(){function a(c,d,e,m){var p=null;
if(3<arguments.length){for(var p=0,q=Array(arguments.length-3);p<q.length;)q[p]=arguments[p+3],++p;p=new F(q,0)}return b.call(this,c,d,e,p)}function b(a,c,d,e){return function(a){return function(){function b(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return c.call(this,d)}function c(b){b=T.a(G(a),b);for(var d=K(a);;)if(d)b=G(d).call(null,b),d=K(d);else return b}b.i=0;b.f=function(a){a=D(a);return c(a)};b.d=c;return b}()}(Jd(be.n(a,
c,d,e)))}a.i=3;a.f=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=H(a);return b(c,d,e,a)};a.d=b;return a}(),c=function(c,f,g,h){switch(arguments.length){case 0:return ud;case 1:return c;case 2:return b.call(this,c,f);case 3:return a.call(this,c,f,g);default:var l=null;if(3<arguments.length){for(var l=0,m=Array(arguments.length-3);l<m.length;)m[l]=arguments[l+3],++l;l=new F(m,0)}return d.d(c,f,g,l)}throw Error("Invalid arity: "+arguments.length);};c.i=3;c.f=d.f;c.l=function(){return ud};
c.b=function(a){return a};c.a=b;c.c=a;c.d=d.d;return c}(),Je=function(){function a(a,b,c,d){return function(){function e(m,p,q){return a.P?a.P(b,c,d,m,p,q):a.call(null,b,c,d,m,p,q)}function p(e,m){return a.r?a.r(b,c,d,e,m):a.call(null,b,c,d,e,m)}function q(e){return a.n?a.n(b,c,d,e):a.call(null,b,c,d,e)}function s(){return a.c?a.c(b,c,d):a.call(null,b,c,d)}var u=null,v=function(){function e(a,b,c,d){var f=null;if(3<arguments.length){for(var f=0,g=Array(arguments.length-3);f<g.length;)g[f]=arguments[f+
3],++f;f=new F(g,0)}return m.call(this,a,b,c,f)}function m(e,p,q,s){return T.d(a,b,c,d,e,Kc([p,q,s],0))}e.i=3;e.f=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var d=G(a);a=H(a);return m(b,c,d,a)};e.d=m;return e}(),u=function(a,b,c,d){switch(arguments.length){case 0:return s.call(this);case 1:return q.call(this,a);case 2:return p.call(this,a,b);case 3:return e.call(this,a,b,c);default:var f=null;if(3<arguments.length){for(var f=0,g=Array(arguments.length-3);f<g.length;)g[f]=arguments[f+3],++f;f=
new F(g,0)}return v.d(a,b,c,f)}throw Error("Invalid arity: "+arguments.length);};u.i=3;u.f=v.f;u.l=s;u.b=q;u.a=p;u.c=e;u.d=v.d;return u}()}function b(a,b,c){return function(){function d(e,l,m){return a.r?a.r(b,c,e,l,m):a.call(null,b,c,e,l,m)}function e(d,l){return a.n?a.n(b,c,d,l):a.call(null,b,c,d,l)}function p(d){return a.c?a.c(b,c,d):a.call(null,b,c,d)}function q(){return a.a?a.a(b,c):a.call(null,b,c)}var s=null,u=function(){function d(a,b,c,f){var g=null;if(3<arguments.length){for(var g=0,h=Array(arguments.length-
3);g<h.length;)h[g]=arguments[g+3],++g;g=new F(h,0)}return e.call(this,a,b,c,g)}function e(d,l,m,p){return T.d(a,b,c,d,l,Kc([m,p],0))}d.i=3;d.f=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var d=G(a);a=H(a);return e(b,c,d,a)};d.d=e;return d}(),s=function(a,b,c,f){switch(arguments.length){case 0:return q.call(this);case 1:return p.call(this,a);case 2:return e.call(this,a,b);case 3:return d.call(this,a,b,c);default:var g=null;if(3<arguments.length){for(var g=0,h=Array(arguments.length-3);g<h.length;)h[g]=
arguments[g+3],++g;g=new F(h,0)}return u.d(a,b,c,g)}throw Error("Invalid arity: "+arguments.length);};s.i=3;s.f=u.f;s.l=q;s.b=p;s.a=e;s.c=d;s.d=u.d;return s}()}function c(a,b){return function(){function c(d,e,h){return a.n?a.n(b,d,e,h):a.call(null,b,d,e,h)}function d(c,e){return a.c?a.c(b,c,e):a.call(null,b,c,e)}function e(c){return a.a?a.a(b,c):a.call(null,b,c)}function p(){return a.b?a.b(b):a.call(null,b)}var q=null,s=function(){function c(a,b,e,f){var g=null;if(3<arguments.length){for(var g=0,
h=Array(arguments.length-3);g<h.length;)h[g]=arguments[g+3],++g;g=new F(h,0)}return d.call(this,a,b,e,g)}function d(c,e,h,l){return T.d(a,b,c,e,h,Kc([l],0))}c.i=3;c.f=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var e=G(a);a=H(a);return d(b,c,e,a)};c.d=d;return c}(),q=function(a,b,f,g){switch(arguments.length){case 0:return p.call(this);case 1:return e.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,f);default:var q=null;if(3<arguments.length){for(var q=0,N=Array(arguments.length-
3);q<N.length;)N[q]=arguments[q+3],++q;q=new F(N,0)}return s.d(a,b,f,q)}throw Error("Invalid arity: "+arguments.length);};q.i=3;q.f=s.f;q.l=p;q.b=e;q.a=d;q.c=c;q.d=s.d;return q}()}var d=null,e=function(){function a(c,d,e,f,q){var s=null;if(4<arguments.length){for(var s=0,u=Array(arguments.length-4);s<u.length;)u[s]=arguments[s+4],++s;s=new F(u,0)}return b.call(this,c,d,e,f,s)}function b(a,c,d,e,f){return function(){function b(a){var c=null;if(0<arguments.length){for(var c=0,d=Array(arguments.length-
0);c<d.length;)d[c]=arguments[c+0],++c;c=new F(d,0)}return g.call(this,c)}function g(b){return T.r(a,c,d,e,ae.a(f,b))}b.i=0;b.f=function(a){a=D(a);return g(a)};b.d=g;return b}()}a.i=4;a.f=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=K(a);var f=G(a);a=H(a);return b(c,d,e,f,a)};a.d=b;return a}(),d=function(d,g,h,l,m){switch(arguments.length){case 1:return d;case 2:return c.call(this,d,g);case 3:return b.call(this,d,g,h);case 4:return a.call(this,d,g,h,l);default:var p=null;if(4<arguments.length){for(var p=
0,q=Array(arguments.length-4);p<q.length;)q[p]=arguments[p+4],++p;p=new F(q,0)}return e.d(d,g,h,l,p)}throw Error("Invalid arity: "+arguments.length);};d.i=4;d.f=e.f;d.b=function(a){return a};d.a=c;d.c=b;d.n=a;d.d=e.d;return d}(),Ke=function(){function a(a,b,c,d){return function(){function l(l,m,p){l=null==l?b:l;m=null==m?c:m;p=null==p?d:p;return a.c?a.c(l,m,p):a.call(null,l,m,p)}function m(d,h){var l=null==d?b:d,m=null==h?c:h;return a.a?a.a(l,m):a.call(null,l,m)}var p=null,q=function(){function l(a,
b,c,d){var e=null;if(3<arguments.length){for(var e=0,f=Array(arguments.length-3);e<f.length;)f[e]=arguments[e+3],++e;e=new F(f,0)}return m.call(this,a,b,c,e)}function m(l,p,q,s){return T.r(a,null==l?b:l,null==p?c:p,null==q?d:q,s)}l.i=3;l.f=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var d=G(a);a=H(a);return m(b,c,d,a)};l.d=m;return l}(),p=function(a,b,c,d){switch(arguments.length){case 2:return m.call(this,a,b);case 3:return l.call(this,a,b,c);default:var e=null;if(3<arguments.length){for(var e=
0,f=Array(arguments.length-3);e<f.length;)f[e]=arguments[e+3],++e;e=new F(f,0)}return q.d(a,b,c,e)}throw Error("Invalid arity: "+arguments.length);};p.i=3;p.f=q.f;p.a=m;p.c=l;p.d=q.d;return p}()}function b(a,b,c){return function(){function d(h,l,m){h=null==h?b:h;l=null==l?c:l;return a.c?a.c(h,l,m):a.call(null,h,l,m)}function l(d,h){var l=null==d?b:d,m=null==h?c:h;return a.a?a.a(l,m):a.call(null,l,m)}var m=null,p=function(){function d(a,b,c,e){var f=null;if(3<arguments.length){for(var f=0,g=Array(arguments.length-
3);f<g.length;)g[f]=arguments[f+3],++f;f=new F(g,0)}return h.call(this,a,b,c,f)}function h(d,l,m,p){return T.r(a,null==d?b:d,null==l?c:l,m,p)}d.i=3;d.f=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var d=G(a);a=H(a);return h(b,c,d,a)};d.d=h;return d}(),m=function(a,b,c,e){switch(arguments.length){case 2:return l.call(this,a,b);case 3:return d.call(this,a,b,c);default:var f=null;if(3<arguments.length){for(var f=0,g=Array(arguments.length-3);f<g.length;)g[f]=arguments[f+3],++f;f=new F(g,0)}return p.d(a,
b,c,f)}throw Error("Invalid arity: "+arguments.length);};m.i=3;m.f=p.f;m.a=l;m.c=d;m.d=p.d;return m}()}function c(a,b){return function(){function c(d,g,h){d=null==d?b:d;return a.c?a.c(d,g,h):a.call(null,d,g,h)}function d(c,g){var h=null==c?b:c;return a.a?a.a(h,g):a.call(null,h,g)}function l(c){c=null==c?b:c;return a.b?a.b(c):a.call(null,c)}var m=null,p=function(){function c(a,b,e,f){var g=null;if(3<arguments.length){for(var g=0,h=Array(arguments.length-3);g<h.length;)h[g]=arguments[g+3],++g;g=new F(h,
0)}return d.call(this,a,b,e,g)}function d(c,g,h,l){return T.r(a,null==c?b:c,g,h,l)}c.i=3;c.f=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var e=G(a);a=H(a);return d(b,c,e,a)};c.d=d;return c}(),m=function(a,b,e,f){switch(arguments.length){case 1:return l.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,e);default:var m=null;if(3<arguments.length){for(var m=0,B=Array(arguments.length-3);m<B.length;)B[m]=arguments[m+3],++m;m=new F(B,0)}return p.d(a,b,e,m)}throw Error("Invalid arity: "+
arguments.length);};m.i=3;m.f=p.f;m.b=l;m.a=d;m.c=c;m.d=p.d;return m}()}var d=null,d=function(d,f,g,h){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,g);case 4:return a.call(this,d,f,g,h)}throw Error("Invalid arity: "+arguments.length);};d.a=c;d.c=b;d.n=a;return d}(),Le=function(){function a(a,b){return new V(null,function(){var f=D(b);if(f){if(fd(f)){for(var g=Yb(f),h=Q(g),l=Td(h),m=0;;)if(m<h){var p=function(){var b=C.a(g,m);return a.b?a.b(b):a.call(null,b)}();
null!=p&&l.add(p);m+=1}else break;return Wd(l.ca(),c.a(a,Zb(f)))}h=function(){var b=G(f);return a.b?a.b(b):a.call(null,b)}();return null==h?c.a(a,H(f)):M(h,c.a(a,H(f)))}return null},null,null)}function b(a){return function(b){return function(){function c(f,g){var h=a.b?a.b(g):a.call(null,g);return null==h?f:b.a?b.a(f,h):b.call(null,f,h)}function g(a){return b.b?b.b(a):b.call(null,a)}function h(){return b.l?b.l():b.call(null)}var l=null,l=function(a,b){switch(arguments.length){case 0:return h.call(this);
case 1:return g.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};l.l=h;l.b=g;l.a=c;return l}()}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}();function Me(a){this.state=a;this.q=0;this.j=32768}Me.prototype.Ra=function(){return this.state};Me.prototype.bb=function(a,b){return this.state=b};
var Ne=function(){function a(a,b){return function g(b,c){return new V(null,function(){var e=D(c);if(e){if(fd(e)){for(var p=Yb(e),q=Q(p),s=Td(q),u=0;;)if(u<q){var v=function(){var c=b+u,e=C.a(p,u);return a.a?a.a(c,e):a.call(null,c,e)}();null!=v&&s.add(v);u+=1}else break;return Wd(s.ca(),g(b+q,Zb(e)))}q=function(){var c=G(e);return a.a?a.a(b,c):a.call(null,b,c)}();return null==q?g(b+1,H(e)):M(q,g(b+1,H(e)))}return null},null,null)}(0,b)}function b(a){return function(b){return function(c){return function(){function g(g,
h){var l=c.bb(0,c.Ra(null)+1),l=a.a?a.a(l,h):a.call(null,l,h);return null==l?g:b.a?b.a(g,l):b.call(null,g,l)}function h(a){return b.b?b.b(a):b.call(null,a)}function l(){return b.l?b.l():b.call(null)}var m=null,m=function(a,b){switch(arguments.length){case 0:return l.call(this);case 1:return h.call(this,a);case 2:return g.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};m.l=l;m.b=h;m.a=g;return m}()}(new Me(-1))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,
c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Oe=function(){function a(a,b,c,d){return new V(null,function(){var f=D(b),q=D(c),s=D(d);if(f&&q&&s){var u=M,v;v=G(f);var y=G(q),B=G(s);v=a.c?a.c(v,y,B):a.call(null,v,y,B);f=u(v,e.n(a,H(f),H(q),H(s)))}else f=null;return f},null,null)}function b(a,b,c){return new V(null,function(){var d=D(b),f=D(c);if(d&&f){var q=M,s;s=G(d);var u=G(f);s=a.a?a.a(s,u):a.call(null,s,u);d=q(s,e.c(a,H(d),H(f)))}else d=
null;return d},null,null)}function c(a,b){return new V(null,function(){var c=D(b);if(c){if(fd(c)){for(var d=Yb(c),f=Q(d),q=Td(f),s=0;;)if(s<f)Xd(q,function(){var b=C.a(d,s);return a.b?a.b(b):a.call(null,b)}()),s+=1;else break;return Wd(q.ca(),e.a(a,Zb(c)))}return M(function(){var b=G(c);return a.b?a.b(b):a.call(null,b)}(),e.a(a,H(c)))}return null},null,null)}function d(a){return function(b){return function(){function c(d,e){var f=a.b?a.b(e):a.call(null,e);return b.a?b.a(d,f):b.call(null,d,f)}function d(a){return b.b?
b.b(a):b.call(null,a)}function e(){return b.l?b.l():b.call(null)}var f=null,s=function(){function c(a,b,e){var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+2],++f;f=new F(g,0)}return d.call(this,a,b,f)}function d(c,e,f){e=T.c(a,e,f);return b.a?b.a(c,e):b.call(null,c,e)}c.i=2;c.f=function(a){var b=G(a);a=K(a);var c=G(a);a=H(a);return d(b,c,a)};c.d=d;return c}(),f=function(a,b,f){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,
a);case 2:return c.call(this,a,b);default:var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new F(h,0)}return s.d(a,b,g)}throw Error("Invalid arity: "+arguments.length);};f.i=2;f.f=s.f;f.l=e;f.b=d;f.a=c;f.d=s.d;return f}()}}var e=null,f=function(){function a(c,d,e,f,g){var u=null;if(4<arguments.length){for(var u=0,v=Array(arguments.length-4);u<v.length;)v[u]=arguments[u+4],++u;u=new F(v,0)}return b.call(this,c,d,e,f,u)}function b(a,c,d,
f,g){var h=function y(a){return new V(null,function(){var b=e.a(D,a);return Ee(ud,b)?M(e.a(G,b),y(e.a(H,b))):null},null,null)};return e.a(function(){return function(b){return T.a(a,b)}}(h),h(Nc.d(g,f,Kc([d,c],0))))}a.i=4;a.f=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=K(a);var f=G(a);a=H(a);return b(c,d,e,f,a)};a.d=b;return a}(),e=function(e,h,l,m,p){switch(arguments.length){case 1:return d.call(this,e);case 2:return c.call(this,e,h);case 3:return b.call(this,e,h,l);case 4:return a.call(this,
e,h,l,m);default:var q=null;if(4<arguments.length){for(var q=0,s=Array(arguments.length-4);q<s.length;)s[q]=arguments[q+4],++q;q=new F(s,0)}return f.d(e,h,l,m,q)}throw Error("Invalid arity: "+arguments.length);};e.i=4;e.f=f.f;e.b=d;e.a=c;e.c=b;e.n=a;e.d=f.d;return e}(),Pe=function(){function a(a,b){return new V(null,function(){if(0<a){var f=D(b);return f?M(G(f),c.a(a-1,H(f))):null}return null},null,null)}function b(a){return function(b){return function(a){return function(){function c(d,g){var h=qb(a),
l=a.bb(0,a.Ra(null)-1),h=0<h?b.a?b.a(d,g):b.call(null,d,g):d;return 0<l?h:Ac(h)?h:new yc(h)}function d(a){return b.b?b.b(a):b.call(null,a)}function l(){return b.l?b.l():b.call(null)}var m=null,m=function(a,b){switch(arguments.length){case 0:return l.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};m.l=l;m.b=d;m.a=c;return m}()}(new Me(a))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,
c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Qe=function(){function a(a,b){return new V(null,function(c){return function(){return c(a,b)}}(function(a,b){for(;;){var c=D(b);if(0<a&&c){var d=a-1,c=H(c);a=d;b=c}else return c}}),null,null)}function b(a){return function(b){return function(a){return function(){function c(d,g){var h=qb(a);a.bb(0,a.Ra(null)-1);return 0<h?d:b.a?b.a(d,g):b.call(null,d,g)}function d(a){return b.b?b.b(a):b.call(null,a)}function l(){return b.l?
b.l():b.call(null)}var m=null,m=function(a,b){switch(arguments.length){case 0:return l.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};m.l=l;m.b=d;m.a=c;return m}()}(new Me(a))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Re=function(){function a(a,b){return new V(null,function(c){return function(){return c(a,
b)}}(function(a,b){for(;;){var c=D(b),d;if(d=c)d=G(c),d=a.b?a.b(d):a.call(null,d);if(t(d))d=a,c=H(c),a=d,b=c;else return c}}),null,null)}function b(a){return function(b){return function(c){return function(){function g(g,h){var l=qb(c);if(t(t(l)?a.b?a.b(h):a.call(null,h):l))return g;ac(c,null);return b.a?b.a(g,h):b.call(null,g,h)}function h(a){return b.b?b.b(a):b.call(null,a)}function l(){return b.l?b.l():b.call(null)}var m=null,m=function(a,b){switch(arguments.length){case 0:return l.call(this);case 1:return h.call(this,
a);case 2:return g.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};m.l=l;m.b=h;m.a=g;return m}()}(new Me(!0))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Se=function(){function a(a,b){return Pe.a(a,c.b(b))}function b(a){return new V(null,function(){return M(a,c.b(a))},null,null)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,
c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Te=function(){function a(a,b){return Pe.a(a,c.b(b))}function b(a){return new V(null,function(){return M(a.l?a.l():a.call(null),c.b(a))},null,null)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Ue=function(){function a(a,c){return new V(null,function(){var f=
D(a),g=D(c);return f&&g?M(G(f),M(G(g),b.a(H(f),H(g)))):null},null,null)}var b=null,c=function(){function a(b,d,h){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return c.call(this,b,d,l)}function c(a,d,e){return new V(null,function(){var c=Oe.a(D,Nc.d(e,d,Kc([a],0)));return Ee(ud,c)?ae.a(Oe.a(G,c),T.a(b,Oe.a(H,c))):null},null,null)}a.i=2;a.f=function(a){var b=G(a);a=K(a);var d=G(a);a=H(a);return c(b,d,a)};a.d=c;return a}(),
b=function(b,e,f){switch(arguments.length){case 2:return a.call(this,b,e);default:var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new F(h,0)}return c.d(b,e,g)}throw Error("Invalid arity: "+arguments.length);};b.i=2;b.f=c.f;b.a=a;b.d=c.d;return b}(),We=function(){function a(a){return Ie.a(Oe.b(a),Ve)}var b=null,c=function(){function a(c,d){var h=null;if(1<arguments.length){for(var h=0,l=Array(arguments.length-1);h<l.length;)l[h]=arguments[h+
1],++h;h=new F(l,0)}return b.call(this,c,h)}function b(a,c){return T.a(ae,T.c(Oe,a,c))}a.i=1;a.f=function(a){var c=G(a);a=H(a);return b(c,a)};a.d=b;return a}(),b=function(b,e){switch(arguments.length){case 1:return a.call(this,b);default:var f=null;if(1<arguments.length){for(var f=0,g=Array(arguments.length-1);f<g.length;)g[f]=arguments[f+1],++f;f=new F(g,0)}return c.d(b,f)}throw Error("Invalid arity: "+arguments.length);};b.i=1;b.f=c.f;b.b=a;b.d=c.d;return b}(),Xe=function(){function a(a,b){return new V(null,
function(){var f=D(b);if(f){if(fd(f)){for(var g=Yb(f),h=Q(g),l=Td(h),m=0;;)if(m<h){var p;p=C.a(g,m);p=a.b?a.b(p):a.call(null,p);t(p)&&(p=C.a(g,m),l.add(p));m+=1}else break;return Wd(l.ca(),c.a(a,Zb(f)))}g=G(f);f=H(f);return t(a.b?a.b(g):a.call(null,g))?M(g,c.a(a,f)):c.a(a,f)}return null},null,null)}function b(a){return function(b){return function(){function c(f,g){return t(a.b?a.b(g):a.call(null,g))?b.a?b.a(f,g):b.call(null,f,g):f}function g(a){return b.b?b.b(a):b.call(null,a)}function h(){return b.l?
b.l():b.call(null)}var l=null,l=function(a,b){switch(arguments.length){case 0:return h.call(this);case 1:return g.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};l.l=h;l.b=g;l.a=c;return l}()}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),Ye=function(){function a(a,b){return Xe.a(He(a),b)}function b(a){return Xe.b(He(a))}
var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}();function Ze(a){var b=$e;return function d(a){return new V(null,function(){return M(a,t(b.b?b.b(a):b.call(null,a))?We.d(d,Kc([D.b?D.b(a):D.call(null,a)],0)):null)},null,null)}(a)}
var af=function(){function a(a,b,c){return a&&(a.q&4||a.dc)?O(ce(wd.n(b,de,Ob(a),c)),Vc(a)):wd.n(b,Nc,a,c)}function b(a,b){return null!=a?a&&(a.q&4||a.dc)?O(ce(A.c(Pb,Ob(a),b)),Vc(a)):A.c(Ra,a,b):A.c(Nc,J,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),bf=function(){function a(a,b,c,h){return new V(null,function(){var l=D(h);if(l){var m=Pe.a(a,l);return a===
Q(m)?M(m,d.n(a,b,c,Qe.a(b,l))):Ra(J,Pe.a(a,ae.a(m,c)))}return null},null,null)}function b(a,b,c){return new V(null,function(){var h=D(c);if(h){var l=Pe.a(a,h);return a===Q(l)?M(l,d.c(a,b,Qe.a(b,h))):null}return null},null,null)}function c(a,b){return d.c(a,a,b)}var d=null,d=function(d,f,g,h){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return b.call(this,d,f,g);case 4:return a.call(this,d,f,g,h)}throw Error("Invalid arity: "+arguments.length);};d.a=c;d.c=b;d.n=a;return d}(),cf=function(){function a(a,
b,c){var g=jd;for(b=D(b);;)if(b){var h=a;if(h?h.j&256||h.Rb||(h.j?0:w(Za,h)):w(Za,h)){a=S.c(a,G(b),g);if(g===a)return c;b=K(b)}else return c}else return a}function b(a,b){return c.c(a,b,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}(),df=function(){function a(a,b,c,d,f,q){var s=R.c(b,0,null);return(b=Ed(b))?Rc.c(a,s,e.P(S.a(a,s),b,c,d,f,q)):Rc.c(a,s,
function(){var b=S.a(a,s);return c.n?c.n(b,d,f,q):c.call(null,b,d,f,q)}())}function b(a,b,c,d,f){var q=R.c(b,0,null);return(b=Ed(b))?Rc.c(a,q,e.r(S.a(a,q),b,c,d,f)):Rc.c(a,q,function(){var b=S.a(a,q);return c.c?c.c(b,d,f):c.call(null,b,d,f)}())}function c(a,b,c,d){var f=R.c(b,0,null);return(b=Ed(b))?Rc.c(a,f,e.n(S.a(a,f),b,c,d)):Rc.c(a,f,function(){var b=S.a(a,f);return c.a?c.a(b,d):c.call(null,b,d)}())}function d(a,b,c){var d=R.c(b,0,null);return(b=Ed(b))?Rc.c(a,d,e.c(S.a(a,d),b,c)):Rc.c(a,d,function(){var b=
S.a(a,d);return c.b?c.b(b):c.call(null,b)}())}var e=null,f=function(){function a(c,d,e,f,g,u,v){var y=null;if(6<arguments.length){for(var y=0,B=Array(arguments.length-6);y<B.length;)B[y]=arguments[y+6],++y;y=new F(B,0)}return b.call(this,c,d,e,f,g,u,y)}function b(a,c,d,f,g,h,v){var y=R.c(c,0,null);return(c=Ed(c))?Rc.c(a,y,T.d(e,S.a(a,y),c,d,f,Kc([g,h,v],0))):Rc.c(a,y,T.d(d,S.a(a,y),f,g,h,Kc([v],0)))}a.i=6;a.f=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=K(a);var f=G(a);a=K(a);var g=
G(a);a=K(a);var v=G(a);a=H(a);return b(c,d,e,f,g,v,a)};a.d=b;return a}(),e=function(e,h,l,m,p,q,s){switch(arguments.length){case 3:return d.call(this,e,h,l);case 4:return c.call(this,e,h,l,m);case 5:return b.call(this,e,h,l,m,p);case 6:return a.call(this,e,h,l,m,p,q);default:var u=null;if(6<arguments.length){for(var u=0,v=Array(arguments.length-6);u<v.length;)v[u]=arguments[u+6],++u;u=new F(v,0)}return f.d(e,h,l,m,p,q,u)}throw Error("Invalid arity: "+arguments.length);};e.i=6;e.f=f.f;e.c=d;e.n=c;
e.r=b;e.P=a;e.d=f.d;return e}();function ef(a,b){this.u=a;this.e=b}function ff(a){return new ef(a,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])}function gf(a){return new ef(a.u,Fa(a.e))}function hf(a){a=a.g;return 32>a?0:a-1>>>5<<5}function jf(a,b,c){for(;;){if(0===b)return c;var d=ff(a);d.e[0]=c;c=d;b-=5}}
var lf=function kf(b,c,d,e){var f=gf(d),g=b.g-1>>>c&31;5===c?f.e[g]=e:(d=d.e[g],b=null!=d?kf(b,c-5,d,e):jf(null,c-5,e),f.e[g]=b);return f};function mf(a,b){throw Error([z("No item "),z(a),z(" in vector of length "),z(b)].join(""));}function nf(a,b){if(b>=hf(a))return a.W;for(var c=a.root,d=a.shift;;)if(0<d)var e=d-5,c=c.e[b>>>d&31],d=e;else return c.e}function of(a,b){return 0<=b&&b<a.g?nf(a,b):mf(b,a.g)}
var qf=function pf(b,c,d,e,f){var g=gf(d);if(0===c)g.e[e&31]=f;else{var h=e>>>c&31;b=pf(b,c-5,d.e[h],e,f);g.e[h]=b}return g},sf=function rf(b,c,d){var e=b.g-2>>>c&31;if(5<c){b=rf(b,c-5,d.e[e]);if(null==b&&0===e)return null;d=gf(d);d.e[e]=b;return d}if(0===e)return null;d=gf(d);d.e[e]=null;return d};function tf(a,b,c,d,e,f){this.m=a;this.zb=b;this.e=c;this.oa=d;this.start=e;this.end=f}tf.prototype.ga=function(){return this.m<this.end};
tf.prototype.next=function(){32===this.m-this.zb&&(this.e=nf(this.oa,this.m),this.zb+=32);var a=this.e[this.m&31];this.m+=1;return a};function W(a,b,c,d,e,f){this.k=a;this.g=b;this.shift=c;this.root=d;this.W=e;this.p=f;this.j=167668511;this.q=8196}k=W.prototype;k.toString=function(){return ec(this)};k.t=function(a,b){return $a.c(this,b,null)};k.s=function(a,b,c){return"number"===typeof b?C.c(this,b,c):c};
k.gb=function(a,b,c){a=0;for(var d=c;;)if(a<this.g){var e=nf(this,a);c=e.length;a:{for(var f=0;;)if(f<c){var g=f+a,h=e[f],d=b.c?b.c(d,g,h):b.call(null,d,g,h);if(Ac(d)){e=d;break a}f+=1}else{e=d;break a}e=void 0}if(Ac(e))return b=e,L.b?L.b(b):L.call(null,b);a+=c;d=e}else return d};k.Q=function(a,b){return of(this,b)[b&31]};k.$=function(a,b,c){return 0<=b&&b<this.g?nf(this,b)[b&31]:c};
k.Ua=function(a,b,c){if(0<=b&&b<this.g)return hf(this)<=b?(a=Fa(this.W),a[b&31]=c,new W(this.k,this.g,this.shift,this.root,a,null)):new W(this.k,this.g,this.shift,qf(this,this.shift,this.root,b,c),this.W,null);if(b===this.g)return Ra(this,c);throw Error([z("Index "),z(b),z(" out of bounds  [0,"),z(this.g),z("]")].join(""));};k.vb=!0;k.fb=function(){var a=this.g;return new tf(0,0,0<Q(this)?nf(this,0):null,this,0,a)};k.H=function(){return this.k};k.L=function(){return this.g};
k.hb=function(){return C.a(this,0)};k.ib=function(){return C.a(this,1)};k.La=function(){return 0<this.g?C.a(this,this.g-1):null};
k.Ma=function(){if(0===this.g)throw Error("Can't pop empty vector");if(1===this.g)return ub(Mc,this.k);if(1<this.g-hf(this))return new W(this.k,this.g-1,this.shift,this.root,this.W.slice(0,-1),null);var a=nf(this,this.g-2),b=sf(this,this.shift,this.root),b=null==b?uf:b,c=this.g-1;return 5<this.shift&&null==b.e[1]?new W(this.k,c,this.shift-5,b.e[0],a,null):new W(this.k,c,this.shift,b,a,null)};k.ab=function(){return 0<this.g?new Hc(this,this.g-1,null):null};
k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){if(b instanceof W)if(this.g===Q(b))for(var c=cc(this),d=cc(b);;)if(t(c.ga())){var e=c.next(),f=d.next();if(!sc.a(e,f))return!1}else return!0;else return!1;else return Ic(this,b)};k.$a=function(){var a=this;return new vf(a.g,a.shift,function(){var b=a.root;return wf.b?wf.b(b):wf.call(null,b)}(),function(){var b=a.W;return xf.b?xf.b(b):xf.call(null,b)}())};k.J=function(){return O(Mc,this.k)};
k.R=function(a,b){return Cc.a(this,b)};k.O=function(a,b,c){a=0;for(var d=c;;)if(a<this.g){var e=nf(this,a);c=e.length;a:{for(var f=0;;)if(f<c){var g=e[f],d=b.a?b.a(d,g):b.call(null,d,g);if(Ac(d)){e=d;break a}f+=1}else{e=d;break a}e=void 0}if(Ac(e))return b=e,L.b?L.b(b):L.call(null,b);a+=c;d=e}else return d};k.Ka=function(a,b,c){if("number"===typeof b)return pb(this,b,c);throw Error("Vector's key for assoc must be a number.");};
k.D=function(){if(0===this.g)return null;if(32>=this.g)return new F(this.W,0);var a;a:{a=this.root;for(var b=this.shift;;)if(0<b)b-=5,a=a.e[0];else{a=a.e;break a}a=void 0}return yf.n?yf.n(this,a,0,0):yf.call(null,this,a,0,0)};k.F=function(a,b){return new W(b,this.g,this.shift,this.root,this.W,this.p)};
k.G=function(a,b){if(32>this.g-hf(this)){for(var c=this.W.length,d=Array(c+1),e=0;;)if(e<c)d[e]=this.W[e],e+=1;else break;d[c]=b;return new W(this.k,this.g+1,this.shift,this.root,d,null)}c=(d=this.g>>>5>1<<this.shift)?this.shift+5:this.shift;d?(d=ff(null),d.e[0]=this.root,e=jf(null,this.shift,new ef(null,this.W)),d.e[1]=e):d=lf(this,this.shift,this.root,new ef(null,this.W));return new W(this.k,this.g+1,c,d,[b],null)};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.Q(null,c);case 3:return this.$(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.Q(null,c)};a.c=function(a,c,d){return this.$(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.b=function(a){return this.Q(null,a)};k.a=function(a,b){return this.$(null,a,b)};
var uf=new ef(null,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]),Mc=new W(null,0,5,uf,[],0);W.prototype[Ea]=function(){return uc(this)};function zf(a){return Qb(A.c(Pb,Ob(Mc),a))}
var Af=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return b.call(this,d)}function b(a){if(a instanceof F&&0===a.m)a:{a=a.e;var b=a.length;if(32>b)a=new W(null,b,5,uf,a,null);else{for(var e=32,f=(new W(null,32,5,uf,a.slice(0,32),null)).$a(null);;)if(e<b)var g=e+1,f=de.a(f,a[e]),e=g;else{a=Qb(f);break a}a=void 0}}else a=zf(a);return a}a.i=0;a.f=function(a){a=D(a);return b(a)};a.d=b;return a}();
function Bf(a,b,c,d,e,f){this.ha=a;this.Ja=b;this.m=c;this.V=d;this.k=e;this.p=f;this.j=32375020;this.q=1536}k=Bf.prototype;k.toString=function(){return ec(this)};k.H=function(){return this.k};k.T=function(){if(this.V+1<this.Ja.length){var a;a=this.ha;var b=this.Ja,c=this.m,d=this.V+1;a=yf.n?yf.n(a,b,c,d):yf.call(null,a,b,c,d);return null==a?null:a}return $b(this)};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(Mc,this.k)};
k.R=function(a,b){var c=this;return Cc.a(function(){var a=c.ha,b=c.m+c.V,f=Q(c.ha);return Cf.c?Cf.c(a,b,f):Cf.call(null,a,b,f)}(),b)};k.O=function(a,b,c){var d=this;return Cc.c(function(){var a=d.ha,b=d.m+d.V,c=Q(d.ha);return Cf.c?Cf.c(a,b,c):Cf.call(null,a,b,c)}(),b,c)};k.N=function(){return this.Ja[this.V]};k.S=function(){if(this.V+1<this.Ja.length){var a;a=this.ha;var b=this.Ja,c=this.m,d=this.V+1;a=yf.n?yf.n(a,b,c,d):yf.call(null,a,b,c,d);return null==a?J:a}return Zb(this)};k.D=function(){return this};
k.Cb=function(){return Ud.a(this.Ja,this.V)};k.Db=function(){var a=this.m+this.Ja.length;if(a<Ma(this.ha)){var b=this.ha,c=nf(this.ha,a);return yf.n?yf.n(b,c,a,0):yf.call(null,b,c,a,0)}return J};k.F=function(a,b){var c=this.ha,d=this.Ja,e=this.m,f=this.V;return yf.r?yf.r(c,d,e,f,b):yf.call(null,c,d,e,f,b)};k.G=function(a,b){return M(b,this)};k.Bb=function(){var a=this.m+this.Ja.length;if(a<Ma(this.ha)){var b=this.ha,c=nf(this.ha,a);return yf.n?yf.n(b,c,a,0):yf.call(null,b,c,a,0)}return null};
Bf.prototype[Ea]=function(){return uc(this)};var yf=function(){function a(a,b,c,d,l){return new Bf(a,b,c,d,l,null)}function b(a,b,c,d){return new Bf(a,b,c,d,null,null)}function c(a,b,c){return new Bf(a,of(a,b),b,c,null,null)}var d=null,d=function(d,f,g,h,l){switch(arguments.length){case 3:return c.call(this,d,f,g);case 4:return b.call(this,d,f,g,h);case 5:return a.call(this,d,f,g,h,l)}throw Error("Invalid arity: "+arguments.length);};d.c=c;d.n=b;d.r=a;return d}();
function Df(a,b,c,d,e){this.k=a;this.oa=b;this.start=c;this.end=d;this.p=e;this.j=166617887;this.q=8192}k=Df.prototype;k.toString=function(){return ec(this)};k.t=function(a,b){return $a.c(this,b,null)};k.s=function(a,b,c){return"number"===typeof b?C.c(this,b,c):c};k.Q=function(a,b){return 0>b||this.end<=this.start+b?mf(b,this.end-this.start):C.a(this.oa,this.start+b)};k.$=function(a,b,c){return 0>b||this.end<=this.start+b?c:C.c(this.oa,this.start+b,c)};
k.Ua=function(a,b,c){var d=this.start+b;a=this.k;c=Rc.c(this.oa,d,c);b=this.start;var e=this.end,d=d+1,d=e>d?e:d;return Ef.r?Ef.r(a,c,b,d,null):Ef.call(null,a,c,b,d,null)};k.H=function(){return this.k};k.L=function(){return this.end-this.start};k.La=function(){return C.a(this.oa,this.end-1)};k.Ma=function(){if(this.start===this.end)throw Error("Can't pop empty vector");var a=this.k,b=this.oa,c=this.start,d=this.end-1;return Ef.r?Ef.r(a,b,c,d,null):Ef.call(null,a,b,c,d,null)};
k.ab=function(){return this.start!==this.end?new Hc(this,this.end-this.start-1,null):null};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(Mc,this.k)};k.R=function(a,b){return Cc.a(this,b)};k.O=function(a,b,c){return Cc.c(this,b,c)};k.Ka=function(a,b,c){if("number"===typeof b)return pb(this,b,c);throw Error("Subvec's key for assoc must be a number.");};
k.D=function(){var a=this;return function(b){return function d(e){return e===a.end?null:M(C.a(a.oa,e),new V(null,function(){return function(){return d(e+1)}}(b),null,null))}}(this)(a.start)};k.F=function(a,b){var c=this.oa,d=this.start,e=this.end,f=this.p;return Ef.r?Ef.r(b,c,d,e,f):Ef.call(null,b,c,d,e,f)};k.G=function(a,b){var c=this.k,d=pb(this.oa,this.end,b),e=this.start,f=this.end+1;return Ef.r?Ef.r(c,d,e,f,null):Ef.call(null,c,d,e,f,null)};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.Q(null,c);case 3:return this.$(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.Q(null,c)};a.c=function(a,c,d){return this.$(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.b=function(a){return this.Q(null,a)};k.a=function(a,b){return this.$(null,a,b)};Df.prototype[Ea]=function(){return uc(this)};
function Ef(a,b,c,d,e){for(;;)if(b instanceof Df)c=b.start+c,d=b.start+d,b=b.oa;else{var f=Q(b);if(0>c||0>d||c>f||d>f)throw Error("Index out of bounds");return new Df(a,b,c,d,e)}}var Cf=function(){function a(a,b,c){return Ef(null,a,b,c,null)}function b(a,b){return c.c(a,b,Q(a))}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}();
function Ff(a,b){return a===b.u?b:new ef(a,Fa(b.e))}function wf(a){return new ef({},Fa(a.e))}function xf(a){var b=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];hd(a,0,b,0,a.length);return b}
var Hf=function Gf(b,c,d,e){d=Ff(b.root.u,d);var f=b.g-1>>>c&31;if(5===c)b=e;else{var g=d.e[f];b=null!=g?Gf(b,c-5,g,e):jf(b.root.u,c-5,e)}d.e[f]=b;return d},Jf=function If(b,c,d){d=Ff(b.root.u,d);var e=b.g-2>>>c&31;if(5<c){b=If(b,c-5,d.e[e]);if(null==b&&0===e)return null;d.e[e]=b;return d}if(0===e)return null;d.e[e]=null;return d};function vf(a,b,c,d){this.g=a;this.shift=b;this.root=c;this.W=d;this.j=275;this.q=88}k=vf.prototype;
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.t(null,c);case 3:return this.s(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.t(null,c)};a.c=function(a,c,d){return this.s(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.b=function(a){return this.t(null,a)};k.a=function(a,b){return this.s(null,a,b)};k.t=function(a,b){return $a.c(this,b,null)};
k.s=function(a,b,c){return"number"===typeof b?C.c(this,b,c):c};k.Q=function(a,b){if(this.root.u)return of(this,b)[b&31];throw Error("nth after persistent!");};k.$=function(a,b,c){return 0<=b&&b<this.g?C.a(this,b):c};k.L=function(){if(this.root.u)return this.g;throw Error("count after persistent!");};
k.Ub=function(a,b,c){var d=this;if(d.root.u){if(0<=b&&b<d.g)return hf(this)<=b?d.W[b&31]=c:(a=function(){return function f(a,h){var l=Ff(d.root.u,h);if(0===a)l.e[b&31]=c;else{var m=b>>>a&31,p=f(a-5,l.e[m]);l.e[m]=p}return l}}(this).call(null,d.shift,d.root),d.root=a),this;if(b===d.g)return Pb(this,c);throw Error([z("Index "),z(b),z(" out of bounds for TransientVector of length"),z(d.g)].join(""));}throw Error("assoc! after persistent!");};
k.Vb=function(){if(this.root.u){if(0===this.g)throw Error("Can't pop empty vector");if(1===this.g)this.g=0;else if(0<(this.g-1&31))this.g-=1;else{var a;a:if(a=this.g-2,a>=hf(this))a=this.W;else{for(var b=this.root,c=b,d=this.shift;;)if(0<d)c=Ff(b.u,c.e[a>>>d&31]),d-=5;else{a=c.e;break a}a=void 0}b=Jf(this,this.shift,this.root);b=null!=b?b:new ef(this.root.u,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,
null,null,null,null]);5<this.shift&&null==b.e[1]?(this.root=Ff(this.root.u,b.e[0]),this.shift-=5):this.root=b;this.g-=1;this.W=a}return this}throw Error("pop! after persistent!");};k.kb=function(a,b,c){if("number"===typeof b)return Tb(this,b,c);throw Error("TransientVector's key for assoc! must be a number.");};
k.Sa=function(a,b){if(this.root.u){if(32>this.g-hf(this))this.W[this.g&31]=b;else{var c=new ef(this.root.u,this.W),d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];d[0]=b;this.W=d;if(this.g>>>5>1<<this.shift){var d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],e=this.shift+
5;d[0]=this.root;d[1]=jf(this.root.u,this.shift,c);this.root=new ef(this.root.u,d);this.shift=e}else this.root=Hf(this,this.shift,this.root,c)}this.g+=1;return this}throw Error("conj! after persistent!");};k.Ta=function(){if(this.root.u){this.root.u=null;var a=this.g-hf(this),b=Array(a);hd(this.W,0,b,0,a);return new W(null,this.g,this.shift,this.root,b,null)}throw Error("persistent! called twice");};function Kf(a,b,c,d){this.k=a;this.ea=b;this.sa=c;this.p=d;this.q=0;this.j=31850572}k=Kf.prototype;
k.toString=function(){return ec(this)};k.H=function(){return this.k};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(J,this.k)};k.N=function(){return G(this.ea)};k.S=function(){var a=K(this.ea);return a?new Kf(this.k,a,this.sa,null):null==this.sa?Na(this):new Kf(this.k,this.sa,null,null)};k.D=function(){return this};k.F=function(a,b){return new Kf(b,this.ea,this.sa,this.p)};k.G=function(a,b){return M(b,this)};
Kf.prototype[Ea]=function(){return uc(this)};function Lf(a,b,c,d,e){this.k=a;this.count=b;this.ea=c;this.sa=d;this.p=e;this.j=31858766;this.q=8192}k=Lf.prototype;k.toString=function(){return ec(this)};k.H=function(){return this.k};k.L=function(){return this.count};k.La=function(){return G(this.ea)};k.Ma=function(){if(t(this.ea)){var a=K(this.ea);return a?new Lf(this.k,this.count-1,a,this.sa,null):new Lf(this.k,this.count-1,D(this.sa),Mc,null)}return this};
k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(Mf,this.k)};k.N=function(){return G(this.ea)};k.S=function(){return H(D(this))};k.D=function(){var a=D(this.sa),b=this.ea;return t(t(b)?b:a)?new Kf(null,this.ea,D(a),null):null};k.F=function(a,b){return new Lf(b,this.count,this.ea,this.sa,this.p)};
k.G=function(a,b){var c;t(this.ea)?(c=this.sa,c=new Lf(this.k,this.count+1,this.ea,Nc.a(t(c)?c:Mc,b),null)):c=new Lf(this.k,this.count+1,Nc.a(this.ea,b),Mc,null);return c};var Mf=new Lf(null,0,null,Mc,0);Lf.prototype[Ea]=function(){return uc(this)};function Nf(){this.q=0;this.j=2097152}Nf.prototype.A=function(){return!1};var Of=new Nf;function Pf(a,b){return md(dd(b)?Q(a)===Q(b)?Ee(ud,Oe.a(function(a){return sc.a(S.c(b,G(a),Of),Lc(a))},a)):null:null)}
function Qf(a,b){var c=a.e;if(b instanceof U)a:{for(var d=c.length,e=b.pa,f=0;;){if(d<=f){c=-1;break a}var g=c[f];if(g instanceof U&&e===g.pa){c=f;break a}f+=2}c=void 0}else if(d="string"==typeof b,t(t(d)?d:"number"===typeof b))a:{d=c.length;for(e=0;;){if(d<=e){c=-1;break a}if(b===c[e]){c=e;break a}e+=2}c=void 0}else if(b instanceof qc)a:{d=c.length;e=b.ta;for(f=0;;){if(d<=f){c=-1;break a}g=c[f];if(g instanceof qc&&e===g.ta){c=f;break a}f+=2}c=void 0}else if(null==b)a:{d=c.length;for(e=0;;){if(d<=
e){c=-1;break a}if(null==c[e]){c=e;break a}e+=2}c=void 0}else a:{d=c.length;for(e=0;;){if(d<=e){c=-1;break a}if(sc.a(b,c[e])){c=e;break a}e+=2}c=void 0}return c}function Rf(a,b,c){this.e=a;this.m=b;this.Z=c;this.q=0;this.j=32374990}k=Rf.prototype;k.toString=function(){return ec(this)};k.H=function(){return this.Z};k.T=function(){return this.m<this.e.length-2?new Rf(this.e,this.m+2,this.Z):null};k.L=function(){return(this.e.length-this.m)/2};k.B=function(){return wc(this)};
k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(J,this.Z)};k.R=function(a,b){return P.a(b,this)};k.O=function(a,b,c){return P.c(b,c,this)};k.N=function(){return new W(null,2,5,uf,[this.e[this.m],this.e[this.m+1]],null)};k.S=function(){return this.m<this.e.length-2?new Rf(this.e,this.m+2,this.Z):J};k.D=function(){return this};k.F=function(a,b){return new Rf(this.e,this.m,b)};k.G=function(a,b){return M(b,this)};Rf.prototype[Ea]=function(){return uc(this)};
function Sf(a,b,c){this.e=a;this.m=b;this.g=c}Sf.prototype.ga=function(){return this.m<this.g};Sf.prototype.next=function(){var a=new W(null,2,5,uf,[this.e[this.m],this.e[this.m+1]],null);this.m+=2;return a};function pa(a,b,c,d){this.k=a;this.g=b;this.e=c;this.p=d;this.j=16647951;this.q=8196}k=pa.prototype;k.toString=function(){return ec(this)};k.t=function(a,b){return $a.c(this,b,null)};k.s=function(a,b,c){a=Qf(this,b);return-1===a?c:this.e[a+1]};
k.gb=function(a,b,c){a=this.e.length;for(var d=0;;)if(d<a){var e=this.e[d],f=this.e[d+1];c=b.c?b.c(c,e,f):b.call(null,c,e,f);if(Ac(c))return b=c,L.b?L.b(b):L.call(null,b);d+=2}else return c};k.vb=!0;k.fb=function(){return new Sf(this.e,0,2*this.g)};k.H=function(){return this.k};k.L=function(){return this.g};k.B=function(){var a=this.p;return null!=a?a:this.p=a=xc(this)};
k.A=function(a,b){if(b&&(b.j&1024||b.ic)){var c=this.e.length;if(this.g===b.L(null))for(var d=0;;)if(d<c){var e=b.s(null,this.e[d],jd);if(e!==jd)if(sc.a(this.e[d+1],e))d+=2;else return!1;else return!1}else return!0;else return!1}else return Pf(this,b)};k.$a=function(){return new Tf({},this.e.length,Fa(this.e))};k.J=function(){return ub(Uf,this.k)};k.R=function(a,b){return P.a(b,this)};k.O=function(a,b,c){return P.c(b,c,this)};
k.wb=function(a,b){if(0<=Qf(this,b)){var c=this.e.length,d=c-2;if(0===d)return Na(this);for(var d=Array(d),e=0,f=0;;){if(e>=c)return new pa(this.k,this.g-1,d,null);sc.a(b,this.e[e])||(d[f]=this.e[e],d[f+1]=this.e[e+1],f+=2);e+=2}}else return this};
k.Ka=function(a,b,c){a=Qf(this,b);if(-1===a){if(this.g<Vf){a=this.e;for(var d=a.length,e=Array(d+2),f=0;;)if(f<d)e[f]=a[f],f+=1;else break;e[d]=b;e[d+1]=c;return new pa(this.k,this.g+1,e,null)}return ub(cb(af.a(Qc,this),b,c),this.k)}if(c===this.e[a+1])return this;b=Fa(this.e);b[a+1]=c;return new pa(this.k,this.g,b,null)};k.rb=function(a,b){return-1!==Qf(this,b)};k.D=function(){var a=this.e;return 0<=a.length-2?new Rf(a,0,null):null};k.F=function(a,b){return new pa(b,this.g,this.e,this.p)};
k.G=function(a,b){if(ed(b))return cb(this,C.a(b,0),C.a(b,1));for(var c=this,d=D(b);;){if(null==d)return c;var e=G(d);if(ed(e))c=cb(c,C.a(e,0),C.a(e,1)),d=K(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.t(null,c);case 3:return this.s(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.t(null,c)};a.c=function(a,c,d){return this.s(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.b=function(a){return this.t(null,a)};k.a=function(a,b){return this.s(null,a,b)};var Uf=new pa(null,0,[],null),Vf=8;pa.prototype[Ea]=function(){return uc(this)};
function Tf(a,b,c){this.Va=a;this.qa=b;this.e=c;this.q=56;this.j=258}k=Tf.prototype;k.Jb=function(a,b){if(t(this.Va)){var c=Qf(this,b);0<=c&&(this.e[c]=this.e[this.qa-2],this.e[c+1]=this.e[this.qa-1],c=this.e,c.pop(),c.pop(),this.qa-=2);return this}throw Error("dissoc! after persistent!");};
k.kb=function(a,b,c){var d=this;if(t(d.Va)){a=Qf(this,b);if(-1===a)return d.qa+2<=2*Vf?(d.qa+=2,d.e.push(b),d.e.push(c),this):ee.c(function(){var a=d.qa,b=d.e;return Xf.a?Xf.a(a,b):Xf.call(null,a,b)}(),b,c);c!==d.e[a+1]&&(d.e[a+1]=c);return this}throw Error("assoc! after persistent!");};
k.Sa=function(a,b){if(t(this.Va)){if(b?b.j&2048||b.jc||(b.j?0:w(fb,b)):w(fb,b))return Rb(this,Yf.b?Yf.b(b):Yf.call(null,b),Zf.b?Zf.b(b):Zf.call(null,b));for(var c=D(b),d=this;;){var e=G(c);if(t(e))var f=e,c=K(c),d=Rb(d,function(){var a=f;return Yf.b?Yf.b(a):Yf.call(null,a)}(),function(){var a=f;return Zf.b?Zf.b(a):Zf.call(null,a)}());else return d}}else throw Error("conj! after persistent!");};
k.Ta=function(){if(t(this.Va))return this.Va=!1,new pa(null,Cd(this.qa,2),this.e,null);throw Error("persistent! called twice");};k.t=function(a,b){return $a.c(this,b,null)};k.s=function(a,b,c){if(t(this.Va))return a=Qf(this,b),-1===a?c:this.e[a+1];throw Error("lookup after persistent!");};k.L=function(){if(t(this.Va))return Cd(this.qa,2);throw Error("count after persistent!");};function Xf(a,b){for(var c=Ob(Qc),d=0;;)if(d<a)c=ee.c(c,b[d],b[d+1]),d+=2;else return c}function $f(){this.o=!1}
function ag(a,b){return a===b?!0:Nd(a,b)?!0:sc.a(a,b)}var bg=function(){function a(a,b,c,g,h){a=Fa(a);a[b]=c;a[g]=h;return a}function b(a,b,c){a=Fa(a);a[b]=c;return a}var c=null,c=function(c,e,f,g,h){switch(arguments.length){case 3:return b.call(this,c,e,f);case 5:return a.call(this,c,e,f,g,h)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.r=a;return c}();function cg(a,b){var c=Array(a.length-2);hd(a,0,c,0,2*b);hd(a,2*(b+1),c,2*b,c.length-2*b);return c}
var dg=function(){function a(a,b,c,g,h,l){a=a.Na(b);a.e[c]=g;a.e[h]=l;return a}function b(a,b,c,g){a=a.Na(b);a.e[c]=g;return a}var c=null,c=function(c,e,f,g,h,l){switch(arguments.length){case 4:return b.call(this,c,e,f,g);case 6:return a.call(this,c,e,f,g,h,l)}throw Error("Invalid arity: "+arguments.length);};c.n=b;c.P=a;return c}();
function eg(a,b,c){for(var d=a.length,e=0,f=c;;)if(e<d){c=a[e];if(null!=c){var g=a[e+1];c=b.c?b.c(f,c,g):b.call(null,f,c,g)}else c=a[e+1],c=null!=c?c.Xa(b,f):f;if(Ac(c))return a=c,L.b?L.b(a):L.call(null,a);e+=2;f=c}else return f}function fg(a,b,c){this.u=a;this.w=b;this.e=c}k=fg.prototype;k.Na=function(a){if(a===this.u)return this;var b=Dd(this.w),c=Array(0>b?4:2*(b+1));hd(this.e,0,c,0,2*b);return new fg(a,this.w,c)};
k.nb=function(a,b,c,d,e){var f=1<<(c>>>b&31);if(0===(this.w&f))return this;var g=Dd(this.w&f-1),h=this.e[2*g],l=this.e[2*g+1];return null==h?(b=l.nb(a,b+5,c,d,e),b===l?this:null!=b?dg.n(this,a,2*g+1,b):this.w===f?null:gg(this,a,f,g)):ag(d,h)?(e[0]=!0,gg(this,a,f,g)):this};function gg(a,b,c,d){if(a.w===c)return null;a=a.Na(b);b=a.e;var e=b.length;a.w^=c;hd(b,2*(d+1),b,2*d,e-2*(d+1));b[e-2]=null;b[e-1]=null;return a}k.lb=function(){var a=this.e;return hg.b?hg.b(a):hg.call(null,a)};
k.Xa=function(a,b){return eg(this.e,a,b)};k.Oa=function(a,b,c,d){var e=1<<(b>>>a&31);if(0===(this.w&e))return d;var f=Dd(this.w&e-1),e=this.e[2*f],f=this.e[2*f+1];return null==e?f.Oa(a+5,b,c,d):ag(c,e)?f:d};
k.la=function(a,b,c,d,e,f){var g=1<<(c>>>b&31),h=Dd(this.w&g-1);if(0===(this.w&g)){var l=Dd(this.w);if(2*l<this.e.length){var m=this.Na(a),p=m.e;f.o=!0;id(p,2*h,p,2*(h+1),2*(l-h));p[2*h]=d;p[2*h+1]=e;m.w|=g;return m}if(16<=l){g=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];g[c>>>b&31]=ig.la(a,b+5,c,d,e,f);for(m=h=0;;)if(32>h)0!==(this.w>>>h&1)&&(g[h]=null!=this.e[m]?ig.la(a,b+5,nc(this.e[m]),
this.e[m],this.e[m+1],f):this.e[m+1],m+=2),h+=1;else break;return new jg(a,l+1,g)}p=Array(2*(l+4));hd(this.e,0,p,0,2*h);p[2*h]=d;p[2*h+1]=e;hd(this.e,2*h,p,2*(h+1),2*(l-h));f.o=!0;m=this.Na(a);m.e=p;m.w|=g;return m}var q=this.e[2*h],s=this.e[2*h+1];if(null==q)return l=s.la(a,b+5,c,d,e,f),l===s?this:dg.n(this,a,2*h+1,l);if(ag(d,q))return e===s?this:dg.n(this,a,2*h+1,e);f.o=!0;return dg.P(this,a,2*h,null,2*h+1,function(){var f=b+5;return kg.ia?kg.ia(a,f,q,s,c,d,e):kg.call(null,a,f,q,s,c,d,e)}())};
k.ka=function(a,b,c,d,e){var f=1<<(b>>>a&31),g=Dd(this.w&f-1);if(0===(this.w&f)){var h=Dd(this.w);if(16<=h){f=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];f[b>>>a&31]=ig.ka(a+5,b,c,d,e);for(var l=g=0;;)if(32>g)0!==(this.w>>>g&1)&&(f[g]=null!=this.e[l]?ig.ka(a+5,nc(this.e[l]),this.e[l],this.e[l+1],e):this.e[l+1],l+=2),g+=1;else break;return new jg(null,h+1,f)}l=Array(2*(h+1));hd(this.e,
0,l,0,2*g);l[2*g]=c;l[2*g+1]=d;hd(this.e,2*g,l,2*(g+1),2*(h-g));e.o=!0;return new fg(null,this.w|f,l)}var m=this.e[2*g],p=this.e[2*g+1];if(null==m)return h=p.ka(a+5,b,c,d,e),h===p?this:new fg(null,this.w,bg.c(this.e,2*g+1,h));if(ag(c,m))return d===p?this:new fg(null,this.w,bg.c(this.e,2*g+1,d));e.o=!0;return new fg(null,this.w,bg.r(this.e,2*g,null,2*g+1,function(){var e=a+5;return kg.P?kg.P(e,m,p,b,c,d):kg.call(null,e,m,p,b,c,d)}()))};
k.mb=function(a,b,c){var d=1<<(b>>>a&31);if(0===(this.w&d))return this;var e=Dd(this.w&d-1),f=this.e[2*e],g=this.e[2*e+1];return null==f?(a=g.mb(a+5,b,c),a===g?this:null!=a?new fg(null,this.w,bg.c(this.e,2*e+1,a)):this.w===d?null:new fg(null,this.w^d,cg(this.e,e))):ag(c,f)?new fg(null,this.w^d,cg(this.e,e)):this};var ig=new fg(null,0,[]);
function lg(a,b,c){var d=a.e,e=d.length;a=Array(2*(a.g-1));for(var f=0,g=1,h=0;;)if(f<e)f!==c&&null!=d[f]&&(a[g]=d[f],g+=2,h|=1<<f),f+=1;else return new fg(b,h,a)}function jg(a,b,c){this.u=a;this.g=b;this.e=c}k=jg.prototype;k.Na=function(a){return a===this.u?this:new jg(a,this.g,Fa(this.e))};
k.nb=function(a,b,c,d,e){var f=c>>>b&31,g=this.e[f];if(null==g)return this;b=g.nb(a,b+5,c,d,e);if(b===g)return this;if(null==b){if(8>=this.g)return lg(this,a,f);a=dg.n(this,a,f,b);a.g-=1;return a}return dg.n(this,a,f,b)};k.lb=function(){var a=this.e;return mg.b?mg.b(a):mg.call(null,a)};k.Xa=function(a,b){for(var c=this.e.length,d=0,e=b;;)if(d<c){var f=this.e[d];if(null!=f&&(e=f.Xa(a,e),Ac(e)))return c=e,L.b?L.b(c):L.call(null,c);d+=1}else return e};
k.Oa=function(a,b,c,d){var e=this.e[b>>>a&31];return null!=e?e.Oa(a+5,b,c,d):d};k.la=function(a,b,c,d,e,f){var g=c>>>b&31,h=this.e[g];if(null==h)return a=dg.n(this,a,g,ig.la(a,b+5,c,d,e,f)),a.g+=1,a;b=h.la(a,b+5,c,d,e,f);return b===h?this:dg.n(this,a,g,b)};k.ka=function(a,b,c,d,e){var f=b>>>a&31,g=this.e[f];if(null==g)return new jg(null,this.g+1,bg.c(this.e,f,ig.ka(a+5,b,c,d,e)));a=g.ka(a+5,b,c,d,e);return a===g?this:new jg(null,this.g,bg.c(this.e,f,a))};
k.mb=function(a,b,c){var d=b>>>a&31,e=this.e[d];return null!=e?(a=e.mb(a+5,b,c),a===e?this:null==a?8>=this.g?lg(this,null,d):new jg(null,this.g-1,bg.c(this.e,d,a)):new jg(null,this.g,bg.c(this.e,d,a))):this};function ng(a,b,c){b*=2;for(var d=0;;)if(d<b){if(ag(c,a[d]))return d;d+=2}else return-1}function og(a,b,c,d){this.u=a;this.Ia=b;this.g=c;this.e=d}k=og.prototype;k.Na=function(a){if(a===this.u)return this;var b=Array(2*(this.g+1));hd(this.e,0,b,0,2*this.g);return new og(a,this.Ia,this.g,b)};
k.nb=function(a,b,c,d,e){b=ng(this.e,this.g,d);if(-1===b)return this;e[0]=!0;if(1===this.g)return null;a=this.Na(a);e=a.e;e[b]=e[2*this.g-2];e[b+1]=e[2*this.g-1];e[2*this.g-1]=null;e[2*this.g-2]=null;a.g-=1;return a};k.lb=function(){var a=this.e;return hg.b?hg.b(a):hg.call(null,a)};k.Xa=function(a,b){return eg(this.e,a,b)};k.Oa=function(a,b,c,d){a=ng(this.e,this.g,c);return 0>a?d:ag(c,this.e[a])?this.e[a+1]:d};
k.la=function(a,b,c,d,e,f){if(c===this.Ia){b=ng(this.e,this.g,d);if(-1===b){if(this.e.length>2*this.g)return a=dg.P(this,a,2*this.g,d,2*this.g+1,e),f.o=!0,a.g+=1,a;c=this.e.length;b=Array(c+2);hd(this.e,0,b,0,c);b[c]=d;b[c+1]=e;f.o=!0;f=this.g+1;a===this.u?(this.e=b,this.g=f,a=this):a=new og(this.u,this.Ia,f,b);return a}return this.e[b+1]===e?this:dg.n(this,a,b+1,e)}return(new fg(a,1<<(this.Ia>>>b&31),[null,this,null,null])).la(a,b,c,d,e,f)};
k.ka=function(a,b,c,d,e){return b===this.Ia?(a=ng(this.e,this.g,c),-1===a?(a=2*this.g,b=Array(a+2),hd(this.e,0,b,0,a),b[a]=c,b[a+1]=d,e.o=!0,new og(null,this.Ia,this.g+1,b)):sc.a(this.e[a],d)?this:new og(null,this.Ia,this.g,bg.c(this.e,a+1,d))):(new fg(null,1<<(this.Ia>>>a&31),[null,this])).ka(a,b,c,d,e)};k.mb=function(a,b,c){a=ng(this.e,this.g,c);return-1===a?this:1===this.g?null:new og(null,this.Ia,this.g-1,cg(this.e,Cd(a,2)))};
var kg=function(){function a(a,b,c,g,h,l,m){var p=nc(c);if(p===h)return new og(null,p,2,[c,g,l,m]);var q=new $f;return ig.la(a,b,p,c,g,q).la(a,b,h,l,m,q)}function b(a,b,c,g,h,l){var m=nc(b);if(m===g)return new og(null,m,2,[b,c,h,l]);var p=new $f;return ig.ka(a,m,b,c,p).ka(a,g,h,l,p)}var c=null,c=function(c,e,f,g,h,l,m){switch(arguments.length){case 6:return b.call(this,c,e,f,g,h,l);case 7:return a.call(this,c,e,f,g,h,l,m)}throw Error("Invalid arity: "+arguments.length);};c.P=b;c.ia=a;return c}();
function pg(a,b,c,d,e){this.k=a;this.Pa=b;this.m=c;this.C=d;this.p=e;this.q=0;this.j=32374860}k=pg.prototype;k.toString=function(){return ec(this)};k.H=function(){return this.k};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(J,this.k)};k.R=function(a,b){return P.a(b,this)};k.O=function(a,b,c){return P.c(b,c,this)};k.N=function(){return null==this.C?new W(null,2,5,uf,[this.Pa[this.m],this.Pa[this.m+1]],null):G(this.C)};
k.S=function(){if(null==this.C){var a=this.Pa,b=this.m+2;return hg.c?hg.c(a,b,null):hg.call(null,a,b,null)}var a=this.Pa,b=this.m,c=K(this.C);return hg.c?hg.c(a,b,c):hg.call(null,a,b,c)};k.D=function(){return this};k.F=function(a,b){return new pg(b,this.Pa,this.m,this.C,this.p)};k.G=function(a,b){return M(b,this)};pg.prototype[Ea]=function(){return uc(this)};
var hg=function(){function a(a,b,c){if(null==c)for(c=a.length;;)if(b<c){if(null!=a[b])return new pg(null,a,b,null,null);var g=a[b+1];if(t(g)&&(g=g.lb(),t(g)))return new pg(null,a,b+2,g,null);b+=2}else return null;else return new pg(null,a,b,c,null)}function b(a){return c.c(a,0,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 1:return b.call(this,c);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.c=a;return c}();
function qg(a,b,c,d,e){this.k=a;this.Pa=b;this.m=c;this.C=d;this.p=e;this.q=0;this.j=32374860}k=qg.prototype;k.toString=function(){return ec(this)};k.H=function(){return this.k};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(J,this.k)};k.R=function(a,b){return P.a(b,this)};k.O=function(a,b,c){return P.c(b,c,this)};k.N=function(){return G(this.C)};
k.S=function(){var a=this.Pa,b=this.m,c=K(this.C);return mg.n?mg.n(null,a,b,c):mg.call(null,null,a,b,c)};k.D=function(){return this};k.F=function(a,b){return new qg(b,this.Pa,this.m,this.C,this.p)};k.G=function(a,b){return M(b,this)};qg.prototype[Ea]=function(){return uc(this)};
var mg=function(){function a(a,b,c,g){if(null==g)for(g=b.length;;)if(c<g){var h=b[c];if(t(h)&&(h=h.lb(),t(h)))return new qg(a,b,c+1,h,null);c+=1}else return null;else return new qg(a,b,c,g,null)}function b(a){return c.n(null,a,0,null)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 1:return b.call(this,c);case 4:return a.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.n=a;return c}();
function rg(a,b,c,d,e,f){this.k=a;this.g=b;this.root=c;this.U=d;this.da=e;this.p=f;this.j=16123663;this.q=8196}k=rg.prototype;k.toString=function(){return ec(this)};k.t=function(a,b){return $a.c(this,b,null)};k.s=function(a,b,c){return null==b?this.U?this.da:c:null==this.root?c:this.root.Oa(0,nc(b),b,c)};k.gb=function(a,b,c){this.U&&(a=this.da,c=b.c?b.c(c,null,a):b.call(null,c,null,a));return Ac(c)?L.b?L.b(c):L.call(null,c):null!=this.root?this.root.Xa(b,c):c};k.H=function(){return this.k};k.L=function(){return this.g};
k.B=function(){var a=this.p;return null!=a?a:this.p=a=xc(this)};k.A=function(a,b){return Pf(this,b)};k.$a=function(){return new sg({},this.root,this.g,this.U,this.da)};k.J=function(){return ub(Qc,this.k)};k.wb=function(a,b){if(null==b)return this.U?new rg(this.k,this.g-1,this.root,!1,null,null):this;if(null==this.root)return this;var c=this.root.mb(0,nc(b),b);return c===this.root?this:new rg(this.k,this.g-1,c,this.U,this.da,null)};
k.Ka=function(a,b,c){if(null==b)return this.U&&c===this.da?this:new rg(this.k,this.U?this.g:this.g+1,this.root,!0,c,null);a=new $f;b=(null==this.root?ig:this.root).ka(0,nc(b),b,c,a);return b===this.root?this:new rg(this.k,a.o?this.g+1:this.g,b,this.U,this.da,null)};k.rb=function(a,b){return null==b?this.U:null==this.root?!1:this.root.Oa(0,nc(b),b,jd)!==jd};k.D=function(){if(0<this.g){var a=null!=this.root?this.root.lb():null;return this.U?M(new W(null,2,5,uf,[null,this.da],null),a):a}return null};
k.F=function(a,b){return new rg(b,this.g,this.root,this.U,this.da,this.p)};k.G=function(a,b){if(ed(b))return cb(this,C.a(b,0),C.a(b,1));for(var c=this,d=D(b);;){if(null==d)return c;var e=G(d);if(ed(e))c=cb(c,C.a(e,0),C.a(e,1)),d=K(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.t(null,c);case 3:return this.s(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.t(null,c)};a.c=function(a,c,d){return this.s(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.b=function(a){return this.t(null,a)};k.a=function(a,b){return this.s(null,a,b)};var Qc=new rg(null,0,null,!1,null,0);rg.prototype[Ea]=function(){return uc(this)};
function sg(a,b,c,d,e){this.u=a;this.root=b;this.count=c;this.U=d;this.da=e;this.q=56;this.j=258}k=sg.prototype;k.Jb=function(a,b){if(this.u)if(null==b)this.U&&(this.U=!1,this.da=null,this.count-=1);else{if(null!=this.root){var c=new $f,d=this.root.nb(this.u,0,nc(b),b,c);d!==this.root&&(this.root=d);t(c[0])&&(this.count-=1)}}else throw Error("dissoc! after persistent!");return this};k.kb=function(a,b,c){return tg(this,b,c)};k.Sa=function(a,b){return ug(this,b)};
k.Ta=function(){var a;if(this.u)this.u=null,a=new rg(null,this.count,this.root,this.U,this.da,null);else throw Error("persistent! called twice");return a};k.t=function(a,b){return null==b?this.U?this.da:null:null==this.root?null:this.root.Oa(0,nc(b),b)};k.s=function(a,b,c){return null==b?this.U?this.da:c:null==this.root?c:this.root.Oa(0,nc(b),b,c)};k.L=function(){if(this.u)return this.count;throw Error("count after persistent!");};
function ug(a,b){if(a.u){if(b?b.j&2048||b.jc||(b.j?0:w(fb,b)):w(fb,b))return tg(a,Yf.b?Yf.b(b):Yf.call(null,b),Zf.b?Zf.b(b):Zf.call(null,b));for(var c=D(b),d=a;;){var e=G(c);if(t(e))var f=e,c=K(c),d=tg(d,function(){var a=f;return Yf.b?Yf.b(a):Yf.call(null,a)}(),function(){var a=f;return Zf.b?Zf.b(a):Zf.call(null,a)}());else return d}}else throw Error("conj! after persistent");}
function tg(a,b,c){if(a.u){if(null==b)a.da!==c&&(a.da=c),a.U||(a.count+=1,a.U=!0);else{var d=new $f;b=(null==a.root?ig:a.root).la(a.u,0,nc(b),b,c,d);b!==a.root&&(a.root=b);d.o&&(a.count+=1)}return a}throw Error("assoc! after persistent!");}function vg(a,b,c){for(var d=b;;)if(null!=a)b=c?a.left:a.right,d=Nc.a(d,a),a=b;else return d}function wg(a,b,c,d,e){this.k=a;this.stack=b;this.pb=c;this.g=d;this.p=e;this.q=0;this.j=32374862}k=wg.prototype;k.toString=function(){return ec(this)};k.H=function(){return this.k};
k.L=function(){return 0>this.g?Q(K(this))+1:this.g};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(J,this.k)};k.R=function(a,b){return P.a(b,this)};k.O=function(a,b,c){return P.c(b,c,this)};k.N=function(){return Wc(this.stack)};k.S=function(){var a=G(this.stack),a=vg(this.pb?a.right:a.left,K(this.stack),this.pb);return null!=a?new wg(null,a,this.pb,this.g-1,null):J};k.D=function(){return this};
k.F=function(a,b){return new wg(b,this.stack,this.pb,this.g,this.p)};k.G=function(a,b){return M(b,this)};wg.prototype[Ea]=function(){return uc(this)};function xg(a,b,c){return new wg(null,vg(a,null,b),b,c,null)}
function yg(a,b,c,d){return c instanceof X?c.left instanceof X?new X(c.key,c.o,c.left.ua(),new Z(a,b,c.right,d,null),null):c.right instanceof X?new X(c.right.key,c.right.o,new Z(c.key,c.o,c.left,c.right.left,null),new Z(a,b,c.right.right,d,null),null):new Z(a,b,c,d,null):new Z(a,b,c,d,null)}
function zg(a,b,c,d){return d instanceof X?d.right instanceof X?new X(d.key,d.o,new Z(a,b,c,d.left,null),d.right.ua(),null):d.left instanceof X?new X(d.left.key,d.left.o,new Z(a,b,c,d.left.left,null),new Z(d.key,d.o,d.left.right,d.right,null),null):new Z(a,b,c,d,null):new Z(a,b,c,d,null)}
function Ag(a,b,c,d){if(c instanceof X)return new X(a,b,c.ua(),d,null);if(d instanceof Z)return zg(a,b,c,d.ob());if(d instanceof X&&d.left instanceof Z)return new X(d.left.key,d.left.o,new Z(a,b,c,d.left.left,null),zg(d.key,d.o,d.left.right,d.right.ob()),null);throw Error("red-black tree invariant violation");}
var Cg=function Bg(b,c,d){d=null!=b.left?Bg(b.left,c,d):d;if(Ac(d))return L.b?L.b(d):L.call(null,d);var e=b.key,f=b.o;d=c.c?c.c(d,e,f):c.call(null,d,e,f);if(Ac(d))return L.b?L.b(d):L.call(null,d);b=null!=b.right?Bg(b.right,c,d):d;return Ac(b)?L.b?L.b(b):L.call(null,b):b};function Z(a,b,c,d,e){this.key=a;this.o=b;this.left=c;this.right=d;this.p=e;this.q=0;this.j=32402207}k=Z.prototype;k.Mb=function(a){return a.Ob(this)};k.ob=function(){return new X(this.key,this.o,this.left,this.right,null)};
k.ua=function(){return this};k.Lb=function(a){return a.Nb(this)};k.replace=function(a,b,c,d){return new Z(a,b,c,d,null)};k.Nb=function(a){return new Z(a.key,a.o,this,a.right,null)};k.Ob=function(a){return new Z(a.key,a.o,a.left,this,null)};k.Xa=function(a,b){return Cg(this,a,b)};k.t=function(a,b){return C.c(this,b,null)};k.s=function(a,b,c){return C.c(this,b,c)};k.Q=function(a,b){return 0===b?this.key:1===b?this.o:null};k.$=function(a,b,c){return 0===b?this.key:1===b?this.o:c};
k.Ua=function(a,b,c){return(new W(null,2,5,uf,[this.key,this.o],null)).Ua(null,b,c)};k.H=function(){return null};k.L=function(){return 2};k.hb=function(){return this.key};k.ib=function(){return this.o};k.La=function(){return this.o};k.Ma=function(){return new W(null,1,5,uf,[this.key],null)};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return Mc};k.R=function(a,b){return Cc.a(this,b)};k.O=function(a,b,c){return Cc.c(this,b,c)};
k.Ka=function(a,b,c){return Rc.c(new W(null,2,5,uf,[this.key,this.o],null),b,c)};k.D=function(){return Ra(Ra(J,this.o),this.key)};k.F=function(a,b){return O(new W(null,2,5,uf,[this.key,this.o],null),b)};k.G=function(a,b){return new W(null,3,5,uf,[this.key,this.o,b],null)};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.t(null,c);case 3:return this.s(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.t(null,c)};a.c=function(a,c,d){return this.s(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.b=function(a){return this.t(null,a)};k.a=function(a,b){return this.s(null,a,b)};Z.prototype[Ea]=function(){return uc(this)};
function X(a,b,c,d,e){this.key=a;this.o=b;this.left=c;this.right=d;this.p=e;this.q=0;this.j=32402207}k=X.prototype;k.Mb=function(a){return new X(this.key,this.o,this.left,a,null)};k.ob=function(){throw Error("red-black tree invariant violation");};k.ua=function(){return new Z(this.key,this.o,this.left,this.right,null)};k.Lb=function(a){return new X(this.key,this.o,a,this.right,null)};k.replace=function(a,b,c,d){return new X(a,b,c,d,null)};
k.Nb=function(a){return this.left instanceof X?new X(this.key,this.o,this.left.ua(),new Z(a.key,a.o,this.right,a.right,null),null):this.right instanceof X?new X(this.right.key,this.right.o,new Z(this.key,this.o,this.left,this.right.left,null),new Z(a.key,a.o,this.right.right,a.right,null),null):new Z(a.key,a.o,this,a.right,null)};
k.Ob=function(a){return this.right instanceof X?new X(this.key,this.o,new Z(a.key,a.o,a.left,this.left,null),this.right.ua(),null):this.left instanceof X?new X(this.left.key,this.left.o,new Z(a.key,a.o,a.left,this.left.left,null),new Z(this.key,this.o,this.left.right,this.right,null),null):new Z(a.key,a.o,a.left,this,null)};k.Xa=function(a,b){return Cg(this,a,b)};k.t=function(a,b){return C.c(this,b,null)};k.s=function(a,b,c){return C.c(this,b,c)};
k.Q=function(a,b){return 0===b?this.key:1===b?this.o:null};k.$=function(a,b,c){return 0===b?this.key:1===b?this.o:c};k.Ua=function(a,b,c){return(new W(null,2,5,uf,[this.key,this.o],null)).Ua(null,b,c)};k.H=function(){return null};k.L=function(){return 2};k.hb=function(){return this.key};k.ib=function(){return this.o};k.La=function(){return this.o};k.Ma=function(){return new W(null,1,5,uf,[this.key],null)};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};
k.A=function(a,b){return Ic(this,b)};k.J=function(){return Mc};k.R=function(a,b){return Cc.a(this,b)};k.O=function(a,b,c){return Cc.c(this,b,c)};k.Ka=function(a,b,c){return Rc.c(new W(null,2,5,uf,[this.key,this.o],null),b,c)};k.D=function(){return Ra(Ra(J,this.o),this.key)};k.F=function(a,b){return O(new W(null,2,5,uf,[this.key,this.o],null),b)};k.G=function(a,b){return new W(null,3,5,uf,[this.key,this.o,b],null)};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.t(null,c);case 3:return this.s(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.t(null,c)};a.c=function(a,c,d){return this.s(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.b=function(a){return this.t(null,a)};k.a=function(a,b){return this.s(null,a,b)};X.prototype[Ea]=function(){return uc(this)};
var Eg=function Dg(b,c,d,e,f){if(null==c)return new X(d,e,null,null,null);var g;g=c.key;g=b.a?b.a(d,g):b.call(null,d,g);if(0===g)return f[0]=c,null;if(0>g)return b=Dg(b,c.left,d,e,f),null!=b?c.Lb(b):null;b=Dg(b,c.right,d,e,f);return null!=b?c.Mb(b):null},Gg=function Fg(b,c){if(null==b)return c;if(null==c)return b;if(b instanceof X){if(c instanceof X){var d=Fg(b.right,c.left);return d instanceof X?new X(d.key,d.o,new X(b.key,b.o,b.left,d.left,null),new X(c.key,c.o,d.right,c.right,null),null):new X(b.key,
b.o,b.left,new X(c.key,c.o,d,c.right,null),null)}return new X(b.key,b.o,b.left,Fg(b.right,c),null)}if(c instanceof X)return new X(c.key,c.o,Fg(b,c.left),c.right,null);d=Fg(b.right,c.left);return d instanceof X?new X(d.key,d.o,new Z(b.key,b.o,b.left,d.left,null),new Z(c.key,c.o,d.right,c.right,null),null):Ag(b.key,b.o,b.left,new Z(c.key,c.o,d,c.right,null))},Ig=function Hg(b,c,d,e){if(null!=c){var f;f=c.key;f=b.a?b.a(d,f):b.call(null,d,f);if(0===f)return e[0]=c,Gg(c.left,c.right);if(0>f)return b=Hg(b,
c.left,d,e),null!=b||null!=e[0]?c.left instanceof Z?Ag(c.key,c.o,b,c.right):new X(c.key,c.o,b,c.right,null):null;b=Hg(b,c.right,d,e);if(null!=b||null!=e[0])if(c.right instanceof Z)if(e=c.key,d=c.o,c=c.left,b instanceof X)c=new X(e,d,c,b.ua(),null);else if(c instanceof Z)c=yg(e,d,c.ob(),b);else if(c instanceof X&&c.right instanceof Z)c=new X(c.right.key,c.right.o,yg(c.key,c.o,c.left.ob(),c.right.left),new Z(e,d,c.right.right,b,null),null);else throw Error("red-black tree invariant violation");else c=
new X(c.key,c.o,c.left,b,null);else c=null;return c}return null},Kg=function Jg(b,c,d,e){var f=c.key,g=b.a?b.a(d,f):b.call(null,d,f);return 0===g?c.replace(f,e,c.left,c.right):0>g?c.replace(f,c.o,Jg(b,c.left,d,e),c.right):c.replace(f,c.o,c.left,Jg(b,c.right,d,e))};function Lg(a,b,c,d,e){this.aa=a;this.na=b;this.g=c;this.k=d;this.p=e;this.j=418776847;this.q=8192}k=Lg.prototype;k.toString=function(){return ec(this)};
function Mg(a,b){for(var c=a.na;;)if(null!=c){var d;d=c.key;d=a.aa.a?a.aa.a(b,d):a.aa.call(null,b,d);if(0===d)return c;c=0>d?c.left:c.right}else return null}k.t=function(a,b){return $a.c(this,b,null)};k.s=function(a,b,c){a=Mg(this,b);return null!=a?a.o:c};k.gb=function(a,b,c){return null!=this.na?Cg(this.na,b,c):c};k.H=function(){return this.k};k.L=function(){return this.g};k.ab=function(){return 0<this.g?xg(this.na,!1,this.g):null};k.B=function(){var a=this.p;return null!=a?a:this.p=a=xc(this)};
k.A=function(a,b){return Pf(this,b)};k.J=function(){return new Lg(this.aa,null,0,this.k,0)};k.wb=function(a,b){var c=[null],d=Ig(this.aa,this.na,b,c);return null==d?null==R.a(c,0)?this:new Lg(this.aa,null,0,this.k,null):new Lg(this.aa,d.ua(),this.g-1,this.k,null)};k.Ka=function(a,b,c){a=[null];var d=Eg(this.aa,this.na,b,c,a);return null==d?(a=R.a(a,0),sc.a(c,a.o)?this:new Lg(this.aa,Kg(this.aa,this.na,b,c),this.g,this.k,null)):new Lg(this.aa,d.ua(),this.g+1,this.k,null)};
k.rb=function(a,b){return null!=Mg(this,b)};k.D=function(){return 0<this.g?xg(this.na,!0,this.g):null};k.F=function(a,b){return new Lg(this.aa,this.na,this.g,b,this.p)};k.G=function(a,b){if(ed(b))return cb(this,C.a(b,0),C.a(b,1));for(var c=this,d=D(b);;){if(null==d)return c;var e=G(d);if(ed(e))c=cb(c,C.a(e,0),C.a(e,1)),d=K(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.t(null,c);case 3:return this.s(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.t(null,c)};a.c=function(a,c,d){return this.s(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.b=function(a){return this.t(null,a)};k.a=function(a,b){return this.s(null,a,b)};k.Hb=function(a,b){return 0<this.g?xg(this.na,b,this.g):null};
k.Ib=function(a,b,c){if(0<this.g){a=null;for(var d=this.na;;)if(null!=d){var e;e=d.key;e=this.aa.a?this.aa.a(b,e):this.aa.call(null,b,e);if(0===e)return new wg(null,Nc.a(a,d),c,-1,null);t(c)?0>e?(a=Nc.a(a,d),d=d.left):d=d.right:0<e?(a=Nc.a(a,d),d=d.right):d=d.left}else return null==a?null:new wg(null,a,c,-1,null)}else return null};k.Gb=function(a,b){return Yf.b?Yf.b(b):Yf.call(null,b)};k.Fb=function(){return this.aa};var Ng=new Lg(od,null,0,null,0);Lg.prototype[Ea]=function(){return uc(this)};
var Og=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return b.call(this,d)}function b(a){a=D(a);for(var b=Ob(Qc);;)if(a){var e=K(K(a)),b=ee.c(b,G(a),Lc(a));a=e}else return Qb(b)}a.i=0;a.f=function(a){a=D(a);return b(a)};a.d=b;return a}(),Pg=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return b.call(this,
d)}function b(a){a:{a=T.a(Ha,a);for(var b=a.length,e=0,f=Ob(Uf);;)if(e<b)var g=e+2,f=Rb(f,a[e],a[e+1]),e=g;else{a=Qb(f);break a}a=void 0}return a}a.i=0;a.f=function(a){a=D(a);return b(a)};a.d=b;return a}(),Qg=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return b.call(this,d)}function b(a){a=D(a);for(var b=Ng;;)if(a){var e=K(K(a)),b=Rc.c(b,G(a),Lc(a));a=e}else return b}a.i=0;a.f=function(a){a=D(a);
return b(a)};a.d=b;return a}(),Rg=function(){function a(a,d){var e=null;if(1<arguments.length){for(var e=0,f=Array(arguments.length-1);e<f.length;)f[e]=arguments[e+1],++e;e=new F(f,0)}return b.call(this,a,e)}function b(a,b){for(var e=D(b),f=new Lg(qd(a),null,0,null,0);;)if(e)var g=K(K(e)),f=Rc.c(f,G(e),Lc(e)),e=g;else return f}a.i=1;a.f=function(a){var d=G(a);a=H(a);return b(d,a)};a.d=b;return a}();function Sg(a,b){this.Y=a;this.Z=b;this.q=0;this.j=32374988}k=Sg.prototype;k.toString=function(){return ec(this)};
k.H=function(){return this.Z};k.T=function(){var a=this.Y,a=(a?a.j&128||a.xb||(a.j?0:w(Xa,a)):w(Xa,a))?this.Y.T(null):K(this.Y);return null==a?null:new Sg(a,this.Z)};k.B=function(){return wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(J,this.Z)};k.R=function(a,b){return P.a(b,this)};k.O=function(a,b,c){return P.c(b,c,this)};k.N=function(){return this.Y.N(null).hb(null)};
k.S=function(){var a=this.Y,a=(a?a.j&128||a.xb||(a.j?0:w(Xa,a)):w(Xa,a))?this.Y.T(null):K(this.Y);return null!=a?new Sg(a,this.Z):J};k.D=function(){return this};k.F=function(a,b){return new Sg(this.Y,b)};k.G=function(a,b){return M(b,this)};Sg.prototype[Ea]=function(){return uc(this)};function Tg(a){return(a=D(a))?new Sg(a,null):null}function Yf(a){return hb(a)}function Ug(a,b){this.Y=a;this.Z=b;this.q=0;this.j=32374988}k=Ug.prototype;k.toString=function(){return ec(this)};k.H=function(){return this.Z};
k.T=function(){var a=this.Y,a=(a?a.j&128||a.xb||(a.j?0:w(Xa,a)):w(Xa,a))?this.Y.T(null):K(this.Y);return null==a?null:new Ug(a,this.Z)};k.B=function(){return wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(J,this.Z)};k.R=function(a,b){return P.a(b,this)};k.O=function(a,b,c){return P.c(b,c,this)};k.N=function(){return this.Y.N(null).ib(null)};k.S=function(){var a=this.Y,a=(a?a.j&128||a.xb||(a.j?0:w(Xa,a)):w(Xa,a))?this.Y.T(null):K(this.Y);return null!=a?new Ug(a,this.Z):J};
k.D=function(){return this};k.F=function(a,b){return new Ug(this.Y,b)};k.G=function(a,b){return M(b,this)};Ug.prototype[Ea]=function(){return uc(this)};function Vg(a){return(a=D(a))?new Ug(a,null):null}function Zf(a){return ib(a)}
var Wg=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return b.call(this,d)}function b(a){return t(Fe(ud,a))?A.a(function(a,b){return Nc.a(t(a)?a:Uf,b)},a):null}a.i=0;a.f=function(a){a=D(a);return b(a)};a.d=b;return a}(),Xg=function(){function a(a,d){var e=null;if(1<arguments.length){for(var e=0,f=Array(arguments.length-1);e<f.length;)f[e]=arguments[e+1],++e;e=new F(f,0)}return b.call(this,a,e)}function b(a,
b){return t(Fe(ud,b))?A.a(function(a){return function(b,c){return A.c(a,t(b)?b:Uf,D(c))}}(function(b,d){var g=G(d),h=Lc(d);return nd(b,g)?Rc.c(b,g,function(){var d=S.a(b,g);return a.a?a.a(d,h):a.call(null,d,h)}()):Rc.c(b,g,h)}),b):null}a.i=1;a.f=function(a){var d=G(a);a=H(a);return b(d,a)};a.d=b;return a}();function Yg(a,b){for(var c=Uf,d=D(b);;)if(d)var e=G(d),f=S.c(a,e,Zg),c=je.a(f,Zg)?Rc.c(c,e,f):c,d=K(d);else return O(c,Vc(a))}
function $g(a,b,c){this.k=a;this.Wa=b;this.p=c;this.j=15077647;this.q=8196}k=$g.prototype;k.toString=function(){return ec(this)};k.t=function(a,b){return $a.c(this,b,null)};k.s=function(a,b,c){return bb(this.Wa,b)?b:c};k.H=function(){return this.k};k.L=function(){return Ma(this.Wa)};k.B=function(){var a=this.p;return null!=a?a:this.p=a=xc(this)};k.A=function(a,b){return ad(b)&&Q(this)===Q(b)&&Ee(function(a){return function(b){return nd(a,b)}}(this),b)};k.$a=function(){return new ah(Ob(this.Wa))};
k.J=function(){return O(bh,this.k)};k.Eb=function(a,b){return new $g(this.k,eb(this.Wa,b),null)};k.D=function(){return Tg(this.Wa)};k.F=function(a,b){return new $g(b,this.Wa,this.p)};k.G=function(a,b){return new $g(this.k,Rc.c(this.Wa,b,null),null)};
k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.t(null,c);case 3:return this.s(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.t(null,c)};a.c=function(a,c,d){return this.s(null,c,d)};return a}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.b=function(a){return this.t(null,a)};k.a=function(a,b){return this.s(null,a,b)};var bh=new $g(null,Uf,0);$g.prototype[Ea]=function(){return uc(this)};
function ah(a){this.ma=a;this.j=259;this.q=136}k=ah.prototype;k.call=function(){function a(a,b,c){return $a.c(this.ma,b,jd)===jd?c:b}function b(a,b){return $a.c(this.ma,b,jd)===jd?null:b}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.a=b;c.c=a;return c}();k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};
k.b=function(a){return $a.c(this.ma,a,jd)===jd?null:a};k.a=function(a,b){return $a.c(this.ma,a,jd)===jd?b:a};k.t=function(a,b){return $a.c(this,b,null)};k.s=function(a,b,c){return $a.c(this.ma,b,jd)===jd?c:b};k.L=function(){return Q(this.ma)};k.Tb=function(a,b){this.ma=fe.a(this.ma,b);return this};k.Sa=function(a,b){this.ma=ee.c(this.ma,b,null);return this};k.Ta=function(){return new $g(null,Qb(this.ma),null)};function ch(a,b,c){this.k=a;this.ja=b;this.p=c;this.j=417730831;this.q=8192}k=ch.prototype;
k.toString=function(){return ec(this)};k.t=function(a,b){return $a.c(this,b,null)};k.s=function(a,b,c){a=Mg(this.ja,b);return null!=a?a.key:c};k.H=function(){return this.k};k.L=function(){return Q(this.ja)};k.ab=function(){return 0<Q(this.ja)?Oe.a(Yf,Gb(this.ja)):null};k.B=function(){var a=this.p;return null!=a?a:this.p=a=xc(this)};k.A=function(a,b){return ad(b)&&Q(this)===Q(b)&&Ee(function(a){return function(b){return nd(a,b)}}(this),b)};k.J=function(){return new ch(this.k,Na(this.ja),0)};
k.Eb=function(a,b){return new ch(this.k,Sc.a(this.ja,b),null)};k.D=function(){return Tg(this.ja)};k.F=function(a,b){return new ch(b,this.ja,this.p)};k.G=function(a,b){return new ch(this.k,Rc.c(this.ja,b,null),null)};k.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.t(null,c);case 3:return this.s(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.a=function(a,c){return this.t(null,c)};a.c=function(a,c,d){return this.s(null,c,d)};return a}();
k.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};k.b=function(a){return this.t(null,a)};k.a=function(a,b){return this.s(null,a,b)};k.Hb=function(a,b){return Oe.a(Yf,Hb(this.ja,b))};k.Ib=function(a,b,c){return Oe.a(Yf,Ib(this.ja,b,c))};k.Gb=function(a,b){return b};k.Fb=function(){return Kb(this.ja)};var eh=new ch(null,Ng,0);ch.prototype[Ea]=function(){return uc(this)};
function fh(a){a=D(a);if(null==a)return bh;if(a instanceof F&&0===a.m){a=a.e;a:{for(var b=0,c=Ob(bh);;)if(b<a.length)var d=b+1,c=c.Sa(null,a[b]),b=d;else{a=c;break a}a=void 0}return a.Ta(null)}for(d=Ob(bh);;)if(null!=a)b=a.T(null),d=d.Sa(null,a.N(null)),a=b;else return d.Ta(null)}
var gh=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return b.call(this,d)}function b(a){return A.c(Ra,eh,a)}a.i=0;a.f=function(a){a=D(a);return b(a)};a.d=b;return a}(),hh=function(){function a(a,d){var e=null;if(1<arguments.length){for(var e=0,f=Array(arguments.length-1);e<f.length;)f[e]=arguments[e+1],++e;e=new F(f,0)}return b.call(this,a,e)}function b(a,b){return A.c(Ra,new ch(null,Rg(a),0),b)}
a.i=1;a.f=function(a){var d=G(a);a=H(a);return b(d,a)};a.d=b;return a}();function Od(a){if(a&&(a.q&4096||a.lc))return a.name;if("string"===typeof a)return a;throw Error([z("Doesn't support name: "),z(a)].join(""));}
var ih=function(){function a(a,b,c){return(a.b?a.b(b):a.call(null,b))>(a.b?a.b(c):a.call(null,c))?b:c}var b=null,c=function(){function a(b,d,h,l){var m=null;if(3<arguments.length){for(var m=0,p=Array(arguments.length-3);m<p.length;)p[m]=arguments[m+3],++m;m=new F(p,0)}return c.call(this,b,d,h,m)}function c(a,d,e,l){return A.c(function(c,d){return b.c(a,c,d)},b.c(a,d,e),l)}a.i=3;a.f=function(a){var b=G(a);a=K(a);var d=G(a);a=K(a);var l=G(a);a=H(a);return c(b,d,l,a)};a.d=c;return a}(),b=function(b,
e,f,g){switch(arguments.length){case 2:return e;case 3:return a.call(this,b,e,f);default:var h=null;if(3<arguments.length){for(var h=0,l=Array(arguments.length-3);h<l.length;)l[h]=arguments[h+3],++h;h=new F(l,0)}return c.d(b,e,f,h)}throw Error("Invalid arity: "+arguments.length);};b.i=3;b.f=c.f;b.a=function(a,b){return b};b.c=a;b.d=c.d;return b}();function jh(a){this.e=a}jh.prototype.add=function(a){return this.e.push(a)};jh.prototype.size=function(){return this.e.length};
jh.prototype.clear=function(){return this.e=[]};
var kh=function(){function a(a,b,c){return new V(null,function(){var h=D(c);return h?M(Pe.a(a,h),d.c(a,b,Qe.a(b,h))):null},null,null)}function b(a,b){return d.c(a,a,b)}function c(a){return function(b){return function(c){return function(){function d(h,l){c.add(l);if(a===c.size()){var m=zf(c.e);c.clear();return b.a?b.a(h,m):b.call(null,h,m)}return h}function l(a){if(!t(0===c.e.length)){var d=zf(c.e);c.clear();a=Bc(b.a?b.a(a,d):b.call(null,a,d))}return b.b?b.b(a):b.call(null,a)}function m(){return b.l?
b.l():b.call(null)}var p=null,p=function(a,b){switch(arguments.length){case 0:return m.call(this);case 1:return l.call(this,a);case 2:return d.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};p.l=m;p.b=l;p.a=d;return p}()}(new jh([]))}}var d=null,d=function(d,f,g){switch(arguments.length){case 1:return c.call(this,d);case 2:return b.call(this,d,f);case 3:return a.call(this,d,f,g)}throw Error("Invalid arity: "+arguments.length);};d.b=c;d.a=b;d.c=a;return d}(),lh=function(){function a(a,
b){return new V(null,function(){var f=D(b);if(f){var g;g=G(f);g=a.b?a.b(g):a.call(null,g);f=t(g)?M(G(f),c.a(a,H(f))):null}else f=null;return f},null,null)}function b(a){return function(b){return function(){function c(f,g){return t(a.b?a.b(g):a.call(null,g))?b.a?b.a(f,g):b.call(null,f,g):new yc(f)}function g(a){return b.b?b.b(a):b.call(null,a)}function h(){return b.l?b.l():b.call(null)}var l=null,l=function(a,b){switch(arguments.length){case 0:return h.call(this);case 1:return g.call(this,a);case 2:return c.call(this,
a,b)}throw Error("Invalid arity: "+arguments.length);};l.l=h;l.b=g;l.a=c;return l}()}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}();function mh(a,b,c){return function(d){var e=Kb(a);d=Jb(a,d);e=e.a?e.a(d,c):e.call(null,d,c);return b.a?b.a(e,0):b.call(null,e,0)}}
var nh=function(){function a(a,b,c,g,h){var l=Ib(a,c,!0);if(t(l)){var m=R.c(l,0,null);return lh.a(mh(a,g,h),t(mh(a,b,c).call(null,m))?l:K(l))}return null}function b(a,b,c){var g=mh(a,b,c),h;a:{h=[Ad,Bd];var l=h.length;if(l<=Vf)for(var m=0,p=Ob(Uf);;)if(m<l)var q=m+1,p=Rb(p,h[m],null),m=q;else{h=new $g(null,Qb(p),null);break a}else for(m=0,p=Ob(bh);;)if(m<l)q=m+1,p=Pb(p,h[m]),m=q;else{h=Qb(p);break a}h=void 0}return t(h.call(null,b))?(a=Ib(a,c,!0),t(a)?(b=R.c(a,0,null),t(g.b?g.b(b):g.call(null,b))?
a:K(a)):null):lh.a(g,Hb(a,!0))}var c=null,c=function(c,e,f,g,h){switch(arguments.length){case 3:return b.call(this,c,e,f);case 5:return a.call(this,c,e,f,g,h)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.r=a;return c}();function oh(a,b,c){this.m=a;this.end=b;this.step=c}oh.prototype.ga=function(){return 0<this.step?this.m<this.end:this.m>this.end};oh.prototype.next=function(){var a=this.m;this.m+=this.step;return a};
function ph(a,b,c,d,e){this.k=a;this.start=b;this.end=c;this.step=d;this.p=e;this.j=32375006;this.q=8192}k=ph.prototype;k.toString=function(){return ec(this)};k.Q=function(a,b){if(b<Ma(this))return this.start+b*this.step;if(this.start>this.end&&0===this.step)return this.start;throw Error("Index out of bounds");};k.$=function(a,b,c){return b<Ma(this)?this.start+b*this.step:this.start>this.end&&0===this.step?this.start:c};k.vb=!0;k.fb=function(){return new oh(this.start,this.end,this.step)};k.H=function(){return this.k};
k.T=function(){return 0<this.step?this.start+this.step<this.end?new ph(this.k,this.start+this.step,this.end,this.step,null):null:this.start+this.step>this.end?new ph(this.k,this.start+this.step,this.end,this.step,null):null};k.L=function(){if(Aa(Cb(this)))return 0;var a=(this.end-this.start)/this.step;return Math.ceil.b?Math.ceil.b(a):Math.ceil.call(null,a)};k.B=function(){var a=this.p;return null!=a?a:this.p=a=wc(this)};k.A=function(a,b){return Ic(this,b)};k.J=function(){return O(J,this.k)};
k.R=function(a,b){return Cc.a(this,b)};k.O=function(a,b,c){for(a=this.start;;)if(0<this.step?a<this.end:a>this.end){var d=a;c=b.a?b.a(c,d):b.call(null,c,d);if(Ac(c))return b=c,L.b?L.b(b):L.call(null,b);a+=this.step}else return c};k.N=function(){return null==Cb(this)?null:this.start};k.S=function(){return null!=Cb(this)?new ph(this.k,this.start+this.step,this.end,this.step,null):J};k.D=function(){return 0<this.step?this.start<this.end?this:null:this.start>this.end?this:null};
k.F=function(a,b){return new ph(b,this.start,this.end,this.step,this.p)};k.G=function(a,b){return M(b,this)};ph.prototype[Ea]=function(){return uc(this)};
var qh=function(){function a(a,b,c){return new ph(null,a,b,c,null)}function b(a,b){return e.c(a,b,1)}function c(a){return e.c(0,a,1)}function d(){return e.c(0,Number.MAX_VALUE,1)}var e=null,e=function(e,g,h){switch(arguments.length){case 0:return d.call(this);case 1:return c.call(this,e);case 2:return b.call(this,e,g);case 3:return a.call(this,e,g,h)}throw Error("Invalid arity: "+arguments.length);};e.l=d;e.b=c;e.a=b;e.c=a;return e}(),rh=function(){function a(a,b){return new V(null,function(){var f=
D(b);return f?M(G(f),c.a(a,Qe.a(a,f))):null},null,null)}function b(a){return function(b){return function(c){return function(){function g(g,h){var l=c.bb(0,c.Ra(null)+1),m=Cd(l,a);return 0===l-a*m?b.a?b.a(g,h):b.call(null,g,h):g}function h(a){return b.b?b.b(a):b.call(null,a)}function l(){return b.l?b.l():b.call(null)}var m=null,m=function(a,b){switch(arguments.length){case 0:return l.call(this);case 1:return h.call(this,a);case 2:return g.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);
};m.l=l;m.b=h;m.a=g;return m}()}(new Me(-1))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),th=function(){function a(a,b){return new V(null,function(){var f=D(b);if(f){var g=G(f),h=a.b?a.b(g):a.call(null,g),g=M(g,lh.a(function(b,c){return function(b){return sc.a(c,a.b?a.b(b):a.call(null,b))}}(g,h,f,f),K(f)));return M(g,c.a(a,D(Qe.a(Q(g),f))))}return null},null,
null)}function b(a){return function(b){return function(c,g){return function(){function h(h,l){var m=L.b?L.b(g):L.call(null,g),p=a.b?a.b(l):a.call(null,l);ac(g,p);if(Nd(m,sh)||sc.a(p,m))return c.add(l),h;m=zf(c.e);c.clear();m=b.a?b.a(h,m):b.call(null,h,m);Ac(m)||c.add(l);return m}function l(a){if(!t(0===c.e.length)){var d=zf(c.e);c.clear();a=Bc(b.a?b.a(a,d):b.call(null,a,d))}return b.b?b.b(a):b.call(null,a)}function m(){return b.l?b.l():b.call(null)}var p=null,p=function(a,b){switch(arguments.length){case 0:return m.call(this);
case 1:return l.call(this,a);case 2:return h.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};p.l=m;p.b=l;p.a=h;return p}()}(new jh([]),new Me(sh))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),uh=function(){function a(a,b){for(;;)if(D(b)&&0<a){var c=a-1,g=K(b);a=c;b=g}else return null}function b(a){for(;;)if(D(a))a=K(a);else return null}var c=
null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}(),vh=function(){function a(a,b){uh.a(a,b);return b}function b(a){uh.b(a);return a}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}();
function wh(a,b,c,d,e,f,g){var h=ma;try{ma=null==ma?null:ma-1;if(null!=ma&&0>ma)return Lb(a,"#");Lb(a,c);if(D(g)){var l=G(g);b.c?b.c(l,a,f):b.call(null,l,a,f)}for(var m=K(g),p=za.b(f)-1;;)if(!m||null!=p&&0===p){D(m)&&0===p&&(Lb(a,d),Lb(a,"..."));break}else{Lb(a,d);var q=G(m);c=a;g=f;b.c?b.c(q,c,g):b.call(null,q,c,g);var s=K(m);c=p-1;m=s;p=c}return Lb(a,e)}finally{ma=h}}
var xh=function(){function a(a,d){var e=null;if(1<arguments.length){for(var e=0,f=Array(arguments.length-1);e<f.length;)f[e]=arguments[e+1],++e;e=new F(f,0)}return b.call(this,a,e)}function b(a,b){for(var e=D(b),f=null,g=0,h=0;;)if(h<g){var l=f.Q(null,h);Lb(a,l);h+=1}else if(e=D(e))f=e,fd(f)?(e=Yb(f),g=Zb(f),f=e,l=Q(e),e=g,g=l):(l=G(f),Lb(a,l),e=K(f),f=null,g=0),h=0;else return null}a.i=1;a.f=function(a){var d=G(a);a=H(a);return b(d,a)};a.d=b;return a}(),yh={'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f",
"\n":"\\n","\r":"\\r","\t":"\\t"};function zh(a){return[z('"'),z(a.replace(RegExp('[\\\\"\b\f\n\r\t]',"g"),function(a){return yh[a]})),z('"')].join("")}
var $=function Ah(b,c,d){if(null==b)return Lb(c,"nil");if(void 0===b)return Lb(c,"#\x3cundefined\x3e");t(function(){var c=S.a(d,wa);return t(c)?(c=b?b.j&131072||b.kc?!0:b.j?!1:w(rb,b):w(rb,b))?Vc(b):c:c}())&&(Lb(c,"^"),Ah(Vc(b),c,d),Lb(c," "));if(null==b)return Lb(c,"nil");if(b.Yb)return b.nc(c);if(b&&(b.j&2147483648||b.I))return b.v(null,c,d);if(Ba(b)===Boolean||"number"===typeof b)return Lb(c,""+z(b));if(null!=b&&b.constructor===Object){Lb(c,"#js ");var e=Oe.a(function(c){return new W(null,2,5,
uf,[Pd.b(c),b[c]],null)},gd(b));return Bh.n?Bh.n(e,Ah,c,d):Bh.call(null,e,Ah,c,d)}return b instanceof Array?wh(c,Ah,"#js ["," ","]",d,b):t("string"==typeof b)?t(ua.b(d))?Lb(c,zh(b)):Lb(c,b):Tc(b)?xh.d(c,Kc(["#\x3c",""+z(b),"\x3e"],0)):b instanceof Date?(e=function(b,c){for(var d=""+z(b);;)if(Q(d)<c)d=[z("0"),z(d)].join("");else return d},xh.d(c,Kc(['#inst "',""+z(b.getUTCFullYear()),"-",e(b.getUTCMonth()+1,2),"-",e(b.getUTCDate(),2),"T",e(b.getUTCHours(),2),":",e(b.getUTCMinutes(),2),":",e(b.getUTCSeconds(),
2),".",e(b.getUTCMilliseconds(),3),"-",'00:00"'],0))):b instanceof RegExp?xh.d(c,Kc(['#"',b.source,'"'],0)):(b?b.j&2147483648||b.I||(b.j?0:w(Mb,b)):w(Mb,b))?Nb(b,c,d):xh.d(c,Kc(["#\x3c",""+z(b),"\x3e"],0))},Ch=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return b.call(this,d)}function b(a){var b=oa();if(Yc(a))b="";else{var e=z,f=new fa;a:{var g=new dc(f);$(G(a),g,b);a=D(K(a));for(var h=null,l=0,
m=0;;)if(m<l){var p=h.Q(null,m);Lb(g," ");$(p,g,b);m+=1}else if(a=D(a))h=a,fd(h)?(a=Yb(h),l=Zb(h),h=a,p=Q(a),a=l,l=p):(p=G(h),Lb(g," "),$(p,g,b),a=K(h),h=null,l=0),m=0;else break a}b=""+e(f)}return b}a.i=0;a.f=function(a){a=D(a);return b(a)};a.d=b;return a}();function Bh(a,b,c,d){return wh(c,function(a,c,d){var h=hb(a);b.c?b.c(h,c,d):b.call(null,h,c,d);Lb(c," ");a=ib(a);return b.c?b.c(a,c,d):b.call(null,a,c,d)},"{",", ","}",d,D(a))}Me.prototype.I=!0;
Me.prototype.v=function(a,b,c){Lb(b,"#\x3cVolatile: ");$(this.state,b,c);return Lb(b,"\x3e")};F.prototype.I=!0;F.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};V.prototype.I=!0;V.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};wg.prototype.I=!0;wg.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};pg.prototype.I=!0;pg.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};Z.prototype.I=!0;
Z.prototype.v=function(a,b,c){return wh(b,$,"["," ","]",c,this)};Rf.prototype.I=!0;Rf.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};ch.prototype.I=!0;ch.prototype.v=function(a,b,c){return wh(b,$,"#{"," ","}",c,this)};Bf.prototype.I=!0;Bf.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};Ld.prototype.I=!0;Ld.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};Hc.prototype.I=!0;Hc.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};
rg.prototype.I=!0;rg.prototype.v=function(a,b,c){return Bh(this,$,b,c)};qg.prototype.I=!0;qg.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};Df.prototype.I=!0;Df.prototype.v=function(a,b,c){return wh(b,$,"["," ","]",c,this)};Lg.prototype.I=!0;Lg.prototype.v=function(a,b,c){return Bh(this,$,b,c)};$g.prototype.I=!0;$g.prototype.v=function(a,b,c){return wh(b,$,"#{"," ","}",c,this)};Vd.prototype.I=!0;Vd.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};Ug.prototype.I=!0;
Ug.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};X.prototype.I=!0;X.prototype.v=function(a,b,c){return wh(b,$,"["," ","]",c,this)};W.prototype.I=!0;W.prototype.v=function(a,b,c){return wh(b,$,"["," ","]",c,this)};Kf.prototype.I=!0;Kf.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};Hd.prototype.I=!0;Hd.prototype.v=function(a,b){return Lb(b,"()")};ze.prototype.I=!0;ze.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};Lf.prototype.I=!0;
Lf.prototype.v=function(a,b,c){return wh(b,$,"#queue ["," ","]",c,D(this))};pa.prototype.I=!0;pa.prototype.v=function(a,b,c){return Bh(this,$,b,c)};ph.prototype.I=!0;ph.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};Sg.prototype.I=!0;Sg.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};Fd.prototype.I=!0;Fd.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};W.prototype.sb=!0;W.prototype.tb=function(a,b){return pd.a(this,b)};Df.prototype.sb=!0;
Df.prototype.tb=function(a,b){return pd.a(this,b)};U.prototype.sb=!0;U.prototype.tb=function(a,b){return Md(this,b)};qc.prototype.sb=!0;qc.prototype.tb=function(a,b){return pc(this,b)};var Dh=function(){function a(a,d,e){var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+2],++f;f=new F(g,0)}return b.call(this,a,d,f)}function b(a,b,e){return a.k=T.c(b,a.k,e)}a.i=2;a.f=function(a){var d=G(a);a=K(a);var e=G(a);a=H(a);return b(d,e,a)};a.d=b;return a}();
function Eh(a){return function(b,c){var d=a.a?a.a(b,c):a.call(null,b,c);return Ac(d)?new yc(d):d}}
function Ve(a){return function(b){return function(){function c(a,c){return A.c(b,a,c)}function d(b){return a.b?a.b(b):a.call(null,b)}function e(){return a.l?a.l():a.call(null)}var f=null,f=function(a,b){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};f.l=e;f.b=d;f.a=c;return f}()}(Eh(a))}
var Fh=function(){function a(a){return Ce.a(c.l(),a)}function b(){return function(a){return function(b){return function(){function c(f,g){var h=L.b?L.b(b):L.call(null,b);ac(b,g);return sc.a(h,g)?f:a.a?a.a(f,g):a.call(null,f,g)}function g(b){return a.b?a.b(b):a.call(null,b)}function h(){return a.l?a.l():a.call(null)}var l=null,l=function(a,b){switch(arguments.length){case 0:return h.call(this);case 1:return g.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);
};l.l=h;l.b=g;l.a=c;return l}()}(new Me(sh))}}var c=null,c=function(c){switch(arguments.length){case 0:return b.call(this);case 1:return a.call(this,c)}throw Error("Invalid arity: "+arguments.length);};c.l=b;c.b=a;return c}();function Gh(a,b){this.fa=a;this.Zb=b;this.q=0;this.j=2173173760}Gh.prototype.v=function(a,b,c){return wh(b,$,"("," ",")",c,this)};Gh.prototype.O=function(a,b,c){return wd.n(this.fa,b,c,this.Zb)};Gh.prototype.D=function(){return D(Ce.a(this.fa,this.Zb))};Gh.prototype[Ea]=function(){return uc(this)};
var Hh={};function Ih(a){if(a?a.gc:a)return a.gc(a);var b;b=Ih[n(null==a?null:a)];if(!b&&(b=Ih._,!b))throw x("IEncodeJS.-clj-\x3ejs",a);return b.call(null,a)}function Jh(a){return(a?t(t(null)?null:a.fc)||(a.yb?0:w(Hh,a)):w(Hh,a))?Ih(a):"string"===typeof a||"number"===typeof a||a instanceof U||a instanceof qc?Kh.b?Kh.b(a):Kh.call(null,a):Ch.d(Kc([a],0))}
var Kh=function Lh(b){if(null==b)return null;if(b?t(t(null)?null:b.fc)||(b.yb?0:w(Hh,b)):w(Hh,b))return Ih(b);if(b instanceof U)return Od(b);if(b instanceof qc)return""+z(b);if(dd(b)){var c={};b=D(b);for(var d=null,e=0,f=0;;)if(f<e){var g=d.Q(null,f),h=R.c(g,0,null),g=R.c(g,1,null);c[Jh(h)]=Lh(g);f+=1}else if(b=D(b))fd(b)?(e=Yb(b),b=Zb(b),d=e,e=Q(e)):(e=G(b),d=R.c(e,0,null),e=R.c(e,1,null),c[Jh(d)]=Lh(e),b=K(b),d=null,e=0),f=0;else break;return c}if($c(b)){c=[];b=D(Oe.a(Lh,b));d=null;for(f=e=0;;)if(f<
e)h=d.Q(null,f),c.push(h),f+=1;else if(b=D(b))d=b,fd(d)?(b=Yb(d),f=Zb(d),d=b,e=Q(b),b=f):(b=G(d),c.push(b),b=K(d),d=null,e=0),f=0;else break;return c}return b},Mh={};function Nh(a,b){if(a?a.ec:a)return a.ec(a,b);var c;c=Nh[n(null==a?null:a)];if(!c&&(c=Nh._,!c))throw x("IEncodeClojure.-js-\x3eclj",a);return c.call(null,a,b)}
var Ph=function(){function a(a){return b.d(a,Kc([new pa(null,1,[Oh,!1],null)],0))}var b=null,c=function(){function a(c,d){var h=null;if(1<arguments.length){for(var h=0,l=Array(arguments.length-1);h<l.length;)l[h]=arguments[h+1],++h;h=new F(l,0)}return b.call(this,c,h)}function b(a,c){var d=kd(c)?T.a(Og,c):c,e=S.a(d,Oh);return function(a,b,d,e){return function v(f){return(f?t(t(null)?null:f.uc)||(f.yb?0:w(Mh,f)):w(Mh,f))?Nh(f,T.a(Pg,c)):kd(f)?vh.b(Oe.a(v,f)):$c(f)?af.a(Oc(f),Oe.a(v,f)):f instanceof
Array?zf(Oe.a(v,f)):Ba(f)===Object?af.a(Uf,function(){return function(a,b,c,d){return function Pa(e){return new V(null,function(a,b,c,d){return function(){for(;;){var a=D(e);if(a){if(fd(a)){var b=Yb(a),c=Q(b),g=Td(c);return function(){for(var a=0;;)if(a<c){var e=C.a(b,a),h=g,l=uf,m;m=e;m=d.b?d.b(m):d.call(null,m);e=new W(null,2,5,l,[m,v(f[e])],null);h.add(e);a+=1}else return!0}()?Wd(g.ca(),Pa(Zb(a))):Wd(g.ca(),null)}var h=G(a);return M(new W(null,2,5,uf,[function(){var a=h;return d.b?d.b(a):d.call(null,
a)}(),v(f[h])],null),Pa(H(a)))}return null}}}(a,b,c,d),null,null)}}(a,b,d,e)(gd(f))}()):f}}(c,d,e,t(e)?Pd:z)(a)}a.i=1;a.f=function(a){var c=G(a);a=H(a);return b(c,a)};a.d=b;return a}(),b=function(b,e){switch(arguments.length){case 1:return a.call(this,b);default:var f=null;if(1<arguments.length){for(var f=0,g=Array(arguments.length-1);f<g.length;)g[f]=arguments[f+1],++f;f=new F(g,0)}return c.d(b,f)}throw Error("Invalid arity: "+arguments.length);};b.i=1;b.f=c.f;b.b=a;b.d=c.d;return b}();var wa=new U(null,"meta","meta",1499536964),ya=new U(null,"dup","dup",556298533),sh=new U("cljs.core","none","cljs.core/none",926646439),pe=new U(null,"file","file",-1269645878),le=new U(null,"end-column","end-column",1425389514),sa=new U(null,"flush-on-newline","flush-on-newline",-151457939),ne=new U(null,"column","column",2078222095),ua=new U(null,"readably","readably",1129599760),oe=new U(null,"line","line",212345235),za=new U(null,"print-length","print-length",1931866356),me=new U(null,"end-line",
"end-line",1837326455),Oh=new U(null,"keywordize-keys","keywordize-keys",1310784252),Zg=new U("cljs.core","not-found","cljs.core/not-found",-1572889185);function Qh(a,b){var c=T.c(ih,a,b);return M(c,Ye.a(function(a){return function(b){return a===b}}(c),b))}
var Rh=function(){function a(a,b){return Q(a)<Q(b)?A.c(Nc,b,a):A.c(Nc,a,b)}var b=null,c=function(){function a(c,d,h){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return b.call(this,c,d,l)}function b(a,c,d){a=Qh(Q,Nc.d(d,c,Kc([a],0)));return A.c(af,G(a),H(a))}a.i=2;a.f=function(a){var c=G(a);a=K(a);var d=G(a);a=H(a);return b(c,d,a)};a.d=b;return a}(),b=function(b,e,f){switch(arguments.length){case 0:return bh;case 1:return b;
case 2:return a.call(this,b,e);default:var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new F(h,0)}return c.d(b,e,g)}throw Error("Invalid arity: "+arguments.length);};b.i=2;b.f=c.f;b.l=function(){return bh};b.b=function(a){return a};b.a=a;b.d=c.d;return b}(),Sh=function(){function a(a,b){for(;;)if(Q(b)<Q(a)){var c=a;a=b;b=c}else return A.c(function(a,b){return function(a,c){return nd(b,c)?a:Xc.a(a,c)}}(a,b),a,a)}var b=null,c=function(){function a(b,
d,h){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return c.call(this,b,d,l)}function c(a,d,e){a=Qh(function(a){return-Q(a)},Nc.d(e,d,Kc([a],0)));return A.c(b,G(a),H(a))}a.i=2;a.f=function(a){var b=G(a);a=K(a);var d=G(a);a=H(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return b;case 2:return a.call(this,b,e);default:var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-
2);g<h.length;)h[g]=arguments[g+2],++g;g=new F(h,0)}return c.d(b,e,g)}throw Error("Invalid arity: "+arguments.length);};b.i=2;b.f=c.f;b.b=function(a){return a};b.a=a;b.d=c.d;return b}(),Th=function(){function a(a,b){return Q(a)<Q(b)?A.c(function(a,c){return nd(b,c)?Xc.a(a,c):a},a,a):A.c(Xc,a,b)}var b=null,c=function(){function a(b,d,h){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return c.call(this,b,d,l)}function c(a,d,
e){return A.c(b,a,Nc.a(e,d))}a.i=2;a.f=function(a){var b=G(a);a=K(a);var d=G(a);a=H(a);return c(b,d,a)};a.d=c;return a}(),b=function(b,e,f){switch(arguments.length){case 1:return b;case 2:return a.call(this,b,e);default:var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new F(h,0)}return c.d(b,e,g)}throw Error("Invalid arity: "+arguments.length);};b.i=2;b.f=c.f;b.b=function(a){return a};b.a=a;b.d=c.d;return b}();
function Uh(a,b){return A.c(function(b,d){var e=R.c(d,0,null),f=R.c(d,1,null);return nd(a,e)?Rc.c(b,f,S.a(a,e)):b},T.c(Sc,a,Tg(b)),b)}function Vh(a,b){return A.c(function(a,d){var e=Yg(d,b);return Rc.c(a,e,Nc.a(S.c(a,e,bh),d))},Uf,a)}function Wh(a){return A.c(function(a,c){var d=R.c(c,0,null),e=R.c(c,1,null);return Rc.c(a,e,d)},Uf,a)}
var Xh=function(){function a(a,b,c){a=Q(a)<=Q(b)?new W(null,3,5,uf,[a,b,Wh(c)],null):new W(null,3,5,uf,[b,a,c],null);b=R.c(a,0,null);c=R.c(a,1,null);var g=R.c(a,2,null),h=Vh(b,Vg(g));return A.c(function(a,b,c,d,e){return function(f,g){var h=function(){var a=Uh(Yg(g,Tg(d)),d);return e.b?e.b(a):e.call(null,a)}();return t(h)?A.c(function(){return function(a,b){return Nc.a(a,Wg.d(Kc([b,g],0)))}}(h,a,b,c,d,e),f,h):f}}(a,b,c,g,h),bh,c)}function b(a,b){if(D(a)&&D(b)){var c=Sh.a(fh(Tg(G(a))),fh(Tg(G(b)))),
g=Q(a)<=Q(b)?new W(null,2,5,uf,[a,b],null):new W(null,2,5,uf,[b,a],null),h=R.c(g,0,null),l=R.c(g,1,null),m=Vh(h,c);return A.c(function(a,b,c,d,e){return function(f,g){var h=function(){var b=Yg(g,a);return e.b?e.b(b):e.call(null,b)}();return t(h)?A.c(function(){return function(a,b){return Nc.a(a,Wg.d(Kc([b,g],0)))}}(h,a,b,c,d,e),f,h):f}}(c,g,h,l,m),bh,l)}return bh}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+
arguments.length);};c.a=b;c.c=a;return c}();r("mori.apply",T);r("mori.apply.f2",T.a);r("mori.apply.f3",T.c);r("mori.apply.f4",T.n);r("mori.apply.f5",T.r);r("mori.apply.fn",T.K);r("mori.count",Q);r("mori.distinct",function(a){return function c(a,e){return new V(null,function(){return function(a,d){for(;;){var e=a,l=R.c(e,0,null);if(e=D(e))if(nd(d,l))l=H(e),e=d,a=l,d=e;else return M(l,c(H(e),Nc.a(d,l)));else return null}}.call(null,a,e)},null,null)}(a,bh)});r("mori.empty",Oc);r("mori.first",G);r("mori.second",Lc);r("mori.next",K);
r("mori.rest",H);r("mori.seq",D);r("mori.conj",Nc);r("mori.conj.f0",Nc.l);r("mori.conj.f1",Nc.b);r("mori.conj.f2",Nc.a);r("mori.conj.fn",Nc.K);r("mori.cons",M);r("mori.find",function(a,b){return null!=a&&bd(a)&&nd(a,b)?new W(null,2,5,uf,[b,S.a(a,b)],null):null});r("mori.nth",R);r("mori.nth.f2",R.a);r("mori.nth.f3",R.c);r("mori.last",function(a){for(;;){var b=K(a);if(null!=b)a=b;else return G(a)}});r("mori.assoc",Rc);r("mori.assoc.f3",Rc.c);r("mori.assoc.fn",Rc.K);r("mori.dissoc",Sc);
r("mori.dissoc.f1",Sc.b);r("mori.dissoc.f2",Sc.a);r("mori.dissoc.fn",Sc.K);r("mori.getIn",cf);r("mori.getIn.f2",cf.a);r("mori.getIn.f3",cf.c);r("mori.updateIn",df);r("mori.updateIn.f3",df.c);r("mori.updateIn.f4",df.n);r("mori.updateIn.f5",df.r);r("mori.updateIn.f6",df.P);r("mori.updateIn.fn",df.K);r("mori.assocIn",function Yh(b,c,d){var e=R.c(c,0,null);return(c=Ed(c))?Rc.c(b,e,Yh(S.a(b,e),c,d)):Rc.c(b,e,d)});r("mori.fnil",Ke);r("mori.fnil.f2",Ke.a);r("mori.fnil.f3",Ke.c);r("mori.fnil.f4",Ke.n);
r("mori.disj",Xc);r("mori.disj.f1",Xc.b);r("mori.disj.f2",Xc.a);r("mori.disj.fn",Xc.K);r("mori.pop",function(a){return null==a?null:mb(a)});r("mori.peek",Wc);r("mori.hash",nc);r("mori.get",S);r("mori.get.f2",S.a);r("mori.get.f3",S.c);r("mori.hasKey",nd);r("mori.isEmpty",Yc);r("mori.reverse",Jd);r("mori.take",Pe);r("mori.take.f1",Pe.b);r("mori.take.f2",Pe.a);r("mori.drop",Qe);r("mori.drop.f1",Qe.b);r("mori.drop.f2",Qe.a);r("mori.takeNth",rh);r("mori.takeNth.f1",rh.b);r("mori.takeNth.f2",rh.a);
r("mori.partition",bf);r("mori.partition.f2",bf.a);r("mori.partition.f3",bf.c);r("mori.partition.f4",bf.n);r("mori.partitionAll",kh);r("mori.partitionAll.f1",kh.b);r("mori.partitionAll.f2",kh.a);r("mori.partitionAll.f3",kh.c);r("mori.partitionBy",th);r("mori.partitionBy.f1",th.b);r("mori.partitionBy.f2",th.a);r("mori.iterate",function Zh(b,c){return M(c,new V(null,function(){return Zh(b,b.b?b.b(c):b.call(null,c))},null,null))});r("mori.into",af);r("mori.into.f2",af.a);r("mori.into.f3",af.c);
r("mori.merge",Wg);r("mori.mergeWith",Xg);r("mori.subvec",Cf);r("mori.subvec.f2",Cf.a);r("mori.subvec.f3",Cf.c);r("mori.takeWhile",lh);r("mori.takeWhile.f1",lh.b);r("mori.takeWhile.f2",lh.a);r("mori.dropWhile",Re);r("mori.dropWhile.f1",Re.b);r("mori.dropWhile.f2",Re.a);r("mori.groupBy",function(a,b){return ce(A.c(function(b,d){var e=a.b?a.b(d):a.call(null,d);return ee.c(b,e,Nc.a(S.c(b,e,Mc),d))},Ob(Uf),b))});r("mori.interpose",function(a,b){return Qe.a(1,Ue.a(Se.b(a),b))});r("mori.interleave",Ue);
r("mori.interleave.f2",Ue.a);r("mori.interleave.fn",Ue.K);r("mori.concat",ae);r("mori.concat.f0",ae.l);r("mori.concat.f1",ae.b);r("mori.concat.f2",ae.a);r("mori.concat.fn",ae.K);function $e(a){return a instanceof Array||cd(a)}r("mori.flatten",function(a){return Xe.a(function(a){return!$e(a)},H(Ze(a)))});r("mori.lazySeq",function(a){return new V(null,a,null,null)});r("mori.keys",Tg);r("mori.selectKeys",Yg);r("mori.vals",Vg);r("mori.primSeq",Jc);r("mori.primSeq.f1",Jc.b);r("mori.primSeq.f2",Jc.a);
r("mori.map",Oe);r("mori.map.f1",Oe.b);r("mori.map.f2",Oe.a);r("mori.map.f3",Oe.c);r("mori.map.f4",Oe.n);r("mori.map.fn",Oe.K);
r("mori.mapIndexed",function(a,b){return function d(b,f){return new V(null,function(){var g=D(f);if(g){if(fd(g)){for(var h=Yb(g),l=Q(h),m=Td(l),p=0;;)if(p<l)Xd(m,function(){var d=b+p,f=C.a(h,p);return a.a?a.a(d,f):a.call(null,d,f)}()),p+=1;else break;return Wd(m.ca(),d(b+l,Zb(g)))}return M(function(){var d=G(g);return a.a?a.a(b,d):a.call(null,b,d)}(),d(b+1,H(g)))}return null},null,null)}(0,b)});r("mori.mapcat",We);r("mori.mapcat.f1",We.b);r("mori.mapcat.fn",We.K);r("mori.reduce",A);
r("mori.reduce.f2",A.a);r("mori.reduce.f3",A.c);r("mori.reduceKV",function(a,b,c){return null!=c?xb(c,a,b):b});r("mori.keep",Le);r("mori.keep.f1",Le.b);r("mori.keep.f2",Le.a);r("mori.keepIndexed",Ne);r("mori.keepIndexed.f1",Ne.b);r("mori.keepIndexed.f2",Ne.a);r("mori.filter",Xe);r("mori.filter.f1",Xe.b);r("mori.filter.f2",Xe.a);r("mori.remove",Ye);r("mori.remove.f1",Ye.b);r("mori.remove.f2",Ye.a);r("mori.some",Fe);r("mori.every",Ee);r("mori.equals",sc);r("mori.equals.f1",sc.b);
r("mori.equals.f2",sc.a);r("mori.equals.fn",sc.K);r("mori.range",qh);r("mori.range.f0",qh.l);r("mori.range.f1",qh.b);r("mori.range.f2",qh.a);r("mori.range.f3",qh.c);r("mori.repeat",Se);r("mori.repeat.f1",Se.b);r("mori.repeat.f2",Se.a);r("mori.repeatedly",Te);r("mori.repeatedly.f1",Te.b);r("mori.repeatedly.f2",Te.a);r("mori.sort",sd);r("mori.sort.f1",sd.b);r("mori.sort.f2",sd.a);r("mori.sortBy",td);r("mori.sortBy.f2",td.a);r("mori.sortBy.f3",td.c);r("mori.intoArray",Ia);r("mori.intoArray.f1",Ia.b);
r("mori.intoArray.f2",Ia.a);r("mori.subseq",nh);r("mori.subseq.f3",nh.c);r("mori.subseq.f5",nh.r);r("mori.dedupe",Fh);r("mori.dedupe.f0",Fh.l);r("mori.dedupe.f1",Fh.b);r("mori.transduce",wd);r("mori.transduce.f3",wd.c);r("mori.transduce.f4",wd.n);r("mori.eduction",function(a,b){return new Gh(a,b)});r("mori.sequence",Ce);r("mori.sequence.f1",Ce.b);r("mori.sequence.f2",Ce.a);r("mori.sequence.fn",Ce.K);r("mori.completing",vd);r("mori.completing.f1",vd.b);r("mori.completing.f2",vd.a);r("mori.list",Kd);
r("mori.vector",Af);r("mori.hashMap",Pg);r("mori.set",fh);r("mori.sortedSet",gh);r("mori.sortedSetBy",hh);r("mori.sortedMap",Qg);r("mori.sortedMapBy",Rg);r("mori.queue",function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return b.call(this,d)}function b(a){return af.a?af.a(Mf,a):af.call(null,Mf,a)}a.i=0;a.f=function(a){a=D(a);return b(a)};a.d=b;return a}());r("mori.keyword",Pd);r("mori.keyword.f1",Pd.b);
r("mori.keyword.f2",Pd.a);r("mori.symbol",rc);r("mori.symbol.f1",rc.b);r("mori.symbol.f2",rc.a);r("mori.zipmap",function(a,b){for(var c=Ob(Uf),d=D(a),e=D(b);;)if(d&&e)c=ee.c(c,G(d),G(e)),d=K(d),e=K(e);else return Qb(c)});r("mori.isList",function(a){return a?a.j&33554432||a.wc?!0:a.j?!1:w(Eb,a):w(Eb,a)});r("mori.isSeq",kd);r("mori.isVector",ed);r("mori.isMap",dd);r("mori.isSet",ad);r("mori.isKeyword",function(a){return a instanceof U});r("mori.isSymbol",function(a){return a instanceof qc});
r("mori.isCollection",$c);r("mori.isSequential",cd);r("mori.isAssociative",bd);r("mori.isCounted",Ec);r("mori.isIndexed",Fc);r("mori.isReduceable",function(a){return a?a.j&524288||a.Sb?!0:a.j?!1:w(vb,a):w(vb,a)});r("mori.isSeqable",ld);r("mori.isReversible",Id);r("mori.union",Rh);r("mori.union.f0",Rh.l);r("mori.union.f1",Rh.b);r("mori.union.f2",Rh.a);r("mori.union.fn",Rh.K);r("mori.intersection",Sh);r("mori.intersection.f1",Sh.b);r("mori.intersection.f2",Sh.a);r("mori.intersection.fn",Sh.K);
r("mori.difference",Th);r("mori.difference.f1",Th.b);r("mori.difference.f2",Th.a);r("mori.difference.fn",Th.K);r("mori.join",Xh);r("mori.join.f2",Xh.a);r("mori.join.f3",Xh.c);r("mori.index",Vh);r("mori.project",function(a,b){return fh(Oe.a(function(a){return Yg(a,b)},a))});r("mori.mapInvert",Wh);r("mori.rename",function(a,b){return fh(Oe.a(function(a){return Uh(a,b)},a))});r("mori.renameKeys",Uh);r("mori.isSubset",function(a,b){return Q(a)<=Q(b)&&Ee(function(a){return nd(b,a)},a)});
r("mori.isSuperset",function(a,b){return Q(a)>=Q(b)&&Ee(function(b){return nd(a,b)},b)});r("mori.notEquals",je);r("mori.notEquals.f1",je.b);r("mori.notEquals.f2",je.a);r("mori.notEquals.fn",je.K);r("mori.gt",Ad);r("mori.gt.f1",Ad.b);r("mori.gt.f2",Ad.a);r("mori.gt.fn",Ad.K);r("mori.gte",Bd);r("mori.gte.f1",Bd.b);r("mori.gte.f2",Bd.a);r("mori.gte.fn",Bd.K);r("mori.lt",yd);r("mori.lt.f1",yd.b);r("mori.lt.f2",yd.a);r("mori.lt.fn",yd.K);r("mori.lte",zd);r("mori.lte.f1",zd.b);r("mori.lte.f2",zd.a);
r("mori.lte.fn",zd.K);r("mori.compare",od);r("mori.partial",Je);r("mori.partial.f1",Je.b);r("mori.partial.f2",Je.a);r("mori.partial.f3",Je.c);r("mori.partial.f4",Je.n);r("mori.partial.fn",Je.K);r("mori.comp",Ie);r("mori.comp.f0",Ie.l);r("mori.comp.f1",Ie.b);r("mori.comp.f2",Ie.a);r("mori.comp.f3",Ie.c);r("mori.comp.fn",Ie.K);
r("mori.pipeline",function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return b.call(this,d)}function b(a){function b(a,c){return c.b?c.b(a):c.call(null,a)}return A.a?A.a(b,a):A.call(null,b,a)}a.i=0;a.f=function(a){a=D(a);return b(a)};a.d=b;return a}());
r("mori.curry",function(){function a(a,d){var e=null;if(1<arguments.length){for(var e=0,f=Array(arguments.length-1);e<f.length;)f[e]=arguments[e+1],++e;e=new F(f,0)}return b.call(this,a,e)}function b(a,b){return function(e){return T.a(a,M.a?M.a(e,b):M.call(null,e,b))}}a.i=1;a.f=function(a){var d=G(a);a=H(a);return b(d,a)};a.d=b;return a}());
r("mori.juxt",function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return b.call(this,d)}function b(a){return function(){function b(a){var c=null;if(0<arguments.length){for(var c=0,d=Array(arguments.length-0);c<d.length;)d[c]=arguments[c+0],++c;c=new F(d,0)}return e.call(this,c)}function e(b){var d=function(){function d(a){return T.a(a,b)}return Oe.a?Oe.a(d,a):Oe.call(null,d,a)}();return Ia.b?Ia.b(d):Ia.call(null,
d)}b.i=0;b.f=function(a){a=D(a);return e(a)};b.d=e;return b}()}a.i=0;a.f=function(a){a=D(a);return b(a)};a.d=b;return a}());
r("mori.knit",function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return b.call(this,d)}function b(a){return function(b){var e=function(){function e(a,b){return a.b?a.b(b):a.call(null,b)}return Oe.c?Oe.c(e,a,b):Oe.call(null,e,a,b)}();return Ia.b?Ia.b(e):Ia.call(null,e)}}a.i=0;a.f=function(a){a=D(a);return b(a)};a.d=b;return a}());r("mori.sum",xd);r("mori.sum.f0",xd.l);r("mori.sum.f1",xd.b);
r("mori.sum.f2",xd.a);r("mori.sum.fn",xd.K);r("mori.inc",function(a){return a+1});r("mori.dec",function(a){return a-1});r("mori.isEven",Ge);r("mori.isOdd",function(a){return!Ge(a)});r("mori.each",function(a,b){for(var c=D(a),d=null,e=0,f=0;;)if(f<e){var g=d.Q(null,f);b.b?b.b(g):b.call(null,g);f+=1}else if(c=D(c))fd(c)?(e=Yb(c),c=Zb(c),d=e,e=Q(e)):(d=g=G(c),b.b?b.b(d):b.call(null,d),c=K(c),d=null,e=0),f=0;else return null});r("mori.identity",ud);
r("mori.constantly",function(a){return function(){function b(b){if(0<arguments.length)for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;return a}b.i=0;b.f=function(b){D(b);return a};b.d=function(){return a};return b}()});r("mori.toJs",Kh);
r("mori.toClj",function(){function a(a,b){return Ph.d(a,Kc([Oh,b],0))}function b(a){return Ph.b(a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return b.call(this,c);case 2:return a.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.b=b;c.a=a;return c}());r("mori.configure",function(a,b){switch(a){case "print-length":return la=b;case "print-level":return ma=b;default:throw Error([z("No matching clause: "),z(a)].join(""));}});r("mori.meta",Vc);r("mori.withMeta",O);
r("mori.varyMeta",ie);r("mori.varyMeta.f2",ie.a);r("mori.varyMeta.f3",ie.c);r("mori.varyMeta.f4",ie.n);r("mori.varyMeta.f5",ie.r);r("mori.varyMeta.f6",ie.P);r("mori.varyMeta.fn",ie.K);r("mori.alterMeta",Dh);r("mori.resetMeta",function(a,b){return a.k=b});V.prototype.inspect=function(){return this.toString()};F.prototype.inspect=function(){return this.toString()};Hc.prototype.inspect=function(){return this.toString()};wg.prototype.inspect=function(){return this.toString()};pg.prototype.inspect=function(){return this.toString()};
qg.prototype.inspect=function(){return this.toString()};Fd.prototype.inspect=function(){return this.toString()};Ld.prototype.inspect=function(){return this.toString()};Hd.prototype.inspect=function(){return this.toString()};W.prototype.inspect=function(){return this.toString()};Vd.prototype.inspect=function(){return this.toString()};Bf.prototype.inspect=function(){return this.toString()};Df.prototype.inspect=function(){return this.toString()};Z.prototype.inspect=function(){return this.toString()};
X.prototype.inspect=function(){return this.toString()};pa.prototype.inspect=function(){return this.toString()};rg.prototype.inspect=function(){return this.toString()};Lg.prototype.inspect=function(){return this.toString()};$g.prototype.inspect=function(){return this.toString()};ch.prototype.inspect=function(){return this.toString()};ph.prototype.inspect=function(){return this.toString()};U.prototype.inspect=function(){return this.toString()};qc.prototype.inspect=function(){return this.toString()};
Lf.prototype.inspect=function(){return this.toString()};Kf.prototype.inspect=function(){return this.toString()};r("mori.mutable.thaw",function(a){return Ob(a)});r("mori.mutable.freeze",ce);r("mori.mutable.conj",de);r("mori.mutable.conj.f0",de.l);r("mori.mutable.conj.f1",de.b);r("mori.mutable.conj.f2",de.a);r("mori.mutable.conj.fn",de.K);r("mori.mutable.assoc",ee);r("mori.mutable.assoc.f3",ee.c);r("mori.mutable.assoc.fn",ee.K);r("mori.mutable.dissoc",fe);r("mori.mutable.dissoc.f2",fe.a);r("mori.mutable.dissoc.fn",fe.K);r("mori.mutable.pop",function(a){return Ub(a)});r("mori.mutable.disj",ge);
r("mori.mutable.disj.f2",ge.a);r("mori.mutable.disj.fn",ge.K);;return this.mori;}.call({});});

},{}],"serialize/exportcsv":[function(require,module,exports){
(function() {
  var BreedReference, ExportedColorNum, ExportedCommandLambda, ExportedLinkSet, ExportedPatchSet, ExportedRGB, ExportedRGBA, ExportedReporterLambda, ExportedTurtleSet, JSType, LinkReference, NobodyReference, PatchReference, TurtleReference, allPlotsDataToCSV, flatMap, fold, formatAgentRef, formatAgents, formatAny, formatAnyInner, formatBoolean, formatBreedRef, formatColor, formatDate, formatGlobals, formatKeys, formatLinkRef, formatList, formatMetadata, formatMiniGlobals, formatNumber, formatNumberInner, formatPair, formatPatchRef, formatPensData, formatPlain, formatPlotData, formatPointsData, formatString, formatStringInner, formatTurtleRef, formatValues, id, isEmpty, joinCommaed, keys, map, maxBy, maybe, onNextLineIfNotEmpty, pairs, pipeline, plotDataToCSV, rangeUntil, ref1, ref2, ref3, ref4, ref5, schemafyAny, schemafyLink, schemafyPatch, schemafyTurtle, tee, toObject, unique, values, worldDataToCSV;

  JSType = require('util/typechecker');

  ref1 = require('brazierjs/array'), flatMap = ref1.flatMap, isEmpty = ref1.isEmpty, map = ref1.map, maxBy = ref1.maxBy, toObject = ref1.toObject, unique = ref1.unique;

  ref2 = require('brazierjs/function'), id = ref2.id, pipeline = ref2.pipeline, tee = ref2.tee;

  ref3 = require('brazierjs/maybe'), fold = ref3.fold, maybe = ref3.maybe;

  rangeUntil = require('brazierjs/number').rangeUntil;

  ref4 = require('brazierjs/object'), keys = ref4.keys, pairs = ref4.pairs, values = ref4.values;

  ref5 = require('./exportstructures'), BreedReference = ref5.BreedReference, ExportedColorNum = ref5.ExportedColorNum, ExportedCommandLambda = ref5.ExportedCommandLambda, ExportedLinkSet = ref5.ExportedLinkSet, ExportedPatchSet = ref5.ExportedPatchSet, ExportedReporterLambda = ref5.ExportedReporterLambda, ExportedRGB = ref5.ExportedRGB, ExportedRGBA = ref5.ExportedRGBA, ExportedTurtleSet = ref5.ExportedTurtleSet, LinkReference = ref5.LinkReference, NobodyReference = ref5.NobodyReference, PatchReference = ref5.PatchReference, TurtleReference = ref5.TurtleReference;

  onNextLineIfNotEmpty = function(x) {
    if (isEmpty(x)) {
      return '';
    } else {
      return '\n' + x;
    }
  };

  joinCommaed = function(x) {
    return x.join(',');
  };

  formatPlain = function(str) {
    return '"' + str + '"';
  };

  formatStringInner = function(str) {
    return '""' + str.replace(/\n/g, "\\n").replace(/"/g, '""') + '""';
  };

  formatString = function(str) {
    return formatPlain(formatStringInner(str));
  };

  formatBoolean = function(bool) {
    return formatPlain(bool);
  };

  formatNumberInner = function(num) {
    var base, maxNetLogoInt;
    maxNetLogoInt = 9007199254740992;
    base = num > maxNetLogoInt || num < -maxNetLogoInt || ((0 < num && num < 1e-3)) || ((0 > num && num > -1e-3)) ? num.toExponential() : num.toString();
    return base.replace(/e\+?/, 'E');
  };

  formatNumber = function(num) {
    return formatPlain(formatNumberInner(num));
  };

  formatBreedRef = function(arg) {
    var breedName, lowered;
    breedName = arg.breedName;
    lowered = breedName.toLowerCase();
    if (lowered === "turtles" || lowered === "patches" || lowered === "links") {
      return "{all-" + lowered + "}";
    } else {
      return "{breed " + lowered + "}";
    }
  };

  formatPair = function(arg) {
    var formatter, value;
    value = arg[0], formatter = arg[1];
    return formatter(value);
  };

  formatTurtleRef = function(arg) {
    var ref6, singular, turtleID;
    (ref6 = arg.breed, singular = ref6.singular), turtleID = arg.id;
    return "{" + (singular.toLowerCase()) + " " + turtleID + "}";
  };

  formatPatchRef = function(arg) {
    var pxcor, pycor;
    pxcor = arg.pxcor, pycor = arg.pycor;
    return "{patch " + pxcor + " " + pycor + "}";
  };

  formatLinkRef = function(arg) {
    var id1, id2, ref6, singular;
    (ref6 = arg.breed, singular = ref6.singular), id1 = arg.id1, id2 = arg.id2;
    return "{" + (singular.toLowerCase()) + " " + id1 + " " + id2 + "}";
  };

  formatAgentRef = function(ref) {
    if (ref === NobodyReference) {
      return "nobody";
    } else if (ref instanceof LinkReference) {
      return formatLinkRef(ref);
    } else if (ref instanceof PatchReference) {
      return formatPatchRef(ref);
    } else if (ref instanceof TurtleReference) {
      return formatTurtleRef(ref);
    } else {
      throw new Error("Unknown agent reference: " + (JSON.stringify(ref)));
    }
  };

  formatList = function(xs) {
    return "[" + (xs.map(function(x) {
      return formatAnyInner(x);
    }).join(" ")) + "]";
  };

  formatColor = function(color) {
    if (color instanceof ExportedColorNum) {
      return formatNumber(color.value);
    } else if (color instanceof ExportedRGB) {
      return formatPlain(formatList([color.r, color.g, color.b]));
    } else if (color instanceof ExportedRGBA) {
      return formatPlain(formatList([color.r, color.g, color.b, color.a]));
    } else {
      throw new Error("Unknown color: " + (JSON.stringify(color)));
    }
  };

  formatAnyInner = function(x) {
    var exportInnerLink, exportInnerPatch, exportInnerTurtle, type;
    type = JSType(x);
    if (type.isArray()) {
      return formatList(x);
    } else if (type.isBoolean()) {
      return x;
    } else if (type.isNumber()) {
      return formatNumberInner(x);
    } else if (type.isString()) {
      return formatStringInner(x);
    } else if (x instanceof BreedReference) {
      return formatBreedRef(x);
    } else if (x === NobodyReference) {
      return "nobody";
    } else if (x instanceof LinkReference) {
      return formatLinkRef(x);
    } else if (x instanceof PatchReference) {
      return formatPatchRef(x);
    } else if (x instanceof TurtleReference) {
      return formatTurtleRef(x);
    } else if (x instanceof ExportedCommandLambda) {
      return "(anonymous command: " + (x.source.replace(/"/g, '""')) + ")";
    } else if (x instanceof ExportedReporterLambda) {
      return "(anonymous reporter: " + (x.source.replace(/"/g, '""')) + ")";
    } else if (x instanceof ExportedLinkSet) {
      exportInnerLink = function(arg) {
        var id1, id2, plural, ref6;
        (ref6 = arg.breed, plural = ref6.plural), id1 = arg.id1, id2 = arg.id2;
        return " [" + id1 + " " + id2 + " " + (formatBreedRef(new BreedReference(plural))) + "]";
      };
      return "{links" + (x.references.map(exportInnerLink).join("")) + "}";
    } else if (x instanceof ExportedPatchSet) {
      exportInnerPatch = function(arg) {
        var pxcor, pycor;
        pxcor = arg.pxcor, pycor = arg.pycor;
        return " [" + pxcor + " " + pycor + "]";
      };
      return "{patches" + (x.references.map(exportInnerPatch).join("")) + "}";
    } else if (x instanceof ExportedTurtleSet) {
      exportInnerTurtle = function(ref) {
        return " " + ref.id;
      };
      return "{turtles" + (x.references.map(exportInnerTurtle).join("")) + "}";
    } else {
      throw new Error("I don't know how to CSVify this: " + (JSON.stringify(x)));
    }
  };

  formatAny = function(any) {
    if (any == null) {
      return "";
    } else {
      return formatPlain(formatAnyInner(any));
    }
  };

  formatKeys = pipeline(keys, map(formatPlain), joinCommaed);

  formatValues = pipeline(values, map(formatPair), joinCommaed);

  schemafyTurtle = function(arg) {
    var breed, color, formatWrapped, heading, isHidden, label, labelColor, penMode, penSize, shape, size, who, xcor, ycor;
    who = arg.who, color = arg.color, heading = arg.heading, xcor = arg.xcor, ycor = arg.ycor, shape = arg.shape, label = arg.label, labelColor = arg.labelColor, breed = arg.breed, isHidden = arg.isHidden, size = arg.size, penSize = arg.penSize, penMode = arg.penMode;
    formatWrapped = pipeline(formatBreedRef, formatPlain);
    return {
      "who": [who, formatNumber],
      "color": [color, formatColor],
      "heading": [heading, formatNumber],
      "xcor": [xcor, formatNumber],
      "ycor": [ycor, formatNumber],
      "shape": [shape, formatString],
      "label": [label, formatAny],
      "label-color": [labelColor, formatColor],
      "breed": [breed, formatWrapped],
      "hidden?": [isHidden, formatBoolean],
      "size": [size, formatNumber],
      "pen-size": [penSize, formatNumber],
      "pen-mode": [penMode, formatString]
    };
  };

  schemafyPatch = function(arg) {
    var pcolor, plabel, plabelColor, pxcor, pycor;
    pxcor = arg.pxcor, pycor = arg.pycor, pcolor = arg.pcolor, plabel = arg.plabel, plabelColor = arg.plabelColor;
    return {
      "pxcor": [pxcor, formatNumber],
      "pycor": [pycor, formatNumber],
      "pcolor": [pcolor, formatColor],
      "plabel": [plabel, formatAny],
      "plabel-color": [plabelColor, formatColor]
    };
  };

  schemafyLink = function(arg) {
    var breed, color, end1, end2, formatWrappedBreed, formatWrappedTurtle, isHidden, label, labelColor, shape, thickness, tieMode;
    end1 = arg.end1, end2 = arg.end2, color = arg.color, label = arg.label, labelColor = arg.labelColor, isHidden = arg.isHidden, breed = arg.breed, thickness = arg.thickness, shape = arg.shape, tieMode = arg.tieMode;
    formatWrappedBreed = pipeline(formatBreedRef, formatPlain);
    formatWrappedTurtle = pipeline(formatTurtleRef, formatPlain);
    return {
      "end1": [end1, formatWrappedTurtle],
      "end2": [end2, formatWrappedTurtle],
      "color": [color, formatColor],
      "label": [label, formatAny],
      "label-color": [labelColor, formatColor],
      "hidden?": [isHidden, formatBoolean],
      "breed": [breed, formatWrappedBreed],
      "thickness": [thickness, formatNumber],
      "shape": [shape, formatString],
      "tie-mode": [tieMode, formatString]
    };
  };

  schemafyAny = pipeline(pairs, map(function(arg) {
    var k, v;
    k = arg[0], v = arg[1];
    return [k, [v, formatAny]];
  }), toObject);

  formatDate = function(date) {
    var day, format, hour, milli, minute, month, second, tzOffset1, tzOffset2, tzSign, year;
    format = function(value, precision) {
      return value.toString().padStart(precision, '0');
    };
    month = format(date.getMonth() + 1, 2);
    day = format(date.getDate(), 2);
    year = format(date.getFullYear(), 4);
    hour = format(date.getHours(), 2);
    minute = format(date.getMinutes(), 2);
    second = format(date.getSeconds(), 2);
    milli = format(date.getMilliseconds(), 3);
    tzSign = format((date.getTimezoneOffset() > 0 ? '-' : '+'), 0);
    tzOffset1 = format(Math.abs(date.getTimezoneOffset() / 60), 2);
    tzOffset2 = format(Math.abs(date.getTimezoneOffset() % 60), 2);
    return month + "/" + day + "/" + year + " " + hour + ":" + minute + ":" + second + ":" + milli + " " + tzSign + tzOffset1 + tzOffset2;
  };

  formatGlobals = function(arg) {
    var builtins, codeGlobals, formatDirectedness, formatPerspective, formatSubject, globals, linkDirectedness, maxPxcor, maxPycor, minPxcor, minPycor, nextWhoNumber, perspective, subject, ticks;
    linkDirectedness = arg.linkDirectedness, maxPxcor = arg.maxPxcor, maxPycor = arg.maxPycor, minPxcor = arg.minPxcor, minPycor = arg.minPycor, nextWhoNumber = arg.nextWhoNumber, perspective = arg.perspective, subject = arg.subject, ticks = arg.ticks, codeGlobals = arg.codeGlobals;
    formatPerspective = function(p) {
      return formatNumber((function() {
        switch (p.toLowerCase()) {
          case 'observe':
            return 0;
          case 'ride':
            return 1;
          case 'follow':
            return 2;
          case 'watch':
            return 3;
          default:
            throw new Error("Unknown perspective: " + (JSON.stringify(x)));
        }
      })());
    };
    formatDirectedness = pipeline((function(s) {
      return s.toUpperCase();
    }), formatString);
    formatSubject = pipeline(formatAgentRef, formatPlain);
    builtins = {
      'min-pxcor': [minPxcor, formatNumber],
      'max-pxcor': [maxPxcor, formatNumber],
      'min-pycor': [minPycor, formatNumber],
      'max-pycor': [maxPycor, formatNumber],
      'perspective': [perspective, formatPerspective],
      'subject': [subject, formatSubject],
      'nextIndex': [nextWhoNumber, formatNumber],
      'directed-links': [linkDirectedness, formatDirectedness],
      'ticks': [ticks, formatNumber]
    };
    globals = Object.assign(builtins, schemafyAny(codeGlobals));
    return (formatPlain('GLOBALS')) + "\n" + (formatKeys(globals)) + "\n" + (formatValues(globals));
  };

  formatMiniGlobals = function(miniGlobals) {
    return (formatPlain('MODEL SETTINGS')) + "\n" + (formatKeys(miniGlobals)) + "\n" + (formatValues(schemafyAny(miniGlobals)));
  };

  formatMetadata = function(arg) {
    var date, filename, version;
    version = arg.version, filename = arg.filename, date = arg.date;
    return "export-world data (NetLogo Web " + version + ")\n" + filename + "\n" + (formatPlain(formatDate(date)));
  };

  formatAgents = function(agents, schemafy, builtinsNames, ownsNames) {
    var keysRow, valuesRows;
    keysRow = pipeline(unique, map(formatPlain), joinCommaed)(builtinsNames.concat(ownsNames));
    valuesRows = agents.map(function(agent) {
      var base, extras, lookup;
      lookup = function(key) {
        var ref6;
        return ((ref6 = agent.breedsOwns) != null ? ref6 : agent.patchesOwns)[key];
      };
      base = schemafy(agent);
      extras = pipeline(map(tee(id)(lookup)), toObject, schemafyAny)(ownsNames);
      return formatValues(Object.assign(base, extras));
    }).join('\n');
    return "" + keysRow + (onNextLineIfNotEmpty(valuesRows));
  };

  formatPlotData = function(arg) {
    var convertedPlot, currentPenNameOrNull, currentPenStr, isAutoplotting, isLegendOpen, name, pens, xMax, xMin, yMax, yMin;
    currentPenNameOrNull = arg.currentPenNameOrNull, isAutoplotting = arg.isAutoplotting, isLegendOpen = arg.isLegendOpen, name = arg.name, pens = arg.pens, xMax = arg.xMax, xMin = arg.xMin, yMax = arg.yMax, yMin = arg.yMin;
    currentPenStr = currentPenNameOrNull != null ? currentPenNameOrNull : '';
    convertedPlot = {
      'x min': [xMin, formatNumber],
      'x max': [xMax, formatNumber],
      'y min': [yMin, formatNumber],
      'y max': [yMax, formatNumber],
      'autoplot?': [isAutoplotting, formatBoolean],
      'current pen': [currentPenStr, formatString],
      'legend open?': [isLegendOpen, formatBoolean],
      'number of pens': [pens.length, formatNumber]
    };
    return (formatString(name)) + "\n" + (formatKeys(convertedPlot)) + "\n" + (formatValues(convertedPlot)) + "\n\n" + (formatPensData(pens)) + "\n\n" + (formatPointsData(pens));
  };

  formatPensData = function(pens) {
    var convertPen, convertedPens, formatPenMode, pensKeys, pensValues;
    formatPenMode = function(x) {
      return formatNumber((function() {
        switch (x.toLowerCase()) {
          case 'line':
            return 0;
          case 'bar':
            return 1;
          case 'point':
            return 2;
          default:
            throw new Error("Unknown pen mode: " + (JSON.stringify(x)));
        }
      })());
    };
    convertPen = function(arg) {
      var color, interval, isPenDown, mode, name, x;
      color = arg.color, interval = arg.interval, isPenDown = arg.isPenDown, mode = arg.mode, name = arg.name, x = arg.x;
      return {
        'pen name': [name, formatString],
        'pen down?': [isPenDown, formatBoolean],
        'mode': [mode, formatPenMode],
        'interval': [interval, formatNumber],
        'color': [color, formatNumber],
        'x': [x, formatNumber]
      };
    };
    convertedPens = pens.map(convertPen);
    pensKeys = formatKeys(convertPen({}));
    pensValues = convertedPens.map(pipeline(values, map(formatPair))).join('\n');
    return "" + pensKeys + (onNextLineIfNotEmpty(pensValues));
  };

  formatPointsData = function(pens) {
    var baseKeys, convertPoint, formatRow, longest, penNames, penPointsRows, pointKeys, pointValues, transposed;
    convertPoint = function(arg) {
      var color, isPenDown, x, y;
      x = arg.x, y = arg.y, color = arg.color, isPenDown = arg.isPenDown;
      return {
        'x': [x, formatNumber],
        'y': [y, formatNumber],
        'color': [color, formatNumber],
        'pen down?': [isPenDown, formatBoolean]
      };
    };
    penNames = pens.map(function(pen) {
      return formatString(pen.name);
    }).join(',,,,');
    baseKeys = keys(convertPoint({})).map(formatPlain);
    pointKeys = flatMap(function() {
      return baseKeys;
    })(rangeUntil(0)(pens.length)).join(',');
    penPointsRows = pens.map(function(pen) {
      return pen.points.map(pipeline(convertPoint, values));
    });
    formatRow = function(row) {
      return row.map(pipeline(maybe, fold(function() {
        return ['', '', '', ''];
      })(map(formatPair)))).join(',');
    };
    longest = pipeline(maxBy(function(a) {
      return a.length;
    }), fold(function() {
      return [];
    })(id));
    transposed = function(arrays) {
      return (longest(arrays)).map(function(_, i) {
        return arrays.map(function(array) {
          return array[i];
        });
      });
    };
    pointValues = transposed(penPointsRows).map(formatRow).join('\n');
    return penNames + "\n" + pointKeys + (onNextLineIfNotEmpty(pointValues));
  };

  plotDataToCSV = function(arg) {
    var metadata, miniGlobals, plot;
    metadata = arg.metadata, miniGlobals = arg.miniGlobals, plot = arg.plot;
    return (formatMetadata(metadata)) + "\n\n" + (formatMiniGlobals(miniGlobals)) + "\n\n" + (formatPlotData(plot));
  };

  allPlotsDataToCSV = function(arg) {
    var metadata, miniGlobals, plots;
    metadata = arg.metadata, miniGlobals = arg.miniGlobals, plots = arg.plots;
    return (formatMetadata(metadata)) + "\n\n" + (formatMiniGlobals(miniGlobals)) + "\n\n" + (plots.map(formatPlotData).join("\n"));
  };

  worldDataToCSV = function(allTurtlesOwnsNames, allLinksOwnsNames, patchBuiltins, turtleBuiltins, linkBuiltins) {
    return function(worldData) {
      var allPatchesOwnsNames, currentPlotName, currentPlotNameOrNull, extensions, globals, links, linksStr, metadata, obnoxiousPlotCSV, output, patches, patchesStr, plotCSV, plotManager, plots, randomState, turtles, turtlesStr;
      metadata = worldData.metadata, randomState = worldData.randomState, globals = worldData.globals, patches = worldData.patches, turtles = worldData.turtles, links = worldData.links, plotManager = worldData.plotManager, output = worldData.output, extensions = worldData.extensions;
      allPatchesOwnsNames = Object.keys(patches[0].patchesOwns);
      patchesStr = formatAgents(patches, schemafyPatch, patchBuiltins, allPatchesOwnsNames);
      turtlesStr = formatAgents(turtles, schemafyTurtle, turtleBuiltins, allTurtlesOwnsNames);
      linksStr = formatAgents(links, schemafyLink, linkBuiltins, allLinksOwnsNames);
      currentPlotNameOrNull = plotManager.currentPlotNameOrNull, plots = plotManager.plots;
      currentPlotName = currentPlotNameOrNull != null ? currentPlotNameOrNull : '';
      plotCSV = plots.map(formatPlotData).join('\n\n');
      obnoxiousPlotCSV = plotCSV.length > 0 ? plotCSV + "\n" : plotCSV;
      return (formatMetadata(metadata)) + "\n\n" + (formatPlain('RANDOM STATE')) + "\n" + (formatPlain(randomState)) + "\n\n" + (formatGlobals(globals)) + "\n\n" + (formatPlain('TURTLES')) + "\n" + turtlesStr + "\n\n" + (formatPlain('PATCHES')) + "\n" + patchesStr + "\n\n" + (formatPlain('LINKS')) + "\n" + linksStr + "\n\n" + (formatPlain('OUTPUT')) + (onNextLineIfNotEmpty(output === "" ? "" : formatString(output))) + "\n" + (formatPlain('PLOTS')) + "\n" + (formatPlain(currentPlotName)) + (onNextLineIfNotEmpty(obnoxiousPlotCSV)) + "\n" + (formatPlain('EXTENSIONS')) + "\n\n";
    };
  };

  module.exports = {
    allPlotsDataToCSV: allPlotsDataToCSV,
    plotDataToCSV: plotDataToCSV,
    worldDataToCSV: worldDataToCSV
  };

}).call(this);

},{"./exportstructures":"serialize/exportstructures","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/maybe":"brazier/maybe","brazierjs/number":"brazier/number","brazierjs/object":"brazier/object","util/typechecker":"util/typechecker"}],"serialize/exportstructures":[function(require,module,exports){
(function() {
  var AgentReference, ExportedAgent, ExportedAgentSet, ExportedColor,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  module.exports.BreedNamePair = (function() {
    function _Class(singular, plural) {
      this.singular = singular;
      this.plural = plural;
    }

    return _Class;

  })();

  ExportedColor = (function() {
    function ExportedColor() {}

    return ExportedColor;

  })();

  module.exports.ExportedColor = ExportedColor;

  module.exports.ExportedRGB = (function(superClass) {
    extend(_Class, superClass);

    function _Class(r, g, b) {
      this.r = r;
      this.g = g;
      this.b = b;
    }

    return _Class;

  })(ExportedColor);

  module.exports.ExportedRGBA = (function(superClass) {
    extend(_Class, superClass);

    function _Class(r, g, b, a) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a != null ? a : 255;
    }

    return _Class;

  })(ExportedColor);

  module.exports.ExportedColorNum = (function(superClass) {
    extend(_Class, superClass);

    function _Class(value) {
      this.value = value;
    }

    return _Class;

  })(ExportedColor);

  module.exports.ExportedGlobals = (function() {
    function _Class(linkDirectedness, maxPxcor, maxPycor, minPxcor, minPycor, nextWhoNumber, perspective, subject, ticks, codeGlobals) {
      this.linkDirectedness = linkDirectedness;
      this.maxPxcor = maxPxcor;
      this.maxPycor = maxPycor;
      this.minPxcor = minPxcor;
      this.minPycor = minPycor;
      this.nextWhoNumber = nextWhoNumber;
      this.perspective = perspective;
      this.subject = subject;
      this.ticks = ticks;
      this.codeGlobals = codeGlobals;
    }

    return _Class;

  })();

  module.exports.ExportedCommandLambda = (function() {
    function _Class(source) {
      this.source = source;
    }

    return _Class;

  })();

  module.exports.ExportedReporterLambda = (function() {
    function _Class(source) {
      this.source = source;
    }

    return _Class;

  })();

  module.exports.ExportedPoint = (function() {
    function _Class(x, y, isPenDown, color) {
      this.x = x;
      this.y = y;
      this.isPenDown = isPenDown;
      this.color = color;
    }

    return _Class;

  })();

  module.exports.ExportedPen = (function() {
    function _Class(color, interval, isPenDown, mode, name, points, x) {
      this.color = color;
      this.interval = interval;
      this.isPenDown = isPenDown;
      this.mode = mode;
      this.name = name;
      this.points = points;
      this.x = x;
    }

    return _Class;

  })();

  module.exports.ExportedPlot = (function() {
    function _Class(currentPenNameOrNull, isAutoplotting, isLegendOpen, name, pens, xMax, xMin, yMax, yMin) {
      this.currentPenNameOrNull = currentPenNameOrNull;
      this.isAutoplotting = isAutoplotting;
      this.isLegendOpen = isLegendOpen;
      this.name = name;
      this.pens = pens;
      this.xMax = xMax;
      this.xMin = xMin;
      this.yMax = yMax;
      this.yMin = yMin;
    }

    return _Class;

  })();

  module.exports.ExportedPlotManager = (function() {
    function _Class(currentPlotNameOrNull, plots) {
      this.currentPlotNameOrNull = currentPlotNameOrNull;
      this.plots = plots;
    }

    return _Class;

  })();

  module.exports.BreedReference = (function() {
    function _Class(breedName) {
      this.breedName = breedName;
    }

    return _Class;

  })();

  AgentReference = (function() {
    function AgentReference(referenceType) {
      this.referenceType = referenceType;
    }

    return AgentReference;

  })();

  module.exports.AgentReference = AgentReference;

  module.exports.LinkReference = (function(superClass) {
    extend(_Class, superClass);

    function _Class(breed, id1, id2) {
      this.breed = breed;
      this.id1 = id1;
      this.id2 = id2;
      _Class.__super__.constructor.call(this, "link");
    }

    return _Class;

  })(AgentReference);

  module.exports.PatchReference = (function(superClass) {
    extend(_Class, superClass);

    function _Class(pxcor, pycor) {
      this.pxcor = pxcor;
      this.pycor = pycor;
      _Class.__super__.constructor.call(this, "patch");
    }

    return _Class;

  })(AgentReference);

  module.exports.TurtleReference = (function(superClass) {
    extend(_Class, superClass);

    function _Class(breed, id) {
      this.breed = breed;
      this.id = id;
      _Class.__super__.constructor.call(this, "turtle");
    }

    return _Class;

  })(AgentReference);

  module.exports.NobodyReference = new AgentReference("nobody");

  ExportedAgent = (function() {
    function ExportedAgent(agentType) {
      this.agentType = agentType;
    }

    return ExportedAgent;

  })();

  module.exports.ExportedAgent = ExportedAgent;

  module.exports.ExportedLink = (function(superClass) {
    extend(_Class, superClass);

    function _Class(end1, end2, color, label, labelColor, isHidden, breed, thickness, shape, tieMode, breedsOwns) {
      this.end1 = end1;
      this.end2 = end2;
      this.color = color;
      this.label = label;
      this.labelColor = labelColor;
      this.isHidden = isHidden;
      this.breed = breed;
      this.thickness = thickness;
      this.shape = shape;
      this.tieMode = tieMode;
      this.breedsOwns = breedsOwns;
      _Class.__super__.constructor.call(this, "link");
    }

    return _Class;

  })(ExportedAgent);

  module.exports.ExportedPatch = (function(superClass) {
    extend(_Class, superClass);

    function _Class(pxcor, pycor, pcolor, plabel, plabelColor, patchesOwns) {
      this.pxcor = pxcor;
      this.pycor = pycor;
      this.pcolor = pcolor;
      this.plabel = plabel;
      this.plabelColor = plabelColor;
      this.patchesOwns = patchesOwns;
      _Class.__super__.constructor.call(this, "patch");
    }

    return _Class;

  })(ExportedAgent);

  module.exports.ExportedTurtle = (function(superClass) {
    extend(_Class, superClass);

    function _Class(who, color, heading, xcor, ycor, shape, label, labelColor, breed, isHidden, size, penSize, penMode, breedsOwns) {
      this.who = who;
      this.color = color;
      this.heading = heading;
      this.xcor = xcor;
      this.ycor = ycor;
      this.shape = shape;
      this.label = label;
      this.labelColor = labelColor;
      this.breed = breed;
      this.isHidden = isHidden;
      this.size = size;
      this.penSize = penSize;
      this.penMode = penMode;
      this.breedsOwns = breedsOwns;
      _Class.__super__.constructor.call(this, "turtle");
    }

    return _Class;

  })(ExportedAgent);

  ExportedAgentSet = (function() {
    function ExportedAgentSet(agentSetType) {
      this.agentSetType = agentSetType;
    }

    return ExportedAgentSet;

  })();

  module.exports.ExportedAgentSet = ExportedAgentSet;

  module.exports.ExportedLinkSet = (function(superClass) {
    extend(_Class, superClass);

    function _Class(references) {
      this.references = references;
      _Class.__super__.constructor.call(this, "linkset");
    }

    return _Class;

  })(ExportedAgentSet);

  module.exports.ExportedPatchSet = (function(superClass) {
    extend(_Class, superClass);

    function _Class(references) {
      this.references = references;
      _Class.__super__.constructor.call(this, "patchset");
    }

    return _Class;

  })(ExportedAgentSet);

  module.exports.ExportedTurtleSet = (function(superClass) {
    extend(_Class, superClass);

    function _Class(references) {
      this.references = references;
      _Class.__super__.constructor.call(this, "turtleset");
    }

    return _Class;

  })(ExportedAgentSet);

  module.exports.ExportedExtension = (function() {
    function _Class() {}

    return _Class;

  })();

  module.exports.Metadata = (function() {
    function _Class(version, filename, date) {
      this.version = version;
      this.filename = filename;
      this.date = date;
    }

    return _Class;

  })();

  module.exports.ExportWorldData = (function() {
    function _Class(metadata, randomState, globals, patches, turtles, links, output, plotManager, extensions) {
      this.metadata = metadata;
      this.randomState = randomState;
      this.globals = globals;
      this.patches = patches;
      this.turtles = turtles;
      this.links = links;
      this.output = output;
      this.plotManager = plotManager;
      this.extensions = extensions;
    }

    return _Class;

  })();

  module.exports.ExportPlotData = (function() {
    function _Class(metadata, miniGlobals, plot) {
      this.metadata = metadata;
      this.miniGlobals = miniGlobals;
      this.plot = plot;
    }

    return _Class;

  })();

  module.exports.ExportAllPlotsData = (function() {
    function _Class(metadata, miniGlobals, plots) {
      this.metadata = metadata;
      this.miniGlobals = miniGlobals;
      this.plots = plots;
    }

    return _Class;

  })();

}).call(this);

},{}],"serialize/importcsv":[function(require,module,exports){
(function() {
  var ExportWorldData, ExportedColorNum, ExportedExtension, ExportedGlobals, ExportedLink, ExportedPatch, ExportedPen, ExportedPlot, ExportedPlotManager, ExportedPoint, ExportedRGB, ExportedRGBA, ExportedTurtle, JSType, Metadata, arrayParse, buckets, csvNameToSaneName, extensionParse, extractGlobals, fold, foldl, globalParse, id, identity, maybe, nameToSchema, parse, parseAgentRefMaybe, parseAndExtract, parseAny, parseBool, parseBreed, parseColor, parseDate, parsePenMode, parsePerspective, parseString, parseStringMaybe, parseTurtleRefMaybe, parseVersion, plotParse, ref, ref1, ref2, singletonParse, toExportedColor, toExportedGlobals, toExportedLink, toExportedPatch, toExportedPen, toExportedPlot, toExportedPlotManager, toExportedPoint, toExportedTurtle,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  parse = require('csv-parse/lib/sync');

  JSType = require('util/typechecker');

  ref = require('./readexportedvalue'), parseAgentRefMaybe = ref.parseAgentRefMaybe, parseAny = ref.parseAny, parseBool = ref.parseBool, parseBreed = ref.parseBreed, parseString = ref.parseString, parseTurtleRefMaybe = ref.parseTurtleRefMaybe;

  ref1 = require('./exportstructures'), ExportedColorNum = ref1.ExportedColorNum, ExportedExtension = ref1.ExportedExtension, ExportedGlobals = ref1.ExportedGlobals, ExportedLink = ref1.ExportedLink, ExportedPatch = ref1.ExportedPatch, ExportedPen = ref1.ExportedPen, ExportedPlot = ref1.ExportedPlot, ExportedPlotManager = ref1.ExportedPlotManager, ExportedPoint = ref1.ExportedPoint, ExportedRGB = ref1.ExportedRGB, ExportedRGBA = ref1.ExportedRGBA, ExportedTurtle = ref1.ExportedTurtle, ExportWorldData = ref1.ExportWorldData, Metadata = ref1.Metadata;

  foldl = require('brazierjs/array').foldl;

  id = require('brazierjs/function').id;

  ref2 = require('brazierjs/maybe'), fold = ref2.fold, maybe = ref2.maybe;

  csvNameToSaneName = function(csvName) {
    var camelCased, firstLetter, lowered, qMatch, remainder, replaceAll;
    if (csvName !== "nextIndex") {
      replaceAll = function(str, regex, f) {
        var fullMatch, group, index, match, postfix, prefix;
        match = str.match(regex);
        if (match != null) {
          fullMatch = match[0], group = match[1], index = match.index;
          prefix = str.slice(0, index);
          postfix = str.slice(index + fullMatch.length);
          return replaceAll("" + prefix + (f(group)) + postfix, regex, f);
        } else {
          return str;
        }
      };
      lowered = csvName.toLowerCase();
      camelCased = replaceAll(lowered, /[ \-]+([a-z0-9])/, function(str) {
        return str.toUpperCase();
      });
      qMatch = camelCased.match(/^(\w)(.*)\?$/);
      if (qMatch != null) {
        firstLetter = qMatch[1], remainder = qMatch[2];
        return "is" + (firstLetter.toUpperCase()) + remainder;
      } else {
        return camelCased;
      }
    } else {
      return csvName;
    }
  };

  toExportedColor = function(color) {
    var a, b, g, r;
    if (JSType(color).isNumber()) {
      return new ExportedColorNum(color);
    } else if (JSType(color).isArray()) {
      r = color[0], g = color[1], b = color[2], a = color[3];
      if (a != null) {
        return new ExportedRGBA(r, g, b, a);
      } else {
        return new ExportedRGB(r, g, b);
      }
    } else {
      throw new Error("Unrecognized CSVified color: " + (JSON.stringify(color)));
    }
  };

  toExportedGlobals = function(arg, codeGlobals) {
    var directedLinks, maxPxcor, maxPycor, minPxcor, minPycor, nextIndex, perspective, subject, ticks;
    directedLinks = arg.directedLinks, maxPxcor = arg.maxPxcor, maxPycor = arg.maxPycor, minPxcor = arg.minPxcor, minPycor = arg.minPycor, nextIndex = arg.nextIndex, perspective = arg.perspective, subject = arg.subject, ticks = arg.ticks;
    return new ExportedGlobals(directedLinks, maxPxcor, maxPycor, minPxcor, minPycor, nextIndex, perspective, subject, ticks, codeGlobals);
  };

  toExportedLink = function(arg) {
    var breed, color, end1, end2, extraVars, isHidden, label, labelColor, shape, thickness, tieMode;
    breed = arg.breed, color = arg.color, end1 = arg.end1, end2 = arg.end2, isHidden = arg.isHidden, labelColor = arg.labelColor, label = arg.label, shape = arg.shape, thickness = arg.thickness, tieMode = arg.tieMode, extraVars = arg.extraVars;
    return new ExportedLink(end1, end2, toExportedColor(color), label, toExportedColor(labelColor), isHidden, breed, thickness, shape, tieMode, extraVars);
  };

  toExportedPatch = function(arg) {
    var extraVars, pcolor, plabel, plabelColor, pxcor, pycor;
    pcolor = arg.pcolor, plabelColor = arg.plabelColor, plabel = arg.plabel, pxcor = arg.pxcor, pycor = arg.pycor, extraVars = arg.extraVars;
    return new ExportedPatch(pxcor, pycor, toExportedColor(pcolor), plabel, toExportedColor(plabelColor), extraVars);
  };

  toExportedTurtle = function(arg) {
    var breed, color, extraVars, heading, isHidden, label, labelColor, penMode, penSize, shape, size, who, xcor, ycor;
    breed = arg.breed, color = arg.color, heading = arg.heading, isHidden = arg.isHidden, labelColor = arg.labelColor, label = arg.label, penMode = arg.penMode, penSize = arg.penSize, shape = arg.shape, size = arg.size, who = arg.who, xcor = arg.xcor, ycor = arg.ycor, extraVars = arg.extraVars;
    return new ExportedTurtle(who, toExportedColor(color), heading, xcor, ycor, shape, label, toExportedColor(labelColor), breed, isHidden, size, penSize, penMode, extraVars);
  };

  toExportedPoint = function(arg) {
    var color, isPenDown, x, y;
    x = arg.x, y = arg.y, isPenDown = arg.isPenDown, color = arg.color;
    return new ExportedPoint(x, y, isPenDown, color);
  };

  toExportedPen = function(arg) {
    var color, interval, isPenDown, mode, penName, points, x;
    color = arg.color, interval = arg.interval, isPenDown = arg.isPenDown, mode = arg.mode, penName = arg.penName, points = arg.points, x = arg.x;
    return new ExportedPen(color, interval, isPenDown, mode, penName, points.map(toExportedPoint), x);
  };

  toExportedPlot = function(arg) {
    var currentPen, isAutoplot, isLegendOpen, name, pens, xMax, xMin, yMax, yMin;
    currentPen = arg.currentPen, isAutoplot = arg.isAutoplot, isLegendOpen = arg.isLegendOpen, name = arg.name, pens = arg.pens, xMax = arg.xMax, xMin = arg.xMin, yMax = arg.yMax, yMin = arg.yMin;
    return new ExportedPlot(fold(function() {
      return null;
    })(id)(currentPen), isAutoplot, isLegendOpen, name, pens.map(toExportedPen), xMax, xMin, yMax, yMin);
  };

  toExportedPlotManager = function(arg) {
    var defaultOrNull, plots;
    defaultOrNull = arg["default"], plots = arg.plots;
    return new ExportedPlotManager(defaultOrNull, plots.map(toExportedPlot));
  };

  identity = function(x) {
    return x;
  };

  parseColor = function(x) {
    var unpossible;
    unpossible = function() {
      throw new Error("Why is this even getting called?  We shouldn't be parsing breed names where colors are expected.");
    };
    return parseAny(unpossible, unpossible)(x);
  };

  parseDate = function(x) {
    var _, millis, postfix, prefix, ref3;
    ref3 = x.match(/(.*):(\d+) (.*)/), _ = ref3[0], prefix = ref3[1], millis = ref3[2], postfix = ref3[3];
    return new Date(Date.parse(prefix + " " + postfix) + parseInt(millis));
  };

  parseStringMaybe = function(x) {
    var value;
    value = parseString(x);
    return maybe(value === "" ? null : value);
  };

  parsePenMode = function(x) {
    switch (parseInt(x)) {
      case 0:
        return 'line';
      case 1:
        return 'bar';
      case 2:
        return 'point';
      default:
        throw new Error("Unknown pen mode: " + x);
    }
  };

  parsePerspective = function(x) {
    switch (parseInt(x)) {
      case 0:
        return 'observe';
      case 1:
        return 'ride';
      case 2:
        return 'follow';
      case 3:
        return 'watch';
      default:
        throw new Error("Unknown perspective number: " + x);
    }
  };

  parseVersion = function(x) {
    return x.match(/export-world data \([^\)]+\)/)[1];
  };

  parseAndExtract = function(typeOfEntry) {
    return function(f) {
      return function(x) {
        return fold(function(x) {
          throw new Error("Unable to parse " + typeOfEntry + ": " + (JSON.stringify(x)));
        })(id)(f(x));
      };
    };
  };

  nameToSchema = function(singularToPlural, pluralToSingular) {
    return {
      plots: {
        color: parseFloat,
        currentPen: parseStringMaybe,
        interval: parseFloat,
        isAutoplot: parseBool,
        isLegendOpen: parseBool,
        isPenDown: parseBool,
        mode: parsePenMode,
        penName: parseString,
        xMax: parseFloat,
        xMin: parseFloat,
        x: parseFloat,
        yMax: parseFloat,
        yMin: parseFloat,
        y: parseFloat
      },
      randomState: {
        value: identity
      },
      globals: {
        directedLinks: parseString,
        minPxcor: parseInt,
        maxPxcor: parseInt,
        minPycor: parseInt,
        maxPycor: parseInt,
        nextIndex: parseInt,
        perspective: parsePerspective,
        subject: parseAndExtract("agent ref")(parseAgentRefMaybe(singularToPlural)),
        ticks: parseFloat
      },
      turtles: {
        breed: parseBreed,
        color: parseColor,
        heading: parseFloat,
        isHidden: parseBool,
        labelColor: parseColor,
        label: parseAny(singularToPlural, pluralToSingular),
        penMode: parseString,
        penSize: parseFloat,
        shape: parseString,
        size: parseFloat,
        who: parseInt,
        xcor: parseFloat,
        ycor: parseFloat
      },
      patches: {
        pcolor: parseColor,
        plabelColor: parseColor,
        plabel: parseAny(singularToPlural, pluralToSingular),
        pxcor: parseInt,
        pycor: parseInt
      },
      links: {
        breed: parseBreed,
        color: parseColor,
        end1: parseAndExtract("turtle ref")(parseTurtleRefMaybe(singularToPlural)),
        end2: parseAndExtract("turtle ref")(parseTurtleRefMaybe(singularToPlural)),
        isHidden: parseBool,
        labelColor: parseColor,
        label: parseAny(singularToPlural, pluralToSingular),
        shape: parseString,
        thickness: parseFloat,
        tieMode: parseString
      },
      output: {
        value: parseString
      },
      extensions: {}
    };
  };

  singletonParse = function(x, schema) {
    var ref3;
    if (((ref3 = x[0]) != null ? ref3[0] : void 0) != null) {
      return schema.value(x[0][0]);
    } else {
      return '';
    }
  };

  arrayParse = function(singularToPlural, pluralToSingular) {
    return function(arg, schema) {
      var f, keys, rows;
      keys = arg[0], rows = 2 <= arg.length ? slice.call(arg, 1) : [];
      f = function(acc, row) {
        var index, j, len, obj, rawKey, saneKey, value;
        obj = {
          extraVars: {}
        };
        for (index = j = 0, len = keys.length; j < len; index = ++j) {
          rawKey = keys[index];
          saneKey = csvNameToSaneName(rawKey);
          value = row[index];
          if (schema[saneKey] != null) {
            obj[saneKey] = schema[saneKey](value);
          } else if (value !== "") {
            obj.extraVars[rawKey] = parseAny(singularToPlural, pluralToSingular)(value);
          }
        }
        return acc.concat([obj]);
      };
      return foldl(f)([])(rows);
    };
  };

  globalParse = function(singularToPlural, pluralToSingular) {
    return function(csvBucket, schema) {
      return arrayParse(singularToPlural, pluralToSingular)(csvBucket, schema)[0];
    };
  };

  plotParse = function(csvBucket, schema) {
    var csvIndex, j, k, length, output, parseEntity, penCount, penIndex, plot, point, pointsIndex, ref3, ref4, ref5, results;
    parseEntity = function(acc, rowIndex, upperBound, valueRowOffset, valueColumnOffset) {
      var columnIndex, columnName, j, ref3, ref4, value;
      for (columnIndex = j = 0, ref3 = upperBound; 0 <= ref3 ? j < ref3 : j > ref3; columnIndex = 0 <= ref3 ? ++j : --j) {
        columnName = csvNameToSaneName(csvBucket[rowIndex][columnIndex]);
        value = csvBucket[rowIndex + valueRowOffset][columnIndex + valueColumnOffset];
        acc[columnName] = ((ref4 = schema[columnName]) != null ? ref4 : parseInt)(value);
      }
      return acc;
    };
    output = {
      "default": (ref3 = (ref4 = csvBucket[0]) != null ? ref4[0] : void 0) != null ? ref3 : null,
      plots: []
    };
    csvIndex = 1;
    while (csvIndex < csvBucket.length) {
      plot = parseEntity({
        name: parseString(csvBucket[csvIndex++][0])
      }, csvIndex, csvBucket[csvIndex].length, 1, 0);
      penCount = plot.numberOfPens;
      delete plot.penCount;
      csvIndex += 2;
      plot.pens = (function() {
        results = [];
        for (var j = 0; 0 <= penCount ? j < penCount : j > penCount; 0 <= penCount ? j++ : j--){ results.push(j); }
        return results;
      }).apply(this).map(function(i) {
        return parseEntity({
          points: []
        }, csvIndex, csvBucket[csvIndex].length, 1 + i, 0);
      });
      csvIndex += 2 + penCount;
      pointsIndex = 1;
      while (csvIndex + pointsIndex < csvBucket.length && csvBucket[csvIndex + pointsIndex].length !== 1) {
        length = csvBucket[csvIndex].length / penCount;
        for (penIndex = k = 0, ref5 = penCount; 0 <= ref5 ? k < ref5 : k > ref5; penIndex = 0 <= ref5 ? ++k : --k) {
          if (csvBucket[csvIndex + pointsIndex][penIndex * length] !== '') {
            point = parseEntity({}, csvIndex, length, pointsIndex, penIndex * length);
            plot.pens[penIndex].points.push(point);
          }
        }
        pointsIndex++;
      }
      csvIndex += pointsIndex;
      output.plots.push(plot);
    }
    return output;
  };

  extensionParse = function(csvBucket, schema) {
    var extNames, item, j, len, output;
    output = [];
    for (j = 0, len = csvBucket.length; j < len; j++) {
      item = csvBucket[j][0];
      if (!item.startsWith('{{')) {
        output.push([]);
      } else {
        extNames = Object.keys(output);
        output[output.length - 1].push(item);
      }
    }
    return output;
  };

  buckets = function(singularToPlural, pluralToSingular) {
    return {
      extensions: extensionParse,
      globals: globalParse(singularToPlural, pluralToSingular),
      links: arrayParse(singularToPlural, pluralToSingular),
      output: singletonParse,
      patches: arrayParse(singularToPlural, pluralToSingular),
      plots: plotParse,
      randomState: singletonParse,
      turtles: arrayParse(singularToPlural, pluralToSingular)
    };
  };

  extractGlobals = function(globals, knownNames) {
    var builtIn, key, user, value;
    builtIn = {};
    user = {};
    for (key in globals) {
      value = globals[key];
      if (indexOf.call(knownNames, key) >= 0) {
        builtIn[key] = value;
      } else {
        user[key] = value;
      }
    }
    return [builtIn, user];
  };

  module.exports = function(singularToPlural, pluralToSingular) {
    return function(csvText) {
      var _, bucketParser, bucketToRows, buckies, builtInGlobals, clusterRows, codeGlobals, dateRow, extensions, filenameRow, getSchema, globals, links, name, outExtensions, outGlobals, outLinks, outMetadata, outPatches, outPlotManager, outTurtles, output, parsedCSV, patches, plots, randomState, ref3, titleRow, turtles, world;
      buckies = buckets(singularToPlural, pluralToSingular);
      getSchema = nameToSchema(singularToPlural, pluralToSingular);
      parsedCSV = parse(csvText, {
        comment: '#',
        skip_empty_lines: true,
        relax_column_count: true
      });
      clusterRows = function(arg, row) {
        var acc, ex, latestRows, rows, saneName;
        acc = arg[0], latestRows = arg[1];
        saneName = (function() {
          var error;
          try {
            if (row.length === 1) {
              return csvNameToSaneName(row[0]);
            } else {
              return void 0;
            }
          } catch (error) {
            ex = error;
            return void 0;
          }
        })();
        if ((saneName != null) && saneName in buckies) {
          rows = [];
          acc[saneName] = rows;
          return [acc, rows];
        } else if (latestRows != null) {
          latestRows.push(row);
          return [acc, latestRows];
        } else {
          return [acc, latestRows];
        }
      };
      ref3 = foldl(clusterRows)([{}, void 0])(parsedCSV), bucketToRows = ref3[0], _ = ref3[1];
      world = {};
      for (name in buckies) {
        bucketParser = buckies[name];
        if (bucketToRows[name] != null) {
          world[name] = bucketParser(bucketToRows[name], getSchema[name]);
        }
      }
      titleRow = parsedCSV[0][0];
      filenameRow = parsedCSV[1][0];
      dateRow = parsedCSV[2][0];
      globals = world.globals, randomState = world.randomState, turtles = world.turtles, patches = world.patches, links = world.links, output = world.output, plots = world.plots, extensions = world.extensions;
      codeGlobals = globals.extraVars;
      delete globals.extraVars;
      builtInGlobals = globals;
      outMetadata = new Metadata(parseVersion(titleRow), filenameRow, parseDate(dateRow));
      outGlobals = toExportedGlobals(builtInGlobals, codeGlobals);
      outPatches = patches.map(toExportedPatch);
      outTurtles = turtles.map(toExportedTurtle);
      outLinks = links.map(toExportedLink);
      outPlotManager = toExportedPlotManager(plots);
      outExtensions = extensions.map(function() {
        return new ExportedExtension;
      });
      return new ExportWorldData(outMetadata, randomState, outGlobals, outPatches, outTurtles, outLinks, output, outPlotManager, outExtensions);
    };
  };

}).call(this);

},{"./exportstructures":"serialize/exportstructures","./readexportedvalue":"serialize/readexportedvalue","brazierjs/array":"brazier/array","brazierjs/function":"brazier/function","brazierjs/maybe":"brazier/maybe","csv-parse/lib/sync":8,"util/typechecker":"util/typechecker"}],"serialize/readexportedvalue":[function(require,module,exports){
(function() {
  var BreedNamePair, BreedReference, ExportedCommandLambda, ExportedLinkSet, ExportedPatchSet, ExportedReporterLambda, ExportedTurtleSet, LinkReference, NobodyReference, None, PatchReference, TurtleReference, firstIndexOfUnescapedQuote, fold, isSomething, mapMaybe, match, maybe, parseBreedMaybe, parseGeneric, parseInnerLink, parseLinkRefMaybe, parseList, parsePatchRefMaybe, parseTurtleRefMaybe, readAgenty, ref, ref1, tryParsers;

  ref = require('./exportstructures'), BreedNamePair = ref.BreedNamePair, BreedReference = ref.BreedReference, ExportedCommandLambda = ref.ExportedCommandLambda, ExportedLinkSet = ref.ExportedLinkSet, ExportedPatchSet = ref.ExportedPatchSet, ExportedReporterLambda = ref.ExportedReporterLambda, ExportedTurtleSet = ref.ExportedTurtleSet, LinkReference = ref.LinkReference, NobodyReference = ref.NobodyReference, PatchReference = ref.PatchReference, TurtleReference = ref.TurtleReference;

  ref1 = require('brazier/maybe'), fold = ref1.fold, isSomething = ref1.isSomething, mapMaybe = ref1.map, maybe = ref1.maybe, None = ref1.None;

  firstIndexOfUnescapedQuote = function(str) {
    var index;
    index = str.indexOf('"');
    if (index > 0) {
      if (str[index - 1] !== "\\") {
        return index;
      } else {
        return 1 + index + firstIndexOfUnescapedQuote(str.slice(index + 1));
      }
    } else {
      return index;
    }
  };

  parseList = function() {
    var parseListHelper;
    parseListHelper = function(list, readValue, readAgentLike) {
      var parseInner;
      parseInner = function(contents, acc, accIndex) {
        var endIndex, index, item, recurse, ref2, rightIndex, spaceIndex, strFrom, strIndex, strUntil, tempered;
        if (acc == null) {
          acc = [];
        }
        if (accIndex == null) {
          accIndex = 0;
        }
        strIndex = function(char) {
          return contents.indexOf(char);
        };
        strFrom = function(index) {
          return contents.slice(index);
        };
        strUntil = function(index) {
          return contents.slice(0, index);
        };
        tempered = function(index) {
          return index + (contents[index + 1] === ']' ? 1 : 2);
        };
        recurse = function(nextIndex, item) {
          return parseInner(strFrom(nextIndex), acc.concat([item]), accIndex + nextIndex);
        };
        if (!(contents.startsWith('(anonymous command:') || contents.startsWith('(anonymous reporter:'))) {
          switch (contents[0]) {
            case ']':
              return [acc, accIndex + 1];
            case '[':
              ref2 = parseListHelper(contents, readValue, readAgentLike), item = ref2[0], endIndex = ref2[1];
              return recurse(tempered(endIndex), item);
            case '{':
              index = strIndex('}');
              return recurse(tempered(index), readAgentLike(strUntil(index + 1)));
            case '"':
              index = firstIndexOfUnescapedQuote(strFrom(1)) + 1;
              return recurse(tempered(index), readValue(strUntil(index + 1)));
            default:
              rightIndex = strIndex(']');
              spaceIndex = strIndex(' ');
              if (rightIndex < spaceIndex || spaceIndex < 0) {
                return recurse(rightIndex, readValue(strUntil(rightIndex)));
              } else {
                return recurse(spaceIndex + 1, readValue(strUntil(spaceIndex)));
              }
          }
        } else {
          throw new Error("Importing a list of anonymous procedures?  Not happening!");
        }
      };
      if (list[0] === '[') {
        return parseInner(list.slice(1));
      } else {
        throw new Error("Not a valid list: " + list);
      }
    };
    return parseListHelper.apply(null, arguments)[0];
  };

  match = function(regex, str) {
    var result;
    result = str.match(regex);
    if (result != null) {
      return result;
    } else {
      throw new Error("Could not match regex " + regex + " with this string: " + str);
    }
  };

  module.exports.parseBool = function(x) {
    return x.toLowerCase() === "true";
  };

  parseBreedMaybe = function(x) {
    switch (x) {
      case "{all-turtles}":
        return maybe(new BreedReference("TURTLES"));
      case "{all-patches}":
        return maybe(new BreedReference("PATCHES"));
      case "{all-links}":
        return maybe(new BreedReference("LINKS"));
      default:
        return parseGeneric(/{breed (.*)}/)(function(arg) {
          var _, breedName;
          _ = arg[0], breedName = arg[1];
          return new BreedReference(breedName.toLowerCase());
        })(x);
    }
  };

  module.exports.parseBreed = function(x) {
    return fold(function() {
      throw new Error("Cannot parse as breed: " + x);
    })(function(x) {
      return x;
    })(parseBreedMaybe(x));
  };

  module.exports.parseString = function(str) {
    return match(/^"(.*)"$/, str)[1];
  };

  parseGeneric = function(regex) {
    return function(f) {
      return function(x) {
        return mapMaybe(f)(maybe(x.match(regex)));
      };
    };
  };

  parseTurtleRefMaybe = function(singularToPlural) {
    return parseGeneric(/{([^ ]+) (\d+)}/)(function(arg) {
      var _, breed, breedName, idStr;
      _ = arg[0], breedName = arg[1], idStr = arg[2];
      breed = new BreedNamePair(breedName, singularToPlural(breedName).toLowerCase());
      return new TurtleReference(breed, parseInt(idStr));
    });
  };

  module.exports.parseTurtleRefMaybe = parseTurtleRefMaybe;

  parsePatchRefMaybe = parseGeneric(/{patch ([\d-]+) ([\d-]+)}/)(function(arg) {
    var _, xStr, yStr;
    _ = arg[0], xStr = arg[1], yStr = arg[2];
    return new PatchReference(parseInt(xStr), parseInt(yStr));
  });

  parseLinkRefMaybe = function(singularToPlural) {
    return parseGeneric(/{([^ ]+) (\d+) (\d+)}/)(function(arg) {
      var _, breed, breedName, end1IDStr, end2IDStr;
      _ = arg[0], breedName = arg[1], end1IDStr = arg[2], end2IDStr = arg[3];
      breed = new BreedNamePair(breedName, singularToPlural(breedName).toLowerCase());
      return new LinkReference(breed, parseInt(end1IDStr), parseInt(end2IDStr));
    });
  };

  tryParsers = function(parsers) {
    return function(x) {
      var i, len, parser, result;
      for (i = 0, len = parsers.length; i < len; i++) {
        parser = parsers[i];
        result = parser(x);
        if (isSomething(result)) {
          return result;
        }
      }
      return None;
    };
  };

  module.exports.parseAgentRefMaybe = function(singularToPlural) {
    return function(x) {
      var lowerCased, stp;
      lowerCased = x.toLowerCase();
      stp = singularToPlural;
      if (lowerCased === 'nobody') {
        return maybe(NobodyReference);
      } else {
        return tryParsers([parsePatchRefMaybe, parseLinkRefMaybe(stp), parseTurtleRefMaybe(stp)])(lowerCased);
      }
    };
  };

  parseInnerLink = function(pluralToSingular) {
    return function(x) {
      var _, breed, breedName, id1, id2, ref2, unparsedBreed;
      ref2 = match(/\[(\d+) (\d+) (.*)/, x), _ = ref2[0], id1 = ref2[1], id2 = ref2[2], unparsedBreed = ref2[3];
      breedName = unparsedBreed === "{all-links}" ? "links" : match(/{breed (.*)}/, unparsedBreed)[1];
      breed = new BreedNamePair(pluralToSingular(breedName), breedName.toLowerCase());
      return new LinkReference(breed, parseInt(id1), parseInt(id2));
    };
  };

  readAgenty = function(singularToPlural, pluralToSingular) {
    return function(x) {
      var lowerCased, parseLinkSet, parsePatchSet, parseTurtleSet, parsedMaybe, parsers, stp;
      lowerCased = x.toLowerCase();
      stp = singularToPlural;
      parseTurtleSet = parseGeneric(/{turtles ?([^}]*)}/)(function(arg) {
        var _, breed, nums;
        _ = arg[0], nums = arg[1];
        breed = new BreedNamePair("turtle", "turtles");
        return new ExportedTurtleSet(nums.split(' ').map(function(x) {
          return parseInt(x);
        }).map(function(who) {
          return new TurtleReference(breed, who);
        }));
      });
      parsePatchSet = parseGeneric(/{patches ?([^}]*)}/)(function(arg) {
        var _, pairs;
        _ = arg[0], pairs = arg[1];
        return new ExportedPatchSet(pairs.split(/] ?/).slice(0, -1).map(function(x) {
          return x.slice(1).split(' ').map(function(x) {
            return parseInt(x);
          });
        }).map(function(arg1) {
          var x, y;
          x = arg1[0], y = arg1[1];
          return new PatchReference(x, y);
        }));
      });
      parseLinkSet = parseGeneric(/{links ?(.*)}$/)(function(arg) {
        var _, triples;
        _ = arg[0], triples = arg[1];
        return new ExportedLinkSet(triples.split(/] ?/).slice(0, -1).map(parseInnerLink(pluralToSingular)));
      });
      parsers = [parseBreedMaybe, parseTurtleSet, parsePatchSet, parseLinkSet, parsePatchRefMaybe, parseLinkRefMaybe(stp), parseTurtleRefMaybe(stp)];
      parsedMaybe = tryParsers(parsers)(lowerCased);
      return fold(function() {
        throw new Error("You supplied " + x + ", and I don't know what the heck that is!");
      })(function(x) {
        return x;
      })(parsedMaybe);
    };
  };

  module.exports.parseAny = function(singularToPlural, pluralToSingular) {
    var helper;
    helper = function(x) {
      var lowerCased, result;
      lowerCased = x.toLowerCase();
      result = (function() {
        switch (lowerCased) {
          case "e":
            return maybe(Math.E);
          case "pi":
            return maybe(Math.PI);
          case "true":
            return maybe(true);
          case "false":
            return maybe(false);
          case "nobody":
            return maybe(NobodyReference);
          case "black":
            return maybe(0);
          case "gray":
            return maybe(5);
          case "white":
            return maybe(9.9);
          case "red":
            return maybe(15);
          case "orange":
            return maybe(25);
          case "brown":
            return maybe(35);
          case "yellow":
            return maybe(45);
          case "green":
            return maybe(55);
          case "lime":
            return maybe(65);
          case "turquoise":
            return maybe(75);
          case "cyan":
            return maybe(85);
          case "sky":
            return maybe(95);
          case "blue":
            return maybe(105);
          case "violet":
            return maybe(115);
          case "magenta":
            return maybe(125);
          case "pink":
            return maybe(135);
          default:
            return None;
        }
      })();
      return fold(function() {
        var commandLambdaMatch, listMatch, parsedNum, reporterLambdaMatch, strMatch;
        listMatch = x.match(/^\[.*\]$/);
        if (listMatch != null) {
          return parseList(x, helper, readAgenty(singularToPlural, pluralToSingular));
        } else {
          strMatch = x.match(/^"(.*)"$/);
          if (strMatch != null) {
            return strMatch[1];
          } else {
            parsedNum = parseFloat(x);
            if (parsedNum === parsedNum) {
              return parsedNum;
            } else {
              commandLambdaMatch = x.match(/\(anonymous command: (\[.*\])\)$/);
              if (commandLambdaMatch != null) {
                return new ExportedCommandLambda(commandLambdaMatch[1]);
              } else {
                reporterLambdaMatch = x.match(/\(anonymous reporter: (\[.*\])\)$/);
                if (reporterLambdaMatch != null) {
                  return new ExportedReporterLambda(reporterLambdaMatch[1]);
                } else {
                  return readAgenty(singularToPlural, pluralToSingular)(lowerCased);
                }
              }
            }
          }
        }
      })(function(res) {
        return res;
      })(result);
    };
    return helper;
  };

}).call(this);

},{"./exportstructures":"serialize/exportstructures","brazier/maybe":"brazier/maybe"}],"shim/auxrandom":[function(require,module,exports){
(function() {
  var MersenneTwisterFast;

  MersenneTwisterFast = require('./engine-scala').MersenneTwisterFast;

  module.exports = MersenneTwisterFast();

}).call(this);

},{"./engine-scala":"shim/engine-scala"}],"shim/cloner":[function(require,module,exports){
(function() {
  var JSType, cloneFunc, foldl;

  foldl = require('brazierjs/array').foldl;

  JSType = require('util/typechecker');

  cloneFunc = function(obj) {
    var basicClone, entryCopyFunc, properties;
    if (JSType(obj).isObject() && !JSType(obj).isFunction()) {
      properties = Object.getOwnPropertyNames(obj);
      entryCopyFunc = function(acc, x) {
        acc[x] = cloneFunc(obj[x]);
        return acc;
      };
      basicClone = new obj.constructor();
      return foldl(entryCopyFunc)(basicClone)(properties);
    } else {
      return obj;
    }
  };

  module.exports = cloneFunc;

}).call(this);

},{"brazierjs/array":"brazier/array","util/typechecker":"util/typechecker"}],"shim/engine-scala":[function(require,module,exports){
(function (global){
(function() {

(function(){'use strict';
var f,g="object"===typeof __ScalaJSEnv&&__ScalaJSEnv?__ScalaJSEnv:{},k="object"===typeof g.global&&g.global?g.global:"object"===typeof global&&global&&global.Object===Object?global:this;g.global=k;var aa="object"===typeof g.exportsNamespace&&g.exportsNamespace?g.exportsNamespace:k;g.exportsNamespace=aa;k.Object.freeze(g);var ba={envInfo:g,semantics:{asInstanceOfs:2,arrayIndexOutOfBounds:2,moduleInit:2,strictFloats:!1,productionMode:!0},assumingES6:!1,linkerVersion:"0.6.22",globalThis:this};k.Object.freeze(ba);
k.Object.freeze(ba.semantics);var l=k.Math.imul||function(a,b){var c=a&65535,d=b&65535;return c*d+((a>>>16&65535)*d+c*(b>>>16&65535)<<16>>>0)|0},ca=k.Math.clz32||function(a){if(0===a)return 32;var b=1;0===(a&4294901760)&&(a<<=16,b+=16);0===(a&4278190080)&&(a<<=8,b+=8);0===(a&4026531840)&&(a<<=4,b+=4);0===(a&3221225472)&&(a<<=2,b+=2);return b+(a>>31)},da=0,ea=k.WeakMap?new k.WeakMap:null;function fa(a){return function(b,c){return!(!b||!b.$classData||b.$classData.na!==c||b.$classData.la!==a)}}
function ga(a){for(var b in a)return b}function ha(a,b){return ia(a,b,0)}function ia(a,b,c){var d=new a.Ua(b[c]);if(c<b.length-1){a=a.pa;c+=1;for(var e=d.a,h=0;h<e.length;h++)e[h]=ia(a,b,c)}return d}function ja(a){return void 0===a?"undefined":a.toString()}
function ka(a){switch(typeof a){case "string":return n(la);case "number":var b=a|0;return b===a?ma(b)?n(na):oa(b)?n(pa):n(qa):"number"===typeof a?n(ra):n(sa);case "boolean":return n(ta);case "undefined":return n(ua);default:return null===a?a.af():va(a)?n(wa):a&&a.$classData?n(a.$classData):null}}
function xa(a){switch(typeof a){case "string":return ya(p(),a);case "number":return za(Aa(),a);case "boolean":return a?1231:1237;case "undefined":return 0;default:return a&&a.$classData||null===a?a.o():null===ea?42:Ba(a)}}function Ca(a,b,c){return"string"===typeof a?a.substring(b,c):a.kc(b,c)}function Da(a){return 2147483647<a?2147483647:-2147483648>a?-2147483648:a|0}
function Ea(a,b){var c=k.Object.getPrototypeOf,d=k.Object.getOwnPropertyDescriptor;for(a=c(a);null!==a;){var e=d(a,b);if(void 0!==e)return e;a=c(a)}}function Fa(a,b,c){a=Ea(a,c);if(void 0!==a)return c=a.get,void 0!==c?c.call(b):a.value}function Ga(a,b,c,d){a=Ea(a,c);if(void 0!==a&&(a=a.set,void 0!==a)){a.call(b,d);return}throw new k.TypeError("super has no setter '"+c+"'.");}
var Ba=null!==ea?function(a){switch(typeof a){case "string":case "number":case "boolean":case "undefined":return xa(a);default:if(null===a)return 0;var b=ea.get(a);void 0===b&&(da=b=da+1|0,ea.set(a,b));return b}}:function(a){if(a&&a.$classData){var b=a.$idHashCode$0;if(void 0!==b)return b;if(k.Object.isSealed(a))return 42;da=b=da+1|0;return a.$idHashCode$0=b}return null===a?0:xa(a)};function ma(a){return"number"===typeof a&&a<<24>>24===a&&1/a!==1/-0}
function oa(a){return"number"===typeof a&&a<<16>>16===a&&1/a!==1/-0}function Ha(a){return null===a?r().ka:a}function Ia(){this.Ia=this.Ua=void 0;this.la=this.pa=this.I=null;this.na=0;this.qb=null;this.Ca="";this.z=this.Aa=this.Ba=void 0;this.name="";this.isRawJSType=this.isArrayClass=this.isInterface=this.isPrimitive=!1;this.isInstance=void 0}
function Ja(a,b,c){var d=new Ia;d.I={};d.pa=null;d.qb=a;d.Ca=b;d.z=function(){return!1};d.name=c;d.isPrimitive=!0;d.isInstance=function(){return!1};return d}function u(a,b,c,d,e,h,m){var q=new Ia,D=ga(a);h=h||function(a){return!!(a&&a.$classData&&a.$classData.I[D])};m=m||function(a,b){return!!(a&&a.$classData&&a.$classData.na===b&&a.$classData.la.I[D])};q.Ia=e;q.I=c;q.Ca="L"+b+";";q.z=m;q.name=b;q.isInterface=!1;q.isRawJSType=!!d;q.isInstance=h;return q}
function Ka(a){function b(a){if("number"===typeof a){this.a=Array(a);for(var b=0;b<a;b++)this.a[b]=e}else this.a=a}var c=new Ia,d=a.qb,e="longZero"==d?r().ka:d;b.prototype=new v;b.prototype.constructor=b;b.prototype.tb=function(){return this.a instanceof Array?new b(this.a.slice(0)):new b(new this.a.constructor(this.a))};b.prototype.$classData=c;var d="["+a.Ca,h=a.la||a,m=a.na+1;c.Ua=b;c.Ia=La;c.I={c:1,Za:1,d:1};c.pa=a;c.la=h;c.na=m;c.qb=null;c.Ca=d;c.Ba=void 0;c.Aa=void 0;c.z=void 0;c.name=d;c.isPrimitive=
!1;c.isInterface=!1;c.isArrayClass=!0;c.isInstance=function(a){return h.z(a,m)};return c}function n(a){if(!a.Ba){var b=new Ma;b.Da=a;a.Ba=b}return a.Ba}function Na(a){a.Aa||(a.Aa=Ka(a));return a.Aa}Ia.prototype.getFakeInstance=function(){return this===la?"some string":this===ta?!1:this===na||this===pa||this===qa||this===ra||this===sa?0:this===wa?r().ka:this===ua?void 0:{$classData:this}};Ia.prototype.getSuperclass=function(){return this.Ia?n(this.Ia):null};
Ia.prototype.getComponentType=function(){return this.pa?n(this.pa):null};Ia.prototype.newArrayOfThisClass=function(a){for(var b=this,c=0;c<a.length;c++)b=Na(b);return ha(b,a)};var Oa=Ja(!1,"Z","boolean"),Pa=Ja(0,"C","char"),Qa=Ja(0,"B","byte"),Ra=Ja(0,"S","short"),Sa=Ja(0,"I","int"),Ta=Ja("longZero","J","long"),Ua=Ja(0,"F","float"),Va=Ja(0,"D","double");Oa.z=fa(Oa);Pa.z=fa(Pa);Qa.z=fa(Qa);Ra.z=fa(Ra);Sa.z=fa(Sa);Ta.z=fa(Ta);Ua.z=fa(Ua);Va.z=fa(Va);function Wa(){}function v(){}v.prototype=Wa.prototype;Wa.prototype.b=function(){return this};Wa.prototype.i=function(){var a=Xa(ka(this)),b=(+(this.o()>>>0)).toString(16);return a+"@"+b};Wa.prototype.o=function(){return Ba(this)};Wa.prototype.toString=function(){return this.i()};var La=u({c:0},"java.lang.Object",{c:1},void 0,void 0,function(a){return null!==a},function(a,b){if(a=a&&a.$classData){var c=a.na||0;return!(c<b)&&(c>b||!a.la.isPrimitive)}return!1});Wa.prototype.$classData=La;
function Ya(){this.Oa=null;this.B=!1}Ya.prototype=new v;Ya.prototype.constructor=Ya;Ya.prototype.b=function(){return this};function Za(a){if(!a.B){var b=function(){return function(a){return void 0===a?w():(new x).y(a)}}(a),c=$a();c.N()?c=w():(c=c.O(),c=b(c));c.N()?c=w():(c=c.O(),c=(new x).y(c.lang));c.N()?c=w():(c=c.O(),c=b(c));c.N()?c=w():(c=c.O(),c=(new x).y(c.StrictMath));c.N()?b=w():(c=c.O(),b=b(c));a.Oa=b.N()?k.Math:b.O();a.B=!0}return a.Oa}
Ya.prototype.$classData=u({rc:0},"org.nlogo.tortoise.engine.StrictMath$",{rc:1,c:1});var ab=void 0;function bb(){ab||(ab=(new Ya).b());return ab}function Ma(){this.Da=null}Ma.prototype=new v;Ma.prototype.constructor=Ma;function Xa(a){return a.Da.name}Ma.prototype.i=function(){return(this.Da.isInterface?"interface ":this.Da.isPrimitive?"":"class ")+Xa(this)};Ma.prototype.$classData=u({Fc:0},"java.lang.Class",{Fc:1,c:1});function cb(){this.xb=null}cb.prototype=new v;cb.prototype.constructor=cb;
cb.prototype.b=function(){db=this;eb();eb();this.xb=k.performance?k.performance.now?function(){fb();return+k.performance.now()}:k.performance.webkitNow?function(){fb();return+k.performance.webkitNow()}:function(){fb();return+(new k.Date).getTime()}:function(){fb();return+(new k.Date).getTime()};return this};cb.prototype.$classData=u({Vc:0},"java.lang.System$",{Vc:1,c:1});var db=void 0;function fb(){db||(db=(new cb).b());return db}function gb(){}gb.prototype=new v;gb.prototype.constructor=gb;
function hb(){}hb.prototype=gb.prototype;function ib(){}ib.prototype=new v;ib.prototype.constructor=ib;ib.prototype.b=function(){return this};ib.prototype.$classData=u({td:0},"scala.math.Ordered$",{td:1,c:1});var jb=void 0;function kb(){this.B=0}kb.prototype=new v;kb.prototype.constructor=kb;
kb.prototype.b=function(){lb=this;(new mb).b();nb||(nb=(new ob).b());pb||(pb=(new qb).b());rb||(rb=(new sb).b());tb();ub();vb||(vb=(new wb).b());xb();yb||(yb=(new zb).b());Ab||(Ab=(new Bb).b());Cb||(Cb=(new Db).b());Eb||(Eb=(new Fb).b());Gb||(Gb=(new Hb).b());Ib||(Ib=(new Jb).b());Kb||(Kb=(new Lb).b());Mb||(Mb=(new Nb).b());Ob||(Ob=(new Pb).b());Qb||(Qb=(new Rb).b());Sb||(Sb=(new Tb).b());Ub||(Ub=(new Vb).b());jb||(jb=(new ib).b());Wb||(Wb=(new Xb).b());Yb||(Yb=(new Zb).b());$b||($b=(new ac).b());
bc||(bc=(new cc).b());return this};kb.prototype.$classData=u({vd:0},"scala.package$",{vd:1,c:1});var lb=void 0;function dc(){}dc.prototype=new v;dc.prototype.constructor=dc;
dc.prototype.b=function(){ec=this;fc||(fc=(new gc).b());hc||(hc=(new ic).b());jc||(jc=(new kc).b());lc||(lc=(new mc).b());nc||(nc=(new oc).b());pc||(pc=(new qc).b());rc||(rc=(new sc).b());tc||(tc=(new uc).b());vc||(vc=(new wc).b());xc||(xc=(new yc).b());Ac||(Ac=(new Bc).b());Cc||(Cc=(new Dc).b());Ec||(Ec=(new Fc).b());Gc||(Gc=(new Hc).b());return this};dc.prototype.$classData=u({xd:0},"scala.reflect.ClassManifestFactory$",{xd:1,c:1});var ec=void 0;function Ic(){}Ic.prototype=new v;
Ic.prototype.constructor=Ic;Ic.prototype.b=function(){return this};Ic.prototype.$classData=u({yd:0},"scala.reflect.ManifestFactory$",{yd:1,c:1});var Jc=void 0;function Kc(){}Kc.prototype=new v;Kc.prototype.constructor=Kc;Kc.prototype.b=function(){Lc=this;ec||(ec=(new dc).b());Jc||(Jc=(new Ic).b());return this};Kc.prototype.$classData=u({Od:0},"scala.reflect.package$",{Od:1,c:1});var Lc=void 0;function Mc(){}Mc.prototype=new v;Mc.prototype.constructor=Mc;Mc.prototype.b=function(){(new Nc).b();return this};
Mc.prototype.$classData=u({Td:0},"scala.util.control.Breaks",{Td:1,c:1});function Oc(){}Oc.prototype=new v;Oc.prototype.constructor=Oc;function Pc(){}Pc.prototype=Oc.prototype;function Qc(a,b){b=l(-862048943,b);b=l(461845907,b<<15|b>>>17|0);a^=b;return-430675100+l(5,a<<13|a>>>19|0)|0}function Rc(a){a=l(-2048144789,a^(a>>>16|0));a=l(-1028477387,a^(a>>>13|0));return a^(a>>>16|0)}
function Sc(a){Tc();var b=a.P();if(0===b)return a=a.R(),ya(p(),a);for(var c=-889275714,d=0;d<b;)c=Qc(c,Uc(Vc(),a.Q(d))),d=1+d|0;return Rc(c^b)}function Wc(a,b,c){var d=(new Xc).qa(0);c=(new Xc).qa(c);b.U(Yc(function(a,b,c){return function(a){c.t=Qc(c.t,Uc(Vc(),a));b.t=1+b.t|0}}(a,d,c)));return Rc(c.t^d.t)}function Db(){}Db.prototype=new v;Db.prototype.constructor=Db;Db.prototype.b=function(){return this};Db.prototype.$classData=u({Wd:0},"scala.collection.$colon$plus$",{Wd:1,c:1});var Cb=void 0;
function Bb(){}Bb.prototype=new v;Bb.prototype.constructor=Bb;Bb.prototype.b=function(){return this};Bb.prototype.$classData=u({Xd:0},"scala.collection.$plus$colon$",{Xd:1,c:1});var Ab=void 0;function Zc(){this.Wa=null}Zc.prototype=new v;Zc.prototype.constructor=Zc;Zc.prototype.b=function(){$c=this;this.Wa=(new ad).b();return this};Zc.prototype.$classData=u({ce:0},"scala.collection.Iterator$",{ce:1,c:1});var $c=void 0;function ub(){$c||($c=(new Zc).b());return $c}
function bd(a,b,c){var d=(new y).b();return cd(a,d,b,c).H.h}function cd(a,b,c,d){var e=dd();ed(b,c);a.U(Yc(function(a,b,c,d){return function(a){if(d.t)fd(b,a),d.t=!1;else return ed(b,c),fd(b,a)}}(a,b,d,e)));ed(b,")");return b}function gd(){}gd.prototype=new v;gd.prototype.constructor=gd;function hd(){}hd.prototype=gd.prototype;function id(){}id.prototype=new v;id.prototype.constructor=id;function jd(){}jd.prototype=id.prototype;function Hb(){}Hb.prototype=new v;Hb.prototype.constructor=Hb;
Hb.prototype.b=function(){return this};Hb.prototype.$classData=u({ve:0},"scala.collection.immutable.Stream$$hash$colon$colon$",{ve:1,c:1});var Gb=void 0;function kd(){this.$=!1;this.wb=this.Ha=this.ma=null;this.Ra=!1;this.Fb=this.yb=0}kd.prototype=new v;kd.prototype.constructor=kd;
kd.prototype.b=function(){ld=this;this.ma=(this.$=!!(k.ArrayBuffer&&k.Int32Array&&k.Float32Array&&k.Float64Array))?new k.ArrayBuffer(8):null;this.Ha=this.$?new k.Int32Array(this.ma,0,2):null;this.$&&new k.Float32Array(this.ma,0,2);this.wb=this.$?new k.Float64Array(this.ma,0,1):null;if(this.$)this.Ha[0]=16909060,a=1===((new k.Int8Array(this.ma,0,8))[0]|0);else var a=!0;this.yb=(this.Ra=a)?0:1;this.Fb=this.Ra?1:0;return this};
function za(a,b){var c=b|0;if(c===b&&-Infinity!==1/b)return c;if(a.$)a.wb[0]=b,a=(new z).K(a.Ha[a.Fb]|0,a.Ha[a.yb]|0);else{if(b!==b)a=!1,b=2047,c=+k.Math.pow(2,51);else if(Infinity===b||-Infinity===b)a=0>b,b=2047,c=0;else if(0===b)a=-Infinity===1/b,c=b=0;else{var d=(a=0>b)?-b:b;if(d>=+k.Math.pow(2,-1022)){b=+k.Math.pow(2,52);var c=+k.Math.log(d)/.6931471805599453,c=+k.Math.floor(c)|0,c=1023>c?c:1023,e=+k.Math.pow(2,c);e>d&&(c=-1+c|0,e/=2);e=d/e*b;d=+k.Math.floor(e);e-=d;d=.5>e?d:.5<e?1+d:0!==d%2?
1+d:d;2<=d/b&&(c=1+c|0,d=1);1023<c?(c=2047,d=0):(c=1023+c|0,d-=b);b=c;c=d}else b=d/+k.Math.pow(2,-1074),c=+k.Math.floor(b),d=b-c,b=0,c=.5>d?c:.5<d?1+c:0!==c%2?1+c:c}c=+c;a=(new z).K(c|0,(a?-2147483648:0)|(b|0)<<20|c/4294967296|0)}return a.E^a.J}kd.prototype.$classData=u({Me:0},"scala.scalajs.runtime.Bits$",{Me:1,c:1});var ld=void 0;function Aa(){ld||(ld=(new kd).b());return ld}function md(){this.B=!1}md.prototype=new v;md.prototype.constructor=md;md.prototype.b=function(){return this};
function nd(){return k.String.fromCharCode(92)}function ya(a,b){a=0;for(var c=1,d=-1+(b.length|0)|0;0<=d;)a=a+l(65535&(b.charCodeAt(d)|0),c)|0,c=l(31,c),d=-1+d|0;return a}md.prototype.$classData=u({Oe:0},"scala.scalajs.runtime.RuntimeString$",{Oe:1,c:1});var od=void 0;function p(){od||(od=(new md).b());return od}function pd(){}pd.prototype=new v;pd.prototype.constructor=pd;pd.prototype.b=function(){return this};function qd(a,b){return b&&b.$classData&&b.$classData.I.ob?b.ea:b}
function rd(a,b){return b&&b.$classData&&b.$classData.I.q?b:(new sd).y(b)}pd.prototype.$classData=u({Pe:0},"scala.scalajs.runtime.package$",{Pe:1,c:1});var td=void 0;function ud(){td||(td=(new pd).b());return td}var vd=u({Ue:0},"scala.runtime.Null$",{Ue:1,c:1});function wd(){}wd.prototype=new v;wd.prototype.constructor=wd;wd.prototype.b=function(){return this};function xd(a){yd||(yd=(new wd).b());var b=a.X();return bd(b,a.R()+"(",",")}
wd.prototype.$classData=u({Ve:0},"scala.runtime.ScalaRunTime$",{Ve:1,c:1});var yd=void 0;function zd(){}zd.prototype=new v;zd.prototype.constructor=zd;zd.prototype.b=function(){return this};function Uc(a,b){if(null===b)return 0;if("number"===typeof b){a=+b;b=Da(a);if(b===a)a=b;else{var c=r();b=Ad(c,a);c=c.m;a=Bd(r(),b,c)===a?b^c:za(Aa(),a)}return a}return va(b)?(a=Ha(b),b=(new z).K(a.E,a.J),a=b.E,b=b.J,b===a>>31?a:a^b):xa(b)}zd.prototype.$classData=u({Xe:0},"scala.runtime.Statics$",{Xe:1,c:1});
var Cd=void 0;function Vc(){Cd||(Cd=(new zd).b());return Cd}function Dd(){}Dd.prototype=new v;Dd.prototype.constructor=Dd;function Ed(){}Ed.prototype=Dd.prototype;function A(){this.l=null}A.prototype=new v;A.prototype.constructor=A;function Fd(){}Fd.prototype=A.prototype;
A.prototype.Ea=function(){if(void 0===k.Error.captureStackTrace){try{var a={}.undef()}catch(b){if(a=rd(ud(),b),null!==a)if(a&&a.$classData&&a.$classData.I.ob)a=a.ea;else throw qd(ud(),a);else throw b;}this.stackdata=a}else k.Error.captureStackTrace(this),this.stackdata=this;return this};A.prototype.Ya=function(){return this.l};A.prototype.i=function(){var a=Xa(ka(this)),b=this.Ya();return null===b?a:a+": "+b};A.prototype.p=function(a){this.l=a;this.Ea();return this};function Gd(){}Gd.prototype=new v;
Gd.prototype.constructor=Gd;function Hd(){}Hd.prototype=Gd.prototype;Gd.prototype.Fa=function(a){Id(this,a);return this};function Jd(){this.Ab=this.Qb=null;this.Rb=this.Sb=0;this.W=this.Bb=this.bb=null;this.Ta=!1}Jd.prototype=new v;Jd.prototype.constructor=Jd;function Kd(a){if(a.Ta){a.W=a.bb.exec(a.Bb);if(null!==a.W){var b=a.W[0];if(void 0===b)throw(new B).e("undefined.get");if(null===b)throw(new C).b();""===b&&(b=a.bb,b.lastIndex=1+(b.lastIndex|0)|0)}else a.Ta=!1;w();return null!==a.W}return!1}
function Ld(a){if(null===a.W)throw(new Md).e("No match available");return a.W}function Nd(a){var b=Ld(a).index|0;a=Ld(a)[0];if(void 0===a)throw(new B).e("undefined.get");return b+(a.length|0)|0}Jd.prototype.$classData=u({Yc:0},"java.util.regex.Matcher",{Yc:1,c:1,df:1});function Od(){}Od.prototype=new v;Od.prototype.constructor=Od;Od.prototype.b=function(){return this};Od.prototype.$classData=u({id:0},"scala.Predef$$anon$3",{id:1,c:1,gc:1});function mb(){}mb.prototype=new v;
mb.prototype.constructor=mb;mb.prototype.b=function(){return this};mb.prototype.i=function(){return"object AnyRef"};mb.prototype.$classData=u({wd:0},"scala.package$$anon$1",{wd:1,c:1,lf:1});function Pd(){this.nb=0}Pd.prototype=new Pc;Pd.prototype.constructor=Pd;Pd.prototype.b=function(){Qd=this;this.nb=ya(p(),"Seq");ya(p(),"Map");ya(p(),"Set");return this};function Rd(a){var b=Tc();return a&&a.$classData&&a.$classData.I.ne?Rc(b.nb^0):Wc(b,a,b.nb)}
Pd.prototype.$classData=u({Vd:0},"scala.util.hashing.MurmurHash3$",{Vd:1,qf:1,c:1});var Qd=void 0;function Tc(){Qd||(Qd=(new Pd).b());return Qd}function Sd(){}Sd.prototype=new jd;Sd.prototype.constructor=Sd;function Td(){}Td.prototype=Sd.prototype;function E(){}E.prototype=new jd;E.prototype.constructor=E;function Ud(){}Ud.prototype=E.prototype;E.prototype.b=function(){(new Vd).Ga(this);return this};function Wd(){}Wd.prototype=new v;Wd.prototype.constructor=Wd;function Xd(){}Xd.prototype=Wd.prototype;
Wd.prototype.Ga=function(a){if(null===a)throw qd(ud(),null);return this};function Yd(){}Yd.prototype=new hd;Yd.prototype.constructor=Yd;function Zd(){}Zd.prototype=Yd.prototype;function $d(){}$d.prototype=new v;$d.prototype.constructor=$d;$d.prototype.b=function(){return this};$d.prototype.L=function(){return this};$d.prototype.i=function(){return"\x3cfunction1\x3e"};$d.prototype.$classData=u({pe:0},"scala.collection.immutable.List$$anon$1",{pe:1,c:1,ca:1});function ae(){}ae.prototype=new v;
ae.prototype.constructor=ae;function be(){}be.prototype=ae.prototype;ae.prototype.i=function(){return"\x3cfunction1\x3e"};function ce(){this.t=!1}ce.prototype=new v;ce.prototype.constructor=ce;ce.prototype.i=function(){return""+this.t};function dd(){var a=new ce;a.t=!0;return a}ce.prototype.$classData=u({Qe:0},"scala.runtime.BooleanRef",{Qe:1,c:1,d:1});var ua=u({Re:0},"scala.runtime.BoxedUnit",{Re:1,c:1,d:1},void 0,void 0,function(a){return void 0===a});function Xc(){this.t=0}Xc.prototype=new v;
Xc.prototype.constructor=Xc;Xc.prototype.i=function(){return""+this.t};Xc.prototype.qa=function(a){this.t=a;return this};Xc.prototype.$classData=u({Se:0},"scala.runtime.IntRef",{Se:1,c:1,d:1});function de(){this.Ob=this.Nb=this.Jb=this.Pb=this.Lb=this.Kb=this.Mb=0;this.Ib=null;this.j=0}de.prototype=new v;de.prototype.constructor=de;
de.prototype.b=function(){ee=this;this.Mb=624;this.j|=1;this.Kb=397;this.j|=2;this.Lb=-1727483681;this.j|=4;this.Pb=-2147483648;this.j|=8;this.Jb=2147483647;this.j|=16;this.Nb=-1658038656;this.j|=32;this.Ob=-272236544;this.j|=64;this.Ib="0";this.j|=128;return this};function F(){var a=G();if(0===(16&a.j))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 146");return a.Jb}
function I(){var a=G();if(0===(2&a.j))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 143");return a.Kb}function K(){var a=G();if(0===(32&a.j))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 147");return a.Nb}
function L(){var a=G();if(0===(8&a.j))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 145");return a.Pb}function M(){var a=G();if(0===(1&a.j))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 142");return a.Mb}
function N(){var a=G();if(0===(64&a.j))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 148");return a.Ob}function fe(){var a=G();if(0===(128&a.j))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 149");return a.Ib}
de.prototype.$classData=u({qc:0},"org.nlogo.tortoise.engine.MersenneTwisterFast$",{qc:1,c:1,f:1,d:1});var ee=void 0;function G(){ee||(ee=(new de).b());return ee}var ta=u({Bc:0},"java.lang.Boolean",{Bc:1,c:1,d:1,C:1},void 0,void 0,function(a){return"boolean"===typeof a});function ge(){this.ua=0}ge.prototype=new v;ge.prototype.constructor=ge;ge.prototype.i=function(){return k.String.fromCharCode(this.ua)};function he(a){var b=new ge;b.ua=a;return b}ge.prototype.o=function(){return this.ua};
ge.prototype.$classData=u({Dc:0},"java.lang.Character",{Dc:1,c:1,d:1,C:1});function ie(){this.B=0}ie.prototype=new v;ie.prototype.constructor=ie;ie.prototype.b=function(){return this};ie.prototype.$classData=u({Ec:0},"java.lang.Character$",{Ec:1,c:1,f:1,d:1});var je=void 0;function ke(){this.Va=null;this.B=!1}ke.prototype=new v;ke.prototype.constructor=ke;ke.prototype.b=function(){return this};
function le(a){a.B||(a.Va=new k.RegExp("^[\\x00-\\x20]*[+-]?(NaN|Infinity|(\\d+\\.?\\d*|\\.\\d+)([eE][+-]?\\d+)?)[fFdD]?[\\x00-\\x20]*$"),a.B=!0);return a.Va}ke.prototype.$classData=u({Hc:0},"java.lang.Double$",{Hc:1,c:1,f:1,d:1});var me=void 0;function ne(){this.l=null}ne.prototype=new Fd;ne.prototype.constructor=ne;function oe(){}oe.prototype=ne.prototype;function pe(){this.l=null}pe.prototype=new Fd;pe.prototype.constructor=pe;function qe(){}qe.prototype=pe.prototype;function re(){}
re.prototype=new v;re.prototype.constructor=re;re.prototype.b=function(){return this};function se(a){throw(new te).e(ue(ve(new we,xe(new O,['For input string: "','"'])),xe(new O,[a])));}
function ye(a){if(null===a||0===((new P).e(a).r.length|0))se(a);else{var b=45===(65535&(a.charCodeAt(0)|0))||43===(65535&(a.charCodeAt(0)|0))?1:0;if(((new P).e(a).r.length|0)<=b)se(a);else{for(;;){var c=b,d=(new P).e(a).r;if(c<(d.length|0))je||(je=(new ie).b()),c=65535&(a.charCodeAt(b)|0),0>(48<=c&&57>=c&&10>(-48+c|0)?-48+c|0:65<=c&&90>=c&&0>(-65+c|0)?-55+c|0:97<=c&&122>=c&&0>(-97+c|0)?-87+c|0:65313<=c&&65338>=c&&0>(-65313+c|0)?-65303+c|0:65345<=c&&65370>=c&&0>(-65345+c|0)?-65303+c|0:-1)&&se(a),b=
1+b|0;else break}b=+k.parseInt(a,10);return b!==b||2147483647<b||-2147483648>b?se(a):Da(b)}}}re.prototype.$classData=u({Mc:0},"java.lang.Integer$",{Mc:1,c:1,f:1,d:1});var ze=void 0;function Ae(){ze||(ze=(new re).b())}function Be(){}Be.prototype=new v;Be.prototype.constructor=Be;Be.prototype.b=function(){return this};function Ce(){De||(De=(new Be).b());var a=Ee(),b=Ee();return(new z).K(b,a)}function Ee(){var a=4294967296*+k.Math.random();return Da(-2147483648+ +k.Math.floor(a))}
Be.prototype.$classData=u({Xc:0},"java.util.Random$",{Xc:1,c:1,f:1,d:1});var De=void 0;function Fe(){this.sb=this.V=null}Fe.prototype=new v;Fe.prototype.constructor=Fe;Fe.prototype.i=function(){return this.sb};Fe.prototype.$classData=u({Zc:0},"java.util.regex.Pattern",{Zc:1,c:1,f:1,d:1});function Ge(){this.Cb=this.Db=null}Ge.prototype=new v;Ge.prototype.constructor=Ge;
Ge.prototype.b=function(){He=this;this.Db=new k.RegExp("^\\\\Q(.|\\n|\\r)\\\\E$");this.Cb=new k.RegExp("^\\(\\?([idmsuxU]*)(?:-([idmsuxU]*))?\\)");return this};function Ie(a){for(var b="",c=0;c<(a.length|0);){var d=65535&(a.charCodeAt(c)|0);switch(d){case 92:case 46:case 40:case 41:case 91:case 93:case 123:case 125:case 124:case 63:case 42:case 43:case 94:case 36:d="\\"+he(d);break;default:d=he(d)}b=""+b+d;c=1+c|0}return b}
function Je(a,b){switch(b){case 105:return 2;case 100:return 1;case 109:return 8;case 115:return 32;case 117:return 64;case 120:return 4;case 85:return 256;default:throw(new Q).e("bad in-pattern flag");}}Ge.prototype.$classData=u({$c:0},"java.util.regex.Pattern$",{$c:1,c:1,f:1,d:1});var He=void 0;function Ke(){He||(He=(new Ge).b());return He}function Le(){}Le.prototype=new v;Le.prototype.constructor=Le;Le.prototype.b=function(){return this};
function $a(){Me||(Me=(new Le).b());var a=k.java;return null===a?w():(new x).y(a)}Le.prototype.$classData=u({ed:0},"scala.Option$",{ed:1,c:1,f:1,d:1});var Me=void 0;function Ne(){}Ne.prototype=new hb;Ne.prototype.constructor=Ne;Ne.prototype.b=function(){Oe=this;lb||(lb=(new kb).b());vb||(vb=(new wb).b());Pe||(Pe=(new Qe).b());Re||(Re=(new Se).b());Lc||(Lc=(new Kc).b());Lc||(Lc=(new Kc).b());Te||(Te=(new Ue).b());(new Od).b();(new Ve).b();(new We).b();return this};
Ne.prototype.$classData=u({fd:0},"scala.Predef$",{fd:1,gf:1,c:1,ef:1});var Oe=void 0;function Xe(){}Xe.prototype=new v;Xe.prototype.constructor=Xe;Xe.prototype.b=function(){return this};Xe.prototype.$classData=u({ld:0},"scala.StringContext$",{ld:1,c:1,f:1,d:1});var Ye=void 0;function Rb(){}Rb.prototype=new v;Rb.prototype.constructor=Rb;Rb.prototype.b=function(){return this};Rb.prototype.$classData=u({pd:0},"scala.math.Fractional$",{pd:1,c:1,f:1,d:1});var Qb=void 0;function Tb(){}Tb.prototype=new v;
Tb.prototype.constructor=Tb;Tb.prototype.b=function(){return this};Tb.prototype.$classData=u({qd:0},"scala.math.Integral$",{qd:1,c:1,f:1,d:1});var Sb=void 0;function Vb(){}Vb.prototype=new v;Vb.prototype.constructor=Vb;Vb.prototype.b=function(){return this};Vb.prototype.$classData=u({rd:0},"scala.math.Numeric$",{rd:1,c:1,f:1,d:1});var Ub=void 0;function Zb(){}Zb.prototype=new v;Zb.prototype.constructor=Zb;Zb.prototype.b=function(){return this};
Zb.prototype.$classData=u({Pd:0},"scala.util.Either$",{Pd:1,c:1,f:1,d:1});var Yb=void 0;function ac(){}ac.prototype=new v;ac.prototype.constructor=ac;ac.prototype.b=function(){return this};ac.prototype.i=function(){return"Left"};ac.prototype.$classData=u({Qd:0},"scala.util.Left$",{Qd:1,c:1,f:1,d:1});var $b=void 0;function cc(){}cc.prototype=new v;cc.prototype.constructor=cc;cc.prototype.b=function(){return this};cc.prototype.i=function(){return"Right"};
cc.prototype.$classData=u({Rd:0},"scala.util.Right$",{Rd:1,c:1,f:1,d:1});var bc=void 0;function Ze(){this.rb=!1}Ze.prototype=new v;Ze.prototype.constructor=Ze;Ze.prototype.b=function(){this.rb=!1;return this};Ze.prototype.$classData=u({Ud:0},"scala.util.control.NoStackTrace$",{Ud:1,c:1,f:1,d:1});var $e=void 0;function af(){}af.prototype=new Xd;af.prototype.constructor=af;af.prototype.b=function(){Wd.prototype.Ga.call(this,tb());return this};
af.prototype.$classData=u({$d:0},"scala.collection.IndexedSeq$$anon$1",{$d:1,je:1,c:1,gc:1});function bf(){}bf.prototype=new Ud;bf.prototype.constructor=bf;function cf(){}cf.prototype=bf.prototype;function Vd(){this.va=null}Vd.prototype=new Xd;Vd.prototype.constructor=Vd;Vd.prototype.Ga=function(a){if(null===a)throw qd(ud(),null);this.va=a;Wd.prototype.Ga.call(this,a);return this};Vd.prototype.$classData=u({ie:0},"scala.collection.generic.GenTraversableFactory$$anon$1",{ie:1,je:1,c:1,gc:1});
function df(){}df.prototype=new Zd;df.prototype.constructor=df;function ef(){}ef.prototype=df.prototype;function zb(){}zb.prototype=new v;zb.prototype.constructor=zb;zb.prototype.b=function(){return this};zb.prototype.i=function(){return"::"};zb.prototype.$classData=u({me:0},"scala.collection.immutable.$colon$colon$",{me:1,c:1,f:1,d:1});var yb=void 0;function Nb(){}Nb.prototype=new v;Nb.prototype.constructor=Nb;Nb.prototype.b=function(){return this};
Nb.prototype.$classData=u({se:0},"scala.collection.immutable.Range$",{se:1,c:1,f:1,d:1});var Mb=void 0;function Lb(){}Lb.prototype=new v;Lb.prototype.constructor=Lb;Lb.prototype.b=function(){return this};Lb.prototype.$classData=u({Ie:0},"scala.collection.mutable.StringBuilder$",{Ie:1,c:1,f:1,d:1});var Kb=void 0;function ff(){this.vb=null}ff.prototype=new be;ff.prototype.constructor=ff;ff.prototype.L=function(a){return(0,this.vb)(a)};function Yc(a){var b=new ff;b.vb=a;return b}
ff.prototype.$classData=u({Le:0},"scala.scalajs.runtime.AnonFunction1",{Le:1,Of:1,c:1,ca:1});function gf(){this.m=0;this.ka=null}gf.prototype=new v;gf.prototype.constructor=gf;gf.prototype.b=function(){hf=this;this.ka=(new z).K(0,0);return this};function jf(a,b,c){return 0===(-2097152&c)?""+(4294967296*c+ +(b>>>0)):kf(a,b,c,1E9,0,2)}function Bd(a,b,c){return 0>c?-(4294967296*+((0!==b?~c:-c|0)>>>0)+ +((-b|0)>>>0)):4294967296*c+ +(b>>>0)}
function Ad(a,b){if(-9223372036854775808>b)return a.m=-2147483648,0;if(0x7fffffffffffffff<=b)return a.m=2147483647,-1;var c=b|0,d=b/4294967296|0;a.m=0>b&&0!==c?-1+d|0:d;return c}
function kf(a,b,c,d,e,h){var m=(0!==e?ca(e):32+ca(d)|0)-(0!==c?ca(c):32+ca(b)|0)|0,q=m,D=0===(32&q)?d<<q:0,J=0===(32&q)?(d>>>1|0)>>>(31-q|0)|0|e<<q:d<<q,q=b,t=c;for(b=c=0;0<=m&&0!==(-2097152&t);){var U=q,zc=t,Ag=D,ag=J;if(zc===ag?(-2147483648^U)>=(-2147483648^Ag):(-2147483648^zc)>=(-2147483648^ag))U=t,zc=J,t=q-D|0,U=(-2147483648^t)>(-2147483648^q)?-1+(U-zc|0)|0:U-zc|0,q=t,t=U,32>m?c|=1<<m:b|=1<<m;m=-1+m|0;U=J>>>1|0;D=D>>>1|0|J<<31;J=U}m=t;if(m===e?(-2147483648^q)>=(-2147483648^d):(-2147483648^m)>=
(-2147483648^e))m=4294967296*t+ +(q>>>0),d=4294967296*e+ +(d>>>0),1!==h&&(J=m/d,e=J/4294967296|0,D=c,c=J=D+(J|0)|0,b=(-2147483648^J)<(-2147483648^D)?1+(b+e|0)|0:b+e|0),0!==h&&(d=m%d,q=d|0,t=d/4294967296|0);if(0===h)return a.m=b,c;if(1===h)return a.m=t,q;a=""+q;return""+(4294967296*b+ +(c>>>0))+"000000000".substring(a.length|0)+a}
function lf(a,b,c,d,e){if(0===(d|e))throw(new mf).e("/ by zero");if(c===b>>31){if(e===d>>31){if(-1!==d){var h=b%d|0;a.m=h>>31;return h}return a.m=0}if(-2147483648===b&&-2147483648===d&&0===e)return a.m=0;a.m=c;return b}if(h=0>c){var m=-b|0;c=0!==b?~c:-c|0}else m=b;0>e?(b=-d|0,d=0!==d?~e:-e|0):(b=d,d=e);e=c;0===(-2097152&e)?0===(-2097152&d)?(m=(4294967296*e+ +(m>>>0))%(4294967296*d+ +(b>>>0)),a.m=m/4294967296|0,m|=0):a.m=e:0===d&&0===(b&(-1+b|0))?(a.m=0,m&=-1+b|0):0===b&&0===(d&(-1+d|0))?a.m=e&(-1+
d|0):m=kf(a,m,e,b,d,1)|0;return h?(h=a.m,a.m=0!==m?~h:-h|0,-m|0):m}gf.prototype.$classData=u({Ne:0},"scala.scalajs.runtime.RuntimeLong$",{Ne:1,c:1,f:1,d:1});var hf=void 0;function r(){hf||(hf=(new gf).b());return hf}var nf=u({Te:0},"scala.runtime.Nothing$",{Te:1,q:1,c:1,d:1});function of(){}of.prototype=new v;of.prototype.constructor=of;function pf(){}pf.prototype=of.prototype;var la=u({sc:0},"java.lang.String",{sc:1,c:1,d:1,Eb:1,C:1},void 0,void 0,function(a){return"string"===typeof a});
function qf(){this.l=null}qf.prototype=new oe;qf.prototype.constructor=qf;qf.prototype.y=function(a){A.prototype.p.call(this,""+a);return this};qf.prototype.$classData=u({zc:0},"java.lang.AssertionError",{zc:1,bf:1,q:1,c:1,d:1});
var na=u({Cc:0},"java.lang.Byte",{Cc:1,ga:1,c:1,d:1,C:1},void 0,void 0,function(a){return ma(a)}),sa=u({Gc:0},"java.lang.Double",{Gc:1,ga:1,c:1,d:1,C:1},void 0,void 0,function(a){return"number"===typeof a}),ra=u({Ic:0},"java.lang.Float",{Ic:1,ga:1,c:1,d:1,C:1},void 0,void 0,function(a){return"number"===typeof a}),qa=u({Lc:0},"java.lang.Integer",{Lc:1,ga:1,c:1,d:1,C:1},void 0,void 0,function(a){return"number"===typeof a&&(a|0)===a&&1/a!==1/-0}),wa=u({Pc:0},"java.lang.Long",{Pc:1,ga:1,c:1,d:1,C:1},
void 0,void 0,function(a){return va(a)});function rf(){this.l=null}rf.prototype=new qe;rf.prototype.constructor=rf;function R(){}R.prototype=rf.prototype;rf.prototype.e=function(a){A.prototype.p.call(this,a);return this};rf.prototype.$classData=u({u:0},"java.lang.RuntimeException",{u:1,A:1,q:1,c:1,d:1});var pa=u({Tc:0},"java.lang.Short",{Tc:1,ga:1,c:1,d:1,C:1},void 0,void 0,function(a){return oa(a)});function sf(){this.h=null}sf.prototype=new v;sf.prototype.constructor=sf;f=sf.prototype;
f.b=function(){this.h="";return this};f.kc=function(a,b){return this.h.substring(a,b)};f.i=function(){return this.h};f.qa=function(a){sf.prototype.b.call(this);if(0>a)throw(new tf).b();return this};f.D=function(){return this.h.length|0};f.e=function(a){sf.prototype.b.call(this);if(null===a)throw(new C).b();this.h=a;return this};f.$classData=u({Uc:0},"java.lang.StringBuilder",{Uc:1,c:1,Eb:1,xc:1,d:1});function uf(){}uf.prototype=new v;uf.prototype.constructor=uf;function vf(){}vf.prototype=uf.prototype;
uf.prototype.i=function(){return"\x3cfunction1\x3e"};function wf(){}wf.prototype=new v;wf.prototype.constructor=wf;function xf(){}xf.prototype=wf.prototype;wf.prototype.i=function(){return"\x3cfunction1\x3e"};function Pb(){}Pb.prototype=new v;Pb.prototype.constructor=Pb;Pb.prototype.b=function(){return this};Pb.prototype.$classData=u({od:0},"scala.math.Equiv$",{od:1,c:1,mf:1,f:1,d:1});var Ob=void 0;function Xb(){}Xb.prototype=new v;Xb.prototype.constructor=Xb;Xb.prototype.b=function(){return this};
Xb.prototype.$classData=u({ud:0},"scala.math.Ordering$",{ud:1,c:1,nf:1,f:1,d:1});var Wb=void 0;function Ue(){}Ue.prototype=new v;Ue.prototype.constructor=Ue;Ue.prototype.b=function(){return this};Ue.prototype.i=function(){return"\x3c?\x3e"};Ue.prototype.$classData=u({Nd:0},"scala.reflect.NoManifest$",{Nd:1,c:1,s:1,f:1,d:1});var Te=void 0;function yf(){}yf.prototype=new v;yf.prototype.constructor=yf;function zf(){}zf.prototype=yf.prototype;
yf.prototype.i=function(){return(this.M()?"non-empty":"empty")+" iterator"};yf.prototype.U=function(a){for(;this.M();)a.L(this.F())};function Af(){}Af.prototype=new Td;Af.prototype.constructor=Af;function Bf(){}Bf.prototype=Af.prototype;function Qe(){}Qe.prototype=new ef;Qe.prototype.constructor=Qe;Qe.prototype.b=function(){return this};Qe.prototype.$classData=u({qe:0},"scala.collection.immutable.Map$",{qe:1,yf:1,Af:1,wf:1,c:1});var Pe=void 0;function z(){this.J=this.E=0}z.prototype=new Ed;
z.prototype.constructor=z;f=z.prototype;f.i=function(){var a=r(),b=this.E,c=this.J;return c===b>>31?""+b:0>c?"-"+jf(a,-b|0,0!==b?~c:-c|0):jf(a,b,c)};f.K=function(a,b){this.E=a;this.J=b;return this};f.qa=function(a){z.prototype.K.call(this,a,a>>31);return this};f.o=function(){return this.E^this.J};function va(a){return!!(a&&a.$classData&&a.$classData.I.jc)}f.$classData=u({jc:0},"scala.scalajs.runtime.RuntimeLong",{jc:1,ga:1,c:1,d:1,C:1});function Cf(){}Cf.prototype=new pf;
Cf.prototype.constructor=Cf;function Df(){}Df.prototype=Cf.prototype;Cf.prototype.uc=function(){return this};function S(){this.ic=r().ka;this.xa=null;this.ab=0;this.wa=null;this.Qa=0;this.Pa=!1;this.g=0}S.prototype=new Hd;S.prototype.constructor=S;S.prototype.Fa=function(a){this.ic=a;Gd.prototype.Fa.call(this,Ce());this.xa=null;this.g|=1;this.ab=0;this.g|=2;this.wa=null;this.g|=4;this.Qa=0;this.g|=8;this.Pa=!1;this.g|=16;Id(this,a);return this};
function T(a){if(0===(2&a.g))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 161");return a.ab}function V(a){if(0===(1&a.g))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 160");return a.xa}
function Ef(a){if(0===(8&a.g))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 163");return a.Qa}function Ff(a){if(0===(16&a.g))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 164");return a.Pa}
function W(a){if(0===(4&a.g))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 162");return a.wa}function Gf(a,b){a.Pa=b;a.g|=16}function Hf(a,b){a.Qa=b;a.g|=8}function X(a,b){a.ab=b;a.g|=2}
function Id(a,b){Gf(a,!1);Hf(a,0);var c=ha(Na(Sa),[M()]);a.xa=c;a.g|=1;c=ha(Na(Sa),[2]);a.wa=c;a.g|=4;W(a).a[0]=0;var c=W(a).a,d=G();if(0===(4&d.j))throw(new H).e("Uninitialized field: /Users/carolynremmler/dev/walter-repo/tortoise-repo/Tortoise/engine/src/main/scala/MersenneTwisterFast.scala: 144");c[1]=d.Lb;V(a).a[0]=b.E;for(X(a,1);T(a)<M();)V(a).a[T(a)]=l(1812433253,V(a).a[-1+T(a)|0]^(V(a).a[-1+T(a)|0]>>>30|0))+T(a)|0,b=V(a),c=T(a),b.a[c]=b.a[c],X(a,1+T(a)|0)}
S.prototype.nextInt=function(){for(var a=arguments.length|0,b=0,c=[];b<a;)c.push(arguments[b]),b=b+1|0;switch(c.length|0){case 0:if(T(this)>=M()){for(var b=0,c=V(this),d=W(this);b<(M()-I()|0);)a=c.a[b]&L()|c.a[1+b|0]&F(),c.a[b]=c.a[b+I()|0]^(a>>>1|0)^d.a[1&a],b=1+b|0;for(;b<(-1+M()|0);)a=c.a[b]&L()|c.a[1+b|0]&F(),c.a[b]=c.a[b+(I()-M()|0)|0]^(a>>>1|0)^d.a[1&a],b=1+b|0;a=c.a[-1+M()|0]&L()|c.a[0]&F();c.a[-1+M()|0]=c.a[-1+I()|0]^(a>>>1|0)^d.a[1&a];X(this,0)}a=V(this).a[X(this,1+T(this)|0),-1+T(this)|
0];a^=a>>>11|0;a^=a<<7&K();a^=a<<15&N();return a^(a>>>18|0);case 1:a=c[0]|0;if(0>=a)throw(new Q).e("n must be positive");if((a&(-a|0))===a){if(T(this)>=M()){for(var b=0,d=V(this),e=W(this);b<(M()-I()|0);)c=d.a[b]&L()|d.a[1+b|0]&F(),d.a[b]=d.a[b+I()|0]^(c>>>1|0)^e.a[1&c],b=1+b|0;for(;b<(-1+M()|0);)c=d.a[b]&L()|d.a[1+b|0]&F(),d.a[b]=d.a[b+(I()-M()|0)|0]^(c>>>1|0)^e.a[1&c],b=1+b|0;c=d.a[-1+M()|0]&L()|d.a[0]&F();d.a[-1+M()|0]=d.a[-1+I()|0]^(c>>>1|0)^e.a[1&c];X(this,0)}var c=V(this).a[X(this,1+T(this)|
0),-1+T(this)|0],c=c^(c>>>11|0),c=c^c<<7&K(),c=c^c<<15&N(),b=a>>31,c=(c^(c>>>18|0))>>>1|0,d=c>>31,h=65535&a,e=a>>>16|0,m=65535&c,q=c>>>16|0,D=l(h,m),m=l(e,m),J=l(h,q),h=D+((m+J|0)<<16)|0,D=(D>>>16|0)+J|0,a=(((l(a,d)+l(b,c)|0)+l(e,q)|0)+(D>>>16|0)|0)+(((65535&D)+m|0)>>>16|0)|0,a=h>>>31|0|a<<1}else{do{if(T(this)>=M()){c=0;d=V(this);for(e=W(this);c<(M()-I()|0);)b=d.a[c]&L()|d.a[1+c|0]&F(),d.a[c]=d.a[c+I()|0]^(b>>>1|0)^e.a[1&b],c=1+c|0;for(;c<(-1+M()|0);)b=d.a[c]&L()|d.a[1+c|0]&F(),d.a[c]=d.a[c+(I()-
M()|0)|0]^(b>>>1|0)^e.a[1&b],c=1+c|0;b=d.a[-1+M()|0]&L()|d.a[0]&F();d.a[-1+M()|0]=d.a[-1+I()|0]^(b>>>1|0)^e.a[1&b];X(this,0)}b=V(this).a[X(this,1+T(this)|0),-1+T(this)|0];b^=b>>>11|0;b^=b<<7&K();b^=b<<15&N();b^=b>>>18|0;b=b>>>1|0;c=b%a|0}while(0>((b-c|0)+(-1+a|0)|0));a=c}return a;default:throw"No matching overload";}};
S.prototype.nextGaussian=function(){var a;if(Ff(this))Gf(this,!1),a=Ef(this);else{var b,c;do{var d;if(T(this)>=M()){a=0;d=V(this);for(c=W(this);a<(M()-I()|0);)b=d.a[a]&L()|d.a[1+a|0]&F(),d.a[a]=d.a[a+I()|0]^(b>>>1|0)^c.a[1&b],a=1+a|0;for(;a<(-1+M()|0);)b=d.a[a]&L()|d.a[1+a|0]&F(),d.a[a]=d.a[a+(I()-M()|0)|0]^(b>>>1|0)^c.a[1&b],a=1+a|0;b=d.a[-1+M()|0]&L()|d.a[0]&F();d.a[-1+M()|0]=d.a[-1+I()|0]^(b>>>1|0)^c.a[1&b];X(this,0)}b=V(this).a[X(this,1+T(this)|0),-1+T(this)|0];b^=b>>>11|0;b^=b<<7&K();b^=b<<15&
N();b^=b>>>18|0;if(T(this)>=M()){a=0;d=V(this);for(var e=W(this);a<(M()-I()|0);)c=d.a[a]&L()|d.a[1+a|0]&F(),d.a[a]=d.a[a+I()|0]^(c>>>1|0)^e.a[1&c],a=1+a|0;for(;a<(-1+M()|0);)c=d.a[a]&L()|d.a[1+a|0]&F(),d.a[a]=d.a[a+(I()-M()|0)|0]^(c>>>1|0)^e.a[1&c],a=1+a|0;c=d.a[-1+M()|0]&L()|d.a[0]&F();d.a[-1+M()|0]=d.a[-1+I()|0]^(c>>>1|0)^e.a[1&c];X(this,0)}c=V(this).a[X(this,1+T(this)|0),-1+T(this)|0];c^=c>>>11|0;c^=c<<7&K();c^=c<<15&N();c^=c>>>18|0;if(T(this)>=M()){d=0;for(var e=V(this),h=W(this);d<(M()-I()|0);)a=
e.a[d]&L()|e.a[1+d|0]&F(),e.a[d]=e.a[d+I()|0]^(a>>>1|0)^h.a[1&a],d=1+d|0;for(;d<(-1+M()|0);)a=e.a[d]&L()|e.a[1+d|0]&F(),e.a[d]=e.a[d+(I()-M()|0)|0]^(a>>>1|0)^h.a[1&a],d=1+d|0;a=e.a[-1+M()|0]&L()|e.a[0]&F();e.a[-1+M()|0]=e.a[-1+I()|0]^(a>>>1|0)^h.a[1&a];X(this,0)}a=V(this).a[X(this,1+T(this)|0),-1+T(this)|0];a^=a>>>11|0;a^=a<<7&K();a^=a<<15&N();a^=a>>>18|0;if(T(this)>=M()){for(var h=V(this),m=W(this),e=0;e<(M()-I()|0);)d=h.a[e]&L()|h.a[1+e|0]&F(),h.a[e]=h.a[e+I()|0]^(d>>>1|0)^m.a[1&d],e=1+e|0;for(;e<
(-1+M()|0);)d=h.a[e]&L()|h.a[1+e|0]&F(),h.a[e]=h.a[e+(I()-M()|0)|0]^(d>>>1|0)^m.a[1&d],e=1+e|0;d=h.a[-1+M()|0]&L()|h.a[0]&F();h.a[-1+M()|0]=h.a[-1+I()|0]^(d>>>1|0)^m.a[1&d];X(this,0)}d=V(this).a[X(this,1+T(this)|0),-1+T(this)|0];d^=d>>>11|0;d^=d<<7&K();d^=d<<15&N();d^=d>>>18|0;e=b>>>6|0;b=e<<27;e=e>>>5|0|e>>31<<27;h=c>>>5|0;c=h>>31;h=b+h|0;b=(-2147483648^h)<(-2147483648^b)?1+(e+c|0)|0:e+c|0;b=-1+2*(Bd(r(),h,b)/9007199254740992);c=a>>>6|0;a=c<<27;c=c>>>5|0|c>>31<<27;e=d>>>5|0;d=e>>31;e=a+e|0;a=(-2147483648^
e)<(-2147483648^a)?1+(c+d|0)|0:c+d|0;a=-1+2*(Bd(r(),e,a)/9007199254740992);c=b*b+a*a}while(1<=c||0===c);d=bb();e=bb();h=c;c=-2*+(e.B?e.Oa:Za(e)).log(h)/c;d=+(d.B?d.Oa:Za(d)).sqrt(c);Hf(this,a*d);Gf(this,!0);a=b*d}return a};
S.prototype.nextDouble=function(){var a,b;if(T(this)>=M()){b=0;for(var c=V(this),d=W(this);b<(M()-I()|0);)a=c.a[b]&L()|c.a[1+b|0]&F(),c.a[b]=c.a[b+I()|0]^(a>>>1|0)^d.a[1&a],b=1+b|0;for(;b<(-1+M()|0);)a=c.a[b]&L()|c.a[1+b|0]&F(),c.a[b]=c.a[b+(I()-M()|0)|0]^(a>>>1|0)^d.a[1&a],b=1+b|0;a=c.a[-1+M()|0]&L()|c.a[0]&F();c.a[-1+M()|0]=c.a[-1+I()|0]^(a>>>1|0)^d.a[1&a];X(this,0)}a=V(this).a[X(this,1+T(this)|0),-1+T(this)|0];a^=a>>>11|0;a^=a<<7&K();a^=a<<15&N();a^=a>>>18|0;if(T(this)>=M()){for(var c=0,d=V(this),
e=W(this);c<(M()-I()|0);)b=d.a[c]&L()|d.a[1+c|0]&F(),d.a[c]=d.a[c+I()|0]^(b>>>1|0)^e.a[1&b],c=1+c|0;for(;c<(-1+M()|0);)b=d.a[c]&L()|d.a[1+c|0]&F(),d.a[c]=d.a[c+(I()-M()|0)|0]^(b>>>1|0)^e.a[1&b],c=1+c|0;b=d.a[-1+M()|0]&L()|d.a[0]&F();d.a[-1+M()|0]=d.a[-1+I()|0]^(b>>>1|0)^e.a[1&b];X(this,0)}b=V(this).a[X(this,1+T(this)|0),-1+T(this)|0];b^=b>>>11|0;b^=b<<7&K();b^=b<<15&N();c=a>>>6|0;a=c<<27;c=c>>>5|0|c>>31<<27;d=(b^(b>>>18|0))>>>5|0;b=d>>31;d=a+d|0;a=(-2147483648^d)<(-2147483648^a)?1+(c+b|0)|0:c+b|0;
return Bd(r(),d,a)/9007199254740992};
S.prototype.nextLong=function(a){var b=+a;a=r();b=Ad(a,b);a=(new z).K(b,a.m);b=a.J;if(0===b?0===a.E:0>b)throw(new Q).e("n must be positive");for(var c,d,e;;){if(T(this)>=M()){e=0;c=V(this);for(d=W(this);e<(M()-I()|0);)b=c.a[e]&L()|c.a[1+e|0]&F(),c.a[e]=c.a[e+I()|0]^(b>>>1|0)^d.a[1&b],e=1+e|0;for(;e<(-1+M()|0);)b=c.a[e]&L()|c.a[1+e|0]&F(),c.a[e]=c.a[e+(I()-M()|0)|0]^(b>>>1|0)^d.a[1&b],e=1+e|0;b=c.a[-1+M()|0]&L()|c.a[0]&F();c.a[-1+M()|0]=c.a[-1+I()|0]^(b>>>1|0)^d.a[1&b];X(this,0)}b=V(this).a[X(this,
1+T(this)|0),-1+T(this)|0];b^=b>>>11|0;b^=b<<7&K();b^=b<<15&N();b^=b>>>18|0;if(T(this)>=M()){c=0;d=V(this);for(var h=W(this);c<(M()-I()|0);)e=d.a[c]&L()|d.a[1+c|0]&F(),d.a[c]=d.a[c+I()|0]^(e>>>1|0)^h.a[1&e],c=1+c|0;for(;c<(-1+M()|0);)e=d.a[c]&L()|d.a[1+c|0]&F(),d.a[c]=d.a[c+(I()-M()|0)|0]^(e>>>1|0)^h.a[1&e],c=1+c|0;e=d.a[-1+M()|0]&L()|d.a[0]&F();d.a[-1+M()|0]=d.a[-1+I()|0]^(e>>>1|0)^h.a[1&e];X(this,0)}e=V(this).a[X(this,1+T(this)|0),-1+T(this)|0];e^=e>>>11|0;e^=e<<7&K();e^=e<<15&N();e^=e>>>18|0;c=
b+(e>>31)|0;b=c>>>1|0;c=e>>>1|0|c<<31;d=b;e=c;h=d;b=r();e=lf(b,e,h,a.E,a.J);h=b.m;b=e;e=h;var h=c,m=e;c=h-b|0;d=(-2147483648^c)>(-2147483648^h)?-1+(d-m|0)|0:d-m|0;m=a.J;h=-1+a.E|0;m=-1!==h?m:-1+m|0;if(!(0>((-2147483648^(c+h|0))<(-2147483648^c)?1+(d+m|0)|0:d+m|0)))break}b=(new z).K(b,e);a=b.E;b=b.J;return Bd(r(),a,b)};S.prototype.setSeed=function(a){a|=0;Id(this,(new z).K(a,a>>31))};
S.prototype.load=function(a){p();if(null===a)throw(new C).b();var b;b=Ke().Db.exec("\\s");if(null!==b){b=b[1];if(void 0===b)throw(new B).e("undefined.get");b=(new x).y(If(new Jf,Ie(b),0))}else b=w();if(b.N()){var c=Ke().Cb.exec("\\s");if(null!==c){b=c[0];if(void 0===b)throw(new B).e("undefined.get");b="\\s".substring(b.length|0);var d=c[1];if(void 0===d)var e=0;else{var d=(new P).e(d),e=d.r.length|0,h=0,m=0;a:for(;;){if(h!==e){var q=1+h|0,h=d.da(h),h=null===h?0:h.ua,m=m|0|Je(Ke(),h),h=q;continue a}break}e=
m|0}c=c[2];if(void 0===c)c=e;else{c=(new P).e(c);d=c.r.length|0;q=0;h=e;a:for(;;){if(q!==d){e=1+q|0;q=c.da(q);q=null===q?0:q.ua;h=(h|0)&~Je(Ke(),q);q=e;continue a}break}c=h|0}b=(new x).y(If(new Jf,b,c))}else b=w()}b=b.N()?If(new Jf,"\\s",0):b.O();if(null===b)throw(new Kf).y(b);c=b.za|0;b=new k.RegExp(b.ya,"g"+(0!==(2&c)?"i":"")+(0!==(8&c)?"m":""));c=new Fe;c.V=b;c.sb="\\s";a=ja(a);if(""===a)for(c=xe(new O,[""]),a=c.T.length|0,a=ha(Na(la),[a]),b=0,c=Lf(c,c.T.length|0);c.M();)d=c.F(),a.a[b]=d,b=1+b|
0;else{d=a.length|0;b=new Jd;b.Qb=c;b.Ab=a;b.Sb=0;b.Rb=d;c=b.Qb;d=new k.RegExp(c.V);c=d!==c.V?d:new k.RegExp(c.V.source,(c.V.global?"g":"")+(c.V.ignoreCase?"i":"")+(c.V.multiline?"m":""));b.bb=c;b.Bb=ja(Ca(b.Ab,b.Sb,b.Rb));b.W=null;b.Ta=!0;w();c=[];for(d=e=0;2147483646>d&&Kd(b);)0!==Nd(b)&&(q=Ld(b).index|0,e=a.substring(e,q),c.push(null===e?null:e),d=1+d|0),e=Nd(b);a=a.substring(e);c.push(null===a?null:a);c=new (Na(la).Ua)(c);for(b=c.a.length;0!==b&&""===c.a[-1+b|0];)b=-1+b|0;if(b===c.a.length)a=
c;else if(a=ha(Na(la),[b]),c=c.a,d=a.a,c!==d||0>(0+b|0))for(e=0;e<b;e=e+1|0)d[0+e|0]=c[0+e|0];else for(e=b-1|0;0<=e;e=e-1|0)d[0+e|0]=c[0+e|0]}b=a.a[0];if(b!==fe())throw qd(ud(),(new rf).e('identifier mismatch: expected "'+fe()+'", got "'+b+'"'));b=W(this);c=(new P).e(a.a[1]);Ae();b.a[0]=ye(c.r);b=W(this);c=(new P).e(a.a[2]);Ae();b.a[1]=ye(c.r);b=(new P).e(a.a[3]);Ae();X(this,ye(b.r));b=(new P).e(a.a[4]);me||(me=(new ke).b());b=b.r;c=me;if((c.B?c.Va:le(c)).test(b))b=+k.parseFloat(b);else throw(new te).e(ue(ve(new we,
xe(new O,['For input string: "','"'])),xe(new O,[b])));Hf(this,b);b=a.a[5];if("true"===b)Gf(this,!0);else if("false"===b)Gf(this,!1);else throw qd(ud(),(new rf).e('expected true or false, got "'+b+'"'));for(b=0;b<M();)c=V(this),d=b,e=(new P).e(a.a[6+b|0]),Ae(),c.a[d]=ye(e.r),b=1+b|0;Oe||(Oe=(new Ne).b());if(!(a.a.length<=(6+b|0)))throw(new qf).y("assertion failed");};
S.prototype.save=function(){for(var a=Ef(this)===Da(Ef(this))?Ef(this)+".0":Ef(this),a=(new y).e(fe()+" "+W(this).a[0]+" "+W(this).a[1]+" "+T(this)+" "+a+" "+Ff(this)),b=0;b<M();){ed(a," ");var c=V(this).a[b];ed(a,""+c);b=1+b|0}return a.H.h};S.prototype.clone=function(){var a=(new S).Fa(this.ic),b=V(this).tb();a.xa=b;a.g|=1;X(a,T(this));b=W(this).tb();a.wa=b;a.g|=4;Hf(a,Ef(this));Gf(a,Ff(this));return a};
S.prototype.$classData=u({pc:0},"org.nlogo.tortoise.engine.MersenneTwisterFast",{pc:1,cf:1,c:1,d:1,Ub:1,Za:1});function mf(){this.l=null}mf.prototype=new R;mf.prototype.constructor=mf;mf.prototype.e=function(a){A.prototype.p.call(this,a);return this};mf.prototype.$classData=u({yc:0},"java.lang.ArithmeticException",{yc:1,u:1,A:1,q:1,c:1,d:1});function Q(){this.l=null}Q.prototype=new R;Q.prototype.constructor=Q;function Mf(){}Mf.prototype=Q.prototype;
Q.prototype.b=function(){A.prototype.p.call(this,null);return this};Q.prototype.e=function(a){A.prototype.p.call(this,a);return this};Q.prototype.$classData=u({$a:0},"java.lang.IllegalArgumentException",{$a:1,u:1,A:1,q:1,c:1,d:1});function Md(){this.l=null}Md.prototype=new R;Md.prototype.constructor=Md;Md.prototype.e=function(a){A.prototype.p.call(this,a);return this};Md.prototype.$classData=u({Jc:0},"java.lang.IllegalStateException",{Jc:1,u:1,A:1,q:1,c:1,d:1});function Y(){this.l=null}
Y.prototype=new R;Y.prototype.constructor=Y;Y.prototype.e=function(a){A.prototype.p.call(this,a);return this};Y.prototype.$classData=u({Kc:0},"java.lang.IndexOutOfBoundsException",{Kc:1,u:1,A:1,q:1,c:1,d:1});function Nf(){}Nf.prototype=new pf;Nf.prototype.constructor=Nf;Nf.prototype.b=function(){return this};Nf.prototype.$classData=u({Oc:0},"java.lang.JSConsoleBasedPrintStream$DummyOutputStream",{Oc:1,oc:1,c:1,mc:1,Ac:1,nc:1});function tf(){this.l=null}tf.prototype=new R;
tf.prototype.constructor=tf;tf.prototype.b=function(){A.prototype.p.call(this,null);return this};tf.prototype.$classData=u({Qc:0},"java.lang.NegativeArraySizeException",{Qc:1,u:1,A:1,q:1,c:1,d:1});function C(){this.l=null}C.prototype=new R;C.prototype.constructor=C;C.prototype.b=function(){A.prototype.p.call(this,null);return this};C.prototype.$classData=u({Rc:0},"java.lang.NullPointerException",{Rc:1,u:1,A:1,q:1,c:1,d:1});function B(){this.l=null}B.prototype=new R;B.prototype.constructor=B;
B.prototype.e=function(a){A.prototype.p.call(this,a);return this};B.prototype.$classData=u({Wc:0},"java.util.NoSuchElementException",{Wc:1,u:1,A:1,q:1,c:1,d:1});function Kf(){this.sa=this.Hb=this.l=null;this.Sa=!1}Kf.prototype=new R;Kf.prototype.constructor=Kf;
Kf.prototype.Ya=function(){if(!this.Sa&&!this.Sa){var a;if(null===this.sa)a="null";else try{a=ja(this.sa)+" ("+("of class "+Xa(ka(this.sa)))+")"}catch(b){if(null!==rd(ud(),b))a="an instance of class "+Xa(ka(this.sa));else throw b;}this.Hb=a;this.Sa=!0}return this.Hb};Kf.prototype.y=function(a){this.sa=a;A.prototype.p.call(this,null);return this};Kf.prototype.$classData=u({ad:0},"scala.MatchError",{ad:1,u:1,A:1,q:1,c:1,d:1});function Of(){}Of.prototype=new v;Of.prototype.constructor=Of;
function Pf(){}Pf.prototype=Of.prototype;function Ve(){}Ve.prototype=new xf;Ve.prototype.constructor=Ve;Ve.prototype.b=function(){return this};Ve.prototype.L=function(a){return a};Ve.prototype.$classData=u({gd:0},"scala.Predef$$anon$1",{gd:1,jf:1,c:1,ca:1,f:1,d:1});function We(){}We.prototype=new vf;We.prototype.constructor=We;We.prototype.b=function(){return this};We.prototype.L=function(a){return a};We.prototype.$classData=u({hd:0},"scala.Predef$$anon$2",{hd:1,hf:1,c:1,ca:1,f:1,d:1});
function we(){this.ta=null}we.prototype=new v;we.prototype.constructor=we;f=we.prototype;f.R=function(){return"StringContext"};f.P=function(){return 1};f.Q=function(a){switch(a){case 0:return this.ta;default:throw(new Y).e(""+a);}};f.i=function(){return xd(this)};
function ue(a,b){var c=function(){return function(a){Ye||(Ye=(new Xe).b());a:{var b=a.length|0,c;p();var d=nd();c=a.indexOf(d)|0;switch(c){case -1:break a;default:d=(new sf).b();b:{var e=c;c=0;for(;;)if(0<=e){if(e>c){var t=d;c=Ca(null===a?"null":a,c,e);t.h=""+t.h+c}c=1+e|0;if(c>=b)throw Qf(a,e);t=65535&(a.charCodeAt(c)|0);switch(t){case 98:t=8;break;case 116:t=9;break;case 110:t=10;break;case 102:t=12;break;case 114:t=13;break;case 34:t=34;break;case 39:t=39;break;case 92:t=92;break;default:if(48<=
t&&55>=t)e=65535&(a.charCodeAt(c)|0),t=-48+e|0,c=1+c|0,c<b&&48<=(65535&(a.charCodeAt(c)|0))&&55>=(65535&(a.charCodeAt(c)|0))&&(t=-48+((t<<3)+(65535&(a.charCodeAt(c)|0))|0)|0,c=1+c|0,c<b&&51>=e&&48<=(65535&(a.charCodeAt(c)|0))&&55>=(65535&(a.charCodeAt(c)|0))&&(t=-48+((t<<3)+(65535&(a.charCodeAt(c)|0))|0)|0,c=1+c|0)),c=-1+c|0,t&=65535;else throw Qf(a,e);}c=1+c|0;e=d;t=k.String.fromCharCode(t);e.h=""+e.h+t;e=c;p();var t=a,U=nd(),t=t.indexOf(U,c)|0;c=e;e=t}else{c<b&&(e=d,a=Ca(null===a?"null":a,c,b),
e.h=""+e.h+a);a=d.h;break b}}}}return a}}(a);if(a.ta.D()!==(1+b.D()|0))throw(new Q).e("wrong number of arguments ("+b.D()+") for interpolated string with "+a.ta.D()+" parts");a=a.ta.ra();b=b.ra();for(var d=a.F(),d=(new sf).e(c(d));b.M();){var e=b.F();d.h=""+d.h+e;e=a.F();e=c(e);d.h=""+d.h+e}return d.h}function ve(a,b){a.ta=b;return a}f.o=function(){return Sc(this)};f.X=function(){return Rf(this)};f.$classData=u({kd:0},"scala.StringContext",{kd:1,c:1,ha:1,k:1,f:1,d:1});function Nc(){this.l=null}
Nc.prototype=new Fd;Nc.prototype.constructor=Nc;Nc.prototype.b=function(){A.prototype.p.call(this,null);return this};Nc.prototype.Ea=function(){$e||($e=(new Ze).b());return $e.rb?A.prototype.Ea.call(this):this};Nc.prototype.$classData=u({Sd:0},"scala.util.control.BreakControl",{Sd:1,q:1,c:1,d:1,of:1,pf:1});function qb(){}qb.prototype=new Ud;qb.prototype.constructor=qb;qb.prototype.b=function(){E.prototype.b.call(this);return this};
qb.prototype.$classData=u({be:0},"scala.collection.Iterable$",{be:1,ia:1,aa:1,c:1,ja:1,ba:1});var pb=void 0;function ad(){}ad.prototype=new zf;ad.prototype.constructor=ad;ad.prototype.b=function(){return this};ad.prototype.F=function(){throw(new B).e("next on empty iterator");};ad.prototype.M=function(){return!1};ad.prototype.$classData=u({de:0},"scala.collection.Iterator$$anon$2",{de:1,cb:1,c:1,hb:1,Z:1,Y:1});function Sf(){this.Ye=null}Sf.prototype=new zf;Sf.prototype.constructor=Sf;
Sf.prototype.F=function(){if(this.M())throw(new B).e("head of empty list");return ub().Wa.F()};Sf.prototype.M=function(){return!1};Sf.prototype.$classData=u({ee:0},"scala.collection.LinearSeqLike$$anon$1",{ee:1,cb:1,c:1,hb:1,Z:1,Y:1});function ob(){}ob.prototype=new Ud;ob.prototype.constructor=ob;ob.prototype.b=function(){E.prototype.b.call(this);nb=this;(new Mc).b();return this};ob.prototype.$classData=u({ge:0},"scala.collection.Traversable$",{ge:1,ia:1,aa:1,c:1,ja:1,ba:1});var nb=void 0;
function Tf(){}Tf.prototype=new Bf;Tf.prototype.constructor=Tf;function Uf(){}Uf.prototype=Tf.prototype;function Vf(){this.ub=this.oa=0;this.lc=null}Vf.prototype=new zf;Vf.prototype.constructor=Vf;Vf.prototype.F=function(){var a=this.lc.Q(this.oa);this.oa=1+this.oa|0;return a};function Rf(a){var b=new Vf;b.lc=a;b.oa=0;b.ub=a.P();return b}Vf.prototype.M=function(){return this.oa<this.ub};Vf.prototype.$classData=u({We:0},"scala.runtime.ScalaRunTime$$anon$1",{We:1,cb:1,c:1,hb:1,Z:1,Y:1});
function Jf(){this.za=this.ya=null}Jf.prototype=new v;Jf.prototype.constructor=Jf;f=Jf.prototype;f.R=function(){return"Tuple2"};f.P=function(){return 2};function If(a,b,c){a.ya=b;a.za=c;return a}f.Q=function(a){a:switch(a){case 0:a=this.ya;break a;case 1:a=this.za;break a;default:throw(new Y).e(""+a);}return a};f.i=function(){return"("+this.ya+","+this.za+")"};f.o=function(){return Sc(this)};f.X=function(){return Rf(this)};f.$classData=u({tc:0},"scala.Tuple2",{tc:1,c:1,kf:1,ha:1,k:1,f:1,d:1});
function te(){this.l=null}te.prototype=new Mf;te.prototype.constructor=te;te.prototype.e=function(a){A.prototype.p.call(this,a);return this};te.prototype.$classData=u({Sc:0},"java.lang.NumberFormatException",{Sc:1,$a:1,u:1,A:1,q:1,c:1,d:1});function Wf(){}Wf.prototype=new Pf;Wf.prototype.constructor=Wf;f=Wf.prototype;f.b=function(){return this};f.R=function(){return"None"};f.P=function(){return 0};f.N=function(){return!0};f.O=function(){throw(new B).e("None.get");};
f.Q=function(a){throw(new Y).e(""+a);};f.i=function(){return"None"};f.o=function(){return 2433880};f.X=function(){return Rf(this)};f.$classData=u({cd:0},"scala.None$",{cd:1,dd:1,c:1,ha:1,k:1,f:1,d:1});var Xf=void 0;function w(){Xf||(Xf=(new Wf).b());return Xf}function x(){this.pb=null}x.prototype=new Pf;x.prototype.constructor=x;f=x.prototype;f.R=function(){return"Some"};f.P=function(){return 1};f.N=function(){return!1};
f.Q=function(a){switch(a){case 0:return this.pb;default:throw(new Y).e(""+a);}};f.O=function(){return this.pb};f.i=function(){return xd(this)};f.y=function(a){this.pb=a;return this};f.o=function(){return Sc(this)};f.X=function(){return Rf(this)};f.$classData=u({jd:0},"scala.Some",{jd:1,dd:1,c:1,ha:1,k:1,f:1,d:1});function Yf(){this.l=null}Yf.prototype=new Mf;Yf.prototype.constructor=Yf;
function Qf(a,b){var c=new Yf,d=ve(new we,xe(new O,["invalid escape "," index ",' in "','". Use \\\\\\\\ for literal \\\\.']));Oe||(Oe=(new Ne).b());if(!(0<=b&&b<(a.length|0)))throw(new Q).e("requirement failed");if(b===(-1+(a.length|0)|0))var e="at terminal";else var e=ve(new we,xe(new O,["'\\\\","' not one of "," at"])),h=65535&(a.charCodeAt(1+b|0)|0),e=ue(e,xe(new O,[he(h),"[\\b, \\t, \\n, \\f, \\r, \\\\, \\\", \\']"]));a=ue(d,xe(new O,[e,b,a]));A.prototype.p.call(c,a);return c}
Yf.prototype.$classData=u({md:0},"scala.StringContext$InvalidEscapeException",{md:1,$a:1,u:1,A:1,q:1,c:1,d:1});
function Zf(a){a=Xa(ka(a.Tb()));for(var b=-1+(a.length|0)|0;;)if(-1!==b&&36===(65535&(a.charCodeAt(b)|0)))b=-1+b|0;else break;if(-1===b||46===(65535&(a.charCodeAt(b)|0)))return"";for(var c="";;){for(var d=1+b|0;;)if(-1!==b&&57>=(65535&(a.charCodeAt(b)|0))&&48<=(65535&(a.charCodeAt(b)|0)))b=-1+b|0;else break;for(var e=b;;)if(-1!==b&&36!==(65535&(a.charCodeAt(b)|0))&&46!==(65535&(a.charCodeAt(b)|0)))b=-1+b|0;else break;var h=1+b|0;if(b===e&&d!==(a.length|0))return c;for(;;)if(-1!==b&&36===(65535&(a.charCodeAt(b)|
0)))b=-1+b|0;else break;var e=-1===b?!0:46===(65535&(a.charCodeAt(b)|0)),m;(m=e)||(m=65535&(a.charCodeAt(h)|0),m=!(90<m&&127>m||65>m));if(m){d=a.substring(h,d);h=c;if(null===h)throw(new C).b();c=""===h?d:""+d+he(46)+c;if(e)return c}}}function $f(){}$f.prototype=new cf;$f.prototype.constructor=$f;function bg(){}bg.prototype=$f.prototype;function Se(){}Se.prototype=new Uf;Se.prototype.constructor=Se;Se.prototype.b=function(){return this};
Se.prototype.$classData=u({te:0},"scala.collection.immutable.Set$",{te:1,zf:1,Bf:1,xf:1,aa:1,c:1,ba:1});var Re=void 0;function cg(){}cg.prototype=new Df;cg.prototype.constructor=cg;function dg(){}dg.prototype=cg.prototype;cg.prototype.vc=function(){Cf.prototype.uc.call(this);return this};function sb(){}sb.prototype=new bg;sb.prototype.constructor=sb;sb.prototype.b=function(){E.prototype.b.call(this);return this};
sb.prototype.$classData=u({fe:0},"scala.collection.Seq$",{fe:1,Ma:1,La:1,ia:1,aa:1,c:1,ja:1,ba:1});var rb=void 0;function eg(){}eg.prototype=new bg;eg.prototype.constructor=eg;function fg(){}fg.prototype=eg.prototype;function gg(){}gg.prototype=new dg;gg.prototype.constructor=gg;function eb(){var a=new gg;(new Nf).b();cg.prototype.vc.call(a)}gg.prototype.$classData=u({Nc:0},"java.lang.JSConsoleBasedPrintStream",{Nc:1,$e:1,Ze:1,oc:1,c:1,mc:1,Ac:1,nc:1,xc:1});function H(){this.Gb=this.l=null}
H.prototype=new R;H.prototype.constructor=H;f=H.prototype;f.R=function(){return"UninitializedFieldError"};f.P=function(){return 1};f.Q=function(a){switch(a){case 0:return this.Gb;default:throw(new Y).e(""+a);}};f.e=function(a){this.Gb=a;A.prototype.p.call(this,a);return this};f.o=function(){return Sc(this)};f.X=function(){return Rf(this)};f.$classData=u({nd:0},"scala.UninitializedFieldError",{nd:1,u:1,A:1,q:1,c:1,d:1,ha:1,k:1,f:1});function hg(){this.n=null}hg.prototype=new v;
hg.prototype.constructor=hg;function Z(){}Z.prototype=hg.prototype;hg.prototype.i=function(){return this.n};hg.prototype.o=function(){return Ba(this)};function ig(){}ig.prototype=new v;ig.prototype.constructor=ig;function jg(){}jg.prototype=ig.prototype;function kg(){}kg.prototype=new fg;kg.prototype.constructor=kg;kg.prototype.b=function(){E.prototype.b.call(this);lg=this;(new af).b();return this};
kg.prototype.$classData=u({Zd:0},"scala.collection.IndexedSeq$",{Zd:1,le:1,Ma:1,La:1,ia:1,aa:1,c:1,ja:1,ba:1});var lg=void 0;function tb(){lg||(lg=(new kg).b());return lg}function mg(){this.fa=this.Xa=0;this.va=null}mg.prototype=new zf;mg.prototype.constructor=mg;mg.prototype.F=function(){this.fa>=this.Xa&&ub().Wa.F();var a=this.va.da(this.fa);this.fa=1+this.fa|0;return a};function Lf(a,b){var c=new mg;c.Xa=b;if(null===a)throw qd(ud(),null);c.va=a;c.fa=0;return c}
mg.prototype.M=function(){return this.fa<this.Xa};mg.prototype.$classData=u({ae:0},"scala.collection.IndexedSeqLike$Elements",{ae:1,cb:1,c:1,hb:1,Z:1,Y:1,rf:1,f:1,d:1});function sd(){this.ea=this.l=null}sd.prototype=new R;sd.prototype.constructor=sd;f=sd.prototype;f.R=function(){return"JavaScriptException"};f.P=function(){return 1};f.Ea=function(){this.stackdata=this.ea;return this};f.Q=function(a){switch(a){case 0:return this.ea;default:throw(new Y).e(""+a);}};f.Ya=function(){return ja(this.ea)};
f.y=function(a){this.ea=a;A.prototype.p.call(this,null);return this};f.o=function(){return Sc(this)};f.X=function(){return Rf(this)};f.$classData=u({ob:0},"scala.scalajs.js.JavaScriptException",{ob:1,u:1,A:1,q:1,c:1,d:1,ha:1,k:1,f:1});function uc(){this.n=null}uc.prototype=new Z;uc.prototype.constructor=uc;uc.prototype.b=function(){this.n="Boolean";return this};uc.prototype.$classData=u({Bd:0},"scala.reflect.ManifestFactory$BooleanManifest$",{Bd:1,S:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var tc=void 0;
function gc(){this.n=null}gc.prototype=new Z;gc.prototype.constructor=gc;gc.prototype.b=function(){this.n="Byte";return this};gc.prototype.$classData=u({Cd:0},"scala.reflect.ManifestFactory$ByteManifest$",{Cd:1,S:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var fc=void 0;function kc(){this.n=null}kc.prototype=new Z;kc.prototype.constructor=kc;kc.prototype.b=function(){this.n="Char";return this};
kc.prototype.$classData=u({Dd:0},"scala.reflect.ManifestFactory$CharManifest$",{Dd:1,S:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var jc=void 0;function sc(){this.n=null}sc.prototype=new Z;sc.prototype.constructor=sc;sc.prototype.b=function(){this.n="Double";return this};sc.prototype.$classData=u({Ed:0},"scala.reflect.ManifestFactory$DoubleManifest$",{Ed:1,S:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var rc=void 0;function qc(){this.n=null}qc.prototype=new Z;qc.prototype.constructor=qc;
qc.prototype.b=function(){this.n="Float";return this};qc.prototype.$classData=u({Fd:0},"scala.reflect.ManifestFactory$FloatManifest$",{Fd:1,S:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var pc=void 0;function mc(){this.n=null}mc.prototype=new Z;mc.prototype.constructor=mc;mc.prototype.b=function(){this.n="Int";return this};mc.prototype.$classData=u({Gd:0},"scala.reflect.ManifestFactory$IntManifest$",{Gd:1,S:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var lc=void 0;function oc(){this.n=null}oc.prototype=new Z;
oc.prototype.constructor=oc;oc.prototype.b=function(){this.n="Long";return this};oc.prototype.$classData=u({Hd:0},"scala.reflect.ManifestFactory$LongManifest$",{Hd:1,S:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var nc=void 0;function ng(){this.G=null}ng.prototype=new jg;ng.prototype.constructor=ng;function og(){}og.prototype=ng.prototype;ng.prototype.i=function(){return this.G};ng.prototype.o=function(){return Ba(this)};function ic(){this.n=null}ic.prototype=new Z;ic.prototype.constructor=ic;
ic.prototype.b=function(){this.n="Short";return this};ic.prototype.$classData=u({Ld:0},"scala.reflect.ManifestFactory$ShortManifest$",{Ld:1,S:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var hc=void 0;function wc(){this.n=null}wc.prototype=new Z;wc.prototype.constructor=wc;wc.prototype.b=function(){this.n="Unit";return this};wc.prototype.$classData=u({Md:0},"scala.reflect.ManifestFactory$UnitManifest$",{Md:1,S:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var vc=void 0;function wb(){}wb.prototype=new bg;
wb.prototype.constructor=wb;wb.prototype.b=function(){E.prototype.b.call(this);vb=this;(new $d).b();return this};wb.prototype.$classData=u({oe:0},"scala.collection.immutable.List$",{oe:1,Ma:1,La:1,ia:1,aa:1,c:1,ja:1,ba:1,f:1,d:1});var vb=void 0;function Fb(){}Fb.prototype=new bg;Fb.prototype.constructor=Fb;Fb.prototype.b=function(){E.prototype.b.call(this);return this};Fb.prototype.$classData=u({ue:0},"scala.collection.immutable.Stream$",{ue:1,Ma:1,La:1,ia:1,aa:1,c:1,ja:1,ba:1,f:1,d:1});var Eb=void 0;
function yc(){this.G=null}yc.prototype=new og;yc.prototype.constructor=yc;yc.prototype.b=function(){this.G="Any";w();xb();n(La);return this};yc.prototype.$classData=u({zd:0},"scala.reflect.ManifestFactory$AnyManifest$",{zd:1,Ka:1,Ja:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var xc=void 0;function Dc(){this.G=null}Dc.prototype=new og;Dc.prototype.constructor=Dc;Dc.prototype.b=function(){this.G="AnyVal";w();xb();n(La);return this};
Dc.prototype.$classData=u({Ad:0},"scala.reflect.ManifestFactory$AnyValManifest$",{Ad:1,Ka:1,Ja:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var Cc=void 0;function Fc(){this.G=null}Fc.prototype=new og;Fc.prototype.constructor=Fc;Fc.prototype.b=function(){this.G="Nothing";w();xb();n(nf);return this};Fc.prototype.$classData=u({Id:0},"scala.reflect.ManifestFactory$NothingManifest$",{Id:1,Ka:1,Ja:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var Ec=void 0;function Hc(){this.G=null}Hc.prototype=new og;
Hc.prototype.constructor=Hc;Hc.prototype.b=function(){this.G="Null";w();xb();n(vd);return this};Hc.prototype.$classData=u({Jd:0},"scala.reflect.ManifestFactory$NullManifest$",{Jd:1,Ka:1,Ja:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var Gc=void 0;function Bc(){this.G=null}Bc.prototype=new og;Bc.prototype.constructor=Bc;Bc.prototype.b=function(){this.G="Object";w();xb();n(La);return this};
Bc.prototype.$classData=u({Kd:0},"scala.reflect.ManifestFactory$ObjectManifest$",{Kd:1,Ka:1,Ja:1,c:1,x:1,w:1,v:1,s:1,f:1,d:1,k:1});var Ac=void 0;function Jb(){}Jb.prototype=new fg;Jb.prototype.constructor=Jb;Jb.prototype.b=function(){E.prototype.b.call(this);Ib=this;return this};Jb.prototype.$classData=u({ye:0},"scala.collection.immutable.Vector$",{ye:1,le:1,Ma:1,La:1,ia:1,aa:1,c:1,ja:1,ba:1,f:1,d:1});var Ib=void 0;function pg(){}pg.prototype=new v;pg.prototype.constructor=pg;function qg(){}
qg.prototype=pg.prototype;pg.prototype.Tb=function(){return this};pg.prototype.Na=function(){return Zf(this)};function rg(a,b){for(var c=0,d=a.D();c<d;)b.L(a.da(c)),c=1+c|0}function sg(){}sg.prototype=new qg;sg.prototype.constructor=sg;function tg(){}tg.prototype=sg.prototype;sg.prototype.U=function(a){for(var b=this.ra();b.M();)a.L(b.F())};function P(){this.r=null}P.prototype=new v;P.prototype.constructor=P;f=P.prototype;f.da=function(a){a=65535&(this.r.charCodeAt(a)|0);return he(a)};f.i=function(){return this.r};
f.U=function(a){rg(this,a)};f.D=function(){return this.r.length|0};f.Tb=function(){return this.r};f.e=function(a){this.r=a;return this};f.o=function(){var a=this.r;return ya(p(),a)};f.Na=function(){return Zf(this)};f.$classData=u({xe:0},"scala.collection.immutable.StringOps",{xe:1,c:1,we:1,cc:1,bc:1,jb:1,gb:1,k:1,kb:1,mb:1,lb:1,Z:1,Y:1,fb:1,ib:1,db:1,eb:1,sd:1,C:1});function ug(){}ug.prototype=new tg;ug.prototype.constructor=ug;function vg(){}vg.prototype=ug.prototype;
ug.prototype.i=function(){var a=this.Na()+"(";return bd(this,a,", ")};function wg(){}wg.prototype=new vg;wg.prototype.constructor=wg;function xg(){}xg.prototype=wg.prototype;function yg(){}yg.prototype=new vg;yg.prototype.constructor=yg;function zg(){}f=zg.prototype=yg.prototype;f.L=function(a){throw(new Y).e(""+(a|0));};f.U=function(){};f.ra=function(){var a=new Sf;a.Ye=this;return a};f.D=function(){return 0};f.o=function(){return Rd(this)};f.Na=function(){return"List"};function Bg(){}
Bg.prototype=new zg;Bg.prototype.constructor=Bg;f=Bg.prototype;f.b=function(){return this};f.R=function(){return"Nil"};f.P=function(){return 0};f.Q=function(a){throw(new Y).e(""+a);};f.X=function(){return Rf(this)};f.$classData=u({re:0},"scala.collection.immutable.Nil$",{re:1,ne:1,Xb:1,Wb:1,Yb:1,c:1,fc:1,kb:1,mb:1,lb:1,Z:1,Y:1,fb:1,ib:1,ac:1,hc:1,dc:1,Zb:1,db:1,gb:1,k:1,ec:1,Vb:1,ca:1,$b:1,eb:1,jb:1,Ff:1,Gf:1,Ef:1,Hf:1,ff:1,sf:1,tf:1,ha:1,uf:1,f:1,d:1});var Cg=void 0;
function xb(){Cg||(Cg=(new Bg).b())}function Dg(){}Dg.prototype=new xg;Dg.prototype.constructor=Dg;function Eg(){}Eg.prototype=Dg.prototype;function y(){this.H=null}y.prototype=new xg;y.prototype.constructor=y;f=y.prototype;f.b=function(){y.prototype.zb.call(this,16,"");return this};f.da=function(a){a=65535&(this.H.h.charCodeAt(a)|0);return he(a)};f.L=function(a){a=65535&(this.H.h.charCodeAt(a|0)|0);return he(a)};f.kc=function(a,b){return this.H.h.substring(a,b)};f.i=function(){return this.H.h};
f.U=function(a){rg(this,a)};f.ra=function(){return Lf(this,this.H.D())};function ed(a,b){a=a.H;a.h=""+a.h+b}f.zb=function(a,b){a=(new sf).qa((b.length|0)+a|0);a.h=""+a.h+b;y.prototype.wc.call(this,a);return this};f.D=function(){return this.H.D()};f.wc=function(a){this.H=a;return this};function fd(a,b){var c=a.H;c.h+=""+b;return a}f.e=function(a){y.prototype.zb.call(this,16,a);return this};f.o=function(){return Rd(this)};
f.$classData=u({He:0},"scala.collection.mutable.StringBuilder",{He:1,ze:1,Xb:1,Wb:1,Yb:1,c:1,fc:1,kb:1,mb:1,lb:1,Z:1,Y:1,fb:1,ib:1,ac:1,hc:1,dc:1,Zb:1,db:1,gb:1,k:1,ec:1,Vb:1,ca:1,$b:1,eb:1,jb:1,Fe:1,Ee:1,Je:1,bd:1,Ge:1,Be:1,Ub:1,Za:1,Eb:1,Ce:1,Yd:1,bc:1,De:1,we:1,cc:1,sd:1,C:1,Nf:1,Ae:1,ke:1,he:1,f:1,d:1});function O(){this.T=null}O.prototype=new Eg;O.prototype.constructor=O;f=O.prototype;f.da=function(a){return this.T[a]};f.L=function(a){return this.T[a|0]};f.U=function(a){rg(this,a)};
f.ra=function(){return Lf(this,this.T.length|0)};f.D=function(){return this.T.length|0};f.o=function(){return Rd(this)};function xe(a,b){a.T=b;return a}f.Na=function(){return"WrappedArray"};f.$classData=u({Ke:0},"scala.scalajs.js.WrappedArray",{Ke:1,If:1,ze:1,Xb:1,Wb:1,Yb:1,c:1,fc:1,kb:1,mb:1,lb:1,Z:1,Y:1,fb:1,ib:1,ac:1,hc:1,dc:1,Zb:1,db:1,gb:1,k:1,ec:1,Vb:1,ca:1,$b:1,eb:1,jb:1,Fe:1,Ee:1,Je:1,bd:1,Ge:1,Be:1,Ub:1,Za:1,Kf:1,Lf:1,ke:1,he:1,Cf:1,vf:1,Df:1,Ce:1,Yd:1,bc:1,De:1,Jf:1,Mf:1,cc:1,Ae:1});
aa.MersenneTwisterFast=function(){for(var a=new S,b=arguments.length|0,c=0,d=[];c<b;)d.push(arguments[c]),c=c+1|0;void 0===d[0]?(G(),c=fb(),b=r(),c=1E6*+(0,c.xb)(),c=Ad(b,c),b=(new z).K(c,b.m)):b=Ha(d[0]);S.prototype.Fa.call(a,b);return a};aa.MersenneTwisterFast.prototype=S.prototype;
}).call(this);


  module.exports = {
    MersenneTwisterFast: MersenneTwisterFast
  };

}).call(this);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"shim/random":[function(require,module,exports){
(function() {
  var MersenneTwisterFast;

  MersenneTwisterFast = require('./engine-scala').MersenneTwisterFast;


  /*
  On the JVM, we use Headless' MersenneTwisterFast.
  In the browser, we use a ScalaJS implementation of it.
  We can't the ScalaJS implementation in both environments,
  because MTF relies on bit-shifting, and JVM integers have
  a different number of bits than JS integers, leading to
  different results.
   */

  module.exports = MersenneTwisterFast();

}).call(this);

},{"./engine-scala":"shim/engine-scala"}],"shim/strictmath":[function(require,module,exports){
(function() {
  var Cloner, genEnhancedMath;

  Cloner = require('./cloner');

  genEnhancedMath = function() {
    var obj;
    obj = Cloner(Math);
    obj.toRadians = function(degrees) {
      return degrees * Math.PI / 180;
    };
    obj.toDegrees = function(radians) {
      return radians * 180 / Math.PI;
    };
    obj.PI = function() {
      return Math.PI;
    };
    obj.truncate = function(x) {
      if (x >= 0) {
        return Math.floor(x);
      } else {
        return Math.ceil(x);
      }
    };
    return obj;
  };

  module.exports = typeof StrictMath !== "undefined" && StrictMath !== null ? StrictMath : genEnhancedMath();

}).call(this);

},{"./cloner":"shim/cloner"}],"util/abstractmethoderror":[function(require,module,exports){
(function() {
  module.exports = function(msg) {
    throw new Error("Illegal method call: `" + msg + "` is abstract");
  };

}).call(this);

},{}],"util/comparator":[function(require,module,exports){
(function() {
  module.exports = {
    NOT_EQUALS: {},
    EQUALS: {
      toInt: 0
    },
    GREATER_THAN: {
      toInt: 1
    },
    LESS_THAN: {
      toInt: -1
    },
    numericCompare: function(x, y) {
      if (x < y) {
        return this.LESS_THAN;
      } else if (x > y) {
        return this.GREATER_THAN;
      } else {
        return this.EQUALS;
      }
    },
    stringCompare: function(x, y) {
      var comparison;
      comparison = x.localeCompare(y);
      if (comparison < 0) {
        return this.LESS_THAN;
      } else if (comparison > 0) {
        return this.GREATER_THAN;
      } else {
        return this.EQUALS;
      }
    }
  };

}).call(this);

},{}],"util/exception":[function(require,module,exports){
(function() {
  var AgentException, DeathInterrupt, HaltInterrupt, NetLogoException, StopInterrupt, TopologyInterrupt, ignoring,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  NetLogoException = (function() {
    function NetLogoException(message) {
      this.message = message;
    }

    return NetLogoException;

  })();

  AgentException = (function(superClass) {
    extend(AgentException, superClass);

    function AgentException() {
      return AgentException.__super__.constructor.apply(this, arguments);
    }

    return AgentException;

  })(NetLogoException);

  DeathInterrupt = (function(superClass) {
    extend(DeathInterrupt, superClass);

    function DeathInterrupt() {
      return DeathInterrupt.__super__.constructor.apply(this, arguments);
    }

    return DeathInterrupt;

  })(NetLogoException);

  StopInterrupt = (function(superClass) {
    extend(StopInterrupt, superClass);

    function StopInterrupt() {
      return StopInterrupt.__super__.constructor.apply(this, arguments);
    }

    return StopInterrupt;

  })(NetLogoException);

  TopologyInterrupt = (function(superClass) {
    extend(TopologyInterrupt, superClass);

    function TopologyInterrupt() {
      return TopologyInterrupt.__super__.constructor.apply(this, arguments);
    }

    return TopologyInterrupt;

  })(NetLogoException);

  HaltInterrupt = (function(superClass) {
    extend(HaltInterrupt, superClass);

    function HaltInterrupt() {
      HaltInterrupt.__super__.constructor.call(this, "model halted by user");
    }

    return HaltInterrupt;

  })(NetLogoException);

  ignoring = function(exceptionType) {
    return function(f) {
      var error, ex;
      try {
        return f();
      } catch (error) {
        ex = error;
        if (!(ex instanceof exceptionType)) {
          throw ex;
        }
      }
    };
  };

  module.exports = {
    AgentException: AgentException,
    DeathInterrupt: DeathInterrupt,
    HaltInterrupt: HaltInterrupt,
    ignoring: ignoring,
    NetLogoException: NetLogoException,
    StopInterrupt: StopInterrupt,
    TopologyInterrupt: TopologyInterrupt
  };

}).call(this);

},{}],"util/iterator":[function(require,module,exports){
(function() {
  var Iterator;

  module.exports = Iterator = (function() {
    Iterator.prototype._items = void 0;

    function Iterator(_items) {
      this._items = _items;
    }

    Iterator.prototype.all = function(f) {
      var i, len, ref, x;
      ref = this._items;
      for (i = 0, len = ref.length; i < len; i++) {
        x = ref[i];
        if (!f(x)) {
          return false;
        }
      }
      return true;
    };

    Iterator.prototype.contains = function(x) {
      var i, len, ref, y;
      ref = this._items;
      for (i = 0, len = ref.length; i < len; i++) {
        y = ref[i];
        if (x === y) {
          return true;
        }
      }
      return false;
    };

    Iterator.prototype.exists = function(f) {
      var i, len, ref, x;
      ref = this._items;
      for (i = 0, len = ref.length; i < len; i++) {
        x = ref[i];
        if (f(x)) {
          return true;
        }
      }
      return false;
    };

    Iterator.prototype.filter = function(f) {
      var i, len, ref, results, x;
      ref = this._items;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        x = ref[i];
        if (Iterator.boolOrError(x, f(x))) {
          results.push(x);
        }
      }
      return results;
    };

    Iterator.withBoolCheck = function(f) {
      return function(x) {
        var y;
        y = f(x);
        return Iterator.boolOrError(x, y);
      };
    };

    Iterator.boolOrError = function(x, y) {
      if (y === true || y === false) {
        return y;
      } else {
        throw new Error("WITH expected a true/false value from " + x + ", but got " + y + " instead.");
      }
    };

    Iterator.prototype.nthItem = function(n) {
      return this._items[n];
    };

    Iterator.prototype.map = function(f) {
      return this._items.map(f);
    };

    Iterator.prototype.forEach = function(f) {
      this._items.forEach(f);
    };

    Iterator.prototype.size = function() {
      return this._items.length;
    };

    Iterator.prototype.toArray = function() {
      return this._items;
    };

    return Iterator;

  })();

}).call(this);

},{}],"util/nlmath":[function(require,module,exports){
(function() {
  var Exception, StrictMath,
    slice = [].slice,
    modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

  StrictMath = require('../shim/strictmath');

  Exception = require('./exception');

  module.exports = {
    abs: function(n) {
      return StrictMath.abs(n);
    },
    acos: function(radians) {
      return this.validateNumber(StrictMath.toDegrees(StrictMath.acos(radians)));
    },
    asin: function(radians) {
      return this.validateNumber(StrictMath.toDegrees(StrictMath.asin(radians)));
    },
    atan: function(d1, d2) {
      if (d1 === 0 && d2 === 0) {
        throw new Error("Runtime error: atan is undefined when both inputs are zero.");
      } else if (d1 === 0) {
        if (d2 > 0) {
          return 0;
        } else {
          return 180;
        }
      } else if (d2 === 0) {
        if (d1 > 0) {
          return 90;
        } else {
          return 270;
        }
      } else {
        return (StrictMath.toDegrees(StrictMath.atan2(d1, d2)) + 360) % 360;
      }
    },
    ceil: function(n) {
      return StrictMath.ceil(n);
    },
    cos: function(degrees) {
      return StrictMath.cos(StrictMath.toRadians(degrees));
    },
    distance2_2D: function(x, y) {
      return StrictMath.sqrt(x * x + y * y);
    },
    distance4_2D: function(x1, y1, x2, y2) {
      return this.distance2_2D(x1 - x2, y1 - y2);
    },
    exp: function(n) {
      return StrictMath.exp(n);
    },
    floor: function(n) {
      return StrictMath.floor(n);
    },
    ln: function(n) {
      return StrictMath.log(n);
    },
    log: function(num, base) {
      return StrictMath.log(num) / StrictMath.log(base);
    },
    max: function() {
      var xs;
      xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return Math.max.apply(Math, xs);
    },
    min: function() {
      var xs;
      xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return Math.min.apply(Math, xs);
    },
    mod: function(a, b) {
      return modulo(a, b);
    },
    normalizeHeading: function(heading) {
      if ((0 <= heading && heading < 360)) {
        return heading;
      } else {
        return ((heading % 360) + 360) % 360;
      }
    },
    precision: function(n, places) {
      var multiplier, result;
      multiplier = StrictMath.pow(10, places);
      result = StrictMath.floor(n * multiplier + .5) / multiplier;
      if (places > 0) {
        return result;
      } else {
        return StrictMath.round(result);
      }
    },
    pow: function(base, exponent) {
      return StrictMath.pow(base, exponent);
    },
    round: function(n) {
      return StrictMath.round(n);
    },
    sin: function(degrees) {
      return StrictMath.sin(StrictMath.toRadians(degrees));
    },
    sqrt: function(n) {
      return StrictMath.sqrt(n);
    },
    squash: function(x) {
      if (StrictMath.abs(x) < 3.2e-15) {
        return 0;
      } else {
        return x;
      }
    },
    subtractHeadings: function(h1, h2) {
      var diff;
      diff = (h1 % 360) - (h2 % 360);
      if ((-180 < diff && diff <= 180)) {
        return diff;
      } else if (diff > 0) {
        return diff - 360;
      } else {
        return diff + 360;
      }
    },
    tan: function(degrees) {
      return StrictMath.tan(StrictMath.toRadians(degrees));
    },
    toInt: function(n) {
      return n | 0;
    },
    validateNumber: function(x) {
      if (!isFinite(x)) {
        throw new Error("math operation produced a non-number");
      } else if (isNaN(x)) {
        throw new Error("math operation produced a number too large for NetLogo");
      } else {
        return x;
      }
    }
  };

}).call(this);

},{"../shim/strictmath":"shim/strictmath","./exception":"util/exception"}],"util/notimplemented":[function(require,module,exports){
(function() {
  module.exports = function(name, defaultValue) {
    if (defaultValue == null) {
      defaultValue = {};
    }
    if ((typeof console !== "undefined" && console !== null) && (console.warn != null)) {
      console.warn("The `" + name + "` primitive has not yet been implemented.");
    }
    return function() {
      return defaultValue;
    };
  };

}).call(this);

},{}],"util/rng":[function(require,module,exports){
(function() {
  var AuxRandom, RNG, Random,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Random = require('../shim/random');

  AuxRandom = require('../shim/auxrandom');

  module.exports = RNG = (function() {
    RNG.prototype._currentRNG = void 0;

    RNG.prototype._mainRNG = void 0;

    function RNG() {
      this.nextDouble = bind(this.nextDouble, this);
      this.nextLong = bind(this.nextLong, this);
      this.nextInt = bind(this.nextInt, this);
      this.nextGaussian = bind(this.nextGaussian, this);
      this._mainRNG = Random;
      this._currentRNG = this._mainRNG;
    }

    RNG.prototype.exportState = function() {
      return this._mainRNG.save();
    };

    RNG.prototype.importState = function(state) {
      this._mainRNG.load(state);
    };

    RNG.prototype.nextGaussian = function() {
      return this._currentRNG.nextGaussian();
    };

    RNG.prototype.nextInt = function(limit) {
      return this._currentRNG.nextInt(limit);
    };

    RNG.prototype.nextLong = function(limit) {
      return this._currentRNG.nextLong(limit);
    };

    RNG.prototype.nextDouble = function() {
      return this._currentRNG.nextDouble();
    };

    RNG.prototype.setSeed = function(seed) {
      this._currentRNG.setSeed(seed);
    };

    RNG.prototype.withAux = function(f) {
      return this._withAnother(AuxRandom)(f);
    };

    RNG.prototype.withClone = function(f) {
      return this._withAnother(Random.clone())(f);
    };

    RNG.prototype._withAnother = function(rng) {
      return (function(_this) {
        return function(f) {
          var prevRNG, result;
          prevRNG = _this._currentRNG;
          _this._currentRNG = rng;
          result = (function() {
            try {
              return f();
            } finally {
              this._currentRNG = prevRNG;
            }
          }).call(_this);
          return result;
        };
      })(this);
    };

    return RNG;

  })();

}).call(this);

},{"../shim/auxrandom":"shim/auxrandom","../shim/random":"shim/random"}],"util/shufflerator":[function(require,module,exports){
(function() {
  var Iterator, Shufflerator,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Iterator = require('./iterator');

  module.exports = Shufflerator = (function(superClass) {
    extend(Shufflerator, superClass);

    Shufflerator.prototype._i = void 0;

    Shufflerator.prototype._nextOne = void 0;

    function Shufflerator(items, _itemIsValid, _nextInt) {
      this._itemIsValid = _itemIsValid;
      this._nextInt = _nextInt;
      Shufflerator.__super__.constructor.call(this, items);
      this._i = 0;
      this._nextOne = null;
      this._fetch();
    }

    Shufflerator.prototype.map = function(f) {
      var acc;
      acc = [];
      this.forEach(function(x) {
        return acc.push(f(x));
      });
      return acc;
    };

    Shufflerator.prototype.forEach = function(f) {
      var next;
      while (this._hasNext()) {
        next = this._next();
        if (this._itemIsValid(next)) {
          f(next);
        }
      }
    };

    Shufflerator.prototype.find = function(f, dflt) {
      var next;
      while (this._hasNext()) {
        next = this._next();
        if (this._itemIsValid(next) && (f(next) === true)) {
          return next;
        }
      }
      return dflt;
    };

    Shufflerator.prototype.toArray = function() {
      var acc;
      acc = [];
      this.forEach(function(x) {
        return acc.push(x);
      });
      return acc;
    };

    Shufflerator.prototype._hasNext = function() {
      return this._i <= this._items.length;
    };

    Shufflerator.prototype._next = function() {
      var result;
      result = this._nextOne;
      this._fetch();
      return result;
    };


    /*
      I dislike this.  The fact that the items are prepolled annoys me.  But there are two problems with trying to "fix"
      that. First, fixing it involves changing JVM NetLogo/Headless.  To me, that requires a disproportionate amount of
      effort to do, relative to how likely--that is, not very likely--that this code is to be heavily worked on in the
      future.  The second problem is that it's not apparent to me how to you can make this code substantially cleaner
      without significantly hurting performance.  The very idea of a structure that statefully iterates a collection in
      a random order is difficult to put into clear computational terms.  When it needs to be done _efficiently_, that
      becomes even more of a problem.  As far as I can tell, the only efficient way to do it is like how we're doing it
      (one variable tracking the current index/offset, and an array where consumed items are thrown into the front).
      Whatever.  The whole point is that this code isn't really worth worrying myself over, since it's pretty stable.
      --JAB (7/25/14)
     */

    Shufflerator.prototype._fetch = function() {
      var randNum;
      if (this._hasNext()) {
        if (this._i < this._items.length - 1) {
          randNum = this._i + this._nextInt(this._items.length - this._i);
          this._nextOne = this._items[randNum];
          this._items[randNum] = this._items[this._i];
        } else {
          this._nextOne = this._items[this._i];
        }
        this._i++;
        if (!this._itemIsValid(this._nextOne)) {
          this._fetch();
        }
      } else {
        this._nextOne = null;
      }
    };

    return Shufflerator;

  })(Iterator);

}).call(this);

},{"./iterator":"util/iterator"}],"util/stablesort":[function(require,module,exports){
(function() {
  var rangeUntil, zip;

  zip = require('brazierjs/array').zip;

  rangeUntil = require('brazierjs/number').rangeUntil;

  module.exports = function(arr) {
    return function(f) {
      var pairs, sortFunc;
      sortFunc = function(x, y) {
        var result;
        result = f(x[1], y[1]);
        if (result !== 0) {
          return result;
        } else if (x[0] < y[0]) {
          return -1;
        } else {
          return 1;
        }
      };
      pairs = zip(rangeUntil(0)(arr.length))(arr);
      return pairs.sort(sortFunc).map(function(pair) {
        return pair[1];
      });
    };
  };

}).call(this);

},{"brazierjs/array":"brazier/array","brazierjs/number":"brazier/number"}],"util/timer":[function(require,module,exports){
(function() {
  var Timer;

  module.exports = Timer = (function() {
    Timer.prototype._startTime = void 0;

    function Timer() {
      this.reset();
    }

    Timer.prototype.elapsed = function() {
      return (Date.now() - this._startTime) / 1000;
    };

    Timer.prototype.reset = function() {
      this._startTime = Date.now();
    };

    return Timer;

  })();

}).call(this);

},{}],"util/typechecker":[function(require,module,exports){

/*
This class should be favored over Lodash when you want quick typechecking that need not be thorough.
This was made specifically to compensate for the fact that Lodash's typechecking was swapped
into the sorting code and caused a 25% performance hit in BZ Benchmark. --JAB (4/30/14)
 */

(function() {
  var JSType;

  JSType = (function() {
    function JSType(_x) {
      this._x = _x;
    }

    JSType.prototype.isArray = function() {
      return Array.isArray(this._x);
    };

    JSType.prototype.isBoolean = function() {
      return typeof this._x === "boolean";
    };

    JSType.prototype.isFunction = function() {
      return typeof this._x === "function";
    };

    JSType.prototype.isNumber = function() {
      return typeof this._x === "number";
    };

    JSType.prototype.isObject = function() {
      return typeof this._x === "object";
    };

    JSType.prototype.isString = function() {
      return typeof this._x === "string";
    };

    return JSType;

  })();

  module.exports = function(x) {
    return new JSType(x);
  };

}).call(this);

},{}]},{},["bootstrap"]);
