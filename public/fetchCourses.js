document.getElementById('fileInput').addEventListener('change', handleFile, false);
document.getElementById('filterButton').addEventListener('click', async () => {
    const postalCodeInput = document.getElementById('postalCodeInput').value;

    if (!postalCodeInput) {
        alert("Please enter a postal code.");
        return;
    }

    // Fetch origin coordinates using the entered postal code
    const originCoordinates = await fetchCoordinates(postalCodeInput);

    if (originCoordinates) {
        console.log("User's origin coordinates:", originCoordinates);
        fetchCoursesInChunks(originCoordinates); // Pass originCoordinates to filter courses by distance
    } else {
        console.error("Failed to get origin coordinates.");
    }
});

let courseIds = [];

async function fetchCoordinates(postalCode) {
    try {
        const response = await fetch(`/get-coordinates?postalCode=${postalCode}`);
        
        if (!response.ok) {
            console.error("Error fetching coordinates:", response.status);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.lat && data.lng) {
            console.log("Fetched coordinates:", data);
            return { lat: data.lat, lng: data.lng };
        } else {
            console.error("Invalid data format:", data);
            throw new Error("Invalid data format");
        }
    } catch (error) {
        console.error("Failed to get origin coordinates.", error);
        return null;
    }
}


function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        courseIds = sheetData.map(row => row[0]).filter(id => typeof id === 'string' && id.startsWith('TGS-'));
        console.log("Loaded Course IDs:", courseIds);
        fetchCoursesInChunks(); 
    };

    reader.readAsArrayBuffer(file);
}

async function fetchCourseBatch(courseIdBatch, originCoordinates) {
    for (const courseId of courseIdBatch) {
        try {
            const response = await fetch(`/courses/${courseId}`);
            if (!response.ok) throw new Error(`Failed to fetch course data: ${response.status}`);
            const jsonData = await response.json();
            displayCourse(jsonData, originCoordinates); 
        } catch (error) {
            console.error('Error fetching course data:', error);
        }
    }
}

function fetchCoursesInChunks(originCoordinates) {
    const chunkSize = 20;
    for (let i = 0; i < courseIds.length; i += chunkSize) {
        const courseIdBatch = courseIds.slice(i, i + chunkSize);
        setTimeout(() => {
            fetchCourseBatch(courseIdBatch, originCoordinates);
        }, i * 100);
    }
}

function calculateDistance(coord1, coord2) {
    const R = 6371; 
    const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
    const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function displayCourse(data, originCoordinates) {
    const course = data.data?.courses?.[0];
    const tableBody = document.getElementById('courses-table-body');
    const row = document.createElement('tr');

    const coursePostalCode = course?.trainingProvider?.address?.[0]?.postalCode || "N/A";
    let distance = "N/A";

    if (originCoordinates && coursePostalCode !== "N/A") {
        fetchCoordinates(coursePostalCode).then(courseCoordinates => {
            if (courseCoordinates) {
                //distance = calculateDistance(originCoordinates, courseCoordinates).toFixed(2) + " km";
                distance = calculateDistance(originCoordinates, courseCoordinates).toFixed(2);
                row.innerHTML = `
                    <td>${course?.title || "N/A"}</td>
                    <td>${course?.content || "N/A"}</td>
                    <td>${course?.totalTrainingDurationHour || "N/A"} hours</td>
                    <td>${course?.trainingProvider?.name || "N/A"}</td>
                    <td>${course?.totalCostOfTrainingPerTrainee || "N/A"}</td>
                    <td>${course?.referenceNumber || "N/A"}</td>
                    <td>${coursePostalCode}</td>
                    <td>${course?.trainingProvider?.websiteUrl ? `<a href="https://${course.trainingProvider.websiteUrl}" target="_blank">${course.trainingProvider.websiteUrl}</a>` : "N/A"}</td>
                    <td>${distance}</td>
                `;
                tableBody.appendChild(row);
            } else {
                console.error(`Failed to fetch coordinates for postal code ${coursePostalCode}`);
            }
        });
    }
}
