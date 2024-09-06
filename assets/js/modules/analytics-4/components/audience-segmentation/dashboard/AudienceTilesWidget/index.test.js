/**
 * AudienceTilesWidget component tests.
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
import AudienceTilesWidget from '.';
import { render } from '../../../../../../../../tests/js/test-utils';
import {
	createTestRegistry,
	muteFetch,
	provideModuleRegistrations,
	provideModules,
	provideUserAuthentication,
} from '../../../../../../../../tests/js/utils';
import { CORE_USER } from '../../../../../../googlesitekit/datastore/user/constants';
import { withWidgetComponentProps } from '../../../../../../googlesitekit/widgets/util';
import { availableAudiences } from '../../../../datastore/__fixtures__';
import {
	MODULES_ANALYTICS_4,
	DATE_RANGE_OFFSET,
} from '../../../../datastore/constants';
import { getAnalytics4MockResponse } from '../../../../utils/data-mock';

/**
 * Generates mock response for audience tiles component.
 *
 * @since 1.135.0
 *
 * @param {Object}        registry            Data registry object.
 * @param {Array<string>} configuredAudiences Array of audience resource names.
 */
function provideAudienceTilesMockReport( registry, configuredAudiences ) {
	const dates = registry.select( CORE_USER ).getDateRangeDates( {
		offsetDays: DATE_RANGE_OFFSET,
		compare: true,
	} );

	const { startDate, endDate } = dates;

	const reportOptions = {
		dimensions: [ { name: 'audienceResourceName' } ],
		metrics: [
			{ name: 'totalUsers' },
			{ name: 'sessionsPerUser' },
			{ name: 'screenPageViewsPerSession' },
			{ name: 'screenPageViews' },
		],
	};

	const options = {
		...dates,
		...reportOptions,
		dimensionFilters: {
			audienceResourceName: configuredAudiences,
		},
	};

	const reportData = getAnalytics4MockResponse( options );

	registry.dispatch( MODULES_ANALYTICS_4 ).receiveGetReport( reportData, {
		options,
	} );

	registry
		.dispatch( MODULES_ANALYTICS_4 )
		.finishResolution( 'getReport', [ options ] );

	const totalPageviewsReportOptions = {
		startDate,
		endDate,
		metrics: [ { name: 'screenPageViews' } ],
	};

	const totalPageviewsReportData = getAnalytics4MockResponse( options );

	registry
		.dispatch( MODULES_ANALYTICS_4 )
		.receiveGetReport( totalPageviewsReportData, {
			options: totalPageviewsReportOptions,
		} );

	registry
		.dispatch( MODULES_ANALYTICS_4 )
		.finishResolution( 'getReport', [ totalPageviewsReportOptions ] );

	const topCitiesReportOptions = {
		startDate,
		endDate,
		dimensions: [ 'city' ],
		metrics: [ { name: 'totalUsers' } ],
		orderby: [
			{
				metric: {
					metricName: 'totalUsers',
				},
				desc: true,
			},
		],
		limit: 3,
	};

	const topContentReportOptions = {
		startDate,
		endDate,
		dimensions: [ 'pagePath' ],
		metrics: [ { name: 'screenPageViews' } ],
		orderby: [ { metric: { metricName: 'screenPageViews' }, desc: true } ],
		limit: 3,
	};

	const topContentPageTitlesReportOptions = {
		startDate,
		endDate,
		dimensions: [ 'pagePath', 'pageTitle' ],
		metrics: [ { name: 'screenPageViews' } ],
		orderby: [ { metric: { metricName: 'screenPageViews' }, desc: true } ],
		limit: 15,
	};

	[
		topCitiesReportOptions,
		topContentReportOptions,
		topContentPageTitlesReportOptions,
	].forEach( ( value ) => {
		configuredAudiences.forEach( ( audienceResourceName ) => {
			const individualReportOptions = {
				...value,
				dimensionFilters: {
					audienceResourceName,
				},
			};

			const individualReportData = getAnalytics4MockResponse(
				individualReportOptions
			);

			registry
				.dispatch( MODULES_ANALYTICS_4 )
				.receiveGetReport( individualReportData, {
					options: individualReportOptions,
				} );

			registry
				.dispatch( MODULES_ANALYTICS_4 )
				.finishResolution( 'getReport', [ individualReportOptions ] );
		} );
	} );
}

