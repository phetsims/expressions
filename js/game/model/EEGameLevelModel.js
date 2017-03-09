// Copyright 2017, University of Colorado Boulder

/**
 * model for a single level of the Expression Exchange game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AllowedRepresentationsEnum = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentationsEnum' );
  var EEChallengeDescriptors = require( 'EXPRESSION_EXCHANGE/game/model/EEChallengeDescriptors' );
  var EECollectionArea = require( 'EXPRESSION_EXCHANGE/game/model/EECollectionArea' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var EXPRESSION_COLLECTION_AREA_X_OFFSET = 750;
  var EXPRESSION_COLLECTION_AREA_INITIAL_Y_OFFSET = 100;
  var EXPRESSION_COLLECTION_AREA_Y_SPACING = 130;
  var NUM_EXPRESSION_COLLECTION_AREAS = 3;

  /**
   * TODO: Document parameters when finalized
   * @constructor
   */
  function EEGameLevelModel( level, allowedRepresentations, soundEnabledProperty ) {

    var self = this;

    this.challengeNumber = 0; // TODO: Make this private later if possible
    this.level = level; // {number} @public, read only
    this.soundEnabledProperty = soundEnabledProperty; // @public (listen-only)

    // @public (read only) - current score for this level
    this.scoreProperty = new Property( 0 );

    // @public (read only) - model that allows user to manipulate coin terms and expressions
    this.expressionManipulationModel = new ExpressionManipulationModel( {
      allowedRepresentations: allowedRepresentations,
      partialCancellationEnabled: false, // partial cancellation isn't performed in the games
      simplifyNegativesDefault: true
    } );

    // @public - property that refers to the current challenge
    this.currentChallengeProperty = new Property(
      EEChallengeDescriptors.getChallengeDescriptor( level, this.challengeNumber )
    );

    assert && assert(
      allowedRepresentations !== AllowedRepresentationsEnum.COINS_AND_VARIABLES,
      'games do not support switching between coin and variable view'
    );

    // @public, read only - areas where expressions or coin terms can be collected, initialized below
    this.collectionAreas = [];

    // helper function to update the score when items are collected or un-collected
    function updateScore() {
      var score = 0;
      self.collectionAreas.forEach( function( collectionArea ) {
        if ( collectionArea.collectedItemProperty.get() ) {
          score++;
        }
      } );
      self.scoreProperty.set( score );
    }

    // initialize the collection areas
    _.times( NUM_EXPRESSION_COLLECTION_AREAS, function( index ) {
      var collectionArea = new EECollectionArea(
        EXPRESSION_COLLECTION_AREA_X_OFFSET,
        EXPRESSION_COLLECTION_AREA_INITIAL_Y_OFFSET + index * EXPRESSION_COLLECTION_AREA_Y_SPACING,
        allowedRepresentations === AllowedRepresentationsEnum.COINS_ONLY ? ViewMode.COINS : ViewMode.VARIABLES
      );
      collectionArea.collectedItemProperty.link( updateScore );
      self.collectionAreas.push( collectionArea );
    } );

    // update the expression description associated with the expression collection areas each time a new challenge is set
    this.currentChallengeProperty.link( function( currentChallenge ) {
      self.collectionAreas.forEach( function( expressionCollectionArea, index ) {
        expressionCollectionArea.expressionDescriptionProperty.set( currentChallenge.expressionsToCollect[ index ] );
      } );
    } );

    // handle interaction between expressions and the collection areas
    // TODO: This will probably need to be pulled into the expression model once I've worked it out so that the model
    // can prioritize expressions going into collection areas over pulling in other terms (the issue that Steele showed
    // me).
    this.expressionManipulationModel.expressions.addItemAddedListener( function( addedExpression ) {

      // define a function that will attempt to collect this expression if it is dropped over a collection area
      function expressionUserControlledListener( userControlled ) {
        if ( !userControlled ) {

          // test if this expression was dropped over a collection area
          var mostOverlappingCollectionArea = self.getMostOverlappingCollectionAreaForExpression( addedExpression );

          if ( mostOverlappingCollectionArea ) {

            // Attempt to put this expression into the collection area.  The collection area will take care of either
            // moving the expression inside or pushing it to the side.
            mostOverlappingCollectionArea.collectOrRejectExpression( addedExpression );
          }
        }
      }

      // hook up the listener
      addedExpression.userControlledProperty.lazyLink( expressionUserControlledListener );

      // listen for the removal of this expression and unhook the listener in order to avoid memory leaks
      self.expressionManipulationModel.expressions.addItemRemovedListener( function( removedExpression ) {
        if ( addedExpression === removedExpression ) {
          removedExpression.userControlledProperty.unlink( expressionUserControlledListener );
        }
      } );
    } );

    // handle interaction between expressions and the collection areas
    // TODO: This will probably need to be pulled into the expression model once I've worked it out so that the model
    // can prioritize expressions going into collection areas over pulling in other terms (the issue that Steele showed
    // me).
    this.expressionManipulationModel.coinTerms.addItemAddedListener( function( addedCoinTerm ) {

      // define a function that will attempt to collect this expression if it is dropped over a collection area
      function coinTermUserControlledListener( userControlled ) {
        if ( !userControlled ) {

          // test if this coin term was dropped over a collection area
          var mostOverlappingCollectionArea = self.getMostOverlappingCollectionAreaForCoinTerm( addedCoinTerm );

          if ( mostOverlappingCollectionArea ) {

            // Attempt to put this coin term into the collection area.  The collection area will take care of either
            // moving the coin term inside or pushing it to the side.
            mostOverlappingCollectionArea.collectOrRejectCoinTerm( addedCoinTerm );
          }
        }
      }

      // hook up the listener
      addedCoinTerm.userControlledProperty.lazyLink( coinTermUserControlledListener );

      // listen for the removal of this coin term and unhook the listener in order to avoid memory leaks
      self.expressionManipulationModel.expressions.addItemRemovedListener( function( removedCoinTerm ) {
        if ( addedCoinTerm === removedCoinTerm ) {
          removedCoinTerm.userControlledProperty.unlink( coinTermUserControlledListener );
        }
      } );
    } );
  }

  expressionExchange.register( 'EEGameLevelModel', EEGameLevelModel );

  return inherit( Object, EEGameLevelModel, {

    /**
     * @param {number} dt
     * @public
     */
    step: function( dt ) {
      this.expressionManipulationModel.step( dt );
    },

    /**
     * get a reference to the collection area that most overlaps with the provided expression, null if no overlap exists
     * @param {Expression} expression
     * @private
     */
    getMostOverlappingCollectionAreaForExpression: function( expression ) {
      var maxOverlap = 0;
      var mostOverlappingCollectionArea = null;
      this.collectionAreas.forEach( function( collectionArea ) {
        if ( collectionArea.collectedItemProperty.get() === null && // collection area must be empty
             expression.getOverlap( collectionArea ) > maxOverlap ) {
          mostOverlappingCollectionArea = collectionArea;
          maxOverlap = expression.getOverlap( collectionArea );
        }
      } );
      return mostOverlappingCollectionArea;
    },

    /**
     * get a reference to the collection area that most overlaps with the provided coin term, null if no overlap exists
     * @param {CoinTerm} coinTerm
     * @private
     */
    getMostOverlappingCollectionAreaForCoinTerm: function( coinTerm ) {
      var maxOverlap = 0;
      var mostOverlappingCollectionArea = null;
      this.collectionAreas.forEach( function( collectionArea ) {
        if ( collectionArea.collectedItemProperty.get() === null ) { // collection area must be empty
          var coinTermBounds = coinTerm.getViewBounds();
          var collectionAreaBounds = collectionArea.getBounds();
          var xOverlap = Math.max(
            0,
            Math.min( coinTermBounds.maxX, collectionAreaBounds.maxX ) - Math.max( coinTermBounds.minX, collectionAreaBounds.minX )
          );
          var yOverlap = Math.max(
            0,
            Math.min( coinTermBounds.maxY, collectionAreaBounds.maxY ) - Math.max( coinTermBounds.minY, collectionAreaBounds.minY )
          );
          var totalOverlap = xOverlap * yOverlap;
          if ( totalOverlap > maxOverlap ) {
            maxOverlap = totalOverlap;
            mostOverlappingCollectionArea = collectionArea;
          }
        }
      } );
      return mostOverlappingCollectionArea;
    },

    /**
     * @public
     */
    reset: function() {
      // TODO: This is incomplete and will need to be expanded once the collection boxes are implemented.
      this.expressionManipulationModel.reset();
    },

    /**
     * @public
     */
    refresh: function() {
      this.collectionAreas.forEach( function( collectionArea ) {
        collectionArea.reset();
      } );
      this.expressionManipulationModel.reset();
      this.loadNextChallenge();
    },

    loadNextChallenge: function() {
      this.challengeNumber = ( this.challengeNumber + 1 ) % EEChallengeDescriptors.CHALLENGES_PER_LEVEL;
      this.currentChallengeProperty.set( EEChallengeDescriptors.getChallengeDescriptor(
        this.level,
        this.challengeNumber
      ) );
    },

    setCoinTermRetrievalBounds: function( bounds ) {
      this.expressionManipulationModel.coinTermRetrievalBounds = bounds;
    }
  } );
} );