// List of course IDs to fetch
const courseIds = ["TGS-2023020611", "TGS-2023020612", "TGS-2023020613"]; // Add your course IDs here

// Function to fetch course data for multiple courses
async function fetchMultipleCourses(courseIds) {
    const coursesContainer = document.getElementById('course-details');
    coursesContainer.innerHTML = ''; // Clear existing content

    for (const courseId of courseIds) {
        try {
            const response = await fetch(`/courses/${courseId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch course data for ID ${courseId}: ${response.status}`);
            }
            const data = await response.json();
            displayCourse(data, coursesContainer);
        } catch (error) {
            console.error(`Error fetching course data for ID ${courseId}:`, error);
        }
    }
}

// Function to display course data on the page
function displayCourse(data, container) {
    const course = data.data.courses[0];
    const postalCode = course.trainingProvider?.address?.[0]?.postalCode;

    // Create a container for each course
    const courseElement = document.createElement('div');
    courseElement.classList.add('course-item');

    courseElement.innerHTML = `
        <h3>${course.title || "N/A"}</h3>
        <p><strong>Content:</strong> ${course.content || "N/A"}</p>
        <p><strong>Total Training Duration:</strong> ${course.totalTrainingDuration || "N/A"}</p>
        <p><strong>Training Provider:</strong> ${course.trainingProvider?.name || "N/A"}</p>
        <p><strong>Training Cost:</strong> ${course.trainingCost || "N/A"}</p>
        <p><strong>Reference Number:</strong> ${course.referenceNumber || "N/A"}</p>
        <p><strong>Postal Code:</strong> ${postalCode || "N/A"}</p>
        <hr>
    `;

    container.appendChild(courseElement);
}

// Call fetchMultipleCourses with the list of course IDs when the page loads
document.addEventListener('DOMContentLoaded', () => fetchMultipleCourses(courseIds));
