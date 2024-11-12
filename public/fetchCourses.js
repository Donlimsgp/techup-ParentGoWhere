// Event listeners
document.getElementById('postalCodeInput').addEventListener('change', fetchCoordinatesAndDisplay, false);
document.getElementById('bakingIcon').addEventListener('click', loadBakingCourses, false);

let courseData = [];
let userCoordinates = null;

// Function to load and process Baking.xlsx file
async function loadBakingCourses() {
    try {
        const response = await fetch('/CourseData/Baking.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        courseData = XLSX.utils.sheet_to_json(firstSheet);
        console.log("Baking course data loaded:", courseData);

        fetchCoordinatesAndDisplay();
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
    const coursesSection = document.getElementById("courses-section");
    const courseList = document.getElementById("course-list");
    
    if (!courseList) {
        console.error("Element with ID 'course-list' not found in HTML.");
        return;
    }

    // Show the courses section
    coursesSection.style.display = "block";

    courseList.innerHTML = "";
    courseList.className = "course-list";

    courseData.forEach(course => {
        // Create main card container
        const courseCard = document.createElement("div");
        courseCard.className = "course-card";

        // Create image section
        const imageContainer = document.createElement("div");
        imageContainer.className = "course-image-container";
        
        const img = document.createElement("img");
        const baseUrl = "https://www.myskillsfuture.gov.sg";
        img.src = course["Image"] ? `${baseUrl}${course["Image"]}` : "/api/placeholder/400/320";
        img.alt = course["Course Title"];
        img.className = "course-image";
        
        img.onerror = function() {
            this.src = "/api/placeholder/400/320";
        };
        
        imageContainer.appendChild(img);

        // Create content section
        const content = document.createElement("div");
        content.className = "course-content";

        // Course title as a link
        const titleLink = document.createElement("a");
        titleLink.className = "course-title";
        titleLink.href = `https://www.myskillsfuture.gov.sg/content/portal/en/training-exchange/course-directory/course-detail.html?courseReferenceNumber=${course["Reference Number"]}`;
        titleLink.target = "_blank";
        titleLink.rel = "noopener noreferrer";
        titleLink.textContent = course["Course Title"];

        // Training provider
        const provider = document.createElement("p");
        provider.className = "course-provider";
        provider.textContent = course["Training Provider"];

        // Price and distance container
        const priceDistanceContainer = document.createElement("div");
        priceDistanceContainer.className = "price-distance-container";

        const priceContainer = document.createElement("div");
        priceContainer.className = "price-container";
        
        const priceLabel = document.createElement("span");
        priceLabel.className = "price-label";
        priceLabel.textContent = "Full Fee";
        
        const price = document.createElement("span");
        price.className = "price";
        const formattedPrice = parseFloat(course["Training Cost"])
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        price.textContent = `$${formattedPrice}`;

        priceContainer.appendChild(priceLabel);
        priceContainer.appendChild(price);

        const distance = document.createElement("span");
        distance.className = "distance-badge";
        distance.textContent = `${course.distance.toFixed(1)} km`;

        priceDistanceContainer.appendChild(priceContainer);
        priceDistanceContainer.appendChild(distance);

        // Assemble all elements
        content.appendChild(titleLink);
        content.appendChild(provider);
        content.appendChild(priceDistanceContainer);

        courseCard.appendChild(imageContainer);
        courseCard.appendChild(content);
        courseList.appendChild(courseCard);
    });
}