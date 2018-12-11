(function () {

  /**
   *
   */
  Backbone.Tile = Backbone.Sprite.extend({
    defaults: {
      type: "tile",
      width: 32,
      height: 32,
      spriteSheet: "tiles",
      state: "idle",
      static: true,
      persist: true
    },
    initialize: function(attributes, options) {
      options || (options = {});
      this.world = options.world;
      this.lastSequenceChangeTime = 0;
    }
  });

  /**
   * sirve para crear una clase de cada tipo de terreno
   *
   * @param {string} cls clase a extender
   * @param {string} name nombre de la nueva clase
   * @param {object} attributes
   * @param {object} animations
   *
   * @return {Backbone.[constructor]} nombre en capitals
   */
  function extendSprite(cls, name, attributes, animations) {
    var newCls = _.classify(name);
    Backbone[newCls] = Backbone[cls].extend({
      defaults: _.extend(
        _.deepClone(Backbone[cls].prototype.defaults),
        {name: name},
        attributes || {}
      ),
      animations: _.extend(
        _.deepClone(Backbone[cls].prototype.animations),
        animations || {}
      )
    });
    return Backbone[newCls];
  }

  /**
   * Subclase Sprite que usa el relog para sincronizar animaciones
   *
   * @extends Backbone.Tile
   * @uses Backbone.Clock
   */
  Backbone.AnimatedTile = Backbone.Tile.extend({
    initialize: function(attributes, options) {
      Backbone.Tile.prototype.initialize.apply(this, arguments);
      this.on("attach", this.onAttach, this);
      this.on("detach", this.onDetach, this);
    },

    /**
     * Empieza a escuchar el reloj
     *
     * Si no encuentra el reloj lo crea.
     * @listens Backbone.Clock[change:ticks]
     * @fires updateAnimationIndex()
     */
    onAttach: function() {
      if (!this.engine) return;
      this.onDetach();

      this.clock = this.engine.sprites.findWhere({name: "animatedTileClock"});

      if (!this.clock)
        this.clock = this.engine.add(new Backbone.Clock({name: "animatedTileClock", delay: 200}));

      this.listenTo(this.clock, "change:ticks", this.updateAnimationIndex);
    },

    /**
     * Deja de escuchar el reloj
     */
    onDetach: function() {
      if (this.clock) this.stopListening(this.clock);
      this.clock = undefined;
    },

    update: function(dt) {
      return true;
    },

    /**
     * Avanza en uno la animación, al final vuelve al inicio.
     *
     * Sets sequenceIndex
     * @uses Sprite.getAnimation()
     */
    updateAnimationIndex: function() {
      var animation = this.getAnimation(),
          sequenceIndex = this.get("sequenceIndex") || 0;
      if (!animation) return;
      this.set("sequenceIndex", sequenceIndex < animation.sequences.length-1 ? sequenceIndex + 1 : 0);
    }
  });

  /**
   * Ladrillo que salta cuando le pegan de abajo.
   *
   * @extends Backbone.AnimatedTile
   */
  Backbone.Brick = Backbone.AnimatedTile.extend({
    defaults: _.extend({}, Backbone.Tile.prototype.defaults, {
      name: "brick",
      state: "idle",
      collision: true,
      static: false
    }),
    animations: {
      idle: {
        sequences: [2]
      },
      bounce: {
        sequences: [
          {frame: 2, x: 0, y: -8},
          {frame: 2, x: 0, y: -8},
          {frame: 2, x: 0, y: -4},
          {frame: 2, x: 0, y: 0}
        ],
        delay: 50
      }
    },
    initialize: function(attributes, options) {
      Backbone.AnimatedTile.prototype.initialize.apply(this, arguments);
      this.on("hit", this.hit, this);
    },

    /**
     * Se activa cuando recibe golpe.
     *
     * Si viene de abajo y es un héroe salta cambiando el stado, si viene de
     * arriba dispara hit para parar la caída.
     *
     * @emits hit si el golpe viene de arriba.
     *
     * @param {Backbone.Sprite} sprite puede ser un héroe.
     * @param {string} dir dirección de donde viene el golpe.
     * @param {string?} dir2 no usado.
     *
     * @return this
     */
    hit: function(sprite, dir, dir2) {
      if (sprite.get("hero") && dir == "bottom") {
        var tile = this;
        this.set({state: "bounce", sequenceIndex: 0});
        this.world.setTimeout(function() {
          tile.set({state: "idle"});
        }, 200);
      } else if (dir == "top") {
        sprite.trigger("hit", this, "bottom");
      }

      return this;
    }
  });
  
}).call(this);
