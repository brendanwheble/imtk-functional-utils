import _curry from 'lodash/curry';
import _get from 'lodash/get';
import _isError from 'lodash/isError';
import _isPlainObject from 'lodash/isPlainObject';
import _matches from 'lodash/matches';
import _merge from 'lodash/merge';
import _omit from 'lodash/omit';
import _pick from 'lodash/pick';
import * as ApiUtils from './api';

export const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);
export const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
export const pipeP = (...fns) => acc => fns.reduce((acc1, fn) => acc1.then(fn), Promise.resolve(acc));
export const pick = accessor => obj => _pick(obj, accessor);
export const omit = accessor => obj => _omit(obj, accessor);
export const pickOrAll = accessor => obj => accessor ? _pick(obj, accessor) : obj; //eslint-disable-line
export const get = accessor => obj => _get(obj, accessor);
export const merge = source => obj => _merge(obj, source);
export const splitWithAllPaths = separator => (sourceString) => {
  const arr = sourceString.split(separator);
  return arr.reduce((acc, value) => {
    acc.push(acc.length > 0 ? `${acc[acc.length - 1]}${separator}${value}` : value);
    return acc;
  }, []);
};
export const findPropertyFromPathUpTree = separator => pathsFn => property => path => (obj) => {
  const paths = pathsFn(separator)(path);
  return paths.reduce((acc, key) => _get(obj, `${key}.${property}`, acc), undefined);
};
export const defaultFindPropertyFromPathUpTree = findPropertyFromPathUpTree('.')(splitWithAllPaths);

// if what is type Error, fail
// if test is type number or boolean, exact equality comparison
// if test is a plain object, use lodash's matches to compare to what
// if test is function that returns true or false, run it with what as the argument
// if test is a string, treat it as a tokenized path and return true if the value
//   at that path exists and is truthy
//   Also for string tests, consider any strings that start with "this."
//   to refer to the contextual this ignoring "what"
//   Also for string tests, allow a a string like "path.path.{prop:value}",
//   which looks into the path before '{"prop":value}'', parses that object
//   syntax into a real object,
//   and passes it to _.matches
export const multicompare = _curry(function (test, what) {
  let splittest;
  let localTest = test;
  let localWhat = what;
  if (typeof test === 'string') {
    if (test.indexOf('this.') === 0) {
      localWhat = this;
      localTest = test.replace('this.', '');
    }
    if (test.indexOf('.{') > 0) {
      splittest = test.split('.{');
      localWhat = _get(what, splittest[0]);
      try {
        localTest = JSON.parse(`{${splittest[1]}`);
      } catch (e) {
        localTest = null;
      }
    }
  }
  return !_isError(localWhat) && (
      ((typeof localTest === 'number' || typeof localTest === 'boolean') && localTest === localWhat) ||
      (_isPlainObject(localTest) && _matches(localTest)(localWhat)) ||
      (typeof localTest === 'string' && !!_get(localWhat, localTest)) ||
      (typeof localTest === 'function' && localTest(localWhat))
    );
});

//resolve or reject an object based on a test
export const checkIf = (test, errMsg) => {
  const msg = errMsg || 'error';
  return function (what) {
    return multicompare(test, what) ?
      Promise.resolve(what) :
      Promise.reject({
        message: msg || '',
        value: what,
        toString() { return `${msg}: ${JSON.stringify(what)}`; }
      });
  };
};

export const getProp = accessor => array => array.map(item => item[accessor]);

export const equalsPredicate = (accessor, value, obj) => _get(obj, accessor) === value;
export const startsWithPredicate = (accessor, value, obj) => _get(obj, accessor).startsWith(value);
export const includesPredicate = (accessor, value, obj) => _get(obj, accessor).indexOf(value) > -1;
export const existsPredicate = (accessor, value, obj) => typeof _get(obj, accessor) !== 'undefined';

export const filterByKey = accessor => predicate => value => array => array.filter(obj =>
  predicate(accessor, value, obj)
);

export { ApiUtils };
