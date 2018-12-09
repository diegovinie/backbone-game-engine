/**
 *
 * Backbone Game Engine - An elementary HTML5 canvas game engine using Backbone.
 *
 * Copyright (c) 2014 Martin Drapeau
 * https://github.com/martindrapeau/backbone-game-engine
 *
 */
(function() {

  /**
   * Camera class
   *
   * Ensures the hero is always in the viewport.
   * Properly pans the world.
   *
   * @extends Backbone.Model
   *
   * @method setOptions
   * @method maybePan
   * @method update
   * @method draw
   */
  Backbone.Camera = Backbone.Model.extend({
    defaults: {
      left: 200,
      right: 400,
      top: 100,
      bottom: 100
    },
    initialize: function(attributes, options) {
      this.setOptions(options || {});
    },

    /**
     *
     * @param {object} options se pasa world: world, subject: hero
     * @listens subject:change:[x,y]
     * @uses maybePan
     */
    setOptions: function(options) {
      options || (options = {});
      _.extend(this, options || {});

      this.stopListening();
      if (this.subject && this.world)
        this.listenTo(this.subject, "change:x change:y", this.maybePan);
    },

    /**
     * @uses World.toShallowJSON
     */
    maybePan: function() {
      if (!this.world) return this;
      var w = this.world.toShallowJSON(),
          worldX = w.x,
          worldY = w.y,
          worldWidth = w.width * w.tileWidth,
          worldHeight = w.height * w.tileHeight,
          viewportWidth = this.world.viewport.width,
          viewportHeight = this.world.viewport.height,
          subjectX = this.subject.get("x") + w.x,
          subjectY = this.subject.get("y") + w.y,
          subjectWidth = this.subject.get("tileWidth"),
          subjectHeight = this.subject.get("tileHeight"),
          left = this.get("left") + w.viewportLeft,
          right = w.viewportLeft + viewportWidth - this.get("right"),
          top = this.get("top") + w.viewportTop,
          bottom = w.viewportTop + viewportHeight - this.get("bottom");

      if (subjectX < left && w.x < 0) {
        // Pan right (to see more left)
        worldX = w.x + (left - subjectX);
        if  (worldX > 0) worldX = 0;
      } else if (subjectX > right && w.x + worldWidth > viewportWidth) {
        // Pan left (to see more right)
        worldX = w.x - (subjectX - right);
        if (worldX + worldWidth < viewportWidth)
            worldX = -worldWidth + viewportWidth;
      }

      if (subjectY < top && w.y < 0) {
        // Pan down (to see more up)
        worldY = w.y + (top - subjectY);
        if  (worldY > 0) worldY = 0;
      } else if (subjectY > bottom && w.y + worldHeight > viewportHeight) {
        // Pan up (to see more down)
        worldY = w.y - (subjectY - bottom);
        if (worldY + worldHeight < viewportHeight)
            worldY = -worldHeight + viewportHeight;
      }

      if (worldX != w.x ||  worldY != w.y)
        this.world.set({x: worldX, y: worldY});
    },

    /**
     * @return {boolean} false
     */
    update: function(dt) {
      return false;
    },

    /**
     * @return this
     */
    draw: function(context) {
      return this;
    }
  });

}).call(this);
