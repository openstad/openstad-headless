import type { BaseProps } from '@openstad-headless/types';
import React, { FC, useEffect, useId, useRef, useState } from 'react';

import './video.scss';

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

  const playerRef = useRef<HTMLIFrameElement>(null);
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
  // Alles wat vroeger playerVars was zit nu in de query van de iframe-src.
  const embedSrc = (() => {
    if (!videoId) return '';
    const p = new URLSearchParams({
      enablejsapi: '1',
      autoplay: '0',
      controls: '0',
      mute: '1',
      loop: '1',
      playlist: videoId,
      rel: '0',
      iv_load_policy: '3',
      modestbranding: '1',
      playsinline: '1',
      cc_load_policy: videoSubtitle ? '1' : '0',
    });
    if (videoLang) p.set('cc_lang_pref', videoLang);
    if (typeof window !== 'undefined') p.set('origin', window.location.origin);
    return `https://www.youtube-nocookie.com/embed/${videoId}?${p.toString()}`;
  })();

  const [muteToggle, setMuteToggle] = useState<boolean>(false);
  // ponytail: geen autoplay (WCAG 1.4.2/2.2.2). Video start gepauzeerd; gebruiker start hem zelf.
  const [playing, setPlaying] = useState<boolean>(false);
  // De speler-callbacks van YouTube leven buiten React en zien de state van het
  // moment van aanmaken. Deze ref houdt de gewenste geluidsstand bij.
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

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
        // ponytail: de API krijgt hier een bestaande <iframe> in plaats van een
        // lege <div>. Dat moet, want de iframe die de API zelf aanmaakt heeft
        // geen referrerpolicy, en deze site stuurt met
        // `referrer-policy: same-origin` geen Referer mee naar YouTube. Zonder
        // Referer weigert YouTube de embed met "Error 153" en blijft de speler
        // eeuwig bufferen. De instellingen die eerst in playerVars stonden zitten
        // nu in de src van die iframe.
        const ytPlayer = new (window as any).YT.Player(playerRef.current, {
          events: {
            onReady: (event: any) => {
              setPlayer(event.target);
              // ponytail: altijd gedempt klaarzetten. Ontdempen gebeurt pas als
              // hij daadwerkelijk speelt, zie onStateChange — anders weigert
              // Chrome te starten. Geen automatische playVideo(): de gebruiker
              // start hem zelf (1.4.2/2.2.2).
              event.target.mute();
            },
            // ponytail: hier stond niets, waardoor `playing` puur een aanname was:
            // de knop toonde "pauze" terwijl er in werkelijkheid niets speelde.
            // Nu volgt de knop de echte staat van de speler. Het geluid gaat pas
            // aan zodra hij loopt — een klik op ónze knop is geen gebruikersgebaar
            // bínnen de YouTube-iframe, en ongedempt starten mag dat wel vragen.
            onStateChange: (event: any) => {
              const staat = (window as any).YT?.PlayerState;
              if (!staat) return;
              if (event.data === staat.PLAYING) {
                setPlaying(true);
                if (!mutedRef.current) event.target.unMute();
              } else if (
                event.data === staat.PAUSED ||
                event.data === staat.ENDED
              ) {
                setPlaying(false);
              }
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
    if (!player) return;
    if (playing) {
      player.pauseVideo();
      setPlaying(false);
      return;
    }
    // Gedempt starten en pas ontdempen als hij loopt (onStateChange). Zonder dit
    // blijft de speler hangen op "buffering" zodra het geluid aanstaat, en die
    // stand blijft een hele sessie in sessionStorage staan — dan was de video
    // daarna nooit meer te starten.
    player.mute();
    player.playVideo();
    // setPlaying volgt uit onStateChange, niet uit de aanname dat het lukte.
  };

  return (
    <>
      <div className="video-field">
        {videoId ? (
          <>
            {/* ponytail: de knop stond búiten .video-field, dus zijn absolute
                positie hing af van een willekeurige voorouder. Nu hoort hij bij
                het videovlak, zodat "groot in het midden als hij gepauzeerd is"
                ook echt het midden van de video is. */}
            <button
              onClick={(e) => handlePlayPause(e)}
              className={`playPauseToggle ${
                playing ? '--playing' : '--paused'
              }`}
              tabIndex={0}>
              <span className="sr-only">
                {playing ? 'Video pauzeren' : 'Video afspelen'}
              </span>
              <div className="icon"></div>
            </button>
            <div className="video-container" aria-hidden="true">
              <iframe
                ref={playerRef}
                id={id}
                className="video-player"
                tabIndex={-1}
                title="Video"
                src={embedSrc}
                // Zonder dit stuurt deze site geen Referer mee en weigert
                // YouTube de embed (Error 153).
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                frameBorder={0}
              />
            </div>
            {/* ponytail: was een <div role="button">, die reageert niet op Enter
                of spatie (2.1.1). En de naam stond in het Engels op een
                Nederlandse pagina (2.5.3). */}
            <button
              onClick={handleVideoClick}
              className={`muteToggle ${muted ? '--muted' : '--unmuted'} ${
                muteToggle ? '--toggle' : ''
              }`}
              tabIndex={0}>
              <span className="sr-only">
                {muted ? 'Geluid aanzetten' : 'Geluid uitzetten'}
              </span>
              <div className="icon"></div>
            </button>
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
