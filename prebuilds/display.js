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
   * El contador de monedas.
   *
   * @extends Backbone.Model
   *
   * @listens attach
   * @listens detach
   *
   * @uses Backbone.AnimatedTile
   *
   * @method onAttach
   * @method onDetach
   * @method update
   * @method draw
   * @method onPennieRemoved
   */
  Backbone.Display = Backbone.Model.extend({
    defaults: {
      pennies: 0
    },

    /**
     * @param {object} attributes sin uso.
     * @param {object} options world
     */
    initialize: function(attributes, options) {
      options || (options = {});
      this.world = options.world;

      // la moneda del contador
      this.pennieSprite = new Backbone.AnimatedTile({
        name: "pennie",
        type: "character",
        x: 150,
        y: 4,
        width: 32,
        height: 32,
        spriteSheet: "tiles",
        state: "idle"
      });
      this.pennieSprite.animations = {
        idle: {
          sequences: [52, 52, 53, 54, 53, 52],
          delay: 50,
          scaleX: 0.75,
          scaleY: 0.75
        }
      };

      this.on("attach", this.onAttach, this);
      this.on("detach", this.onDetach, this);
    },

    /**
     * @listens Backbone.Collection:remove
     * @emits Backbone.AnimatedTile:attach
     */
    onAttach: function() {
      // pasa la referencia del engine
      this.pennieSprite.engine = this.engine;
      this.pennieSprite.trigger("attach");
      this.listenTo(this.world.dynamicSprites, "remove", this.onPennieRemoved);
      this.pennieSprite.set({x: this.engine.canvas.width/2 - 30});
    },

    /**
     * @emits Backbone.AnimatedTile:detach
     */
    onDetach: function() {
      this.pennieSprite.trigger("detach");
      this.pennieSprite.engine = undefined;
      this.stopListening();
    },

    /**
     * @return {boolean} true
     */
    update: function(dt) {
      return true;
    },

    /**
     * Dibuja el contador de monedas con herramientas canvas.
     *
     * @param {Canvas.context} context
     *
     * @return this
     */
    draw: function(context) {

      var text = "×" + (this.attributes.pennies < 10 ? "0" : "") + this.attributes.pennies;
      context.fillStyle = "#fff";
      context.font = "20px arcade, Verdana, Arial, Sans-Serif";
      context.textBaseline = "top";
      context.fontWeight = "normal";

      context.textAlign = "left";
      context.fillText(text, context.canvas.width/2 - 100, 12);

      this.pennieSprite.draw.call(this.pennieSprite, context);

      context.textAlign = "right";
      context.fillText(this.world.attributes.name.replace(/_/g, " "), context.canvas.width - 100, 12);

      return this;
    },

    /**
     * Aumenta el contador cuando se encuentra con una moneda.
     *
     * @param {Backbone.Sprite} sprite puede ser cualquier cosa.
     */
    onPennieRemoved: function(sprite) {
      if (this.world.get("state") != "play") return;

      var name = sprite.get("name"),
          pennies = this.get("pennies");

      // se encuentra con una moneda
      if (name.indexOf("pennie") != -1) {
        // suma y si es mayor a 100 reinicia
        pennies += 1;
        if (pennies > 99) pennies = 0;
        this.set("pennies", pennies);
      }
    }
  });

}).call(this);
