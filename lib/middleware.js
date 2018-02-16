'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _util = require('./util');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var middleware = function middleware(_ref) {
  var dispatch = _ref.dispatch,
      getState = _ref.getState,
      next = _ref.next,
      action = _ref.action,
      db = _ref.db,
      BAQEND = _ref.BAQEND;
  var type = BAQEND.type,
      types = BAQEND.types,
      serializer = BAQEND.serializer,
      payload = BAQEND.payload,
      options = BAQEND.options;


  var PENDING = types && types[0] ? types[0] : undefined;
  var SUCCESS = types && types[1] ? types[1] : type;
  var FAILURE = types && types[2] ? types[2] : undefined;

  if (PENDING) {
    if (typeof PENDING === 'string') {
      next({ type: PENDING });
    } else {
      next(PENDING);
    }
  }

  return db.then(function (db) {
    var ref = void 0,
        func = void 0;
    if ((typeof payload === 'undefined' ? 'undefined' : _typeof(payload)) == 'object') {
      ref = _typeof(payload[0]) === 'object' ? (0, _util.getReference)(db, payload[0], options) : null;
      func = payload[1];
    } else {
      func = payload;
    }

    var promiseOrStream = func(db, ref);
    if (promiseOrStream && promiseOrStream.subscribe) {
      // handle subscription
      var callback = function callback(r) {
        var res = void 0;
        var action = void 0;
        if (Array.isArray(r)) {
          res = (0, _util.resultToJSON)(r, options);
        } else {
          res = {
            date: r.date,
            data: (0, _util.resultToJSON)(r.data, options),
            matchType: r.matchType,
            operation: r.operation
          };
        }
        action = {
          type: SUCCESS,
          payload: res
        };
        next(action);
      };

      var subscription = promiseOrStream.subscribe(callback);
      dispatch({
        type: SUCCESS + '_SUBSCRIPTION',
        payload: subscription
      });
      return subscription;
    } else {
      // handle promises
      return new Promise(function (resolve, reject) {
        promiseOrStream.then(function (r) {

          var action = void 0;
          var res = (0, _util.resultToJSON)(r, options);
          if (typeof SUCCESS === 'string') {
            action = {
              type: SUCCESS,
              payload: res
            };
          } else {
            var _type = SUCCESS.type,
                _payload = SUCCESS.payload,
                rest = _objectWithoutProperties(SUCCESS, ['type', 'payload']);

            action = _extends({
              type: _type,
              payload: _payload && _payload(res) || res
            }, rest);
          }
          next(action);

          resolve(r);
        }, function (err) {

          if (FAILURE) {
            var _action = void 0;
            if (typeof FAILURE === 'string') {
              _action = {
                type: FAILURE,
                payload: err
              };
            } else {
              var _type2 = FAILURE.type,
                  _payload2 = FAILURE.payload,
                  rest = _objectWithoutProperties(FAILURE, ['type', 'payload']);

              _action = _extends({
                type: _type2,
                payload: _payload2 && _payload2(err) || err
              }, rest);
            }
            next(_action);
          }

          reject(err);
        });
      });
    }
  });
};

exports.default = middleware;