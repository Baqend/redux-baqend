import createBaqendMiddleware from '../src/middleware/createMiddleware'
import { baqendObject, baqendList, db } from './util/helpers'

let baqendMiddleware, doGetState, next, doDispatch, nextHandler

beforeAll(() => {
  baqendMiddleware = createBaqendMiddleware(db)
  doGetState = () => {}
  doDispatch = (action) => action
  nextHandler = baqendMiddleware({ dispatch: doDispatch, getState: doGetState })
})


describe('handle baqend action objects', () => {
  const action = {
    'BAQEND': {
      type: "someActionResolve",
      payload: (db) => db.resultList()
    }
  }

  test('it should pass the action to next method after processing', () => {
    const dispatch = nextHandler(nextAction => {
      expect(nextAction).toEqual({
        type: "someActionResolve",
        payload: baqendList
      })
    })
    return dispatch(action)
  })

  test('it should return the result to caller function', () => {
    const dispatch = nextHandler(action => action)
    return dispatch(action).then((res) => {
      expect(res).toEqual(baqendList)
    })
  })

  test('it should dispatch another pending action if types array is set', async () => {
    let i = 0
    const action = {
      'BAQEND': {
        types: ["someActionPending", "someActionResolve"],
        payload: (db) => db.resultList()
      }
    }
    const next = jest.fn()
    const dispatch = nextHandler(nextAction => {
      next()
      if (i === 0) {
        expect(nextAction).toEqual({
          type: "someActionPending"
        })
      } else if (i === 1) {
        expect(nextAction).toEqual({
          type: "someActionResolve",
          payload: baqendList
        })
      }
      i++
    })
    await dispatch(action)
    expect(next).toHaveBeenCalledTimes(2)
  })

  test('it should not dispatch an action if an error occurs if no error type is set', async () => {
    const action = {
      'BAQEND': {
        type: "someActionReject",
        payload: (db) => db.resultListRejected()
      }
    }
    const next = jest.fn()
    const dispatch = nextHandler(nextAction => {
      next()
    })
    try {
      await dispatch(action)
    } catch(e) {
      expect(e).toBe('Some Error')
    }
    expect(next).toHaveBeenCalledTimes(0)
  })

  test('it should a pending and an error action if an error occurs and the types array is set', async () => {
    let i = 0
    const action = {
      'BAQEND': {
        types: ["someActionPending", "someActionResolve", "someActionReject"],
        payload: (db) => db.resultListRejected()
      }
    }
    const next = jest.fn()
    const dispatch = nextHandler(nextAction => {
      next()
      if (i === 0) {
        expect(nextAction).toEqual({
          type: "someActionPending"
        })
      } else if (i === 1) {
        expect(nextAction).toEqual({
          type: "someActionReject",
          payload: "Some Error"
        })
      }
      i++
    })
    try {
      await dispatch(action)
    } catch (e) {
      expect(e).toBe("Some Error")
    }
    expect(next).toHaveBeenCalledTimes(2)
  })

  test('it should dispatch a modified action if set in the types array', async () => {
    let i = 0
    const action = {
      'BAQEND': {
        types: [
          {
            type: "someActionPending",
            params: "someParamsPending"
          }, {
            type: "someActionResolve",
            params: "someParamsResolve",
            payload: (payload) => ({
              payload: payload,
              params: "someParamsInPayload"
            })
          }
        ],
        payload: (db) => db.resultList()
      }
    }
    const next = jest.fn()
    const dispatch = nextHandler(nextAction => {
      next()
      if (i === 0) {
        expect(nextAction).toEqual({
          type: "someActionPending",
          params: "someParamsPending"
        })
      } else if (i === 1) {
        expect(nextAction).toEqual({
          type: "someActionResolve",
          params: "someParamsResolve",
          payload: {
            payload: baqendList,
            params: "someParamsInPayload"
          }
        })
      }
      i++
    })
    await dispatch(action)
    expect(next).toHaveBeenCalledTimes(2)
  })

  test('it should make a baqend object from a serialized json', async () => {
    const item = {
      id: "/db/Type/123"
    }
    const action = {
      'BAQEND': {
        type: "someActionResolve",
        payload: [item, (db, item) => {
          return item.save()
        }]
      }
    }
    const next = jest.fn()
    const dispatch = nextHandler(nextAction => {
      expect(nextAction).toEqual({
        type: "someActionResolve",
        payload: item
      })
      next()
    })
    const dispatched = await dispatch(action)
    expect(dispatched).toEqual(item)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
