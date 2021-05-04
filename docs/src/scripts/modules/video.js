/* eslint-disable */
// DISABLED ESLINT TEMP
export default class Video {
  constructor () {
      if (!this.setVars()) return

      this.setEvents()
  }

  setVars () {
      this.atts = {
          container: '.js-video',
          poster: '.js-poster',
          play: '.js-video-button',
          output: '.js-video-output',
      }
      this.config = {
          apiUrl: {
              youtube: 'https://www.youtube.com/player_api',
          },
          mode: [
              {
                  regex: new RegExp('^.*(youtu.be/|v/|embed/|v=|^)([a-zA-Z0-9-_]{11}).*$'),
                  type: 'youtube'
              },
          ],
          detect: {
              youtube: () => (typeof YT !== 'undefined') && (typeof YT.Player !== 'undefined'),
          },
          detectStep: 10
      }

      this.videos = this.getVideos()
      console.log('vvideos', this.videos);

      if (!this.videos.length) return

      this.status = {
          apiReady: {
              youtube: '',
          }
      }

      return true
  }

  setEvents () {
    this.videos.forEach((video, index) => {
      video.play.addEventListener('click', (e) => {
        console.log('index', index)
        this.initPlayVideo(this.videos[index])
      })
    })
  }

  findVideoWrapper (wrapper) {
      const { length } = this.videos
      for (let i = 0; i < length; i++) {
          if (this.videos[i].wrapper !== wrapper) continue
          return i
      }
      return this.addNewVideo(wrapper)
  }

  addNewVideo (wrapper) {
      const data = this.getVideoObject(wrapper, this.videos.length)
      console.log('data', data);
      if (!data) return
      this.videos.push(data)
      return (this.videos.length - 1)
  }

  getVideos () {
      console.log('getVideos')
      const sections = document.querySelectorAll(`${this.atts.container}`)
      console.log(sections)
      const list = []
      for (let i = 0; i < sections.length; i++) {
          const data = this.getVideoObject(sections[i], i)
          if (data) list.push(data)
      }
      return list
  }

  getVideoObject (player, index) {
      console.log('getVideoObject')
      const poster = player.querySelector(`${this.atts.poster}`)
      const play = player.querySelector(`${this.atts.play}`)
      const output = player.querySelector(`${this.atts.output}`)
      if (!output) return

      const videoData = this.getVideoData(player.getAttribute('data-src'))
      if (!videoData) return

      const data = {
          wrapper: player,
          poster,
          posterClass: poster ? 'hide' : '',
          play,
          playClass: play ? 'loading' : '',
          output,
          autoplay: true,
          controls: true,
          index: index,
          playing: true
      }

      data.videoType = videoData.videoType

      data.videoId = videoData.videoId

      return data
  }

  getVideoData (url) {
      console.log('getVideoData', url);
      if (!url) return;
      console.log('this.config.mode', this.config.mode);
      const { length } = this.config.mode

      for (let i = 0; i < length; i++) {
          const matches = url.match(this.config.mode[i].regex)
          console.log('matches', matches);
          if (!matches) continue
          return {
              videoType: this.config.mode[i].type,
              videoId: matches[2]
          }
      }
      return null
  }

  generateVideoElements () {
      const { length } = this.videos
      for (let i = 0; i < length; i++)
          this.initVideo(this.videos[i])
  }

  initVideo (data) {
      if (this.config.apiUrl[data.videoType] === undefined) return

      if (this.status.apiReady[data.videoType])
          this.initVideoType(data)
      else
          this.loadApi(
              data.videoType,
              () => {
                  this.status.apiReady[data.videoType] = true
                  this.initVideoType(data)
              }
          )
  }

  initVideoType (data) {
      if (data.videoType === 'youtube') this.initYoutubeVideo(data)
  }

  initPlayVideo (data) {
    console.log('initPlayVideo', data);
    if (data.playClass) {
      data.play.classList.add(data.playClass)
    }
    this.initVideo(data);
  }

  loadApi (videoType, callback) {
      const tag = document.createElement('script')
      tag.src = this.config.apiUrl[videoType]
      const firstTag = document.getElementsByTagName('script')[0]
      firstTag.parentNode.insertBefore(tag, firstTag)

      const isApiReady = () => {
          if (this.config.detect[videoType]()) callback()
          else setTimeout(() => {
              isApiReady()
          }, this.config.detectStep)
      }
      isApiReady()
  }

  initYoutubeVideo (data) {
      const index = data.index

      this.videos[index].player = new YT.Player(data.output, {
          videoId: data.videoId,
          playerVars: {
              controls: 1,
              playsinline: 1,
              loop: 0,
              rel: 0,
              showinfo: 0,
              ecver: 2,
              mute: 1,
              origin: `${window.location.protocol}//${window.location.hostname}`
          },
          events: {
              onReady: (e) => {
                e.target.playVideo();
              },
              onStateChange: (e) => {
                // TODO: Add pause state
                  if (e.data === YT.PlayerState.PLAYING) {
                    this.pauseOtherVideos(data.index)
                    if (data.poster) data.poster.classList.add(data.posterClass)
                    if (data.playClass) data.play.classList.add(data.posterClass)
                  }
              }
          }
      })
  }

  pauseOtherVideos (index = -1) {
    const { length } = this.videos
    for (let i = 0; i < length; i++) {
      if ((i === index) || (this.videos[i].player === undefined)) continue
      if (this.videos[i].videoType === 'youtube') this.videos[i].player.pauseVideo()

      this.videos[i].playing = false

      if (this.videos[i].play)
        this.videos[i].play.classList.remove(this.videos[i].playClass)

      if (this.videos[i].poster)
        this.videos[i].poster.classList.remove(this.videos[i].posterClass)
    }
  }
}
