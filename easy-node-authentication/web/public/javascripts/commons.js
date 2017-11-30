(function() {
  const commons = (function () {
    const commons = function (options) {

    };

    Object.defineProperty(Array.prototype, "pushAll", {
      value: function () {
        for (let i = 0; i < arguments.length; i++) {
          const to_add = arguments[i];
          for (let n = 0; n < to_add.length; n += 300) {
            push_apply(this, slice_call(to_add, n, n + 300));
          }
        }
      }
    });

    const replaceAll = function (str, find, replace) {
      return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    };

    const escapeRegExp = function (str) {
      return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    };

    const push_apply = Function.apply.bind([].push);
    const slice_call = Function.call.bind([].slice);
    const isEmpty = function (o) {
      return Object.keys(o).length === 0 && o.constructor === Object
    };
    const isArray = function (o) {
      return Object.prototype.toString.call(o) === '[object Array]';
    };
    const isObject = function (o) {
      return o !== null && !isArray(o) && typeof o === 'object';
    };
    const isScalar = function (o) {
      return (/number|boolean/).test(typeof o);
    };
    const isString = function (o) {
      return (/string/).test(typeof o);
    };
    const getObjectLength = function (object) {
      return Object.keys(object).length;
    };
    const traverse = function (x, firstStep, prefix) {
      const result = [];
      let innerResult;
      if (firstStep) {
        result[0] = "___id";
        innerResult = traverse(x, false, prefix);
        result.pushAll(innerResult);
      } else {
        if (isArray(x)) {
          innerResult = traverseArray(x, prefix);
          result.pushAll(innerResult);
        } else if (isObject(x)) {
          if (x == "tag") {
            console.log("1 " + x);
          }
          innerResult = traverseObject(x, prefix);
          result.pushAll(innerResult);
        } else {
          if (!x) {
            if (prefix && prefix.endsWith('.')) {
              result.push(prefix.substring(0, prefix.length - 1));
            } else {
              result.push(prefix);
            }
          } else if (!isObject(x)) {
            if (prefix)
              prefix = replaceAll(prefix, '[*]', '');
            if (prefix.endsWith('.')) {
              result.push(prefix.substring(0, prefix.length - 1));
            } else {

              result.push(prefix);
            }
          }

        }
      }
      return result;
    };

    const setValue = function (obj, path, value) {
      let schema = obj;
      const pList = path.split('.');
      const len = pList.length;
      for (let i = 0; i < len - 1; i++) {
        const elem = pList[i];
        if (!schema[elem]) {
          schema[elem] = {}
        }
        schema = schema[elem];
      }
      schema[pList[len - 1]] = value.trim();
    };

    commons.prototype.isArray = isArray;
    commons.prototype.isObject = isObject;
    commons.prototype.traverse = traverse;
    commons.prototype.setValue = setValue;
    commons.prototype.replaceAll = replaceAll;
    commons.prototype.isEmpty = isEmpty;
    commons.prototype.isScalar = isScalar;
    commons.prototype.isString = isString;
    commons.prototype.getObjectLength = getObjectLength;

    function traverseArray(arr, prefix) {
      const val = arr[0];
      let result = {};
      if (isArray(val)) {
        if (isObject(val)) {
          result = traverseArray(val, prefix);
        }
      } else {
        result = traverse(val, false, prefix);
      }
      return result;
    }

    function traverseObject(obj, prefix) {
      const result = [];
      let innerResult = [];
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          const innerObject = obj[key];
          const isArray_ = isArray(innerObject);
          const isObject_ = isObject(innerObject);
          if (isArray_) {
            innerResult = traverseArray(innerObject, !prefix ? (key + "[*].") : (prefix + key + "[*]."));
            result.pushAll(innerResult);
          } else if (isObject_) {
            innerResult = traverse(innerObject, false, !prefix ? (key + ".") : (prefix + key + "."));
            result.pushAll(innerResult);
          } else if ("___id" !== key && "___s" !== key) {
            if (prefix && prefix.endsWith('.')) {
              result.push(prefix + key);
            } else {
              result.push(key);
            }
          }
        }
      }
      return result;
    }
    return commons;
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = commons;
  }
  else {
    if (typeof define === 'function' && define.amd) {
      define([], function() {
        return commons;
      });
    }
    else {
      window.commons = commons;
    }
  }
  
})();