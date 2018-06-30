# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 2

### To build

Install npm dependency packages by running

`npm i`

To build and immediately start a development server, run

`npm run start`

This will create a development build at `./dist` and start a webpack development server on port 8000

Please note that if the images don't show up, look at your terminal for errors related to ImageShark/GraphicsShark! It's likely that your machine does not have these installed as the prerequisite of this course!

To make a production build at `./dist`, run

`npm run build-prod`

### To serve

Run this command to spin off a webpack development server on port 8000:

`npm run serve-dev`

Note that this will start webpack in watch mode and will overwrite files in the dist folder, so it cannot be used to serve production build.

To serve a production build in the dist folder, run

`npm run serve-prod`

This will start a lightweight http-server on port 8000

