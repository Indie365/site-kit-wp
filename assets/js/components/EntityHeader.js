/**
 * EntityHeader component.
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
import { useWindowScroll } from 'react-use';
import throttle from 'lodash/throttle';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	useContext,
	useCallback,
	useEffect,
	useRef,
	useState,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import ViewContextContext from './Root/ViewContextContext';
import { VIEW_CONTEXT_PAGE_DASHBOARD } from '../googlesitekit/constants';
import Button from './Button';
import { CORE_SITE } from '../googlesitekit/datastore/site/constants';
import BackspaceIcon from '../../svg/keyboard-backspace.svg';
import { CORE_LOCATION } from '../googlesitekit/datastore/location/constants';
import Link from './Link';
const { useSelect, useDispatch } = Data;

const EntityHeader = () => {
	const viewContext = useContext( ViewContextContext );
	const currentEntityTitle = useSelect( ( select ) =>
		select( CORE_SITE ).getCurrentEntityTitle()
	);
	const entityURL = useSelect( ( select ) =>
		select( CORE_SITE ).getCurrentEntityURL()
	);

	const headerDetailsRef = useRef();
	const [ url, setURL ] = useState( entityURL );

	useEffect( () => {
		const shortenURL = () => {
			if ( ! headerDetailsRef.current ) {
				return;
			}

			// Remove 40 px for margins + SVG at the end of the URL link.
			const availableWidth = headerDetailsRef.current.clientWidth - 40;

			const urlFontSize = global
				.getComputedStyle( headerDetailsRef.current.lastChild, null )
				.getPropertyValue( 'font-size' );
			const fontSize = parseFloat( urlFontSize );

			// 2 is appox. the minimum character constant for sans-serif fonts:
			// https://pearsonified.com/characters-per-line/
			const maxChars = ( availableWidth * 2 ) / fontSize;

			if ( maxChars < entityURL.length ) {
				const extraChars = entityURL.length - maxChars + 4; // 4 is the length of "/...".
				const shortenedURL = new URL( entityURL );
				const origin = shortenedURL.origin;
				const restOfURL = shortenedURL.toString().replace( origin, '' );
				const newRestOfURL = '/...' + restOfURL.substr( extraChars );
				setURL( origin + newRestOfURL );
			} else {
				setURL( entityURL );
			}
		};

		// Use throttled version only on window resize.
		const throttledShortenURL = throttle( shortenURL, 100 );

		shortenURL();

		global.addEventListener( 'resize', throttledShortenURL );
		return () => {
			global.removeEventListener( 'resize', throttledShortenURL );
		};
	}, [ entityURL, headerDetailsRef, setURL ] );

	const { navigateTo } = useDispatch( CORE_LOCATION );
	const returnURL = useSelect( ( select ) =>
		select( CORE_SITE ).getAdminURL( 'googlesitekit-dashboard' )
	);

	const onClick = useCallback( () => {
		navigateTo( returnURL );
	}, [ returnURL, navigateTo ] );

	const { y } = useWindowScroll();

	if (
		VIEW_CONTEXT_PAGE_DASHBOARD !== viewContext ||
		entityURL === null ||
		currentEntityTitle === null
	) {
		return null;
	}

	return (
		<div
			className={ classnames( 'googlesitekit-entity-header', {
				'googlesitekit-entity-header--has-scrolled': y > 1,
			} ) }
		>
			<div className="googlesitekit-entity-header__back">
				<Button
					icon={ <BackspaceIcon width={ 24 } height={ 24 } /> }
					// This is duplicated because on small screens, the text supplied to the
					// Button is rendered as a sub-component and is set to `display: none`,
					// but the button itself remains on-screen (and thus this aria-label is
					// accessible to screen-readers).
					aria-label={ __( 'Back to dashboard', 'google-site-kit' ) }
					onClick={ onClick }
					text
				>
					{ __( 'Back to dashboard', 'google-site-kit' ) }
				</Button>
			</div>

			<div
				ref={ headerDetailsRef }
				className="googlesitekit-entity-header__details"
			>
				<p>{ currentEntityTitle }</p>
				<Link href={ entityURL } external inherit>
					{ url }
				</Link>
			</div>
		</div>
	);
};

export default EntityHeader;
