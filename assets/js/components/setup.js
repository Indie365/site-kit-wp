/**
 * Setup component.
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

import Header from 'GoogleComponents/header';
import Button from 'GoogleComponents/button';
import Layout from 'GoogleComponents/layout/layout';
import data from 'GoogleComponents/data';
import { sendAnalyticsTrackingEvent, clearAppLocalStorage } from 'GoogleUtil';
import { getSiteKitAdminURL } from 'SiteKitCore/util';

import STEPS from 'GoogleComponents/setup-wizard/wizard-steps';
import WizardProgressStep from 'GoogleComponents/setup-wizard/wizard-progress-step';

const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const { delay }  = lodash;

class Setup extends Component {

	constructor( props ) {
		super( props );

		const { connectUrl } = googlesitekit.admin;

		const {
			isAuthenticated,
			hasSearchConsoleProperty,
			isSiteKitConnected,
			isVerified,
			needReauthenticate,
		} = googlesitekit.setup; /*eslint camelcase: 0*/

		const { canSetup } = googlesitekit.permissions;

		this.state = {
			canSetup,
			isAuthenticated,
			isVerified,
			needReauthenticate,
			hasSearchConsoleProperty,
			hasSearchConsolePropertyFromTheStart: hasSearchConsoleProperty,
			connectUrl,
			errorMsg: '',
			isSiteKitConnected,
			completeSetup: false,
		};

		this.siteConnectedSetup = this.siteConnectedSetup.bind( this );
		this.siteVerificationSetup = this.siteVerificationSetup.bind( this );
		this.searchConsoleSetup = this.searchConsoleSetup.bind( this );
		this.resetAndRestart = this.resetAndRestart.bind( this );
		this.completeSetup = this.completeSetup.bind( this );
		this.setErrorMessage = this.setErrorMessage.bind( this );
	}

	async resetAndRestart() {
		await data.set( 'core', 'site', 'reset' );
		clearAppLocalStorage();

		this.setState( {
			isSiteKitConnected: false,
			isAuthenticated: false,
			isVerified: false,
			hasSearchConsoleProperty: false,
			completeSetup: false,
			errorMsg: '',
		} );
	}

	completeSetup() {
		this.setState( {
			completeSetup: true,
		} );
	}

	siteConnectedSetup( status ) {
		this.setState( {
			isSiteKitConnected: status
		} );
	}

	siteVerificationSetup( status, searchConsoleProperty = false ) {
		this.setState( {
			isVerified: status,

			// @todo this happens instantly on site verification. We need some kind of delay/animation.
			hasSearchConsoleProperty: searchConsoleProperty,
		} );
	}

	searchConsoleSetup( status ) {
		this.setState( {
			hasSearchConsoleProperty: status
		} );
	}

	isSetupFinished() {
		const {
			isSiteKitConnected,
			isAuthenticated,
			isVerified,
			hasSearchConsoleProperty,
			completeSetup,
		} = this.state;

		return isSiteKitConnected && isAuthenticated && isVerified && hasSearchConsoleProperty && completeSetup;
	}

	setErrorMessage( errorMsg ) {
		this.setState( {
			errorMsg
		} );
	}

	getApplicableSteps() {
		const applicableSteps = STEPS;
		const slugs = Object.keys( applicableSteps );

		let i;
		for ( i = 0; i < slugs.length; i++ ) {
			if ( ! applicableSteps[ slugs[ i ] ].isApplicable( this.state ) ) {
				delete applicableSteps[ slugs[ i ] ];
			}
		}

		return applicableSteps;
	}

	currentStep( applicableSteps ) {
		const slugs = Object.keys( applicableSteps );

		// Iterate through all steps (except the last one) and return the first one that is not completed.
		let i;
		for ( i = 0; i < slugs.length - 1; i++ ) {
			if ( ! applicableSteps[ slugs[ i ] ].isCompleted( this.state ) ) {
				return slugs[ i ];
			}
		}

		// Return the last step only if all other steps are completed.
		return slugs[ i ];
	}

	stepStatus( applicableSteps, step ) {
		const currentStep = this.currentStep( applicableSteps );

		if ( applicableSteps[ step ].isCompleted( this.state ) ) {
			return 'completed';
		}

		if ( step === currentStep ) {
			return 'inprogress';
		}

		return '';
	}

	render() {
		const {
			canSetup,
			isAuthenticated,
			isVerified,
			needReauthenticate,
			hasSearchConsoleProperty,
			connectUrl,
			isSiteKitConnected,
		} = this.state;

		if ( this.isSetupFinished() ) {
			const redirectUrl = getSiteKitAdminURL(
				'googlesitekit-dashboard',
				{
					notification: 'authentication_success',
				},
			);

			delay( function() {
				window.location.replace( redirectUrl );
			}, 500, 'later' );
		}

		const progressSteps = this.getApplicableSteps();
		const currentStep = this.currentStep( progressSteps );

		const WizardStepComponent = progressSteps[ currentStep ].Component;
		const wizardStepComponent = <WizardStepComponent
			siteConnectedSetup={ this.siteConnectedSetup }
			connectUrl={ connectUrl }
			siteVerificationSetup={ this.siteVerificationSetup }
			searchConsoleSetup={ this.searchConsoleSetup }
			completeSetup={ this.completeSetup }
			isSiteKitConnected={ isSiteKitConnected }
			isAuthenticated={ isAuthenticated }
			isVerified={ isVerified }
			needReauthenticate={ needReauthenticate }
			hasSearchConsoleProperty={ hasSearchConsoleProperty }
			setErrorMessage={ this.setErrorMessage }
			resetAndRestart={ progressSteps.clientCredentials ? this.resetAndRestart : undefined }
		/>;

		const showVerificationSteps = canSetup;
		const showAuthenticateButton = ! showVerificationSteps && ! isAuthenticated;

		return (
			<Fragment>
				<Header/>
				<div className="googlesitekit-wizard">
					<div className="mdc-layout-grid">
						<div className="mdc-layout-grid__inner">
							<div className="
								mdc-layout-grid__cell
								mdc-layout-grid__cell--span-12
							">
								<Layout>
									<section className="googlesitekit-wizard-progress">
										<div className="mdc-layout-grid">
											<div className="mdc-layout-grid__inner">
												{ showVerificationSteps &&
													<div className="
														mdc-layout-grid__cell
														mdc-layout-grid__cell--span-12
													">
														<div className="googlesitekit-wizard-progress__steps">
															{ Object.keys( progressSteps ).map( ( step, stepIndex ) => {
																return (
																	<WizardProgressStep
																		key={ progressSteps[ step ].title }
																		currentStep={ currentStep === step }
																		title={ progressSteps[ step ].title }
																		step={ stepIndex + 1 }
																		status={ this.stepStatus( progressSteps, step ) }
																		warning={ progressSteps[ step ].warning }
																		error={ progressSteps[ step ].error }
																		stepKey={ step }
																	/>
																);
															} ) }
														</div>
													</div>
												}
											</div>
										</div>
										{ showAuthenticateButton &&
											<div className="googlesitekit-setup__footer">
												<div className="mdc-layout-grid">
													<div className="mdc-layout-grid__inner">
														<div className="
															mdc-layout-grid__cell
															mdc-layout-grid__cell--span-12
														">
															<h1 className="googlesitekit-setup__title">
																{ __( 'Authenticate Site Kit', 'google-site-kit' ) }
															</h1>
															<p className="googlesitekit-setup__description">
																{ __( 'Please sign into your Google account to begin.', 'google-site-kit' ) }
															</p>
															<Button
																href="#"
																onClick={ () => {
																	sendAnalyticsTrackingEvent( 'plugin_setup', 'signin_with_google' );
																	document.location = connectUrl;
																} }
															>{ __( 'Sign in with Google', 'google-site-kit' ) }</Button>
														</div>
													</div>
												</div>
											</div>
										}
									</section>
									{ showVerificationSteps &&
										wizardStepComponent
									}
								</Layout>
							</div>
						</div>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default Setup;
