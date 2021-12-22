/**
 * SetupFormGA4Transitional component stories.
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
import { MODULES_ANALYTICS } from '../../datastore/constants';
import { MODULES_ANALYTICS_4 } from '../../../analytics-4/datastore/constants';
import {
	provideModules,
	provideModuleRegistrations,
	provideSiteInfo,
} from '../../../../../../tests/js/utils';
import ModuleSetup from '../../../../components/setup/ModuleSetup';
import WithRegistrySetup from '../../../../../../tests/js/WithRegistrySetup';
import * as fixtures from '../../datastore/__fixtures__';
import * as ga4Fixtures from '../../../analytics-4/datastore/__fixtures__';

function Template() {
	return <ModuleSetup moduleSlug="analytics" />;
}

export const WithoutExistingTag = Template.bind( null );
WithoutExistingTag.storyName = 'Without Existing Tags';

export const WithUAExistingTag = Template.bind( null );
WithUAExistingTag.storyName = 'With UA Tag';
WithUAExistingTag.decorators = [
	( Story ) => {
		const setupRegistry = ( registry ) => {
			registry
				.dispatch( MODULES_ANALYTICS )
				.receiveGetExistingTag(
					fixtures.accountsPropertiesProfiles.properties[ 0 ].id
				);
		};

		return (
			<WithRegistrySetup func={ setupRegistry }>
				<Story />
			</WithRegistrySetup>
		);
	},
];

export const WithGA4ExistingTag = Template.bind( null );
WithGA4ExistingTag.storyName = 'With GA4 Tag';
WithGA4ExistingTag.decorators = [
	( Story ) => {
		const setupRegistry = ( registry ) => {
			registry.dispatch( MODULES_ANALYTICS_4 ).receiveGetExistingTag(
				// eslint-disable-next-line sitekit/acronym-case
				ga4Fixtures.webDataStreams[ 0 ].measurementId
			);
		};

		return (
			<WithRegistrySetup func={ setupRegistry }>
				<Story />
			</WithRegistrySetup>
		);
	},
];

export const WithGA4AndUAExistingTag = Template.bind( null );
WithGA4AndUAExistingTag.storyName = 'With Both Tags';
WithGA4AndUAExistingTag.decorators = [
	( Story ) => {
		const setupRegistry = ( registry ) => {
			registry
				.dispatch( MODULES_ANALYTICS )
				.receiveGetExistingTag(
					fixtures.accountsPropertiesProfiles.properties[ 0 ].id
				);
			registry.dispatch( MODULES_ANALYTICS_4 ).receiveGetExistingTag(
				// eslint-disable-next-line sitekit/acronym-case
				ga4Fixtures.webDataStreams[ 0 ].measurementId
			);
		};

		return (
			<WithRegistrySetup func={ setupRegistry }>
				<Story />
			</WithRegistrySetup>
		);
	},
];

export default {
	title: 'Modules/Analytics/Setup/SetupFormGA4Transitional',
	decorators: [
		( Story ) => {
			const setupRegistry = ( registry ) => {
				const accounts = fixtures.accountsPropertiesProfiles.accounts.slice(
					0,
					1
				);
				const properties = [
					{
						...fixtures.accountsPropertiesProfiles.properties[ 0 ],
						websiteUrl: 'http://example.com', // eslint-disable-line sitekit/acronym-case
					},
					{
						...fixtures.accountsPropertiesProfiles.properties[ 1 ],
					},
				];

				const accountID = accounts[ 0 ].id;

				provideModules( registry, [
					{
						slug: 'analytics',
						active: true,
						connected: true,
					},
					{
						slug: 'analytics-4',
						active: true,
						connected: true,
					},
				] );

				provideSiteInfo( registry );
				provideModuleRegistrations( registry );

				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetSettings( {} );
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetExistingTag( null );
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetProperties( ga4Fixtures.properties, {
						accountID,
					} );
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetWebDataStreams( ga4Fixtures.webDataStreams, {
						propertyID: ga4Fixtures.properties[ 0 ]._id,
					} );

				registry
					.dispatch( MODULES_ANALYTICS )
					.receiveGetSettings( { adsConversionID: '' } );
				registry
					.dispatch( MODULES_ANALYTICS )
					.receiveGetExistingTag( null );
				registry
					.dispatch( MODULES_ANALYTICS )
					.receiveGetAccounts( accounts );
				registry
					.dispatch( MODULES_ANALYTICS )
					.receiveGetProperties( properties, { accountID } );
				registry
					.dispatch( MODULES_ANALYTICS )
					.receiveGetProfiles(
						fixtures.accountsPropertiesProfiles.profiles,
						{ accountID, propertyID: properties[ 0 ].id }
					);
				registry
					.dispatch( MODULES_ANALYTICS )
					.receiveGetProfiles(
						fixtures.accountsPropertiesProfiles.profiles,
						{ accountID, propertyID: properties[ 1 ].id }
					);

				registry
					.dispatch( MODULES_ANALYTICS )
					.selectAccount( accountID );
			};

			return (
				<WithRegistrySetup func={ setupRegistry }>
					<Story />
				</WithRegistrySetup>
			);
		},
	],
	parameters: { padding: 0 },
};
