$(window).on("load", function() {

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
   * Controlador principal.
   *
   * @extends Backbone.Model
   *
   * @uses Backbone.DebugPanel
   * @uses Backbone.TitleScreenGui
   * @uses Backbone.Engine
   *
   * @listens Engine:play
   * @listens Engine:nextLevel
   * @listens keypress.Controller
   *
   * @method showTitleScreen
   * @method play
   * @method nextLevel
   */
  Backbone.Controller = Backbone.Model.extend({
    initialize: function(attributes, options) {
      options || (options = {});
      var controller = this;

      this.debugPanel = new Backbone.DebugPanel({}, {color: "#fff"});

      this.titleScreenGui = new Backbone.TitleScreenGui({
        id: "titleScreenGui",
      }, {
        saved: {
          level: 1,
          coins: 10,
          time: 1000000
        }
      });

      // The game engine
      this.engine = new Backbone.Engine({}, {
        canvas: canvas,
        debugPanel: this.debugPanel
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

    /**
     * Muestra la ventana título.
     *
     * @uses Engine.stop
     * @uses Engine.reset
     * @uses Engine.start
     * @uses DebugPanel.clear
     * @uses Engine.add
     */
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

    /**
     * Inicia el juego. (incompleta)
     *
     * @uses Engine.stop
     * @uses Engine.reset
     * @uses DebugPanel.clear
     */
    play: function() {
      this.engine.stop();
      this.engine.reset();
      if (this.debugPanel) this.debugPanel.clear();

      // TO DO: start a new game. Set the state and add world, input, etc to engine
    },

    /**
     * Continua un juego existente. (incompleta)
     *
     * @uses Engine.stop
     * @uses Engine.reset
     * @uses DebugPanel.clear
     */
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
