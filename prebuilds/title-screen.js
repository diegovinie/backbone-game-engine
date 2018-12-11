(function() {

  /**
   * Botón.
   *
   * @extends Backbone.Button
   */
  Backbone.PullOutButton = Backbone.Button.extend({
    defaults: _.extend({}, Backbone.Button.prototype.defaults, {
      x: -372,
      width: 372,
      height: 76,
      backgroundColor: "transparent",
      img: "#gui", imgX: 0, imgY: 0, imgWidth: 372, imgHeight: 80, imgMargin: 0,
      textPadding: 12,
      textContextAttributes: {
        fillStyle: "#FFC221",
        font: "34px arcade",
        textBaseline: "middle",
        fontWeight: "normal",
        textAlign: "right"
      },
      easing: "easeOutCubic",
      easingTime: 600
    })
  });

  /**
   * Saved.
   *
   * @extends Backbone.Element
   * @method onAttach
   * @method onDraw
   */
  Backbone.SavedGame = Backbone.Element.extend({
    defaults: _.extend({}, Backbone.Element.prototype.defaults, {
      x: 960,
      y: 280,
      width: 333,
      height: 80,
      backgroundColor: "transparent",
      img: "#gui", imgX: 0, imgY: 225, imgWidth: 333, imgHeight: 247, imgMargin: 0,
      text: "High Score",
      textPadding: 24,
      textContextAttributes: {
        fillStyle: "#FFC221",
        font: "34px arcade",
        textBaseline: "middle",
        fontWeight: "normal",
        textAlign: "left"
      },
      easing: "easeOutCubic",
      easingTime: 600
    }),
    initialize: function(attributes, options) {
      Backbone.Element.prototype.initialize.apply(this, arguments);
      this.saved = options.saved;
    },
    onAttach: function() {
      Backbone.Element.prototype.onAttach.apply(this, arguments);
      this.set("text", "Level " + (this.saved ? this.saved.level : "?"));
    },
    onDraw: function(context) {
      var x = this.get("x"),
          y = this.get("y"),
          coins = this.saved ? this.saved.coins : "?",
          time = this.saved ? _.ms2time(this.saved.time) : "?";
      context.font = "30px arcade";
      context.fillStyle = "#FFF";
      context.textBaseline = this.attributes.textContextAttributes.textBaseline;
      context.fontWeight = this.attributes.textContextAttributes.fontWeight;
      context.textAlign = this.attributes.textContextAttributes.textAlign;
      context.fillText(coins, x+80, y+105);
      context.fillText(time, x+80, y+170);
    }
  });

  /**
   * Los créditos.
   *
   * @extends Backbone.Panel
   *
   * @method onDraw
   */
  Backbone.Credits = Backbone.Panel.extend({
    defaults: _.extend({}, Backbone.Panel.prototype.defaults, {
      text: "",
      textContextAttributes: {
        fillStyle: "#FFC221",
        font: "40px arcade",
        textBaseline: "middle",
        fontWeight: "normal",
        textAlign: "center"
      }
    }),
    onDraw: function(context, options) {
      var b = this.toJSON(),
          y = b.y;

      // Titles
      b.textContextAttributes.font = "30px arcade";
      b.textContextAttributes.fillStyle = "#FFC221";

      b.text = "Graphics";
      b.y = y;
      this.drawText(b, context, options);

      b.text = "Testing";
      b.y = y + 130;
      this.drawText(b, context, options);

      b.text = "Story & Coding";
      b.y = y + 230;
      this.drawText(b, context, options);

      // Content
      b.textContextAttributes.font = "24px arcade";
      b.textContextAttributes.fillStyle = "#FFF";

      b.text = "???";
      b.y = y + 40;
      this.drawText(b, context, options);

      b.text = "???";
      b.y = y + 170;
      this.drawText(b, context, options);

      b.text = "???";
      b.y = y + 270;
      this.drawText(b, context, options);

      b.textContextAttributes.fillStyle = "#DDD";
      b.text = "Built with Backbone Game Engine";
      b.y = y + 340;
      this.drawText(b, context, options);

    }
  });

  /**
   * La ventana de título y selección.
   *
   * @extends Backbone.Scene
   *
   * @uses Backbone.Button
   * @uses Backbone.LabelButton
   * @uses Backbone.PullOutButton
   * @uses Backbone.SavedGame
   * @uses Backbone.Credits
   *
   * @listens PullOutButton:tap
   * @listens Credits:tap
   * @listens Engine:tap
   *
   * @method postInitialize
   * @method onAttach
   * @method onDetach
   * @method onTouchStart
   * @method showButtons
   * @method hideButtons
   * @method showPanel
   * @method hidePanel
   * @method update
   * @method action
   */
	Backbone.TitleScreenGui = Backbone.Scene.extend({
    defaults: _.extend({}, Backbone.Scene.prototype.defaults, {
      img: "#title-screen",
      imgWidth: 960,
      imgHeight: 700
    }),
    initialize: function(attributes, options) {
      Backbone.Scene.prototype.initialize.apply(this, arguments);

      this.banner = new Backbone.Button({
        x: 0, y: 240,
        width: 960, height: 145,
        backgroundColor: "transparent",
        img: "#gui", imgX: 0, imgY: 80, imgWidth: 960, imgHeight: 144, imgMargin: 5,
        easing: "easeInOutQuad",
        easingTime: 400
      });

      this.touchStart = new Backbone.LabelButton({
        text: "Touch to start",
        opacity: 0
      });

      this.loading = new Backbone.LabelButton({
        y: Backbone.HEIGHT,
        text: "Loading...",
        easingTime: 300
      });

      this.play = new Backbone.PullOutButton({
        y: Backbone.HEIGHT - 300,
        text: "New Game "
      });
      this.play.on("tap", _.partial(this.action, "play"), this);

      this.showCredits = new Backbone.PullOutButton({
        y: Backbone.HEIGHT - 100,
        text: "Credits "
      });

      this.savedGame = new Backbone.SavedGame({
        y: Backbone.HEIGHT - 300
      }, {
        saved: this.saved
      });


      this.credits = new Backbone.Credits();
      this.showCredits.on("tap", _.partial(this.showPanel, this.credits), this);
    },
    postInitialize: function() {
      this.listenTo(this.engine, "tap", this.onTouchStart);

      // Hack to avoid FOUT
      this.touchStart.set("opacity", 1);
      this.play.textMetrics = undefined;
      this.showCredits.textMetrics = undefined;
    },

    /**
     * @extends Scene.onAttach
     *
     * @uses Engine.add
     * @uses postInitialize
     * @uses showButtons
     */
    onAttach: function() {
      Backbone.Scene.prototype.onAttach.apply(this, arguments);
      this.stopListening(this.engine);
      this.set("opacity", 1);
      this.loading.set("x", Backbone.HEIGHT);

      this.play.set("text", this.saved ? "Continue " : "New Game ");

      this.engine.add([
        this.banner,
        this.touchStart,
        this.loading,
        this.play,
        this.showCredits,
        this.credits,
        this.savedGame
      ]);

      if (!this.ready)
        setTimeout(this.postInitialize.bind(this), 200);
      else
        setTimeout(this.showButtons.bind(this), 100);
    },

    /**
     * @extends Scene.onDetach
     *
     * @uses Engine.remove
     */
    onDetach: function() {
      Backbone.Scene.prototype.onDetach.apply(this, arguments);
      this.engine.remove([
        this.banner,
        this.touchStart,
        this.loading,
        this.play,
        this.showCredits,
        this.credits,
        this.savedGame
      ]);
    },

    /**
     * Es el primer clic en el inicio.
     *
     * @uses Element.moveTo
     * @uses showButtons
     *
     * @param {event} e
     */
    onTouchStart: function(e) {
      // Animate some stuff
      this.banner.moveTo(this.banner.get("x"), 50);
      this.touchStart.moveTo(this.touchStart.get("x"), Backbone.HEIGHT);
      this.stopListening(this.engine);
      this.ready = true;
      this.showButtons();
    },

    /**
     * Mueve los botones hacia la pantalla.
     *
     * @uses Element.moveTo
     */
    showButtons: function() {
      this.play.moveTo(
        -this.play.get("width") + this.play.textMetrics.width + this.play.get("textPadding")*2,
        this.play.get("y")
      );
      this.showCredits.moveTo(
        -this.showCredits.get("width") + this.showCredits.textMetrics.width + this.showCredits.get("textPadding")*2,
        this.showCredits.get("y")
      );
      if (this.saved)
        this.savedGame.moveTo(720, this.savedGame.get("y"));
    },

    /**
     * Mueve los botones fuera de la pantalla.
     *
     * @uses Element.moveTo
     */
    hideButtons: function() {
      this.play.moveTo(
        -this.play.get("width"),
        this.play.get("y")
      );
      this.showCredits.moveTo(
        -this.showCredits.get("width"),
        this.showCredits.get("y")
      );
      this.savedGame.moveTo(960, this.savedGame.get("y"));
    },

    /**
     * Muestra el panel.
     *
     * @uses Element.moveTo
     * @uses hideButtons
     *
     * @listens Engine:tap
     */
    showPanel: function(panel) {
      this.panel = panel;
      this.panel.moveTo(this.panel.get("x"), 50);
      this.hideButtons();
      this.listenTo(this.engine, "tap", this.hidePanel);
    },

    /**
     * Oculta el panel.
     *
     * @uses Element.moveTo
     * @uses showButtons
     */
    hidePanel: function() {
      this.stopListening(this.engine);
      this.panel.moveTo(this.panel.get("x"), Backbone.HEIGHT);
      this.panel = undefined;
      this.showButtons();
    },

    /**
     * @extends Scene.update
     *
     * @return {boolean}
     */
    update: function(dt) {
      if (!Backbone.Scene.prototype.update.apply(this, arguments)) return false;

      var attrs = {opacity: this.get("opacity")},
          options = {silent: true};

      this.banner.set(attrs, options);
      this.touchStart.set(attrs, options);
      this.loading.set(attrs, options);
      this.play.set(attrs, options);
      this.showCredits.set(attrs, options);
      this.credits.set(attrs, options);
      this.savedGame.set(attrs, options);

      return true;
    },

    /**
     *
     * @uses hideButtons
     * @uses Element.fadeOut
     * @emits event
     * @param {string} event el evento.
     */
    action: function(event) {
      if (event == "play") this.loading.set("x", 400);

      var gui = this;
      this.hideButtons();
      setTimeout(function() {
        gui.fadeOut(function() {
          gui.engine.trigger(event);
        });
      }, 400);
    }
	});

}).call(this);
