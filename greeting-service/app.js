/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
'use strict';
const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const probe = require('kube-probe');
const nameService = require('./lib/name-service-client');

const app = express();
const server = http.createServer(app);

// Add basic health check endpoints
probe(app);

const nameServiceHost = process.env.NAME_SERVICE_HOST || 'http://nodejs-istio-security-redhat-name:8080';

// Serve index.html from the file system
app.use(express.static(path.join(__dirname, 'public')));
// Expose the license.html at http[s]://[host]:[port]/licences/licenses.html
app.use('/licenses', express.static(path.join(__dirname, 'licenses')));

// Send and receive json
app.use(bodyParser.json());

// Greeting API
app.get('/api/greeting', (request, response) => {
  nameService(`${nameServiceHost}/api/name`).then(name => {
    response.send({content: `Hello, ${name}`});
  }).catch(err => {
    response.status(500);
    response.send(`Failed to communicate with 'nodejs-istio-security-redhat-name' due to: ${err}`);
  });
});

module.exports = server;
