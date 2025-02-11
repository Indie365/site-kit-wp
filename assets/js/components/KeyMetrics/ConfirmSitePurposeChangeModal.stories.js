/**
 * ConfirmSitePurposeChangeModal Component Stories.
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
import ConfirmSitePurposeChangeModal from './ConfirmSitePurposeChangeModal';
import {
	provideKeyMetrics,
	provideKeyMetricsUserInputSettings,
	provideModules,
	provideUserAuthentication,
} from '../../../../tests/js/utils';
import WithRegistrySetup from '../../../../tests/js/WithRegistrySetup';
import {
	KM_ANALYTICS_MOST_ENGAGING_PAGES,
	KM_ANALYTICS_NEW_VISITORS,
	KM_ANALYTICS_POPULAR_AUTHORS,
	KM_ANALYTICS_POPULAR_CONTENT,
} from '../../googlesitekit/datastore/user/constants';
import { CORE_FORMS } from '../../googlesitekit/datastore/forms/constants';
import {
	FORM_USER_INPUT_QUESTION_SNAPSHOT,
	USER_INPUT_QUESTIONS_PURPOSE,
} from '../user-input/util/constants';

function Template( args ) {
	const handleDialog = () => {};

	return (
		<ConfirmSitePurposeChangeModal
			dialogActive
			handleDialog={ handleDialog }
			{ ...args }
		/>
	);
}

export const Default = Template.bind( {} );
Default.storyName = 'ConfirmSitePurposeChangeModal';
Default.scenario = {
	label: 'KeyMetrics/ConfirmSitePurposeChangeModal',
};

export default {
	title: 'Key Metrics/Key Metrics Confirm Site Purpose Change Modal',
	decorators: [
		( Story ) => {
			const setupRegistry = ( registry ) => {
				registry
					.dispatch( CORE_FORMS )
					.setValues( FORM_USER_INPUT_QUESTION_SNAPSHOT, {
						[ USER_INPUT_QUESTIONS_PURPOSE ]: [ 'publish_news' ],
					} );
				provideModules( registry, [
					{
						slug: 'analytics-4',
						active: true,
						connected: true,
					},
				] );
				provideUserAuthentication( registry );
				provideKeyMetrics( registry, {
					widgetSlugs: [
						KM_ANALYTICS_NEW_VISITORS,
						KM_ANALYTICS_POPULAR_CONTENT,
						KM_ANALYTICS_MOST_ENGAGING_PAGES,
						KM_ANALYTICS_POPULAR_AUTHORS,
					],
				} );
				provideKeyMetricsUserInputSettings( registry, {
					purpose: {
						values: [ 'publish_news' ],
						scope: 'site',
					},
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
