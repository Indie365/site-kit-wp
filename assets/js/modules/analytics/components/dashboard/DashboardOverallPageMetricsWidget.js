/**
 * OverallPageMetricsWidget component.
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
import { __, _x } from '@wordpress/i18n';
import { isURL } from '@wordpress/url';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import {
	DATE_RANGE_OFFSET,
	MODULES_ANALYTICS,
} from '../../datastore/constants';
import { CORE_USER } from '../../../../googlesitekit/datastore/user/constants';
import { CORE_SITE } from '../../../../googlesitekit/datastore/site/constants';
import { Grid, Row, Cell } from '../../../../material-components/layout';
import PreviewBlock from '../../../../components/PreviewBlock';
import DataBlock from '../../../../components/DataBlock';
import Sparkline from '../../../../components/Sparkline';
import SourceLink from '../../../../components/SourceLink';
import whenActive from '../../../../util/when-active';
import { generateDateRangeArgs } from '../../util/report-date-range-args';
import { calculateChange, getURLPath } from '../../../../util';
import parseDimensionStringToDate from '../../util/parseDimensionStringToDate';
import { isZeroReport } from '../../util';

const { useSelect } = Data;

/**
 * Fetches Analytics report data and state for the Overall Page Metrics widget.
 *
 * @since n.e.x.t
 *
 * @typedef {Object} OverallPageMetricsReport
 * @property {Array.<Object>|undefined} report     - Analytics report data if exists, otherwise undefined.
 * @property {string}                   serviceURL - Link to relevant Google Analytics page for the report.
 * @property {boolean}                  isLoading  - Loading status for report.
 * @property {(Object|undefined)}       error      - Error object if exists, otherwise undefined.
 * @return {OverallPageMetricsReport} Analytics report data and state.
 */
function useOverallPageMetricsReport() {
	return useSelect( ( select ) => {
		const dates = select( CORE_USER ).getDateRangeDates( {
			offsetDays: DATE_RANGE_OFFSET,
			compare: true,
		} );

		const url = select( CORE_SITE ).getCurrentEntityURL();

		const args = {
			...dates,
			dimensions: [ 'ga:date' ],
			metrics: [
				{
					expression: 'ga:pageviews',
					alias: 'Pageviews',
				},
				{
					expression: 'ga:uniquePageviews',
					alias: 'Unique Pageviews',
				},
				{
					expression: 'ga:bounceRate',
					alias: 'Bounce Rate',
				},
				{
					expression: 'ga:avgSessionDuration',
					alias: 'Session Duration',
				},
			],
			url,
		};

		const report = select( MODULES_ANALYTICS ).getReport( args );

		const error = select(
			MODULES_ANALYTICS
		).getErrorForSelector( 'getReport', [ args ] );

		const isLoading = ! select(
			MODULES_ANALYTICS
		).hasFinishedResolution( 'getReport', [ args ] );

		const reportArgs = generateDateRangeArgs( dates );

		if ( isURL( url ) ) {
			reportArgs[ 'explorer-table.plotKeys' ] = '[]';
			reportArgs[ '_r.drilldown' ] = `analytics.pagePath:${ getURLPath(
				url
			) }`;
		}

		const serviceURL = select( MODULES_ANALYTICS ).getServiceReportURL(
			'visitors-overview',
			reportArgs
		);

		return {
			report,
			serviceURL,
			isLoading,
			error,
		};
	} );
}

/**
 * Parse Analytics report into data suitable for rendering the data blocks in the Overall Page Metrics widget.
 *
 * @typedef {Object} OverallPageMetricsData
 * @property {string}         metric        - Google Analytics metric identifier.
 * @property {string}         title         - Translated metric title.
 * @property {Array.<Object>} sparkLineData - Data for rendering the sparkline.
 * @property {number}         total         - Total count for the metric.
 * @property {number}         change        - Monthly change for the metric.
 *
 * @since n.e.x.t
 *
 * @param {Object} report Analytics report data.
 * @return {Array.<OverallPageMetricsData>} Array of data for rendering the data blocks in the Overall Page Metrics widget.
 */

