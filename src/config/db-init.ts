import { Session } from "../models/session";

const isDev = process.env.NODE_ENV === 'development';

export const dbInit = () => {
  Session.sync({ alter: isDev });
}
