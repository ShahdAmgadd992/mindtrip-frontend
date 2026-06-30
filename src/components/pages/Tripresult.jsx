import React, { useState, useRef, useEffect } from "react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import ChatBot from "./Chatbot";
import tripService from "../../services/tripService";
import "./AiPlanner.css";

// ─── Inject timeline + map styles ────────────────────────────────────────────
const TIMELINE_STYLES = `
  .aip-timeline-bar-wrap {
    display: flex;
    align-items: flex-end;
    gap: 0;
    margin: 12px 0 16px;
    width: 100%;
  }
  .aip-timeline-segment {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    position: relative;
  }
  .aip-timeline-label {
    font-size: 10px;
    color: #9ca3af;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }
  .aip-timeline-track {
    width: 100%;
    height: 6px;
    background: #e5e7eb;
    border-radius: 99px;
    overflow: hidden;
    position: relative;
  }
  .aip-timeline-fill {
    height: 100%;
    border-radius: 99px;
    background: #5596fe;
    transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 0;
  }
  .aip-timeline-dot2 {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #e5e7eb;
    border: 2px solid #d1d5db;
    transition: background 0.25s, border-color 0.25s, transform 0.2s;
    flex-shrink: 0;
  }
  .aip-timeline-dot2--active {
    background: #5596fe;
    border-color: #5596fe;
    transform: scale(1.15);
    box-shadow: 0 0 0 3px rgba(85,150,254,0.18);
  }
`;

// Inject once
if (
  typeof document !== "undefined" &&
  !document.getElementById("aip-timeline-css")
) {
  const s = document.createElement("style");
  s.id = "aip-timeline-css";
  s.textContent = TIMELINE_STYLES;
  document.head.appendChild(s);
}

// ─── Mapbox token ─────────────────────────────────────────────────────────────
const MAPBOX_TOKEN =
  "pk.eyJ1IjoieG1vaGFtZWR4IiwiYSI6ImNtcG1zZ25kbTB4eTkydHNidXZ2cnR2ajkifQ.CugdwmFa8ME2UU4rDEAJug";

// Day colours — one per day (cycles if > 10 days)
const DAY_COLORS = [
  "#5596fe",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  "#eab308",
  "#14b8a6",
  "#f43f5e",
  "#8b5cf6",
];

