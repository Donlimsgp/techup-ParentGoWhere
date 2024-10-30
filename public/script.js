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

// Fetch the API key from the server
fetch('/api-key')
  .then((response) => response.json())
  .then((data) => {
    // Load the Google Maps script with the API key and Places library
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    document.head.appendChild(script);
  })
  .catch((error) => {
    console.error('Error loading Google Maps API key:', error);
  });

function initMap() {
  // Check if the browser supports Geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Create the map centered on the user's current location
        map = new google.maps.Map(document.getElementById("map"), {
          zoom: 16,
          center: userLocation,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          zoomControl: true,
          disableDefaultUI: false,
        });

        // Add a marker at the user's location
        userMarker = new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "You are here!",
        });

        // Set up the search box and link it to the UI element
        const input = document.getElementById("pac-input");
        const searchBox = new google.maps.places.SearchBox(input);

        // Bias the SearchBox results towards the map's current viewport
        map.addListener("bounds_changed", () => {
          searchBox.setBounds(map.getBounds());
        });

        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place
        searchBox.addListener("places_changed", () => {
          const places = searchBox.getPlaces();
          if (places.length === 0) {
            return;
          }

          // Clear existing marker
          if (userMarker) {
            userMarker.setMap(null);
          }

          // Get the first place result
          const place = places[0];
          if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry");
            return;
          }

          // Update the map and marker
          map.setCenter(place.geometry.location);
          userMarker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            title: place.name,
          });
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
  locationButton.style.borderRadius = "3px";
  locationButton.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.3)";
  locationButton.style.cursor = "pointer";
  locationButton.style.margin = "10px";
  locationButton.style.padding = "5px";
  locationButton.style.position = "absolute";
  locationButton.style.bottom = "10px"; // Position above zoom controls (adjust value as needed)
  locationButton.style.right = "10px"; // Align to the right

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
