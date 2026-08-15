import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, FeatureGroup, useMap } from "react-leaflet";
import DrawControl from "../components/DrawControl";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet.heat";
import client from "../api/client";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CATEGORY_COLORS = {
  infiltration_attempt: "red", ied: "darkred", protest: "orange",
  troop_movement: "purple", propaganda_broadcast: "blue",
  ceasefire_violation: "crimson", supply_convoy: "green",
  aerial_activity: "teal", null: "gray",
};

// --- Heatmap layer, driven imperatively since react-leaflet has no native heat component ---
function HeatmapLayer({ points, visible }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (visible && points.length > 0) {
      const heatPoints = points.map((p) => [p.lat, p.lon, p.weight]);
      layerRef.current = L.heatLayer(heatPoints, { radius: 25, blur: 20 }).addTo(map);
    }
    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [points, visible, map]);

  return null;
}

// --- Sector polygons drawn on the map ---
function SectorOverlay({ sectors }) {
  const map = useMap();
  useEffect(() => {
    const layers = sectors.map((s) => {
      const coords = s.polygon.coordinates[0].map(([lng, lat]) => [lat, lng]);
      return L.polygon(coords, { color: "cyan", weight: 2, fillOpacity: 0.05 })
        .bindTooltip(s.name)
        .addTo(map);
    });
    return () => layers.forEach((l) => map.removeLayer(l));
  }, [sectors, map]);
  return null;
}

export default function MapView() {
  const [allEvents, setAllEvents] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const [sectors, setSectors] = useState([]);
  const [showSectors, setShowSectors] = useState(true);
  const [polygonResult, setPolygonResult] = useState(null);

  // time-lapse state
  const [timelapseEvents, setTimelapseEvents] = useState([]);
  const [timelapseIndex, setTimelapseIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState("live"); // "live" | "timelapse"

  const featureGroupRef = useRef(null);

  const loadEvents = useCallback(() => {
    client.get("/map/events", { params: { start_date: startDate || undefined, end_date: endDate || undefined } })
      .then((res) => setAllEvents(res.data));
  }, [startDate, endDate]);

  useEffect(loadEvents, [loadEvents]);

  useEffect(() => {
    client.get("/map/sectors").then((res) => setSectors(res.data));
  }, []);

  // --- polygon draw handler ---
  const onPolygonCreated = async (e) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON().geometry; // { type: "Polygon", coordinates: [...] }

    const res = await client.post("/map/events/polygon", {
      polygon: geojson,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
    setPolygonResult({ geojson, events: res.data });
  };

  const saveSector = async () => {
    if (!polygonResult) return;
    const name = prompt("Name this sector:");
    if (!name) return;
    await client.post("/map/sectors", { name, polygon: polygonResult.geojson });
    const res = await client.get("/map/sectors");
    setSectors(res.data);
  };

  const startTimelapse = async () => {
    if (!startDate || !endDate) {
      alert("Set a start and end date first");
      return;
    }
    const res = await client.get("/map/timelapse", { params: { start_date: startDate, end_date: endDate } });
    setTimelapseEvents(res.data);
    setTimelapseIndex(0);
    setMode("timelapse");
  };

  useEffect(() => {
    if (!playing || mode !== "timelapse") return;
    if (timelapseIndex >= timelapseEvents.length) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setTimelapseIndex((i) => i + 1), 400);
    return () => clearTimeout(timer);
  }, [playing, timelapseIndex, timelapseEvents, mode]);

  const displayedEvents = mode === "timelapse"
    ? (polygonResult?.events ?? timelapseEvents).slice(0, timelapseIndex)
    : (polygonResult?.events ?? allEvents);

  const heatmapPoints = displayedEvents.map((e) => ({ lat: e.lat, lon: e.lon, weight: 1 }));

  return (
    <div className="ops-shell" style={{ display: "flex", height: "calc(100vh - 60px)" }}>
      {/* --- Controls sidebar --- */}
      <div style={{ width: 260, padding: "1rem", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <h3>Filters</h3>
        <label>Start date<br /><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label><br /><br />
        <label>End date<br /><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label><br /><br />

        <label><input type="checkbox" checked={showClusters} onChange={(e) => setShowClusters(e.target.checked)} /> Cluster pins</label><br />
        <label><input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} /> Heatmap overlay</label><br />
        <label><input type="checkbox" checked={showSectors} onChange={(e) => setShowSectors(e.target.checked)} /> Show sectors</label><br /><br />

        <h3>Time-lapse</h3>
        <button onClick={startTimelapse}>Load range</button>{" "}
        <button onClick={() => setPlaying((p) => !p)} disabled={mode !== "timelapse"}>{playing ? "Pause" : "Play"}</button><br />
        {mode === "timelapse" && (
          <>
            <input type="range" min={0} max={timelapseEvents.length} value={timelapseIndex}
              onChange={(e) => setTimelapseIndex(parseInt(e.target.value))} style={{ width: "100%" }} />
            <p>{timelapseIndex} / {timelapseEvents.length} events</p>
            <button onClick={() => { setMode("live"); setPlaying(false); }}>Back to live view</button>
          </>
        )}

        {polygonResult && (
          <>
            <h3>Polygon selection</h3>
            <p>{polygonResult.events.length} events in area</p>
            <button onClick={saveSector}>Save as sector</button>{" "}
            <button onClick={() => setPolygonResult(null)}>Clear</button>
          </>
        )}

        <h3>Sectors</h3>
        <ul style={{ paddingLeft: 16 }}>
          {sectors.map((s) => <li key={s.id}>{s.name}</li>)}
        </ul>
      </div>

      {/* --- Map --- */}
      <div style={{ flex: 1 }}>
        <MapContainer center={[30, 70]} zoom={5} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

          <DrawControl onCreated={onPolygonCreated} />
          
          {showSectors && <SectorOverlay sectors={sectors} />}
          <HeatmapLayer points={heatmapPoints} visible={showHeatmap} />

          {!showHeatmap && showClusters && (
            <MarkerClusterGroup>
              {displayedEvents.map((e) => (
                <CircleMarker key={e.event_id} center={[e.lat, e.lon]} radius={6} pathOptions={{ color: CATEGORY_COLORS[e.category] || "gray" }}>
                  <Popup><strong>{e.title}</strong><br />{e.category || "unclassified"}<br />{e.published_at?.slice(0, 10)}</Popup>
                </CircleMarker>
              ))}
            </MarkerClusterGroup>
          )}

          {!showHeatmap && !showClusters && displayedEvents.map((e) => (
            <CircleMarker key={e.event_id} center={[e.lat, e.lon]} radius={6} pathOptions={{ color: CATEGORY_COLORS[e.category] || "gray" }}>
              <Popup><strong>{e.title}</strong><br />{e.category || "unclassified"}<br />{e.published_at?.slice(0, 10)}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}