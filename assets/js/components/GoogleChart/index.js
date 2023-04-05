/**
 * GoogleChart component.
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
/* eslint-disable react-hooks/exhaustive-deps */

/* Ensures `google` global is undefined before loading `react-google-charts` library */
import '../../util/initialize-google-global';

/**
 * External dependencies
 */
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';
import { useMount } from 'react-use';

/**
 * WordPress dependencies
 */
import { useInstanceId as useInstanceID } from '@wordpress/compose';
import {
	Fragment,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from '@wordpress/element';
import { Icon, info } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { Tooltip } from 'googlesitekit-components';
import PreviewBlock from '../PreviewBlock';
import { CORE_USER } from '../../googlesitekit/datastore/user/constants';
import GatheringDataNotice, { NOTICE_STYLE } from '../GatheringDataNotice';
import Data from 'googlesitekit-data';
import GoogleChartErrorHandler from '../GoogleChartErrorHandler';
import { CORE_UI } from '../../googlesitekit/datastore/ui/constants';
import useViewContext from '../../hooks/useViewContext';
import { isSiteKitScreen } from '../../util/is-site-kit-screen';
import {
	getFilteredChartData,
	getLoadingDimensions,
	getCombinedChartEvents,
	getChartOptions,
} from './utils';
import invariant from 'invariant';
const { useDispatch, useSelect } = Data;

export default function GoogleChart( props ) {
	const {
		chartEvents,
		chartType,
		children,
		className,
		data,
		dateMarkers,
		getChartWrapper,
		height,
		loaded,
		loadingHeight,
		loadingWidth,
		onMouseOver,
		onMouseOut,
		onReady,
		onSelect,
		selectedStats,
		width,
		options,
		gatheringData,
		...otherProps
	} = props;

	const instanceID = useInstanceID( GoogleChart );

	const { startDate, endDate } = useSelect( ( select ) =>
		select( CORE_USER ).getDateRangeDates()
	);

	const viewContext = useViewContext();

	const googleChartsCollisionError = useSelect( ( select ) =>
		select( CORE_UI ).getValue( 'googleChartsCollisionError' )
	);

	const [ isChartLoaded, setIsChartLoaded ] = useState( false );

	const { setValue } = useDispatch( CORE_UI );

	const filteredData = getFilteredChartData( data, selectedStats );

	const loadingShape = chartType === 'PieChart' ? 'circular' : 'square';
	const loadingDimensions = getLoadingDimensions(
		loadingHeight,
		height,
		loadingWidth,
		width
	);

	const loader = (
		<div className="googlesitekit-chart-loading">
			<PreviewBlock
				className="googlesitekit-chart-loading__wrapper"
				shape={ loadingShape }
				{ ...loadingDimensions }
			/>
		</div>
	);

	const chartWrapperRef = useRef();
	const googleRef = useRef();

	// Don't load Google Charts if another script on the page has already loaded
	// Google Charts.
	//
	// If another plugin loads Google Charts somewhere on the page, our charts
	// will likely encounter an error due to a version mismatch.
	//
	// This is because Google Charts is a singleton, and if another plugin loads
	// it first, our charts will use the same instance of Google Charts.
	//
	// See:
	// * https://github.com/google/site-kit-wp/issues/6350
	// * https://github.com/google/site-kit-wp/issues/6355
	useMount( () => {
		if ( googleChartsCollisionError !== undefined ) {
			return;
		}

		// If we're on a Site Kit screen, we want "priority" over the
		// `google.charts` global so we don't render a bunch of charts errors,
		// see: https://github.com/google/site-kit-wp/issues/6439#issuecomment-1404491940
		//
		// The only way to do this is to remove the `google.charts` global
		// and allow the `react-google-charts` library to re-initialize it.
		if ( isSiteKitScreen( viewContext ) && global?.google?.charts ) {
			global.google.charts = undefined;
		}

		if ( ! isSiteKitScreen( viewContext ) && global?.google?.charts ) {
			setValue( 'googleChartsCollisionError', true );
		} else {
			setValue( 'googleChartsCollisionError', false );
		}
	} );

	useEffect( () => {
		// Remove all event listeners after the component has unmounted.
		return () => {
			// eslint-disable-next-line no-unused-expressions
			if ( googleRef.current && chartWrapperRef.current ) {
				const { events } = googleRef.current.visualization;
				events.removeAllListeners( chartWrapperRef.current.getChart() );
				events.removeAllListeners( chartWrapperRef.current );
			}
		};
	}, [] );

	// These event listeners are added manually to the current chart because
	// `react-google-charts` doesn't support `mouseOver` or `mouseOut` events
	// in its `chartEvents` prop.
	// See: https://github.com/google/site-kit-wp/pull/2805#discussion_r579172660
	useLayoutEffect( () => {
		if ( onMouseOver ) {
			// eslint-disable-next-line no-unused-expressions
			googleRef.current?.visualization.events.addListener(
				chartWrapperRef.current.getChart(),
				'onmouseover',
				( event ) => {
					onMouseOver( event, {
						chartWrapper: chartWrapperRef.current,
						google: googleRef.current,
					} );
				}
			);
		}

		if ( onMouseOut ) {
			// eslint-disable-next-line no-unused-expressions
			googleRef.current?.visualization.events.addListener(
				chartWrapperRef.current.getChart(),
				'onmouseout',
				( event ) => {
					onMouseOut( event, {
						chartWrapper: chartWrapperRef.current,
						google: googleRef.current,
					} );
				}
			);
		}
	}, [ onMouseOver, onMouseOut ] );

	/**
	 * Adds any "key date" vertical lines/tooltips to the charts.
	 */
	const addKeyDateLinesToChart = () => {
		if ( ! chartWrapperRef.current ) {
			return;
		}

		if ( ! dateMarkers.length ) {
			return;
		}

		const chart = chartWrapperRef.current.getChart();
		const chartLayoutInterface = chart?.getChartLayoutInterface();
		const chartArea = chartLayoutInterface?.getChartAreaBoundingBox();
		const dataTable = chartWrapperRef.current?.getDataTable();

		if ( ! chartLayoutInterface || ! chartArea || ! dataTable ) {
			return;
		}

		// Add the dotted line and tooltip for each date marker.
		dateMarkers.forEach( ( dateMarker, index ) => {
			const dateFromMarker = new Date( Date.parse( dateMarker.date ) );

			const chartLine = document.querySelector(
				`#googlesitekit-chart__date-marker-line--${ instanceID }-${ index }`
			);
			invariant(
				chartLine,
				`#googlesitekit-chart__date-marker-line--${ instanceID }-${ index } is missing from the DOM, but required to render date markers.`
			);

			// Align the dotted line with the date for this marker.
			chartLine.style.left =
				Math.floor(
					chartLayoutInterface.getXLocation( dateFromMarker )
				) -
				1 +
				'px';
			chartLine.style.top = Math.floor( chartArea.top ) + 18 + 'px';
			chartLine.style.height = Math.floor( chartArea.height ) - 18 + 'px';
			chartLine.style.opacity = 1;

			// Text is optional, so only modify the DOM elements for the tooltip
			// text if the property was provided.
			if ( dateMarker.text ) {
				const tooltip = document.querySelector(
					`#googlesitekit-chart__date-marker-tooltip--${ instanceID }-${ index }`
				);
				invariant(
					tooltip,
					`#googlesitekit-chart__date-marker-tooltip--${ instanceID }-${ index } is missing from the DOM, but required to render date marker tooltips.`
				);

				// Align the tooltip component with the date line.
				tooltip.style.left =
					Math.floor(
						chartLayoutInterface.getXLocation( dateFromMarker )
					) -
					9 +
					'px';
				tooltip.style.top = Math.floor( chartArea.top ) + 'px';
				tooltip.style.opacity = 1;
			}
		} );
	};

	if ( googleChartsCollisionError ) {
		return null;
	}

	if ( ! loaded ) {
		return (
			<div
				className={ classnames(
					'googlesitekit-chart',
					'googlesitekit-chart-loading__forced',
					className
				) }
			>
				{ loader }
			</div>
		);
	}

	const combinedChartEvents = getCombinedChartEvents(
		chartEvents,
		onReady,
		onSelect
	);

	const chartOptions = getChartOptions(
		options,
		gatheringData,
		chartType,
		startDate,
		endDate
	);

	return (
		<GoogleChartErrorHandler>
			<div
				className={ classnames(
					'googlesitekit-chart',
					`googlesitekit-chart--${ chartType }`,
					className
				) }
				tabIndex={ -1 }
			>
				<Chart
					className="googlesitekit-chart__inner"
					chartEvents={ combinedChartEvents }
					chartType={ chartType }
					chartVersion="49"
					data={ filteredData }
					loader={ loader }
					height={ height }
					getChartWrapper={ ( chartWrapper, google ) => {
						// An issue with `react-google-charts` v4 causes the chart to
						// render the overlay before the chart in some cases when using
						// their own `onLoad` callback. This is a workaround to prevent
						// that issue but still provide notice that the chart is loaded.
						// See: https://github.com/google/site-kit-wp/issues/4945
						if ( ! isChartLoaded ) {
							setIsChartLoaded( true );
						}

						// Remove all the event listeners on the old chart before we draw
						// a new one. Only run this if the old chart and the new chart
						// aren't the same reference though, otherwise we'll remove
						// existing `onReady` events and other event listeners, which will
						// cause bugs.
						if ( chartWrapper !== chartWrapperRef.current ) {
							// eslint-disable-next-line no-unused-expressions
							googleRef.current?.visualization.events.removeAllListeners(
								chartWrapperRef.current?.getChart()
							);
							// eslint-disable-next-line no-unused-expressions
							googleRef.current?.visualization.events.removeAllListeners(
								chartWrapperRef.current
							);
						}

						chartWrapperRef.current = chartWrapper;
						googleRef.current = google;

						if ( getChartWrapper ) {
							getChartWrapper( chartWrapper, google );
						}

						// Wait to run the code that adds the key date lines to the chart
						// until the next tick. This is to ensure that the chart has
						// finished rendering before we try to add the lines.
						//
						// If we don't do this, the `chart` variable (from
						// `chartWrapper.getChart()`) will be `null`.
						//
						// TODO: Remove this setTimeout and use a Google Charts "after
						// rendered" event, if possible.
						setTimeout( () => {
							addKeyDateLinesToChart();
						}, 0 );
					} }
					width={ width }
					options={ chartOptions }
					{ ...otherProps }
				/>
				{ gatheringData && isChartLoaded && (
					<GatheringDataNotice style={ NOTICE_STYLE.OVERLAY } />
				) }
				{ !! dateMarkers.length &&
					dateMarkers.map( ( marker, index ) => {
						return (
							<Fragment
								key={ `googlesitekit-chart__date-marker--${ instanceID }-${ index }` }
							>
								<div
									id={ `googlesitekit-chart__date-marker-line--${ instanceID }-${ index }` }
									className="googlesitekit-chart__date-marker-line"
								/>
								{ marker.text && (
									<div
										id={ `googlesitekit-chart__date-marker-tooltip--${ instanceID }-${ index }` }
										className="googlesitekit-chart__date-marker-tooltip"
									>
										<Tooltip title={ marker.text }>
											<span>
												<Icon
													fill="currentColor"
													icon={ info }
													size={ 18 }
												/>
											</span>
										</Tooltip>
									</div>
								) }
							</Fragment>
						);
					} ) }
				{ children }
			</div>
		</GoogleChartErrorHandler>
	);
}

GoogleChart.propTypes = {
	className: PropTypes.string,
	children: PropTypes.node,
	chartEvents: PropTypes.arrayOf(
		PropTypes.shape( {
			eventName: PropTypes.string,
			callback: PropTypes.func,
		} )
	),
	// Note: technically we support all types of charts that `react-google-charts`
	// supports, which is _all_ chart types from Google Charts. But we only list
	// the charts currently used in our codebase here, and only ones that we have
	// explicit support/styles/handling for.
	// See: https://github.com/google/site-kit-wp/pull/2916#discussion_r626620601
	chartType: PropTypes.oneOf( [ 'LineChart', 'PieChart' ] ).isRequired,
	data: PropTypes.array,
	dateMarkers: PropTypes.arrayOf(
		PropTypes.shape( {
			/**
			 * The date to mark on the chart, in the format `'YYYY-MM-DD'`.
			 */
			date: PropTypes.string.isRequired,
			/**
			 * Text to display in a tooltip when the date marker is hovered.
			 */
			text: PropTypes.string,
		} )
	),
	getChartWrapper: PropTypes.func,
	height: PropTypes.string,
	loaded: PropTypes.bool,
	loadingHeight: PropTypes.string,
	loadingWidth: PropTypes.string,
	onMouseOut: PropTypes.func,
	onMouseOver: PropTypes.func,
	onReady: PropTypes.func,
	onSelect: PropTypes.func,
	selectedStats: PropTypes.arrayOf( PropTypes.number ),
	width: PropTypes.string,
	options: PropTypes.object,
	gatheringData: PropTypes.bool,
};

GoogleChart.defaultProps = {
	...Chart.defaultProps,
	dateMarkers: [],
	gatheringData: false,
	loaded: true,
};
