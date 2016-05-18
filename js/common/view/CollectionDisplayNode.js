// Copyright 2016, University of Colorado Boulder

/**
 * a node that monitors the coin terms in the model and displays a summary of what has been created (a.k.a. "collected")
 * by the user
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermIconNode = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermIconNode' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  // constants
  var WIDTH = 170; // empirically determined
  var MAX_COIN_TERMS_PER_ROW = 5;
  var MAX_COINS_TERMS_PER_TYPE = 10;
  var COIN_CENTER_INSET = 20;
  var INTER_COIN_H_SPACING = ( WIDTH - ( 2 * COIN_CENTER_INSET ) ) / ( MAX_COIN_TERMS_PER_ROW - 1 );
  var SAME_TYPE_V_SPACING = 2;
  var DIFFERENT_TYPE_V_SPACING = 8;

  // create a list of the coin term type IDs in the order in which we want the icons to appear in this node
  var COIN_TERM_TYPE_IDS = [
    CoinTermTypeID.X,
    CoinTermTypeID.Y,
    CoinTermTypeID.Z,
    CoinTermTypeID.X_TIMES_Y,
    CoinTermTypeID.X_SQUARED,
    CoinTermTypeID.Y_SQUARED,
    CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED
  ];

  /**
   * {ExpressionManipulationModel} model
   * @constructor
   */
  function CollectionDisplayNode( model ) {

    Node.call( this );
    var self = this;

    // an object that uses coin term IDs as the keys and has arrays of icons as the values
    var iconMap = {};

    // add the arrays of icon nodes to the map
    var bottomOfPreviousRow;
    COIN_TERM_TYPE_IDS.forEach( function( coinTermTypeID ){

      // add the array that will maintain references to the icon nodes
      iconMap[ coinTermTypeID ] = [];

      // create a single instance of the icon
      var coinTermIcon = new CoinTermIconNode(
        model.coinTermFactory.createCoinTerm( coinTermTypeID ),
        model.viewModeProperty,
        model.showCoinValuesProperty,
        model.showVariableValuesProperty
      );

      if ( !bottomOfPreviousRow ){
        bottomOfPreviousRow = COIN_CENTER_INSET - coinTermIcon.height / 2;
      }

      // wrap the icon in separate nodes so that it can appear in multiple places
      for ( var i = 0; i < MAX_COINS_TERMS_PER_TYPE / MAX_COIN_TERMS_PER_ROW; i++ ){
        for ( var j = 0; j < MAX_COIN_TERMS_PER_ROW; j++ ){
          var wrappedIconNode = new Node( {
            children: [ coinTermIcon ],
            centerX: COIN_CENTER_INSET + j * INTER_COIN_H_SPACING,
            top: i === 0 ? bottomOfPreviousRow + DIFFERENT_TYPE_V_SPACING : bottomOfPreviousRow + SAME_TYPE_V_SPACING
          } );
          self.addChild( wrappedIconNode );
          iconMap[ coinTermTypeID ].push( wrappedIconNode );
        }
        bottomOfPreviousRow = wrappedIconNode.bottom;
      }
    } );


    // define a function that will update the visibility of the icons based on the number of corresponding coin types
    function updateIconVisibility(){
      COIN_TERM_TYPE_IDS.forEach( function( coinTermTypeID ){
        var count =  model.getCoinTermCount( coinTermTypeID );
        for ( var i = 0; i < MAX_COINS_TERMS_PER_TYPE; i++ ){
          iconMap[ coinTermTypeID ][ i ].visible = i < count;
        }
      } );
    }

    // do the initial update
    updateIconVisibility();

    // listen to the model for any coin terms coming or going and update the icon visibility when they do
    model.coinTerms.addItemAddedListener( updateIconVisibility );
    model.coinTerms.addItemRemovedListener( updateIconVisibility );
  }

  expressionExchange.register( 'CollectionDisplayNode', CollectionDisplayNode );

  return inherit( Node, CollectionDisplayNode );
} );