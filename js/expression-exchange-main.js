// Copyright 2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEBasicsScreen = require( 'EXPRESSION_EXCHANGE/basics/EEBasicsScreen' );
  var EEExploreScreen = require( 'EXPRESSION_EXCHANGE/explore/EEExploreScreen' );
  var EEGameScreen = require( 'EXPRESSION_EXCHANGE/game/EEGameScreen' );
  var EEVariablesScreen = require( 'EXPRESSION_EXCHANGE/variables/EEVariablesScreen' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var expressionExchangeTitleString = require( 'string!EXPRESSION_EXCHANGE/expression-exchange.title' );

  var simOptions = {
    credits: {
      leadDesign: 'Amanda McGarry',
      softwareDevelopment: 'John Blanco',
      team: 'Amanda McGarry, Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Elise Morgan, Oliver Nix, Oliver Orejola, Bryan Yoelin'
    }
  };

  SimLauncher.launch( function() {
    var sim = new Sim(
      expressionExchangeTitleString,
      [
        new EEBasicsScreen(),
        new EEExploreScreen(),
        new EEVariablesScreen(),
        new EEGameScreen()
      ],
      simOptions );
    sim.start();
  } );
} );