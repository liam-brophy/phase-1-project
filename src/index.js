

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
  const favoriteList = document.getElementsByClassName("");
  favoriteList.innerText = ''

  favorites.forEach(favorites => {
    const listOfFavorites = document.createElement('li')
    listFavArt.textContext = `Art Piece: ${favoriteList.id}`
    favoriteList.appendChild(listFavArt)
  })
}

//Click Event Listener for Favorites Button
const favButton = document.getElementById('fav-button')

function favClick() {
  alert("Favorite Button Clicked")
}

favButton.addEventListener('click', favClick)