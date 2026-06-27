import { useState, useEffect, useRef } from "react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import ReviewsIcon from "../../assets/icons/ReviewsIcon.png";
import "./TripDetails.css";
import tripService from "../../services/tripService";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useHomePlaces } from "../../services/useHomePlaces";

const TripDetails = ({ place }) => {
  const [liked, setLiked] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(4);
  const [reviewText, setReviewText] = useState("");
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [addedToTrip, setAddedToTrip] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [addedTripName, setAddedTripName] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // ===== Quick AI Trip Planning Modal states =====
  const [showQuickAIModal, setShowQuickAIModal] = useState(false);
  const [quickAIStep, setQuickAIStep] = useState("form");
  const [calendarTarget, setCalendarTarget] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 4, 1));
  const [budget, setBudget] = useState("Economic");
  const [numPeople, setNumPeople] = useState(5);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);

  // ===== Manage Trip Modal states =====
  const [showManageTripModal, setShowManageTripModal] = useState(false);
  const [manageTripStep, setManageTripStep] = useState("menu");
  const [manageDayMonth, setManageDayMonth] = useState(new Date(2026, 4, 1));
  const [manageSelectedDay, setManageSelectedDay] = useState(null);
  const [manageMoveTripId, setManageMoveTripId] = useState(null);
  const [hasOpenedManageOnce, setHasOpenedManageOnce] = useState(false);

  const [apiTrips, setApiTrips] = useState([]);
  const [cityTrips, setCityTrips] = useState([]);
  const [cityTripsLoading, setCityTripsLoading] = useState(false);
  const { featured: nearbyFromAPI, loading: nearbyLoading } = useHomePlaces(
    place?.city || "Cairo",
  );
  const nearbyPlaces = nearbyFromAPI
    .filter((p) => p.place_id !== place?.place_id)
    .slice(0, 3)
    .map((p) => ({
      name: p.name,
      distance: `${((Math.abs(p.lat - (place?.lat ?? 0)) + Math.abs(p.lng - (place?.lng ?? 0))) * 111).toFixed(1)} km`,
      image: p.photo_url,
      place_id: p.place_id,
      city: p.city,
      rating: p.rating,
      price: p.price,
      description: p.description,
      image_urls: p.image_urls,
      opening_hours: p.opening_hours,
      category: p.category,
    }));
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    tripService
      .getTrips({ Page: 1, PageSize: 20 })
      .then((res) => {
        console.log("Trips API response:", res.data); // ✅ عشان نشوف الشكل
        const items =
          res.data?.items ||
          res.data?.data ||
          res.data?.trips ||
          (Array.isArray(res.data) ? res.data : []);
        setApiTrips(items);
      })
      .catch((err) => console.error("Failed to load trips:", err));
  }, []);
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // ✅ شيلي الـ map القديمة لو موجودة
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // ✅ accessToken
    mapboxgl.accessToken =
      "pk.eyJ1IjoieG1vaGFtZWR4IiwiYSI6ImNtcG1zZ25kbTB4eTkydHNidXZ2cnR2ajkifQ.CugdwmFa8ME2UU4rDEAJug";

    // ✅ allLocations متعرفة هنا
    const allLocations = [];

    if (selectedTripDetails?.days) {
      selectedTripDetails.days.forEach((day) => {
        day.locations?.forEach((loc) => {
          allLocations.push({
            lat: loc.latitude,
            lng: loc.longitude,
            name: loc.nameEn || loc.nameAr || "Location",
            day: day.dayNumber,
          });
        });
      });
    }

    if (allLocations.length === 0) {
      allLocations.push({
        lat: place?.latitude ?? 29.9792,
        lng: place?.longitude ?? 31.1342,
        name: place?.title ?? "Location",
        day: 1,
      });
    }

    const centerLat = allLocations[0].lat;
    const centerLng = allLocations[0].lng;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [centerLng, centerLat],
      zoom: allLocations.length === 1 ? 13 : 10,
    });

    mapRef.current.on("load", () => {
      if (allLocations.length > 1) {
        const coordinates = allLocations.map((loc) => [loc.lng, loc.lat]);
        mapRef.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "LineString", coordinates },
          },
        });
        mapRef.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#5596fe",
            "line-width": 3,
            "line-dasharray": [2, 1],
          },
        });
      }

      allLocations.forEach((loc) => {
        const el = document.createElement("div");
        el.style.cssText = `
        width: 28px; height: 28px;
        background: #5596fe; border: 2px solid #fff;
        border-radius: 50%; display: flex;
        align-items: center; justify-content: center;
        color: white; font-size: 11px; font-weight: 700;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer;
      `;
        el.textContent = loc.day;

        new mapboxgl.Marker({ element: el })
          .setLngLat([loc.lng, loc.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="font-size:13px; font-weight:600; color:#1f2937;">
              Day ${loc.day}: ${loc.name}
            </div>
          `),
          )
          .addTo(mapRef.current);
      });

      if (allLocations.length > 1) {
        const bounds = allLocations.reduce(
          (b, loc) => b.extend([loc.lng, loc.lat]),
          new mapboxgl.LngLatBounds(
            [allLocations[0].lng, allLocations[0].lat],
            [allLocations[0].lng, allLocations[0].lat],
          ),
        );
        mapRef.current.fitBounds(bounds, { padding: 40 });
      }
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [place, selectedTripDetails]);

  // ===== Fetch trips matching the place's city/governorate =====
  const fetchCityTrips = async () => {
    if (!place?.city) {
      setCityTrips(apiTrips);
      return;
    }
    setCityTripsLoading(true);
    try {
      // Use getplaces endpoint to find places in same city, then filter trips
      const response = await fetch("/api/v1/ai/places/getplaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: place.city, pageSize: 50 }),
      });
      const data = await response.json();
      const placesInCity = data?.items || data?.data || [];
      const cityPlaceIds = new Set(placesInCity.map((p) => p.place_id || p.id));

      // Filter apiTrips to those that contain at least one place in same city
      // OR fallback: filter by trip destination/city field if available
      const filtered = apiTrips.filter((trip) => {
        if (trip.city && trip.city.toLowerCase() === place.city.toLowerCase())
          return true;
        if (trip.destination && trip.destination.toLowerCase().includes(place.city.toLowerCase()))
          return true;
        // Check if trip days contain places in this city
        if (trip.days) {
          return trip.days.some((day) =>
            day.locations?.some((loc) => cityPlaceIds.has(loc.place_id))
          );
        }
        return false;
      });

      setCityTrips(filtered.length > 0 ? filtered : apiTrips);
    } catch (err) {
      console.error("Failed to fetch city places:", err);
      setCityTrips(apiTrips);
    } finally {
      setCityTripsLoading(false);
    }
  };

  // ===== Toast helper =====
  const showToastMsg = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const category = place?.category || "restaurant";

  const visitLabels = {
    hotel: {
      label1: "Check-In",
      val1: place?.openingHours || "02:00 PM",
      label2: "Check-out",
      val2: place?.closingHours || "12:00 PM",
      label3: "Best For",
      val3: "Friends • Families",
      label4: "Suggested Visit",
      val4: "Morning",
    },
    restaurant: {
      label1: "Opening Hours",
      val1: place?.openingHours || "10:00 am",
      label2: "Closing Hours",
      val2: place?.closingHours || "12:00 am",
      label3: "Cuisine",
      val3: "Oriental",
      label4: "Suggested Visit",
      val4: "Morning",
    },
    attraction: {
      label1: "Opening Hours",
      val1: place?.opening_hours?.split("-")[0] || "08:00 am",
      label2: "Closing Hours",
      val2: place?.opening_hours?.split("-")[1] || "06:00 pm",
      label3: "Entry Fee",
      val3: place?.price ? `${place.price} EGP` : "Free",
      label4: "Best Time",
      val4: "Morning",
    },
  };

  const labels = visitLabels[category] || visitLabels.restaurant;

  const data = place
    ? {
        name: place.title,
        city: place.city,
        rating: place.rating,
        reviews: `${place.reviews}`,
        avgPrice:
          category === "hotel"
            ? `${place.price} EGP / Night`
            : category === "attraction"
              ? `Entry ${place.price} EGP`
              : `Avg. ${place.price} EGP / Meal`,
        images: place.image_urls?.length ? place.image_urls : [place.image],
        overview:
          place.description ||
          `${place.title} is one of Egypt's top destinations in ${place.city}.`,
        nearbyPlaces: nearbyPlaces || [],
        reviews_list: [
          {
            id: 1,
            name: "Elif",
            rating: 5,
            avatar: "https://randomuser.me/api/portraits/women/1.jpg",
            text: "One of the most unforgettable places in Egypt. The view at sunrise was incredible.",
          },
          {
            id: 2,
            name: "Kerem",
            rating: 5,
            avatar: "https://randomuser.me/api/portraits/men/2.jpg",
            text: "Perfect for photography. We spent almost 3 hours exploring the site.",
          },
          {
            id: 3,
            name: "Emre",
            rating: 5,
            avatar: "https://randomuser.me/api/portraits/men/3.jpg",
            text: "Very crowded at noon, so visiting early morning is definitely better.",
          },
          {
            id: 4,
            name: "Leyla",
            rating: 5,
            avatar: "https://randomuser.me/api/portraits/women/4.jpg",
            text: "Our guide explained the history beautifully. A must-visit destination.",
          },
        ],
        overallRating: place.rating,
        lat: 29.9792,
        lng: 31.1342,
      }
    : {
        name: "Ali Baba Restaurant",
        city: "Dahab",
        rating: 4.5,
        reviews: "2.7k",
        avgPrice: "Avg. 50 EGP / Meal",
        images: [
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
          "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600",
        ],
        overview:
          "Ali Baba is a favorite seaside restaurant in Dahab, famous for its fresh seafood, authentic local flavors, and relaxed outdoor seating right on the beach. A perfect spot for lunch or dinner with stunning sea views.",
        nearbyPlaces: nearbyPlaces || [],
        reviews_list: [],
        overallRating: 4.8,
        lat: 29.9792,
        lng: 31.1342,
      };

  const overviewText = showFullOverview
    ? data.overview
    : data.overview.slice(0, 120) + "...";

  // ===== Calendar helpers =====
  const formatDate = (d) => {
    if (!d) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleCalendarDayClick = (day) => {
    const selected = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day,
    );
    if (calendarTarget === "start") {
      setStartDate(selected);
    } else {
      setEndDate(selected);
    }
    setQuickAIStep("form");
  };

  const isInRange = (day) => {
    if (!startDate || !endDate) return false;
    const d = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day,
    );
    return d > startDate && d < endDate;
  };

  const handleGeneratePlan = () => {
    setQuickAIStep("skeleton");
    setLoadingProgress(0);

    setTimeout(() => {
      setQuickAIStep("loading");

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 8;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => {
            setShowQuickAIModal(false);
            setQuickAIStep("form");
            setAddedToTrip(true);
            setAddedTripName("AI Trip Plan");
            setHasOpenedManageOnce(true);
            showToastMsg(`${data.name} added to AI Trip Plan ✅`);
          }, 600);
        }
        setLoadingProgress(progress);
      }, 400);
    }, 1500);
  };

  const loadingMessages = [
    { threshold: 0, text: "Collecting your preferences..." },
    { threshold: 30, text: "Building your itinerary..." },
    { threshold: 56, text: "Almost there! Just arranging days..." },
    { threshold: 85, text: "Finalizing your trip plan..." },
  ];

  const currentLoadingMsg =
    loadingMessages.filter((m) => loadingProgress >= m.threshold).slice(-1)[0]
      ?.text || "Loading...";

  // ===== Render calendar grid =====
  const renderCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: prevMonthDays - firstDay + 1 + i, inactive: true });
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ day: d, inactive: false });
    }

    return (
      <div className="td-calendar">
        <div className="td-calendar-header">
          <span className="td-calendar-month-label">
            {monthNames[month]} {year}
          </span>
          <div className="td-calendar-nav">
            <button
              className="td-cal-nav-btn"
              onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
            >
              ‹
            </button>
            <button
              className="td-cal-nav-btn"
              onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
            >
              ›
            </button>
          </div>
        </div>
        <div className="td-calendar-grid">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="td-cal-weekday">
              {d}
            </div>
          ))}
          {cells.map((cell, i) => {
            if (cell.inactive) {
              return (
                <div key={i} className="td-cal-day td-cal-day-inactive">
                  {cell.day}
                </div>
              );
            }
            const d = new Date(
              calendarMonth.getFullYear(),
              calendarMonth.getMonth(),
              cell.day,
            );
            const isStart =
              startDate && d.toDateString() === startDate.toDateString();
            const isEnd =
              endDate && d.toDateString() === endDate.toDateString();
            const inRange = isInRange(cell.day);

            return (
              <div
                key={i}
                className={[
                  "td-cal-day",
                  isStart || isEnd ? "td-cal-day-selected" : "",
                  isStart && endDate ? "td-cal-day-range-start" : "",
                  isEnd && startDate ? "td-cal-day-range-end" : "",
                  inRange ? "td-cal-day-range" : "",
                ].join(" ")}
                onClick={() => handleCalendarDayClick(cell.day)}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ===== Manage Trip: Move to Another Day calendar =====
  const handleManageDayClick = (day) => {
    const selected = new Date(
      manageDayMonth.getFullYear(),
      manageDayMonth.getMonth(),
      day,
    );
    setManageSelectedDay(selected);
  };

  const isManageDaySelected = (day) => {
    if (!manageSelectedDay) return false;
    const d = new Date(
      manageDayMonth.getFullYear(),
      manageDayMonth.getMonth(),
      day,
    );
    return d.toDateString() === manageSelectedDay.toDateString();
  };

  const renderManageDayCalendar = () => {
    const year = manageDayMonth.getFullYear();
    const month = manageDayMonth.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: prevMonthDays - firstDay + 1 + i, inactive: true });
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ day: d, inactive: false });
    }

    return (
      <div className="td-calendar">
        <div className="td-calendar-header">
          <span className="td-calendar-month-label">
            {monthNames[month]} {year}
          </span>
          <div className="td-calendar-nav">
            <button
              className="td-cal-nav-btn"
              onClick={() => setManageDayMonth(new Date(year, month - 1, 1))}
            >
              ‹
            </button>
            <button
              className="td-cal-nav-btn"
              onClick={() => setManageDayMonth(new Date(year, month + 1, 1))}
            >
              ›
            </button>
          </div>
        </div>
        <div className="td-calendar-grid">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="td-cal-weekday">
              {d}
            </div>
          ))}
          {cells.map((cell, i) => (
            <div
              key={i}
              className={[
                "td-cal-day",
                cell.inactive ? "td-cal-day-inactive" : "",
                !cell.inactive && isManageDaySelected(cell.day)
                  ? "td-cal-day-selected-solid"
                  : "",
              ].join(" ")}
              onClick={() => !cell.inactive && handleManageDayClick(cell.day)}
            >
              {cell.day}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar activePage="explore" />

      <div className="td-wrapper">
        <div className="td-page">
          {/* ===== Place Title ===== */}
          <h1 className="td-place-title">{data.name}</h1>

          {/* ===== Meta Info ===== */}
          <div className="td-meta">
            <span className="td-meta-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5596fe"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {data.city}
            </span>
            <span className="td-meta-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f5a623"
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {data.rating} ({data.reviews} reviews)
            </span>
            <span className="td-meta-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5596fe"
                strokeWidth="2"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              {data.avgPrice}
            </span>
          </div>

          {/* ===== Images Grid ===== */}
          <div className="td-images">
            <div className="td-main-img">
              <img src={data.images?.[0]} alt={data.name} />
            </div>
            <div className="td-side-imgs">
              {(data.images || []).slice(1, 3).map((img, i) => (
                <div key={i} className="td-side-img-wrap">
                  <img src={img} alt={`${data.name} ${i + 1}`} />
                  {i === 0 && (
                    <button
                      className={`td-heart-btn ${liked ? "liked" : ""}`}
                      onClick={() => setLiked(!liked)}
                    >
                      ❤️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ===== Main Content ===== */}
          <div className="td-content">
            {/* ===== Left Column ===== */}
            <div className="td-left">
              {/* Overview */}
              <div className="td-section">
                <h2 className="td-section-title">Overview</h2>
                <p className="td-overview-text">
                  {overviewText}{" "}
                  <button
                    className="td-see-more"
                    onClick={() => setShowFullOverview(!showFullOverview)}
                  >
                    {showFullOverview ? "See Less" : "See More"}
                  </button>
                </p>
              </div>

              {/* Nearby Places */}
              <div className="td-section">
                <h2 className="td-section-title">Nearby Places</h2>
                <div className="td-nearby-grid">
                  {nearbyLoading ? (
                    <p style={{ color: "#888", fontSize: "14px" }}>
                      Loading nearby places...
                    </p>
                  ) : (
                    data.nearbyPlaces.map((np, i) => (
                      <div
                        key={i}
                        className="td-nearby-card"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          np.place_id &&
                          window.navigateToTripDetails &&
                          window.navigateToTripDetails({
                            place_id: np.place_id,
                            title: np.name,
                            city: np.city,
                            rating: np.rating,
                            price: np.price,
                            description: np.description,
                            image_urls: np.image_urls,
                            opening_hours: np.opening_hours,
                            category: np.category,
                            image: np.image,
                          })
                        }
                      >
                        <img
                          src={np.image}
                          alt={np.name}
                          className="td-nearby-img"
                        />
                        <p className="td-nearby-name">{np.name}</p>
                        <span className="td-nearby-dist">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#5596fe"
                            strokeWidth="2"
                          >
                            <rect x="1" y="3" width="15" height="13" rx="2" />
                            <path d="M16 8h4l3 3v5h-7V8z" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                          </svg>
                          {np.distance}
                        </span>
                      </div>
                    ))
                  )}{" "}
                </div>
              </div>

              {/* Reviews */}
              <div className="td-section">
                <h2 className="td-section-title">
                  Reviews{" "}
                  <span
                    className="td-review-edit"
                    onClick={() => setShowReviewModal(true)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={ReviewsIcon}
                      alt="edit"
                      style={{ width: "20px", height: "20px" }}
                    />
                  </span>
                </h2>
                <div className="td-rating-summary">
                  <div className="td-overall">
                    <span className="td-overall-num">{data.overallRating}</span>
                    <div className="td-stars">
                      {"★".repeat(Math.floor(data.overallRating))}
                      {"☆".repeat(5 - Math.floor(data.overallRating))}
                    </div>
                  </div>
                  <div className="td-rating-bars">
                    <div className="td-bar-row">
                      <div className="td-bar">
                        <div className="td-bar-fill" style={{ width: "85%" }} />
                      </div>
                    </div>
                    <div className="td-bar-row">
                      <div className="td-bar">
                        <div className="td-bar-fill" style={{ width: "70%" }} />
                      </div>
                    </div>
                    <div className="td-bar-row">
                      <div className="td-bar">
                        <div
                          className="td-bar-fill td-bar-fill-light"
                          style={{ width: "30%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="td-reviews-grid">
                  {(data.reviews_list || []).map((rev) => (
                    <div key={rev.id} className="td-review-card">
                      <img
                        src={rev.avatar}
                        alt={rev.name}
                        className="td-reviewer-avatar"
                      />
                      <div className="td-review-info">
                        <span className="td-reviewer-name">{rev.name}</span>
                        <div className="td-review-stars">
                          {"★".repeat(rev.rating)}
                        </div>
                        <p className="td-review-text">
                          {rev.text ||
                            "A wonderful experience, highly recommended!"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== Right Column ===== */}
            <div className="td-right">
              <div className="td-visit-card">
                <h3 className="td-visit-title">Visit Info</h3>
                <div className="td-visit-grid">
                  <div className="td-visit-item">
                    <span className="td-visit-label">{labels.label1}</span>
                    <span className="td-visit-value">{labels.val1}</span>
                  </div>
                  <div className="td-visit-item">
                    <span className="td-visit-label">{labels.label2}</span>
                    <span className="td-visit-value">{labels.val2}</span>
                  </div>
                  <div className="td-visit-item">
                    <span className="td-visit-label">{labels.label3}</span>
                    <span className="td-visit-value">{labels.val3}</span>
                  </div>
                  <div className="td-visit-item">
                    <span className="td-visit-label">{labels.label4}</span>
                    <span className="td-visit-value">{labels.val4}</span>
                  </div>
                </div>
                <h3 className="td-visit-title" style={{ marginTop: "24px" }}>
                  Location
                </h3>
                <div className="td-map-placeholder">
                  <div
                    ref={mapContainerRef}
                    style={{
                      width: "100%",
                      height: "200px",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  />
                </div>
                <a
                  className="td-open-map-btn"
                  onClick={() => setShowMapModal(true)}
                  style={{ cursor: "pointer" }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5596fe"
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open full map
                </a>
                <button
                  className={
                    addedToTrip ? "td-manage-trip-btn" : "td-add-trip-btn"
                  }
                  onClick={() => {
                    if (addedToTrip) {
                      if (!hasOpenedManageOnce) {
                        setShowQuickAIModal(true);
                        setQuickAIStep("form");
                      } else {
                        setShowManageTripModal(true);
                        setManageTripStep("menu");
                        setManageSelectedDay(null);
                        setManageMoveTripId(null);
                      }
                    } else {
                      setShowAddTripModal(true);
                      fetchCityTrips();
                    }
                  }}
                >
                  {addedToTrip ? "Manage your trip" : "Add to your trip"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Map Modal ===== */}
      {showMapModal && (
        <div
          className="td-modal-overlay"
          onClick={() => setShowMapModal(false)}
        >
          <div className="td-modal-map" onClick={(e) => e.stopPropagation()}>
            <button
              className="td-modal-close"
              onClick={() => setShowMapModal(false)}
            >
              ✕
            </button>
            <iframe
              title="full-map"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: "16px" }}
              loading="lazy"
              src={`https://maps.google.com/maps?q=${data.lat},${data.lng}&z=14&output=embed`}
            />
          </div>
        </div>
      )}

      {/* ===== Add to Trip Modal ===== */}
      {showAddTripModal && (
        <div
          className="td-modal-overlay"
          onClick={() => setShowAddTripModal(false)}
        >
          <div
            className="td-modal-add-trip"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="td-modal-close"
              onClick={() => setShowAddTripModal(false)}
            >
              ✕
            </button>
            <h2 className="td-add-trip-modal-title">Add to a Trip</h2>
            <p className="td-add-trip-modal-sub">
              Select an itinerary to add {data.name}
            </p>
            {place?.city && (
              <p className="td-add-trip-city-filter">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5596fe" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Showing trips in <strong>{place.city}</strong>
              </p>
            )}
            <div className="td-add-trip-list">
              {cityTripsLoading ? (
                <div className="td-trips-loading">
                  <div className="td-trips-spinner" />
                  <span>Loading trips in {place?.city}...</span>
                </div>
              ) : (
                (cityTrips.length > 0
                  ? cityTrips
                  : [
                      {
                        id: 1,
                        title: "Dahab Tour",
                        durationDays: 3,
                        coverImage:
                          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200",
                      },
                      {
                        id: 2,
                        title: "Egypt Adventure",
                        durationDays: 3,
                        coverImage:
                          "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=200",
                      },
                      {
                        id: 3,
                        title: "Aswan Heritage Tour",
                        durationDays: 3,
                        coverImage:
                          "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=200",
                      },
                    ]
                ).map((trip) => (
                  <div
                    key={trip.id}
                    className={`td-trip-option ${selectedTrip === trip.id ? "selected" : ""}`}
                    onClick={() => setSelectedTrip(trip.id)}
                  >
                    <input
                      type="radio"
                      className="td-trip-radio"
                      checked={selectedTrip === trip.id}
                      onChange={() => setSelectedTrip(trip.id)}
                    />
                    <img
                      src={
                        trip.coverImage ||
                        trip.image ||
                        "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=200"
                      }
                      alt={trip.title}
                      className="td-trip-img"
                    />
                    <div className="td-trip-info">
                      <span className="td-trip-name">{trip.title}</span>
                      <span className="td-trip-meta">
                        {trip.durationDays || 3} days
                      </span>
                    </div>
                    {selectedTrip === trip.id && (
                      <div className="td-day-select-wrap">
                        <span className="td-day-select-label">
                          Day Selection :
                        </span>
                        <select className="td-day-select">
                          <option>Auto-assign ✨</option>
                          {Array.from(
                            { length: trip.durationDays || 3 },
                            (_, i) => (
                              <option key={i + 1}>Day {i + 1}</option>
                            ),
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div
                className="td-trip-option td-create-new"
                onClick={() =>
                  window.navigateToAiPlanner && window.navigateToAiPlanner()
                }
              >
                <div className="td-create-plus">+</div>
                <div className="td-trip-info">
                  <span className="td-trip-name">Create a new trip</span>
                  <span className="td-trip-meta">Start planning with AI</span>
                </div>
              </div>
            </div>
            <button
              className="td-confirm-btn"
              onClick={async () => {
                if (!selectedTrip) return;
                const trip = (
                  cityTrips.length > 0
                    ? cityTrips
                    : [
                        { id: 1, title: "Dahab Tour" },
                        { id: 2, title: "Egypt Adventure" },
                        { id: 3, title: "Aswan Heritage Tour" },
                      ]
                ).find((t) => t.id === selectedTrip);

                try {
                  await tripService.updateTrip(selectedTrip, {
                    placesToAdd: [
                      {
                        name: data.name,
                        city: data.city,
                        category: category,
                        image: data.images?.[0] || "",
                      },
                    ],
                  });
                } catch (err) {
                  console.error("Failed to add place to trip:", err);
                }
                try {
                  const tripDetails =
                    await tripService.getTripById(selectedTrip);
                  setSelectedTripDetails(tripDetails.data);
                } catch (err) {
                  console.error("Failed to load trip details:", err);
                }
                setAddedToTrip(true);
                setAddedTripName(trip?.title || "your trip");
                setShowAddTripModal(false);
                setHasOpenedManageOnce(false);
                showToastMsg(
                  `${data.name} added to ${trip?.title || "your trip"} ✅`,
                );
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* ===== Quick AI Trip Planning Modal ===== */}
      {showQuickAIModal && (
        <div
          className="td-modal-overlay"
          onClick={() => {
            if (quickAIStep !== "loading") setShowQuickAIModal(false);
          }}
        >
          <div
            className="td-modal-quick-ai"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Step: Form */}
            {quickAIStep === "form" && (
              <>
                <button
                  className="td-modal-close"
                  onClick={() => setShowQuickAIModal(false)}
                >
                  ✕
                </button>
                <div className="td-qai-header">
                  <button
                    className="td-qai-back-btn"
                    onClick={() => setShowQuickAIModal(false)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2.5"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="td-qai-title">Quick AI Trip Planning</h2>
                    <p className="td-qai-subtitle">
                      This is a quick overview. For a detailed itinerary, return
                      to the{" "}
                      <span
                        className="td-qai-link"
                        onClick={() => {
                          setShowQuickAIModal(false);
                          window.navigateToAiPlanner &&
                            window.navigateToAiPlanner();
                        }}
                      >
                        AI trip planner
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="td-qai-section">
                  <h3 className="td-qai-section-label">Duration</h3>
                  <div className="td-qai-dates-row">
                    <div className="td-qai-date-col">
                      <label className="td-qai-date-label">Start date :</label>
                      <div
                        className="td-qai-date-input"
                        onClick={() => {
                          setCalendarTarget("start");
                          setQuickAIStep("calendar");
                        }}
                      >
                        <span>
                          {startDate ? formatDate(startDate) : "24/04/2026"}
                        </span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#5596fe"
                          strokeWidth="2"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                    </div>
                    <div className="td-qai-date-col">
                      <label className="td-qai-date-label">End date :</label>
                      <div
                        className="td-qai-date-input"
                        onClick={() => {
                          setCalendarTarget("end");
                          setQuickAIStep("calendar");
                        }}
                      >
                        <span>
                          {endDate ? formatDate(endDate) : "30/04/2026"}
                        </span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#5596fe"
                          strokeWidth="2"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="td-qai-section">
                  <h3 className="td-qai-section-label">Budget</h3>
                  <div className="td-qai-budget-row">
                    {["Economic", "Comfortable", "Luxury"].map((b) => (
                      <button
                        key={b}
                        className={`td-qai-budget-btn ${budget === b ? "active" : ""}`}
                        onClick={() => setBudget(b)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="td-qai-section">
                  <h3 className="td-qai-section-label">Number of people</h3>
                  <div className="td-qai-people-input">
                    <button
                      type="button"
                      className="td-qai-people-btn"
                      onClick={() => setNumPeople((p) => Math.max(1, p - 1))}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      className="td-qai-people-field"
                      value={numPeople}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setNumPeople(isNaN(val) ? 1 : Math.max(1, val));
                      }}
                    />
                    <button
                      type="button"
                      className="td-qai-people-btn"
                      onClick={() => setNumPeople((p) => p + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="td-qai-generate-btn"
                  onClick={handleGeneratePlan}
                >
                  Generate Plan
                </button>
              </>
            )}

            {/* Step: Calendar */}
            {quickAIStep === "calendar" && (
              <>
                <button
                  className="td-modal-close"
                  onClick={() => setShowQuickAIModal(false)}
                >
                  ✕
                </button>
                <button
                  className="td-qai-back-btn td-qai-back-top"
                  onClick={() => setQuickAIStep("form")}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="2.5"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                {renderCalendar()}
              </>
            )}

            {/* Step: Skeleton */}
            {quickAIStep === "skeleton" && (
              <div className="td-qai-skeleton">
                <div className="td-qai-skeleton-header" />
                <div className="td-qai-skeleton-sub" />
                <div className="td-qai-skeleton-sub td-qai-skeleton-sub-short" />
                <div className="td-qai-skeleton-label" />
                <div className="td-qai-skeleton-row">
                  <div className="td-qai-skeleton-input" />
                  <div className="td-qai-skeleton-input" />
                </div>
                <div className="td-qai-skeleton-label" />
                <div className="td-qai-skeleton-row">
                  <div className="td-qai-skeleton-pill td-qai-skeleton-pill-active" />
                  <div className="td-qai-skeleton-pill" />
                  <div className="td-qai-skeleton-pill" />
                </div>
                <div className="td-qai-skeleton-btn" />
              </div>
            )}

            {/* Step: Loading */}
            {quickAIStep === "loading" && (
              <div className="td-qai-loading">
                <div className="td-qai-spinner" />
                <h3 className="td-qai-loading-title">
                  {currentLoadingMsg}({loadingProgress}%)
                </h3>
                <p className="td-qai-loading-sub">
                  Please wait while our AI works its magic to create the perfect
                  trip plan tailored to your preferences.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== Manage Trip Modal ===== */}
      {showManageTripModal && (
        <div
          className="td-modal-overlay"
          onClick={() => setShowManageTripModal(false)}
        >
          <div
            className="td-modal-manage-trip"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Step: Menu */}
            {manageTripStep === "menu" && (
              <>
                <button
                  className="td-modal-close"
                  onClick={() => setShowManageTripModal(false)}
                >
                  ✕
                </button>
                <h2 className="td-mt-title">Manage Trip</h2>
                <p className="td-mt-subtitle">
                  Update where this place is saved
                </p>

                <div
                  className="td-mt-option"
                  onClick={() => setManageTripStep("moveDay")}
                >
                  <svg
                    className="td-mt-icon"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <div className="td-mt-option-text">
                    <span className="td-mt-option-title">
                      Move to Another Day
                    </span>
                    <span className="td-mt-option-sub">
                      Choose a different day
                    </span>
                  </div>
                </div>

                <div className="td-mt-divider" />

                <div
                  className="td-mt-option"
                  onClick={() => setManageTripStep("moveTrip")}
                >
                  <svg
                    className="td-mt-icon"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="2"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                  </svg>
                  <div className="td-mt-option-text">
                    <span className="td-mt-option-title">
                      Move to Another Trip
                    </span>
                    <span className="td-mt-option-sub">
                      Move this destination to another trip
                    </span>
                  </div>
                </div>

                <div className="td-mt-divider" />

                <div
                  className="td-mt-option"
                  onClick={() => setManageTripStep("remove")}
                >
                  <svg
                    className="td-mt-icon"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e02424"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                  <div className="td-mt-option-text">
                    <span className="td-mt-option-title td-mt-option-danger">
                      Remove from Trip
                    </span>
                    <span className="td-mt-option-sub">
                      Remove this destination from your itinerary
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Step: Move to Another Day */}
            {manageTripStep === "moveDay" && (
              <>
                <button
                  className="td-modal-close"
                  onClick={() => setShowManageTripModal(false)}
                >
                  ✕
                </button>
                <div className="td-mt-header-row">
                  <button
                    className="td-qai-back-btn"
                    onClick={() => setManageTripStep("menu")}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2.5"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="td-mt-title">Select New Day</h2>
                    <p className="td-mt-subtitle">Update your schedule</p>
                  </div>
                </div>
                {renderManageDayCalendar()}
                <button
                  className="td-mt-submit-btn"
                  disabled={!manageSelectedDay}
                  onClick={() => {
                    setShowManageTripModal(false);
                    setManageTripStep("menu");
                    setManageSelectedDay(null);
                    showToastMsg("Date updated successfully! ✅");
                  }}
                >
                  Update Date
                </button>
              </>
            )}

            {/* Step: Move to Another Trip */}
            {manageTripStep === "moveTrip" && (
              <>
                <button
                  className="td-modal-close"
                  onClick={() => setShowManageTripModal(false)}
                >
                  ✕
                </button>
                <div className="td-mt-header-row">
                  <button
                    className="td-qai-back-btn"
                    onClick={() => setManageTripStep("menu")}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2.5"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="td-mt-title">Select Destination Trip</h2>
                    <p className="td-mt-subtitle">
                      Choose which trip to move this place to.
                    </p>
                  </div>
                </div>

                <div className="td-mt-trip-list">
                  {(apiTrips.length > 0
                    ? apiTrips
                    : [
                        {
                          id: 1,
                          title: "Dahab Tour",
                          durationDays: 3,
                          coverImage:
                            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200",
                        },
                        {
                          id: 2,
                          title: "Egypt Adventure",
                          durationDays: 3,
                          coverImage:
                            "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=200",
                        },
                        {
                          id: 3,
                          title: "Aswan Heritage Tour",
                          durationDays: 4,
                          coverImage:
                            "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=200",
                        },
                      ]
                  ).map((trip) => (
                    <div
                      key={trip.id}
                      className={`td-mt-trip-card ${manageMoveTripId === trip.id ? "selected" : ""}`}
                      onClick={() => setManageMoveTripId(trip.id)}
                    >
                      <img
                        src={
                          trip.coverImage ||
                          trip.image ||
                          "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=200"
                        }
                        alt={trip.title}
                        className="td-mt-trip-img"
                      />
                      <div className="td-trip-info">
                        <span className="td-trip-name">{trip.title}</span>
                        <span className="td-trip-meta">
                          {trip.durationDays || 3} days
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="td-mt-submit-btn"
                  disabled={!manageMoveTripId}
                  onClick={() => {
                    const trip = (
                      apiTrips.length > 0
                        ? apiTrips
                        : [
                            { id: 1, title: "Dahab Tour" },
                            { id: 2, title: "Egypt Adventure" },
                            { id: 3, title: "Aswan Heritage Tour" },
                          ]
                    ).find((t) => t.id === manageMoveTripId);
                    setShowManageTripModal(false);
                    setManageTripStep("menu");
                    showToastMsg(
                      `Place moved to ${trip?.title || "the trip"} successfully!`,
                    );
                  }}
                >
                  Move Trip
                </button>
              </>
            )}
            {/* Step: Remove from Trip */}
            {manageTripStep === "remove" && (
              <>
                <button
                  className="td-modal-close"
                  onClick={() => setShowManageTripModal(false)}
                >
                  ✕
                </button>
                <div className="td-mt-confirm-header">
                  <button
                    className="td-qai-back-btn"
                    onClick={() => setManageTripStep("menu")}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2.5"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <h2 className="td-mt-confirm-title">
                    Are you sure you want to{" "}
                    <span className="td-mt-confirm-danger">delete</span> from
                    trip ?
                  </h2>
                </div>
                <button
                  className="td-mt-cancel-btn"
                  onClick={() => setManageTripStep("menu")}
                >
                  Cancel
                </button>
                <button
                  className="td-mt-confirm-btn"
                  onClick={() => {
                    setShowManageTripModal(false);
                    setManageTripStep("menu");
                    setAddedToTrip(false);
                    setAddedTripName("");
                    setHasOpenedManageOnce(false);
                    showToastMsg("Place removed successfully!");
                  }}
                >
                  Confirm
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== Review Modal ===== */}
      {showReviewModal && (
        <div
          className="td-modal-overlay"
          onClick={() => setShowReviewModal(false)}
        >
          <div className="td-modal-review" onClick={(e) => e.stopPropagation()}>
            <button
              className="td-modal-close"
              onClick={() => setShowReviewModal(false)}
            >
              ✕
            </button>
            <h2 className="td-review-modal-title">Rate your experience</h2>
            <p className="td-review-modal-sub">
              How was your trip to {data.name}?
            </p>
            <div className="td-review-modal-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`td-modal-star ${star <= reviewRating ? "active" : ""}`}
                  onClick={() => setReviewRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              className="td-review-modal-textarea"
              placeholder="Share your thoughts about the place..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button className="td-review-modal-submit">Submit Review</button>
            <button
              className="td-review-modal-cancel"
              onClick={() => setShowReviewModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== Toast ===== */}
      {showToast && (
        <div className="td-toast">
          <span>{toastMessage}</span>
          {!toastMessage.includes("removed") &&
            !toastMessage.includes("moved") &&
            !toastMessage.includes("Date") && (
              <button
                className="td-toast-view"
                onClick={() =>
                  window.navigateToCalendar && window.navigateToCalendar()
                }
              >
                View
              </button>
            )}
        </div>
      )}

      <Footer />
    </>
  );
};

export default TripDetails;