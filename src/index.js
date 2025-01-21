
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
const searchSuggestions = document.getElementById("search-suggestions");
let selectedArtwork = null;
const MAX_SUGGESTIONS = 5;

// Event listeners
searchBar.addEventListener("input", handleSearch);
searchBar.addEventListener("keydown", handleEnterKey);

let debounceTimer;

// Handle search input
async function handleSearch(event) {
    const userInput = event.target.value.trim();

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
        if (!userInput) {
            searchSuggestions.style.display = "none";
            return;
        }
        
        try {
            const results = await fetchSearchSuggestions(userInput);
            const sortedResults = sortResultsByStartsWith(results, userInput);
            renderSuggestions(sortedResults.slice(0, MAX_SUGGESTIONS));
        } catch (error) {
            handleError(error);
        }
    }, 300);
}

// Sort results to prioritize titles that start with the search input
function sortResultsByStartsWith(results, searchInput) {
    const searchLower = searchInput.toLowerCase();
    
    return results.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        
        // Check if titles start with search input
        const aStartsWith = titleA.startsWith(searchLower);
        const bStartsWith = titleB.startsWith(searchLower);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // If neither or both start with search input, sort alphabetically
        return titleA.localeCompare(titleB);
    });
}

// Fetch search suggestions
async function fetchSearchSuggestions(userInput) {
    // Increase the limit to get more results for better sorting
    const apiUrl = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(userInput)}&fields=id,title,image_id&limit=20`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
    }
    
    const data = await response.json();
    return data.data;
}

// Render suggestions dropdown
function renderSuggestions(results) {
    searchSuggestions.innerHTML = "";
    
    if (results.length > 0) {
        results.forEach(result => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.textContent = result.title;
            div.addEventListener("click", () => {
                searchBar.value = result.title;
                selectedArtwork = result;
                searchSuggestions.style.display = "none";
            });
            searchSuggestions.appendChild(div);
        });
        searchSuggestions.style.display = "block";
    } else {
        searchSuggestions.style.display = "none";
    }
}

//*HANDLE ENTER KEY
async function handleEnterKey(event) {
    if (event.key === "Enter") {
        const userInput = searchBar.value.trim();
        searchSuggestions.style.display = "none";
        
        if (selectedArtwork) {
            await fetchArtworkDetail(selectedArtwork.id);
        } else if (userInput) {
            try {
                const results = await fetchSearchSuggestions(userInput);
                const sortedResults = sortResultsByStartsWith(results, userInput);
                if (sortedResults.length > 0) {
                    await fetchArtworkDetail(sortedResults[0].id);
                } else {
                    mapContainer.innerHTML = "<p>No artwork found. Please try a different search.</p>";
                }
            } catch (error) {
                handleError(error);
            }
        }
        selectedArtwork = null;
    }
}
//TODO CONSULT TEAM ABOUT THIS FEATURE
//? HIDES SUGGESTIONS WHEN CLICKING OUTSIDE SEARCH BAR 
document.addEventListener("click", (event) => {
     
     if (!event.target.closest(".search-container") && 
         !event.target.closest(".search-right-filters") && 
         !event.target.closest("select")) {
            searchSuggestions.style.display = "none";
    }
    
});

//! FETCH ARTWORK DETIALS
async function fetchArtworkDetail(id) {
    const apiUrl = `https://api.artic.edu/api/v1/artworks/${id}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch artwork details");
        }

        const data = await response.json();
        renderArtworkDetail(data.data);
    } catch (error) {
        handleError(error);
    }
}

//! RENDER ART DETAILS! (IMG AND TITLE)
function renderArtworkDetail(artwork) {
    mapContainer.innerHTML = `
        <div class="artwork-detail">
            <h2>${artwork.title}</h2>
            <img src="https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg" 
                 alt="${artwork.title}"
                 style="max-width: 850%; height: 300px;"></div>
    `;

}

function handleError(error) {
    console.error("Error:", error);
    mapContainer.innerHTML = `
        <p>Something went wrong. Please try again later.</p>
        <p>Error: ${error.message}</p>
    `;
}


