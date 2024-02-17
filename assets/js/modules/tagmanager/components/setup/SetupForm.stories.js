/**
 * SetupForm component stories.
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
import {
	provideModuleRegistrations,
	provideUserAuthentication,
	provideSiteInfo,
	freezeFetch,
} from '../../../../../../tests/js/utils';
import ModuleSetup from '../../../../components/setup/ModuleSetup';
import WithRegistrySetup from '../../../../../../tests/js/WithRegistrySetup';
import { MODULES_TAGMANAGER } from '../../datastore/constants';

function Template() {
	return <ModuleSetup moduleSlug="tagmanager" />;
}

export const Loading = Template.bind( {} );
Loading.storyName = 'Loading';
Loading.decorators = [
	( Story ) => {
		const setupRegistry = () => {
			freezeFetch(
				new RegExp(
					'^/google-site-kit/v1/modules/tagmanager/data/accounts'
				)
			);
		};
		return (
			<WithRegistrySetup func={ setupRegistry }>
				<Story />
			</WithRegistrySetup>
		);
	},
];

export default {
	title: 'Modules/TagManager/Setup/SetupForm',
	decorators: [
		( Story ) => {
			const setupRegistry = ( registry ) => {
				provideSiteInfo( registry, { ampMode: false } );
				provideUserAuthentication( registry );
				provideModuleRegistrations( registry );

				registry.dispatch( MODULES_TAGMANAGER ).setSettings( {} );
				registry
					.dispatch( MODULES_TAGMANAGER )
					.receiveGetExistingTag( null );
			};

			return (
				<WithRegistrySetup func={ setupRegistry }>
					<Story />
				</WithRegistrySetup>
			);
		},
	],
	parameters: { padding: 0 },
};
