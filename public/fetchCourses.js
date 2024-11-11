// Event listeners
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

function displayCourses(courseData) {
    const courseList = document.getElementById("course-list");

    // Check if the courseList element exists before proceeding
    if (!courseList) {
        console.error("Element with ID 'course-list' not found in HTML.");
        return;
    }

    courseList.innerHTML = ""; // Clear any existing content

    courseData.forEach(course => {
        const courseCard = document.createElement("div");
        courseCard.classList.add("course-card");

        // Left section
        const leftSection = document.createElement("div");
        leftSection.classList.add("left-section");

        // Distance at the top left
        const distanceItem = document.createElement("p");
        distanceItem.classList.add("distance-item");
        distanceItem.innerHTML = `Distance: ${course.distance.toFixed(2)} km`;
        leftSection.appendChild(distanceItem);

        // Course title
        const title = document.createElement("h3");
        title.classList.add("course-title");
        title.textContent = course["Course Title"];
        leftSection.appendChild(title);

        // Course content with limited lines
        const content = document.createElement("p");
        content.classList.add("course-content");
        content.textContent = course.Content;
        leftSection.appendChild(content);

        // Right section
        const rightSection = document.createElement("div");
        rightSection.classList.add("right-section");

        // Details in the right section
        const details = [
            { label: "Reference", value: course["Reference Number"] },
            { label: "Training Provider", value: course["Training Provider"] },
            { label: "Cost", value: course["Training Cost"] },
            { label: "Duration", value: course["Total Training Duration"] },
            { label: "Postal Code", value: course["Postal Code"] },
        ];

        details.forEach(detail => {
            const detailItem = document.createElement("p");
            detailItem.classList.add("detail-item");
            detailItem.innerHTML = `<span>${detail.label}:</span> ${detail.value}`;
            rightSection.appendChild(detailItem);
        });

        // Add link to the website URL
        const link = document.createElement("a");
        link.href = course["Website URL"];
        link.target = "_blank";
        link.textContent = course["Website URL"];
        rightSection.appendChild(link);

        courseCard.appendChild(leftSection);
        courseCard.appendChild(rightSection);
        courseList.appendChild(courseCard);
    });
}

