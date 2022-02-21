import express, { Application } from "express";

export class App {
  public static instance: Application = express();
}
