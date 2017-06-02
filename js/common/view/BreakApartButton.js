// Copyright 2016, University of Colorado Boulder

/**
 * button used for breaking things apart, supports a normal and color inverted appearance
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  // constants
  var MARGIN = 3.5;
  var ICON_SCALE = 0.35;
  var YELLOW = new Color( 'yellow' );
  var BLACK = new Color( 'black' );

  /**
   * @constructor
   * @param {Object} [options]
   */
  function BreakApartButton( options ) {

    options = _.extend( {
      mode: 'normal' // valid values are 'normal' and 'inverted'
    }, options );

    // verify options are valid
    assert && assert( options.mode === 'normal' || options.mode === 'inverted', 'invalid mode option' );

    var iconColor = options.mode === 'normal' ? BLACK : YELLOW;

    // the following options can't be overridden, and are set here and then passed to the parent type below
    _.extend( options, {
      xMargin: MARGIN,
      yMargin: MARGIN,
      baseColor: options.mode === 'normal' ? YELLOW : BLACK,
      cursor: 'pointer',
      content: new FontAwesomeNode( 'cut', {
        scale: ICON_SCALE,
        rotation: -Math.PI / 2, // scissors point up
        fill: iconColor,
        stroke: iconColor
      } )
    } );

    RectangularPushButton.call( this, options );
  }

  expressionExchange.register( 'BreakApartButton', BreakApartButton );

  return inherit( RectangularPushButton, BreakApartButton );
} );