# Experience Composer Sample App

## Introduction

This application show you how to leverage the Experience Composer API to publish a stream containing custom HTML elements, iframe and the video from the publisher with your brand logo overlaid.

## Running the app

You need to setup some environment variables

- Run `npm install` to install dependencies
- Populate a `.env` file as per the `.env.example`
- Run `npm start` to start the server on port 3000
- You have to deploy the server so it is publicly accessible but for debuggibg purposes you can use ngrok.
- Update `SAMPLE_SERVER_BASE_URL` in `src/index.js` and in `src/user.html` with your publicly accessible URL to your server.

## Host

You can navigate to `localhost:3000/host?role=host` to go to the Host view. At that point you can start publishing the Experience composer stream by clicking on the `Start EC` button.

## Guest

You can navigate to `localhost:3000/user` to go to the Guest view. You will start publishing and once the host starts the experience composer you will see the host with the calendar, the overlay and the data table.

## Experience Composer

The Experience Composer stream is added via API call from the server side. Once you issue the API request, the Experience Composer will navigate to your public accessible URL `public_url/ec?role=experience_composer` and will publish a stream with the content on the web applicaiton.
