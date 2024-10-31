let map;
let userMarker;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('Service Worker registered:', registration))
        .catch(error => console.error('Service Worker registration failed:', error));
}


function initMap() {
    const defaultLocation = { lat: 1.3521, lng: 103.8198 }; // Singapore coordinates

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map = new google.maps.Map(document.getElementById("map"), {
                    zoom: 16,
                    center: userLocation,
                    streetViewControl: false,
                    fullscreenControl: false,
                    mapTypeControl: false,
                    zoomControl: true,
                });
                userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "You are here!",
                });
            },
            () => {
                // If Geolocation fails, use the default location
                map = new google.maps.Map(document.getElementById("map"), {
                    zoom: 12,
                    center: defaultLocation,
                });
            }
        );
    }
}