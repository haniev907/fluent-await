'use strict';

class _A {
  constructor() {
    this.d = 5;
    this.e = 10;

    const _fluentHandler = {
      get: function (target, prop, receiver) {
        if (prop === 'then') {
          return (...args) => target.chain.then(...args);
        }

        const reflected = Reflect.get(target.self, prop, receiver);
        const method = (...args) => {
          return _asynced(
            target.self,
            target.chain.then(() => reflected.apply(target.self, args)),
          )
        };

        if (prop in target.self.__proto__) return method;

        return reflected;
      },
    };

    const _asynced = (self, chain) => {
      return new Proxy({
        self: self || this,
        chain: chain || Promise.resolve(self || this),
      }, _fluentHandler);
    };

    this.asynced = () => {
      return _asynced();
    }
  }

  async m2() {
    // For instance.
    await (new Promise((resolve, reject) => {
      setTimeout(() => {
        this.d *= 2;
        resolve();
      }, 300);
    }));

    return this;
  }

  async d5() {
    // Async but immediate.
    this.d /= 5;

    return this;
  }
}

const A = (...args) => {
  return new _A(...args).asynced();
};

(async () => {
  const obj = A();

  console.log(obj.d);

  await obj.m2().m2();
  console.log(obj.d);

  await obj.m2().d5().m2().m2().m2().m2().m2();
  console.log(obj.d);
})();
