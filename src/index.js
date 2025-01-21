

//API function Data
async function fetchData() {
  const apiUrl = "https://api.artic.edu/api/v1/artworks";
  let artworks = [];
  let page = 1; // starts at the first page
  const limit = 100; // number of results per page
  const maxPages = 5; // fetches up to 5 pages (adjust as needed)

  try {
    while (page <= maxPages) {
      const response = await fetch(`${apiUrl}?page=${page}&limit=${limit}`);
      const data = await response.json();

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

    let filteredArtworks;

    if (selectedValue) {
    const [startYear, endYear] = selectedValue.split("-").map(Number);
    filteredArtworks = artworks.filter(
      artwork =>
        artwork.date_start >= startYear && artwork.date_start <= endYear
      //filters date by range
    );
    }else {
      // if no movement is selected, use the full dataset
      filteredArtworks = artworks;
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



console.log(fetchData())



// Creating a Favorites list
let favorites = [];

function createFavorites() {
  //Get class name to retrieve art pieces to save for list
  const favoriteList = document.getElementsById("");
  favoriteList.innerText = ''

  favorites.forEach(favoritesList => {
    const listArt = document.createElement('li')
    listArt.textContext = `Art Piece: ${favoritesList}`
    favoriteList.appendChild(listArt)
  })
}

//Click Event Listener for Favorites Button
const favButton = document.getElementById('fav-button')

//!!Will need adjusting depending on names of code for image grabs!!
<<<<<<< HEAD
function favClick(e) {
=======
function favClick() {
>>>>>>> fd616c5 (Updates and additions to favorite button and displays as well as some HTML updates for Favorites)
  const imgId = e.target.getAttribute('data-img-id')
  const imgElement = document.getElementById(imgId)
  const imageUrl = imgElement.src
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


// const updateFavoritesDisplay = () => {
//   favoriteImagesContainer.innerHTML = ''; // Clear the current favorites list

//   // Loop through the favorites array and display each image
//   favorites.forEach(imageUrl => {
//     const imgElement = document.createElement('img');
//     imgElement.src = imageUrl;
//     imgElement.alt = 'Favorite Picture';
//     favoriteImagesContainer.appendChild(imgElement);
//   });
<<<<<<< HEAD
// };
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
=======
// };
>>>>>>> fd616c5 (Updates and additions to favorite button and displays as well as some HTML updates for Favorites)
