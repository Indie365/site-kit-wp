/**
 * TopRecentTrendingPages Component Stories.
 *
 * Site Kit by Google, Copyright 2023 Google LLC
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
import { ERROR_REASON_INSUFFICIENT_PERMISSIONS } from '../../../../util/errors';
import { MODULES_ANALYTICS_4 } from '../../datastore/constants';
import { KEY_METRICS_WIDGETS } from '../../../../components/KeyMetrics/key-metrics-widgets';
import { KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES } from '../../../../googlesitekit/datastore/user/constants';
import { provideModules } from '../../../../../../tests/js/utils';
import { withWidgetComponentProps } from '../../../../googlesitekit/widgets/util';
import WithRegistrySetup from '../../../../../../tests/js/WithRegistrySetup';
import TopRecentTrendingPages from './TopRecentTrendingPages';
import { provideCustomDimensionError } from '../../utils/custom-dimensions';
import {
	STRATEGY_ZIP,
	getAnalytics4MockResponse,
	provideAnalytics4MockReport,
} from '../../utils/data-mock';
import { getDateString, getPreviousDate } from '../../../../util';
import { replaceValuesInAnalytics4ReportWithZeroData } from '../../../../../../.storybook/utils/zeroReports';

const WidgetWithComponentProps = withWidgetComponentProps(
	KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES
)( TopRecentTrendingPages );

const today = new Date();
const todayDateString = getDateString( today );

const yesterday = getPreviousDate( todayDateString, 1 );
const twoDaysAgo = getPreviousDate( todayDateString, 2 );
const threeDaysAgo = getPreviousDate( todayDateString, 3 );

const reportOptions = {
	startDate: threeDaysAgo,
	endDate: yesterday,
	dimensions: [ 'pagePath' ],
	dimensionFilters: {
		'customEvent:googlesitekit_post_date': {
			filterType: 'inListFilter',
			value: [
				yesterday.replace( /-/g, '' ),
				twoDaysAgo.replace( /-/g, '' ),
				threeDaysAgo.replace( /-/g, '' ),
			],
		},
	},
	metrics: [ { name: 'screenPageViews' } ],
	orderby: [
		{
			metric: {
				metricName: 'screenPageViews',
			},
			desc: true,
		},
	],
	limit: 3,
};

const pageTitlesReportOptions = {
	startDate: threeDaysAgo,
	endDate: yesterday,
	dimensionFilters: {
		pagePath: new Array( 3 )
			.fill( '' )
			.map( ( _, i ) => `/test-post-${ i + 1 }/` )
			.sort(),
	},
	dimensions: [ 'pagePath', 'pageTitle' ],
	metrics: [ { name: 'screenPageViews' } ],
	orderby: [ { metric: { metricName: 'screenPageViews' }, desc: true } ],
	limit: 15,
};

const Template = ( { setupRegistry, ...args } ) => (
	<WithRegistrySetup func={ setupRegistry }>
		<WidgetWithComponentProps { ...args } />
	</WithRegistrySetup>
);

export const Ready = Template.bind( {} );
Ready.storyName = 'Ready';
Ready.args = {
	setupRegistry: ( registry ) => {
		registry.dispatch( MODULES_ANALYTICS_4 ).setSettings( {
			propertyID: '123456789',
			availableCustomDimensions: [
				KEY_METRICS_WIDGETS[ KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES ]
					.requiredCustomDimensions?.[ 0 ],
			],
		} );

		const pageTitlesReport = getAnalytics4MockResponse(
			pageTitlesReportOptions,
			// Use the zip combination strategy to ensure a one-to-one mapping of page paths to page titles.
			// Otherwise, by using the default cartesian product of dimension values, the resulting output will have non-matching
			// page paths to page titles.
			{ dimensionCombinationStrategy: STRATEGY_ZIP }
		);

		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.receiveGetReport( pageTitlesReport, {
				options: pageTitlesReportOptions,
			} );

		provideAnalytics4MockReport( registry, reportOptions );
	},
};
Ready.parameters = {
	features: [ 'newsKeyMetrics' ],
};
Ready.scenario = {
	label: 'KeyMetrics/TopRecentTrendingPages/Ready',
};

export const Loading = Template.bind( {} );
Loading.storyName = 'Loading';
Loading.args = {
	setupRegistry: ( { dispatch } ) => {
		dispatch( MODULES_ANALYTICS_4 ).setSettings( {
			propertyID: '12345',
			availableCustomDimensions: [
				KEY_METRICS_WIDGETS[ KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES ]
					.requiredCustomDimensions?.[ 0 ],
			],
		} );

		dispatch( MODULES_ANALYTICS_4 ).startResolution( 'getReport', [
			reportOptions,
		] );
	},
};
Loading.parameters = {
	features: [ 'newsKeyMetrics' ],
};
Loading.scenario = {
	label: 'KeyMetrics/TopRecentTrendingPages/Loading',
};

export const ZeroData = Template.bind( {} );
ZeroData.storyName = 'Zero Data';
ZeroData.args = {
	setupRegistry: ( { dispatch } ) => {
		const report = getAnalytics4MockResponse( reportOptions );
		const zeroReport =
			replaceValuesInAnalytics4ReportWithZeroData( report );

		dispatch( MODULES_ANALYTICS_4 ).receiveGetReport( zeroReport, {
			options: reportOptions,
		} );
		dispatch( MODULES_ANALYTICS_4 ).setSettings( {
			propertyID: '12345',
			availableCustomDimensions: [
				KEY_METRICS_WIDGETS[ KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES ]
					.requiredCustomDimensions?.[ 0 ],
			],
		} );
	},
};
ZeroData.scenario = {
	label: 'KeyMetrics/TopRecentTrendingPages/ZeroData',
};

export const Error = Template.bind( {} );
Error.storyName = 'Error';
Error.args = {
	setupRegistry: ( { dispatch } ) => {
		const errorObject = {
			code: 400,
			message: 'Test error message. ',
			data: {
				status: 400,
				reason: 'badRequest',
			},
			selectorData: {
				storeName: 'modules/analytics-4',
				name: 'getReport',
				args: [ reportOptions ],
			},
		};

		dispatch( MODULES_ANALYTICS_4 ).receiveError(
			errorObject,
			'getReport',
			[ reportOptions ]
		);

		dispatch( MODULES_ANALYTICS_4 ).finishResolution( 'getReport', [
			reportOptions,
		] );

		dispatch( MODULES_ANALYTICS_4 ).setSettings( {
			propertyID: '12345',
			availableCustomDimensions: [
				KEY_METRICS_WIDGETS[ KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES ]
					.requiredCustomDimensions?.[ 0 ],
			],
		} );
	},
};
Error.scenario = {
	label: 'KeyMetrics/TopRecentTrendingPages/Error',
	delay: 250,
};

export const ErrorMissingCustomDimensions = Template.bind( {} );
ErrorMissingCustomDimensions.storyName = 'Error - Missing custom dimensions';
ErrorMissingCustomDimensions.args = {
	setupRegistry: () => {},
};
ErrorMissingCustomDimensions.parameters = {
	features: [ 'newsKeyMetrics' ],
};

export const ErrorCustomDimensionsInsufficientPermissions = Template.bind( {} );
ErrorCustomDimensionsInsufficientPermissions.storyName =
	'Error - Custom dimensions creation - Insufficient Permissions';
ErrorCustomDimensionsInsufficientPermissions.args = {
	setupRegistry: ( registry ) => {
		const error = {
			code: 'test-error-code',
			message: 'Test error message',
			data: {
				reason: ERROR_REASON_INSUFFICIENT_PERMISSIONS,
			},
		};

		registry.dispatch( MODULES_ANALYTICS_4 ).setPropertyID( '123456789' );

		provideCustomDimensionError( registry, {
			customDimension:
				KEY_METRICS_WIDGETS[ KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES ]
					.requiredCustomDimensions?.[ 0 ],
			error,
		} );
	},
};
ErrorCustomDimensionsInsufficientPermissions.parameters = {
	features: [ 'newsKeyMetrics' ],
};

export const ErrorCustomDimensionsGeneric = Template.bind( {} );
ErrorCustomDimensionsGeneric.storyName =
	'Error - Custom dimensions creation - Generic';
ErrorCustomDimensionsGeneric.args = {
	setupRegistry: ( registry ) => {
		const error = {
			code: 'test-error-code',
			message: 'Test error message',
			data: {
				reason: 'test-error-reason',
			},
		};

		registry.dispatch( MODULES_ANALYTICS_4 ).setPropertyID( '123456789' );

		provideCustomDimensionError( registry, {
			customDimension:
				KEY_METRICS_WIDGETS[ KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES ]
					.requiredCustomDimensions?.[ 0 ],
			error,
		} );
	},
};
ErrorCustomDimensionsGeneric.parameters = {
	features: [ 'newsKeyMetrics' ],
};

export default {
	title: 'Key Metrics/TopRecentTrendingPages',
	component: TopRecentTrendingPages,
	decorators: [
		( Story, { args } ) => {
			const setupRegistry = ( registry ) => {
				provideModules( registry, [
					{
						slug: 'analytics-4',
						active: true,
						connected: true,
					},
				] );

				// Call story-specific setup.
				args.setupRegistry( registry );
			};

			return (
				<WithRegistrySetup func={ setupRegistry }>
					<Story />
				</WithRegistrySetup>
			);
		},
	],
};
