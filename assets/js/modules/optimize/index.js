/**
 * Optimize module initialization.
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
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { SetupMain } from './components/setup';
import { SettingsEdit, SettingsView } from './components/settings';
import OptimizeIcon from '../../../svg/optimize.svg';
import { MODULES_OPTIMIZE } from './datastore/constants';

export { registerStore } from './datastore';

export const registerModule = ( modules ) => {
	// This is called inside `registerModule` to prevent this file from having
	// side-effects. This is used to show "wins" for Optimize.
	/**
	 * Add data to the congrats setup Win Notification for display.
	 */
	addFilter(
		'googlesitekit.SetupWinNotification-optimize',
		'googlesitekit.OptimizeSetupWinNotification',
		( winData ) => {
			winData.description = __(
				'To set up experiments and see the results, go to ',
				'google-site-kit'
			);
			winData.learnMore.label = 'Optimize';
			winData.learnMore.url = 'https://optimize.withgoogle.com/';
			return winData;
		}
	);

	modules.registerModule( 'optimize', {
		storeName: MODULES_OPTIMIZE,
		SettingsEditComponent: SettingsEdit,
		SettingsViewComponent: SettingsView,
		SetupComponent: SetupMain,
		Icon: OptimizeIcon,
		features: [
			__( 'A/B or multivariate testing', 'google-site-kit' ),
			__( 'Improvement tracking', 'google-site-kit' ),
			__( 'Probability and confidence calculations', 'google-site-kit' ),
		],
	} );
};
