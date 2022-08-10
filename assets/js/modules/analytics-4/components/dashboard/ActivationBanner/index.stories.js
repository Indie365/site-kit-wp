/**
 * ActivationBanner Component Stories.
 *
 * Site Kit by Google, Copyright 2022 Google LLC
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
import { waitForElement } from '@testing-library/react';

/**
 * Internal dependencies
 */
import ActivationBanner from './index';

const Template = () => <ActivationBanner />;

export const ReminderBanner = Template.bind( {} );
ReminderBanner.storyName = 'ReminderBanner';

export const SetupBanner = Template.bind( {} );
SetupBanner.storyName = 'SetupBanner';
SetupBanner.decorators = [
	( Story ) => {
		setTimeout( async () => {
			await waitForElement( () =>
				document.querySelector( 'a.googlesitekit-notification__cta' )
			);
			document
				.querySelector( 'a.googlesitekit-notification__cta' )
				.click();
		}, 0 );

		return <Story />;
	},
];

export default {
	title: 'Modules/Analytics4/ActivationBanner',
};
