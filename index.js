require('dotenv').config();
const express = require('express');
const OpenTok = require('opentok');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

const sessions = {};
const port = process.env.PORT || 3000;

if (!apiKey || !apiSecret) {
  throw new Error('Missing API_KEY or API_SECRET');
}

const opentok = new OpenTok(apiKey, apiSecret);

app.use(express.static(__dirname + '/src'));
app.use(bodyParser.json());
app.use(cors());

app.get('/host', (req, res) => {
  res.sendFile(__dirname + '/src/host.html');
});

app.get('/ec', (req, res) => {
  res.sendFile(__dirname + '/src/ec.html');
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

app.post('/render', async (req, res) => {
  try {
    const { sessionId, roomName } = req.body;
    console.log(sessionId);
    if (sessionId && roomName) {
      const data = await createRender(sessionId);
      console.log(data);
      const { id } = data;
      sessions[roomName].renderId = id;
      res.status(200).send({ id });
    } else {
      res.status(500);
    }
  } catch (e) {
    res.status(500).send({ message: e });
  }
});

app.get('/render/stop/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      console.log('trying to stop render ' + id);
      const data = await deleteRender(id);
      console.log(data);
      res.status(200).send(data);
    } else {
      res.status(500);
    }
  } catch (e) {
    res.status(500).send({ message: e });
  }
});

const generateRestToken = () => {
  return new Promise((res, rej) => {
    jwt.sign(
      {
        iss: process.env.API_KEY,
        ist: 'project',
        exp: Date.now() + 200,
        jti: Math.random() * 132,
      },
      process.env.API_SECRET,
      { algorithm: 'HS256' },
      function (err, token) {
        if (token) {
          console.log('\n Received token\n', token);
          res(token);
        } else {
          console.log('\n Unable to fetch token, error:', err);
          rej(err);
        }
      }
    );
  });
};

const createRender = async (sessionId) => {
  try {
    const token = opentok.generateToken(sessionId);
    console.log(token);

    const data = JSON.stringify({
      url: `${process.env.URL_PRODUCTION}/ec?role=experience_composer`,
      sessionId: sessionId,
      token: token,
      projectId: process.env.API_KEY,
      properties: {
        name: 'EC',
      },
    });

    const config = {
      method: 'post',
      url: `https://api.opentok.com/v2/project/${apiKey}/render`,
      headers: {
        'X-OPENTOK-AUTH': await generateRestToken(),
        'Content-Type': 'application/json',
      },
      data: data,
    };

    const response = await axios(config);
    return response.data;
  } catch (e) {
    console.log(e);
    return e;
  }
};

const deleteRender = async (id) => {
  const config = {
    method: 'delete',
    url: `https://api.opentok.com/v2/project/${process.env.API_KEY}/render/${id}`,
    headers: {
      'X-OPENTOK-AUTH': await generateRestToken(),
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (e) {
    console.log(e);
    return e;
  }
};

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
