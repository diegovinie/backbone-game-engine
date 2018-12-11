/**
 *
 * Backbone Game Engine - An elementary HTML5 canvas game engine using Backbone.
 *
 * Copyright (c) 2014 Martin Drapeau
 * https://github.com/martindrapeau/backbone-game-engine
 *
 * @class Backbone.Mario
 * @class Backbone.Luigi
 */
(function() {

  /**
   * @extends Backbone.Hero
   *
   * @method bounce
   * @method hit
   */
  Backbone.Mario = Backbone.Hero.extend({
    defaults: _.extend({}, Backbone.Hero.prototype.defaults, {
      name: "mario",
      spriteSheet: "mario"
    }),

    /**
     * @uses Character.getStateInfo
     * @uses Character.buildState
     * @param {Backbone.Sprite?} sprite no usado.
     * @param {string?} dir no usado.
     * @param {string?} dir2 no usado.
     */
    bounce: function(sprite, dir, dir2) {
      var cur = this.getStateInfo(),
          state = this.buildState("jump", cur.dir);
      this.set({
        state: state,
        yVelocity: this.animations[state].yStartVelocity*0.5,
        nextState: this.buildState("idle", cur.dir)
      });
      this.cancelUpdate = true;
      return this;
    },

    /**
     * Maneja el golpe recibido.
     *
     * @uses Character.getStateInfo
     * @uses Character.knockout
     * @uses bounce
     * @emits hit
     * @param {Backbone.Sprite} sprite puede ser character, artifact
     * @param {string} dir dirección de donde viene el golpe.
     * @param {string?} dir2 no usado.
     *
     * @return this
     */
    hit: function(sprite, dir, dir2) {
      // si ya fue llamada antes
      if (this._handlingSpriteHit) return this;
      this._handlingSpriteHit = sprite;

      // si viene de in artifact
      if (sprite.get("type") == "artifact") {
        this.cancelUpdate = true;
      // si viene de un enemigo
      } else if (sprite.get("type") == "character") {
        var name = sprite.get("name"),
            cur = this.getStateInfo(),
            // dirección opuesta
            opo = dir == "left" ? "right" : (dir == "right" ? "left" : (dir == "top" ? "bottom" : "top"));

        // si el ataque viene de abajo y no puya
        if (dir == "bottom" && name != "spike") {
          // rebota
          this.bounce.apply(this, arguments);
        // si el character está atacando
        } else if (sprite.isAttacking()) {
          // mata el character
          this.knockout(sprite, "left");
        }
        sprite.trigger("hit", this, opo);
      }

      this._handlingSpriteHit = undefined;
      return this;
    }
  });

  /**
   * @extends Backbone.Mario
   */
  Backbone.Luigi = Backbone.Mario.extend({
    defaults: _.extend({}, Backbone.Hero.prototype.defaults, {
      name: "luigi",
      spriteSheet: "mario"
    }),

    /**
     * ver que hace
     */
    animations: _.reduce(Backbone.Hero.prototype.animations, function(animations, anim, name) {
      var clone = _.clone(anim);
      clone.sequences = _.map(anim.sequences, function(index) {
        return index + 42;
      });
      animations[name] = clone;
      return animations;
    }, {})
  });


}).call(this);
