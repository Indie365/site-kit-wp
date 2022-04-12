/**
 * Admin Bar Widgets Component Stories.
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
import {
	provideModules,
	provideModuleRegistrations,
	provideSiteInfo,
	provideUserAuthentication,
} from '../../../../tests/js/utils';
import {
	setupSearchConsoleAnalyticsMockReports,
	setupAnalyticsMockReports,
	setupSearchConsoleMockReports,
	setupAnalyticsGatheringData,
	setupSearchConsoleGatheringData,
} from './common.stories';
import WithRegistrySetup from '../../../../tests/js/WithRegistrySetup';
import AdminBarWidgets from './AdminBarWidgets';

const Template = ( { setupRegistry = () => {}, ...args } ) => (
	<WithRegistrySetup func={ setupRegistry }>
		<AdminBarWidgets { ...args } />
	</WithRegistrySetup>
);

export const Ready = Template.bind( {} );
Ready.storyName = 'Ready';
Ready.args = {
	setupRegistry: setupSearchConsoleAnalyticsMockReports,
};
Ready.decorators = [
	( Story ) => {
		const setupRegistry = ( registry ) => {
			// Set up the search console and analytics modules stores but provide no data.
			provideModules( registry, [
				{
					slug: 'search-console',
					active: true,
					connected: true,
				},
				{
					slug: 'analytics',
					active: true,
					connected: true,
				},
			] );
		};

		return (
			<WithRegistrySetup func={ setupRegistry }>
				<Story />
			</WithRegistrySetup>
		);
	},
];

export const GatheringDataLegacy = Template.bind( {} );
GatheringDataLegacy.storyName = 'Gathering Data (Legacy)';
GatheringDataLegacy.decorators = [
	( Story ) => {
		const setupRegistry = ( registry ) => {
			// Set up the search console and analytics modules stores but provide no data.
			provideModules( registry, [
				{
					slug: 'search-console',
					active: true,
					connected: true,
				},
				{
					slug: 'analytics',
					active: true,
					connected: true,
				},
			] );
		};

		return (
			<WithRegistrySetup func={ setupRegistry }>
				<Story />
			</WithRegistrySetup>
		);
	},
];

export const AnalyticsGatheringDataLegacy = Template.bind( {} );
AnalyticsGatheringDataLegacy.storyName = 'Gathering Data (Legacy): Analytics';
AnalyticsGatheringDataLegacy.decorators = [
	( Story ) => {
		const setupRegistry = ( registry ) => {
			// Set up the search console and analytics modules stores but provide no data.
			provideModules( registry, [
				{
					slug: 'search-console',
					active: true,
					connected: true,
				},
				{
					slug: 'analytics',
					active: true,
					connected: true,
				},
			] );

			setupSearchConsoleMockReports( registry );
			setupAnalyticsMockReports( registry, [] );
		};

		return (
			<WithRegistrySetup func={ setupRegistry }>
				<Story />
			</WithRegistrySetup>
		);
	},
];

export const AnalyticsInactive = Template.bind( {} );
AnalyticsInactive.storyName = 'Inactive: Analytics';
AnalyticsInactive.decorators = [
	( Story ) => {
		const setupRegistry = ( registry ) => {
			// Set up the search console module store but provide no data.
			provideModules( registry, [
				{
					slug: 'search-console',
					active: true,
					connected: true,
				},
			] );

			setupSearchConsoleMockReports( registry );
		};

		return (
			<WithRegistrySetup func={ setupRegistry }>
				<Story />
			</WithRegistrySetup>
		);
	},
];

export const AnalyticsInactiveNew = Template.bind( {} );
AnalyticsInactiveNew.storyName = 'Inactive: Analytics New CTA';
AnalyticsInactiveNew.decorators = [
	( Story ) => {
		const setupRegistry = ( registry ) => {
			provideModules( registry );

			setupSearchConsoleMockReports( registry );
		};

		return (
			<WithRegistrySetup func={ setupRegistry }>
				<Story />
			</WithRegistrySetup>
		);
	},
];
AnalyticsInactiveNew.parameters = {
	features: [ 'zeroDataStates' ],
};

export const AnalyticsInactiveNewCompleteActivation = Template.bind( {} );
AnalyticsInactiveNewCompleteActivation.storyName =
	'Inactive: Analytics New Complete Activation CTA';
AnalyticsInactiveNewCompleteActivation.decorators = [
	( Story ) => {
		const setupRegistry = ( registry ) => {
			// Set up the search console and analytics module store but provide no data.
			provideModules( registry, [
				{
					slug: 'analytics',
					active: true,
					connected: false,
				},
			] );
			provideModuleRegistrations( registry );
			provideUserAuthentication( registry );
			setupSearchConsoleMockReports( registry );
		};

		return (
			<WithRegistrySetup func={ setupRegistry }>
				<Story />
			</WithRegistrySetup>
		);
	},
];
AnalyticsInactiveNewCompleteActivation.parameters = {
	features: [ 'zeroDataStates' ],
};

export const SearchConsoleGatheringDataLegacy = Template.bind( {} );
SearchConsoleGatheringDataLegacy.storyName =
	'Gathering Data (Legacy): Search Console';
SearchConsoleGatheringDataLegacy.decorators = [
	( Story ) => {
		const setupRegistry = ( registry ) => {
			// Set up the search console module store but provide no data.
			provideModules( registry, [
				{
					slug: 'search-console',
					active: true,
					connected: true,
				},
			] );

			setupSearchConsoleMockReports( registry, [] );
		};

		return (
			<WithRegistrySetup func={ setupRegistry }>
				<Story />
			</WithRegistrySetup>
		);
	},
];

export const GatheringData = Template.bind( {} );
GatheringData.storyName = 'Gathering Data';
GatheringData.decorators = [
	( Story ) => {
		const setupRegistry = ( registry ) => {
			provideModules( registry, [
				{
					slug: 'search-console',
					active: true,
					connected: true,
				},
				{
					slug: 'analytics',
					active: true,
					connected: true,
				},
			] );

			setupSearchConsoleGatheringData( registry );
			setupAnalyticsGatheringData( registry );
		};

		return (
			<WithRegistrySetup func={ setupRegistry }>
				<Story />
			</WithRegistrySetup>
		);
	},
];
GatheringData.parameters = {
	features: [ 'zeroDataStates' ],
};

export default {
	title: 'Views/AdminBarApp/AdminBarWidgets',
	decorators: [
		( Story, { args } ) => {
			const setupRegistry = ( registry ) => {
				// Set some site information.
				provideSiteInfo( registry, {
					currentEntityURL: 'https://www.sitekitbygoogle.com/blog/',
					currentEntityTitle: 'Blog test post for Google Site Kit',
				} );

				// Call story-specific setup.
				if ( typeof args?.setupRegistry === 'function' ) {
					args.setupRegistry( registry );
				}
			};

			return (
				<WithRegistrySetup func={ setupRegistry }>
					<div className="googlesitekit-widget">
						<div className="googlesitekit-widget__body">
							<Story />
						</div>
					</div>
				</WithRegistrySetup>
			);
		},
	],
};
