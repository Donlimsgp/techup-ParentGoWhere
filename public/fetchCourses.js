// fetchCourses.js

// Function to fetch course data from the server
async function fetchCourseData() {
    try {
        // Call the server's /courses endpoint
        const response = await fetch('/courses');
        
        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`Failed to fetch courses: ${response.status}`);
        }

        // Parse JSON data
        const data = await response.json();

        // Display course data
        displayCourses(data.data.courses);  // Adjusted to match your data structure
    } catch (error) {
        console.error('Error fetching course data:', error);
    }
}

// Function to display courses on the page
function displayCourses(courses) {
    const coursesContainer = document.getElementById('courses-container');
    coursesContainer.innerHTML = ''; // Clear any existing content

    courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.classList.add('course-item');
        
        // Adjust these fields based on your API data structure
        courseElement.innerHTML = `
            <h3>${course.description}</h3>
            <p><strong>Category:</strong> ${course.category.description}</p>
            <p><strong>Location:</strong> ${course.locationOfTrainings[0]?.postalCode || 'N/A'}</p>
            <p><strong>Details:</strong> ${course.content}</p>
        `;

        coursesContainer.appendChild(courseElement);
    });
}

// Call fetchCourseData when the page loads
document.addEventListener('DOMContentLoaded', fetchCourseData);
