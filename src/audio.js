/**
 * Backbone Game Engine - An elementary HTML5 canvas game engine using Backbone.
 *
 * Módulo de audio.
 *
 * @author Diego Viniegra <diegovillalobos@catedra.edu.co>
 */
(function () {

  /**
   * @extends Backbone.Model
   *
   * @listens play
   * @listens pause
   * @listens stop
   * @listens remove
   *
   * @method play
   */
  Backbone.Audio = Backbone.Model.extend({
    defaults: {
      name: null,
      src: null,
      // si son sonidos que van a ser pausados etc.
      persist: false,
      loop: false
    },

    /**
     * @return {HTMLAudio} reproduciendo.
     */
    play: function () {
      var audio = new Audio(this.get('src'));
      if (this.get('loop')) audio.loop = true;
      audio.play();

      return audio;
    }
  });

  /**
   * @extends Backbone.Collection
   *
   * @var {Set[string:HTMLAudio]} playlist
   * @method onPlay
   * @method onStop
   * @method onPause
   * @method onRemove
   */
  Backbone.AudioCollection = Backbone.Collection.extend({

    /**
     * Método llamado cuando se instancia desde el constructor.
     *
     * @param {HTMLAudio} el un audio del querySelectorAll.
     * @return {Backbone.Audio}
     */
    model: function (el) {
      return new Backbone.Audio({
        name: el.dataset.name,
        src: el.src,
        persist: el.dataset.persist,
        loop: el.loop
      });
    },

    /**
     * Lista de audios con persistencia como música de fondo.
     *
     * @var {Set[string:HTMLAudio]}
     */
    playlist: new Set(),

    initialize: function (attrs) {
      this.on('play', this.onPlay.bind(this));
      this.on('pause', this.onPause.bind(this));
      this.on('stop', this.onStop.bind(this));
      this.on('remove', this.onStop.bind(this));
    },

    /**
     * Inicia o continúa reproducción.
     *
     * Primero busca en playlist, luego en la colección.
     *
     * @param {string} audioName el nombre del audio.
     *
     * @return {HTMLAudio}
     */
    onPlay: function (audioName) {
      var audio;

      audio = this.playlist[audioName];

      if (audio) {
        audio.play();
      } else {
        var audioModel = this.findWhere({name: audioName});

        if (!audioModel) return false;

        audio = audioModel.play();

        if (audioModel.get('persist')) this.playlist[audioName] = audio;
      }

      return audio;
    },

    /**
     * Detiene y rebobina.
     *
     * Busca en playlist.
     *
     * @param {string} audioName el nombre del audio.
     *
     * @return {HTMLAudio}
     */
    onStop: function (audioName) {
      var audio = this.playlist[audioName];

      if (!audio) return false;

      audio.load();

      return audio;
    },

    /**
     * Pausa reproducción.
     *
     * Busca en playlist.
     *
     * @param {string} audioName el nombre del audio.
     *
     * @return {HTMLAudio}
     */
    onPause: function (audioName) {
      var audio = this.playlist[audioName];

      if (!audio) return false;

      audio.pause();

      return audio;
    },

    /**
     * Inicia o continúa reproducción.
     *
     * Busca en playlist.
     *
     * @param {string} audioName el nombre del audio.
     *
     * @return {boolean} verdadero si tiene éxito.
     */
    onRemove: function (audioName) {

      var audio = this.playlist[audioName];

      if (!audio) return false;

      delete this.playlist[audioName];

      return true;
    }
  });
}).call(this);
