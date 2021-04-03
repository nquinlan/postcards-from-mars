require('dotenv').config()
const fs = require('fs');
const axios = require("axios").default;
const cheerio = require('cheerio');
const Lob = require('lob')(process.env.LOB_API_KEY);


axios.get("https://mars.nasa.gov/mars2020/multimedia/raw-images/image-of-the-week/")
  .then(function (response) {
    const $ = cheerio.load(response.data);
    const imageofTheWeekUrl = $(".main_iotw a").attr("href");

    console.log(imageofTheWeekUrl, `https://mars.nasa.gov${imageofTheWeekUrl}`);

    return imageofTheWeekUrl;
  }).then(function(imageofTheWeekUrl) {

    return axios.get(`https://mars.nasa.gov${imageofTheWeekUrl}`)
    .then(function (response){
      const $ = cheerio.load(response.data);
      const downloadUrl = $(".rowItem .btnRed").attr("href");
      return downloadUrl;
    })

  }).then(function (downloadUrl) {

    const front = fs.readFileSync("pages/front.html", "utf8");
    const back = fs.readFileSync("pages/back.html", "utf8");

    Lob.postcards.create({
      description: "Postcard from Mars",
      to: {
        name: process.env.name
        address_line1: process.env.address_line1
        address_line2: process.env.address_line2
        address_city: process.env.address_city
        address_state: process.env.address_state
        address_zip: process.env.address_zip
      },
      from: {
        name: process.env.name
        address_line1: process.env.address_line1
        address_line2: process.env.address_line2
        address_city: process.env.address_city
        address_state: process.env.address_state
        address_zip: process.env.address_zip
      },
      front: front,
      back: back,
      merge_variables: {
        url: downloadUrl
      }
    }, function (err, res) {
      console.log(res);
    });

  });