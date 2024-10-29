let map;
let userMarker;

function initMap() {
    // Check if the browser supports Geolocation
    if (navigator.geolocation) {
        // Use the Geolocation API to get the user's current location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Create the map centered on the user's current location
                map = new google.maps.Map(document.getElementById("map"), {
                    zoom: 16,
                    center: userLocation, // Center the map at the user's location
                });

                // Add a marker at the user's location
                userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "You are here!",
                });

                // Add the custom crosshair button after the map is initialized
                addCrosshairButton();
            },
            () => {
                // If the Geolocation API fails, use a default location (like Singapore)
                handleLocationError(true);
            }
        );
    } else {
        // If the browser doesn't support Geolocation, use a default location (like Singapore)
        handleLocationError(false);
    }
}

function addCrosshairButton() {
    // Create a custom crosshair button for "Locate Me"
    const locationButton = document.createElement("div");
    locationButton.style.backgroundColor = "#fff";
    locationButton.style.border = "2px solid #fff";
    locationButton.style.borderRadius = "0px";
    locationButton.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.3)";
    locationButton.style.cursor = "pointer";
    locationButton.style.margin = "10px";
    locationButton.style.padding = "7px";
    locationButton.style.position = "absolute";
    locationButton.style.bottom = "1px"; // Position just above zoom controls
    locationButton.style.right = "1px"; // Align to the right

    // Add a crosshair icon inside the button
    const crosshairIcon = document.createElement("img");
    crosshairIcon.src = "https://img.icons8.com/ios-filled/50/000000/center-direction.png"; // URL to a crosshair icon
    crosshairIcon.style.width = "24px";
    crosshairIcon.style.height = "24px";
    locationButton.appendChild(crosshairIcon);

    // Add the button to the map as a custom control
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);

    // Add an event listener to the button
    locationButton.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    // Center the map at the user's current location
                    map.setCenter(pos);

                    // Update the marker's position
                    if (userMarker) {
                        userMarker.setPosition(pos);
                    } else {
                        // Create the marker if it doesn't exist
                        userMarker = new google.maps.Marker({
                            position: pos,
                            map: map,
                            title: "You are here!",
                        });
                    }
                },
                () => {
                    // Handle location error (e.g., user denies location access)
                    alert("Geolocation failed. Please ensure location services are enabled.");
                }
            );
        } else {
            // Handle case where Geolocation is not supported
            alert("Geolocation is not supported by your browser.");
        }
    });
}

// Handle errors for the Geolocation API
function handleLocationError(browserHasGeolocation) {
    const defaultLocation = { lat: 1.3521, lng: 103.8198 }; // Example coordinates for Singapore

    // Create a map centered at a default location
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: defaultLocation,
    });

    const errorMessage = browserHasGeolocation
        ? "Error: Geolocation service failed. Please ensure location services are enabled."
        : "Error: Your browser doesn't support geolocation.";
    console.error(errorMessage);
    alert(errorMessage); // Optional: Customize this message for better UX

    // Add the custom crosshair button in case of error
    addCrosshairButton();
}
