let map;
let userMarker;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// Fetch the API keys from the server
fetch('/api-key')
    .then((response) => response.json())
    .then((data) => {
        if (data.googleMapsApiKey) {
            // Load the Google Maps script with the API key and Places library
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${data.googleMapsApiKey}&libraries=places&callback=initMap`;
            script.async = true;
            document.head.appendChild(script);
        } else {
            console.error('Google Maps API key not found');
        }
    })
    .catch((error) => {
        console.error('Error fetching API keys:', error);
    });

function initMap() {
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
                    disableDefaultUI: false,
                });

                userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "You are here!",
                });

                addSearchBox();
                addCrosshairButton();
            },
            () => {
                handleLocationError(true);
            }
        );
    } else {
        handleLocationError(false);
    }
}

function addSearchBox() {
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);

    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;

        map.setCenter(place.geometry.location);
        if (userMarker) userMarker.setPosition(place.geometry.location);
    });
}

function addCrosshairButton() {
    const locationButton = document.createElement("div");
    locationButton.style.backgroundColor = "#fff";
    locationButton.style.border = "2px solid #fff";
    locationButton.style.borderRadius = "3px";
    locationButton.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.3)";
    locationButton.style.cursor = "pointer";
    locationButton.style.margin = "10px";
    locationButton.style.padding = "5px";
    locationButton.style.position = "absolute";
    locationButton.style.bottom = "10px";
    locationButton.style.right = "10px";

    const crosshairIcon = document.createElement("img");
    crosshairIcon.src = "https://img.icons8.com/ios-filled/50/000000/center-direction.png";
    crosshairIcon.style.width = "24px";
    crosshairIcon.style.height = "24px";
    locationButton.appendChild(crosshairIcon);

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);

    locationButton.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                    map.setCenter(pos);
                    if (userMarker) userMarker.setPosition(pos);
                },
                () => alert("Geolocation failed. Please enable location services.")
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });
}

function handleLocationError(browserHasGeolocation) {
    const defaultLocation = { lat: 1.3521, lng: 103.8198 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: defaultLocation,
    });

    alert(browserHasGeolocation ? "Geolocation service failed." : "Your browser doesn't support geolocation.");
    addCrosshairButton();
}
