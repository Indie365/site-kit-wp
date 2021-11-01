/**
 * SearchFunnelWidget Component Stories.
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
import { CORE_USER } from '../../../../../googlesitekit/datastore/user/constants';
import {
	provideModules,
	provideSiteInfo,
} from '../../../../../../../tests/js/utils';
import { MODULES_SEARCH_CONSOLE } from '../../../datastore/constants';
import { MODULES_ANALYTICS } from '../../../../analytics/datastore/constants';
import { withWidgetComponentProps } from '../../../../../googlesitekit/widgets/util';
import { provideSearchConsoleMockReport } from '../../../util/data-mock';
import { provideAnalyticsMockReport } from '../../../../analytics/util/data-mock';
import {
	VIEW_CONTEXT_DASHBOARD,
	VIEW_CONTEXT_PAGE_DASHBOARD,
} from '../../../../../googlesitekit/constants';
import WithRegistrySetup from '../../../../../../../tests/js/WithRegistrySetup';
import SearchFunnelWidget from './index';
import { Provider } from '../../../../../components/Root/ViewContextContext';

const searchConsoleArgs = {
	startDate: '2021-08-18',
	endDate: '2021-10-12',
	dimensions: 'date',
};
const analyticsArgs = [
	{
		startDate: '2021-09-15',
		endDate: '2021-10-12',
		compareStartDate: '2021-08-18',
		compareEndDate: '2021-09-14',
		metrics: [
			{
				expression: 'ga:goalCompletionsAll',
				alias: 'Goal Completions',
			},
			'ga:bounceRate',
		],
	},
	{
		startDate: '2021-09-15',
		endDate: '2021-10-12',
		compareStartDate: '2021-08-18',
		compareEndDate: '2021-09-14',
		dimensions: 'ga:date',
		metrics: [
			{
				expression: 'ga:goalCompletionsAll',
				alias: 'Goal Completions',
			},
			'ga:bounceRate',
		],
	},
	{
		startDate: '2021-09-15',
		endDate: '2021-10-12',
		compareStartDate: '2021-08-18',
		compareEndDate: '2021-09-14',
		metrics: [
			{
				expression: 'ga:users',
				alias: 'Total Users',
			},
		],
		dimensions: [ 'ga:channelGrouping' ],
		dimensionFilters: { 'ga:channelGrouping': 'Organic Search' },
	},
	{
		startDate: '2021-09-15',
		endDate: '2021-10-12',
		compareStartDate: '2021-08-18',
		compareEndDate: '2021-09-14',
		metrics: [
			{
				expression: 'ga:users',
				alias: 'Total Users',
			},
		],
		dimensions: [ 'ga:date', 'ga:channelGrouping' ],
		dimensionFilters: { 'ga:channelGrouping': 'Organic Search' },
	},
];

const WidgetWithComponentProps = withWidgetComponentProps( 'widget-slug' )(
	SearchFunnelWidget
);

const Template = ( { setupRegistry, ...args } ) => (
	<WithRegistrySetup func={ setupRegistry }>
		<WidgetWithComponentProps { ...args } />
	</WithRegistrySetup>
);

export const Ready = Template.bind( {} );
Ready.storyName = 'Ready';
Ready.args = {
	setupRegistry: ( registry ) => {
		provideSearchConsoleMockReport( registry, searchConsoleArgs );
		for ( const options of analyticsArgs ) {
			provideAnalyticsMockReport( registry, options );
		}
	},
};

export const ReadyWithAnalyticsNotActive = Template.bind( {} );
ReadyWithAnalyticsNotActive.storyName = 'Ready with Analytics not active';
ReadyWithAnalyticsNotActive.args = {
	setupRegistry: ( registry ) => {
		provideModules( registry, [
			{
				active: true,
				connected: true,
				slug: 'search-console',
			},
			{
				active: false,
				connected: false,
				slug: 'analytics',
			},
		] );

		provideSearchConsoleMockReport( registry, searchConsoleArgs );
	},
};

export const Loading = Template.bind( {} );
Loading.storyName = 'Loading';
Loading.args = {
	setupRegistry: ( registry ) => {
		registry
			.dispatch( MODULES_SEARCH_CONSOLE )
			.startResolution( 'getReport', [ searchConsoleArgs ] );
		for ( const options of analyticsArgs ) {
			registry
				.dispatch( MODULES_ANALYTICS )
				.startResolution( 'getReport', [ options ] );
		}
	},
};

export const DataUnavailable = Template.bind( {} );
DataUnavailable.storyName = 'Data Unavailable';
DataUnavailable.args = {
	setupRegistry: ( registry ) => {
		registry
			.dispatch( MODULES_SEARCH_CONSOLE )
			.receiveGetReport( [], { options: searchConsoleArgs } );

		for ( const options of analyticsArgs ) {
			registry
				.dispatch( MODULES_ANALYTICS )
				.receiveGetReport( [], { options } );
		}
	},
};

export const Error = Template.bind( {} );
Error.storyName = 'Error';
Error.args = {
	setupRegistry: ( registry ) => {
		const error = {
			code: 'test_error',
			message: 'Error message.',
			data: {},
		};

		registry
			.dispatch( MODULES_SEARCH_CONSOLE )
			.receiveError( error, 'getReport', [ searchConsoleArgs ] );
		registry
			.dispatch( MODULES_SEARCH_CONSOLE )
			.finishResolution( 'getReport', [ searchConsoleArgs ] );
	},
};

export const ErrorAnalytics = Template.bind( {} );
ErrorAnalytics.storyName = 'Error Analytics';
ErrorAnalytics.args = {
	setupRegistry: ( registry ) => {
		const error = {
			code: 'test_error',
			message: 'Error message.',
			data: {},
		};

		provideSearchConsoleMockReport( registry, searchConsoleArgs );
		registry
			.dispatch( MODULES_ANALYTICS )
			.receiveError( error, 'getReport', [ analyticsArgs[ 0 ] ] );
		registry
			.dispatch( MODULES_ANALYTICS )
			.finishResolution( 'getReport', [ analyticsArgs[ 0 ] ] );
	},
};

export const ReadyEntityDashboard = Template.bind( {} );
ReadyEntityDashboard.storyName = 'Ready Entity Dashboard';
ReadyEntityDashboard.args = {
	setupRegistry: ( registry ) => {
		provideSearchConsoleMockReport( registry, searchConsoleArgs );

		for ( const options of analyticsArgs ) {
			provideAnalyticsMockReport( registry, options );
		}
	},
};
ReadyEntityDashboard.decorators = [
	( Story ) => {
		return (
			<Provider value={ VIEW_CONTEXT_PAGE_DASHBOARD }>
				<Story />
			</Provider>
		);
	},
];

export default {
	title: 'Modules/SearchConsole/Widgets/SearchFunnelWidget',
	decorators: [
		( Story ) => (
			<div className="googlesitekit-widget">
				<div className="googlesitekit-widget__body">
					<Story />
				</div>
			</div>
		),
		( Story, { args } ) => {
			const setupRegistry = ( registry ) => {
				provideSiteInfo( registry );
				registry.dispatch( CORE_USER ).setReferenceDate( '2021-10-13' );
				registry.dispatch( CORE_USER ).receiveGetAuthentication( {
					needsReauthentication: false,
				} );

				provideModules( registry, [
					{
						active: true,
						connected: true,
						slug: 'search-console',
					},
					{
						active: true,
						connected: true,
						slug: 'analytics',
					},
				] );

				// Call story-specific setup.
				args.setupRegistry( registry );
			};

			return (
				<WithRegistrySetup func={ setupRegistry }>
					<Provider value={ VIEW_CONTEXT_DASHBOARD }>
						<Story />
					</Provider>
				</WithRegistrySetup>
			);
		},
	],
};
