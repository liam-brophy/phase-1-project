
async function fetchData() {
  const apiUrl = "https://api.artic.edu/api/v1/artworks";
  try {
  const response = await fetch(apiUrl, {
    method: 'GET',
  });
  const data = await response.json();
  console.log(data);

  if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else {
    throw new Error("Unexpected API response structure");
  }
} catch (error) {
  console.error("Error fetching data from API:", error);
  return []; // Returns an empty array if there's an error
}
}





  async function fetchFilteredRandomArtwork() {
    try {
      // Fetches all artworks from the API
      const artworks = await fetchData();
  
      if (artworks.length === 0) {
        throw new Error("No artworks found");
      }
  
      // Selects a random artwork from the returned array
      const randomArtwork = artworks[Math.floor(Math.random() * artworks.length)];
  
      // Displays the random artwork details
      displayArtwork(randomArtwork);
    } catch (error) {
      console.error("Error fetching random artwork:", error);
  
      // Shows a fallback message in the UI
      const mapContainer = document.getElementById("map-container");
      mapContainer.innerHTML = `<p>Failed to fetch a random artwork. Please try again later.</p>`;
    }
  }



  function displayArtwork(artwork) {
    // Gets the map-container div
    const mapContainer = document.getElementById("map-container");
  
    // Clears any existing content
    mapContainer.innerHTML = "";
  
    // Populates the div with the random artwork details
    const title = document.createElement("h2");
    title.textContent = artwork.title;
  
    const artist = document.createElement("p");
    artist.textContent = `Artist: ${artwork.artist_title || "Unknown"}`;
  
    const image = document.createElement("img");
    image.src = artwork.image_id
      ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
      : "https://via.placeholder.com/843x843.png?text=No+Image+Available";
    image.alt = artwork.title;
  
    // Appends the elements to the container
    //! Will have to change where this data is appended once we get to styling!
    mapContainer.appendChild(title);
    mapContainer.appendChild(artist);
    mapContainer.appendChild(image);
  }
  

  document.getElementById("conjure-button").addEventListener("click", fetchRandomArtwork);