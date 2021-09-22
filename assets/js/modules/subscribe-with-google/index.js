/**
 * Subscribe with Google module initialization.
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
import { SetupMain } from './components/setup';
import {
	SettingsEdit,
	SettingsView,
} from '../subscribe-with-google/components/settings';
import SubscribeWithGoogleIcon from '../../../svg/logo-g.svg';
import { STORE_NAME } from './datastore/constants';
import { isFeatureEnabled } from '../../features';

export { registerStore } from '../subscribe-with-google/datastore';

const ifSwgIsEnabled = ( func ) => ( ...args ) => {
	if ( isFeatureEnabled( 'swgModule' ) ) {
		func( ...args );
	}
};

export const registerModule = ifSwgIsEnabled( ( modules ) => {
	modules.registerModule( 'subscribe-with-google', {
		storeName: STORE_NAME,
		SettingsEditComponent: SettingsEdit,
		SettingsViewComponent: SettingsView,
		SetupComponent: SetupMain,
		// TODO: Replace with another icon later.
		Icon: SubscribeWithGoogleIcon,
	} );
} );
