// Copyright 2017, University of Colorado Boulder

/**
 * static object that provides functions for creating nodes that represent the coins used in the simulation
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var CARD_CORNER_ROUNDING = 4;
  var NUMBER_LABEL_FONT = new PhetFont( 26 ); // size empirically determined
  var CARD_STAGGER_OFFSET = 1.5; // empirically determined, same in x and y directions
  var ICON_WIDTH = 40;
  var CARD_ICON_HEIGHT = 40;
  var COIN_RADIUS = 20; // empirically determined

  /**
   * helper function for creating coin-image-based icons
   * @param {CoinTermTypeID} coinTermTypeID - type of coin image to use
   * @param {number} value - value that will appear on the face of the coin
   * @returns {Node}
   */
  function createCoinIcon( coinTermTypeID, value ) {

    // create the coin image node
    var imageNode = CoinNodeFactory.createImageNode( coinTermTypeID, COIN_RADIUS, false );

    // add the label
    var label = new Text( value, {
      font: NUMBER_LABEL_FONT,
      centerX: imageNode.width / 2,
      centerY: imageNode.height / 2
    } );

    return new Node( { children: [ imageNode, label ] } );
  }

  /**
   * helper function for creating the icons that look like a stack of cards
   * @param {number} numberOnStack
   * @param {number} numberOfAdditionalCards
   * @returns {Node}
   */
  function createCardStackIcon( numberOnStack, numberOfAdditionalCards ) {
    var rootNode = new Node();
    var cardWidth = ICON_WIDTH - numberOfAdditionalCards * CARD_STAGGER_OFFSET;
    var cardHeight = CARD_ICON_HEIGHT - numberOfAdditionalCards * CARD_STAGGER_OFFSET;
    var cards = [];

    // create the blank cards
    _.times( numberOfAdditionalCards + 1, function( cardNumber ) {
      cards.push( new Rectangle( 0, 0, cardWidth, cardHeight, CARD_CORNER_ROUNDING, CARD_CORNER_ROUNDING, {
        fill: EESharedConstants.CARD_BACKGROUND_COLOR,
        stroke: 'black',
        lineWidth: 0.5,
        left: ( numberOfAdditionalCards - cardNumber ) * CARD_STAGGER_OFFSET,
        top: ( numberOfAdditionalCards - cardNumber ) * CARD_STAGGER_OFFSET
      } ) );
    } );

    // add the text to the top card
    cards[ 0 ].addChild( new Text( numberOnStack, {
      font: NUMBER_LABEL_FONT,
      centerX: cardWidth / 2,
      centerY: cardHeight / 2
    } ) );

    // add the cards to the root node
    cards.reverse().forEach( function( card ) {
      rootNode.addChild( card );
    } );

    return rootNode;
  }

  /**
   * static factory object used to create nodes that represent coins
   * @public
   */
  var EEGameLevelIconFactory = {

    /**
     * function to create a node for the specified game level
     * @param {number} gameLevel - zero based ID for the game level
     * @returns {Node}
     * @public
     */
    createIcon: function( gameLevel ) {

      var icon;

      switch( gameLevel ) {

        case 0:
          icon = createCoinIcon( CoinTermTypeID.X_TIMES_Y, 1 );
          break;

        case 1:
          icon = createCoinIcon( CoinTermTypeID.X, 2 );
          break;

        case 2:
          icon = createCoinIcon( CoinTermTypeID.Y_SQUARED, 3 );
          break;

        case 3:
          icon = createCardStackIcon( 4, 0 );
          break;

        case 4:
          icon = createCardStackIcon( 5, 1 );
          break;

        case 5:
          icon = createCardStackIcon( 6, 2 );
          break;

        case 6:
          icon = createCardStackIcon( 7, 3 );
          break;

        case 7:
          icon = createCardStackIcon( 8, 4 );
          break;

        default:
          assert && assert( false, 'no icon available for game level ' + gameLevel );
          break;
      }

      return icon;
    }
  };

  expressionExchange.register( 'EEGameLevelIconFactory', EEGameLevelIconFactory );

  return EEGameLevelIconFactory;

} );