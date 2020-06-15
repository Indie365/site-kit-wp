/**
 * DashboardSpeed component.
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
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Layout from '../../../components/layout/layout';
import DashboardModuleHeader from '../../../components/dashboard/dashboard-module-header';
import DashboardPageSpeed from '../components/DashboardPageSpeed';

function DashboardSpeed() {
	const description = global.googlesitekit.permaLink ? __( 'How fast this page is.', 'google-site-kit' ) : __( 'How fast your home page is.', 'google-site-kit' );

	return (
		<Fragment>
			<div id="googlesitekit-pagespeed-header" className="
					mdc-layout-grid__cell
					mdc-layout-grid__cell--span-12
				">
				<DashboardModuleHeader
					title={ __( 'Speed', 'google-site-kit' ) }
					description={ description }
				/>
			</div>
			<div className="
				mdc-layout-grid__cell
				mdc-layout-grid__cell--span-12
			">
				<Layout className="googlesitekit-pagespeed-report">
					<DashboardPageSpeed />
				</Layout>
			</div>
		</Fragment>
	);
}

export default DashboardSpeed;
