const API_KEY = 'dbfeed18'; 
const BASE_URL = 'http://www.omdbapi.com/';

document.getElementById('search-button').addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    const year = document.getElementById('year-input').value;
    const results = await fetchMovies(query, year);
    const detailedResults = await fetchMovieDetails(results);
    const sortedResults = sortResults(detailedResults);
    displayResults(sortedResults);
});

document.getElementById('sort-select').addEventListener('change', () => {
    const resultsContainer = document.getElementById('results');
    const movieElements = Array.from(resultsContainer.children);
    const sortedResults = sortResults(movieElements.map(movieElement => ({
        Title: movieElement.querySelector('h2').textContent,
        Year: movieElement.querySelector('.release-date').textContent,
        Plot: movieElement.querySelector('.overview').textContent,
        imdbRating: movieElement.querySelector('.rating').textContent,
        Director: movieElement.querySelector('.director').textContent,
        Actors: movieElement.querySelector('.actors').textContent
    })));
    displayResults(sortedResults);
});

async function fetchMovies(query, year) {
    try {
        let url = `${BASE_URL}?apikey=${API_KEY}&type=movie`;
        if (query) {
            url += `&s=${encodeURIComponent(query)}`;
        }
        if (year) {
            url += `&y=${year}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        // Ensure at least 5 results
        let results = data.Search.slice(0, 5);
        if (results.length < 5) {
            const additionalResults = await fetchAdditionalResults(query, year, 5 - results.length);
            results = results.concat(additionalResults);
        }

        return results;
    } catch (error) {
        console.error("Error fetching movies: ", error);
        return [];
    }
}

async function fetchAdditionalResults(query, year, count) {
    try {
        let url = `${BASE_URL}?apikey=${API_KEY}&type=movie&s=${encodeURIComponent(query)}&page=2`;
        if (year) {
            url += `&y=${year}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        return data.Search.slice(0, count);
    } catch (error) {
        console.error("Error fetching additional movies: ", error);
        return [];
    }
}

async function fetchMovieDetails(movies) {
    try {
        const detailedMovies = await Promise.all(movies.map(async (movie) => {
            const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${movie.imdbID}`);
            const data = await response.json();
            return {
                Title: data.Title,
                Year: data.Year,
                Plot: data.Plot,
                imdbRating: data.imdbRating,
                Director: data.Director,
                Actors: data.Actors
            };
        }));
        return detailedMovies;
    } catch (error) {
        console.error("Error fetching movie details: ", error);
        return [];
    }
}

function sortResults(movies) {
    const sortBy = document.getElementById('sort-select').value;
    if (sortBy === 'year') {
        return movies.sort((a, b) => new Date(b.Year) - new Date(a.Year));
    } else if (sortBy === 'rating') {
        return movies.sort((a, b) => b.imdbRating - a.imdbRating);
    }
    return movies;
}

function displayResults(movies) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');
        movieElement.innerHTML = `
            <h2>${movie.Title}</h2>
            <p class="release-date">Year: ${movie.Year}</p>
            <p class="overview">Plot: ${movie.Plot}</p>
            <p class="rating">Rating: ${movie.imdbRating}</p>
            <p class="director">Director: ${movie.Director}</p>
            <p class="actors">Cast: ${movie.Actors}</p>
        `;
        resultsContainer.appendChild(movieElement);
    });
}
