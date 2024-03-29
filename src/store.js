import { compose, createStore, applyMiddleware } from "redux";
import rootReducer from "./reducers/index";
import createSagaMiddleware, { END } from "redux-saga";
import { routerMiddleware } from "connected-react-router";
import rootSaga from "./sagas/index";
import { createBrowserHistory } from "history";

export const history = createBrowserHistory();
const sagaMiddleware = createSagaMiddleware();

const configureStore = (initialState = {}) => {
	const composeEnhancers =
		process.env.NODE_ENV !== "production" &&
		typeof window === "object" &&
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
			? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
					shouldHotReload: false
			  })
			: compose;

	const middlewares = [sagaMiddleware];
	const enhancers = [applyMiddleware(...middlewares, routerMiddleware(history))];

	const store = createStore(rootReducer(history), composeEnhancers(...enhancers));
	store.runSaga = sagaMiddleware.run;
	store.runSaga(rootSaga);

	store.asyncReducers = {};
	store.close = () => store.dispatch(END);

	if (module.hot) {
		module.hot.accept("./reducers", reducerModule => {
			const createReducers = reducerModule.default;
			const nextReducers = createReducers(store.asyncReducers);
			store.replaceReducer(nextReducers);
		});
	}

	return store;
};

export default configureStore;
