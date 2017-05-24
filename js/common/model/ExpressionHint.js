// Copyright 2016, University of Colorado Boulder

/**
 * type that represents a hint that is show to the user when a new expression can be created
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {CoinTerm} anchorCoinTerm - the coin term that is staying put as this expression is being formed
   * @param {CoinTerm} movingCoinTerm - the coin term that is being moved by the user to join this expression
   * @constructor
   */
  function ExpressionHint( anchorCoinTerm, movingCoinTerm ) {

    // @public {CoinTerm}, read only
    this.anchorCoinTerm = anchorCoinTerm;
    this.movingCoinTerm = movingCoinTerm;

    // @public {boolean}
    this.anchorOnLeft = anchorCoinTerm.positionProperty.get().x < movingCoinTerm.positionProperty.get().x;

    // set the flag indicating that breaking apart is suppressed
    anchorCoinTerm.breakApartAllowedProperty.set( false );
    movingCoinTerm.breakApartAllowedProperty.set( false );
  }

  expressionExchange.register( 'ExpressionHint', ExpressionHint );

  return inherit( Object, ExpressionHint, {

    /**
     * returns true if this expression hint includes the provided coin term
     * @param {CoinTerm} coinTerm
     * @returns {boolean}
     * @public
     */
    containsCoinTerm: function( coinTerm ) {
      return ( coinTerm === this.anchorCoinTerm || coinTerm === this.movingCoinTerm );
    },

    // @public
    //REVIEW: doc
    equals: function( otherExpressionHint ) {
      return ( otherExpressionHint.anchorCoinTerm === this.anchorCoinTerm &&
               otherExpressionHint.movingCoinTerm === this.movingCoinTerm &&
               otherExpressionHint.anchorOnLeft === this.anchorOnLeft
      );
    },

    //REVIEW: doc
    clear: function() {
      this.anchorCoinTerm.breakApartAllowedProperty.set( true );
      this.movingCoinTerm.breakApartAllowedProperty.set( true );
    }
  } );
} );