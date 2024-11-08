// Event listener for postal code search
document.getElementById('searchButton').addEventListener('click', handlePostalCodeSearch, false);

let originCoordinates = null;

// Function to handle postal code search
async function handlePostalCodeSearch() {
    const postalCode = document.getElementById("postalCodeInput").value;
    if (postalCode) {
        originCoordinates = await fetchCoordinates(postalCode);
        if (originCoordinates) {
            console.log("Origin coordinates:", originCoordinates);
        } else {
            alert("Failed to retrieve coordinates for the entered postal code.");
        }
    }
}

// Function to fetch coordinates based on postal code
async function fetchCoordinates(postalCode) {
    const apiKey = "YOUR_GOOGLE_API_KEY";
    const response = await fetch(`/geocode?postalCode=${postalCode}`);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
    } else {
        console.error("Failed to retrieve coordinates for postal code:", postalCode);
        return null;
    }
}

// Function to load baking courses from Baking.xlsx, calculate distance, and display
async function loadBakingCourses() {
    console.log("Baking icon clicked. Attempting to load Baking.xlsx...");
    try {
        const response = await fetch('CourseData/Baking.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const courseData = XLSX.utils.sheet_to_json(worksheet);

        console.log("Course data loaded:", courseData);

        // Get postal code entered by the user
        const userPostalCode = document.getElementById("postalCodeInput").value.trim();
        if (!userPostalCode) {
            alert("Please enter a postal code.");
            return;
        }

        // Calculate distances for each course and sort by nearest first
        const coursesWithDistance = courseData.map(course => {
            const coursePostalCode = course["Postal Code"];
            const distance = calculateDistance(userPostalCode, coursePostalCode); // Assuming you have this function
            return { ...course, distance };
        }).sort((a, b) => a.distance - b.distance);

        console.log("Courses with calculated distances:", coursesWithDistance);

        // Display courses in the table
        const tableBody = document.getElementById("courses-table-body");
        tableBody.innerHTML = ""; // Clear previous data

        coursesWithDistance.forEach(course => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${course["Course Title"] || ""}</td>
                <td>${course["Content"] || ""}</td>
                <td>${course["Total Training Duration"] || ""}</td>
                <td>${course["Training Provider"] || ""}</td>
                <td>${course["Training Cost"] || ""}</td>
                <td>${course["Reference Number"] || ""}</td>
                <td>${course["Postal Code"] || ""}</td>
                <td><a href="${course["Website URL"] || "#"}" target="_blank">Link</a></td>
                <td>${course.distance.toFixed(2)} km</td>
            `;
            tableBody.appendChild(row);
        });

        console.log("Course data displayed in the table.");

    } catch (error) {
        console.error("Error loading Baking.xlsx:", error);
    }
}


// Function to calculate distance between two coordinates
function calculateDistance(coord1, coord2) {
    const R = 6371;
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Function to display course data in the table
function displayCourse(course) {
    const tableBody = document.getElementById('courses-table-body');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${course.title || "N/A"}</td>
        <td>${course.content || "N/A"}</td>
        <td>${course.duration || "N/A"}</td>
        <td>${course.provider || "N/A"}</td>
        <td>${course.postalCode || "N/A"}</td>
        <td>${course.distance || "N/A"} km</td>
    `;

    tableBody.appendChild(row);
}
