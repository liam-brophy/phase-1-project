

//API function Data
async function fetchData() {
  const apiUrl = "https://api.artic.edu/api/v1/artworks";
  const response = await fetch(apiUrl, {
    method: 'GET',
  });
  const data = await response.json();
  console.log(data);
}



console.log(fetchData())



// Creating a Favorites list
let favorites = [];

function createFavorites() = {
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
function favClick() {
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
// };