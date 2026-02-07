document.addEventListener("DOMContentLoaded", () => {
  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;

  // Default location (Hyderabad)
  const [lng,lat]=listingCoordinates;

  const map = L.map("map").setView([lat, lng], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  L.marker([lat, lng]).addTo(map)
    .bindPopup("Listing location")
    .openPopup();
});