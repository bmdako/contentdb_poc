/**
* Global variables to hold the profile and email data.
*/
var profile;


function signinCallback(authResult) {
    if (authResult['status']['signed_in']) {
        // Update the app to reflect a signed in user
        // Hide the sign-in button now that the user is authorized, for example:
        gapi.client.load('plus','v1', loadProfile);  // Trigger request to get the email address.
        toggleElement('signinButton');
    } else {
        // Update the app to reflect a signed out user
        // Possible error values:
        //   "user_signed_out" - User is signed-out
        //   "access_denied" - User denied access to your app
        //   "immediate_failed" - Could not automatically log in the user
        console.log('Sign-in state: ' + authResult['error']);
    }
}

/**
* Uses the JavaScript API to request the user's profile, which includes
* their basic information. When the plus.profile.emails.read scope is
* requested, the response will also include the user's primary email address
* and any other email addresses that the user made public.
*/
function loadProfile(){
    var request = gapi.client.plus.people.get( {'userId' : 'me'} );
    request.execute(function(obj){
        profile = obj;
        displayProfile(profile);
    });
}

/**
* Display the user's basic profile information from the profile object.
*/
function displayProfile(profile){
    document.getElementById('name').innerHTML = profile['displayName'];
    //document.getElementById('pic').innerHTML = '<img src="' + profile['image']['url'] + '" />';
    toggleElement('profile');
}

/**
* Utility function to show or hide elements by their IDs.
*/
function toggleElement(id) {
    var el = document.getElementById(id);
    if (el.getAttribute('class') == 'hide') {
        el.setAttribute('class', 'show');
    } else {
        el.setAttribute('class', 'hide');
    }
}

(function() {
    $("#signoutButton").click(function(){
        gapi.auth.signOut();
    });
})();