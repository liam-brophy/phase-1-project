
async function fetchData() {
  const apiUrl = "https://api.artic.edu/api/v1/artworks";
  let artworks = []; //initializes an empty array
  let page = 1; // starts at the first page
  const limit = 100; // number of results per page
  const maxPages = 5; // fetches up to 5 pages (adjust as needed)

  try {
    while (page <= maxPages) { //increment only while there still are pages
      //?page=${page} adds a query parameter specifying which page of results to fetch.
      //&limit=${limit} specifies the number of items per page.
      const response = await fetch(`${apiUrl}?page=${page}&limit=${limit}`);
      const data = await response.json();

      //!validation
      //data.data means the parsed data object has a property called data!
      //array.isArray is ensuring that data.data IS an array
      if (data.data && Array.isArray(data.data)) {
        artworks = artworks.concat(data.data);
      } else {
        throw new Error("Unexpected API response structure");
      }

      page++;
    }

    return artworks;
  } catch (error) {
    console.error("Error fetching all artworks:", error);
    return [];
  }
}
console.log(fetchData())
//!Currently fetches 500 artworks (limit 100 * max pages 5)


async function fetchFilteredRandomArtwork() {
  try {
    // fetches all artworks from the API
    const artworks = await fetchData();

    const movementSelect = document.getElementById("movement-select");
    const selectedValue = movementSelect.value;

    const themeSelect = document.getElementById("movement-select");
    const selectedTheme = movementSelect.value;

    let filteredArtworks = artworks;

    //!FILTER BY MOVEMENT
    if (selectedValue) {
    const [startYear, endYear] = selectedValue.split("-").map(Number);
    filteredArtworks = artworks.filter(
      artwork =>
        artwork.date_start >= startYear && artwork.date_start <= endYear
      //filters date by range
    );
    }

    //!FILTER BY THEME
    if (selectedTheme) {
      filteredArtworks = filteredArtworks.filter(artwork =>
        artwork.subject_titles &&
        artwork.subject_titles.some(subject =>
          subject.toLowerCase().includes(selectedTheme.toLowerCase())
        )
      );
    }

    if (filteredArtworks.length === 0) {
      throw new Error("No artworks found for the selected period");
    }

    // selects a random artwork from the returned array
    const randomArtwork =
      filteredArtworks[Math.floor(Math.random() * filteredArtworks.length)];

    // displays the random artwork details
    displayArtwork(randomArtwork);
  } catch (error) {
    console.error("Error fetching random artwork:", error);

    //
    const mapContainer = document.getElementById("map-container");
    mapContainer.innerHTML = `<p>Failed to fetch a random artwork. Please try again later.</p>`;
  }
}



function displayArtwork(artwork) {
  // Gets the map-container div
  const artworkText = document.getElementById("artwork-text");

  // Clears any existing content
  artworkText.innerHTML = "";

  // Populates the div with the random artwork details
  const title = document.createElement("p");
  title.textContent = artwork.title;

  const year = document.createElement("p");
  year.textContent = artwork.date_start;

  const artist = document.createElement("p");
  artist.textContent = `${artwork.artist_title || "Unknown"}`;

  const dimensions = document.createElement("p");
  dimensions.textContent = artwork.dimensions;

  const medium = document.createElement("p");
  medium.textContent = artwork.medium;

  const image = document.createElement("img");
  image.src = artwork.image_id
    ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
    : "https://via.placeholder.com/843x843.png?text=No+Image+Available";//!replace with actual placeholder
  image.alt = artwork.title;

  // Appends the elements to the container
  //! Will have to change where this data is appended once we get to styling!
  //! Maybe we should validate if all of the data is available before appending! Some are missing details
  artworkText.appendChild(title);
  artworkText.appendChild(artist);
  artworkText.appendChild(year);
  artworkText.appendChild(dimensions);
  artworkText.appendChild(medium);
  artworkText.appendChild(image);


//? add modal search results
//add images to search results

console.log()
//! GLOBAL VARIABLES

const searchBar = document.getElementById("search-bar");
const mapContainer = document.getElementById("map-container");
const searchSuggestions = document.getElementById("search-suggestions");
let selectedArtwork = null;
const MAX_SUGGESTIONS = 5;

//! EVENT LISTENERS
searchBar.addEventListener("input", handleSearch);
searchBar.addEventListener("keydown", handleEnterKey);
//* avoid spam
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
    //* increase the limit to get more results for better sorting
    const apiUrl = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(userInput)}&fields=id,title,image_id&limit=20`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
    }
    const data = await response.json(); //.body .ok .status
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

//!HANDLE ENTER KEY
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
        }//* reset the selected artwork to null after handling the Enter key
        selectedArtwork = null;
    }
}

//* CONSULT TEAM ABOUT THIS FEATURE
//* hides suggs when clicking out of search bar 
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
    //*set html of map container to show art and title
    mapContainer.innerHTML = `
        <div class="artwork-detail">
            <h2>${artwork.title}</h2>
            <img src="https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg"
                 alt="${artwork.title}"
                 style="max-width: 800px; height: 300px;"></div>
    `;

}
//! ERROR HANDLING
function handleError(error) {
    console.error("Error:", error);
    mapContainer.innerHTML = `
        <p>Something went wrong. Please try again later.</p>
        <p>Error: ${error.message}</p>
    `;
}




