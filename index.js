// state
// dispatch
// reducer

class Store {
    constructor(initialState, reducer) {
        this.state = initialState
        this.listeners = []
        this.reducer = reducer
    }

    subscribe(listener) {
        this.listeners.push(listener)
    }

    dispatch(action) {
        this.state = this.reducer(this.state, action)

        this.listeners.forEach(listener => listener(this.state))
    }
}
// action -> 
// {
//     type: '',
//     payload: 
// }
// function appReducer(state, action) {
//     switch (action.type) {
//         case 'CHANGE_PRICE':
//             return {
//                 ...state,
//                 price: action.payload
//             }
//         case 'ADD_ITEM':
//             return {
//                 ...state,
//                 items: [...state.items, createItem(action.payload)]
//             }
//         case 'REMOVE_ITEM': 
//             return {
//                 ...state,
//                 items: state.items.filter(item => item.id !== +action.payload)
//             }
//         case 'PLUS_TO_TOTAL':
//             return {
//                 ...state,
//                 total: state.total + (+action.payload)
//             }
//         case 'MINUS_TO_TOTAL':
//             return {
//                 ...state,
//                 total: state.total - action.payload
//             }
//         default:
//             return state
//     }
// }

function combineReducers(reducers) {
    return function(state, action) {
        let newState = state

        for (const key in reducers) {
            if (reducers.hasOwnProperty(key)) {
                const stateChunk = state[key]
                const reducer = reducers[key]
                
                const newStateChunk = reducer(stateChunk, action)

                if(stateChunk !== newStateChunk) {
                    newState = {
                        ...newState,
                        [key]: newStateChunk
                    }
                }
            }
        }

        return newState
    }
}

const appReducer = combineReducers({
    price: priceReducer,
    items: itemsReducer,
    total: totalReducer
})

function priceReducer(state, action) {
    switch (action.type) {
        case 'CHANGE_PRICE':
            return action.payload
        default:
            return state
    }
}

function itemsReducer(state, action) {
    switch (action.type) {
        case 'ADD_ITEM':
            return [...state, createItem(action.payload)]
        case 'REMOVE_ITEM': 
            return state.filter(item => item.id !== +action.payload)
        default:
            return state
    }
}

function totalReducer(state, action) {
    switch (action.type) {
        case 'PLUS_TO_TOTAL':
            return state + (+action.payload)
        case 'MINUS_TO_TOTAL':
            return state - action.payload
        default:
            return state
    }
}


let idCounter = 0
function createItem(value) {
    const newItem = {
        value: value,
        id: idCounter
    }
    idCounter++
    return newItem
}

const appStore = new Store({
    price: 0,
    items: [],
    total: 0
}, appReducer)

appStore.subscribe(render)

function render(state) {
    document.body.innerHTML = `
        <input type="number" value="${state.price}"></input>
        <ul>
            ${state.items.map(renderItem).join('')}
        </ul>
        <div>Total <strong>${state.total}<strong></div>
    `
}

function renderItem(item) {
    return `
        <li>
            <span>${item.value}</span>
            <button data-id="${item.id}" data-value="${item.value}" class="remove-button">Remove item</button>
        </li>`
}

render(appStore.state)

document.body.addEventListener('keypress', (e) => {
    if(e.keyCode === 13) {
        appStore.dispatch({
            type: 'ADD_ITEM',
            payload: e.target.value
        })

        appStore.dispatch({
            type: 'PLUS_TO_TOTAL',
            payload: e.target.value
        })

        appStore.dispatch({
            type: 'CHANGE_PRICE',
            payload: 0
        })

        return
    }

    appStore.dispatch({
        type: 'CHANGE_PRICE',
        payload: e.target.value + e.key
    })

    setTimeout(() => document.body.querySelector('input').focus(), 0)
})

document.body.addEventListener('click', (e) => {
    if(e.target.classList.contains('remove-button')) {
        appStore.dispatch({
            type: 'REMOVE_ITEM',
            payload: e.target.dataset.id
        })

        appStore.dispatch({
            type: 'MINUS_TO_TOTAL',
            payload: e.target.dataset.value
        })
    }
})