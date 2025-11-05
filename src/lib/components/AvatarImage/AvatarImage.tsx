export default function AvatarImage({
  src,
  className,
  alt = "Avatar",
  title,
  style,
}: {
  src: string;
  className?: string;
  alt?: string;
  title?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt}
      title={title}
      className={`avatar rounded-circle ${className}`}
      onError={(e: any) => {
        e.target.src = `https://api.dicebear.com/9.x/glass/svg?seed=${Date.now()}`;
      }}
      style={{
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
