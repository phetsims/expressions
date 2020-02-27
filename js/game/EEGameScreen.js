// Copyright 2016-2019, University of Colorado Boulder

/**
 * The 'Game' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import inherit from '../../../phet-core/js/inherit.js';
import EESharedConstants from '../common/EESharedConstants.js';
import expressionExchangeStrings from '../expression-exchange-strings.js';
import expressionExchange from '../expressionExchange.js';
import EEGameModel from './model/EEGameModel.js';
import EEGameIconNode from './view/EEGameIconNode.js';
import EEGameScreenView from './view/EEGameScreenView.js';

const gameString = expressionExchangeStrings.game;

/**
 * @constructor
 */
function EEGameScreen() {

  const options = {
    name: gameString,
    backgroundColorProperty: new Property( EESharedConstants.GAME_SCREEN_BACKGROUND_COLOR ),
    homeScreenIcon: new EEGameIconNode()
  };

  Screen.call( this,
    function() { return new EEGameModel(); },
    function( model ) { return new EEGameScreenView( model ); },
    options
  );
}

expressionExchange.register( 'EEGameScreen', EEGameScreen );

inherit( Screen, EEGameScreen );
export default EEGameScreen;