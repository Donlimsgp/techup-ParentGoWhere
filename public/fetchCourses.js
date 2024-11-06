document.getElementById('fileInput').addEventListener('change', handleFile, false);

let courseIds = [];

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assuming the course IDs are in the first sheet and first column
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Extract course IDs from the first column
        courseIds = sheetData.map(row => row[0]).filter(id => typeof id === 'string' && id.startsWith('TGS-'));

        // Now you can use the courseIds array
        console.log("Loaded Course IDs:", courseIds);

        // Optionally: Start fetching course data in chunks if IDs are loaded successfully
        fetchCoursesInChunks();
    };

    reader.readAsArrayBuffer(file);
}

// Function to fetch a batch of course IDs (same as before)
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

// Function to process all course IDs in chunks of 20 (same as before)
function fetchCoursesInChunks() {
    const chunkSize = 20;
    for (let i = 0; i < courseIds.length; i += chunkSize) {
        const courseIdBatch = courseIds.slice(i, i + chunkSize);
        setTimeout(() => {
            fetchCourseBatch(courseIdBatch);
        }, i * 100); // Small delay to avoid overwhelming the server
    }
}

// Function to display course data in the table (same as before)
function displayCourse(data) {
    const course = data.data?.courses?.[0];

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
    `;

    tableBody.appendChild(row);
}
