
async function fetchData() {
    const apiUrl = "https://api.artic.edu/api/v1/artworks";
    const response = await fetch(apiUrl, {
        method: 'GET',
    });
    const data = await response.json();
    console.log(data);
}

//add modal search results
//add images to search results


//! GLOBAL VARIABLES

const searchBar = document.getElementById("search-bar");
const mapContainer = document.getElementById("map-container");




searchBar.addEventListener("input", handleSearch); //* Live search (on input)
searchBar.addEventListener("keydown", handleEnterKey); //* Trigger search on Enter key

let debounceTimer;
//? LIVE SEARCH FUNCTION
function handleSearch(event) {
    const userInput = event.target.value.trim(); //* Get the userInput (user input)

    clearTimeout(debounceTimer); //*Clear previous debounce timer

    debounceTimer = setTimeout(() => {
        if (!userInput) {
            clearResults(); //* If the userInput is empty, clear results
            return;
        }
        fetchSearchResults(userInput); //* Fetch search results for the live search
    }, 300); //* Delay to prevent rapid API calls (debounce)
}

function handleEnterKey(event) {
    if (event.key === "Enter") {
        const userInput = event.target.value.trim(); //* Get the userInput on "Enter" press
        if (userInput) {
            fetchSearchResults(userInput); //* Trigger the search
        }
    }
}

//? FETCH SEARCH USERINPUT RESULTS
async function fetchSearchResults(userInput) {
    const apiUrl = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(userInput)}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
        renderSearchResults(data.data); //* Pass  results -> render

    } catch (error) {
        handleError(error); //* Handle any errors during the fetchd
    }
}

//? RENDER SEARCH RESULTS TO MAP CONTAINER
function renderSearchResults(results) {
    clearResults();

    if (results.length > 0) {
        results.forEach((result) => {
            const imageUrl = result.image_id ?
                `https://www.artic.edu/iiif/2/${result.image_id}/full/843,/0/default.jpg` :
                'fallback_image_url_here.jpg'; //* Fallback if no image_id

            console.log(result);  //* Debug: Log the result object
            console.log(result.image_id);  //* Debug: Log the image_id

            const img = createImageElement(imageUrl, result.title);
            img.addEventListener("click", () => {
                fetchArtworkDetail(result.id); //* Fetch artwork detail when clicked
            });

            mapContainer.appendChild(img);
        });
    } else {
        mapContainer.innerHTML = "<p>No results found.</p>";
    }
}


//?GET ARTWORK DETAILS
async function fetchArtworkDetail(id) {
    const apiUrl = `https://api.artic.edu/api/v1/artworks/${id}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Failed to fetch artwork details");
        }

        const data = await response.json();
        renderArtworkDetail(data.data); //* Render artwork details

    } catch (error) {
        handleError(error); //* Handle errors during the fetch
    }
}

//? RENDER ART DETAILS
function renderArtworkDetail(artwork) {
    const mapContainer = document.getElementById("map-container");
    mapContainer.innerHTML = `
    <h2>${artwork.title}</h2>
    <img src="https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg" alt="${artwork.title}">
    <p><strong>Artist:</strong> ${artwork.artist_title}</p>
    <p><strong>Description:</strong> ${artwork.description || "No description available."}</p>
  `;
}

//? CREATE ARTWORK IMAGE ELEMENT
function createImageElement(src, alt) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt || "Artrk";
    return img;
}

//? CLEAR SEARCH RESULTS
function clearResults() {
    const mapContainer = document.getElementById("map-container");
    mapContainer.innerHTML = "";
}


function handleError(error) {
    console.error("Error fetching API:", error);

    const mapContainer = document.getElementById("map-container");
    mapContainer.innerHTML = `
    <p>Something went wrong. Please try again later.</p>
    <p>Error: ${error.message}</p>
  `;
}







console.log(fetchData())
