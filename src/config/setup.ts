import * as appInsights from "applicationinsights";
import express from "express";

import { App } from "../app";
import { MSSqlClient } from "../clients/mssql.client";
import { EnvironmentKeys } from "./constants";
import { sessionController } from "../controllers/session.controller";
import { dbInit } from "./db-init";

/** Setup resources for API. */
export const setup = () => {
  checkConfiguration();
  setupAppInsights();
  setupDBConnection();
  registerExpress();
}

/** Ensure required configs are available. */
const checkConfiguration = () => {
  for (const enviromentVariable of Object.values(EnvironmentKeys)) {
    if (!process.env[enviromentVariable]) throw new Error(`Missing environment variable ${enviromentVariable}`);
  }
};

/** Setup for app insights instance. */
const setupAppInsights = () => {
  appInsights.setup()
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(false)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
    .start();
}

/** Setup the database connection. */
const setupDBConnection = () => {
  MSSqlClient.instance.db
    .authenticate()
    .then(() => {
      console.log("DB connection established.");
      dbInit();
    }).catch(error => {
      console.log(`DB setup error: ${error}`);
      throw error;
    });
}

/** Register express middleware and controllers. */
const registerExpress = () => {
  // Express endpoints and middleware
  App.instance.use(express.json());
  App.instance.use(express.urlencoded({extended: true}));

  sessionController();
}
