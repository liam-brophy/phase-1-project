//GLOBAL VARIABLES
const authString = btoa(`applicationId:applicationSecret`);
//applicationID = 80ea78aa-b719-4c56-8b42-4500b0b1b83f
//applicationSecret = ed3dad1efe3df7f1bdf3d35ec12b74927d03003f8aa3dc6f4ee360302b38bd9f9883a0246f997bba23378c03e8379fb6b3ae13299526142df51df23a53aec9be6f1f990e65adccb750a00c3802dcf210adcb9499cf0897c3dff771ccf8e16ca37c4af844e8d6838e99264456250ca15f

const mapImage = url



//HELPER FUNCTIONS
const fetchData = async (url) => {
    try {
      const response = await fetch(url)
      const data = await response.json()
      return data
    } catch (error) {
      alert(error)
    }
  } 



  //Returns data from API
  fetchData()




  //style input will target "style"

  //location data will tarfet "observer: latitude" "observer: longitude" "observer: date"

  