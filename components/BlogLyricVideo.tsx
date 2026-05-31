type BlogLyricVideoProps = {
  title: string;
  description?: string;
  youtubeId?: string;
  src?: string;
  posterSrc?: string;
};

export function BlogLyricVideo({ title, description, youtubeId, src, posterSrc }: BlogLyricVideoProps) {
  const youtubeWatchUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null;

  return (
    <figure className="blog-lyric-video">
      {youtubeId ? (
        <div className="blog-lyric-video-embed">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : null}
      {!youtubeId && src ? (
        <video
          className="blog-lyric-video-player"
          aria-label={title}
          controls
          playsInline
          preload="metadata"
          poster={posterSrc}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
      <figcaption>
        <strong>{title}</strong>
        {description ? <span>{description}</span> : null}
        {youtubeWatchUrl ? (
          <a href={youtubeWatchUrl} target="_blank" rel="noopener noreferrer">
            Watch on YouTube
          </a>
        ) : null}
      </figcaption>
    </figure>
  );
}
