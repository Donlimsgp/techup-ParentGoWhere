async function testGeocodeAPI(postalCode) {
    const apiKey = AIzaSyCOTtcrXCu5SLJWwkMgmwEF5YPrgH0Qn7M; // Replace this with your actual API key
    //const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode}&components=country:SG&key=${apiKey}`;
    //const url = https://maps.googleapis.com/maps/api/geocode/json?address=460029&components=country:SG&key=AIzaSyCOTtcrXCu5SLJWwkMgmwEF5YPrgH0Qn7M;

    try {
        const response = await fetch("https://maps.googleapis.com/maps/api/geocode/json?address=460029&components=country:SG&key=AIzaSyCOTtcrXCu5SLJWwkMgmwEF5YPrgH0Qn7M");
        const data = await response.json();

        if (response.ok && data.status === "OK") {
            console.log("API Test Successful! Here is the response:");
            console.log(data);
        } else {
            console.error("API Test Failed. Response status:", data.status);
            console.error(data.error_message || "No error message provided.");
        }
    } catch (error) {
        console.error("Error connecting to API:", error);
    }
}

// Run the test function with a sample postal code
testGeocodeAPI("339772"); // Replace "339772" with any Singapore postal code you want to test
