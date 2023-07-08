const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const axios = require('axios');
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
const port = 8889;

/*
    This function pulls data from the POTA API.
    It searches through a range of Park ID's and
    finds parks that are in CA-ON and have never been activated.
    The program will crash if the range is too large.
 */
async function POTA_API() {
    const start_range = 0;
    const end_range = 1000;
    let spots = []

    //Iterates over a range of Park ID's
    for(let park_num_id = start_range; park_num_id<=end_range; i++){
        //Turns Park ID int into a string
        let park_id = park_num_id.toString();
        //While park ID int length is less than 4 add 0's to the front to make the length 4
        //This is a requirement of the POTA API to have the park ID having the format 0000
        while(park_id.length < 4){
            park_id = '0'+park_id;
        }
        //Pulls park info from the POTA API
        const api_data = await axios.get('https://api.pota.app/park/VE-'+park_id);
        //If the park exists
        if(api_data.data != null) {
            //Check that it is in Ontario and is active
            if (api_data.data.locationDesc == "CA-ON" && api_data.data.active == 1) {
                //Check that the park has not been activated
                if (typeof api_data.data.firstActivationDate == 'undefined') {
                    //Push the park data to an array
                    spots.push(api_data.data);
                }
            }
        }
    }
    //Returns data from the POTA API
    return spots;
}
/*
    Displays a JSON file generated from the POTA_API() function
 */
app.get('/json', async (req, res) => {
    let json = require('./CA-ON_never_activated.json');
    const json_data =  JSON.stringify(json);
    res.end(json_data);
});
/*
    This function grabs data from the generated JSON file and passes it to the frontend
 */
app.get('/', async (req, res) => {        //get requests to the root ("/") will route here
    const spots = require('./CA-ON_never_activated.json');
    res.render('index', { places:spots });
});
app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`);
});
