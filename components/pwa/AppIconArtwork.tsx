type AppIconArtworkProps = {
  size: number;
};

export function AppIconArtwork({ size }: AppIconArtworkProps) {
  const loopSize = size * 0.6;
  const accentSize = size * 0.16;
  const lineThickness = Math.max(14, Math.round(size * 0.035));

  return (
    <div
      style={{
        alignItems: "center",
        background: "#f7f3ea",
        borderRadius: Math.round(size * 0.24),
        display: "flex",
        height: size,
        justifyContent: "center",
        position: "relative",
        width: size,
      }}
    >
      <div
        style={{
          border: `${Math.round(size * 0.07)}px solid #0f5b52`,
          borderRadius: "999px",
          boxSizing: "border-box",
          height: loopSize,
          position: "relative",
          width: loopSize,
        }}
      />
      <div
        style={{
          background: "#f7f3ea",
          borderRadius: "999px",
          height: Math.round(size * 0.16),
          left: "56%",
          position: "absolute",
          top: "20%",
          transform: "rotate(-18deg)",
          width: Math.round(size * 0.31),
        }}
      />
      <div
        style={{
          border: `${lineThickness}px solid #17231f`,
          borderRadius: "999px",
          borderTopColor: "transparent",
          borderRightColor: "transparent",
          boxSizing: "border-box",
          height: Math.round(size * 0.48),
          left: "18%",
          position: "absolute",
          top: "24%",
          transform: "rotate(16deg)",
          width: Math.round(size * 0.48),
        }}
      />
      <div
        style={{
          alignItems: "center",
          background: "#a87727",
          borderRadius: "999px",
          display: "flex",
          height: accentSize,
          justifyContent: "center",
          left: "64%",
          position: "absolute",
          top: "25%",
          width: accentSize,
        }}
      >
        <div
          style={{
            background: "#f1e4cb",
            borderRadius: "999px",
            height: Math.round(accentSize * 0.45),
            width: Math.round(accentSize * 0.45),
          }}
        />
      </div>
      <div
        style={{
          background: "#17231f",
          borderRadius: "999px",
          height: lineThickness,
          left: "58%",
          position: "absolute",
          top: "32%",
          width: Math.round(size * 0.18),
        }}
      />
    </div>
  );
}
