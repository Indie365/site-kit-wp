<?php
/**
 * Class Google\Site_Kit\Modules\Subscribe_With_Google\Web_Tag
 *
 * @package   Google\Site_Kit\Modules\Subscribe_With_Google
 * @copyright 2021 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Modules\Subscribe_With_Google;

use Google\Site_Kit\Core\Modules\Tags\Module_Web_Tag;
use Google\Site_Kit\Core\Util\Method_Proxy_Trait;
use Google\Site_Kit\Core\Tags\Tag_With_DNS_Prefetch_Trait;
use Google\Site_Kit\Core\Util\BC_Functions;

/**
 * Class for Web tag.
 *
 * @since n.e.x.t
 * @access private
 * @ignore
 */
class Web_Tag extends Module_Web_Tag {

	use Method_Proxy_Trait, Tag_With_DNS_Prefetch_Trait;

	/**
	 * SwG free access status.
	 *
	 * @since n.e.x.t
	 * @var boolean
	 */
	private $free = false;

	/**
	 * Registers tag hooks.
	 *
	 * @since n.e.x.t
	 */
	public function register() {
		add_action( 'wp_head', $this->get_method_proxy_once( 'render' ) );

		add_filter(
			'wp_resource_hints',
			$this->get_dns_prefetch_hints_callback( '//news.google.com' ),
			10,
			2
		);

		$this->do_init_tag_action();
	}

	/**
	 * Outputs the Subscribe_With_Google script tag.
	 *
	 * @since n.e.x.t
	 */
	protected function render() {
		$swg_script_src = 'https://news.google.com/swg/js/v1/swg-basic.js';

		$swg_script_attributes = array(
			'src' => $swg_script_src,
		);

		$swg_attributes = $this->get_tag_blocked_on_consent_attribute_array();

		$swg_inline_script = '
		(self.SWG_BASIC = self.SWG_BASIC || []).push(basicSubscriptions => {
			basicSubscriptions.init({
			  type: "NewsArticle",
			  isAccessibleForFree: ' . ( $this->free ? 'true' : 'false' ) . ',
			  isPartOfType: ["Product"],
			  autoPromptType: "contribution",
			  isPartOfProductId: "' . $this->tag_id . '",
			});
		  });
		';

		printf( "\n<!-- %s -->\n", esc_html__( 'Google Subscribe_With_Google snippet added by Site Kit', 'google-site-kit' ) );
		BC_Functions::wp_print_script_tag( array_merge( $swg_script_attributes, $swg_attributes ) );
		BC_Functions::wp_print_inline_script_tag( $swg_inline_script );
		printf( "\n<!-- %s -->\n", esc_html__( 'End Google Subscribe_With_Google snippet added by Site Kit', 'google-site-kit' ) );
	}

	/**
	 * Set SwG free access status
	 *
	 * @since n.e.x.t
	 *
	 * @param boolean $free Free access status.
	 */
	public function set_free( $free ) {
		$this->free = $free;
	}

}
