export default function GradientBorder({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gradient-border fade-in dl-1">
      <div className="ch-component">{children}</div>
    </div>
  );
}
