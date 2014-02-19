
/**
 * Module dependencies.
 */

function err (fn, msg) {
  try {
    fn();
    throw new Error('Expected an error');
  } catch (err) {
    expect(msg).to.be(err.message);
  }
}

/**
 * Feature detection for `name` support.
 */

var nameSupported;

(function a () {
  nameSupported = 'a' == a.name;
})();

/**
 * Tests.
 */

describe('expect', function () {

  it('should have .version', function () {
    expect(expect.version).to.match(/^\d+\.\d+\.\d+(-[a-zA-Z0-9\-\.]+)*$/);
  });

  it('should work in its basic form', function () {
    // @todo
    expect('test').to.a('string');
  });

  it('should test true', function () {
    expect(true).to.be(true);
    expect(false).to.not.be(true);
    expect(1).to.not.be(true);

    err(function () {
      expect('test').to.be(true);
    }, "expected 'test' to equal true")
  });

  it('should allow not.to', function () {
    expect(true).not.to.be(false);

    err(function () {
      expect(false).not.to.be(false);
    }, "expected false to not equal false")
  });

  it('should test truth', function () {
    // @todo
    expect(true).to.aver();
    expect(false).to.not.aver();
    expect(1).to.aver();
    expect(0).not.to.aver();

    err(function () {
      expect('').to.aver();
    }, "expected '' to aver");

    err(function () {
      expect('test').to.not.aver();
    }, "expected 'test' not to aver");

    expect().not.to.aver().and.to.be(undefined);
    var a = expect('2');
    expect(a.aver).to.be(a.ok);
  });

  it('should test false', function () {
    expect(false).to.be(false);
    expect(true).to.not.be(false);
    expect(0).to.not.be(false);

    err(function () {
      expect('').to.be(false);
    }, "expected '' to equal false")
  });

  it('should test functions with arguments', function () {
    function itThrowsSometimes (first, second) {
      if (first ^ second) {
        throw new Error('tell');
      }
    }

    expect(itThrowsSometimes).withArgs(false, false).to.not.throwException();
    expect(itThrowsSometimes).withArgs(false, true).to.throwException(/tell/);
    expect(itThrowsSometimes).withArgs(true, false).to.throwException(/tell/);
    expect(itThrowsSometimes).withArgs(true, true).to.not.throwException();
  });

  it('should test for exceptions', function () {
    function itThrows () {
      a.b.c;
    }

    function itThrowsString () {
      throw 'aaa';
    }

    function itThrowsMessage () {
      throw new Error('tobi');
    }

    var anonItThrows = function () {
      a.b.c;
    }

    function itWorks () {
      return
    }

    var anonItWorks = function () { }

    expect(itThrows).to.throwException();
    expect(itWorks).to.not.throwException();

    var subject;

    expect(itThrows).to.throwException(function (e) {
      subject = e;
    });

    expect(subject).to.an(Error);

    expect(itThrowsMessage).to.throwException(/tobi/);
    expect(itThrowsMessage).to.not.throwException(/test/);

    err(function () {
      expect(itThrowsMessage).to.throwException(/no match/);
    }, 'expected \'tobi\' to match /no match/');

    var subject2;

    expect(itThrowsString).to.throwException(function (str) {
      subject2 = str;
    });

    expect(subject2).to.be('aaa');

    expect(itThrowsString).to.throwException(/aaa/);
    expect(itThrowsString).to.not.throwException(/bbb/);

    err(function () {
      expect(itThrowsString).to.throwException(/no match/i);
    }, 'expected \'aaa\' to match /no match/i');

    var called = false;

    expect(itWorks).to.not.throwError(function () {
      called = true;
    });

    expect(called).to.be(false);

    err(function () {
      expect(5).to.throwException();
    }, 'expected 5 to be a function');

    err(function () {
      expect(anonItThrows).not.to.throwException();
    }, 'expected fn not to throw an exception');

    err(function () {
      expect(anonItWorks).to.throwException();
    }, 'expected fn to throw an exception');

    if (nameSupported) {
      err(function () {
        expect(itWorks).to.throwException();
      }, 'expected itWorks to throw an exception');
    } else {
      err(function () {
        expect(itWorks).to.throwException();
      }, 'expected fn to throw an exception');
    }

    if (nameSupported) {
      err(function () {
        expect(itThrows).not.to.throwException();
      }, 'expected itThrows not to throw an exception');
    } else {
      err(function () {
        expect(anonItThrows).not.to.throwException();
      }, 'expected fn not to throw an exception');
    }
  });

  it('should test arrays', function () {
    expect([]).to.a('array');
    expect([]).to.an('array');

    err(function () {
      expect({}).to.an('array');
    }, 'expected {} to be an array');
  });

  it('should test regex', function () {
    expect(/a/).to.an('regexp');
    expect(/a/).to.a('regexp');

    err(function () {
      expect(null).to.a('regexp');
    }, 'expected null to be a regexp');
  });

  it('should test objects', function () {
    expect({}).to.an('object');

    err(function () {
      expect(null).to.an('object');
    }, 'expected null to be an object');
  });

  it('should test .equal()', function () {
    var foo;
    expect(foo).to.be(undefined);
  });

  it('should test typeof', function () {
    expect('test').to.a('string');

    err(function () {
      expect('test').to.not.a('string');
    }, "expected 'test' not to be a string");

    expect(5).to.a('number');

    err(function () {
      expect(5).to.not.a('number');
    }, "expected 5 not to be a number");
  });

  it('should test instanceof', function () {
    function Foo(){}
    expect(new Foo()).to.a(Foo);

    if (nameSupported) {
      err(function () {
        expect(3).to.a(Foo);
      }, "expected 3 to be an instance of Foo");
    } else {
      err(function () {
        expect(3).to.a(Foo);
      }, "expected 3 to be an instance of supplied constructor");
    }
  });

  it('should test between(start, finish)', function () {
    expect(5).to.between(3,6);
    expect(5).to.between(3,5);
    expect(5).not.to.between(1,3);

    err(function () {
      expect(5).not.to.between(4,6);
    }, "expected 5 not to between 4..6");

    err(function () {
      expect(10).to.between(50,100);
    }, "expected 10 to between 50..100");
  });

  it('should test approximately(value, delta)', function() {
    err(function () {
      expect(1.4 - 0.1).to.be(1.3);
    }, "expected 1.2999999999999998 to equal 1.3");
    expect(1.4 - 0.1).to.approximate(1.3, 1e-15);
    expect(1.5).to.approximate(1.4, 0.2);
    expect(1.5).to.approximate(1.5, 10E-10);
    expect(1.5).to.not.approximate(1.4, 1E-2);

    err(function () {
      expect(99.99).to.not.approximate(100, 0.1);
    }, "expected 99.99 not to approximate 100 +- 0.1");

    err(function () {
      expect(99.99).to.approximate(105, 0.1);
    }, "expected 99.99 to approximate 105 +- 0.1");
  });

  it('should test beGt(n)', function () {
    expect(5).to.beGt(2);
    expect(5).to.beGt(2);
    expect(5).not.to.beGt(5);
    expect(5).not.to.beGt(6);
    var e = expect(9);
    expect(e.beGt).to.and.to.be(e.above).to.be(e.greaterThan)
    err(function () {
      expect(5).to.beGt(6);
    }, "expected 5 to be greater than 6");

    err(function () {
      expect(10).not.to.beGt(6);
    }, "expected 10 not to be greater than 6");
  });

  it('should test match(regexp)', function () {
    expect('foobar').to.match(/^foo/)
    expect('foobar').to.not.match(/^bar/)

    err(function () {
      expect('foobar').to.match(/^bar/i)
    }, "expected 'foobar' to match /^bar/i");

    err(function () {
      expect('foobar').to.not.match(/^foo/i)
    }, "expected 'foobar' not to match /^foo/i");
  });

  it('should test length(n)', function () {
    expect('test').to.have.length(4);
    expect('test').to.not.have.length(3);
    expect([1,2,3]).to.have.length(3);

    err(function () {
      expect(4).to.have.length(3);
    }, 'expected 4 to have a property \'length\'');

    err(function () {
      expect('asd').to.not.have.length(3);
    }, "expected 'asd' to not have a length of 3");
  });

  it('should test eql(val)', function () {
    expect('test').to.eql('test');
    expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
    expect(1).to.eql(1);
    expect('4').to.not.eql(4);
    expect(/a/gmi).to.eql(/a/mig);
    function returnArguments() { return arguments; }
    expect(returnArguments(0,1,2,3)).to.eql(returnArguments(0,1,2,3));

    err(function () {
      expect(4).to.eql(3);
    }, 'expected 4 to equal 3');
  });
  it('should test resemble(val)', function () {
    var num = 0;
    var obj = new String("0");
    var str = "0";
    var b = false;

    expect(num).to.resemble(num);
    expect(obj).to.resemble(obj);
    expect(str).to.resemble(str);
    expect(num).to.resemble(obj);
    expect(num).to.resemble(str);
    expect(obj).to.resemble(str);

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

  it('should test be(val)', function () {
    expect('test').to.be('test');
    expect(1).to.be(1);

    err(function () {
      expect(4).to.be(3);
    }, 'expected 4 to equal 3');

    err(function () {
      expect('4').to.be(4);
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
    expect('').to.empty();
    expect({}).to.empty();
    expect([]).to.empty();
    expect({ length: 0 }).to.empty();

    var e = expect({});
    err(function () {
      expect(null).to.empty();
    }, 'expected null to be an object');

    err(function () {
      expect({ a: 'b' }).to.empty();
    }, 'expected { a: \'b\' } to empty');

    err(function () {
      expect({ length: '0' }).to.empty();
    }, 'expected { length: \'0\' } to empty');

    err(function () {
      expect('asd').to.empty();
    }, "expected 'asd' to empty");

    err(function () {
      expect('').not.to.empty();
    }, "expected '' not to empty");

    err(function () {
      expect({}).not.to.empty();
    }, "expected {} not to empty");
  });

  it('should test property(name)', function () {
    expect('test').to.have.property('length');
    expect(4).not.to.have.property('length');
    expect({ length: undefined }).to.have.property('length');

    err(function () {
      expect('asd').to.have.property('foo');
    }, "expected 'asd' to have a property 'foo'");
    
    err(function () {
      expect({ length: undefined }).to.not.have.property('length');
    }, "expected { length: undefined } to not have a property 'length'");
  });

  it('should test property(name, val)', function () {
    expect('test').to.have.property('length', 4);
    expect({ length: undefined }).to.have.property('length', undefined);

    err(function () {
      expect('asd').to.have.property('length', 4);
    }, "expected 'asd' to have a property 'length' of 4, but got 3");

    err(function () {
      expect('asd').to.not.have.property('length', 3);
    }, "expected 'asd' to not have a property 'length' of 3");

    err(function () {
      expect('asd').to.not.have.property('foo', 3);
    }, "'asd' has no property 'foo'");
    
    err(function () {
      expect({ length: undefined }).to.not.have.property('length', undefined);
    }, "expected { length: undefined } to not have a property 'length'");
  });

  it('should test own.property(name)', function () {
    expect('test').to.have.own.property('length');
    expect({ length: 12 }).to.have.own.property('length');

    err(function () {
      expect({ length: 12 }).to.not.have.own.property('length');
    }, "expected { length: 12 } to not have own property 'length'");
  });

  it('should test string()', function () {
    expect('foobar').to.contain('bar');
    expect('foobar').to.contain('foo');
    expect('foobar').to.include.string('foo');
    expect('foobar').to.not.contain('baz');
    expect('foobar').to.not.include.string('baz');

    err(function () {
      expect(3).to.contain('baz');
    }, "expected 3 to contain 'baz'");

    err(function () {
      expect('foobar').to.contain('baz');
    }, "expected 'foobar' to contain 'baz'");

    err(function () {
      expect('foobar').to.not.contain('bar');
    }, "expected 'foobar' to not contain 'bar'");
  });

  it('should test contain()', function () {
    expect(['foo', 'bar']).to.contain('foo');
    expect(['foo', 'bar']).to.contain('foo');
    expect(['foo', 'bar']).to.contain('bar');
    expect([1,2]).to.contain(1);
    expect(['foo', 'bar']).to.not.contain('baz');
    expect(['foo', 'bar']).to.not.contain(1);

    err(function () {
      expect(['foo']).to.contain('bar');
    }, "expected [ 'foo' ] to contain 'bar'");

    err(function () {
      expect(['bar', 'foo']).to.not.contain('foo');
    }, "expected [ 'bar', 'foo' ] to not contain 'foo'");
  });

  it('should test existance of subobject', function () {
    expect({ foo: 'bar' }).to.contain({ foo: 'bar' });
    expect({ foo: 'bar', bar: 'foo' }).to.contain({ bar: 'foo' });
    expect({ foo: 'bar' }).to.not.contain({ foo: 'baz' });

    err(function () {
      expect({ foo: 'foo' }).to.contain({ bar: 'bar' });
    }, "expected { foo: 'foo' } to have a property 'bar'");

    err(function () {
      expect({ foo: 'foo' }).to.contain({ foo: 'bar' });
    }, "expected { foo: 'foo' } to have a property 'foo' of 'bar', but got 'foo'");
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

    expect({ foo: 1, bar: 2 }).to.not.have.keys('baz');
    expect({ foo: 1, bar: 2 }).to.not.have.keys('foo', 'baz');
    expect({ foo: 1, bar: 2 }).to.not.include.keys('baz');
    expect({ foo: 1, bar: 2 }).to.not.include.keys('foo', 'baz');
    expect({ foo: 1, bar: 2 }).to.not.include.keys('baz', 'foo');

    err(function () {
      expect({ foo: 1 }).to.have.keys();
    }, "keys required");

    err(function () {
      expect({ foo: 1 }).to.have.keys([]);
    }, "keys required");

    err(function () {
      expect({ foo: 1 }).to.not.have.keys([]);
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
      expect({ foo: 1 }).to.not.have.keys(['foo']);
    }, "expected { foo: 1 } to not include key 'foo'");

    err(function () {
      expect({ foo: 1 }).to.not.have.keys(['foo']);
    }, "expected { foo: 1 } to not include key 'foo'");

    err(function () {
      expect({ foo: 1, bar: 2 }).to.not.have.keys(['foo', 'bar']);
    }, "expected { foo: 1, bar: 2 } to not include keys 'foo', and 'bar'");

    err(function () {
      expect({ foo: 1 }).to.not.include.keys(['foo']);
    }, "expected { foo: 1 } to not include key 'foo'");

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
    expect(5).to.a('number').and.be(5);
    expect(5).to.a('number').and.not.be(6);
    expect(5).to.a('number').and.not.be(6).and.not.be('5');

    err(function () {
      expect(5).to.a('number').and.not.be(5);
    }, "expected 5 to not equal 5");

    err(function () {
      expect(5).to.a('number').and.not.to.be(6).and.beLt(4);
    }, "expected 5 to be less than 4");
  });

  it('should fail with `fail`', function () {
    err(function () {
        expect().fail();
    }, "explicit failure");
  });

  it('should fail with `fail` and custom message', function () {
    err(function () {
        expect().fail("explicit failure with message");
    }, "explicit failure with message");
  });

  // only tests exact aliases
  it('should alias correctly', function () {
    expect(expect.throwError).to.equal(expect.throwException);
    expect(expect.between).to.equal(expect.within);
    expect(expect.greaterThan).to.equal(expect.above);
    expect(expect.lessThan).to.equal(expect.below);
  });

});
describe('Object define', function(){
  it('should distinguish `not` flag', function(){
    expect(2).not.eql(3).and.eql(2);
  })
});
