import createBaqendMiddleware from '../src/middleware/createMiddleware'
import { baqendObject, baqendList, db } from './util/helpers'

let baqendMiddleware, doGetState, next, doDispatch, nextHandler

beforeAll(() => {
  baqendMiddleware = createBaqendMiddleware(db)
})


describe('baqend middleware', () => {
  beforeAll(() => {
    doGetState = () => {}
    doDispatch = (action) => action
    nextHandler = baqendMiddleware({ dispatch: doDispatch, getState: doGetState })
  })

  test('must return a function to handle next', () => {
    expect(nextHandler).toBeInstanceOf(Function)
  })

  describe('handle normal action', () => {
    test('must pass action to next if not a BAQEND action', () => {
      const action = {
        type: "someAction"
      }
      const dispatch = nextHandler(nextAction => {
        expect(nextAction).toBe(action)
      })
      dispatch(action)
    })
  })

  describe('handle actions dispatched by middleware', () => {
    test('must serialize baqend objects wrapped by BAQEND or BAQEND_DISPATCH keyword', async () => {
      const actionInner = {
        type: "someAction",
        payload: { id: "someId" }
      }
      const action1 = {
        'BAQEND': actionInner
      }
      const action2 = {
        'BAQEND_DISPATCH': actionInner
      }
      const action3 = {
        'BAQEND_DISPATCH': {
          'BAQEND': actionInner
        }
      }
      const dispatch = nextHandler(action => action)
      await expect(dispatch(action1)).resolves.toEqual(actionInner)
      await expect(dispatch(action2)).resolves.toEqual(actionInner)
      await expect(dispatch(action3)).resolves.toEqual(actionInner)
    })
  })
})
