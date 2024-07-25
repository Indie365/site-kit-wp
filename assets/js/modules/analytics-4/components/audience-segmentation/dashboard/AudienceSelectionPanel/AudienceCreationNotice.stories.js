/**
 * AudienceCreationNotice Component Stories.
 *
 * Site Kit by Google, Copyright 2024 Google LLC
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
import { CORE_USER } from '../../../../../../googlesitekit/datastore/user/constants';
import { MODULES_ANALYTICS_4 } from '../../../../datastore/constants';
import { availableAudiences } from '../../../../datastore/__fixtures__';
import WithRegistrySetup from '../../../../../../../../tests/js/WithRegistrySetup';
import AudienceCreationNotice from './AudienceCreationNotice';

function Template( {} ) {
	return (
		<div
			className="googlesitekit-audience-selection-panel"
			style={ { padding: '40px 20px', backgroundColor: '#fff' } }
		>
			<AudienceCreationNotice />
		</div>
	);
}

export const Default = Template.bind( {} );
Default.storyName = 'Default';
Default.scenario = {
	label: 'Modules/Analytics4/Components/AudienceSegmentation/Dashboard/AudienceCreationNotice/Default',
};

export default {
	title: 'Modules/Analytics4/Components/AudienceSegmentation/Dashboard/AudienceCreationNotice',
	component: AudienceCreationNotice,
	decorators: [
		( Story ) => {
			const setupRegistry = ( registry ) => {
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.setAvailableAudiences( availableAudiences );

				registry.dispatch( CORE_USER ).receiveGetDismissedItems( [] );

				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveResourceDataAvailabilityDates( {
						audience: availableAudiences.reduce(
							( acc, { name } ) => {
								acc[ name ] = 20201220;
								return acc;
							},
							{}
						),
						customDimension: {},
						property: {},
					} );
			};

			return (
				<WithRegistrySetup func={ setupRegistry }>
					<Story />
				</WithRegistrySetup>
			);
		},
	],
};
