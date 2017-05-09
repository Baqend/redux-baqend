## Redux Baqend Middleware

### Installation
```
$ npm install redux-baqend --save
```
To use it add the `baqendMiddleware` and the `baqendConnect` enhancer to your redux store. You can add the optional `baqendReducer` as well if you like. Here is an example setup.

#### store.js
```js
import { baqendReducer, baqendMiddleware, baqendConnect } from 'redux-baqend'
import middlewares from '../middleware'
import reducers from '../reducers'


export default function configureStore(initialState = {}) {
  const reducer = combineReducers({
    baqend: baqendReducer,
    ...reducers
  })
  const middleware = applyMiddleware(
    baqendMiddleware,
    ...middlewares
  )
  const enhancers = compose(
    baqendConnect,
    middleware
  )
  return createStore(reducer, initialState, enhancers)
}
```

#### app.js
```js
const store = configureStore();
store.connect('app-starter');

```

### Basic usage
In React/Redux you should mostly work with serializable objects. Therefore you should convert the baqend objects to json before you pass them to your redux store and get and update your reference to the baqend object by using the `fromJSON` method coming with the js-sdk. You can either convert the objects manually or let the middleware do it automatically. Inside the payload methods of your actions you can work with baqend like you used to do.

A minimal baqend action:

```js
{
  'BAQEND': {
    type: 'ITEMS_LOAD',
    payload: (db) => db.Items.find().resultList()
  }
}
```
When receiving this kind of action, `baqendMiddleware` will do the following:

1. Wait for the db to be ready and connected to baqend
2. Pass the db object to the payload method defined in your action and execute it
3. Next the middleware will take the result of you query and check if it´s in json format already. If not it will take care of converting it to json and dispatch the following action and pass it to the next middleware

    ```js
    {
      type: 'ITEMS_LOAD',
      payload: [
        { id: '/db/Item/1', value: 'value' },
        { id: '/db/Item/2', value: 'value' }
      ]
    }
    ```

### Converting the Objects
The object are converted to jsons by the middleware before passing the them to the reducers. If you want to update an item from within your application you have to make a baqend object out of your updated json to be able to save it. By
default they use a depth of 0, but you can pass in options to the actions with another depth.

```js
let options = { depth: 1 }

return {
  'BAQEND': {
    type: 'ITEMS_LOAD',
    options: options,
    payload: (db) => {
      return db.Items.find().resultList(options)
    }
  }
}

// update object
return {
  'BAQEND': {
    type: 'ITEMS_LOAD',
    options: options,
    payload: [ item, (db, item) => {
      item.save(options)
    }]
  }
}
```

or doing it manually

```js
return {
  'BAQEND': {
    type: 'ITEMS_LOAD',
    payload: (db) => {
      return db.Message.find().resultList({ depth: 1 }).then(results => {
        return results.map(item => item.toJSON({ depth: 1 }))
      })
    }
  }
}

// update object
return {
  'BAQEND': {
    type: 'ITEMS_LOAD',
    payload: (db) => {
      item = db.Item.fromJSON(item)
      return item.save({ depth: 1 }).then(item => {
        return item.toJSON({ depth: 1 })
      })
    }
  }
}
```

### Dispatching multiple actions
Adding an types array will dispatch multiple actions for the initiation, the success and for the error of an dispatched action.

```js
export function itemLoad(args) {
  return {
    'BAQEND': {
      types: [
        'ITEMS_LOAD_PENDING',
        'ITEMS_LOAD_SUCCESS',
        'ITEMS_LOAD_ERROR'
      ],
      payload: (db) => {
        return db.Message.find().resultList()
      }
    }
  }
}
```

### Additional Fields
You can add additional fields to the dispatched actions by making objects out of the elements in the types array and add new properties to the result. You can either simply add a new property to the type or edit the payload response of the original payload method

```js
export function itemLoad(params) {
  return {
    'BAQEND': {
      types: [
        {
          type: 'ITEMS_LOAD_PENDING',
          params: params
        },
        {
          type: 'ITEMS_LOAD_SUCCESS',
          payload: (items) => ({
            items: items,
            params: params
          })
        },
        'ITEMS_LOAD_ERROR'
      ],
      payload: (db) => {
        return db.Message.find().resultList()
      }
    }
  }
}
```
