const config = require("../config/auth").googleAuth;

const developerKey = config.developerKey;
const clientId = config.clientID;
const scope = ['https://www.googleapis.com/auth/drive.readonly'];
const pickerApiLoaded = false;
let oauthToken;
const google = {
  picker: {
    ViewId: {
      DOCS: "all",
      DOCS_IMAGES: "docs-images",
      DOCS_IMAGES_AND_VIDEOS: "docs-images-and-videos",
      DOCS_VIDEOS: "docs-videos",
      DOCUMENTS: "documents",
      DRAWINGS: "drawings",
      FOLDERS: "folders",
      FORMS: "forms",
      IMAGE_SEARCH: "image-search",
      MAPS: "maps",
      PDFS: "pdfs",
      PHOTOS: "photos",
      PHOTO_ALBUMS: "photo-albums",
      PHOTO_UPLOAD: "photo-upload",
      PRESENTATIONS: "presentations",
      RECENTLY_PICKED: "recently-picked",
      SPREADSHEETS: "spreadsheets",
      VIDEO_SEARCH: "video-search",
      WEBCAM: "webcam",
      YOUTUBE: "youtube"
    }
  }
};

// Use the API Loader script to load google.picker and gapi.auth.
function onApiLoad() {
  gapi.load('auth', {'callback': onAuthApiLoad});
  gapi.load('picker', {'callback': onPickerApiLoad});
}

function onAuthApiLoad() {
  window.gapi.auth.authorize(
    {
      'client_id': clientId,
      'scope': scope,
      'immediate': false
    },
    handleAuthResult);
}

function onPickerApiLoad() {
  pickerApiLoaded = true;
  createPicker();
}

function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    oauthToken = authResult.access_token;
    createPicker();
  }
}

// Create and render a Picker object for picking user Photos.
function createPicker() {
  if (pickerApiLoaded && oauthToken) {
    var docsView = new google.picker.DocsView(view);
    docsView.setIncludeFolders(true);
    docsView.setMode(google.picker.DocsViewMode.LIST);

    var picker = new google.picker.PickerBuilder()
      .addView(docsView)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(developerKey)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  }
}

// A simple callback implementation.
