const EquityChart = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = LightweightCharts.createChart(ref.current, {
      layout: { background: { color: 'transparent' }, textColor: '#8b949e' },
      grid: { vertLines: { color: '#21262d' }, horzLines: { color: '#21262d' } },
      rightPriceScale: { borderColor: '#30363d' },
      timeScale: { borderColor: '#30363d', timeVisible: true },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      width:  ref.current.offsetWidth,
      height: ref.current.offsetHeight,
    });

    const series = chart.addSeries(LightweightCharts.AreaSeries, {
      lineColor: '#58a6ff',
      topColor: '#58a6ff33',
      bottomColor: '#58a6ff05',
      lineWidth: 2,
    });
    series.setData(EQUITY);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (ref.current) {
        chart.applyOptions({ width: ref.current.offsetWidth, height: ref.current.offsetHeight });
      }
    });
    ro.observe(ref.current);

    return () => { chart.remove(); ro.disconnect(); };
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};
