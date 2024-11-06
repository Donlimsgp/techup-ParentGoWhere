// fetchCourses.js
//const courseIds = ["TGS-2023020611", "TGS-2020501774"]; // Add more course IDs as needed
const courseIds = ["TGS-2023020611","TGS-2020501774", "TGS-2019508423", "TGS-2024041472", "TGS-2024041390", "TGS-2022015371", "TGS-2022015287", "TGS-2022015361", "TGS-2022015355", "TGS-2022015791", "TGS-2022015795", "TGS-2024041494", "TGS-2022015789", "TGS-2023036448", "TGS-2019504813", "TGS-2024042486", "TGS-2023019071", "TGS-2022017619", "TGS-2019502757", "TGS-2022013430", "TGS-2022017613", "TGS-2019502758", "TGS-2023019952", "TGS-2023036465", "TGS-2022017625", "TGS-2023036461", "TGS-2023028365", "TGS-2022017621", "TGS-2023036449", "TGS-2023036462", "TGS-2023021600", "TGS-2023021616", "TGS-2023028358", "TGS-2023036453", "TGS-2023036463", "TGS-2023021611", "TGS-2023028348", "TGS-2023034565", "TGS-2018500442", "TGS-2022013522", "TGS-2023019379", "TGS-2019502014", "TGS-2021004165", "TGS-2018502547", "TGS-2024046883", "TGS-2021009555", "TGS-2023040192"];

// Function to fetch course data from the server
async function fetchCourseData(courseId) {
    try {
        const response = await fetch(`/courses/${courseId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch course data: ${response.status}`);
        }
        const jsonData = await response.json();
        displayCourse(jsonData); // Display course data
    } catch (error) {
        console.error('Error fetching course data:', error);
    }
}

// Fetch data for each course ID
courseIds.forEach(courseId => fetchCourseData(courseId));

// Function to display course data in the table
function displayCourse(data) {
    // Extract course details from API response
    const course = data.data?.courses?.[0]; // Adjust based on actual structure
    
    // Log the full course object to examine the structure
    console.log("Full Course Object:", course);

    // Safely access nested properties
    const postalCode = course?.trainingProvider?.address?.[0]?.postalCode;

    // Create a new row in the table
    const tableBody = document.getElementById('courses-table-body');
    const row = document.createElement('tr');

    // Insert data into row cells
    row.innerHTML = `
        <td>${course?.title || "N/A"}</td>
        <td>${course?.content || "N/A"}</td>
        <td>${course?.totalTrainingDurationHour || "N/A"} hours</td>
        <td>${course?.trainingProvider?.name || "N/A"}</td>
        <td>${course?.totalCostOfTrainingPerTrainee || "N/A"}</td>
        <td>${course?.referenceNumber || "N/A"}</td>
        <td>${postalCode || "N/A"}</td>
    `;

    // Append the new row to the table body
    tableBody.appendChild(row);
}
