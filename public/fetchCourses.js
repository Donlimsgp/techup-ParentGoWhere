// Event listeners
document.getElementById('fileInput').addEventListener('change', handleFile, false);
document.getElementById('postalCodeInput').addEventListener('change', fetchCoordinatesAndDisplay, false);
document.getElementById('bakingIcon').addEventListener('click', loadBakingCourses, false);

let courseData = [];
let userCoordinates = null;

// Function to handle file upload
function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        courseData = XLSX.utils.sheet_to_json(firstSheet);
        console.log("Loaded course data:", courseData);
    };

    reader.readAsArrayBuffer(file);
}

// Function to load and process Baking.xlsx file specifically
async function loadBakingCourses() {
    try {
        const response = await fetch('/CourseData/Baking.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        courseData = XLSX.utils.sheet_to_json(firstSheet);
        console.log("Baking course data loaded:", courseData);

        fetchCoordinatesAndDisplay(); // Trigger display with the loaded baking courses
    } catch (error) {
        console.error("Error loading Baking.xlsx:", error);
    }
}

// Function to get coordinates from postal code
async function fetchCoordinates(postalCode) {
    const response = await fetch(`/get-coordinates?postalCode=${postalCode}`);
    const data = await response.json();

    if (!response.ok) {
        console.error('Error fetching coordinates:', data.error);
        return null;
    }
    console.log("User Coordinates:", data);
    return data;
}

// Function to calculate distance between two coordinates in km
function calculateDistance(coord1, coord2) {
    const R = 6371;
    const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
    const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Function to process postal code input and display sorted courses
async function fetchCoordinatesAndDisplay() {
    const postalCode = document.getElementById('postalCodeInput').value;

    if (!postalCode) {
        alert('Please enter a postal code.');
        return;
    }

    userCoordinates = await fetchCoordinates(postalCode);
    if (!userCoordinates) {
        console.error('Failed to retrieve user coordinates');
        return;
    }

    const coursesWithDistance = await calculateAndSortCoursesByDistance();
    displayCourses(coursesWithDistance);
}

// Function to calculate distances for each course and sort
async function calculateAndSortCoursesByDistance() {
    const coursesWithDistancePromises = courseData.map(async course => {
        const coursePostalCode = course["Postal Code"];
        const courseCoordinates = await fetchCoordinates(coursePostalCode);
        
        if (!courseCoordinates) {
            console.error('Could not fetch course coordinates:', coursePostalCode);
            return null;
        }

        const distance = calculateDistance(userCoordinates, courseCoordinates);
        return { ...course, distance };
    });

    const coursesWithDistance = (await Promise.all(coursesWithDistancePromises)).filter(Boolean);
    return coursesWithDistance.sort((a, b) => a.distance - b.distance);
}

function displayCourses(courses) {
    const tableBody = document.getElementById('courses-table-body');
    tableBody.innerHTML = ''; // Clear any existing rows

    courses.forEach(course => {
        const row = document.createElement('tr');

        // Retrieve and validate website URL for each course
        let websiteUrl = course['Website URL'] || "N/A";
        if (websiteUrl !== "N/A" && !websiteUrl.startsWith("http://") && !websiteUrl.startsWith("https://")) {
            websiteUrl = "https://" + websiteUrl;
        }

        row.innerHTML = `
            <td>${course['Course Title'] || "N/A"}</td>
            <td>${course['Content'] || "N/A"}</td>
            <td>${course['Total Training Duration'] || "N/A"}</td>
            <td>${course['Training Provider'] || "N/A"}</td>
            <td>${course['Training Cost'] || "N/A"}</td>
            <td>${course['Reference Number'] || "N/A"}</td>
            <td>${course['Postal Code'] || "N/A"}</td>
            <td>${websiteUrl !== "N/A" ? `<a href="${websiteUrl}" target="_blank">${websiteUrl}</a>` : "N/A"}</td>
            <td>${course.distance ? course.distance.toFixed(2) + " km" : "N/A"}</td>
        `;

        tableBody.appendChild(row);
    });
}