function calculateOverallPageMetricsData( report ) {
	const metricsData = [
		{
			metric: 'ga:pageviews',
			title: __( 'Pageviews', 'google-site-kit' ),
			sparkLineData: [
				[
					{ type: 'date', label: 'Day' },
					{ type: 'number', label: 'Pageviews' },
				],
			],
			total: 0,
			change: 0,
		},
		{
			metric: 'ga:uniquePageviews',
			title: __( 'Unique Pageviews', 'google-site-kit' ),
			sparkLineData: [
				[
					{ type: 'date', label: 'Day' },
					{ type: 'number', label: 'Unique Pageviews' },
				],
			],
			total: 0,
			change: 0,
		},
		{
			metric: 'ga:bounceRate',
			title: __( 'Bounce Rate', 'google-site-kit' ),
			sparkLineData: [
				[
					{ type: 'date', label: 'Day' },
					{ type: 'number', label: 'Bounce Rate' },
				],
			],
			total: 0,
			change: 0,
		},
		{
			metric: 'ga:avgSessionDuration',
			title: __( 'Session Duration', 'google-site-kit' ),
			sparkLineData: [
				[
					{ type: 'date', label: 'Day' },
					{ type: 'number', label: 'Session Duration' },
				],
			],
			total: 0,
			change: 0,
		},
	];

	const { totals = [], rows = [] } = report?.[ 0 ]?.data || {};

	const lastMonth = totals[ 0 ]?.values || [];
	const previousMonth = totals[ 1 ]?.values || [];

	metricsData.forEach( ( metricData, index ) => {
		// We only want half the date range, having a comparison date range in the query doubles the range.
		for ( let i = Math.ceil( rows.length / 2 ); i < rows.length; i++ ) {
			const { values } = rows[ i ].metrics[ 0 ];
			const dateString = rows[ i ].dimensions[ 0 ];
			const date = parseDimensionStringToDate( dateString );

			metricData.sparkLineData.push( [ date, values[ index ] ] );
		}

		metricData.total = lastMonth[ index ] || 0;
		metricData.change = calculateChange(
			previousMonth[ index ] || 0,
			lastMonth[ index ] || 0
		);
	} );

	return metricsData;
}

function DashboardOverallPageMetricsWidget( {
	Widget,
	WidgetReportZero,
	WidgetReportError,
} ) {
	const isGatheringData = useSelect( ( select ) =>
		select( MODULES_ANALYTICS ).isGatheringData()
	);

	const {
		report,
		serviceURL,
		isLoading,
		error,
	} = useOverallPageMetricsReport();

	const Footer = () => (
		<SourceLink
			className="googlesitekit-data-block__source"
			name={ _x( 'Analytics', 'Service name', 'google-site-kit' ) }
			href={ serviceURL }
			external
		/>
	);

	if ( isLoading || isGatheringData === undefined ) {
		return (
			<Widget Footer={ Footer }>
				<PreviewBlock width="100%" height="222px" />
			</Widget>
		);
	}

	if ( error ) {
		return (
			<Widget Footer={ Footer }>
				<WidgetReportError moduleSlug="analytics" error={ error } />
			</Widget>
		);
	}

	if ( isGatheringData && isZeroReport( report ) ) {
		return (
			<Widget Footer={ Footer }>
				<WidgetReportZero moduleSlug="analytics" />
			</Widget>
		);
	}

	const data = calculateOverallPageMetricsData( report );

	return (
		<Widget Footer={ Footer }>
			<Grid>
				<Row>
					{ data.map(
						( { metric, title, sparkLineData, total, change } ) => (
							<Cell key={ metric } smSize={ 2 } lgSize={ 3 }>
								<DataBlock
									title={ title }
									datapoint={ total }
									change={ change }
									changeDataUnit="%"
									sparkline={
										<Sparkline
											data={ sparkLineData }
											change={ change }
										/>
									}
								/>
							</Cell>
						)
					) }
				</Row>
			</Grid>
		</Widget>
	);
}

export default whenActive( { moduleName: 'analytics' } )(
	DashboardOverallPageMetricsWidget
);
