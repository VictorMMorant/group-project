# group-project
CLIENT // node lbclient.js tcp://localhost:8010 welcome
BROKER // node lbbroker.js 8010 8011 8012
Worker 1 // node lbworker.js tcp://localhost:8011 false localhost 8013
Worker 2 // node lbworker.js tcp://localhost:8011 false localhost 8014