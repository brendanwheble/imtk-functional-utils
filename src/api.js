import { check_if, pipeP, get } from './index'; //eslint-disable-line

export const postToAPI = options => url => (data) => {
  const opts = options || {};
  return fetch(url, { ...opts, body: JSON.stringify(data) });
};

export const getFromAPI = options => url => () => {
  const opts = options || {};
  return fetch(url, { ...opts });
};

export const isResponseStatusOk = response => response.ok ? Promise.resolve(response) : Promise.reject({ status: response.status, statusText: response.statusText, toString() { return JSON.stringify(this); } }); //eslint-disable-line
export const getJson = response => response.json();

export const postToAPIWithDefaultOptions = postToAPI({ method: 'POST', credentials: 'include' });
export const getFromAPIWithDefaultOptions = getFromAPI({ method: 'GET', credentials: 'include' });
export const isJsonStatusOk = check_if({ success: true }, 'An error occurred');
export const dispatchAction = dispatch => actionCreator => (...args) => {
  dispatch(actionCreator(...args));
};

export const processAPIRequestChain = (work, successAction, failureAction, done) => (initialData) => {
  work(Promise.resolve(initialData))
    .then((value) => {
      successAction(value);
    })
    .catch((err) => {
      failureAction(err);
    })
    .then(() => {
      done();
    });
};

export const processDefaultAPIRequestWithoutPing = (apiCall, successAction, failureAction, done) => processAPIRequestChain(
    pipeP(
      apiCall,
      isResponseStatusOk,
      getJson,
      isJsonStatusOk,
      get('data')
    ),
    successAction,
    failureAction,
    done
  );

