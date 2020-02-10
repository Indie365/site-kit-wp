/**
 * DashboardDetailsWidgetKeywordsTable component.
 *
 * Site Kit by Google, Copyright 2019 Google LLC
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
import DashboardModuleHeader from 'GoogleComponents/dashboard/dashboard-module-header';
import Layout from 'GoogleComponents/layout/layout';

/**
 * WordPress dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { __, _x, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import SearchConsoleDashboardWidgetKeywordTable from '../dashboard/dashboard-widget-keyword-table';

class DashboardDetailsWidgetKeywordsTable extends Component {
	render() {
		return (
			<Fragment>
				<div className="
					mdc-layout-grid__cell
					mdc-layout-grid__cell--span-12
				">
					<DashboardModuleHeader
						title={ __( 'Top Queries', 'google-site-kit' ) }
						description={ __( 'What people searched for to find your page.', 'google-site-kit' ) }
					/>
				</div>
				<div className="
					mdc-layout-grid__cell
					mdc-layout-grid__cell--span-12
				">
					<Layout
						footer
						footerCtaLabel={ _x( 'Search Console', 'Service name', 'google-site-kit' ) }
						footerCtaLink={
							sprintf( 'https://search.google.com/u/1/search-console?resource_id=%s', global.googlesitekit.admin.siteURL )
						}
					>
						<SearchConsoleDashboardWidgetKeywordTable />
					</Layout>
				</div>
			</Fragment>
		);
	}
}

export default DashboardDetailsWidgetKeywordsTable;
