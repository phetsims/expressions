// Copyright 2016-2017, University of Colorado Boulder

/**
 * The 'Game' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEGameIconNode = require( 'EXPRESSION_EXCHANGE/game/view/EEGameIconNode' );
  var EEGameModel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameModel' );
  var EEGameScreenView = require( 'EXPRESSION_EXCHANGE/game/view/EEGameScreenView' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var gameString = require( 'string!EXPRESSION_EXCHANGE/game' );

  /**
   * @constructor
   */
  function EEGameScreen() {

    var options = {
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

  return inherit( Screen, EEGameScreen );
} );
