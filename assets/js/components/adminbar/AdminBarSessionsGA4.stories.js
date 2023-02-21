/**
 * AdminBarSessionsGA4 Component Stories.
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
import { withWidgetComponentProps } from '../../googlesitekit/widgets/util';
import {
	setupSearchConsoleAnalytics4ZeroData,
	setupSearchConsoleAnalytics4MockReports,
	setupAnalytics4GatheringData,
	setupAnalytics4Loading,
	setupAnalytics4Error,
	widgetDecorators,
} from './common.stories';
import WithRegistrySetup from '../../../../tests/js/WithRegistrySetup';
import AdminBarSessionsGA4 from './AdminBarSessionsGA4';

const WidgetWithComponentProps =
	withWidgetComponentProps( 'widget-slug' )( AdminBarSessionsGA4 );

const Template = ( { setupRegistry = () => {}, ...args } ) => (
	<WithRegistrySetup func={ setupRegistry }>
		<WidgetWithComponentProps { ...args } />
	</WithRegistrySetup>
);

export const Ready = Template.bind( {} );
Ready.storyName = 'Ready';
Ready.args = {
	setupRegistry: setupSearchConsoleAnalytics4MockReports,
};

export const GatheringData = Template.bind( {} );
GatheringData.storyName = 'GatheringData';
GatheringData.args = {
	setupRegistry: setupAnalytics4GatheringData,
};

export const ZeroData = Template.bind( {} );
ZeroData.storyName = 'Zero Data';
ZeroData.args = {
	setupRegistry: setupSearchConsoleAnalytics4ZeroData,
};

export const Loading = Template.bind( {} );
Loading.storyName = 'Loadng Data';
Loading.args = {
	setupRegistry: setupAnalytics4Loading,
};

export const Error = Template.bind( {} );
Error.storyName = 'Error Data';
Error.args = {
	setupRegistry: setupAnalytics4Error,
};

export default {
	title: 'Views/AdminBarApp/AdminBarSessionsGA4',
	decorators: widgetDecorators,
};
