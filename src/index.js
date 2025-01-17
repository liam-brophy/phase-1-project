
async function fetchData() {
  const apiUrl = "https://api.artic.edu/api/v1/artworks";
  const response = await fetch(apiUrl, {
    method: 'GET',
  });
  const data = await response.json();
  console.log(data);
}



console.log(fetchData())
