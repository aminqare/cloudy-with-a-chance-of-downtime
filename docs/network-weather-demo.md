# Network Weather MVP · five-minute presenter runbook

Open `http://localhost:3000/network-weather/` after starting the local server with `npm start`. The app uses deterministic fixture data, so the same story can be repeated without editing data.

1. **Set the scene (0:00–0:45)** — Start at `Now`. Point out the condition badge, observed timestamp, confidence, metro map, and synchronized KPI cards.
2. **Explain movement (0:45–1:30)** — Drag the timeline through `11:00`, `14:00`, and `15:00`. Call out the observed-to-forecast boundary and the explicit fixture gap.
3. **Show peak pressure (1:30–2:20)** — Choose `Tonight` / `18:00`, select Traffic or Latency, and explain congestion onset and the north/east pressure.
4. **Show severe weather (2:20–3:10)** — Choose `21:00` or drag to the storm frame. Click the Eastern corridor warning, then switch to NOC and Engineering views.
5. **Show planned impact and recovery (3:10–4:00)** — Use the airport warning to explain planned maintenance, then choose `Tomorrow` / `00:00` to show the recovery scenario.
6. **Hand off the forecast (4:00–5:00)** — Turn on Presenter mode, use Play at 2×, and finish with the narrative, ticker, forecast confidence, and clear observed/forecast labels.

Useful controls: Previous/Next for one-frame movement, `Now`, `+1 hour`, `Tonight`, `Tomorrow`, Play/Pause, speed, map layer chips, warning rows, audience view, Presenter mode, and Reduce motion.

Limitations are intentionally visible: data is illustrative, timestamps are Tehran/IRST, and no live NMS/OSS connector is configured.
