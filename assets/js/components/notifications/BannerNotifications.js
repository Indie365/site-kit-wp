/**
 * BannerNotifications component.
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
 *
 */
import { useFeature } from '../../hooks/useFeature';
import useQueryArg from '../../hooks/useQueryArg';
import SetupSuccessBannerNotification from './SetupSuccessBannerNotification';
import CoreSiteBannerNotifications from './CoreSiteBannerNotifications';
import IdeaHubPromptBannerNotification from './IdeaHubPromptBannerNotification';
import UserInputPromptBannerNotification from './UserInputPromptBannerNotification';

export default function BannerNotifications() {
	const ideaHubModuleEnabled = useFeature( 'ideaHubModule' );
	const userInputEnabled = useFeature( 'userInput' );

	const [ notification ] = useQueryArg( 'notification' );

	if (
		'authentication_success' === notification ||
		'user_input_success' === notification
	) {
		return <SetupSuccessBannerNotification />;
	}

	if ( userInputEnabled ) {
		return <UserInputPromptBannerNotification />;
	}

	if ( ideaHubModuleEnabled ) {
		return <IdeaHubPromptBannerNotification />;
	}

	return <CoreSiteBannerNotifications />;
}
