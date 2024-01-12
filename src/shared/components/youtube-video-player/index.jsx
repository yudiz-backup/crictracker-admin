import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { secondsToHms } from 'shared/utils'

function YoutubeVideoPlayer({ url, stopsPoints, onStop, events, height, width, className, children, onStopPointClick }) {
  const [playerStats, setPlayerStats] = useState(-1) // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
  const player = useRef()
  const interval = useRef()
  const range = useRef()
  const duration = useRef()

  const id = getId(url)

  function getId(u = '') {
    // eslint-disable-next-line no-useless-escape
    const regEx = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
    return u?.match(regEx)?.[2]
  }

  function onReady() {
    if (id) {
      if (typeof player.current?.destroy === 'function') player.current.destroy()
      player.current = new window.YT.Player(`p-${id}`, {
        height: height || '390',
        width: width || '100%',
        videoId: id,
        playerVars: {
          playsinline: 1,
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          mute: 1,
          loop: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: () => {
            duration.current = Math.round(playerEvents('getDuration'))
            range.current.max = duration.current
            handleChangeSeconds()
          },
          onStateChange: ({ data }) => {
            setPlayerStats(data)
            if (data === 1) {
              startListening()
            } else {
              data === 0 && playerEvents('playVideo')
              interval.current && clearInterval(interval.current)
            }
          }
        }
      })
    }
  }

  function playerEvents(name, params) {
    if (typeof player.current?.[name] === 'function') {
      if (name === 'pauseVideo') onStopPointClick(stopsPoints?.indexOf(Number(range?.value || -1)))
      return params ? player.current[name](params) : player.current[name]()
    } else return null
  }

  function startListening() {
    // handleChangeSeconds()
    interval.current = setInterval(handleChangeSeconds, 1000)
  }

  function handleChangeSeconds() {
    const t = Math.round(playerEvents('getCurrentTime'))

    range.current.value = t
    document.getElementById('v-time').innerHTML = secondsToHms(range.current.value)
    const shouldStop = stopsPoints?.indexOf(t)
    if (shouldStop !== -1) {
      playerEvents('pauseVideo')
      typeof onStop === 'function' && onStop(shouldStop)
    }
  }

  function handlePlayPush() {
    playerEvents(playerStats === 1 ? 'pauseVideo' : 'playVideo')
  }

  function handleRangeChange(e) {
    document.getElementById('v-time').innerHTML = secondsToHms(e.target.value)
  }

  function handleVideoRange(e) {
    playerEvents('seekTo', Math.round(e.target.value))
  }

  function getQuestionPosition(item) {
    return (item / duration.current) * 100
  }

  function handleStopPointClick(item, index) {
    if (stopsPoints?.includes(item)) playerEvents('pauseVideo')
    typeof onStopPointClick === 'function' && onStopPointClick(index)
    range.current.value = item
    playerEvents('seekTo', item)
    document.getElementById('v-time').innerHTML = secondsToHms(item)
  }

  if (events) events.playVideo = () => playerEvents('playVideo')

  useEffect(() => {
    if (url && id) {
      window.YT.loaded === 1 && onReady()
      window.onYouTubeIframeAPIReady = onReady
      return () => {
        interval.current && clearInterval(interval.current)
      }
    }
  }, [url])
  return (
    <>
      <div className="ratio ratio-16x9">
        <div
          id={`p-${id}`}
          className={`${className || ''} p-0 pe-none `}
          // style={{ width, height }}
        />
        {children && children({ player: player.current, playerEvents, playerStats, range: range.current })}
      </div>
      {/* // controls */}
      <div className="video-controls d-flex align-items-center px-3 py-2">
        <span className="pe-2 lead">
          <i onClick={handlePlayPush} className={`icon-${playerStats === 1 ? 'pause' : 'play'} pe-cursor`} />
        </span>
        <span id="v-time" className="pe-2">
          00:00
        </span>
        <div className="player-range flex-grow-1 position-relative">
          <input
            ref={range}
            type="range"
            min={0}
            defaultValue={0}
            max={10}
            // step={0.5}
            onChange={handleRangeChange}
            onMouseUp={handleVideoRange}
            onMouseDown={() => playerEvents('pauseVideo')}
            className="d-block"
          />
          {playerStats !== -1 &&
            stopsPoints?.map((item, index) => (
              <div
                key={item}
                style={{ left: `${getQuestionPosition(item)}%` }}
                onClick={() => handleStopPointClick(item, index)}
                className="rangePin position-absolute rounded-circle pe-cursor"
              />
            ))}
          {/* <div className="range-list position-relative">
            {stopsPoints?.map((item, index) => (
              <input key={item} type='range' className='position-absolute w-100' />
            ))}
          </div> */}
        </div>
      </div>
      {/* {children && children({ player: player.current, playerEvents, playerStats, range: range.current })} */}
    </>
  )
}
YoutubeVideoPlayer.propTypes = {
  url: PropTypes.string,
  stopsPoints: PropTypes.array,
  onStop: PropTypes.func,
  events: PropTypes.object,
  height: PropTypes.string.isRequired,
  width: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.func,
  onStopPointClick: PropTypes.func
}
export default React.memo(YoutubeVideoPlayer)
