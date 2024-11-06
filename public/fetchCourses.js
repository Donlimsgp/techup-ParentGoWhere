document.getElementById('fileInput').addEventListener('change', handleFile, false);
document.getElementById('filterButton').addEventListener('click', async () => {
    const inputPostalCode = document.getElementById("postalCodeInput").value;
    
    if (inputPostalCode) {
        originCoordinates = await fetchCoordinates(inputPostalCode);
        if (originCoordinates) {
            console.log("Origin Coordinates:", originCoordinates); // Debugging statement
            fetchCoursesInChunks(); // Start fetching and filtering courses
        } else {
            console.error("Could not retrieve origin coordinates.");
        }
    } else {
        console.error("Please enter a valid postal code.");
    }
}, false);

let courseIds = [];
let originCoordinates = null; // Ensure originCoordinates is initialized

// Function to handle file input
function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        courseIds = sheetData.map(row => row[0]).filter(id => typeof id === 'string' && id.startsWith('TGS-'));
        console.log("Loaded Course IDs:", courseIds);
        fetchCoursesInChunks();
    };

    reader.readAsArrayBuffer(file);
}

// Function to fetch the Google Maps API key from the server
async function fetchAPIKey() {
    try {
        const response = await fetch('/api-key');
        const data = await response.json();
        return data.apiKey;
    } catch (error) {
        console.error('Failed to fetch API key:', error);
        return null;
    }
}

// Function to get coordinates from a postal code
async function fetchCoordinates(postalCode) {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode},SG&key=${apiKey}`);
    const data = await response.json();
    
    if (data.results.length > 0) {
        const location = data.results[0].geometry.location;
        console.log("Origin Coordinates:", location); // Add this line for debugging
        return { lat: location.lat, lng: location.lng };
    } else {
        console.error("Coordinates not found for postal code:", postalCode);
        return null;
    }
}


// Function to calculate distance between two coordinates in kilometers
function calculateDistance(coord1, coord2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
    const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Function to fetch a batch of course IDs
async function fetchCourseBatch(courseIdBatch) {
    for (const courseId of courseIdBatch) {
        try {
            const response = await fetch(`/courses/${courseId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch course data: ${response.status}`);
            }
            const jsonData = await response.json();
            displayCourse(jsonData); // Display course data in the table
        } catch (error) {
            console.error('Error fetching course data:', error);
        }
    }
}

// Function to process all course IDs in chunks of 20
function fetchCoursesInChunks() {
    const chunkSize = 20;
    for (let i = 0; i < courseIds.length; i += chunkSize) {
        const courseIdBatch = courseIds.slice(i, i + chunkSize);
        setTimeout(() => {
            fetchCourseBatch(courseIdBatch);
        }, i * 100); // Small delay to avoid overwhelming the server
    }
}

// Function to display course data in the table, including distance calculation
function displayCourse(data) {
    const course = data.data?.courses?.[0];
    if (!course) return;

    const courseCoordinates = {
        lat: course.trainingProvider.address[0]?.latitude || null,
        lng: course.trainingProvider.address[0]?.longitude || null,
    };

    let distance = "N/A"; // Default if coordinates aren't available

    if (originCoordinates && courseCoordinates.lat && courseCoordinates.lng) {
        distance = calculateDistance(originCoordinates, courseCoordinates).toFixed(2);
        console.log(`Distance to ${course.referenceNumber}: ${distance} km`); // Debugging statement for distance
        if (distance > 0.5) return; // Filter out courses beyond 500 meters
    } else {
        console.warn("Missing course or origin coordinates for distance calculation.");
    }

    const tableBody = document.getElementById('courses-table-body');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${course?.title || "N/A"}</td>
        <td>${course?.content || "N/A"}</td>
        <td>${course?.totalTrainingDurationHour || "N/A"} hours</td>
        <td>${course?.trainingProvider?.name || "N/A"}</td>
        <td>${course?.totalCostOfTrainingPerTrainee || "N/A"}</td>
        <td>${course?.referenceNumber || "N/A"}</td>
        <td>${course?.trainingProvider?.address?.[0]?.postalCode || "N/A"}</td>
        <td><a href="https://${course?.trainingProvider?.websiteUrl || "#"}" target="_blank">${course?.trainingProvider?.websiteUrl || "N/A"}</a></td>
        <td>${distance} km</td> <!-- Distance column -->
    `;

    tableBody.appendChild(row);
}
