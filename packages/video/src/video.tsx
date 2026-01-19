import './video.scss';
import React, { useState, useEffect, FC, useId, useRef } from 'react';
import type { BaseProps } from '@openstad-headless/types';

export type VideoFieldProps = BaseProps &
  VideoProps & {
    resourceId?: string;
    resourceIdRelativePath?: string;
    currentPage?: number;
  };

export type VideoProps = {
  videoUrl?: string;
  videoLang?: string;
  videoSubtitle?: boolean;
};

const VideoField: FC<VideoFieldProps> = ({
  videoUrl,
  videoLang,
  videoSubtitle,
  ...props
}) => {
  const id = useId();
  function getYouTubeVideoId(url?: string) {
    if (!url) return '';
    // Match regular YouTube URLs
    let videoMatch = url.match(/v=([a-zA-Z0-9_-]+)/);
    if (videoMatch) return videoMatch[1];
    // Match Shorts URLs
    videoMatch = url.match(/shorts\/([a-zA-Z0-9_-]+)/);
    if (videoMatch) return videoMatch[1];
    return '';
  }

  const playerRef = useRef<any>(null);
  const [videoId, setVideoId] = useState<string>(getYouTubeVideoId(videoUrl));
  const [player, setPlayer] = useState<any>(null);
  // Houd mute-status persistent over paginatie
  const [muted, setMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = window.sessionStorage.getItem('video-muted');
      return stored === null ? true : stored === 'true';
    }
    return true;
  });
  const [muteToggle, setMuteToggle] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(true);

  useEffect(() => {
    setVideoId(getYouTubeVideoId(videoUrl));
    if (player && typeof player.destroy === 'function') {
      player.destroy();
      setPlayer(null);
    }
  }, [props.currentPage]);

  useEffect(() => {
    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = createPlayer;
    }

    function createPlayer() {
      if (playerRef.current) {
        const ytPlayer = new (window as any).YT.Player(playerRef.current, {
          host: 'https://www.youtube-nocookie.com',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            mute: muted ? 1 : 0,
            loop: 1,
            playlist: videoId,
            cc_lang_pref: videoLang,
            cc_load_policy: videoSubtitle ? 1 : 0,
            rel: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              setPlayer(event.target);
if (muted) {
  event.target.mute();
} else {
  event.target.unMute();
}
event.target.playVideo();
            },
          },
        });
      }
    }
  }, [videoId]);

  const handleVideoClick = () => {
    if (player) {
      setMuteToggle(true);
      setTimeout(() => {
        setMuteToggle(false);
      }, 1000);

      if (muted) {
        player.unMute();
        setMuted(false);
        if (typeof window !== 'undefined')
          window.sessionStorage.setItem('video-muted', 'false');
      } else {
        player.mute();
        setMuted(true);
        if (typeof window !== 'undefined')
          window.sessionStorage.setItem('video-muted', 'true');
      }
    }
  };

  const handlePlayPause = (e: any) => {
    e.preventDefault();
    if (player) {
      if (playing) {
        player.pauseVideo();
        setPlaying(false);
      } else {
        player.playVideo();
        setPlaying(true);
      }
    }
  };

  return (
    <>
      <button
        onClick={(e) => handlePlayPause(e)}
        className={`playPauseToggle ${playing ? '--playing' : '--paused'}`}
        role="button"
        tabIndex={0}
      >
        <span className="sr-only">{playing ? 'Pause' : 'Play'}</span>
        <div className="icon"></div>
      </button>
      <div className="video-field">

        {videoId ? (
          <>
            <div className="video-container">
              <div
                ref={playerRef}
                id={id}
                className="video-player"
                tabIndex={-1}
              />
            </div>
            <div
              onClick={handleVideoClick}
              className={`muteToggle ${muted ? '--muted' : '--unmuted'} ${muteToggle ? '--toggle' : ''
                }`}
              role="button"
              tabIndex={0}
            >
              <span className="sr-only">{muted ? 'Unmute' : 'Mute'}</span>
              <div className="icon"></div>
            </div>
          </>
        ) : (
          <div>No video URL provided.</div>
        )}
      </div>
    </>
  );
};
export { VideoField };
export default VideoField;
