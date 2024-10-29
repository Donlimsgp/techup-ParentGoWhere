// script.js

function initMap() {
    const location = { lat: 1.2801, lng: 103.8441 }; // Example coordinates
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: location,
    });
    new google.maps.Marker({
        position: location,
        map: map,
    });
}
