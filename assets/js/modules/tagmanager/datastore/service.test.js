/**
 * `modules/tagmanager` data store: service tests.
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
 *
 * Internal dependencies
 */
import {
	createTestRegistry,
	unsubscribeFromAll,
} from '../../../../../tests/js/utils';
import { MODULES_TAGMANAGER } from './constants';
import { CORE_USER } from '../../../googlesitekit/datastore/user/constants';

describe( 'module/tagmanager service store', () => {
	const userData = {
		id: 1,
		email: 'admin@example.com',
		name: 'admin',
		picture: 'https://path/to/image',
	};
	const baseURI = 'https://tagmanager.google.com/';

	let registry;

	beforeAll( () => {
		registry = createTestRegistry();
		registry.dispatch( CORE_USER ).receiveUserInfo( userData );
	} );

	afterAll( () => {
		unsubscribeFromAll( registry );
	} );

	describe( 'selectors', () => {
		describe( 'getServiceURL', () => {
			it( 'retrieves the correct URL with no arguments', async () => {
				const serviceURL = registry
					.select( MODULES_TAGMANAGER )
					.getServiceURL();
				expect( serviceURL ).toBe(
					`${ baseURI }?authuser=${ encodeURIComponent(
						userData.email
					) }`
				);
			} );

			it( 'adds the path parameter', () => {
				const expectedURL = `${ baseURI }?authuser=${ encodeURIComponent(
					userData.email
				) }#/test/path/to/deeplink`;
				const serviceURLNoSlashes = registry
					.select( MODULES_TAGMANAGER )
					.getServiceURL( { path: 'test/path/to/deeplink' } );
				expect( serviceURLNoSlashes ).toEqual( expectedURL );
				const serviceURLWithLeadingSlash = registry
					.select( MODULES_TAGMANAGER )
					.getServiceURL( { path: '/test/path/to/deeplink' } );
				expect( serviceURLWithLeadingSlash ).toEqual( expectedURL );
			} );

			it( 'adds query args', async () => {
				const path = '/test/path/to/deeplink';
				const query = {
					authuser: userData.email,
					param1: '1',
					param2: '2',
				};
				const serviceURL = registry
					.select( MODULES_TAGMANAGER )
					.getServiceURL( { path, query } );
				expect( serviceURL.startsWith( baseURI ) ).toBe( true );
				expect( serviceURL.endsWith( `#${ path }` ) ).toBe( true );
				expect( serviceURL ).toMatchQueryParameters( query );
			} );
		} );
	} );
} );
