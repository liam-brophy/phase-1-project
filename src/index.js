
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

//! EVENT LISTENERS
searchBar.addEventListener("input", handleSearch);
searchBar.addEventListener("keydown", handleEnterKey);

let debounceTimer;


//!HANDLE SEARCH INPUT
async function handleSearch(event) {
    //*take in and trim user input
    const userInput = event.target.value.trim();
    //! prevent overloading 
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
        //*if userinpout is empty then exit early 
        if (!userInput) { 
            searchSuggestions.style.display = "none";
            return;
        }
        
        try {  //*if its not empty calls 
            //*fetches search suggs to get matches
            const results = await fetchSearchSuggestions(userInput);
            //*results get sorted, prioritizes suggs that start with user input 
            const sortedResults = sortResultsByStartsWith(results, userInput);
            //*only shows max 5 suggs at a time
            renderSuggestions(sortedResults.slice(0, MAX_SUGGESTIONS));
        } catch (error) {
            handleError(error);
        }
    }, 300);
}

//! HANDLE SEARCH RESULTS WITH USER INPUT
function sortResultsByStartsWith(results, searchInput) {
    const searchLower = searchInput.toLowerCase();
    //*sorts the result array compares a and b
    return results.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        
        //* check if titles start with search input
        //* for each item its comapred with title a & b
        //* checks if a and b start with userInput
        //* if aStartswith is true if titleA starts with searchlower
        //* if aStartswith is true if titleB starts with searchlower

        const aStartsWith = titleA.startsWith(searchLower);
        const bStartsWith = titleB.startsWith(searchLower);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        //* if neither or both start with search input, sort alphabetically
        return titleA.localeCompare(titleB);
    });
}

//! FETCH SEARCH SUGGS
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

//! RENDER SEARCH SUGGS DROP DOWN
function renderSuggestions(results) {
    //*clear suggs from drop down
    searchSuggestions.innerHTML = "";
    //*check for rssults to display
    if (results.length > 0) {
        results.forEach(result => {
            //*create new div for each sugg
            const div = document.createElement("div");
            div.className = "suggestion-item";
            //*display title
            div.textContent = result.title;
            //todo ADD CLICKABLE SUGG
            div.addEventListener("click", () => {
                searchBar.value = result.title;
                selectedArtwork = result;
                //*hide sug after clicked
                searchSuggestions.style.display = "none";
            });
            searchSuggestions.appendChild(div);
        });
        searchSuggestions.style.display = "block";
    } else { //*if no suggs hide dropdown
        searchSuggestions.style.display = "none";
    }
}

//*HANDLE ENTER KEY
async function handleEnterKey(event) {
    if (event.key === "Enter") {
        //*clean up user input
        const userInput = searchBar.value.trim();
        //*hides suggs
        searchSuggestions.style.display = "none";
        //*if art is already selected fetch info about work
        if (selectedArtwork) {
            await fetchArtworkDetail(selectedArtwork.id);
        } else if (userInput) {
            try { //*if no art selected setch suggs based on the input, prioritize the first results
                const results = await fetchSearchSuggestions(userInput);
                const sortedResults = sortResultsByStartsWith(results, userInput);
                if (sortedResults.length > 0) {
                    await fetchArtworkDetail(sortedResults[0].id);
                } else { //*if no art found
                    mapContainer.textContent = "No artwork found. Please try a different search.";
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


