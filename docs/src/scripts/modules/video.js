class Video {
  constructor() {
    if (!this.setVars()) return;

    this.setEvents();
  }

  setVars() {
    this.atts = {
      container: '.js-video',
      poster: '.js-poster',
      play: '.js-video-button',
      output: '.js-video-output',
    };
    this.config = {
      apiUrl: {
        youtube: 'https://www.youtube.com/player_api',
      },
      mode: [
        {
          regex: new RegExp(
            '^.*(youtu.be/|v/|embed/|v=|^)([a-zA-Z0-9-_]{11}).*$',
          ),
          type: 'youtube',
        },
      ],
      detect: {
        youtube: () =>
          // eslint-disable-next-line no-undef
          typeof YT !== 'undefined' && typeof YT.Player !== 'undefined',
      },
      detectStep: 10,
    };

    this.videos = this.getVideos();

    if (!this.videos.length) return null;

    this.status = {
      apiReady: {
        youtube: '',
      },
    };

    return true;
  }

  setEvents() {
    this.videos.forEach((video, index) => {
      video.play.addEventListener('click', () => {
        if (!this.videos[index].player) {
          this.initPlayVideo(this.videos[index]);
          return;
        }

        this.playVideo(index);
      });
    });
  }

  playVideo(index) {
    const { player } = this.videos[index];
    if (!player || typeof player.playVideo !== 'function') return;

    player.playVideo();
  }

  findVideoWrapper(wrapper) {
    const { length } = this.videos;
    for (let i = 0; i < length; i += 1) {
      if (this.videos[i].wrapper === wrapper) return i;
    }
    return this.addNewVideo(wrapper);
  }

  addNewVideo(wrapper) {
    const data = this.getVideoObject(wrapper, this.videos.length);
    if (!data) return null;

    this.videos.push(data);
    return this.videos.length - 1;
  }

  getVideos() {
    const sections = document.querySelectorAll(`${this.atts.container}`);
    const list = [];
    for (let i = 0; i < sections.length; i += 1) {
      const data = this.getVideoObject(sections[i], i);
      if (data) list.push(data);
    }
    return list;
  }

  getVideoObject(player, index) {
    const poster = player.querySelector(`${this.atts.poster}`);
    const play = player.querySelector(`${this.atts.play}`);
    const output = player.querySelector(`${this.atts.output}`);
    if (!output) return null;

    const videoData = this.getVideoData(player.getAttribute('data-src'));
    if (!videoData) return null;

    const data = {
      wrapper: player,
      poster,
      hideClass: 'u-hidden',
      play,
      loadingClass: 'loading',
      output,
      autoplay: true,
      controls: true,
      index,
      playing: true,
    };

    data.videoType = videoData.videoType;

    data.videoId = videoData.videoId;

    return data;
  }

  getVideoData(url) {
    if (!url) return null;
    const { length } = this.config.mode;

    for (let i = 0; i < length; i += 1) {
      const matches = url.match(this.config.mode[i].regex);

      if (matches) {
        return {
          videoType: this.config.mode[i].type,
          videoId: matches[2],
        };
      }
    }
    return null;
  }

  generateVideoElements() {
    const { length } = this.videos;
    for (let i = 0; i < length; i += 1) this.initVideo(this.videos[i]);
  }

  initVideo(data) {
    if (this.config.apiUrl[data.videoType] === undefined) return;

    if (this.status.apiReady[data.videoType]) this.initVideoType(data);
    else
      this.loadApi(data.videoType, () => {
        this.status.apiReady[data.videoType] = true;
        this.initVideoType(data);
      });
  }

  initVideoType(data) {
    if (data.videoType === 'youtube') this.initYoutubeVideo(data);
  }

  initPlayVideo(data) {
    data.play.classList.add(data.loadingClass);
    this.initVideo(data);
  }

  loadApi(videoType, callback) {
    const tag = document.createElement('script');
    tag.src = this.config.apiUrl[videoType];
    const firstTag = document.getElementsByTagName('script')[0];
    firstTag.parentNode.insertBefore(tag, firstTag);

    const isApiReady = () => {
      if (this.config.detect[videoType]()) callback();
      else
        setTimeout(() => {
          isApiReady();
        }, this.config.detectStep);
    };
    isApiReady();
  }

  initYoutubeVideo(data) {
    const { index } = data;

    // eslint-disable-next-line no-undef
    this.videos[index].player = new YT.Player(data.output, {
      videoId: data.videoId,
      playerVars: {
        controls: 1,
        playsinline: 1,
        loop: 0,
        rel: 0,
        showinfo: 0,
        ecver: 2,
        mute: 0,
        origin: `${window.location.protocol}//${window.location.hostname}`,
      },
      events: {
        onReady: (e) => {
          e.target.playVideo();
        },
        onStateChange: (e) => {
          // eslint-disable-next-line no-undef
          if (e.data === YT.PlayerState.PLAYING) {
            this.pauseOtherVideos(data.index);
            data.play.classList.add(data.hideClass);
            data.play.classList.remove(data.loadingClass);
            if (data.poster) data.poster.classList.add(data.hideClass);
          } else if (
            // eslint-disable-next-line no-undef
            e.data === YT.PlayerState.PAUSED ||
            // eslint-disable-next-line no-undef
            e.data === YT.PlayerState.ENDED
          ) {
            data.play.classList.remove(data.hideClass);
            if (data.poster) data.poster.classList.remove(data.hideClass);
          }
        },
      },
    });
  }

  pauseOtherVideos(index = -1) {
    const { length } = this.videos;
    for (let i = 0; i < length; i += 1) {
      if (i !== index && this.videos[i].player !== undefined) {
        if (this.videos[i].videoType === 'youtube')
          this.videos[i].player.pauseVideo();

        this.videos[i].playing = false;

        if (this.videos[i].play)
          this.videos[i].play.classList.remove(this.videos[i].loadingClass);

        if (this.videos[i].poster)
          this.videos[i].poster.classList.remove(this.videos[i].hideClass);
      }
    }
  }
}

export default Video;
