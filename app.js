const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const config = require("./config");

const app = express();

let cityList = [];
let message = "";

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(process.env.PORT || 3000, function () {
  let port = process.env.PORT || 3000;
  console.log(`Server is running on port ${port}`);
});

app.get("/", function (req, res) {
  if (cityList.length !== 0) {
    for (let index in cityList) {
      const query = cityList[index].cityName;
      const apiKey = config.MY_API_KEY;
      const units = "metric";
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=${units}`;

      https.get(url, function (apiRes) {
        if (apiRes.statusCode === 404 || apiRes.statusCode === 400) {
          res.redirect("/page-not-found");
        } else {
          apiRes.on("data", function (data) {
            const weatherData = JSON.parse(data);
            const temp = weatherData.main.temp;
            const icon = weatherData.weather[0].icon;
            const countryID = weatherData.sys.country;
            const description = weatherData.weather[0].description;
            const imageURL =
              "http://openweathermap.org/img/wn/" + icon + "@2x.png";

            let weatherObject = {
              cityName: weatherData.name,
              temp: temp,
              icon: imageURL,
              description: description,
              countryID: countryID,
            };

            cityList[index] = weatherObject;
          });
        }
      });
    }
    res.render("weather", {
      cityList: cityList,
      message: message,
    });
    message = "";
  }
  res.render("weather", { cityList: cityList, message: "" });
});

app.get("/page-not-found", function (req, res) {
  res.render("error");
});

app.post("/", function (req, res) {
  const query = req.body.cityName;
  const apiKey = config.MY_API_KEY;
  const units = "metric";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=${units}`;

  https.get(url, function (apiRes) {
    console.log(apiRes.statusCode);
    if (apiRes.statusCode === 404 || apiRes.statusCode === 400) {
      res.redirect("/page-not-found");
    } else {
      apiRes.on("data", function (data) {
        const weatherData = JSON.parse(data);
        const temp = weatherData.main.temp;
        const icon = weatherData.weather[0].icon;
        const countryID = weatherData.sys.country;
        const description = weatherData.weather[0].description;
        const imageURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png";

        let weatherObject = {
          cityName: weatherData.name,
          temp: temp,
          icon: imageURL,
          description: description,
          countryID: countryID,
        };

        if (cityList.length === 0) {
          cityList.push(weatherObject);
        } else {
          if (
            cityList.some(
              (city) =>
                city.cityName === weatherObject.cityName &&
                city.countryID === weatherObject.countryID
            )
          ) {
            message = `You've already requested for ${query}`;
          } else {
            cityList.push(weatherObject);
          }
        }

        res.render("weather", {
          cityList: cityList,
          message: message,
        });
        message = "";
      });
    }
  });
});

app.post("/page-not-found", function (req, res) {
  res.redirect("/");
});
