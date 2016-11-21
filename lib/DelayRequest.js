const request = require("request")
const toUpper = require("lodash/toUpper")
const isFunction = require("lodash/isFunction")
const isString = require("lodash/isString")
const delay = require("lodash/delay")
const isObject = require("lodash/isObject")
const assign = require("lodash/assign")
const isNull = require("lodash/isNull")
const during = require("async/during")

exports.DelayRequest = DelayRequest

/**
 * @example
 * DelayRequest(url, opts, callback)
 * DelayRequest(opts, callback)
 * DelayRequest(url, callback)
 */
function DelayRequest (p1 = null, p2 = null, p3 = null) {
  let opts, done;
  // DelayRequest(url, opts, callback)
  if (isString(p1) && isFunction(p3) && isObject(p2)) {
    done = p3
    opts = assign(p2, {url: p1})
  } else
  // DelayRequest(opts, callback)
  if (isNull(p3) && isFunction(p2) && isObject(p1)) {
    done = p2
    opts = p1
  } else
  // DelayRequest(url, callback)
  if (isNull(p3) && isFunction(p2) && isString(p1)) {
    done = p2
    opts = assign({}, {url: p1})
  }
  else {
    // Expected
    throw new TypeError(`Error in the parameters. Use 'DelayRequest(url, callback)', 'DelayRequest(opts, callback)' or 'DelayRequest(url, opts, callback)'`)
  }

  const { method:_method = "HEAD", url:_url = null, uri:_uri = null, validator = null, request:requestOpts = {}, maxIntents = 20, waitTimeBetweenQueries = 0} = opts

  const uri = _url || _uri
  const method = toUpper(_method)
  const _validator_isFunction = isFunction(validator);

  let response = null
  let intents = 0

  // Define request opts
  requestOpts.method = method
  requestOpts.uri = uri

  function test (callback) {
    if (_validator_isFunction) {
      // Exec
      validator(response, (err = null, retry = false) => {
        if (!isNull(err)) {
          callback(err);
        } else
        if (isNull(err) && retry === false) {
          callback(null, false);
        } else
        {
          if (retry === true) {
            intents += 1;
          }
          delay(callback, waitTimeBetweenQueries)(err, retry)
        }
      })
    } else
    {
      if (response && response.statusCode === 200) {
        callback(null, false);
      } else {
        if (intents <= maxIntents) {
          intents += 1;
          delay(callback, waitTimeBetweenQueries)(null, true);
        } else {
          callback(new Error(`Has exceeded ${maxIntents} maximum attempts`))
        }
      }
    }
  }

  function fnRequest (callback) {
    request(requestOpts, function(err, _response, body) {
      if (err) {
        callback();
      } else {
        response = _response
        callback();
      }
    })
  }

  during(test, fnRequest, done)
}