// ─── Edit caller — n8n webhook ────────────────────────────────────────────────
const callEdit = async (payload) => {
  const mod = await import("../../services/aiService");
  const svc = mod.default ?? mod;
  if (typeof svc.edit !== "function")
    throw new Error("aiService.edit is not exported from aiService.");
  return svc.edit(payload);
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconEdit = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconDots = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);
const IconHotel = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconCalendar = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ─── 3-dot day menu ───────────────────────────────────────────────────────────
const DayMenu = ({ day, onEdit, onRemove }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="aip-day-menu-wrap" ref={ref}>
      <button
        className="aip-day-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Day options"
      >
        <IconDots />
      </button>
      {open && (
        <div className="aip-day-menu-dropdown">
          <button
            className="aip-day-menu-item"
            onClick={() => {
              setOpen(false);
              onEdit(day);
            }}
          >
            <span className="aip-day-menu-icon">
              <IconEdit />
            </span>
            <span>Edit With AI</span>
          </button>
          <button
            className="aip-day-menu-item"
            onClick={() => {
              setOpen(false);
              onRemove(day);
            }}
          >
            <span className="aip-day-menu-icon">
              <IconTrash />
            </span>
            <span>Remove Day</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Hotel Card ───────────────────────────────────────────────────────────────
const HotelCard = ({ hotel }) => {
  if (!hotel) return null;
  return (
    <div className="aip-hotel-card">
      {hotel.photoUrl && (
        <img src={hotel.photoUrl} alt={hotel.name} className="aip-hotel-img" />
      )}
      <div className="aip-hotel-info">
        <div className="aip-hotel-label">
          <IconHotel />
          <span>Accommodation</span>
        </div>
        <h3 className="aip-hotel-name">{hotel.name}</h3>
        <div className="aip-hotel-meta">
          {hotel.city && (
            <span className="aip-hotel-meta-item">📍 {hotel.city}</span>
          )}
          {hotel.checkIn && hotel.checkOut && (
            <span className="aip-hotel-meta-item">
              <IconCalendar />
              {hotel.checkIn} – {hotel.checkOut}
              {hotel.nights ? ` · ${hotel.nights} Nights` : ""}
            </span>
          )}
        </div>
        {hotel.price != null && (
          <p className="aip-hotel-price">{hotel.price.toLocaleString()} EGP</p>
        )}
        {hotel.address && <p className="aip-hotel-address">{hotel.address}</p>}
      </div>
    </div>
  );
};

// ─── Custom direction-arrow icon ──────────────────────────────────────────────
// light-v11's sprite does not ship icons named "arrow" or "oneway-white-2",
// so referencing them directly causes Mapbox's "styleimagemissing" warning.
// Instead we draw a small triangle on a <canvas> once per map instance and
// register it with map.addImage() — this is pure client-side drawing, it
// makes no extra network/style requests and burns zero Mapbox token quota.
const ARROW_ICON_ID = "trip-direction-arrow";
function registerArrowIcon(map) {
  if (map.hasImage(ARROW_ICON_ID)) return;
  const size = 16;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(size * 0.18, size * 0.22);
  ctx.lineTo(size * 0.86, size * 0.5);
  ctx.lineTo(size * 0.18, size * 0.78);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  map.addImage(ARROW_ICON_ID, ctx.getImageData(0, 0, size, size), {
    sdf: true,
  });
}

// ─── Professional Trip Map ────────────────────────────────────────────────────
// Design choices:
//   • "streets-v12" style — natural colors (green parks, blue water) instead
//     of the washed-out gray look of light-v11, while staying readable
//   • Dashed animated line per day (CSS dash-offset animation via GL paint)
//   • Arrow markers mid-segment showing direction of travel
//   • Numbered pin markers: pill shape, colored per day, white number
//   • Smooth fitBounds with intelligent min/max zoom based on spread
//   • Floating legend card bottom-left with day color + label
//   • Hover tooltip on each pin (name + time-of-day slot)
//   • Loading skeleton while map tiles load
const TripMap = ({
  dayDetails,
  itinerary,
  expandedDay,
  checkedPlaces = {},
}) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [activePin, setActivePin] = useState(null); // { name, slot, x, y }

  // ── helpers ──────────────────────────────────────────────────────────────
  const dayIndexMap = {};
  itinerary.forEach((item, i) => {
    dayIndexMap[item.day] = i;
  });

  const getPlacesByDay = () => {
    const result = {};
    const days =
      expandedDay !== null ? [expandedDay] : itinerary.map((d) => d.day);
    days.forEach((dayNum) => {
      const pts = [];
      (dayDetails[dayNum] ?? []).forEach((slot, slotIdx) => {
        const items = (
          slot.rawItems ?? (slot.activities ?? []).map((a) => ({ name: a }))
        ).filter(Boolean);
        items.forEach((p, placeIdx) => {
          if (p?.lat && p?.lng)
            pts.push({
              ...p,
              _slot: slot.time,
              _slotIdx: slotIdx,
              _placeIdx: placeIdx,
            });
        });
      });
      if (pts.length) result[dayNum] = pts;
    });
    return result;
  };

  // ── load Mapbox GL from CDN ───────────────────────────────────────────────
  // bootedRef guards against double-initialisation (React 18 StrictMode fires
  // mount → unmount → mount in dev, and the CDN <script> "load" listener can
  // also fire more than once). Without this guard, mapboxgl.Map() can be
  // called a second time on a container that still holds the first
  // instance's canvas, which is exactly what triggers the
  // "map container element should be empty" warning.
  useEffect(() => {
    let cancelled = false;
    let resizeObserver = null;
    const bootedRef = { current: false };

    const boot = () => {
      if (cancelled || bootedRef.current || !mapContainer.current) return;
      bootedRef.current = true;
      try {
        const mgl = window.mapboxgl;
        if (!mgl) {
          setMapError(true);
          return;
        }
        mgl.accessToken = MAPBOX_TOKEN;
        const map = new mgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          zoom: 12,
          center: [31.2357, 30.0444],
          attributionControl: false,
          logoPosition: "bottom-right",
        });
        // Store the instance immediately (not just on "load") so the
        // cleanup function below can always call map.remove() and leave
        // the container empty, even if the style hasn't finished loading
        // yet when this component unmounts.
        mapRef.current = map;
        map.addControl(
          new mgl.AttributionControl({ compact: true }),
          "bottom-right",
        );
        map.addControl(
          new mgl.NavigationControl({ showCompass: false }),
          "top-right",
        );
        // Disable scroll zoom so the page scrolls normally
        map.scrollZoom.disable();
        map.on("load", () => {
          if (cancelled) return;
          // The canvas Mapbox creates internally is sized from the
          // container's dimensions AT CONSTRUCTION TIME. If the container
          // was laid out at the wrong size for even a frame (sticky/grid
          // layouts settling, fonts loading, etc.), the canvas can end up
          // smaller than the visible frame — leaving a blank strip that
          // never repaints until something explicitly tells Mapbox to
          // resize. Forcing it here removes that class of bug entirely.
          map.resize();
          registerArrowIcon(map);
          setMapLoaded(true);
        });
        map.on("error", () => {});

        // Keep the canvas in sync with the container for the lifetime of
        // the map — covers sticky/flex layout shifts, font reflows, and
        // window resizes, so the map always fills its frame exactly.
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => map.resize());
          resizeObserver.observe(mapContainer.current);
        }
      } catch {
        setMapError(true);
      }
    };

    if (window.mapboxgl) {
      boot();
    } else {
      if (!document.getElementById("mbgl-css")) {
        const l = document.createElement("link");
        l.id = "mbgl-css";
        l.rel = "stylesheet";
        l.href = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css";
        document.head.appendChild(l);
      }
      if (!document.getElementById("mbgl-js")) {
        const s = document.createElement("script");
        s.id = "mbgl-js";
        s.src = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js";
        s.onload = boot;
        s.onerror = () => setMapError(true);
        document.head.appendChild(s);
      } else {
        document
          .getElementById("mbgl-js")
          .addEventListener("load", boot, { once: true });
      }
    }
    return () => {
      cancelled = true;
      if (resizeObserver) resizeObserver.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove(); // tears down canvas + listeners, leaves container empty
        mapRef.current = null;
      }
      setMapLoaded(false);
    };
  }, []);

  // ── draw / redraw when data changes ──────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // ── teardown previous ──
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    setActivePin(null);
    // remove old sources/layers (collect ids first)
    const style = map.getStyle();
    if (style) {
      style.layers.forEach((l) => {
        if (l.id.startsWith("trip-")) map.removeLayer(l.id);
      });
      Object.keys(style.sources).forEach((s) => {
        if (s.startsWith("trip-")) map.removeSource(s);
      });
    }

    const byDay = getPlacesByDay();
    const allPts = Object.values(byDay).flat();
    if (!allPts.length) return;

    // Lines/arrows only make sense once the user has zoomed into one day —
    // showing every day's route at once was the main source of visual
    // clutter. In overview mode we only plant markers.
    const isFocusedDay = expandedDay !== null;
    const markerScale = isFocusedDay ? 1 : 0.78; // smaller pins in overview
    const showLegendNow = !isFocusedDay && Object.keys(byDay).length > 1;

    // ── draw each day ──
    Object.entries(byDay).forEach(([dayNum, pts]) => {
      const dayIdx = dayIndexMap[Number(dayNum)] ?? 0;
      const color = DAY_COLORS[dayIdx % DAY_COLORS.length];

      if (isFocusedDay && pts.length > 1) {
        const sid = `trip-src-${dayNum}`;
        const lidBg = `trip-bg-${dayNum}`;
        const lidLine = `trip-line-${dayNum}`;
        const lidDir = `trip-dir-${dayNum}`;

        // Route GeoJSON
        const coords = pts.map((p) => [p.lng, p.lat]);
        map.addSource(sid, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "LineString", coordinates: coords },
          },
        });

        // 1. Soft white halo under line
        map.addLayer({
          id: lidBg,
          type: "line",
          source: sid,
          paint: {
            "line-color": "#fff",
            "line-width": 8,
            "line-opacity": 0.7,
            "line-blur": 2,
          },
        });

        // 2. Solid colored line
        map.addLayer({
          id: lidLine,
          type: "line",
          source: sid,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": color,
            "line-width": 3.5,
            "line-opacity": 0.95,
          },
        });

        // 3. Direction arrows along the line
        registerArrowIcon(map); // safety net in case style/images were reset
        map.addLayer({
          id: lidDir,
          type: "symbol",
          source: sid,
          layout: {
            "symbol-placement": "line",
            "symbol-spacing": 80,
            "icon-image": ARROW_ICON_ID, // custom canvas-drawn arrow (see registerArrowIcon)
            "icon-size": 0.9,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
          paint: { "icon-color": color, "icon-opacity": 1 },
        });
      }

      // 4. Numbered pin markers (always shown — smaller when no day is open)
      pts.forEach((p, i) => {
        const isFirst = i === 0;

        const badgeSize = Math.round(28 * markerScale);
        const fontSize = Math.round(12 * markerScale);
        const tipWidth = Math.round(5 * markerScale);
        const tipHeight = Math.round(6 * markerScale);
        const shadowBlur = isFocusedDay ? 8 : 5;

        // Outer wrapper — gives us the "tail" pointer-down shape
        const wrap = document.createElement("div");
        wrap.className = "aip-map-marker";
        wrap.style.cssText = [
          "display:flex",
          "flex-direction:column",
          "align-items:center",
          "cursor:pointer",
          `filter:drop-shadow(0 3px ${shadowBlur}px rgba(0,0,0,0.28))`,
        ].join(";");

        // Pill badge
        const badge = document.createElement("div");
        badge.style.cssText = [
          `background:${color}`,
          "color:#fff",
          "font-family:Poppins,sans-serif",
          `font-size:${fontSize}px`,
          "font-weight:700",
          `min-width:${badgeSize}px`,
          `height:${badgeSize}px`,
          `border-radius:${badgeSize / 2}px`,
          "display:flex",
          "align-items:center",
          "justify-content:center",
          "padding:0 8px",
          "border:2.5px solid #fff",
          "position:relative",
          "z-index:2",
          "white-space:nowrap",
          isFirst ? "outline:3px solid " + color + "55" : "",
        ].join(";");
        badge.textContent = String(i + 1);

        // Tiny triangle pointer — لازم يتعمل الأول
        const tip = document.createElement("div");
        tip.style.cssText = [
          "width:0",
          "height:0",
          `border-left:${tipWidth}px solid transparent`,
          `border-right:${tipWidth}px solid transparent`,
          `border-top:${tipHeight}px solid ${color}`,
          "margin-top:-1px",
          "z-index:1",
        ].join(";");

        // ✅ دلوقتي تقدري تستخدمي tip
        const dayChecks = checkedPlaces[Number(dayNum)] ?? {};
        const isChecked = dayChecks[`${p._slotIdx}-${p._placeIdx}`] ?? false;
        if (isChecked) {
          badge.style.background = "#22c55e";
          badge.style.borderColor = "#16a34a";
          tip.style.borderTopColor = "#22c55e";
          wrap.style.opacity = "0.75";
        }

        wrap.appendChild(badge);
        wrap.appendChild(tip);
        tip.style.cssText = [
          "width:0",
          "height:0",
          `border-left:${tipWidth}px solid transparent`,
          `border-right:${tipWidth}px solid transparent`,
          `border-top:${tipHeight}px solid ${color}`,
          "margin-top:-1px",
          "z-index:1",
        ].join(";");

        // Hover interaction — show tooltip via React state
        wrap.addEventListener("mouseenter", (e) => {
          const rect = mapContainer.current?.getBoundingClientRect();
          const point = mapRef.current.project([p.lng, p.lat]);
          setActivePin({
            name: p.name ?? "",
            slot: p._slot ?? "",
            x: point.x,
            y: point.y,
          });
        });
        wrap.addEventListener("mouseleave", () => setActivePin(null));

        const marker = new window.mapboxgl.Marker({
          element: wrap,
          anchor: "bottom",
        })
          .setLngLat([p.lng, p.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });
    });

    // ── smart fit: zoom/center driven entirely by the actual spread of the
    // points being shown, instead of fixed zoom buckets. This is what keeps
    // the map filling its space instead of leaving dead gray margins when a
    // trip happens to span a wider or narrower area. ──
    const containerRect = mapContainer.current?.getBoundingClientRect();
    const cw = containerRect?.width || 600;
    const ch = containerRect?.height || 500;
    // Padding scales with the container so a small map and a tall map both
    // keep sensible breathing room instead of a one-size-fits-all pixel value.
    const padSide = Math.max(36, Math.min(70, cw * 0.1));
    const padTop = Math.max(36, Math.min(70, ch * 0.1));
    const padBottom = showLegendNow
      ? Math.max(90, ch * 0.2) // leave room for the floating legend card
      : Math.max(36, ch * 0.1);

    if (allPts.length === 1) {
      // A single point has no bounds to fit — just center on it.
      map.flyTo({
        center: [allPts[0].lng, allPts[0].lat],
        zoom: isFocusedDay ? 15 : 13,
        duration: 700,
      });
    } else {
      const lngs = allPts.map((p) => p.lng);
      const lats = allPts.map((p) => p.lat);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        {
          padding: {
            top: padTop,
            bottom: padBottom,
            left: padSide,
            right: padSide,
          },
          minZoom: 3,
          maxZoom: isFocusedDay ? 16 : 14,
          duration: 700,
        },
      );
    }
  }, [mapLoaded, dayDetails, itinerary, expandedDay, checkedPlaces]);
  const byDay = getPlacesByDay();
  const showLegend = expandedDay === null && Object.keys(byDay).length > 1;

  return (
    <div className="aip-result-map">
      {/* Map frame — fixed size, sticky. The element Mapbox attaches to is
          ALWAYS mounted at full size (never display:none), because hiding
          it would give Mapbox a 0×0 container to measure at construction
          time — that mismatch is what caused the map to render into only
          part of its frame and leave the rest blank/white. The loading
          state is drawn as an overlay on top instead. */}
      <div className="aip-mapbox-container" style={{ position: "relative" }}>
        {mapError ? (
          <div
            className="aip-map-fallback"
            style={{ width: "100%", height: "100%" }}
          >
            <span style={{ fontSize: "2.5rem" }}>🗺️</span>
            <p
              style={{
                margin: "8px 0 0",
                color: "#9ca3af",
                fontSize: "0.85rem",
              }}
            >
              Map unavailable
            </p>
          </div>
        ) : (
          <>
            <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

            {!mapLoaded && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg,#e8eef7 0%,#f0f4fb 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "3px solid #5596fe",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <p style={{ color: "#9ca3af", fontSize: "0.8rem", margin: 0 }}>
                  Loading map…
                </p>
              </div>
            )}

            {/* Hover tooltip */}
            {activePin && (
              <div
                style={{
                  position: "absolute",
                  left: activePin.x + 14,
                  top: activePin.y - 36,
                  background: "#1a1a2e",
                  color: "#fff",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "Poppins,sans-serif",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  zIndex: 10,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
                }}
              >
                {activePin.name}
                {activePin.slot && (
                  <span
                    style={{ marginLeft: "6px", opacity: 0.6, fontWeight: 400 }}
                  >
                    · {activePin.slot}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Legend — lives BELOW the map frame in normal flow, never overlapping
          or shrinking the map itself. Only shown in overview mode. */}
      {showLegend && mapLoaded && (
        <div className="aip-map-legend-below">
          {itinerary.map((item, i) => {
            const pts = byDay[item.day] ?? [];
            return (
              <div key={item.day} className="aip-map-legend-below-item">
                <span
                  className="aip-map-legend-below-dot"
                  style={{ background: DAY_COLORS[i % DAY_COLORS.length] }}
                />
                <span className="aip-map-legend-below-label">
                  Day {item.day}
                  {pts.length > 0 && (
                    <span className="aip-map-legend-below-count">
                      {" "}
                      · {pts.length} stops
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Spin keyframe injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Error Boundary — prevents white screen on any crash ─────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            fontFamily: "Poppins,sans-serif",
          }}
        >
          <p style={{ fontSize: "2rem" }}>⚠️</p>
          <h3 style={{ color: "#1a1a2e" }}>Something went wrong</h3>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            {String(this.state.error?.message ?? "")}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: "16px",
              padding: "10px 24px",
              background: "#5596fe",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontFamily: "Poppins,sans-serif",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
const TripResult = ({ tripPlan, user }) => {
  const [itinerary, setItinerary] = useState(tripPlan?.itinerary ?? []);
  const [dayDetails, setDayDetails] = useState(tripPlan?.dayDetails ?? {});
  const [expandedDay, setExpandedDay] = useState(null);
  const [hotel, setHotel] = useState(tripPlan?.hotel ?? null);

  // ✅ FIX: when this component is opened from "My Trips" (profile flow),
  // the `tripPlan` prop is often just `{ tripId }` — destination, budget,
  // governorate, people, title are NOT on it. Every place in this file that
  // read `tripPlan.destination` / `tripPlan.budget` / `tripPlan.adults` /
  // `tripPlan.title` directly was therefore silently working with
  // `undefined`. That's what produced "undefined Trip" as the title,
  // `totalBudgetEgp: 1` (the Math.max(1, undefined) fallback), no
  // city/destinationGovernorate at all in the save payload → 400
  // ValidationError, and `people: 1` always sent to the AI edit endpoint
  // regardless of the trip's real party size.
  // tripMeta is populated from the API response once the trip is fetched,
  // and everything below now reads tripPlan.X ?? tripMeta.X instead of
  // tripPlan.X alone.
  const [tripMeta, setTripMeta] = useState({
    title: tripPlan?.title ?? null,
    destination: tripPlan?.destination ?? null,
    governorate: tripPlan?.governorate ?? null,
    budget: tripPlan?.budget ?? null,
    totalBudgetEgp: tripPlan?.totalBudgetEgp ?? null,
    adults: tripPlan?.adults ?? null,
    children: tripPlan?.children ?? 0,
    startDate: tripPlan?.startDate ?? null,
    endDate: tripPlan?.endDate ?? null,
  });
  // Convenience getters — always prefer a value already present on the
  // freshly-generated tripPlan prop, fall back to what we fetched from
  // the API for trips loaded by tripId.
  const destination = tripPlan?.destination ?? tripMeta.destination;
  const governorate = tripPlan?.governorate ?? tripMeta.governorate;
  const budget = tripPlan?.budget ?? tripMeta.budget;
  const totalBudgetEgp =
    tripPlan?.totalBudgetEgp ?? tripMeta.totalBudgetEgp ?? budget;
  const adults = tripPlan?.adults ?? tripMeta.adults ?? 1;
  const children = tripPlan?.children ?? tripMeta.children ?? 0;
  const tripTitle =
    tripPlan?.title ?? tripMeta.title ?? (destination ? `${destination} Trip` : "Trip");
  // ✅ FIX: tripPlan.days is also missing for trips loaded by tripId — fall
  // back to however many days dayDetails actually has once it's hydrated.
 const tripDays = tripPlan?.days ?? (Object.keys(dayDetails).length || 1);
  const tripNights = tripPlan?.nights ?? Math.max(0, tripDays - 1);

  // Checkbox state: { [day]: { [`${slotIdx}-${placeIdx}`]: boolean } }
  const [checkedPlaces, setCheckedPlaces] = useState({});

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [editText, setEditText] = useState("");
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editConversation, setEditConversation] = useState([]);

  // Remove day popup
  const [showRemoveDayPopup, setShowRemoveDayPopup] = useState(false);
  const [removingDay, setRemovingDay] = useState(null);

  // Save
  // ✅ FIX: a trip opened via tripId is already saved in the backend — this
  // used to default to `false` always, so the page showed a "Save Trip"
  // button (which calls createTrip) even for an existing trip, creating a
  // DUPLICATE trip on every click instead of updating the one being edited.
  const [isSaved, setIsSaved] = useState(!!tripPlan?.tripId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showSavedPopup, setShowSavedPopup] = useState(false);

  // ✅ FIX: same zone-less-string class of bug as Profile.jsx's fmtDate —
  // parse Y-M-D directly instead of letting `new Date(iso)` reinterpret a
  // zone-less timestamp as local time first.
  const fmtShortDate = (iso) => {
    if (!iso) return null;
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    const [, y, mo, d] = m;
    const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  };

  // Chatbot — removed FAB, kept component available if needed elsewhere
  const [showChatbot, setShowChatbot] = useState(false);
  const [isLoadingTrip, setIsLoadingTrip] = useState(false);

  // ✅ FIX: shared builder used by both the initial fetch, the
  // "tripPlanUpdated" listener, and the AI-edit response handler so all
  // three paths hydrate hotel / costs / hidden-gem / coordinates the exact
  // same way instead of three slightly-different (and buggy) copies.
  const buildPlanState = (rawPlan, days, destLabel) => {
    const plan = rawPlan ?? {};
    const builtDayDetails = {};
    for (let d = 1; d <= days; d++) {
      const dayData = plan[`day${d}`] ?? {};
      builtDayDetails[d] = ["morning", "afternoon", "evening"].map((slot) => {
        // Keep the FULL place objects (place_id, lat, lng, cost, price,
        // is_hidden_gem, photo_url, etc.) in rawItems — this is what feeds
        // both the place price/hidden-gem badges in the list AND the
        // Mapbox markers (which read p.lat / p.lng straight off rawItems).
        const items = (dayData[slot] ?? []).filter(Boolean);
        const titles = items.map((p) => p?.name ?? p?.title ?? "").filter(Boolean);
        return {
          time: slot.charAt(0).toUpperCase() + slot.slice(1),
          title: titles[0] ?? `${slot} activities`,
          activities: titles.length ? titles : ["Explore the area"],
          rawItems: items,
        };
      });
    }

    const builtItinerary = Array.from({ length: days }, (_, i) => {
      const d = i + 1;
      const dayData = plan[`day${d}`] ?? {};
      const allPlaces = [
        ...(dayData.morning ?? []),
        ...(dayData.afternoon ?? []),
        ...(dayData.evening ?? []),
      ].filter(Boolean);
      // ✅ FIX: per-day cost from each place's cost/price, not a flat 0
      const dayCost = allPlaces.reduce(
        (sum, p) => sum + (Number(p?.cost) || Number(p?.price) || 0),
        0,
      );
      const dayImg =
        allPlaces.find((p) => p?.photo_url)?.photo_url ??
        allPlaces.find((p) => p?.image_urls?.[0])?.image_urls?.[0] ??
        "";
      const tagSet = new Set();
      allPlaces.forEach((p) => {
        if (p?.category) tagSet.add(p.category);
        (p?.interests ?? []).forEach((t) => tagSet.add(t));
      });
      return {
        day: d,
        description: `Day ${d} in ${destLabel ?? ""}`,
        img: dayImg,
        cost: dayCost,
        tags: [...tagSet].slice(0, 3),
        stops: allPlaces.length || null,
      };
    });

    // ✅ FIX: hotel/accommodation lives inside the saved `plan` object
    // (plan.accommodation), NOT on a top-level `data.hotel` field — the
    // backend's TripResponse schema has no such field, so reading
    // `data.hotel` always returned undefined for trips loaded from the API.
    const accommodationRaw = plan.accommodation ?? null;
    const firstHotel = Array.isArray(accommodationRaw)
      ? accommodationRaw[0]
      : accommodationRaw;
    const hotelState = firstHotel
      ? {
          name: firstHotel.name,
          city: firstHotel.city ?? firstHotel.city_en,
          address: firstHotel.address,
          photoUrl: firstHotel.photo_url ?? firstHotel.photoUrl,
          price: Number(firstHotel.cost ?? firstHotel.price ?? 0) || null,
          rating: firstHotel.rating,
          checkIn: firstHotel.checkIn ?? null,
          checkOut: firstHotel.checkOut ?? null,
          nights: days > 0 ? days - 1 : null,
        }
      : null;

    return { builtItinerary, builtDayDetails, hotelState };
  };

  useEffect(() => {
    if (tripPlan?.tripId && !tripPlan?.itinerary) {
      // ✅ FIX: حذفنا الـ localStorage cache — كان بيرجع الداتا القديمة
      // دايمًا نجيب أحدث نسخة من الـ API عشان الأماكن المضافة تظهر فورًا
      setIsLoadingTrip(true);
      tripService
        .getTripById(tripPlan.tripId)
        .then((res) => {
          const data = res.data;
          console.log("Trip API Response:", data);
          const plan = data.plan ?? {};
          const days = data.durationDays ?? Object.keys(plan).length;
          const destLabel = data.destinationGovernorate ?? data.city ?? "";

          const { builtItinerary, builtDayDetails, hotelState } =
            buildPlanState(plan, days, destLabel);

          // Fall back to data.coverImageUrl for any day that has no place photo
          builtItinerary.forEach((d) => {
            if (!d.img) d.img = data.coverImageUrl ?? "";
          });

          setItinerary(builtItinerary);
          setDayDetails(builtDayDetails);
          // ✅ FIX: hotel now hydrated from plan.accommodation (see
          // buildPlanState) — `data.hotel` never existed on saved trips.
          // We still honor a legacy top-level `data.hotel` if present so
          // older cached responses keep working.
          if (hotelState) {
            setHotel({
              ...hotelState,
              checkIn: fmtShortDate(data.startDate) ?? hotelState.checkIn,
              checkOut: fmtShortDate(data.endDate) ?? hotelState.checkOut,
            });
          } else if (data.hotel) {
            setHotel(data.hotel);
          }

          // ✅ FIX: capture the real trip metadata — this is what
          // handleSaveTrip / handleUpdateItinerary were missing for trips
          // opened from the profile, causing "undefined Trip", a missing
          // city/destinationGovernorate, and a wrong people count.
          setTripMeta({
            title: data.title ?? null,
            destination: data.city ?? data.destinationGovernorate ?? null,
            governorate: data.destinationGovernorate ?? null,
            budget: data.totalBudgetEgp ?? null,
            totalBudgetEgp: data.totalBudgetEgp ?? null,
            adults: data.people ?? null,
            children: 0,
            startDate: data.startDate ?? null,
            endDate: data.endDate ?? null,
          });
        })
        .catch((err) => console.error("Failed to load trip:", err))
        .finally(() => setIsLoadingTrip(false));
    }
  }, [tripPlan?.tripId]);

  // ✅ NEW: Listen for plan updates fired by useAddToTrip (when user adds/moves/removes
  // a place from TripDetails). Only fires a re-fetch when this component is showing
  // a saved trip (tripPlan.tripId exists). The generate-plan flow (no tripId) is
  // completely unaffected — this handler simply won't match.
  useEffect(() => {
    const tripId = tripPlan?.tripId;
    if (!tripId) return; // نوع "generate plan" — مش بنلمسه

    const handlePlanUpdated = (e) => {
      if (e.detail?.tripId && e.detail.tripId !== tripId) return; // مش تريبنا
      console.log("[TripResult] tripPlanUpdated → re-fetching trip", tripId);
      tripService
        .getTripById(tripId)
        .then((res) => {
          const data = res.data;
          const plan = data.plan ?? {};
          const days = data.durationDays ?? Object.keys(plan).length;
          const destLabel = data.destinationGovernorate ?? data.city ?? "";

          const { builtItinerary, builtDayDetails, hotelState } =
            buildPlanState(plan, days, destLabel);

          builtItinerary.forEach((d) => {
            if (!d.img) d.img = data.coverImageUrl ?? "";
          });

          setItinerary(builtItinerary);
          setDayDetails(builtDayDetails);
          if (hotelState) {
            setHotel({
              ...hotelState,
              checkIn: fmtShortDate(data.startDate) ?? hotelState.checkIn,
              checkOut: fmtShortDate(data.endDate) ?? hotelState.checkOut,
            });
          } else if (data.hotel) {
            setHotel(data.hotel);
          }
          setTripMeta({
            title: data.title ?? null,
            destination: data.city ?? data.destinationGovernorate ?? null,
            governorate: data.destinationGovernorate ?? null,
            budget: data.totalBudgetEgp ?? null,
            totalBudgetEgp: data.totalBudgetEgp ?? null,
            adults: data.people ?? null,
            children: 0,
            startDate: data.startDate ?? null,
            endDate: data.endDate ?? null,
          });
        })
        .catch((err) => console.error("[TripResult] re-fetch failed:", err));
    };

    window.addEventListener("tripPlanUpdated", handlePlanUpdated);
    return () => window.removeEventListener("tripPlanUpdated", handlePlanUpdated);
  }, [tripPlan?.tripId]);
  const editSuggestions = [
    "Water Sports",
    "Relaxation",
    "More Activity",
    "Budget-Friendly",
  ];
  const suggestionColors = ["#C4E0F9", "#EDF9F0", "#FCE8D1", "#D7F1F3"];
  const suggestionTextColors = ["#3b82f6", "#22c55e", "#f97316", "#06b6d4"];

  // ── helpers ───────────────────────────────────────────────────────────────
  const openEdit = (day) => {
    setEditingDay(day);
    setEditText("");
    setEditError("");
    setShowEditModal(true);
  };
  const openRemoveDay = (day) => {
    setRemovingDay(day);
    setShowRemoveDayPopup(true);
  };

  const confirmRemoveDay = () => {
    setItinerary((prev) => prev.filter((item) => item.day !== removingDay));
    setDayDetails((prev) => {
      const n = { ...prev };
      delete n[removingDay];
      return n;
    });
    if (expandedDay === removingDay) setExpandedDay(null);
    setShowRemoveDayPopup(false);
    setRemovingDay(null);
  };

  const toggleExpand = (day) =>
    setExpandedDay((prev) => (prev === day ? null : day));

  // ── checkbox + timeline ───────────────────────────────────────────────────
  const toggleCheck = (day, slotIdx, placeIdx) => {
    const key = `${slotIdx}-${placeIdx}`;
    setCheckedPlaces((prev) => ({
      ...prev,
      [day]: { ...(prev[day] ?? {}), [key]: !prev[day]?.[key] },
    }));
  };

  // Returns progress 0→1 per slot based on how many places are checked
  const getSlotProgress = (day, details) => {
    const dayChecks = checkedPlaces[day] ?? {};
    return details.map((slot, slotIdx) => {
      const places = (
        slot.rawItems?.length
          ? slot.rawItems
          : (slot.activities ?? []).map((a) => ({ name: a }))
      ).filter(Boolean);
      if (!places.length) return 0;
      const checkedCount = places.filter(
        (_, pi) => dayChecks[`${slotIdx}-${pi}`],
      ).length;
      return checkedCount / places.length; // 0 to 1
    });
  };

  // Returns array of booleans — one per slot — true if ≥1 place in that slot is checked
  const getActivatedSlots = (day, details) => {
    const dayChecks = checkedPlaces[day] ?? {};
    return details.map((slot, slotIdx) => {
      const places = (
        slot.rawItems?.length
          ? slot.rawItems
          : (slot.activities ?? []).map((a) => ({ name: a }))
      ).filter(Boolean);
      return places.some((_, pi) => dayChecks[`${slotIdx}-${pi}`]);
    });
  };

  // ── edit API ──────────────────────────────────────────────────────────────
  const handleUpdateItinerary = async () => {
    if (!editText.trim()) return;
    setIsEditLoading(true);
    setEditError("");
    try {
      // ✅ FIX: each item now carries its real `day` number. Before, items
      // were flattened straight off `dayDetails` (an object keyed by day),
      // so that key was lost and the backend had no reliable way to match
      // "remove this place" to a specific day — it would look for the item
      // under the wrong day, find nothing, and report it as "already
      // removed". Tagging `day` here is what the matching logic needs.
      const existingPlanFlat = Object.entries(dayDetails).flatMap(
        ([day, slots]) =>
          slots.flatMap((slot) =>
            (slot.rawItems ?? [])
              .filter(Boolean)
              .map((item) => ({ ...item, day: Number(day) })),
          ),
      );
      const newUserTurn = { role: "user", content: editText };
      const conversationWindow = [...editConversation, newUserTurn].slice(-8);

      const response = await callEdit({
        targetChange: editText,
        destination: destination,
        days: tripDays,
        budget: budget,
        people: Math.max(1, adults + children),
        interests: tripPlan?.requestPayload?.interests ?? [],
        existingPlan: existingPlanFlat,
        places: [],
        conversation: conversationWindow,
      });

      const data = response.data;
      const mode = data?.mode;
      setEditConversation((prev) =>
        [
          ...prev,
          newUserTurn,
          { role: "assistant", content: data?.message ?? "" },
        ].slice(-8),
      );

      // ✅ FIX: "surgical", "add" AND "replan" all return a full updated
      // plan — previously only "surgical"/"add" applied it, while "replan"
      // (the mode the bot uses for a "replace X with Y" request) just
      // closed the modal without touching state, which looked exactly like
      // an empty/no-op response to the user.
      if (mode === "surgical" || mode === "add" || mode === "replan") {
        // The backend may key the updated plan as `data.plan`,
        // `data.updatedPlan`, or `data.newPlan` depending on the route —
        // accept any of them instead of assuming a single shape.
        const updatedRaw = data.plan ?? data.updatedPlan ?? data.newPlan;
        if (updatedRaw) {
          const { builtItinerary, builtDayDetails } = buildPlanState(
            updatedRaw,
            tripDays,
            destination,
          );
          // Preserve images already shown if the new plan response has none
          builtItinerary.forEach((d, i) => {
            if (!d.img) d.img = itinerary[i]?.img ?? "";
          });
          setDayDetails(builtDayDetails);
          setItinerary(builtItinerary);
          setShowEditModal(false);
          setEditText("");
          // ✅ FIX: actually write the edit back to the backend (see
          // persistTripChanges above) — previously nothing called the API
          // here at all, so a refresh/profile reopen reverted the edit.
          await persistTripChanges(builtDayDetails, hotel, builtItinerary);
        } else {
          setEditError(data?.message ?? "No changes were made.");
        }
      } else if (mode === "remove") {
        // ✅ FIX: previously this branch never touched dayDetails/itinerary
        // at all — it just told the user the place was removed, while the
        // place was still sitting in state (and in the backend). Now we
        // actually filter it out locally AND persist that removal.
        const removed = data?.removed_item;
        if (removed) {
          const removedDay = Number(removed.day ?? editingDay);
          const newDayDetails = { ...dayDetails };
          const slots = newDayDetails[removedDay];
          if (slots) {
            newDayDetails[removedDay] = slots.map((slot) => ({
              ...slot,
              rawItems: (slot.rawItems ?? []).filter((p) => {
                if (removed.place_id && p?.place_id) {
                  return p.place_id !== removed.place_id;
                }
                return (p?.name ?? "") !== (removed.name ?? "");
              }),
            }));
          }
          const removedCost = Number(removed.cost ?? removed.price ?? 0) || 0;
          const newItinerary = itinerary.map((item) => {
            if (item.day !== removedDay) return item;
            return {
              ...item,
              cost: Math.max(0, (item.cost ?? 0) - removedCost),
              stops:
                item.stops != null ? Math.max(0, item.stops - 1) : item.stops,
            };
          });

          setDayDetails(newDayDetails);
          setItinerary(newItinerary);
          await persistTripChanges(newDayDetails, hotel, newItinerary);
        }
        setEditError(
          `"${removed?.name ?? "The item"}" was removed. Describe a replacement, or close this dialog if you're done.`,
        );
      } else {
        setEditError(data?.message ?? "No changes were made.");
      }
    } catch (err) {
      setEditError(
        err.response?.data?.message ??
          err.message ??
          "Failed to update. Please try again.",
      );
    } finally {
      setIsEditLoading(false);
    }
  };

  // ── save trip → POST /api/v1/trips ────────────────────────────────────────
  // ✅ FIX: shared by the manual "Save Trip" button AND by the AI-edit
  // auto-persist below, so both write the exact same shape to the backend.
  const buildPlanPayload = (daysObj, hotelObj) => {
    const sortedDays = Object.keys(daysObj)
      .map(Number)
      .sort((a, b) => a - b);
    const planPayload = {};
    sortedDays.forEach((dayNum, index) => {
      const newKey = `day${index + 1}`;
      planPayload[newKey] = {};
      daysObj[dayNum].forEach((slot) => {
        planPayload[newKey][slot.time.toLowerCase()] = slot.rawItems ?? [];
      });
    });
    planPayload.accommodation = hotelObj
      ? [
          {
            name: hotelObj.name,
            city: hotelObj.city,
            city_en: hotelObj.city,
            address: hotelObj.address,
            photo_url: hotelObj.photoUrl,
            cost: hotelObj.price,
            price: hotelObj.price,
            rating: hotelObj.rating,
            checkIn: hotelObj.checkIn,
            checkOut: hotelObj.checkOut,
          },
        ]
      : (tripPlan?.accommodation ?? []);
    return { planPayload, actualDays: sortedDays.length };
  };

  // ✅ FIX: Use date-only strings (YYYY-MM-DD) to avoid UTC timezone shift.
  // Sending a full ISO string causes the backend to subtract hours for Egypt (UTC+3)
  // and ends up saving the day before. A plain date string has no timezone ambiguity.
  const toDateStr = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ✅ FIX: silently persist AI-edit changes (remove / surgical / add /
  // replan) straight to the backend for trips that already exist. Before,
  // an edit only ever touched local React state — it looked applied in the
  // UI, but the database record was never updated, so a refresh (or
  // re-opening the trip from the profile) brought back the old plan. Only
  // fires for trips that have a tripId; the fresh "generate plan" flow
  // (no tripId yet) is untouched and still uses the explicit Save button.
  const persistTripChanges = async (daysObj, hotelObj, itineraryObj) => {
    if (!tripPlan?.tripId) return;
    try {
      const { planPayload, actualDays } = buildPlanPayload(daysObj, hotelObj);
      const computedTotalCost =
        itineraryObj.reduce((sum, item) => sum + (item.cost ?? 0), 0) +
        (hotelObj?.price ?? 0);
      // ✅ FIX: totalBudgetEgp must never be lower than totalCost or the
      // backend rejects the request — if we don't know the original budget
      // (trip loaded with incomplete metadata), default it to the cost.
      const resolvedBudget = Math.max(
        totalBudgetEgp ?? 0,
        computedTotalCost,
        1,
      );
      await tripService.updateTripPlan(tripPlan.tripId, {
        title: tripTitle,
        destinationGovernorate: governorate ?? destination,
        city: destination,
        durationDays: actualDays,
        totalBudgetEgp: resolvedBudget,
        totalCost: computedTotalCost,
        plan: planPayload,
      });
    } catch (err) {
      console.error("[TripResult] failed to persist AI edit:", err);
      setEditError(
        "Changes were applied here, but failed to save to your account. Try Save Trip manually.",
      );
    }
  };

  const handleSaveTrip = async () => {
    setIsSaving(true);
    setSaveError("");
    try {
      const { planPayload, actualDays } = buildPlanPayload(dayDetails, hotel);

      const startDateRaw = tripPlan?.startDate ?? tripMeta.startDate;
      const startDateStr =
        toDateStr(startDateRaw) ?? toDateStr(new Date().toISOString());
      const startMs = new Date(startDateStr + "T00:00:00Z").getTime();
      const endDateStr = toDateStr(
        new Date(startMs + (actualDays - 1) * 86400000).toISOString(),
      );

      const startDate = startDateStr;
      const endDate = endDateStr;

      const computedTotalCost =
        itinerary.reduce((sum, item) => sum + (item.cost ?? 0), 0) +
        (hotel?.price ?? 0);
      // ✅ FIX: previously `Math.max(1, tripPlan.budget ?? 1)` — for trips
      // loaded by tripId, tripPlan.budget is undefined, so this always sent
      // totalBudgetEgp: 1, which is smaller than almost any real totalCost
      // and triggered "TotalCost cannot be greater than TotalBudgetEgp."
      const resolvedBudget = Math.max(
        totalBudgetEgp ?? 0,
        computedTotalCost,
        1,
      );

      const payload = {
        title: tripTitle,
        // ✅ FIX: previously always tripPlan.governorate/tripPlan.destination,
        // both undefined for trips opened from the profile → backend
        // rejected with "DestinationGovernorate or City is required."
        destinationGovernorate: governorate ?? destination,
        city: destination,
        startDate,
        endDate,
        durationDays: actualDays,
        coverImageUrl: itinerary[0]?.img ?? "",
        people: Math.max(1, adults + children),
        totalBudgetEgp: resolvedBudget,
        budget: budget ?? resolvedBudget,
        totalCost: computedTotalCost,
        plan: planPayload,
        isPublic: false,
      };

      let newTripId = tripPlan?.tripId;
      if (tripPlan?.tripId) {
        // ✅ FIX: trip already exists — update it in place instead of
        // calling createTrip again, which used to silently create a
        // duplicate trip (or 400 out) every time "Save" was pressed on an
        // already-saved trip.
        await tripService.updateTripPlan(tripPlan.tripId, payload);
      } else {
        const res = await tripService.createTrip({ ...payload, status: 0 });
        newTripId = res.data?.tripId ?? res.data?.id;
      }

      if (newTripId) {
        localStorage.setItem(
          `tripPlan_${newTripId}`,
          JSON.stringify({ ...tripPlan, itinerary, dayDetails }),
        );
      }
      setIsSaved(true);
      setShowSavedPopup(true);
    } catch (err) {
      setSaveError(
        err.response?.data?.message ??
          err.message ??
          "Failed to save trip. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };
  // ✅ FIX: grand total displayed in the header, recalculated live from
  // current itinerary day costs + hotel price (so checkbox/edit/remove-day
  // actions keep it accurate, not a stale value frozen at load time).
  const grandTotal =
    itinerary.reduce((sum, item) => sum + (item.cost ?? 0), 0) +
    (hotel?.price ?? 0);
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="aip-page">
      <Navbar activePage="aiplanner" />
      {isLoadingTrip && (
        <div style={{ textAlign: "center", padding: 80, color: "#999" }}>
          Loading trip...
        </div>
      )}
      {/* Header */}
      <div className="aip-result-header">
        <h1 className="aip-result-title">
          <span className="aip-result-dest">Your</span>{" "}
          <span className="aip-result-dest-name">{destination}</span>{" "}
          <span className="aip-result-dest">Getaway</span>
        </h1>
        <p className="aip-result-meta">
          {tripDays} Days, {tripNights} Nights &nbsp;|&nbsp;
          {adults} Adults
          {children > 0 ? `, ${children} Kid` : ""}
          {tripPlan?.pets > 0 ? `, ${tripPlan.pets} Pet` : ""}
          &nbsp;|&nbsp; Total: {grandTotal.toLocaleString()} EGP
        </p>
      </div>

      {/* Body */}
      <div className="aip-result-container">
        {/* Left — day cards */}
        <div className="aip-result-left">
          <div className="aip-result-days">
            {hotel && <HotelCard hotel={hotel} />}

            {itinerary.map((item) => {
              const isExpanded = expandedDay === item.day;
              const details = dayDetails[item.day] ?? [];
              const stopsCount =
                item.stops != null
                  ? item.stops
                  : details.reduce(
                      (acc, slot) => acc + (slot.activities?.length ?? 0),
                      0,
                    ) || null;
              const activatedSlots = getActivatedSlots(item.day, details);
              const slotProgress = getSlotProgress(item.day, details);

              return (
                <div
                  key={item.day}
                  className={`aip-result-day-card ${isExpanded ? "aip-result-day-card--expanded" : ""}`}
                >
                  <img
                    src={item.img}
                    alt={item.description}
                    className="aip-result-day-img"
                  />

                  <div className="aip-result-day-info">
                    <div className="aip-result-day-header-row">
                      <p className="aip-result-day-label">Day {item.day}</p>
                      <DayMenu
                        day={item.day}
                        onEdit={openEdit}
                        onRemove={openRemoveDay}
                      />
                    </div>

                    <h3 className="aip-result-day-title">{item.description}</h3>

                    <div className="aip-result-day-meta">
                      {stopsCount && <span>📍 {stopsCount} stops</span>}
                      <span>🕐 {item.type || item.duration || "Full day"}</span>
                      <span className="aip-result-cost">~{item.cost} EGP</span>
                    </div>

                    <div className="aip-result-tags">
                      {item.tags.map((tag) => (
                        <span key={tag} className="aip-result-tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {isExpanded && (
                      <div className="aip-day-details">
                        {/* Timeline — smooth progress bar per slot, moves with each checkbox */}
                        <div className="aip-timeline-bar-wrap">
                          {details.map((slot, i) => {
                            const prog = slotProgress[i] ?? 0;
                            const isActive = activatedSlots[i];
                            return (
                              <div key={i} className="aip-timeline-segment">
                                <div className="aip-timeline-label">
                                  {slot.time}
                                </div>
                                <div className="aip-timeline-track">
                                  <div
                                    className="aip-timeline-fill"
                                    style={{
                                      width: `${prog * 100}%`,
                                      background: isActive
                                        ? "#5596fe"
                                        : "#5596fe",
                                    }}
                                  />
                                </div>
                                <div
                                  className={`aip-timeline-dot2 ${isActive ? "aip-timeline-dot2--active" : ""}`}
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* Slot columns */}
                        <div
                          className="aip-day-columns"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "12px",
                          }}
                        >
                          {details.map((slot, slotIdx) => {
                            const places = (
                              slot.rawItems?.length
                                ? slot.rawItems
                                : (slot.activities || []).map((act) => ({
                                    name: act,
                                  }))
                            ).filter(Boolean);

                            return (
                              <div key={slotIdx} className="aip-day-column">
                                <p className="aip-day-slot-time">
                                  {slot.time} —
                                </p>
                                <ul className="aip-day-slot-list">
                                  {places.map((place, j) => {
                                    const isStringOnly =
                                      typeof place === "string";
                                    const placeName = isStringOnly
                                      ? place
                                      : (place.name ??
                                        place.title ??
                                        "Activity");
                                    const placeCost = isStringOnly
                                      ? null
                                      : (place.cost ?? place.price ?? null);
                                    const isHiddenGem =
                                      !isStringOnly && !!place.is_hidden_gem;
                                    const checkKey = `${slotIdx}-${j}`;
                                    const isChecked =
                                      checkedPlaces[item.day]?.[checkKey] ??
                                      false;

                                    return (
                                      <li
                                        key={j}
                                        className="aip-day-slot-item"
                                        onClick={() =>
                                          toggleCheck(item.day, slotIdx, j)
                                        }
                                        style={{ cursor: "pointer" }}
                                      >
                                        <input
                                          type="checkbox"
                                          className="aip-place-checkbox"
                                          checked={isChecked}
                                          onChange={() =>
                                            toggleCheck(item.day, slotIdx, j)
                                          }
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <span
                                          className={`aip-day-slot-name ${isChecked ? "aip-day-slot-name--checked" : ""}`}
                                        >
                                          {placeName}
                                        </span>
                                        {isHiddenGem && (
                                          <span
                                            className="aip-hidden-gem-badge"
                                            title="Hidden Gem"
                                          >
                                            💎 Hidden gem
                                          </span>
                                        )}
                                        {placeCost != null && (
                                          <span className="aip-day-slot-cost">
                                            ~{placeCost} EGP
                                          </span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      className="aip-result-view-btn"
                      onClick={() => toggleExpand(item.day)}
                    >
                      {isExpanded ? "View less ›" : "View ›"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — Mapbox map */}
        <TripMap
          dayDetails={dayDetails}
          itinerary={itinerary}
          expandedDay={expandedDay}
          checkedPlaces={checkedPlaces}
        />
      </div>

      {/* Save button */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 0 40px",
        }}
      >
        {saveError && <p className="aip-save-error">{saveError}</p>}
        {!isSaved ? (
          <button
            className="aip-save-btn"
            onClick={handleSaveTrip}
            disabled={isSaving}
            style={{ opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? "Saving..." : "Save Trip"}
          </button>
        ) : (
          <button
            className="aip-save-btn aip-manage-btn"
            onClick={() => setShowSavedPopup(true)}
          >
            Manage Trip
          </button>
        )}
      </div>

      {/* POPUP — saved */}
      {showSavedPopup && (
        <div
          className="aip-modal-overlay"
          onClick={() => setShowSavedPopup(false)}
        >
          <div
            className="aip-popup aip-saved-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="aip-popup-close"
              onClick={() => setShowSavedPopup(false)}
            >
              ✕
            </button>
            <p className="aip-popup-title">Trip saved to My Trip</p>
            <button
              className="aip-popup-primary-btn"
              onClick={() => {
                setShowSavedPopup(false);
                if (window.navigateToProfile) window.navigateToProfile();
              }}
            >
              View in My Trips
            </button>
          </div>
        </div>
      )}

      {/* POPUP — remove day */}
      {showRemoveDayPopup && (
        <div
          className="aip-modal-overlay"
          onClick={() => setShowRemoveDayPopup(false)}
        >
          <div
            className="aip-popup aip-remove-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="aip-popup-close"
              onClick={() => setShowRemoveDayPopup(false)}
            >
              ✕
            </button>
            <p className="aip-popup-title">
              Remove Day {removingDay} from your trip?
            </p>
            <button
              className="aip-popup-outline-btn"
              onClick={() => setShowRemoveDayPopup(false)}
            >
              Cancel
            </button>
            <button className="aip-popup-danger-btn" onClick={confirmRemoveDay}>
              Remove
            </button>
          </div>
        </div>
      )}

      {/* MODAL — AI edit */}
      {showEditModal && (
        <div
          className="aip-modal-overlay"
          onClick={() => !isEditLoading && setShowEditModal(false)}
        >
          <div className="aip-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="aip-modal-close"
              onClick={() => !isEditLoading && setShowEditModal(false)}
              disabled={isEditLoading}
            >
              ✕
            </button>
            <h3 className="aip-modal-title">Customize Day {editingDay}</h3>
            <textarea
              className="aip-modal-textarea"
              placeholder="What would you like to change?"
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                setEditError("");
              }}
              disabled={isEditLoading}
            />
            <div className="aip-modal-suggestions">
              {editSuggestions.map((s, i) => (
                <button
                  key={s}
                  className="aip-modal-suggestion"
                  style={{
                    background: suggestionColors[i],
                    color: suggestionTextColors[i],
                  }}
                  onClick={() => {
                    setEditText(s);
                    setEditError("");
                  }}
                  disabled={isEditLoading}
                >
                  {s}
                </button>
              ))}
            </div>
            {editError && <p className="aip-modal-error">{editError}</p>}
            <button
              className="aip-modal-update-btn"
              onClick={handleUpdateItinerary}
              disabled={isEditLoading || !editText.trim()}
              style={{ opacity: isEditLoading || !editText.trim() ? 0.6 : 1 }}
            >
              {isEditLoading ? (
                <span className="aip-modal-loading">
                  <span className="aip-modal-spinner" /> Updating...
                </span>
              ) : (
                "Update Itinerary"
              )}
            </button>
            <button
              className="aip-modal-cancel-btn"
              onClick={() => !isEditLoading && setShowEditModal(false)}
              disabled={isEditLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showChatbot && (
        <ChatBot
          userId={user?.userId}
          userName={user?.displayName}
          onClose={() => setShowChatbot(false)}
        />
      )}

      <Footer />
    </div>
  );
};

const TripResultWithBoundary = (props) => (
  <ErrorBoundary>
    <TripResult {...props} />
  </ErrorBoundary>
);

export default TripResultWithBoundary;