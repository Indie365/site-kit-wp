/**
 * Tag Manager useExistingTagEffect hook tests.
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
import { renderHook, actHook as act } from '../../../../../tests/js/test-utils';
import {
	createTestRegistry,
	untilResolved,
} from '../../../../../tests/js/utils';
import { MODULES_TAGMANAGER, CONTEXT_WEB } from '../datastore/constants';
import * as factories from '../datastore/__factories__';
import useExistingTagEffect from './useExistingTagEffect';

describe( 'useExistingTagEffect', () => {
	let registry;
	beforeEach( () => {
		registry = createTestRegistry();
		// Set settings to prevent fetch in resolver.
		registry.dispatch( MODULES_TAGMANAGER ).receiveGetSettings( {} );
		// Set set no existing tag.
		registry.dispatch( MODULES_TAGMANAGER ).receiveGetExistingTag( null );
	} );

	it( 'sets the accountID and containerID when there is an existing tag with permission', async () => {
		const account = factories.accountBuilder();
		// eslint-disable-next-line sitekit/acronym-case
		const accountID = account.accountId;
		const containers = factories.buildContainers(
			3,
			// eslint-disable-next-line sitekit/acronym-case
			{ accountId: account.accountId, usageContext: [ CONTEXT_WEB ] }
		);
		const [ firstContainer, existingContainer ] = containers;
		registry
			.dispatch( MODULES_TAGMANAGER )
			.receiveGetAccounts( [ account ] );
		registry
			.dispatch( MODULES_TAGMANAGER )
			.receiveGetContainers( containers, { accountID } );
		registry.dispatch( MODULES_TAGMANAGER ).setAccountID( accountID );
		registry
			.dispatch( MODULES_TAGMANAGER )
			// eslint-disable-next-line sitekit/acronym-case
			.setContainerID( firstContainer.publicId );
		registry
			.dispatch( MODULES_TAGMANAGER )
			// eslint-disable-next-line sitekit/acronym-case
			.setInternalContainerID( firstContainer.containerId );

		let rerender;
		await act(
			() =>
				new Promise( async ( resolve ) => {
					( { rerender } = renderHook( () => useExistingTagEffect(), {
						registry,
					} ) );
					await untilResolved(
						registry,
						MODULES_TAGMANAGER
					).getTagPermission( null );
					resolve();
				} )
		);

		expect( registry.select( MODULES_TAGMANAGER ).getContainerID() ).toBe(
			// eslint-disable-next-line sitekit/acronym-case
			firstContainer.publicId
		);
		expect(
			registry.select( MODULES_TAGMANAGER ).getInternalContainerID()
			// eslint-disable-next-line sitekit/acronym-case
		).toBe( firstContainer.containerId );

		await act(
			() =>
				new Promise( async ( resolve ) => {
					registry
						.dispatch( MODULES_TAGMANAGER )
						.receiveGetTagPermission(
							{ accountID, permission: true },
							// eslint-disable-next-line sitekit/acronym-case
							{ containerID: existingContainer.publicId }
						);
					registry
						.dispatch( MODULES_TAGMANAGER )
						// eslint-disable-next-line sitekit/acronym-case
						.receiveGetExistingTag( existingContainer.publicId );
					await untilResolved(
						registry,
						MODULES_TAGMANAGER
						// eslint-disable-next-line sitekit/acronym-case
					).getTagPermission( existingContainer.publicId );
					rerender();
					resolve();
				} )
		);

		expect( registry.select( MODULES_TAGMANAGER ).getContainerID() ).toBe(
			// eslint-disable-next-line sitekit/acronym-case
			existingContainer.publicId
		);
		expect(
			registry.select( MODULES_TAGMANAGER ).getInternalContainerID()
			// eslint-disable-next-line sitekit/acronym-case
		).toBe( existingContainer.containerId );
	} );
} );
