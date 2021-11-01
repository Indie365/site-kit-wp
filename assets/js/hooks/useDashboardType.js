/**
 * `useDashboardType` hook.
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
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	VIEW_CONTEXT_DASHBOARD,
	VIEW_CONTEXT_PAGE_DASHBOARD,
} from '../googlesitekit/constants';
import ViewContextContext from '../components/Root/ViewContextContext';

export const DASHBOARD_TYPE_MAIN = VIEW_CONTEXT_DASHBOARD;
export const DASHBOARD_TYPE_ENTITY = VIEW_CONTEXT_PAGE_DASHBOARD;

/**
 * Determines dashboard type from the view context.
 *
 * @since n.e.x.t
 *
 * @return {string|null} The type of dashboard (either `DASHBOARD_TYPE_MAIN` or `DASHBOARD_TYPE_ENTITY`; `null` if not a Unified Dashboard page).
 */
export default function useDashboardType() {
	const dashboardType = useContext( ViewContextContext );

	if (
		dashboardType === DASHBOARD_TYPE_MAIN ||
		dashboardType === DASHBOARD_TYPE_ENTITY
	) {
		return dashboardType;
	}

	return null;
}
