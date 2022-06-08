// replace these values with those generated in your Video API account

const queryString = window.location.search;
console.log(queryString);
let basicUrl = 'http://localhost:3000';

const apiKey = '47396501';
const sessionId =
  '1_MX40NzM5NjUwMX5-MTY1NDYwODc1NTExMn5xUkN3cUlxNjBrMXFuMkJnVTV5V1V4cy9-fg';
let token;
if (queryString === '?role=doctor') {
  token =
    'T1==cGFydG5lcl9pZD00NzM5NjUwMSZzaWc9Nzc2MzczNWE0MzlmOTMwZDY3ZTJkMzgyODFhNDA5MzM5ZmFiZGI4MDpzZXNzaW9uX2lkPTFfTVg0ME56TTVOalV3TVg1LU1UWTFORFl3T0RjMU5URXhNbjV4VWtOM2NVbHhOakJyTVhGdU1rSm5WVFY1VjFWNGN5OS1mZyZjcmVhdGVfdGltZT0xNjU0NjA4NzY0Jm5vbmNlPTAuNTA0NzM5NzE4NjY2NzI5MyZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNjU3MjAwNzYzJmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9';
} else {
  token =
    'T1==cGFydG5lcl9pZD00NzM5NjUwMSZzaWc9ZjJjYWU1ZTdhZTI3MTczYmM3ZDQxMTA2MTQ5MWM5Zjc3ZDQ4OWUwNTpzZXNzaW9uX2lkPTFfTVg0ME56TTVOalV3TVg1LU1UWTFORFl3T0RjMU5URXhNbjV4VWtOM2NVbHhOakJyTVhGdU1rSm5WVFY1VjFWNGN5OS1mZyZjcmVhdGVfdGltZT0xNjU0NjE5MDI2Jm5vbmNlPTAuMjU5ODMyOTkzOTIwMDgwOTcmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTY1NTIyMzgyNCZjb25uZWN0aW9uX2RhdGE9ZXhwZXJpZW5jZV9jb21wb3NlciZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ==';
}
let session;
// Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

function isOriginalLayout() {
  return queryString === '?role=doctor';
}

function isExperienceComposer() {
  return queryString === '?role=experience_composer';
}

//experience composer needs to get his own credentials rather than connection using thee ones

// (optional) add server code here
initializeSession();

async function getCredentials(role = 'admin') {
  try {
    const url = `/api/room/${roomName}?role=${role}`;
    const config = {};
    const response = await fetch(`${basicUrl}${url}`, config);
    const data = await response.json();
    console.log(data);
    if (data.apiKey && data.sessionId && data.token) {
      return Promise.resolve(data);
    }
  } catch (error) {
    console.log(error.message);
    return Promise.reject(error);
  }
}

function subscribe(stream) {
  session.subscribe(
    stream,
    isExperienceComposer() ? 'publishero' : undefined,
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
    console.log(event);
    console.log(isOriginalLayout(), event.stream.name);
    // if (event.stream.name !== 'singlePublisher') {

    if (isOriginalLayout() && event.stream.name !== 'EC') {
      subscribe(event.stream);
    }
    if (isExperienceComposer() && event.stream.name === 'singlePublisher') {
      subscribe(event.stream);
    }
  });

  // Create a publisher

  // Connect to the session
  session.connect(token, function (error) {
    // If the connection is successful, initialize a publisher and publish to the session
    if (error) {
      handleError(error);
    } else {
      if (queryString !== '?role=doctor') {
        return;
      } else {
        const publisher = OT.initPublisher(
          'publishero',
          {
            //   insertMode: 'replace',
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
