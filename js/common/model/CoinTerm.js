// Copyright 2016, University of Colorado Boulder

/**
 * This type represents a model of a single or combined coin which can be represented in the view as a coin image or a
 * mathematical term.  A 'combined' coin is one where other matching coins have been combined with this one, kind of
 * like a stack of coins, though they are not represented in the view as a stack.  A 'term' refers to a mathematical
 * term, like xy or x squared.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var Easing = require( 'TWIXT/Easing' );
  var Emitter = require( 'AXON/Emitter' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var COIN_TERM_FADE_TIME = 0.75; // in seconds
  var CLOSE_ENOUGH_TO_HOME = 1E-6; // distance at which a coin term is considered to have returned to origin
  var CARD_PRE_FADE_TIME = 0.25; // time before card starts to fade after user grabs it, in seconds
  var CARD_FADE_TIME = 0.5; // time for a card to fade out

  // class var for creating unique IDs
  var creationCount = 0;

  /**
   * @param {Property.<number>} valueProperty - value of the coin term wrapped in a property
   * @param {number} coinRadius - radius of the coin portion of the coin term, in view coordinates
   * @param {string} termText - textual representation, e.g. 'x', must be compatible with SubSupText
   * @param {Property.<string>} termValueTextProperty
   * @param {CoinTermTypeID} typeID - type identifier for this coin term
   * @param {Object} options
   * @constructor
   */
  function CoinTerm( valueProperty, coinRadius, termText, termValueTextProperty, typeID, options ) {

    var self = this;
    this.id = 'CT-' + ( ++creationCount ); // @public, read only, unique ID useful for debugging

    options = _.extend( {
      initialCount: 1, // number of instances of this coin term initially combined together, can be negative
      initialPosition: Vector2.ZERO,
      initiallyOnCard: false,

      // flag that controls whether this can be broken down below its initial count, only looked at if the absolute
      // value of the initial count is greater than one
      decomposable: true
    }, options );

    //------------------------------------------------------------------------
    // properties
    //------------------------------------------------------------------------

    // @public {Property.<Vector2>} (read only), set using methods below
    this.positionProperty = new Property( options.initialPosition );

    // @public {Property.<Vector2>} (read only), set using methods below
    this.destinationProperty = new Property( options.initialPosition );

    // @public {Property.<boolean>}, indicate whether user is currently dragging this coin
    this.userControlledProperty = new Property( false );

    // @public {Property.<boolean>}
    this.combineHaloActiveProperty = new Property( false );

    // @public {Property.<boolean>}, supports showing subtraction in expressions
    this.showMinusSignWhenNegativeProperty = new Property( true );

    // @public {Property.<boolean>, indicates whether this is in a collection box (for game)
    this.collectedProperty = new Property( false );

    // @public {Property.<????|null>} (read only), tracks the current in-progress animation, if any
    //REVIEW: Here's an example where type documentation really helps. No idea (in initial read through) what type it can hold.
    this.inProgressAnimationProperty = new Property( null );

    // @public {Property.<number>} (read-only) - total number of coins/terms combined into this one, can be negative
    //REVIEW: Is this the coefficient?
    this.totalCountProperty = new Property( options.initialCount );

    // @public (read-write) - flag that controls whether breaking apart is allowed
    this.breakApartAllowedProperty = new Property( true );

    // @public (read only) - The bounds of this model element's view representation relative to the element's current
    // position. This admittedly breaks the usual model-view rules, but many things in the view need to know this, so
    // having it available on the model element after being set by the view worked out to be the best approach.
    //REVIEW: 'local' has been used as a word for this in Scenery (localViewBoundsProperty seems like a more obvious
      // name to me, but may not to others)
    this.relativeViewBoundsProperty = new Property( null );

    // @public {Property.<number>} (read only) - ranges from 1 to 0, used primarily for fading out of a coin term when
    //                                           cancellation occurs
    this.existenceStrengthProperty = new Property( 1 );

    // @public {Property.<number>}, determines the opacity of the card on which the coin term can reside
    this.cardOpacityProperty = new Property( options.initiallyOnCard ? 1 : 0 );

    // @public {Property.<number>}, used by view to make the coin terms appear smaller if necessary when put in
    //                              collection areas (game only)
    this.scaleProperty = new Property( 1 );

    //------------------------------------------------------------------------
    // non-property attributes
    //------------------------------------------------------------------------

    // @public, read only, values that describe the nature of this coin term
    this.typeID = typeID;
    this.valueProperty = valueProperty;
    this.termText = termText;
    this.coinRadius = coinRadius;
    this.initiallyOnCard = options.initiallyOnCard;

    // @public, read only, indicates that the value will never change, will be displayed differently in the view
    this.isConstant = typeID === CoinTermTypeID.CONSTANT;

    // @public, listen only, a property with contains the text that should be shown when displaying term value
    this.termValueTextProperty = termValueTextProperty;

    // @public, read only, tracks what this coin term is composed of and what it can be broken down into
    //REVIEW: Type documentation would definitely help here also.
    this.composition = [];
    if ( Math.abs( options.initialCount ) > 1 && options.decomposable ) {
      _.times( Math.abs( options.initialCount ), function() {
        self.composition.push( options.initialCount > 0 ? 1 : -1 );
      } );
    }
    else {
      this.composition.push( options.initialCount );
    }

    // @private - countdown timers for fading out the card background
    //REVIEW: What type? Maybe {number|null}
    this.cardPreFadeCountdown = null;
    this.cardFadeCountdown = null;

    //------------------------------------------------------------------------
    // emitters
    //------------------------------------------------------------------------

    // @public {Emitter}, listen only, emits an event when an animation finishes and the destination is reached
    this.destinationReachedEmitter = new Emitter();

    // @public {Emitter}, listen only, emits an event when coin terms returns to original position and is not user controlled
    this.returnedToOriginEmitter = new Emitter();

    // @public {Emitter}, listen only, emits an event when this coin term should be broken apart
    this.breakApartEmitter = new Emitter();

    // @private {Vector2}, used when animating back to original position
    this.initialPosition = options.initialPosition;

    //------------------------------------------------------------------------
    // listeners to own properties
    //------------------------------------------------------------------------

    // monitor position, emit returned to origin event when appropriate
    this.positionProperty.lazyLink( function( position ) {
      if ( position.distance( self.initialPosition ) < CLOSE_ENOUGH_TO_HOME && !self.userControlledProperty.get() ) {
        self.returnedToOriginEmitter.emit();
      }
    } );

    // monitor the total count, start fading the existence strength if it goes to zero
    this.totalCountProperty.lazyLink( function( totalCount ) {
      if ( totalCount === 0 ) {

        // initiate the fade out by setting the existence strength to a value just less than 1
        self.existenceStrengthProperty.set( 0.9999 );
      }
    } );

    this.collectedProperty.link( function( collected ) {

      // set the flag that is used to disable breaking apart whenever this coin term is captured in a collection area
      self.breakApartAllowedProperty.set( !collected );
    } );

    // update the appearance of the background card as the user interacts with this coin term
    this.userControlledProperty.lazyLink( function( userControlled ) {

      if ( options.initiallyOnCard ) {

        if ( userControlled ) {

          // If this coin term is decomposed as far as it can go, show the background card when the user grabs it, but
          // fade it out after a little while.
          if ( self.composition.length === 1 ) {
            self.cardOpacityProperty.set( 1 );
            self.cardPreFadeCountdown = CARD_PRE_FADE_TIME;
            self.cardFadeCountdown = null;
          }
        }
        else if ( self.cardOpacityProperty.get() !== 0 ) {
          self.cardOpacityProperty.set( 0 ); // the card is not visible if not controlled by the user
          self.cardPreFadeCountdown = null;
          self.cardFadeCountdown = null;
        }
      }
    } );
  }

  expressionExchange.register( 'CoinTerm', CoinTerm );

  return inherit( Object, CoinTerm, {

    /**
     * step function, used for animations
     * @param {number} dt - delta time, in seconds
     */
    step: function( dt ) {

      // if there is an animation in progress, step it
      var animation = this.inProgressAnimationProperty.get();
      if ( animation ) {
        animation.timeSoFar += dt;
        if ( animation.timeSoFar < animation.totalDuration ) {

          // not there yet - take a step towards the destination
          var proportionCompleted = animation.timeSoFar / animation.totalDuration;
          var easingProportion = Easing.CUBIC_IN_OUT.value( proportionCompleted );
          this.positionProperty.set(
            animation.startPosition.plus(
              animation.travelVector.withMagnitude( animation.travelVector.magnitude() * easingProportion )
            )
          );
        }
        else {

          // destination reached, end the animation
          this.positionProperty.set( this.destinationProperty.get() );
          this.inProgressAnimationProperty.set( null );
          this.destinationReachedEmitter.emit();
        }
      }

      // if this coin term is fading out, continue the fade
      if ( this.existenceStrengthProperty.get() < 1 ) {
        this.existenceStrengthProperty.set( Math.max(
          this.existenceStrengthProperty.get() - ( 1 / COIN_TERM_FADE_TIME ) * dt,
          0
        ) );
      }

      // if the card is visible, step its fade sequence
      if ( this.cardPreFadeCountdown !== null ) {
        this.cardPreFadeCountdown = Math.max( this.cardPreFadeCountdown - dt, 0 );
        if ( this.cardPreFadeCountdown === 0 ) {

          // pre-fade complete, start fade
          this.cardPreFadeCountdown = null;
          this.cardFadeCountdown = CARD_FADE_TIME;
        }
      }
      else if ( this.cardFadeCountdown !== null ) {
        this.cardFadeCountdown = Math.max( this.cardFadeCountdown - dt, 0 );
        this.cardOpacityProperty.set( this.cardFadeCountdown / CARD_FADE_TIME );
        if ( this.cardFadeCountdown === 0 ) {

          // fade complete
          this.cardFadeCountdown = null;
        }
      }
    },

    /**
     * move to the specified destination, but do so a step at a time rather than all at once
     * @param {Vector2} destination
     * @public
     */
    travelToDestination: function( destination ) {
      this.destinationProperty.set( destination );
      var currentPosition = this.positionProperty.get();
      if ( currentPosition.equals( destination ) ) {

        // The coin terms is already at the destination, no animation is required, but emit a notification in case the
        // the client needs it.
        this.destinationReachedEmitter.emit();
      }
      else {

        // calculate the time needed to get to the destination
        var animationDuration = this.positionProperty.get().distance( destination ) /
                                EESharedConstants.COIN_TERM_MOVEMENT_SPEED;

        //REVIEW: Should this be a separate type, since it's available as a public Property?
        this.inProgressAnimationProperty.set( {
          startPosition: this.positionProperty.get().copy(),
          travelVector: destination.minus( this.positionProperty.get() ),
          totalDuration: animationDuration,
          timeSoFar: 0
        } );
      }
    },

    //REVIEW: doc
    returnToOrigin: function() {
      this.travelToDestination( this.initialPosition );
    },

    /**
     * set both the position and destination in such a way that no animation is initiated
     * @param position
     * REVIEW: @param type?
     * @public
     */
    setPositionAndDestination: function( position ) {
      this.positionProperty.set( position );
      this.destinationProperty.set( position );
    },

    /**
     * make the coin term cancel any in progress animation and go immediately to the current destination
     * @public
     */
    goImmediatelyToDestination: function() {
      if ( this.inProgressAnimationProperty.get() ) {
        this.inProgressAnimationProperty.set( null );
        this.positionProperty.set( this.destinationProperty.get() );
      }
    },

    /**
     * an alternative way to set position that uses a flag to determine whether to animate or travel instantly
     * @param {Vector2} position
     * @param {boolean} animate
     */
    goToPosition: function( position, animate ) {
      if ( animate ) {
        this.travelToDestination( position );
      }
      else {
        this.setPositionAndDestination( position );
      }
    },

    /**
     * absorb the provided coin term into this one
     * @param {CoinTerm} coinTermToAbsorb
     * @param {boolean} doPartialCancellation - controls whether opposite terms in the composition cancel one another
     * or are retained, for example, when combining a coin term composed of [ -1, -1 ] with one composed of [ 1 ] and
     * doPartialCancellation set to true, the result is [ -1 ], if false, it's [ 1, -1, -1 ].
     * @public
     */
    absorb: function( coinTermToAbsorb, doPartialCancellation ) {
      assert && assert( this.typeID === coinTermToAbsorb.typeID, 'can\'t combine coin terms of different types' );
      var self = this;
      this.totalCountProperty.set( this.totalCountProperty.get() + coinTermToAbsorb.totalCountProperty.get() );

      if ( doPartialCancellation ) {
        coinTermToAbsorb.composition.forEach( function( minDecomposableValue ) {
          var index = self.composition.indexOf( -1 * minDecomposableValue );
          if ( index > -1 ) {
            // cancel this value from the composition of the receiving coin term
            self.composition.splice( index, 1 );
          }
          else {
            // add this element of the incoming coin term to the receiving coin term
            self.composition.push( minDecomposableValue );
          }
        } );
      }
      else {
        coinTermToAbsorb.composition.forEach( function( minDecomposableValue ) {
          self.composition.push( minDecomposableValue );
        } );
      }
    },

    /**
     * pull out the coin terms from which this one is composed, omitting the first one
     * @returns Array.<CoinTerm>
     * @public
     */
    extractConstituentCoinTerms: function() {
      var extractedCoinTerms = [];

      // create a coin term to reflect each one from which this one is composed
      for ( var i = 1; i < this.composition.length; i++ ) {
        var extractedCoinTerm = new CoinTerm(
          this.valueProperty,
          this.coinRadius,
          this.termText,
          this.termValueTextProperty,
          this.typeID,
          {
            initialCount: this.composition[ i ],
            initialPosition: this.initialPosition,
            initiallyOnCard: this.initiallyOnCard,
            decomposable: false
          } );
        extractedCoinTerm.cardOpacityProperty.set( 0 ); // set card invisible when extracted
        extractedCoinTerm.setPositionAndDestination( this.positionProperty.get() );
        extractedCoinTerms.push( extractedCoinTerm );
      }

      // set this to be a single fully decomposed coin term
      this.composition.splice( 1 );
      this.totalCountProperty.set( this.composition[ 0 ] );

      // return the list of extracted coin terms
      return extractedCoinTerms;
    },

    /**
     * initiate a break apart, which just emits an event and counts on parent model to handle
     * @public
     */
    breakApart: function() {
      assert && assert( Math.abs( this.composition.length ) > 1, 'coin term can\'t be broken apart' );
      this.breakApartEmitter.emit();
    },

    /**
     * tests if this coin term can be legitimately combined with another coin term
     * @param {CoinTerm} coinTerm
     * @returns {boolean}
     * @public
     */
    canCombineWith: function( coinTerm ) {
      return coinTerm !== this && coinTerm.typeID === this.typeID;
    },

    /**
     * return the bounds of this model elements representation in the view
     * @returns {Bounds2}
     * @public
     */
    getViewBounds: function() {
      var position = this.positionProperty.get();
      var relativeViewBounds = this.relativeViewBoundsProperty.get();
      //REVIEW: relativeViewBounds.shifted( position.x, position.y )
      return new Bounds2(
        position.x + relativeViewBounds.minX,
        position.y + relativeViewBounds.minY,
        position.x + relativeViewBounds.maxX,
        position.y + relativeViewBounds.maxY
      );
    }
  } );
} );
