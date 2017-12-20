const resultToJSON = (res, options = {}) => {
  if (res === undefined)
    return null
  if (res.operation)
    return { ...res, data: res.data.toJSON(options) }
  if (res.length) {
    return res[0]._metadata ? res.map(o => o.toJSON(options)) : res
  } else {
    return res._metadata ? res.toJSON(options) : res
  }
}

const getReference = (db, json, options) => {
  let type = typeof options === 'object' && options.type ? options.type : json.id.split('/')[2];
  return db[type] ? db[type].fromJSON(json) : null;
}

const createBaqendMiddleware = (db) => {
  return ({ dispatch, getState }) => next => action => {
    const { BAQEND } = action;

    if(BAQEND) {
      const { type, types, serializer, payload, options } = BAQEND;

      const PENDING = types && types[0] ? types[0] : undefined;
      const SUCCESS = types && types[1] ? types[1] : type;
      const FAILURE = types && types[2] ? types[2] : undefined;

      if(PENDING) {
        if(typeof PENDING === 'string') {
          next({ type: PENDING })
        } else {
          next(PENDING);
        }
      }

      return db.then((db) => {
        let ref, func;
        if (typeof payload == 'object') {
          ref = typeof payload[0] === 'object' ? getReference(db, payload[0], options) : null
          func = payload[1]
        } else {
          func = payload
        }

        let promiseOrStream = func(db, ref)
        if(promiseOrStream && promiseOrStream.subscribe) {
          // handle subscription
          const callback = (r) => {
            debugger
            let res
            let action
            if (Array.isArray(r)) {
              res = resultToJSON(r, options)
            } else {
              res = {
                date: r.date,
                data: resultToJSON(r.data, options),
                matchType: r.matchType,
                operation: r.operation
              }
            }
            action = {
              type: SUCCESS,
              payload: res
            }
            next(action);
          }

          const subscription = promiseOrStream.subscribe(callback)
          dispatch({
            type: `${SUCCESS}_SUBSCRIPTION`,
            payload: subscription
          })
          return subscription

        } else {
          // handle promises
          return new Promise(function(resolve, reject) {
            promiseOrStream
              .then(
                (r) => {

                  let action;
                  let res = resultToJSON(r, options)
                  if(typeof SUCCESS === 'string') {
                    action = {
                      type: SUCCESS,
                      payload: res
                    }
                  } else {
                    const { type, payload, ...rest } = SUCCESS;
                    action = {
                      type: type,
                      payload: (payload && payload(res)) || res,
                      ...rest
                    }
                  }
                  next(action);

                  resolve(r);
                },
                (err) => {

                  if(FAILURE) {
                    let action;
                    if(typeof FAILURE === 'string') {
                      action = {
                        type: FAILURE,
                        payload: err
                      }
                    } else {
                      const { type, payload, ...rest } = FAILURE;
                      action = {
                        type: type,
                        payload: (payload && payload(err)) || err,
                        ...rest
                      }
                    }
                    next(action);
                  }

                  reject(err);
                }
              )
          })
        }
      })
    }

    return next(action)
  }
}

// const baqendMiddleware = createBaqendMiddleware();

export default createBaqendMiddleware
