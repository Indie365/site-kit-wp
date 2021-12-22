/**
 * ModuleOverviewWidget component.
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
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_USER } from '../../../../../googlesitekit/datastore/user/constants';
import {
	DATE_RANGE_OFFSET,
	MODULES_ANALYTICS,
} from '../../../datastore/constants';
import { isZeroReport } from '../../../util';
import PreviewBlock from '../../../../../components/PreviewBlock';
import Header from './Header';
import Overview from './Overview';
import SiteStats from './SiteStats';
const { useSelect, useInViewSelect } = Data;

export default function ModuleOverviewWidget( props ) {
	const { Widget, WidgetReportError, WidgetReportZero } = props;

	const [ selectedStat, setSelectedState ] = useState( 0 );

	const isGatheringData = useInViewSelect( ( select ) =>
		select( MODULES_ANALYTICS ).isGatheringData()
	);

	const dates = useSelect( ( select ) =>
		select( CORE_USER ).getDateRangeDates( {
			compare: true,
			offsetDays: DATE_RANGE_OFFSET,
		} )
	);

	const overviewArgs = {
		...dates,
		metrics: [
			'ga:users',
			'ga:sessions',
			'ga:bounceRate',
			'ga:avgSessionDuration',
		],
	};

	const statsArgs = {
		...dates,
		dimensions: 'ga:date',
		metrics: [
			'ga:users',
			'ga:sessions',
			'ga:bounceRate',
			'ga:avgSessionDuration',
		],
	};

	const overviewLoaded = useSelect( ( select ) =>
		select( MODULES_ANALYTICS ).hasFinishedResolution( 'getReport', [
			overviewArgs,
		] )
	);

	const overviewReport = useInViewSelect( ( select ) =>
		select( MODULES_ANALYTICS ).getReport( overviewArgs )
	);

	const overviewError = useSelect( ( select ) =>
		select( MODULES_ANALYTICS ).getErrorForSelector( 'getReport', [
			overviewArgs,
		] )
	);

	const statsLoaded = useSelect( ( select ) =>
		select( MODULES_ANALYTICS ).hasFinishedResolution( 'getReport', [
			statsArgs,
		] )
	);

	const statsReport = useInViewSelect( ( select ) =>
		select( MODULES_ANALYTICS ).getReport( statsArgs )
	);

	const statsError = useSelect( ( select ) =>
		select( MODULES_ANALYTICS ).getErrorForSelector( 'getReport', [
			statsArgs,
		] )
	);

	if ( ! overviewLoaded || ! statsLoaded || isGatheringData === undefined ) {
		return (
			<Widget Header={ Header } noPadding>
				<PreviewBlock width="100%" height="190px" padding />
				<PreviewBlock width="100%" height="270px" padding />
			</Widget>
		);
	}

	if ( overviewError || statsError ) {
		return (
			<Widget Header={ Header }>
				<WidgetReportError
					moduleSlug="analytics"
					error={ overviewError || statsError }
				/>
			</Widget>
		);
	}

	if ( isGatheringData && isZeroReport( overviewReport ) ) {
		return (
			<Widget Header={ Header }>
				<WidgetReportZero moduleSlug="analytics" />
			</Widget>
		);
	}

	return (
		<Widget Header={ Header } noPadding>
			<Overview
				report={ overviewReport }
				selectedStat={ selectedStat }
				handleStatSelection={ setSelectedState }
			/>

			<SiteStats selectedStat={ selectedStat } report={ statsReport } />
		</Widget>
	);
}

ModuleOverviewWidget.propTypes = {
	Widget: PropTypes.elementType.isRequired,
	WidgetReportError: PropTypes.elementType.isRequired,
	WidgetReportZero: PropTypes.elementType.isRequired,
};
