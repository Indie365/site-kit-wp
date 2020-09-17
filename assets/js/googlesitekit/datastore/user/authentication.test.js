/**
 * core/user Data store: Authentication info tests.
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
 * Internal dependencies
 */
import API from 'googlesitekit-api';
import {
	createTestRegistry,
	muteFetch,
	subscribeUntil,
	unsubscribeFromAll,
	untilResolved,
} from '../../../../../tests/js/utils';
import { STORE_NAME } from './constants';

describe( 'core/user authentication', () => {
	const coreUserDataExpectedResponse = {
		authenticated: true,
		requiredScopes: [],
		grantedScopes: [],
		unsatisfiedScopes: [],
	};
	const coreUserDataEndpointRegExp = /^\/google-site-kit\/v1\/core\/user\/data\/authentication/;
	let registry;

	beforeAll( () => {
		API.setUsingCache( false );
	} );

	beforeEach( () => {
		registry = createTestRegistry();
	} );

	afterAll( () => {
		API.setUsingCache( true );
	} );

	afterEach( () => {
		unsubscribeFromAll( registry );
	} );

	describe( 'actions', () => {
		describe( 'fetchGetAuthentication', () => {
			it( 'does not require any params', () => {
				muteFetch( coreUserDataEndpointRegExp );
				expect( () => {
					registry.dispatch( STORE_NAME ).fetchGetAuthentication();
				} ).not.toThrow();
			} );
		} );
		describe( 'receiveGetAuthentication', () => {
			it( 'requires the response param', () => {
				expect( () => {
					registry.dispatch( STORE_NAME ).receiveGetAuthentication();
				} ).toThrow( 'response is required.' );
			} );
		} );
	} );

	describe( 'selectors', () => {
		describe( 'getAuthentication', () => {
			it( 'uses a resolver to make a network request', async () => {
				fetchMock.getOnce(
					coreUserDataEndpointRegExp,
					{ body: coreUserDataExpectedResponse, status: 200 }
				);

				const initialAuthentication = registry.select( STORE_NAME ).getAuthentication();
				// The authentication info will be its initial value while the authentication
				// info is fetched.
				expect( initialAuthentication ).toEqual( undefined );
				await subscribeUntil( registry,
					() => (
						registry.select( STORE_NAME ).getAuthentication() !== undefined
					),
				);

				const authentication = registry.select( STORE_NAME ).getAuthentication();

				expect( fetchMock ).toHaveFetchedTimes( 1 );
				expect( authentication ).toEqual( coreUserDataExpectedResponse );

				const authenticationSelect = registry.select( STORE_NAME ).getAuthentication();
				expect( fetchMock ).toHaveFetchedTimes( 1 );
				expect( authenticationSelect ).toEqual( authentication );
			} );

			it( 'does not make a network request if data is already in state', async () => {
				registry.dispatch( STORE_NAME ).receiveGetAuthentication( coreUserDataExpectedResponse );

				const authentication = registry.select( STORE_NAME ).getAuthentication();

				await subscribeUntil( registry, () => registry
					.select( STORE_NAME )
					.hasFinishedResolution( 'getAuthentication' )
				);

				expect( fetchMock ).not.toHaveFetched();
				expect( authentication ).toEqual( coreUserDataExpectedResponse );
			} );

			it( 'dispatches an error if the request fails', async () => {
				const response = {
					code: 'internal_server_error',
					message: 'Internal server error',
					data: { status: 500 },
				};
				fetchMock.getOnce(
					coreUserDataEndpointRegExp,
					{ body: response, status: 500 }
				);

				registry.select( STORE_NAME ).getAuthentication();
				await subscribeUntil( registry, () => registry
					.select( STORE_NAME )
					.hasFinishedResolution( 'getAuthentication' )
				);

				const authentication = registry.select( STORE_NAME ).getAuthentication();

				expect( fetchMock ).toHaveFetchedTimes( 1 );
				expect( authentication ).toEqual( undefined );
				expect( console ).toHaveErrored();
			} );
		} );

		describe( 'hasScope', () => {
			it( 'uses a resolver to to load the value if not yet set', async () => {
				const grantedScope = 'https://www.googleapis.com/auth/granted.scope';
				const ungrantedScope = 'https://www.googleapis.com/auth/ungranted.scope';

				fetchMock.getOnce(
					coreUserDataEndpointRegExp,
					{ body: {
						authenticated: true,
						requiredScopes: [],
						grantedScopes: [ grantedScope ],
						unsatisfiedScopes: [],
					}, status: 200 }
				);

				const hasScope = registry.select( STORE_NAME ).hasScope( grantedScope );
				// The granted scope info will be its initial value while the granted scope
				// info is fetched.
				expect( hasScope ).toEqual( undefined );
				await subscribeUntil( registry,
					() => registry.select( STORE_NAME ).hasFinishedResolution( 'getAuthentication' )
				);

				const hasScopeAfterResolved = registry.select( STORE_NAME ).hasScope( grantedScope );
				expect( hasScopeAfterResolved ).toEqual( true );

				const missingScope = registry.select( STORE_NAME ).hasScope( ungrantedScope );
				expect( missingScope ).toEqual( false );
			} );

			it( 'returns undefined if scope info is not available', async () => {
				muteFetch( coreUserDataEndpointRegExp );
				const hasProvisioningScope = registry.select( STORE_NAME ).hasScope( 'https://www.googleapis.com/auth/ungranted.scope' );
				expect( hasProvisioningScope ).toEqual( undefined );
			} );
		} );

		describe.each( [
			[ 'isAuthenticated', 'authenticated' ],
			[ 'getGrantedScopes', 'grantedScopes' ],
			[ 'getRequiredScopes', 'requiredScopes' ],
			[ 'getUnsatisfiedScopes', 'unsatisfiedScopes' ],
			[ 'needsReauthentication', 'needsReauthentication' ],
		] )( '%s', ( selector, property ) => {
			it( 'uses a resolver to load the authenticated value if not yet set.', async () => {
				fetchMock.getOnce(
					coreUserDataEndpointRegExp,
					{ body: coreUserDataExpectedResponse, status: 200 }
				);

				// The autentication info will be its initial value while the authentication
				// info is fetched.
				expect( registry.select( STORE_NAME )[ selector ]() ).toBeUndefined();
				await untilResolved( registry, STORE_NAME ).getAuthentication();

				expect( fetchMock ).toHaveFetchedTimes( 1 );
				expect( registry.select( STORE_NAME )[ selector ]() ).toEqual( coreUserDataExpectedResponse[ property ] );
			} );

			it( 'dispatches an error if the request fails', async () => {
				const response = {
					code: 'internal_server_error',
					message: 'Internal server error',
					data: { status: 500 },
				};
				fetchMock.getOnce(
					coreUserDataEndpointRegExp,
					{ body: response, status: 500 }
				);

				registry.select( STORE_NAME )[ selector ]();
				await untilResolved( registry, STORE_NAME ).getAuthentication();

				const value = registry.select( STORE_NAME )[ selector ]();
				const error = registry.select( STORE_NAME ).getErrorForSelector( 'getAuthentication' );

				expect( fetchMock ).toHaveFetchedTimes( 1 );
				expect( value ).toBeUndefined();
				expect( error ).toEqual( response );
				expect( console ).toHaveErrored();
			} );

			it( 'returns undefined if authentication info is not available', async () => {
				muteFetch( coreUserDataEndpointRegExp );
				expect( registry.select( STORE_NAME )[ selector ]() ).toBeUndefined();
			} );
		} );
	} );
} );
