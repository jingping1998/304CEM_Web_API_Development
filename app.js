const express = require('express');
const app = express();
const axios = require('axios');
const Movie = require('./connect');
const path = require('path'); //---heroku---
const apikey = '16c7f353';

const port = process.env.PORT || 5000;

//--- heroku ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

//localhost:5000/getmovie?title=MovieTitle
app.get('/getmovie', (req, res) => {
  const title = req.query.title;
  const querystr = `http://www.omdbapi.com/?t=${title}&apikey=${apikey}`;
  console.log(querystr);

  axios
    .get(querystr)
    .then(response => {
      const movie = new Movie({
        title: response.data.Title,
        year: response.data.Year,
        genre: response.data.Genre,
        actors: response.data.Actors,
        plot: response.data.Plot,
        poster: response.data.Poster
      });
      if (!movie.title) {
        res.status(200).json('Not found');
        return;
      }
      movie
        .save()
        .then(response => {
          res.status(200).json(response);
        })
        .catch(error => {
          res.status(400).json(error);
        });
    })
    .catch(error => {
      res.status(400).json(error);
    });
});

//localhost:5000/getallmovies
app.get('/getallmovies', (req, res) => {
  Movie.find({})
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(400).send(error);
    });
});

//localhost:5000/deletemovie?title=MovieTitle
app.get('/deletemovie', (req, res) => {
  Movie.deleteMany({ title: req.query.title })
    .then(response => {
      res.status(200).json(response);
    })
    .catch(error => {
      res.status(400).json(error);
    });
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