describe( 'AudienceTilesWidget', () => {
	let registry;

	const WidgetWithComponentProps = withWidgetComponentProps(
		'analyticsAudienceTiles'
	)( AudienceTilesWidget );

	const audienceSettingsRegExp = new RegExp(
		'^/google-site-kit/v1/core/user/data/audience-settings'
	);

	beforeEach( () => {
		registry = createTestRegistry();
		provideModules( registry, [
			{
				active: true,
				connected: true,
				slug: 'analytics-4',
			},
		] );
		provideModuleRegistrations( registry );
		provideUserAuthentication( registry );
		registry.dispatch( CORE_USER ).setReferenceDate( '2021-01-28' );
		registry.dispatch( MODULES_ANALYTICS_4 ).receiveGetSettings( {
			availableCustomDimensions: [ 'googlesitekit_post_type' ],
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should not render when availableAudiences and configuredAudiences are not loaded', async () => {
		muteFetch( audienceSettingsRegExp );

		const { container, waitForRegistry } = render(
			<WidgetWithComponentProps />,
			{
				registry,
			}
		);

		await waitForRegistry();

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should not render when availableAudiences is not loaded', async () => {
		registry.dispatch( CORE_USER ).receiveGetAudienceSettings( {
			configuredAudiences: [ 'properties/12345/audiences/1' ],
			isAudienceSegmentationWidgetHidden: false,
		} );

		const { container, waitForRegistry } = render(
			<WidgetWithComponentProps />,
			{
				registry,
			}
		);

		await waitForRegistry();

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should not render when configuredAudiences is not loaded', async () => {
		muteFetch( audienceSettingsRegExp );

		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.setAvailableAudiences( availableAudiences );

		const { container, waitForRegistry } = render(
			<WidgetWithComponentProps />,
			{
				registry,
			}
		);

		await waitForRegistry();

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should not render when there is no available audience', async () => {
		registry.dispatch( MODULES_ANALYTICS_4 ).setAvailableAudiences( [] );

		registry.dispatch( CORE_USER ).receiveGetAudienceSettings( {
			configuredAudiences: [ 'properties/12345/audiences/9' ],
			isAudienceSegmentationWidgetHidden: false,
		} );

		const { container, waitForRegistry } = render(
			<WidgetWithComponentProps />,
			{
				registry,
			}
		);

		await waitForRegistry();

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should not render when there is no configured audience', async () => {
		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.setAvailableAudiences( availableAudiences );

		registry.dispatch( CORE_USER ).receiveGetAudienceSettings( {
			configuredAudiences: [],
			isAudienceSegmentationWidgetHidden: false,
		} );

		const { container, waitForRegistry } = render(
			<WidgetWithComponentProps />,
			{
				registry,
			}
		);

		await waitForRegistry();

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should not render when configuredAudiences is null (not set)', async () => {
		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.setAvailableAudiences( availableAudiences );

		registry.dispatch( CORE_USER ).receiveGetAudienceSettings( {
			configuredAudiences: null,
			isAudienceSegmentationWidgetHidden: false,
		} );

		const { container, waitForRegistry } = render(
			<WidgetWithComponentProps />,
			{
				registry,
			}
		);

		await waitForRegistry();

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should not render when there is no matching audience', async () => {
		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.setAvailableAudiences( availableAudiences );

		registry.dispatch( CORE_USER ).receiveGetAudienceSettings( {
			configuredAudiences: [ 'properties/12345/audiences/9' ],
			isAudienceSegmentationWidgetHidden: false,
		} );

		const { container, waitForRegistry } = render(
			<WidgetWithComponentProps />,
			{
				registry,
			}
		);

		await waitForRegistry();

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render when configured audience is matching available audiences', async () => {
		const configuredAudiences = [ 'properties/12345/audiences/1' ];

		registry.dispatch( MODULES_ANALYTICS_4 ).receiveGetSettings( {
			availableAudiencesLastSyncedAt: ( Date.now() - 1000 ) / 1000,
		} );

		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.setAvailableAudiences( availableAudiences );

		registry.dispatch( CORE_USER ).receiveGetAudienceSettings( {
			configuredAudiences,
			isAudienceSegmentationWidgetHidden: false,
		} );

		provideAudienceTilesMockReport( registry, configuredAudiences );

		const { container, waitForRegistry } = render(
			<WidgetWithComponentProps />,
			{
				registry,
			}
		);

		await waitForRegistry();

		expect( container ).toMatchSnapshot();
	} );

	it( 'should render when all configured audiences are matching available audiences', async () => {
		const configuredAudiences = [
			'properties/12345/audiences/1',
			'properties/12345/audiences/3',
		];

		registry.dispatch( MODULES_ANALYTICS_4 ).receiveGetSettings( {
			availableAudiencesLastSyncedAt: ( Date.now() - 1000 ) / 1000,
		} );

		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.setAvailableAudiences( availableAudiences );

		registry.dispatch( CORE_USER ).receiveGetAudienceSettings( {
			configuredAudiences,
			isAudienceSegmentationWidgetHidden: false,
		} );

		provideAudienceTilesMockReport( registry, configuredAudiences );

		const { container, waitForRegistry } = render(
			<WidgetWithComponentProps />,
			{
				registry,
			}
		);

		await waitForRegistry();

		expect( container ).toMatchSnapshot();
	} );

	it( 'should not render audiences that are not available (archived)', async () => {
		const configuredAudiences = [
			'properties/12345/audiences/1', // Available.
			'properties/12345/audiences/9', // Not available (archived).
		];
		registry.dispatch( MODULES_ANALYTICS_4 ).receiveGetSettings( {
			availableAudiencesLastSyncedAt: ( Date.now() - 1000 ) / 1000,
		} );

		registry
			.dispatch( MODULES_ANALYTICS_4 )
			.setAvailableAudiences( availableAudiences );

		registry.dispatch( CORE_USER ).receiveGetAudienceSettings( {
			configuredAudiences,
			isAudienceSegmentationWidgetHidden: false,
		} );

		provideAudienceTilesMockReport( registry, configuredAudiences );

		const { container, waitForRegistry } = render(
			<WidgetWithComponentProps />,
			{
				registry,
			}
		);

		await waitForRegistry();

		// Only the available audience should be rendered, the archived one should be filtered out.
		expect(
			container.querySelectorAll(
				'.googlesitekit-audience-segmentation-tile'
			).length
		).toBe( 1 );
		expect( container ).toMatchSnapshot();
	} );
} );
