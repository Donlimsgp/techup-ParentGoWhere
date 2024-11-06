// fetchCourses.js

// Function to fetch course data from the server
async function fetchCourseData() {
    try {
        const response = await fetch('/test-course'); // Ensure endpoint is correct
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
    const course = data.data.courses[0];

    // Log the full course object to examine the structure
    console.log("Full Course Object:", course);

    // Access the first address in the array to get the postal code
    const postalCode = course.trainingProvider?.address?.[0]?.postalCode;

    // Output specific course details to the console for debugging
    console.log("Course Content:", course.content);
    console.log("Total Training Duration:", course.totalTrainingDuration);
    console.log("Training Provider:", course.trainingProvider?.name);
    console.log("Course Title:", course.title);
    console.log("Training Cost:", course.trainingCost);
    console.log("Reference Number:", course.referenceNumber);
    console.log("Postal Code:", postalCode);

    // Map JSON fields to HTML elements, using optional chaining for nested fields
    document.getElementById('content').innerText = course.content || "N/A";
    document.getElementById('trainingDuration').innerText = course.totalTrainingDuration || "N/A";
    document.getElementById('trainingProvider').innerText = course.trainingProvider?.name || "N/A";
    document.getElementById('courseTitle').innerText = course.title || "N/A";
    document.getElementById('trainingCost').innerText = course.trainingCost || "N/A";
    document.getElementById('referenceNumber').innerText = course.referenceNumber || "N/A";
    document.getElementById('postalCode').innerText = postalCode || "N/A";
}


// Fetch course data when the page loads
document.addEventListener('DOMContentLoaded', fetchCourseData);
