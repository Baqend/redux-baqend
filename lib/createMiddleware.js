'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _middleware = require('./middleware');

var _middleware2 = _interopRequireDefault(_middleware);

var _thunk = require('./thunk');

var _thunk2 = _interopRequireDefault(_thunk);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createBaqendMiddleware = function createBaqendMiddleware(db) {
  return function (_ref) {
    var dispatch = _ref.dispatch,
        getState = _ref.getState;
    return function (next) {
      return function (action) {
        var BAQEND = action.BAQEND,
            BAQEND_DISPATCH = action.BAQEND_DISPATCH;

        if (BAQEND || BAQEND_DISPATCH && BAQEND_DISPATCH.BAQEND) {
          BAQEND = BAQEND_DISPATCH && BAQEND_DISPATCH.BAQEND || BAQEND;
          if (typeof BAQEND === 'function' || Array.isArray(BAQEND)) {
            return db.then(function (db) {
              return (0, _thunk2.default)({ dispatch: dispatch, getState: getState, next: next, action: action, db: db, BAQEND: BAQEND });
            });
          }
          return (0, _middleware2.default)({ dispatch: dispatch, getState: getState, next: next, action: action, db: db, BAQEND: BAQEND });
        }
        if (BAQEND_DISPATCH && !BAQEND_DISPATCH.BAQEND) {
          return dispatch({
            type: BAQEND_DISPATCH.type,
            payload: (0, _util.resultToJSON)(BAQEND_DISPATCH.payload, BAQEND_DISPATCH.options)
          });
        }
        return next(action);
      };
    };
  };
};

// const baqendMiddleware = createBaqendMiddleware();

exports.default = createBaqendMiddleware;