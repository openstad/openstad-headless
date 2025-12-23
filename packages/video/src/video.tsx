import './video.scss';
import React, { useState, useEffect, FC, useId, useRef } from 'react';
import type { BaseProps } from '@openstad-headless/types';

export type VideoFieldProps = BaseProps &
  VideoProps & {
    resourceId?: string;
    resourceIdRelativePath?: string;
  };

export type VideoProps = {
  videoUrl?: string;
  cc_lang_pref?: string;
};


const VideoField: FC<VideoFieldProps> = ({
  // videoUrl = 'https://www.youtube.com/watch?v=j38Fqcnfz6M',
  // videoUrl = 'https://www.youtube.com/shorts/_KgcoaeHCBE',
  videoUrl = 'https://www.youtube.com/shorts/mnDe3BaEBxc',
  cc_lang_pref = 'en',
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

  const videoId = getYouTubeVideoId(videoUrl);

  const playerRef = useRef<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [muted, setMuted] = useState(true);
  const [muteToggle, setMuteToggle] = useState<boolean>(false);

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
            mute: 1,
            loop: 1,
            playlist: videoId,
            cc_lang_pref: cc_lang_pref,
            cc_load_policy: 1,
            rel: 0,
            iv_load_policy: 3,
            showinfo: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              setPlayer(event.target);
              event.target.mute();
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
      } else {
        player.mute();
        setMuted(true);
      }
    }
  };

  return (
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
          <div onClick={handleVideoClick} className={`muteToggle ${muted ? '--muted' : '--unmuted'} ${muteToggle ? '--toggle' : ''}`} role="button" tabIndex={0}>
            <span className="sr-only">{muted ? 'Unmute' : 'Mute'}</span>
            <div className="icon"></div>
          </div>
        </>
      ) : (
        <div>No video URL provided.</div>
      )}
    </div>
  );
}
export { VideoField };
export default VideoField;
