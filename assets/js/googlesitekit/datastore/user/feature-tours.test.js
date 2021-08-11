/**
 * `core/user` data store: feature tours tests.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Internal dependencies
 */
import {
	createTestRegistry,
	muteFetch,
	untilResolved,
} from '../../../../../tests/js/utils';
import * as CacheModule from '../../../googlesitekit/api/cache';
import { CORE_USER } from './constants';
import {
	initialState,
	FEATURE_TOUR_COOLDOWN_SECONDS,
	FEATURE_TOUR_LAST_DISMISSED_AT,
} from './feature-tours';
const { setItem } = CacheModule;

describe( 'core/user feature-tours', () => {
	let registry;
	let store;
	let setItemSpy;

	const testTourA = {
		slug: 'test-tour-a',
		version: '2.0.0',
		contexts: [ 'common-context' ],
		steps: [
			{
				title: 'Test Tour A - Step 1 Title',
				content: 'Test Tour A - Step 1 Content',
				target: 'test-tour-a-step-1-target',
			},
		],
	};
	const testTourB = {
		slug: 'test-tour-b',
		version: '2.1.0',
		contexts: [ 'common-context', 'b-only-context' ],
		steps: [
			{
				title: 'Test Tour B - Step 1 Title',
				content: 'Test Tour B - Step 1 Content',
				target: 'test-tour-b-step-1-target',
			},
		],
	};

	beforeEach( () => {
		setItemSpy = jest.spyOn( CacheModule, 'setItem' );
		registry = createTestRegistry();
		store = registry.stores[ CORE_USER ].store;
		registry.dispatch( CORE_USER ).receiveInitialSiteKitVersion( '1.0.0' );
	} );

	afterEach( () => {
		setItemSpy.mockRestore();
	} );

	describe( 'actions', () => {
		describe( 'dismissTour', () => {
			const fetchDismissTourRegExp = /^\/google-site-kit\/v1\/core\/user\/data\/dismiss-tour/;

			it( 'requires a slug parameter', () => {
				expect( () =>
					registry.dispatch( CORE_USER ).dismissTour()
				).toThrow( /a tour slug is required/i );
			} );

			it( 'adds the slug to dismissedTourSlugs immediately', () => {
				muteFetch( fetchDismissTourRegExp, [] );

				expect( store.getState().dismissedTourSlugs ).toBe(
					initialState.dismissedTourSlugs
				);
				expect(
					store.getState().dismissedTourSlugs || []
				).not.toContain( 'test-tour' );

				registry.dispatch( CORE_USER ).dismissTour( 'test-tour' );

				expect( store.getState().dismissedTourSlugs ).toContain(
					'test-tour'
				);
			} );

			it( 'dispatches a fetch request to persist the dismissal', async () => {
				muteFetch( fetchDismissTourRegExp, [] );

				await registry.dispatch( CORE_USER ).dismissTour( 'test-tour' );

				expect( fetchMock ).toHaveFetched( fetchDismissTourRegExp );
			} );

			it( 'receives all dismissed tours as the new state from the server', async () => {
				fetchMock.postOnce( fetchDismissTourRegExp, {
					body: [ 'tour-a', 'tour-b' ],
				} );

				await registry.dispatch( CORE_USER ).dismissTour( 'tour-b' );

				expect( store.getState().dismissedTourSlugs ).toEqual(
					expect.arrayContaining( [ 'tour-a', 'tour-b' ] )
				);
			} );

			it( 'sets the lastDismissedAt timestamp to mark the start of the cooldown period', async () => {
				muteFetch( fetchDismissTourRegExp, [] );

				await registry.dispatch( CORE_USER ).dismissTour( 'test-tour' );

				expect( store.getState().lastDismissedAt ).toBeDefined();
				// cache should have been set as well
				expect( setItemSpy ).toHaveBeenCalledWith(
					FEATURE_TOUR_LAST_DISMISSED_AT,
					expect.any( Number ), // timestamp
					expect.objectContaining( {
						ttl: FEATURE_TOUR_COOLDOWN_SECONDS,
					} )
				);
			} );
		} );

		describe( 'receiveAllFeatureTours', () => {
			it( 'requires tours to be an array', () => {
				expect( () =>
					registry.dispatch( CORE_USER ).receiveAllFeatureTours()
				).toThrow( 'tours must be an array' );
			} );

			it( 'receives the given tours into the state', () => {
				const tours = [ testTourA, testTourB ];
				registry.dispatch( CORE_USER ).receiveAllFeatureTours( tours );
				expect( store.getState().tours ).toEqual( tours );
			} );
		} );

		describe( 'receiveFeatureToursForView', () => {
			it( 'requires viewTours to be an array', () => {
				expect( () =>
					registry.dispatch( CORE_USER ).receiveFeatureToursForView()
				).toThrow( 'viewTours must be an array' );
			} );

			it( 'requires a viewContext to be provided for the viewTours', () => {
				expect( () =>
					registry
						.dispatch( CORE_USER )
						.receiveFeatureToursForView( [] )
				).toThrow( 'viewContext is required' );
			} );

			it( 'receives the given viewTours into the state for the viewContext', () => {
				const tours = [ testTourA, testTourB ];
				registry
					.dispatch( CORE_USER )
					.receiveFeatureToursForView( tours, {
						viewContext: 'foo',
					} );
				expect( store.getState().viewTours.foo ).toEqual( tours );
			} );
		} );

		describe( 'receiveLastDismissedAt', () => {
			it( 'requires a timestamp to be provided', () => {
				expect( () =>
					registry.dispatch( CORE_USER ).receiveLastDismissedAt()
				).toThrow( 'A timestamp is required.' );
			} );

			it( 'sets the lastDismissedAt timestamp in the store', () => {
				const timestamp = Date.now();
				registry
					.dispatch( CORE_USER )
					.receiveLastDismissedAt( timestamp );
				expect( store.getState().lastDismissedAt ).toEqual( timestamp );
			} );
		} );

		describe( 'setLastDismissedAt', () => {
			it( 'requires a timestamp to be provided', () => {
				expect( () =>
					registry.dispatch( CORE_USER ).receiveLastDismissedAt()
				).toThrow( 'A timestamp is required.' );
			} );

			it( 'sets the lastDismissedAt timestamp in the store', async () => {
				const timestamp = Date.now();
				await registry
					.dispatch( CORE_USER )
					.setLastDismissedAt( timestamp );
				expect( store.getState().lastDismissedAt ).toEqual( timestamp );
			} );

			it( 'sets the lastDismissedAt timestamp in the cache', async () => {
				const timestamp = Date.now();

				await registry
					.dispatch( CORE_USER )
					.setLastDismissedAt( timestamp );

				expect( setItemSpy ).toHaveBeenCalledWith(
					FEATURE_TOUR_LAST_DISMISSED_AT,
					timestamp,
					expect.objectContaining( {
						ttl: FEATURE_TOUR_COOLDOWN_SECONDS,
					} )
				);
			} );
		} );
	} );

	describe( 'selectors', () => {
		const fetchGetDismissedToursRegExp = /^\/google-site-kit\/v1\/core\/user\/data\/dismissed-tours/;

		describe( 'getDismissedFeatureTourSlugs', () => {
			it( 'returns the initial state before the resolver runs', async () => {
				muteFetch( fetchGetDismissedToursRegExp, [] );

				expect(
					registry.select( CORE_USER ).getDismissedFeatureTourSlugs()
				).toBe( initialState.dismissedTourSlugs );

				await untilResolved(
					registry,
					CORE_USER
				).getDismissedFeatureTourSlugs();
			} );

			it( 'receives dismissed tours from the fetch dispatched by the resolver', async () => {
				fetchMock.getOnce( fetchGetDismissedToursRegExp, {
					body: [ 'feature-x' ],
				} );

				registry.select( CORE_USER ).getDismissedFeatureTourSlugs();

				await untilResolved(
					registry,
					CORE_USER
				).getDismissedFeatureTourSlugs();

				expect(
					registry.select( CORE_USER ).getDismissedFeatureTourSlugs()
				).toEqual( [ 'feature-x' ] );
				expect( fetchMock ).toHaveFetched();
			} );

			it( 'does not fetch if there are already dismissed tours in state', () => {
				registry.dispatch( CORE_USER ).receiveGetDismissedTours( [] );

				registry.select( CORE_USER ).getDismissedFeatureTourSlugs();

				expect( fetchMock ).not.toHaveFetched();
			} );

			it( 'returns the list of dismissed tours', () => {
				registry.dispatch( CORE_USER ).receiveGetDismissedTours( [] );

				expect(
					registry.select( CORE_USER ).getDismissedFeatureTourSlugs()
				).toEqual( [] );

				registry
					.dispatch( CORE_USER )
					.receiveGetDismissedTours( [ 'tour-a', 'feature-x' ] );

				expect(
					registry.select( CORE_USER ).getDismissedFeatureTourSlugs()
				).toEqual(
					expect.arrayContaining( [ 'feature-x', 'tour-a' ] )
				);
			} );
		} );

		describe( 'getFeatureToursForView', () => {
			beforeEach( () => {
				registry.dispatch( CORE_USER ).receiveGetDismissedTours( [] );
			} );

			it( 'returns `undefined` while tour readiness is being resolved', () => {
				expect(
					registry
						.select( CORE_USER )
						.getFeatureToursForView( 'test-view-context' )
				).toBeUndefined();
			} );

			it( 'returns an array of tours that qualify for the given view context', async () => {
				registry
					.dispatch( CORE_USER )
					.receiveAllFeatureTours( [ testTourA, testTourB ] );

				expect(
					await registry
						.resolveSelect( CORE_USER )
						.getFeatureToursForView( 'common-context' )
				).toEqual( [ testTourA, testTourB ] );

				expect(
					await registry
						.resolveSelect( CORE_USER )
						.getFeatureToursForView( 'b-only-context' )
				).toEqual( [ testTourB ] );
			} );

			it( 'returns an array of tours that have a version greater than the user’s initial Site Kit version', async () => {
				const initialVersion = '1.0.0';
				const tourVersion = '2.0.0';
				registry
					.dispatch( CORE_USER )
					.receiveInitialSiteKitVersion( initialVersion );
				registry.dispatch( CORE_USER ).receiveAllFeatureTours( [
					{ ...testTourA, version: initialVersion },
					{ ...testTourB, version: tourVersion },
				] );
				// Tour A's version matches the user's initial version, so only Tour B is returned.
				const viewTours = await registry
					.resolveSelect( CORE_USER )
					.getFeatureToursForView( 'common-context' );
				expect( viewTours.map( ( { slug } ) => slug ) ).toEqual( [
					testTourB.slug,
				] );
			} );

			it( 'returns an array of tours that have not been dismissed by the user yet', async () => {
				registry
					.dispatch( CORE_USER )
					.receiveAllFeatureTours( [ testTourA, testTourB ] );
				registry
					.dispatch( CORE_USER )
					.receiveGetDismissedTours( [ testTourB.slug ] );
				// Tour B was received as dismissed, but A was not.
				expect(
					await registry
						.resolveSelect( CORE_USER )
						.getFeatureToursForView( 'common-context' )
				).toEqual( [ testTourA ] );
			} );

			it( 'returns an array of tours that use their own logic for checking additional requirements', async () => {
				// Check A will resolve with `true` on the next tick.
				const checkA = jest.fn(
					async () =>
						new Promise( ( resolve ) =>
							setTimeout( resolve( true ) )
						)
				);
				// Check B will resolve with `false` on the next tick.
				const checkB = jest.fn(
					async () =>
						new Promise( ( resolve ) =>
							setTimeout( resolve( false ) )
						)
				);
				registry.dispatch( CORE_USER ).receiveAllFeatureTours( [
					{ ...testTourA, checkRequirements: checkA },
					{ ...testTourB, checkRequirements: checkB },
				] );

				const viewTours = await registry
					.resolveSelect( CORE_USER )
					.getFeatureToursForView( 'common-context' );
				expect( viewTours.map( ( { slug } ) => slug ) ).toEqual( [
					testTourA.slug,
				] );
				// Check functions should be called with the registry as the first parameter.
				const registryMatcher = expect.objectContaining( {
					select: expect.any( Function ),
					dispatch: expect.any( Function ),
				} );
				// The registry instance passed to the function is slightly different for some reason
				// so we can't simply call `.toHaveBeenCalledWith( registry )`
				expect( checkA ).toHaveBeenCalledWith( registryMatcher );
				expect( checkB ).toHaveBeenCalledWith( registryMatcher );
			} );
		} );

		describe( 'getAllFeatureTours', () => {
			it( 'returns all tours in the store', () => {
				const tours = [ testTourA, testTourB ];
				registry.dispatch( CORE_USER ).receiveAllFeatureTours( tours );

				expect(
					registry.select( CORE_USER ).getAllFeatureTours()
				).toEqual( tours );
			} );
		} );

		describe( 'isTourDismissed', () => {
			it( 'returns `true` if the given slug is in the current list of dismissed tours', () => {
				registry.dispatch( CORE_USER ).receiveGetDismissedTours( [] );

				expect(
					registry.select( CORE_USER ).isTourDismissed( 'feature-x' )
				).toBe( false );

				registry
					.dispatch( CORE_USER )
					.receiveGetDismissedTours( [ 'feature-x', 'tour-y' ] );

				expect(
					registry.select( CORE_USER ).isTourDismissed( 'feature-x' )
				).toBe( true );
			} );

			it( 'will trigger the resolver for getDismissedFeatureTourSlugs and fetch if necessary', async () => {
				muteFetch( fetchGetDismissedToursRegExp );

				registry.select( CORE_USER ).isTourDismissed( 'feature-x' );

				await untilResolved(
					registry,
					CORE_USER
				).getDismissedFeatureTourSlugs();
				expect( fetchMock ).toHaveFetched(
					fetchGetDismissedToursRegExp
				);
			} );

			it( 'returns `undefined` if dismissed tours are not resolved yet', async () => {
				// The request will respond that `feature-x` _is dismissed_
				// but the selector will return `false` until the response is received.
				fetchMock.getOnce( fetchGetDismissedToursRegExp, {
					body: [ 'feature-x' ],
				} );
				expect(
					registry.select( CORE_USER ).isTourDismissed( 'feature-x' )
				).toBeUndefined();

				await untilResolved(
					registry,
					CORE_USER
				).getDismissedFeatureTourSlugs();
			} );
		} );

		describe( 'getLastDismissedAt', () => {
			// Note: storage is cleared before every test in the global config.

			it( 'returns initial state (undefined) if there is no lastDismissedAt timestamp', () => {
				const lastDismissedAt = registry
					.select( CORE_USER )
					.getLastDismissedAt();
				expect( lastDismissedAt ).toEqual( undefined );
			} );

			it( 'returns the lastDismissedAt timestamp if there is one', () => {
				const timestamp = Date.now();
				registry
					.dispatch( CORE_USER )
					.receiveLastDismissedAt( timestamp );
				expect(
					registry.select( CORE_USER ).getLastDismissedAt()
				).toEqual( timestamp );
			} );

			it( 'uses a resolver to set lastDismissedAt in the store if there is a value in the cache', async () => {
				const timestamp = Date.now();
				await setItem( FEATURE_TOUR_LAST_DISMISSED_AT, timestamp );

				registry.select( CORE_USER ).getLastDismissedAt();
				await untilResolved( registry, CORE_USER ).getLastDismissedAt();

				expect(
					registry.select( CORE_USER ).getLastDismissedAt()
				).toBe( timestamp );
			} );

			it( 'returns false for an expired lastDismissedAt value in the cache', async () => {
				const timestamp = Date.now();
				// Set an item that is guaranteed to be expired when called with `getItem`
				await setItem( FEATURE_TOUR_LAST_DISMISSED_AT, timestamp, {
					ttl: -1,
				} );

				registry.select( CORE_USER ).getLastDismissedAt();
				await untilResolved( registry, CORE_USER ).getLastDismissedAt();

				expect(
					registry.select( CORE_USER ).getLastDismissedAt()
				).toBe( null );
			} );
		} );

		describe( 'areFeatureToursOnCooldown', () => {
			it( 'returns undefined if there is no lastDismissedAt timestamp', () => {
				expect(
					registry.select( CORE_USER ).areFeatureToursOnCooldown()
				).toBeUndefined();
			} );

			it( 'returns true if the lastDismissedAt timestamp is within the feature tour cooldown period', () => {
				const timestamp = Date.now();
				const coolDownPeriodMilliseconds =
					FEATURE_TOUR_COOLDOWN_SECONDS * 1000;
				const justInsideCoolDownPeriod =
					timestamp + coolDownPeriodMilliseconds - 1000;

				registry
					.dispatch( CORE_USER )
					.receiveLastDismissedAt( justInsideCoolDownPeriod );

				expect(
					registry.select( CORE_USER ).areFeatureToursOnCooldown()
				).toEqual( true );
			} );

			it( 'returns false if the feature tour cooldown period has expired', () => {
				const coolDownPeriodMilliseconds =
					FEATURE_TOUR_COOLDOWN_SECONDS * 1000;
				const startOfCoolDownPeriod =
					Date.now() - coolDownPeriodMilliseconds;

				registry
					.dispatch( CORE_USER )
					.receiveLastDismissedAt( startOfCoolDownPeriod );

				expect(
					registry.select( CORE_USER ).areFeatureToursOnCooldown()
				).toEqual( false );
			} );

			it( 'returns false for an expired lastDismissedAt value in the cache', async () => {
				registry.dispatch( CORE_USER ).receiveLastDismissedAt( null );

				expect(
					registry.select( CORE_USER ).areFeatureToursOnCooldown()
				).toEqual( false );
			} );
		} );
	} );
} );
