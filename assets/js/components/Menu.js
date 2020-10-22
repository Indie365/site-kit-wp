/**
 * Menu component.
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
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { useEffect, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { MDCMenu } from '../material-components';

const Menu = ( {
	menuOpen,
	menuItems,
	onSelected,
	id,
} ) => {
	const menuRef = useRef( null );

	useEffect( () => {
		const menu = new MDCMenu( menuRef.current );
		menu.open = menuOpen;
		menu.setDefaultFocusState( 1 );
	}, [ menuRef.current ] );

	return (
		<div className="mdc-menu mdc-menu-surface" ref={ menuRef }>
			<ul id={ id } className="mdc-list" role="menu" aria-hidden={ ! menuOpen } aria-orientation="vertical" tabIndex="-1">
				{ menuItems.map( ( item, index ) => (
					<li
						key={ index }
						className="mdc-list-item"
						role="menuitem"
						onClick={ onSelected.bind( null, index ) }
						onKeyDown={ onSelected.bind( null, index ) }
					>
						<span className="mdc-list-item__text">{ item }</span>
					</li>
				) ) }
			</ul>
		</div>
	);
};

Menu.propTypes = {
	menuOpen: PropTypes.bool.isRequired,
	menuItems: PropTypes.array.isRequired,
	id: PropTypes.string.isRequired,
};

export default Menu;
