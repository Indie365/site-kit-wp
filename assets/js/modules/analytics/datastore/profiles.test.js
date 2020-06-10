/**
 * modules/analytics data store: profiles tests.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
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
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import API from 'googlesitekit-api';
import { STORE_NAME } from './constants';
import {
	createTestRegistry,
	muteConsole,
	subscribeUntil,
	unsubscribeFromAll,
} from 'tests/js/utils';
import * as fixtures from './__fixtures__';

describe( 'modules/analytics profiles', () => {
	let apiFetchSpy;
	let registry;

	beforeAll( () => {
		API.setUsingCache( false );
	} );

	beforeEach( () => {
		registry = createTestRegistry();

		apiFetchSpy = jest.spyOn( { apiFetch }, 'apiFetch' );
		// Receive empty settings to prevent unexpected fetch by resolver.
		registry.dispatch( STORE_NAME ).receiveGetSettings( {} );
	} );

	afterAll( () => {
		API.setUsingCache( true );
	} );

	afterEach( () => {
		unsubscribeFromAll( registry );
		apiFetchSpy.mockRestore();
	} );

	describe( 'actions', () => {
		describe( 'createProfile', () => {
			it( 'creates a profile and adds it to the store ', async () => {
				const accountID = fixtures.createProfile.accountId; // Capitalization rule exception: `accountId` is a property of an API returned value.
				const propertyID = fixtures.createProfile.webPropertyId; // Capitalization rule exception: `webPropertyId` is a property of an API returned value.

				fetch
					.doMockIf(
						/^\/google-site-kit\/v1\/modules\/analytics\/data\/create-profile/
					)
					.mockResponse(
						JSON.stringify( fixtures.createProfile ),
						{ status: 200 }
					);

				registry.dispatch( STORE_NAME ).createProfile( propertyID );

				// Ensure the proper body parameters were sent.
				expect( JSON.parse( fetch.mock.calls[ 0 ][ 1 ].body ).data ).toMatchObject(
					{
						accountID,
						propertyID,
					}
				);

				await subscribeUntil( registry,
					() => (
						registry.select( STORE_NAME ).getProfiles( propertyID )
					),
				);

				const profiles = registry.select( STORE_NAME ).getProfiles( propertyID );
				expect( profiles ).toMatchObject( [ fixtures.createProfile ] );
			} );

			it( 'sets isDoingCreateProfile ', async () => {
				const propertyID = fixtures.createProfile.webPropertyId; // Capitalization rule exception: `webPropertyId` is a property of an API returned value.

				fetch
					.doMockIf(
						/^\/google-site-kit\/v1\/modules\/analytics\/data\/create-profile/
					)
					.mockResponse(
						JSON.stringify( fixtures.createProfile ),
						{ status: 200 }
					);

				registry.dispatch( STORE_NAME ).createProfile( propertyID );
				expect( registry.select( STORE_NAME ).isDoingCreateProfile( propertyID ) ).toEqual( true );
			} );

			it( 'dispatches an error if the request fails ', async () => {
				const accountID = fixtures.createProfile.accountId; // Capitalization rule exception: `accountId` is a property of an API returned value.
				const propertyID = fixtures.createProfile.webPropertyId; // Capitalization rule exception: `webPropertyId` is a property of an API returned value.

				const response = {
					code: 'internal_server_error',
					message: 'Internal server error',
					data: { status: 500 },
				};

				fetch
					.doMockIf(
						/^\/google-site-kit\/v1\/modules\/analytics\/data\/create-profile/
					)
					.mockResponse(
						JSON.stringify( response ),
						{ status: 500 }
					);

				muteConsole( 'error' );
				registry.dispatch( STORE_NAME ).createProfile( propertyID );

				await subscribeUntil( registry,
					() => (
						registry.select( STORE_NAME ).getError()
					),
				);

				expect( registry.select( STORE_NAME ).getError() ).toMatchObject( response );

				// Ignore the request fired by the `getProperties` selector.
				fetch
					.doMockIf(
						/^\/google-site-kit\/v1\/modules\/analytics\/data\/properties-profiles/
					)
					.mockResponse( JSON.stringify( {} ) );

				const properties = registry.select( STORE_NAME ).getProperties( accountID );

				// No properties should have been added yet, as the property creation failed.
				expect( properties ).toEqual( undefined );
			} );
		} );
	} );

	describe( 'selectors', () => {
		describe( 'getProfiles', () => {
			it( 'uses a resolver to make a network request', async () => {
				fetch
					.doMockOnceIf(
						/^\/google-site-kit\/v1\/modules\/analytics\/data\/profiles/
					)
					.mockResponseOnce(
						JSON.stringify( fixtures.profiles ),
						{ status: 200 }
					);

				const testAccountID = fixtures.profiles[ 0 ].accountId; // Capitalization rule exception: `accountId` is a property of an API returned value.
				const testPropertyID = fixtures.profiles[ 0 ].webPropertyId; // Capitalization rule exception: `webPropertyId` is a property of an API returned value.

				const initialProfiles = registry.select( STORE_NAME ).getProfiles( testPropertyID );

				// Ensure the proper parameters were sent.
				expect( fetch.mock.calls[ 0 ][ 0 ] ).toMatchQueryParameters(
					{
						accountID: testAccountID,
						propertyID: testPropertyID,
					}
				);

				expect( initialProfiles ).toEqual( undefined );
				await subscribeUntil( registry,
					() => (
						registry.select( STORE_NAME ).getProfiles( testPropertyID ) !== undefined
					),
				);

				const profiles = registry.select( STORE_NAME ).getProfiles( testPropertyID );

				expect( fetch ).toHaveBeenCalledTimes( 1 );
				expect( profiles ).toEqual( fixtures.profiles );
				expect( profiles ).toHaveLength( 1 );
			} );

			it( 'does not make a network request if profiles for this account + property are already present', async () => {
				const testPropertyID = fixtures.profiles[ 0 ].webPropertyId; // Capitalization rule exception: `webPropertyId` is a property of an API returned value.
				const propertyID = testPropertyID;

				// Load data into this store so there are matches for the data we're about to select,
				// even though the selector hasn't fulfilled yet.
				registry.dispatch( STORE_NAME ).receiveGetProfiles( fixtures.profiles, { propertyID } );

				const profiles = registry.select( STORE_NAME ).getProfiles( testPropertyID );

				await subscribeUntil( registry, () => registry
					.select( STORE_NAME )
					.hasFinishedResolution( 'getProfiles', [ testPropertyID ] )
				);

				expect( fetch ).not.toHaveBeenCalled();
				expect( profiles ).toEqual( fixtures.profiles );
				expect( profiles ).toHaveLength( 1 );
			} );

			it( 'dispatches an error if the request fails', async () => {
				const response = {
					code: 'internal_server_error',
					message: 'Internal server error',
					data: { status: 500 },
				};
				fetch
					.doMockIf(
						/^\/google-site-kit\/v1\/modules\/analytics\/data\/profiles/
					)
					.mockResponse(
						JSON.stringify( response ),
						{ status: 500 }
					);

				const testPropertyID = fixtures.profiles[ 0 ].webPropertyId; // Capitalization rule exception: `webPropertyId` is a property of an API returned value.

				muteConsole( 'error' );
				registry.select( STORE_NAME ).getProfiles( testPropertyID );
				await subscribeUntil( registry,
					() => registry.select( STORE_NAME ).isDoingGetProfiles( testPropertyID ) === false
				);

				expect( fetch ).toHaveBeenCalledTimes( 1 );

				const profiles = registry.select( STORE_NAME ).getProfiles( testPropertyID );
				expect( profiles ).toEqual( undefined );
			} );
		} );
	} );
} );
