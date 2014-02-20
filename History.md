
# 0.3.0-dev / 2014-02-20

## Breaking changes

- `be` is now only a property, not an assertion method
- `identical` assertion to determine if both vars refers to the same object, i.e `===` for all types
- `resemble` assertion to determine if both vars are loosely equal, or ==
- `equal` is semantic (i.e. deep equal, but strict equal, or ===, for primitive), see also `identical` and `resemble`

## Changes
- version synchronized
- fix bug infinite loop for cyclic structure, https://github.com/LearnBoost/expect.js/issues/50, 2f085fe
- `contain` assertion supports sub object, 4b45013
- `approximate` assertion, 8594f4b
- `between` alias, c478d4b
- jshint'ed
- implement (shim) Object.defineProperty, so expect Assertion object can now be created lazily, improve performance by 10x
while maintain backward compatibility to IE6+
- restructure everything to `utils` and `expect.core`, custom plugins can easily be implemented through `expect.use`


0.2.0 / 2012-10-19
==================

  * fix isRegExp bug in some edge cases
  * add closure to all assertion messages deferring costly inspects
    until there is actually a failure
  * fix `make test` for recent mochas
  * add inspect() case for DOM elements
  * relax failure msg null check
  * add explicit failure through `expect().fail()`
  * clarified all `empty` functionality in README example
  * added docs for throwException fn/regexp signatures

0.1.2 / 2012-02-04
==================

  * Added regexp matching support for exceptions.
  * Added support for throwException callback.
  * Added `throwError` synonym to `throwException`.
  * Added object support for `.empty`.
  * Fixed `.a('object')` with nulls, and english error in error message.
  * Fix bug `indexOf` (IE). [hokaccha]
  * Fixed object property checking with `undefined` as value. [vovik]

0.1.1 / 2011-12-18
==================

  * Fixed typo

0.1.0 / 2011-12-18
==================

  * Initial import
