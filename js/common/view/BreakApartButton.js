// Copyright 2016-2020, University of Colorado Boulder

/**
 * button used for breaking things apart, supports a normal and color inverted appearance
 * @author John Blanco
 */

import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import FontAwesomeNode from '../../../../sun/js/FontAwesomeNode.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const MARGIN = 3.5;
const ICON_SCALE = 0.35;
const BLACK_SCISSORS_ICON = createIconNode( 'black' );
const YELLOW_SCISSORS_ICON = createIconNode( 'yellow' );

/**
 * @constructor
 * @param {Object} [options]
 */
function BreakApartButton( options ) {

  options = merge( {
    mode: 'normal' // valid values are 'normal' and 'inverted'
  }, options );

  // verify options are valid
  assert && assert( options.mode === 'normal' || options.mode === 'inverted', 'invalid mode option' );

  const icon = options.mode === 'normal' ? BLACK_SCISSORS_ICON : YELLOW_SCISSORS_ICON;
  const iconNode = new Node( { children: [ icon ] } );

  // the following options can't be overridden, and are set here and then passed to the parent type below
  merge( options, {
    xMargin: MARGIN,
    yMargin: MARGIN,
    baseColor: options.mode === 'normal' ? 'yellow' : 'black',
    cursor: 'pointer',
    content: iconNode
  } );

  RectangularPushButton.call( this, options );

  this.disposeBreakApartButton = function() {
    iconNode.dispose();
  };
}

/**
 * helper function for creating the icon node used on the button
 * @param {string} color
 * @returns {FontAwesomeNode}
 */
function createIconNode( color ) {
  return new FontAwesomeNode( 'cut', {
    scale: ICON_SCALE,
    rotation: -Math.PI / 2, // scissors point up
    fill: color,
    stroke: color
  } );
}

expressionExchange.register( 'BreakApartButton', BreakApartButton );

export default inherit( RectangularPushButton, BreakApartButton, {

  /**
   * @public
   */
  dispose: function() {
    this.disposeBreakApartButton();
    RectangularPushButton.prototype.dispose.call( this );
  }
} );