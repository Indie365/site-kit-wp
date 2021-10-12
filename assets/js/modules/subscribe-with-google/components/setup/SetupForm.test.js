/**
 * Prototype Form component tests.
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
import SetupForm from './SetupForm';
import {
	createTestRegistry,
	fireEvent,
	render,
} from '../../../../../../tests/js/test-utils';
import { CORE_MODULES } from '../../../../googlesitekit/modules/datastore/constants';
import { STORE_NAME } from '../../datastore/constants';

describe( 'SetupForm', () => {
	let registry;

	const defaultSettings = {
		publicationID: '',
		products: [],
	};

	const validSettings = {
		publicationID: 'example.com',
		products: [ 'basic' ],
	};

	beforeEach( () => {
		registry = createTestRegistry();
		// Prevent extra fetches during tests.
		registry.dispatch( CORE_MODULES ).receiveGetModules( [] );
		registry.dispatch( STORE_NAME ).setSettings( defaultSettings );

		// Mock `fetch` method.
		const pendingPromise = new Promise( () => {} );
		self.fetch = jest.fn().mockReturnValue( pendingPromise );
	} );

	describe( '"Configure Subscribe with Google" button', () => {
		it( 'is enabled by valid settings', () => {
			registry.dispatch( STORE_NAME ).setSettings( validSettings );
			const finishSetupButton = render(
				<SetupForm finishSetup={ jest.fn() } />,
				{ registry }
			).getByRole( 'button', {
				name: /Configure Subscribe with Google/i,
			} );
			expect( finishSetupButton ).toBeEnabled();
		} );

		it( 'is disabled by invalid settings', () => {
			const finishSetupButton = render(
				<SetupForm finishSetup={ jest.fn() } />,
				{ registry }
			).getByRole( 'button', {
				name: /Configure Subscribe with Google/i,
			} );
			expect( finishSetupButton ).toBeDisabled();
		} );

		it( 'submits form', () => {
			// Render enabled button.
			registry.dispatch( STORE_NAME ).setSettings( validSettings );
			const finishSetup = jest.fn();
			const finishSetupButton = render(
				<SetupForm finishSetup={ finishSetup } />,
				{ registry }
			).getByRole( 'button', {
				name: /Configure Subscribe with Google/i,
			} );

			// Click button.
			fireEvent.click( finishSetupButton );

			expect( finishSetup ).toHaveBeenCalled();
			expect( self.fetch ).toHaveBeenCalled();
		} );
	} );
} );
