const initalState = {
  connecting: false,
  connected: false
};

function baqendReducer(state = initalState, action = {}) {
  switch (action.type) {
    case 'BAQEND_CONNECTING':
      return { ...state, connecting: true }
    case 'BAQEND_CONNECTED':
      return { ...state, connecting: false, connected: true}
    default:
      return state
  }
}

export default baqendReducer;
