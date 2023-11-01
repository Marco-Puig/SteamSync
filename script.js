const { JSDOM } = require('jsdom');
const { window } = new JSDOM();
const Parse = require('parse/node');
// Now you can use the window object
global.window = window;

// Initialize Parse
window.onload = function() {
  Parse.initialize("QD3o4wcV8jOu1DrPizbXjzTg7tuNZPGoVKyP7RwR", "mad7NPqDFXX0PlkRSITENXZJk2eYzsPcN2Urygoi");
  Parse.serverURL = "https://parseapi.back4app.com/";

  // Steam Web API Key
  const steamApiKey = "E4ABF7871264272AD62B7798CCF512DC";

  // Redirect to Steam login page
  function redirectToSteamLogin() {
    const currentUrl = encodeURIComponent(window.location.href);
    const steamLoginUrl = `https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${currentUrl}&openid.realm=${currentUrl}&openid.ns.sreg=http://openid.net/extensions/sreg/1.1&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.mode=checkid_setup&openid.ns.ax=http://openid.net/srv/ax/1.0&openid.ax.mode=fetch_request&openid.ax.type.email=http://axschema.org/contact/email&openid.ax.required=email&openid.ax.type.firstname=http://axschema.org/namePerson/first&openid.ax.required=firstname&openid.ax.type.lastname=http://axschema.org/namePerson/last&openid.ax.required=lastname`;
    window.location.href = steamLoginUrl;
  }

  // Handle the Steam login response
  async function handleSteamLoginResponse() {
    const params = new URLSearchParams(window.location.search);
    const steamOpenId = params.get('openid.identity');
    if (!steamOpenId) {
      // Handle the error
      console.error('Steam OpenID not found in the response.');
      return;
    }
    const steamId = steamOpenId.split('/').pop();
    try {
      const response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data from Steam API.');
      }
      const data = await response.json();
      const steamUsername = data.response.players[0].personaname;

      // Use the Steam username to create a new user
      const user = new Parse.User();
      user.set('username', steamUsername);
      user.set('password', 'aDefaultPassword'); // Set a default password for Steam users
      try {
        const newUser = await user.signUp();
        alert(`User logged in successfully: ${newUser.get('username')}`);
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  window.addEventListener('DOMContentLoaded', (event) => {
    // Your code that interacts with the DOM here
    document.getElementById('loginButton').addEventListener('click', redirectToSteamLogin);
});

  // Check if the URL contains Steam login response parameters
  if (window.location.search.includes('openid.identity')) {
    handleSteamLoginResponse();
  }
};
