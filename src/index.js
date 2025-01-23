//! GLOBAL VARIABLES

const searchBar = document.getElementById("search-bar");
const mapContainer = document.getElementById("map-container");
const searchSuggestions = document.getElementById("search-suggestions");
let selectedArtwork = null;
const MAX_SUGGESTIONS = 5;
let debounceTimer;
let cachedArtworks = []; // caches artworks to avoid refetching
const artworkText = document.getElementById("artwork-text");
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;
searchSuggestions.style.display = "none";



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
    cachedArtworks = artworks


    
    displayArtwork(artworks[1]) //displays immiate
    return artworks;
  } catch (error) {
    console.error("Error fetching all artworks:", error);
    return [];
  }
}
console.log(fetchData());

async function handleFilterChange() {
  if (cachedArtworks.length === 0) {
    cachedArtworks = await fetchData(); // fetch data only once
  }

  const movementSelect = document.getElementById("movement-select");

  const movementValue = movementSelect.value;

  let filteredArtworks = cachedArtworks;

  //! MOVEMENT FILTER
  if (movementValue) {
    const [startYear, endYear] = movementValue.split("-").map(Number);
    filteredArtworks = filteredArtworks.filter(
      artwork =>
        artwork.date_start >= startYear && artwork.date_start <= endYear
    );
  }


  if (filteredArtworks.length === 0) {
    console.error("No artworks found for the selected filters");
    displayNoResultsMessage();
    return;
  }

  const randomArtwork =
    filteredArtworks[Math.floor(Math.random() * filteredArtworks.length)];
  displayArtwork(randomArtwork);
}

function displayNoResultsMessage() {
  const mapContainer = document.getElementById("map-container");
  mapContainer.innerHTML = "<p>No artworks found for the selected filters.</p>";
}

//!HANDLE SEARCH INPUT
async function handleSearch(event) {
  const userInput = event.target.value.trim();
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
      if (!userInput) {
          searchSuggestions.style.display = "none";
          return;
      }
      try {
          // Use cached artworks instead of making an API call
          if (cachedArtworks.length === 0) {
              cachedArtworks = await fetchData();
          }

          // Filter cached artworks that start with user input
          const results = cachedArtworks.filter(artwork =>
              artwork.title &&
              artwork.title.toLowerCase().startsWith(userInput.toLowerCase())
          );

          // Sort results alphabetically
          const sortedResults = results.sort((a, b) =>
              a.title.toLowerCase().localeCompare(b.title.toLowerCase())
          );

          renderSuggestions(sortedResults.slice(0, MAX_SUGGESTIONS));
      } catch (error) {
          console.error("Search error:", error);
          searchSuggestions.style.display = "none";
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
              displayArtwork(result);  // Display the artwork immediately
          });
          
          searchSuggestions.appendChild(div);
      });
      searchSuggestions.style.display = "block";
  } else {
      searchSuggestions.style.display = "none";
      const noResultsDiv = document.createElement("div");
      noResultsDiv.className = "suggestion-item";
      noResultsDiv.textContent = "No artworks found starting with '" + searchBar.value + "'";
      searchSuggestions.appendChild(noResultsDiv);
      searchSuggestions.style.display = "block";
  }
}


//!HANDLE ENTER KEY
async function handleEnterKey(event) {
  if (event.key === "Enter") {
      const userInput = searchBar.value.trim();
      searchSuggestions.style.display = "none";

      if (selectedArtwork) {
          displayArtwork(selectedArtwork);
      } else if (userInput) {
          const results = cachedArtworks.filter(artwork => 
              artwork.title && 
              artwork.title.toLowerCase().startsWith(userInput.toLowerCase())
          );

          if (results.length > 0) {
              displayArtwork(results[0]);
          } else {
              displayNoResultsMessage();
          }
      }
      selectedArtwork = null;
  }
}

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
  artworkText.innerHTML = `
      
          
          <img src="https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg"
               alt="${artwork.title}"
               />
               <div class="artwork-details">
               <h3>${artwork.title || "Unknown"} </h3>
               <h4>${artwork.artist || "Unknown"}</h4>
               <p>${artwork.year|| "Not provided"}</p>
               <p>${artwork.dimensions|| "Not provided"}</p>
               <p>${artwork.medium || "Not provided"}</p></div>
  `;

}


function displayArtwork(artwork) {

  const artworkText = document.getElementById("artwork-text");
  artworkText.innerHTML = "";// Clears any existing content



  const image = document.createElement("img");
  image.src = artwork.image_id
    ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
    : "https://via.placeholder.com/843x843.png?text=No+Image+Available";//!replace with actual placeholder
  image.alt = artwork.title;

  artworkText.appendChild(image);

  // Create a container for text details
  const textContainer = document.createElement("div");
  textContainer.classList.add("artwork-details"); // Use the new CSS class

  // Populates the div with the random artwork details
  const title = document.createElement("h3");
  title.textContent = `${artwork.title || "Unknown"}`;

  const artist = document.createElement("h4");
  artist.textContent = `${artwork.artist_title || "Unknown"}`;

  const year = document.createElement("p");
  year.textContent = `${artwork.date_start || "Unknown"}`;

  const dimensions = document.createElement("p");
  dimensions.textContent = `${artwork.dimensions || "Not provided"}`;

  const medium = document.createElement("p");
  medium.textContent = `${artwork.medium || "Not provided"}`;

  // Append details to the container
  textContainer.appendChild(title);
  textContainer.appendChild(artist);
  textContainer.appendChild(year);
  textContainer.appendChild(dimensions);
  textContainer.appendChild(medium);

  // Append the text container to artwork-text
  artworkText.appendChild(textContainer);

  setTimeout(() => {
    artworkText.classList.add("fade-in");
  }, 50); // Delay to trigger the animation

}


const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    body.classList.add(savedTheme);
    themeToggle.textContent = savedTheme === "dark-mode" ? "Switch to Light Mode" : "Switch to Dark Mode";
    themeToggle.className = savedTheme;
}

// Toggle theme on button click
themeToggle.addEventListener("click", () => {
    if (body.classList.contains("dark-mode")) {
        body.classList.replace("dark-mode", "light-mode");
        themeToggle.textContent = "Switch to Dark Mode";
        themeToggle.className = "light-mode";
        localStorage.setItem("theme", "light-mode");
    } else {
        body.classList.replace("light-mode", "dark-mode");
        themeToggle.textContent = "Switch to Light Mode";
        themeToggle.className = "dark-mode";
        localStorage.setItem("theme", "dark-mode");
    }
});



//!EVENT LISTENERS
document.getElementById("conjure-button").addEventListener("click", handleFilterChange);
document.getElementById("movement-select").addEventListener("change", handleFilterChange);
document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-container") &&
      !event.target.closest(".search-right-filters") &&
      !event.target.closest("select")) {

 }

});
searchBar.addEventListener("input", handleSearch);
searchBar.addEventListener("keydown", handleEnterKey);


fetchData()