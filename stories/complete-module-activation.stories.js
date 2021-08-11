/**
 * CompleteModuleActivationCTA Component Stories.
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
 * External dependencies
 */
import { storiesOf } from '@storybook/react';

/**
 * Internal dependencies
 */
import CompleteModuleActivationCTA from '../assets/js/components/CompleteModuleActivationCTA';
import {
	WithTestRegistry,
	provideSiteInfo,
	provideUserAuthentication,
	provideUserCapabilities,
	provideModules,
	provideModuleRegistrations,
} from '../tests/js/utils';

storiesOf( 'Global', module ).add(
	'CompleteModuleActivationCTA',
	() => {
		const setupRegistry = ( registry ) => {
			provideSiteInfo( registry );
			provideUserAuthentication( registry );
			provideUserCapabilities( registry );
			provideModules( registry );
			provideModuleRegistrations( registry );
		};

		return (
			<WithTestRegistry callback={ setupRegistry }>
				<CompleteModuleActivationCTA moduleSlug="tagmanager" />
			</WithTestRegistry>
		);
	},
	{
		options: {
			hoverSelector: '.googlesitekit-button--hover',
			postInteractionWait: 3000, // Wait for shadows to animate.
			onReadyScript: 'mouse.js',
		},
	}
);
