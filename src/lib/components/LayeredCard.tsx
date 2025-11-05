export default function LayeredCard({
  children,
  className,
  style,
  innerCardStyle,
  innerCardClassName,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  innerCardStyle?: React.CSSProperties;
  innerCardClassName?: string;
}) {
  return (
    <div className={`layered-card-outer ${className}`} style={{ ...style }}>
      <div
        className={`layered-card-middle ${innerCardClassName}`}
        style={{ ...innerCardStyle }}
      >
        {children}
      </div>
    </div>
  );
}
