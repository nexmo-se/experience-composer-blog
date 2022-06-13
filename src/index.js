const queryString = window.location.search;
let SAMPLE_SERVER_BASE_URL = 'https://310a-79-108-84-186.ngrok.io';
const roomName = 'test';
let apiKey;
let sessionId;
let token;
let session;
let renderId;

// Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

function isOriginalLayout() {
  return queryString === '?role=host' && window.location.pathname === '/host';
}

function isExperienceComposer() {
  return (
    queryString === '?role=experience_composer' &&
    window.location.pathname === '/ec'
  );
}

function startExperienceComposer() {
  fetch(`${SAMPLE_SERVER_BASE_URL}/render`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, roomName }),
  })
    .then(function fetch(res) {
      return res.json();
    })
    .then(function fetchJson(json) {
      console.log(json);
      renderId = json.id;
    });
}

function stopExperienceComposer() {
  fetch(`${SAMPLE_SERVER_BASE_URL}/render/stop/${renderId}`).then(
    function fetch(res) {
      // return res.json();
      console.log('stopped experience composer');
    }
  );
  // .then(function fetchJson(json) {
  //   console.log(json);
  //   renderId = json.id;
  // });
}

if (SAMPLE_SERVER_BASE_URL) {
  // Make an Ajax request to get the OpenTok API key, session ID, and token from the server
  fetch(`${SAMPLE_SERVER_BASE_URL}/api/room/${roomName}`)
    .then(function fetch(res) {
      return res.json();
    })
    .then(function fetchJson(json) {
      apiKey = json.apiKey;
      sessionId = json.sessionId;
      token = json.token;

      initializeSession();
    })
    .catch(function catchErr(error) {
      handleError(error);
      alert('Failed to get opentok sessionId and token.');
    });
}

function subscribe(stream) {
  session.subscribe(
    stream,
    isExperienceComposer() ? 'publishero' : 'subscriber',
    {
      // insertMode: 'append',
      width: '100%',
      height: '100%',
    },
    handleError
  );
}

function initializeSession() {
  console.log('init sesssion');
  session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', function (event) {
    console.log(event.stream);
    console.log(isOriginalLayout());

    if (isOriginalLayout() && event.stream.name !== 'EC') {
      subscribe(event.stream);
    }
    if (isExperienceComposer() && event.stream.name === 'singlePublisher') {
      subscribe(event.stream);
    }
  });

  // Connect to the session
  session.connect(token, function (error) {
    // If the connection is successful, initialize a publisher and publish to the session
    if (error) {
      handleError(error);
    } else {
      if (isOriginalLayout()) {
        const publisher = OT.initPublisher(
          'publishero',
          {
            width: '100%',
            height: '100%',
            name: 'singlePublisher',
          },
          handleError
        );
        publish(publisher);
      }
    }
  });
}

function publish(publisher) {
  session.publish(publisher, handleError);
}
