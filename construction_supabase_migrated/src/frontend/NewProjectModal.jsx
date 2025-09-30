// src/frontend/NewProject.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { PlusCircle } from "lucide-react"; // ✅ Modern icons
import { projectsApi } from "../lib/supabase";

// Fix missing default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function NewProject() {
  const navigate = useNavigate();
  const [newProject, setNewProject] = useState({
    name: "",
    location: "",
    status: "Pending",
  });

  const [showMap, setShowMap] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([22.5937, 78.9629]); // Default India

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));

    // ✅ Auto-detect coordinates (lat, lng)
    if (name === "location") {
      const coordPattern =
        /^\s*(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)\s*$/; // matches "lat, lng"
      const match = value.match(coordPattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[3]);
        if (!isNaN(lat) && !isNaN(lng)) {
          setMarkerPosition([lat, lng]);
          setMapCenter([lat, lng]);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const createdProject = await projectsApi.create(newProject);
      console.log("New Project Added:", createdProject);
      alert(`Project "${newProject.name}" added successfully!`);

      setNewProject({ name: "", location: "", status: "Pending" });
      setMarkerPosition(null);

      navigate("/dashboard/project2file", { state: { project: createdProject } });
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  // Marker + location update
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setMarkerPosition(e.latlng);
        setNewProject((prev) => ({
          ...prev,
          location: `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`,
        }));
      },
    });
    return markerPosition ? <Marker position={markerPosition} /> : null;
  }

  // Map resize fix
  function MapResizeFix() {
    const map = useMap();
    useEffect(() => {
      map.invalidateSize();
    }, [map, showMap]);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6 sm:py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 relative">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
            <PlusCircle className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            New Project
          </h2>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Project Name */}
          <div className="sm:col-span-2">
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Project Name
            </label>
            <input
              type="text"
              name="name"
              value={newProject.name}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter project name"
            />
          </div>

          {/* Project Location */}
          <div className="sm:col-span-2 relative">
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Project Location
            </label>
            <input
              type="text"
              name="location"
              value={newProject.location}
              onChange={handleChange} // ✅ manual typing allowed
              placeholder="Type coordinates or click map"
              onClick={() => setShowMap((prev) => !prev)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base bg-gray-50 cursor-text focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {showMap && (
              <div className="absolute top-full left-0 w-full h-60 sm:h-80 mt-2 z-20 border rounded-lg overflow-hidden shadow-lg">
                <MapContainer
                  center={markerPosition || mapCenter}
                  zoom={6}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <LocationMarker />
                  <MapResizeFix />
                </MapContainer>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Status
            </label>
            <select
              name="status"
              value={newProject.status}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Pending</option>
              <option>Ongoing</option>
              <option>Completed</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/dashboard/project2file")}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 font-semibold transition"
            >
              Save & Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
