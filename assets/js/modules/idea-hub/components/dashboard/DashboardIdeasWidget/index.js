/**
 * DashboardIdeasWidget component
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
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import { useMount, useUpdateEffect } from 'react-use';
import { useInView } from 'react-intersection-observer';
import useMergedRef from '@react-hook/merged-ref';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import {
	createInterpolateElement,
	useState,
	useEffect,
	useCallback,
	useRef,
} from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_UI } from '../../../../../googlesitekit/datastore/ui/constants';
import {
	MODULES_IDEA_HUB,
	IDEA_HUB_GA_CATEGORY_WIDGET,
	IDEA_HUB_TAB_NAMES_NEW,
	IDEA_HUB_TAB_NAMES_SAVED,
	IDEA_HUB_TAB_NAMES_DRAFT,
} from '../../../datastore/constants';
import { trackEvent } from '../../../../../util';
import whenActive from '../../../../../util/when-active';
import DashboardCTA from '../DashboardCTA';
import Badge from '../../../../../components/Badge';
import NewIdeas from './NewIdeas';
import SavedIdeas from './SavedIdeas';
import DraftIdeas from './DraftIdeas';
import Footer from './Footer';
import useQueryArg from '../../../../../hooks/useQueryArg';
const { useSelect } = Data;

const getIdeaHubContainerOffset = ( ideaHubWidgetOffsetTop ) => {
	const header = document.querySelector( '.googlesitekit-header' );
	if ( ! header ) {
		return ideaHubWidgetOffsetTop;
	}
	const headerHeight = header.offsetHeight;
	// We use the header offset from top to account for the offset of
	// the wp-admin bar which is sticky only above 600px.
	const headerOffsetFromTop = header.getBoundingClientRect().top;
	const marginBottom = 24;
	const headerOffset = headerOffsetFromTop + headerHeight + marginBottom;

	return ideaHubWidgetOffsetTop + global.pageYOffset - headerOffset;
};

function DashboardIdeasWidget( props ) {
	const { defaultActiveTabIndex, Widget, WidgetReportError } = props;

	const [ trackedWidgetView, setTrackedWidgetView ] = useState( false );

	const newIdeas = useSelect( ( select ) =>
		select( MODULES_IDEA_HUB ).getNewIdeas()
	);
	const savedIdeas = useSelect( ( select ) =>
		select( MODULES_IDEA_HUB ).getSavedIdeas()
	);
	const draftIdeas = useSelect( ( select ) =>
		select( MODULES_IDEA_HUB ).getDraftPostIdeas()
	);

	const [ queryParamRoute, setQueryParamRoute ] = useQueryArg(
		'idea-hub-tab'
	);

	const [ activeTabIndex, setActiveTabIndex ] = useState(
		DashboardIdeasWidget.tabToIndex[ queryParamRoute ] ||
			defaultActiveTabIndex
	);
	const activeTab = DashboardIdeasWidget.tabIDsByIndex[ activeTabIndex ];

	const [ inViewRef, inView ] = useInView( {
		triggerOnce: true,
		threshold: 0.25,
	} );
	const ideaHubContainerRef = useRef();
	const ideaHubContainerCompoundRef = useMergedRef(
		inViewRef,
		ideaHubContainerRef
	);
	const tabBarHeaderRef = useRef();

	const uniqueKey = `idea-hub-page-${ activeTab }`;
	const page =
		useSelect( ( select ) => select( CORE_UI ).getValue( uniqueKey ) ) || 1;

	useEffect( () => {
		if ( inView ) {
			trackEvent( IDEA_HUB_GA_CATEGORY_WIDGET, 'widget_view' );
		}
	}, [ inView ] );

	let hasNoIdeas, hasManyIdeas;

	if (
		newIdeas?.length === 0 &&
		savedIdeas?.length === 0 &&
		draftIdeas?.length === 0
	) {
		hasNoIdeas = true;
	}

	if (
		newIdeas?.length > 0 ||
		savedIdeas?.length > 0 ||
		draftIdeas?.length > 0
	) {
		hasManyIdeas = true;
	}

	useEffect( () => {
		// Do nothing if the following events have already been tracked
		// or the widget hasn't appeared in the viewport yet.
		if ( trackedWidgetView || ! inView ) {
			return;
		}

		if ( hasNoIdeas ) {
			setTrackedWidgetView( true );

			trackEvent(
				IDEA_HUB_GA_CATEGORY_WIDGET,
				'widget_gathering_data_view'
			);
		} else {
			setTrackedWidgetView( true );

			trackEvent(
				IDEA_HUB_GA_CATEGORY_WIDGET,
				'default_tab_view',
				DashboardIdeasWidget.tabIDsByIndex[ activeTabIndex ]
			);
		}
	}, [
		hasNoIdeas,
		hasManyIdeas,
		trackedWidgetView,
		setTrackedWidgetView,
		activeTabIndex,
		inView,
	] );

	useMount( () => {
		// Only set up scroll on mount if a known tab was requested.
		if (
			DashboardIdeasWidget.tabToIndex[ queryParamRoute ] === undefined
		) {
			return;
		}

		setTimeout( () => {
			if ( ! ideaHubContainerRef.current ) {
				return;
			}
			const top = getIdeaHubContainerOffset(
				ideaHubContainerRef.current.getBoundingClientRect().top
			);
			global.scrollTo( { top, behavior: 'smooth' } );
		}, 1000 );
	} );

	const handleTabUpdate = useCallback(
		( tabIndex ) => {
			const slug = DashboardIdeasWidget.tabIDsByIndex[ tabIndex ];

			setActiveTabIndex( tabIndex );
			setQueryParamRoute(
				DashboardIdeasWidget.tabIDsByIndex[ tabIndex ]
			);

			trackEvent( IDEA_HUB_GA_CATEGORY_WIDGET, 'tab_select', slug );
		},
		[ setQueryParamRoute ]
	);

	// Any time the pagination value changes, scroll to the top of the container.
	useUpdateEffect( () => {
		const tabBarRectangle = tabBarHeaderRef?.current?.getBoundingClientRect();

		if ( ! tabBarRectangle ) {
			return;
		}

		const isOnScreen =
			tabBarRectangle.top >= 0 &&
			tabBarRectangle.left >= 0 &&
			tabBarRectangle.bottom <=
				( global.innerHeight ||
					global.document.documentElement.clientHeight ) &&
			tabBarRectangle.right <=
				( global.innerWidth ||
					global.document.documentElement.clientWidth );

		if ( ! isOnScreen ) {
			global.scrollTo( {
				top: getIdeaHubContainerOffset( tabBarRectangle.top ),
				behavior: 'smooth',
			} );
		}
	}, [ page ] );

	const tabIdeasMap = {
		[ IDEA_HUB_TAB_NAMES_NEW ]: newIdeas,
		[ IDEA_HUB_TAB_NAMES_SAVED ]: savedIdeas,
		[ IDEA_HUB_TAB_NAMES_DRAFT ]: draftIdeas,
	};
	// The footer should be hidden in zero-states, except for on the new ideas tab.
	// This is done using a special CSS class rather than conditionally
	// rendering the component to avoid a layout shift when changing tabs.
	const hideFooter =
		IDEA_HUB_TAB_NAMES_NEW !== activeTab &&
		tabIdeasMap[ activeTab ]?.length === 0;

	return (
		<Widget
			className={ classnames( {
				'googlesitekit-widget--hidden-footer': hideFooter,
			} ) }
			Footer={ () => (
				<Footer
					tab={ activeTab }
					footerText={
						( activeTab === IDEA_HUB_TAB_NAMES_NEW &&
							__(
								'Updated every 2-3 days',
								'google-site-kit'
							) ) ||
						undefined
					}
				/>
			) }
			noPadding
		>
			<div
				className="googlesitekit-idea-hub"
				ref={ ideaHubContainerCompoundRef }
			>
				<div
					className="googlesitekit-idea-hub__header"
					ref={ tabBarHeaderRef }
				>
					<h3
						className={ classnames(
							'googlesitekit-idea-hub__title',
							'googlesitekit-subheading-1'
						) }
					>
						<span className="googlesitekit-idea-hub__title-text">
							{ __(
								'Ideas to write about, from actual questions people asked on Search',
								'google-site-kit'
							) }
						</span>
						<Badge
							label={ __( 'Experimental', 'google-site-kit' ) }
						/>
					</h3>

					<TabBar
						activeIndex={ activeTabIndex }
						handleActiveIndexUpdate={ handleTabUpdate }
						className="googlesitekit-idea-hub__tabs"
					>
						<Tab focusOnActivate={ false }>
							{ __( 'New', 'google-site-kit' ) }
						</Tab>
						<Tab focusOnActivate={ false }>
							{ savedIdeas?.length > 0 &&
								createInterpolateElement(
									sprintf(
										/* translators: %s: number of saved Idea Hub ideas */
										__(
											'Saved <span>(%s)</span>',
											'google-site-kit'
										),
										savedIdeas.length
									),
									{
										span: <span />,
									}
								) }
							{ ( savedIdeas?.length === 0 ||
								savedIdeas?.length === undefined ) &&
								__( 'Saved', 'google-site-kit' ) }
						</Tab>
						<Tab focusOnActivate={ false }>
							{ draftIdeas?.length > 0 &&
								createInterpolateElement(
									sprintf(
										/* translators: %s: number of draft Idea Hub ideas */
										__(
											'Drafts <span>(%s)</span>',
											'google-site-kit'
										),
										draftIdeas.length
									),
									{
										span: <span />,
									}
								) }
							{ ( draftIdeas?.length === 0 ||
								draftIdeas?.length === undefined ) &&
								__( 'Drafts', 'google-site-kit' ) }
						</Tab>
					</TabBar>
				</div>

				<div className="googlesitekit-idea-hub__body">
					<div
						className="googlesitekit-idea-hub__content"
						aria-hidden={ activeTab !== IDEA_HUB_TAB_NAMES_NEW }
					>
						<NewIdeas WidgetReportError={ WidgetReportError } />
					</div>

					<div
						className="googlesitekit-idea-hub__content"
						aria-hidden={ activeTab !== IDEA_HUB_TAB_NAMES_SAVED }
					>
						<SavedIdeas WidgetReportError={ WidgetReportError } />
					</div>

					<div
						className="googlesitekit-idea-hub__content"
						aria-hidden={ activeTab !== IDEA_HUB_TAB_NAMES_DRAFT }
					>
						<DraftIdeas WidgetReportError={ WidgetReportError } />
					</div>
				</div>
			</div>
		</Widget>
	);
}

DashboardIdeasWidget.tabToIndex = {
	[ IDEA_HUB_TAB_NAMES_NEW ]: 0,
	[ IDEA_HUB_TAB_NAMES_SAVED ]: 1,
	[ IDEA_HUB_TAB_NAMES_DRAFT ]: 2,
};

DashboardIdeasWidget.tabIDsByIndex = Object.keys(
	DashboardIdeasWidget.tabToIndex
);

DashboardIdeasWidget.propTypes = {
	Widget: PropTypes.elementType.isRequired,
	defaultActiveTabIndex: PropTypes.number,
};

DashboardIdeasWidget.defaultProps = {
	defaultActiveTabIndex: 0,
};

export default compose(
	whenActive( {
		moduleName: 'idea-hub',
		FallbackComponent: DashboardCTA,
	} )
)( DashboardIdeasWidget );
