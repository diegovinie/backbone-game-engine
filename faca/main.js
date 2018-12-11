$(window).on("load", function() {

  function playSounds () {
    var audioElements = document.querySelectorAll('audio.game');

    // var audios = Array.from(audioElements).map(function (el) {
    //   return {
    //     name: el.id.split('-')[0],
    //     src: el.src
    //   };
    // });

    var audios = {};

    audioElements.forEach(function (el) {
      audios[el.id.split('-')[0]] = el.src;
    })
    return audios;
  }


  var NATIVE = navigator.isCocoonJS,
      MOBILE = "onorientationchange" in window ||
        window.navigator.msMaxTouchPoints ||
        window.navigator.isCocoonJS;

  var canvas = document.getElementById("foreground"),
      context = canvas.getContext("2d");

  if (MOBILE) {
    canvas.height = Math.round(Math.min(canvas.height, canvas.width * Math.min(window.innerHeight, window.innerWidth) / Math.max(window.innerHeight, window.innerWidth) ));
  } else {
    canvas.height = Math.round(Math.min(canvas.height, window.innerHeight));
    adjustViewport(canvas, canvas.width, canvas.height);
  }
  console.log("canvas.width=" + canvas.width + " canvas.height=" + canvas.height);

  _.extend(Backbone, {
    NATIVE: NATIVE,
    MOBILE: MOBILE,
    HEIGHT: canvas.height,
    WIDTH: canvas.width
  });

  /**
   * Aquí están los controles del inicio, nueva partida etc
   */
  Backbone.Controller = Backbone.Model.extend({
    initialize: function(attributes, options) {
      options || (options = {});
      var controller = this;

      Backbone.Pennie = Backbone.AnimatedTile.extend({
        defaults: {
          name: "pennie",
          type: "artifact",
          width: 32,
          height: 32,
          spriteSheet: "tiles",
          state: "idle",
          collision: true,
          static: false
        },
        animations: {
          idle: {
            sequences: [52, 52, 53, 54, 53, 52],
            delay: 50
          }
        },
        initialize: function(attributes, options) {
          Backbone.AnimatedTile.prototype.initialize.apply(this, arguments);
          this.on("hit", this.hit, this);
          this.on("squish", this.hit, this);
        },
        hit: function(sprite, dir, dir2) {
          console.log('hit');
          if (sprite.get("hero")) {
            sprite.trigger("hit", this);
            _.defer(this.world.remove, this);
          }
        }
      });

      Backbone.Mario = Backbone.Hero.extend({
        defaults: _.extend({}, Backbone.Hero.prototype.defaults, {
          name: "mario",
          spriteSheet: "mario"
        })
      });

      Backbone.Nina = Backbone.Hero.extend({
        defaults: _.extend({}, Backbone.Hero.prototype.defaults, {
          name: "nina",
          spriteSheet: "nina"
        })
      });

      var spriteSheets = new Backbone.SpriteSheetCollection([{
        id: "mario",
        img: "#mario",
        tileWidth: 32,
        tileHeight: 64,
        tileColumns: 21,
        tileRows: 6
      },{
        id: "tiles",
        img: "#tiles",
        tileWidth: 32,
        tileHeight: 32,
        tileColumns: 29,
        tileRows: 28
      },
      // {
      //   id: 'nina',
      //   img: '#nina',
      //   tileWidth: 32,
      //   tileHeight: 64,
      //   tileColumns: 5,
      //   tileRows: 1
      // }
    ]).attachToSpriteClasses();

      this.input = new Backbone.Input({
        drawTouchpad: true,
        drawPause: true
      });



      this.mario = new Backbone.Mario({
        x: 400, y: 200, floor: 500
      }, {
        input: this.input
      });

      // this.nina = new Backbone.Nina({
      //   x: 400, y: 200, floor: 500
      // }, {
      //   input: this.input
      // })

      this.world = new Backbone.World(
        window._world
        // {
        // width: 30, height: 17,
        // tileWidth: 32, tileHeight: 32,
        // viewportBottom: 156,
        // backgroundColor: "rgba(66, 66, 255, 1)"
      // }
      , {
        input: this.input
      });

      var audioNodes = document.querySelectorAll('audio.game');
      var audioElements = Array.from(audioNodes);

      this.audios = new Backbone.AudioCollection(audioElements);

      this.world.add(this.mario);

      this.debugPanel = new Backbone.DebugPanel({}, {color: "#fff"});

      this.titleScreenGui = new Backbone.TitleScreenGui({
        id: "titleScreenGui",
      }, {
        saved: {
          level: 1,
          coins: 11,
          time: 1000000
        }
      });

      // The game engine
      this.engine = new Backbone.Engine({}, {
        canvas: canvas,
        debugPanel: this.debugPanel,
        audios: this.audios
      });

      // Controls
      $(document).on("keypress.Controller", function(e) {
        if (e.keyCode == 66 || e.keyCode == 98)
          controller.engine.toggle(); // b to break the animation
      });

      this.listenTo(this.engine, "play", this.play);
      this.listenTo(this.engine, "nextLevel", this.nextLevel);

      this.showTitleScreen();
    },
    showTitleScreen: function() {
      this.engine.stop();
      this.engine.reset();
      if (this.debugPanel) this.debugPanel.clear();

      // Start everything
      this.engine.set("clearOnDraw", true);

      this.engine.add([
        this.titleScreenGui,
        this.debugPanel
      ]);
      this.engine.start();
    },
    play: function() {
      console.log('play');
      this.engine.stop();
      this.engine.reset();
      if (this.debugPanel) this.debugPanel.clear();

      // TO DO: start a new game. Set the state and add world, input, etc to engine
      this.engine.add([this.world, this.input]);
      this.engine.start();
    },
    nextLevel: function() {
      this.engine.stop();
      this.engine.reset();
      if (this.debugPanel) this.debugPanel.clear();

      // TO DO: continue an existing game. Reset the state and add world, input, etc to engine
    }
  });

  var controller = new Backbone.Controller();

  // Expose things as globals - easier to debug
  _.extend(window, {
    canvas: canvas,
    context: context,
    controller: controller,
  });

});
