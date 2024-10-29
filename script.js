// Initialize and add the map
function initMap() {
    // The location to be shown on the map (e.g., Health Promotion Board)
    const location = { lat: 1.2801, lng: 103.8441 };

    // The map, centered at the location
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: location,
    });

    // The marker, positioned at the location
    const marker = new google.maps.Marker({
        position: location,
        map: map,
    });
}
