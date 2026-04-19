const Sparkline = ({ data, up }) => {
  const w = 140, h = 44;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  });

  const color = up ? '#3fb950' : '#f85149';
  const fill  = up ? '#3fb95018' : '#f8514918';
  const polyline = pts.join(' ');
  const area = `0,${h} ${polyline} ${w},${h}`;

  return (
    <svg width={w} height={h} className="pos-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon points={area} fill={fill} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
};
