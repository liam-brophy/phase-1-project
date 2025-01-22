

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

//! EVENT LISTENERS
document.getElementById("movement-select").addEventListener("change", handleFilterChange);
document.getElementById("theme-select").addEventListener("change", handleFilterChange);

let cachedArtworks = []; // caches artworks to avoid refetching

async function handleFilterChange() {
  if (cachedArtworks.length === 0) {
    cachedArtworks = await fetchData(); // fetch data only once
  }

  const movementSelect = document.getElementById("movement-select");
  const themeSelect = document.getElementById("theme-select");

  const movementValue = movementSelect.value;
  const themeValue = themeSelect.value;

  let filteredArtworks = cachedArtworks;

  //! MOVEMENT FILTER
  if (movementValue) {
    const [startYear, endYear] = movementValue.split("-").map(Number);
    filteredArtworks = filteredArtworks.filter(
      artwork =>
        artwork.date_start >= startYear && artwork.date_start <= endYear
    );
  }

  //! THEME FILTER
  if (themeValue) {
    filteredArtworks = filteredArtworks.filter(
      artwork =>
        artwork.artist_title &&
        artwork.artist_title.toLowerCase().includes(themeValue.toLowerCase())
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

function displayArtwork(artwork) {
  // Gets the map-container div
  const artworkText = document.getElementById("artwork-text");

  // Clears any existing content
  artworkText.innerHTML = "";

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
  const title = document.createElement("p");
  title.textContent = `Title: ${artwork.title || "Unknown"}`;

  const artist = document.createElement("p");
  artist.textContent = `Artist: ${artwork.artist_title || "Unknown"}`;

  const year = document.createElement("p");
  year.textContent = `Year: ${artwork.date_start || "Unknown"}`;

  const dimensions = document.createElement("p");
  dimensions.textContent = `Dimensions: ${artwork.dimensions || "Not provided"}`;

  const medium = document.createElement("p");
  medium.textContent = `Medium: ${artwork.medium || "Not provided"}`;

  // Append details to the container
  textContainer.appendChild(title);
  textContainer.appendChild(artist);
  textContainer.appendChild(year);
  textContainer.appendChild(dimensions);
  textContainer.appendChild(medium);

  // Append the text container to artwork-text
  artworkText.appendChild(textContainer);

}


document.getElementById("conjure-button").addEventListener("click", handleFilterChange);






// Creating a Favorites list
let favorites = [];

function createFavorites(e) {
  //Get id name to retrieve art pieces to save for list
  const favoriteList = document.getElementsById("favorites-list");
  favoriteList.innerText = ''

  favorites.forEach(favoritesList => {
    const listArt = document.createElement('li')
    listArt.textContext = `Art Piece: ${favoritesList}`
    favoriteList.appendChild(listArt)
  })
}

//Click Event Listener for Favorites Button
const favButton = document.getElementById('favorite-button')

//!!Will need adjusting depending on names of code for image grabs!!
function favClick(e) {
  const imgId = e.target.getAttribute('artwork-text')
  const imgElement = document.getElementById(imgId)
  alert("Favorite Button Clicked")
}

favButton.addEventListener('click', favClick)

document.querySelectorAll('fav-button').forEach(button => {
  button.addEventListener('click', async (event) => {
    const imgId = event.target.getAttribute('data-img-id')
    const imgElement = document.getElementById(imgId)
    const imageUrl = imgElement.src; 

    if (!favorites.includes(imageUrl)) {
      try {
        favorites.push(imageUrl)
        await saveFavorite(imageUrl)
        updateFavoritesDisplay()
      } catch (error) {
        alert(error)
      }
    } else {
      alert('This picture is already in your favorites!');
    }
  });
});


const updateFavoritesDisplay = () => {
  favoriteImagesContainer.innerHTML = ''; // Clear the current favorites list

  // Loop through the favorites array and display each image
  favorites.forEach(imageUrl => {
    const imgElement = document.createElement('li')
    imgElement.src = imageUrl
    favoriteImagesContainer.appendChild(imgElement)
  });
};


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
}


document.getElementById("conjure-button").addEventListener("click", fetchFilteredRandomArtwork);


