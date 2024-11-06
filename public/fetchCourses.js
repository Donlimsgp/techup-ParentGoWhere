// fetchCourses.js
//const courseIds = ["TGS-2023020611","TGS-2020501774"];
const courseIds = ["TGS-2023020611"];

// Function to fetch course data from the server
async function fetchCourseData() {
    try {
        //const response = await fetch('/courses/TGS-2023020611'); // Use correct course ID
        const response = await fetch(`/courses/${courseIds}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch course data: ${response.status}`);
        }
        const jsonData = await response.json();
        displayCourse(jsonData);
    } catch (error) {
        console.error('Error fetching course data:', error);
    }
}

// Function to display course data on the page
function displayCourse(data) {
    // Extract course details from API response
    const course = data.data?.courses?.[0]; // Adjust based on actual structure

    // Log the full course object to examine the structure
    console.log("Full Course Object:", course);

    // Safely access nested properties
    const postalCode = course?.trainingProvider?.address?.[0]?.postalCode;

    // Output to HTML using specific IDs for each data point
    document.getElementById('courseTitle').innerText = course?.title || "N/A";
    document.getElementById('content').innerText = course?.content || "N/A";
    document.getElementById('trainingDuration').innerText = course?.totalTrainingDurationHour || "N/A";
    document.getElementById('trainingProvider').innerText = course?.trainingProvider?.name || "N/A";
    document.getElementById('trainingCost').innerText = course?.totalCostOfTrainingPerTrainee || "N/A";
    document.getElementById('referenceNumber').innerText = course?.referenceNumber || "N/A";
    document.getElementById('postalCode').innerText = postalCode || "N/A";
}

// Fetch course data when the page loads
document.addEventListener('DOMContentLoaded', fetchCourseData);
