import streamDeck from "@elgato/streamdeck";
import { HeadphoneBattery } from "./actions/headphone-battery";

streamDeck.logger.setLevel("info");
streamDeck.actions.registerAction(new HeadphoneBattery());
streamDeck.connect();
