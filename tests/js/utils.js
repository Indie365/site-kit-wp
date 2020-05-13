/**
 * External dependencies
 */
import { castArray } from 'lodash';

/**
 * WordPress dependencies
 */
import { createRegistry, RegistryProvider } from '@wordpress/data';

/**
 * Internal dependencies
 */
import modulesStore, { STORE_NAME as modulesStoreName } from '../../assets/js/googlesitekit/modules/datastore';
import siteStore, { STORE_NAME as siteStoreName } from '../../assets/js/googlesitekit/datastore/site';
import userStore, { STORE_NAME as userStoreName } from '../../assets/js/googlesitekit/datastore/user';
import formsStore, { STORE_NAME as formsStoreName } from '../../assets/js/googlesitekit/datastore/forms';
import modulesAnalyticsStore, { STORE_NAME as modulesAnalyticsStoreName } from '../../assets/js/modules/analytics/datastore';
import modulesSearchConsoleStore, { STORE_NAME as modulesSearchConsoleStoreName } from '../../assets/js/modules/search-console/datastore';

/**
 * Create a registry with all available stores.
 *
 * @since 1.5.0
 *
 * @return {wp.data.registry} Registry with all available stores registered.
 */
export const createTestRegistry = () => {
	const registry = createRegistry();

	registerAllStoresOn( registry );

	return registry;
};

/**
 * Wraps children components with a fresh test registry,
 * which can be configured by its callback prop.
 *
 * @since 1.7.1
 *
 * @param {?Object}   props          Component props.
 * @param {?Function} props.callback Function which receives the registry instance.
 * @param {?Object}   props.registry Registry object; uses `createTestRegistry()` by default.
 * @return {WPElement} Wrapped components.
 */
export function WithTestRegistry( { children, callback, registry = createTestRegistry() } = {} ) {
	if ( callback ) {
		callback( registry );
	}

	return (
		<RegistryProvider value={ registry }>
			{ children }
		</RegistryProvider>
	);
}

/**
 * Mute a given console during tests.
 *
 * Use this to mute expect console output during tests for things like
 * API fetch errors or other things you expect to log to console but don't
 * want appearing in the jest output.
 *
 * @since 1.5.0
 *
 * @param {string} type  Type of console to mute (one of: `'error'`, `'warn'`, `'log'`, `'info'`, or `'debug'`)
 * @param {number} times Number of times to mute console output perform resuming.
 */
export const muteConsole = ( type = 'error', times = 1 ) => {
	Array.from( { length: times } ).forEach( () => {
		global.console[ type ].mockImplementationOnce( () => jest.fn() );
	} );
};

/**
 * Register all Site Kit stores on a registry.
 *
 * Use this to register every available Site Kit store on a registry.
 * Useful for testing, when you want to ensure that every registry is
 * available for connected components and data store tests to use.
 *
 * @since 1.5.0
 *
 * @param {wp.data.registry} registry Registry to register each store on.
 */
export const registerAllStoresOn = ( registry ) => {
	registry.registerStore( modulesStoreName, modulesStore );
	registry.registerStore( siteStoreName, siteStore );
	registry.registerStore( userStoreName, userStore );
	registry.registerStore( formsStoreName, formsStore );
	registry.registerStore( modulesAnalyticsStoreName, modulesAnalyticsStore );
	registry.registerStore( modulesSearchConsoleStoreName, modulesSearchConsoleStore );
};

const unsubscribes = [];
export const subscribeWithUnsubscribe = ( registry, ...args ) => {
	const unsubscribe = registry.subscribe( ...args );
	unsubscribes.push( unsubscribe );
	return unsubscribe;
};

export const subscribeUntil = ( registry, predicates ) => {
	predicates = castArray( predicates );

	return new Promise( ( resolve ) => {
		subscribeWithUnsubscribe( registry, () => {
			if ( predicates.every( ( predicate ) => predicate() ) ) {
				resolve();
			}
		} );
	} );
};

export const unsubscribeFromAll = () => {
	let unsubscribe;
	while ( ( unsubscribe = unsubscribes.shift() ) ) {
		unsubscribe();
	}
};

/**
 * Return a rejection.
 *
 * Used to ensure that a test will fail if it reaches this point.
 * Useful for asynchronous code that has multiple code paths, eg:
 *
 * ```js
 * try {
 *   await codeThatThrowsAnError();
 *   return unexpectedSuccess();
 * } catch (err) {
 *   expect(err.message).toEqual('Some error.');
 * }
 * ```
 *
 * Use this to ensure that the unintended path throws an error rather than
 * silently succeed.
 *
 * @since 1.5.0
 *
 * @return {Promise} A rejected promise.
 */
export const unexpectedSuccess = () => {
	return Promise.reject( new Error(
		'Some code (likely a Promise) succeeded unexpectedly; check your test.'
	) );
};
