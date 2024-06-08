const clientId = "461e4fcbe3a9429da63a82bf5b1b06ed"; // App ID
const dataType = document.getElementById("data-type").value;
const dataTime = document.getElementById("data-time").value;

const accessTokenStorage = []

const params = new URLSearchParams(window.location.search);
// console.log("Params are: " + params)

const code = params.get("code");
// console.log("Code is: " + code)


document.getElementById("data-submit").addEventListener("click", async (e) => {
    e.preventDefault();
    // return result.json();
    
    if (accessTokenStorage[0]) {
        document.getElementById("artist-image").innerHTML=''
        document.getElementById("album-image").innerHTML=''
        document.getElementById("artist-name").innerHTML=''
        document.getElementById("track-name").innerHTML=''
        document.getElementById("track-artist").innerHTML=''

        // ^Clears the previous images from their respective spans.
        
        // console.log(accessTokenStorage[0]);
        const TopData = await fetchTopData(accessTokenStorage[0]);
        // console.log(dynamicTopData);

        populateUI(TopData)
    }
    else if (!code) {
        redirectToAuthCodeFlow(clientId);
    } else {
        const accessToken = await getAccessToken(clientId, code);
        // console.log("Access token is: " + accessToken);
        accessTokenStorage.push(accessToken);
        // console.log(accessTokenStorage);
        const topData = await fetchTopData(accessToken);
        // console.log("Top Data is: " + topData);
        populateUI(topData);
    }
});

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:4090/callback");
    params.append("scope", "user-top-read");
    // ^^This code sets the scope of permissions the user will grant the app.
    // This scope in particular is just to read the user's top items (Songs, artists, etc.).
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);
    // console.log(params);
    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:4090/callback");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    // console.log("hit");
    // console.log(localStorage.getItem('refresh_token'));
    console.log("Access Token Creation: " + access_token);
    return access_token;
}

async function fetchTopData(token) {
    
    const result = await fetch(`https://api.spotify.com/v1/me/top/${document.getElementById("data-type").value}?time_range=${document.getElementById("data-time").value}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

function populateUI(topData) {
    if (document.getElementById("data-type").value === "artists") {
        const artistImage = new Image(200, 200);
        artistImage.src = topData.items[0].images[0].url;
        document.getElementById("artist-image").appendChild(artistImage);
        document.getElementById("artist-name").innerText = topData.items[0].name;
    } else if (document.getElementById("data-type").value === "tracks") {
        const albumImage = new Image(200, 200);
        albumImage.src = topData.items[0].album.images[0].url;
        document.getElementById("album-image").appendChild(albumImage);
        document.getElementById("track-artist").innerText = topData.items[0].artists[0].name;
        document.getElementById("track-name").innerText = topData.items[0].name;
    }
}