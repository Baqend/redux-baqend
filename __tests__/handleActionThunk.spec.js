import createBaqendMiddleware from '../src/middleware/createMiddleware'
import { baqendObject, baqendList, db } from './util/helpers'

let baqendMiddleware, doGetState, next, doDispatch, nextHandler

const createMiddleware = (nextHandler, thunkNextHandler, thunkDispatchNextHandler) => {
  const thunkNextNext = baqendMiddleware({
    dispatch: doDispatch,
    getState: doGetState
  })
  const thunkNextNextDispatch = thunkNextNext(thunkDispatchNextHandler)
  const thunkNext = baqendMiddleware({
    dispatch: (action) => thunkNextNextDispatch(action),
    getState: doGetState
  })
  const thunkNextDispatch = thunkNext(thunkNextHandler)
  const next = baqendMiddleware({
    dispatch: (action) => thunkNextDispatch(action),
    getState: doGetState
  })
  return next(nextHandler)
}

beforeAll(() => {
  baqendMiddleware = createBaqendMiddleware(db)
  doGetState = () => {}
  doDispatch = (action) => action
  nextHandler = baqendMiddleware({ dispatch: doDispatch, getState: doGetState })
})

describe('handle baqend action thunks', () => {
  const action = {
    'BAQEND': async ({ dispatch, getState, db }) => {
      const resultList = await db.resultList()
      dispatch({
        type: "someActionResolve",
        payload: resultList
      })
      await dispatch(action2())
      await dispatch(action3())
      return resultList
    }
  }
  const action2 = () => ({
    'BAQEND': async ({ dispatch, getState, db }) => {
      const resultList = await db.resultList()
      dispatch({
        type: "someActionResolve2",
        payload: resultList
      })
    }
  })
  const action3 = () => ({
    'BAQEND': {
      type: "someActionResolve3",
      payload: (db) => db.resultList()
    }
  })

  test('it should pass the action to next method after processing', async () => {
    const nextHandlerCall = jest.fn()
    const nextHandler = (action) => {
      nextHandlerCall()
    }
    const thunkNextHandlerCall = jest.fn()
    const thunkNextHandler = (action) => {
      thunkNextHandlerCall()
      if (thunkNextHandlerCall.mock.calls.length === 1) {
        expect(action).toEqual({
          type: "someActionResolve",
          payload: baqendList
        })
      } else if (thunkNextHandlerCall.mock.calls.length === 2) {
        expect(action).toEqual({
          type: "someActionResolve3",
          payload: baqendList
        })
      }
      return action
    }
    const thunkDispatchNextHandlerCall = jest.fn()
    const thunkDispatchNextHandler = (action) => {
      thunkDispatchNextHandlerCall()
      if (thunkDispatchNextHandlerCall.mock.calls.length === 1) {
        expect(action).toEqual({
          type: "someActionResolve2",
          payload: baqendList
        })
      }
      return action
    }
    const dispatch = createMiddleware(nextHandler, thunkNextHandler, thunkDispatchNextHandler)
    const dispatched = await dispatch(action)
    expect(dispatched).toEqual(baqendList)
    expect(nextHandlerCall).toHaveBeenCalledTimes(0)
    expect(thunkNextHandlerCall).toHaveBeenCalledTimes(2)
    expect(thunkDispatchNextHandlerCall).toHaveBeenCalledTimes(1)
  })
})
