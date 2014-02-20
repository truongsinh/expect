/* global expect, describe, it */
'use strict';
/**
 * Module dependencies.
 */

function err (fn, msg) {
  try {
    fn();
    throw new Error('Expected an error');
  } catch (err) {
    expect(msg).to.equal(err.message);
  }
}

/**
 * Feature detection for `name` support.
 */

var nameSupported;

(function a () {
  nameSupported = 'a' === a.name;
})();

/**
 * Tests.
 */

describe('expect', function () {

  it('should have .version', function () {
    expect(expect.version).to.match(/^\d+\.\d+\.\d+(-[a-zA-Z0-9\-\.]+)*$/);
  });

  it('should work in its basic form', function () {
    expect('test').to.be.a('string');
  });

  it('should test true', function () {
    expect(true).to.equal(true);
    expect(false).not.to.equal(true);
    expect(1).not.to.equal(true);

    err(function () {
      expect('test').to.equal(true);
    }, "expected 'test' to equal true");
  });

  it('should allow not.to', function () {
    expect(true).not.to.equal(false);

    err(function () {
      expect(false).not.to.equal(false);
    }, "expected false not to equal false");
  });

  it('should test ok', function () {
    expect(true).to.be.ok();
    expect(false).not.to.be.ok();
    expect(1).to.be.ok();
    expect(0).not.to.be.ok();

    err(function () {
      expect('').to.be.ok();
    }, "expected '' to be truthy");

    err(function () {
      expect('test').not.to.be.ok();
    }, "expected 'test' not to be truthy");

    expect().not.to.be.ok().and.to.equal(undefined);
  });

  it('should test false', function () {
    expect(false).to.equal(false);
    expect(true).not.to.equal(false);
    expect(0).not.to.equal(false);

    err(function () {
      expect('').to.equal(false);
    }, "expected '' to equal false");
  });

  it('should test functions with arguments', function () {
    function itThrowsSometimes (first, second) {
      /* jshint bitwise:false*/
      if (first ^ second) {
        throw new Error('tell');
      }
      /* jshint bitwise:true*/
    }

    expect(itThrowsSometimes).withArgs(false, false).not.to.throwException();
    expect(itThrowsSometimes).withArgs(false, true).to.throwException(/tell/);
    expect(itThrowsSometimes).withArgs(true, false).to.throwException(/tell/);
    expect(itThrowsSometimes).withArgs(true, true).not.to.throwException();
  });

  it('should test for exceptions', function () {
    /* global a */
    function itThrows () {
      a.b.c();
    }

    function itThrowsString () {
      throw 'aaa';
    }

    function itThrowsMessage () {
      throw new Error('tobi');
    }

    var anonItThrows = function () {
      a.b.c();
    };

    function itWorks () {
      return;
    }

    var anonItWorks = function () { };

    expect(itThrows).to.throwException();
    expect(itWorks).not.to.throwException();

    var subject;

    expect(itThrows).to.throwException(function (e) {
      subject = e;
    });

    expect(subject).to.be.an(Error);

    expect(itThrowsMessage).to.throwException(/tobi/);
    expect(itThrowsMessage).not.to.throwException(/test/);

    err(function () {
      expect(itThrowsMessage).to.throwException(/no match/);
    }, 'expected \'tobi\' to match /no match/');

    var subject2;

    expect(itThrowsString).to.throwException(function (str) {
      subject2 = str;
    });

    expect(subject2).to.equal('aaa');

    expect(itThrowsString).to.throwException(/aaa/);
    expect(itThrowsString).not.to.throwException(/bbb/);

    err(function () {
      expect(itThrowsString).to.throwException(/no match/i);
    }, 'expected \'aaa\' to match /no match/i');

    var called = false;

    expect(itWorks).not.to.throwError(function () {
      called = true;
    });

    expect(called).to.equal(false);

    err(function () {
      expect(5).to.throwException();
    }, 'expected 5 to be a function');

    err(function () {
      expect(anonItThrows).not.to.throwException();
    }, 'expected [Function] not to throw an exception');

    err(function () {
      expect(anonItWorks).to.throwException();
    }, 'expected [Function] to throw an exception');

    if (nameSupported) {
      err(function () {
        expect(itWorks).to.throwException();
      }, 'expected [Function: itWorks] to throw an exception');
    } else {
      err(function () {
        expect(itWorks).to.throwException();
      }, 'expected [Function] to throw an exception');
    }

    if (nameSupported) {
      err(function () {
        expect(itThrows).not.to.throwException();
      }, 'expected [Function: itThrows] not to throw an exception');
    } else {
      err(function () {
        expect(anonItThrows).not.to.throwException();
      }, 'expected [Function] not to throw an exception');
    }
  });

  it('should test arrays', function () {
    expect([]).to.be.a('array');
    expect([]).to.be.an('array');

    err(function () {
      expect({}).to.be.an('array');
    }, 'expected {} to be an array');
  });

  it('should test regex', function () {
    expect(/a/).to.be.an('regexp');
    expect(/a/).to.be.a('regexp');

    err(function () {
      expect(null).to.be.a('regexp');
    }, 'expected null to be a regexp');
  });

  it('should test objects', function () {
    expect({}).to.be.an('object');

    err(function () {
      expect(null).to.be.an('object');
    }, 'expected null to be an object');
  });

  it('should test .equal()', function () {
    var foo;
    expect(foo).to.equal(undefined);
    expect(1).to.equal(1);
    expect(1.4 - 0.1).to.not.equal(1.3); // see approximate
    expect(NaN).not.to.equal(NaN);
    expect(1).not.to.equal(true);
    expect('1').to.not.equal(1);
    expect({a: 3}).to.equal({a: 3}); // see identical
    expect({a: 3}).not.to.equal({a: 4});
    expect({a: 3}).not.to.equal({b: 3});
  });

  it('should test typeof', function () {
    expect('test').to.be.a('string');

    err(function () {
      expect('test').not.to.be.a('string');
    }, "expected 'test' not to be a string");

    expect(5).to.be.a('number');

    err(function () {
      expect(5).not.to.be.a('number');
    }, "expected 5 not to be a number");
  });

  it('should test instanceof', function () {
    function Foo(){}
    expect(new Foo()).to.be.a(Foo);

    if (nameSupported) {
      err(function () {
        expect(3).to.be.a(Foo);
      }, "expected 3 to be an instance of Foo");
    } else {
      err(function () {
        expect(3).to.be.a(Foo);
      }, "expected 3 to be an instance of supplied constructor");
    }
  });

  it('should test within(start, finish)', function () {
    expect(5).to.be.within(3,6);
    expect(5).to.be.within(3,5);
    expect(5).not.to.be.within(1,3);

    err(function () {
      expect(5).not.to.be.within(4,6);
    }, "expected 5 not to be within 4..6");

    err(function () {
      expect(10).to.be.within(50,100);
    }, "expected 10 to be within 50..100");
  });

  it('should test approximately(value, delta)', function() {
    err(function () {
      expect(1.4 - 0.1).to.equal(1.3);
    }, "expected 1.2999999999999998 to equal 1.3");
    expect(1.4 - 0.1).to.be.approximately(1.3, 1e-15);
    expect(1.5).to.approximate(1.4, 0.2);
    expect(1.5).to.approximate(1.5, 10E-10);
    expect(1.5).not.to.approximate(1.4, 1E-2);

    err(function () {
      expect(99.99).not.to.approximate(100, 0.1);
    }, "expected 99.99 not to approximate 100 +- 0.1");

    err(function () {
      expect(99.99).to.approximate(105, 0.1);
    }, "expected 99.99 to approximate 105 +- 0.1");
  });

  it('should test above(n)', function () {
    expect(5).to.be.above(2);
    expect(5).to.be.greaterThan(2);
    expect(5).not.to.be.above(5);
    expect(5).not.to.be.above(6);

    err(function () {
      expect(5).to.be.above(6);
    }, "expected 5 to be above 6");

    err(function () {
      expect(10).not.to.be.above(6);
    }, "expected 10 not to be above 6");
  });

  it('should test match(regexp)', function () {
    expect('foobar').to.match(/^foo/);
    expect('foobar').not.to.match(/^bar/);

    err(function () {
      expect('foobar').to.match(/^bar/i);
    }, "expected 'foobar' to match /^bar/i");

    err(function () {
      expect('foobar').not.to.match(/^foo/i);
    }, "expected 'foobar' not to match /^foo/i");
  });

  it('should test length(n)', function () {
    expect('test').to.have.length(4);
    expect('test').not.to.have.length(3);
    expect([1,2,3]).to.have.length(3);

    err(function () {
      expect(4).to.have.length(3);
    }, 'expected 4 to have a property \'length\'');

    err(function () {
      expect('asd').not.to.have.length(3);
    }, "expected 'asd' not to have a length of 3");
  });

  it('should test eql(val)', function () {
    expect('test').to.eql('test');
    expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
    expect(1).to.eql(1);
    expect('4').not.to.eql(4);
    expect(/a/gmi).to.eql(/a/mig);
    function returnArguments() { return arguments; }
    expect(returnArguments(0,1,2,3)).to.eql(returnArguments(0,1,2,3));

    err(function () {
      expect(4).to.eql(3);
    }, 'expected 4 to equal 3');
  });
  it('should test resemble(val)', function () {
    var num = 0;
    var obj = String("0");
    var str = "0";
    var b = false;

    expect(num).to.resemble(num);
    expect(obj).to.resemble(obj);
    expect(str).to.resemble(str);
    expect(b).to.resemble(b);
    expect(num).to.resemble(obj);
    expect(num).to.resemble(str);
    expect(num).to.resemble(b);
    expect(obj).to.resemble(str);
    expect(obj).to.resemble(b);
    expect(str).to.resemble(b);

    expect(null).to.resemble(undefined);


    expect(obj).not.to.resemble(null);
    expect(obj).not.to.resemble(undefined);
  });

  it('should test equal(val)', function () {
    expect('test').to.equal('test');
    expect(1).to.equal(1);

    err(function () {
      expect(4).to.equal(3);
    }, 'expected 4 to equal 3');

    err(function () {
      expect('4').to.equal(4);
    }, "expected '4' to equal 4");
  });

  it('should test equal(val)', function () {
    expect('test').to.equal('test');
    expect(1).to.equal(1);

    err(function () {
      expect(4).to.equal(3);
    }, 'expected 4 to equal 3');

    err(function () {
      expect('4').to.equal(4);
    }, "expected '4' to equal 4");
  });

  it('should test eql(val) with cyclic structures', function () {
    var one = {hello: 'world'}, two = {hello: 'world'};
    one.next = one;
    two.next = two;
    expect(one).to.eql(two);

    var three = ['hello'], four = ['hello'];
    three.push(three);
    four.push(four);
    expect(three).to.eql(four);
  });

  it('should test empty', function () {
    expect('').to.be.empty();
    expect({}).to.be.empty();
    expect([]).to.be.empty();
    expect({ length: 0 }).to.be.empty();

    err(function () {
      expect(null).to.be.empty();
    }, 'expected null to be an object');

    err(function () {
      expect({ a: 'b' }).to.be.empty();
    }, 'expected { a: \'b\' } to be empty');

    err(function () {
      expect({ length: '0' }).to.be.empty();
    }, 'expected { length: \'0\' } to be empty');

    err(function () {
      expect('asd').to.be.empty();
    }, "expected 'asd' to be empty");

    err(function () {
      expect('').not.to.be.empty();
    }, "expected '' not to be empty");

    err(function () {
      expect({}).not.to.be.empty();
    }, "expected {} not to be empty");
  });

  it('should test property(name)', function () {
    expect('test').to.have.property('length');
    expect(4).not.to.have.property('length');
    expect({ length: undefined }).to.have.property('length');

    err(function () {
      expect('asd').to.have.property('foo');
    }, "expected 'asd' to have a property 'foo'");
    
    err(function () {
      expect({ length: undefined }).not.to.have.property('length');
    }, "expected { length: undefined } not to have a property 'length'");
  });

  it('should test property(name, val)', function () {
    expect('test').to.have.property('length', 4);
    expect({ length: undefined }).to.have.property('length', undefined);

    err(function () {
      expect('asd').to.have.property('length', 4);
    }, "expected 'asd' to have a property 'length' of 4");

    err(function () {
      expect('asd').not.to.have.property('length', 3);
    }, "expected 'asd' not to have a property 'length' of 3");

    err(function () {
      expect('asd').not.to.have.property('foo', 3);
    }, "'asd' has no property 'foo'");
    
    err(function () {
      expect({ length: undefined }).not.to.have.property('length', undefined);
    }, "expected { length: undefined } not to have a property 'length'");
  });

  it('should test own.property(name)', function () {
    expect('test').to.have.own.property('length');
    expect({ length: 12 }).to.have.own.property('length');

    err(function () {
      expect({ length: 12 }).not.to.have.own.property('length');
    }, "expected { length: 12 } not to have own property 'length'");
  });

  it('should test string()', function () {
    expect('foobar').to.contain('bar');
    expect('foobar').to.contain('foo');
    expect('foobar').to.include.string('foo');
    expect('foobar').not.to.contain('baz');
    expect('foobar').not.to.include.string('baz');

    err(function () {
      expect(3).to.contain('baz');
    }, "expected 3 to contain 'baz'");

    err(function () {
      expect('foobar').to.contain('baz');
    }, "expected 'foobar' to contain 'baz'");

    err(function () {
      expect('foobar').not.to.contain('bar');
    }, "expected 'foobar' not to contain 'bar'");
  });

  it('should test contain()', function () {
    expect(['foo', 'bar']).to.contain('foo');
    expect(['foo', 'bar']).to.contain('foo');
    expect(['foo', 'bar']).to.contain('bar');
    expect([1,2]).to.contain(1);
    expect(['foo', 'bar']).not.to.contain('baz');
    expect(['foo', 'bar']).not.to.contain(1);

    err(function () {
      expect(['foo']).to.contain('bar');
    }, "expected [ 'foo' ] to contain 'bar'");

    err(function () {
      expect(['bar', 'foo']).not.to.contain('foo');
    }, "expected [ 'bar', 'foo' ] not to contain 'foo'");
  });

  it('should test existance of subobject', function () {
    expect({ foo: 'bar' }).to.contain({ foo: 'bar' });
    expect({ foo: 'bar', bar: 'foo' }).to.contain({ bar: 'foo' });
    expect({ foo: 'bar' }).not.to.contain({ foo: 'baz' });

    err(function () {
      expect({ foo: 'foo' }).to.contain({ bar: 'bar' });
    }, "expected { foo: 'foo' } to have a property 'bar'");

    err(function () {
      expect({ foo: 'foo' }).to.contain({ foo: 'bar' });
    }, "expected { foo: 'foo' } to have a property 'foo' of 'bar'");
  });

  it('should test keys(array)', function () {
    expect({ foo: 1 }).to.have.keys(['foo']);
    expect({ foo: 1, bar: 2 }).to.have.keys(['foo', 'bar']);
    expect({ foo: 1, bar: 2 }).to.have.keys('foo', 'bar');
    expect({ foo: 1, bar: 2, baz: 3 }).to.include.keys('foo', 'bar');
    expect({ foo: 1, bar: 2, baz: 3 }).to.include.keys('bar', 'foo');
    expect({ foo: 1, bar: 2, baz: 3 }).to.include.keys('baz');

    expect({ foo: 1, bar: 2 }).to.include.keys('foo');
    expect({ foo: 1, bar: 2 }).to.include.keys('bar', 'foo');
    expect({ foo: 1, bar: 2 }).to.include.keys(['foo']);
    expect({ foo: 1, bar: 2 }).to.include.keys(['bar']);
    expect({ foo: 1, bar: 2 }).to.include.keys(['bar', 'foo']);

    expect({ foo: 1, bar: 2 }).not.to.have.keys('baz');
    expect({ foo: 1, bar: 2 }).not.to.have.keys('foo', 'baz');
    expect({ foo: 1, bar: 2 }).not.to.include.keys('baz');
    expect({ foo: 1, bar: 2 }).not.to.include.keys('foo', 'baz');
    expect({ foo: 1, bar: 2 }).not.to.include.keys('baz', 'foo');

    err(function () {
      expect({ foo: 1 }).to.have.keys();
    }, "keys required");

    err(function () {
      expect({ foo: 1 }).to.have.keys([]);
    }, "keys required");

    err(function () {
      expect({ foo: 1 }).not.to.have.keys([]);
    }, "keys required");

    err(function () {
      expect({ foo: 1 }).to.include.keys([]);
    }, "keys required");

    err(function () {
      expect({ foo: 1 }).to.have.keys(['bar']);
    }, "expected { foo: 1 } to include key 'bar'");

    err(function () {
      expect({ foo: 1 }).to.have.keys(['bar', 'baz']);
    }, "expected { foo: 1 } to include keys 'bar', and 'baz'");

    err(function () {
      expect({ foo: 1 }).to.have.keys(['foo', 'bar', 'baz']);
    }, "expected { foo: 1 } to include keys 'foo', 'bar', and 'baz'");

    err(function () {
      expect({ foo: 1 }).not.to.have.keys(['foo']);
    }, "expected { foo: 1 } not to include key 'foo'");

    err(function () {
      expect({ foo: 1 }).not.to.have.keys(['foo']);
    }, "expected { foo: 1 } not to include key 'foo'");

    err(function () {
      expect({ foo: 1, bar: 2 }).not.to.have.keys(['foo', 'bar']);
    }, "expected { foo: 1, bar: 2 } not to include keys 'foo', and 'bar'");

    err(function () {
      expect({ foo: 1 }).not.to.include.keys(['foo']);
    }, "expected { foo: 1 } not to include key 'foo'");

    err(function () {
      expect({ foo: 1 }).to.include.keys('foo', 'bar');
    }, "expected { foo: 1 } to include keys 'foo', and 'bar'");

    // only
    expect({ foo: 1, bar: 1 }).to.only.have.keys('foo', 'bar');
    expect({ foo: 1, bar: 1 }).to.only.have.keys(['foo', 'bar']);

    err(function () {
      expect({ a: 'b', c: 'd' }).to.only.have.keys('a', 'b', 'c');
    }, "expected { a: 'b', c: 'd' } to only have keys 'a', 'b', and 'c'");

    err(function () {
      expect({ a: 'b', c: 'd' }).to.only.have.keys('a');
    }, "expected { a: 'b', c: 'd' } to only have key 'a'");
  });

  it('should allow chaining with `and`', function () {
    expect(5).to.be.a('number').and.equal(5);
    expect(5).to.be.a('number').and.not.equal(6);
    expect(5).to.be.a('number').and.not.equal(6).and.not.equal('5');

    err(function () {
      expect(5).to.be.a('number').and.not.to.equal(5);
    }, "expected 5 not to equal 5");

    err(function () {
      expect(5).to.be.a('number').and.not.to.equal(6).and.not.be.above(4);
    }, "expected 5 not to be above 4");
  });

  it('should fail with `fail`', function () {
    err(function () {
        expect().fail();
      }, "expected undefined to explicitly fail");
  });

  it('should fail with `fail` and custom message', function () {
    err(function () {
        expect().fail("explicitly fail with message");
      }, "expected undefined to explicitly fail with message");
  });

  // only tests exact aliases
  it('should alias correctly', function () {
    expect(expect.throwError).to.equal(expect.throwException);
    expect(expect.between).to.equal(expect.within);
    expect(expect.greaterThan).to.equal(expect.above);
    expect(expect.lessThan).to.equal(expect.below);
  });

  it('should distinguish `not` flag', function(){
    expect(2).not.eql(3).and.eql(2);
  });
});
