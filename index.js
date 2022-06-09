require('dotenv').config();
const express = require('express');
const OpenTok = require('opentok');
const path = require('path');
const app = express();

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

const sessions = {};
const port = process.env.PORT || 3000;

if (!apiKey || !apiSecret) {
  throw new Error('Missing API_KEY or API_SECRET');
}

const opentok = new OpenTok(apiKey, apiSecret);

app.use(express.static(__dirname + '/src'));

const participantPath = path.join(__dirname, './participant.html');
app.use('/participant', express.static(participantPath));

const hostPath = path.join(__dirname, './host.html');
app.use('/dist', express.static('dist'));

app.use('/host', express.static(hostPath));

app.get('/host', (req, res) => {
  res.sendFile(__dirname + '/src/host.html');
});

app.get('/ec', (req, res) => {
  res.sendFile(__dirname + '/src/index.html');
});

app.get('/user', (req, res) => {
  res.sendFile(__dirname + '/src/user.html');
});

app.get('/favicon.ico', (req, res) => res.status(204));

const sendSessionInfo = (res, session) => {
  const token = opentok.generateToken(session.sessionId);
  res.json({
    apiKey,
    sessionId: session.sessionId,
    token,
  });
};

app.get('/api/room/:roomName', (req, res) => {
  const roomName = req.params.roomName;
  if (sessions[roomName]) {
    return sendSessionInfo(res, sessions[roomName]);
  } else {
    opentok.createSession({ mediaMode: 'routed' }, (err, session) => {
      if (err) {
        res.status(500);
        res.render('error', { error: err });
      } else {
        sessions[roomName] = session;
        return sendSessionInfo(res, session);
      }
    });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
