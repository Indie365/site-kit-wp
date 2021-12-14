/**
 * Report Error Component Stories.
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
import ReportError from './ReportError';
import {
	createTestRegistry,
	WithTestRegistry,
	provideModules,
} from '../../../tests/js/utils';
import { ERROR_REASON_INSUFFICIENT_PERMISSIONS } from '../util/errors';

const Template = ( args ) => (
	<ReportError moduleSlug="test-module" { ...args } />
);

export const DefaultReportError = Template.bind( {} );
DefaultReportError.storyName = 'Default ReportError';
DefaultReportError.args = {
	error: {
		code: 'test-error-code',
		message: 'Test error message',
		data: {},
	},
};

export const ReportErrorWithHTMLTags = Template.bind( {} );
ReportErrorWithHTMLTags.storyName = 'ReportError with HTML tags';
ReportErrorWithHTMLTags.args = {
	error: {
		code: 'test-error-code',
		message: '<h1>Test error message with <strong>HTML</strong> tags</h1>',
		data: {},
	},
};

export const ReportErrorWithInsufficientPermissions = Template.bind( {} );
ReportErrorWithInsufficientPermissions.storyName =
	'ReportError with insufficient permissions';
ReportErrorWithInsufficientPermissions.args = {
	error: {
		code: 'test-error-code',
		message: 'Test error message',
		data: {
			reason: ERROR_REASON_INSUFFICIENT_PERMISSIONS,
		},
	},
};

export default {
	title: 'Components/ReportError',
	component: ReportError,
	decorators: [
		( Story ) => {
			const registry = createTestRegistry();
			provideModules( registry, [
				{ slug: 'test-module', name: 'Test Module' },
			] );

			return (
				<WithTestRegistry registry={ registry }>
					<Story />
				</WithTestRegistry>
			);
		},
	],
};
