import {
  MediaWikiTemplate,
  MediaWikiContent,
} from "@osrs-wiki/mediawiki-builder";

import { ObjectLocLineParams } from "./ObjectLocLine.types";
import { Template } from "../templates.types";

/**
 * Creates an {{ObjectLocLine}} template for displaying multiple object spawns in a location table.
 * Extends Map template functionality with location-specific parameters.
 * See: https://oldschool.runescape.wiki/w/Template:ObjectLocLine
 */
export class ObjectLocLineTemplate extends Template {
  params: ObjectLocLineParams;

  constructor(params: ObjectLocLineParams) {
    super("ObjectLocLine");
    this.params = params;
  }

  build(): MediaWikiTemplate {
    const template = new MediaWikiTemplate(this.name);

    // Add ObjectLocLine-specific parameters first
    template.add("name", this.params.name);

    // Handle location as MediaWikiContents
    const locationValue = Array.isArray(this.params.location)
      ? this.params.location.map((content) => content.build()).join("")
      : this.params.location instanceof MediaWikiContent
      ? this.params.location.build()
      : this.params.location;
    template.add("location", locationValue);

    if (this.params.members !== undefined) {
      template.add("members", this.params.members ? "Yes" : "No");
    }

    // Add coordinates using Map template logic
    if (this.params.coordinates !== undefined) {
      const coords = Array.isArray(this.params.coordinates)
        ? this.params.coordinates
        : [this.params.coordinates];

      // Format coordinates as x:1234,y:5678|x:1235,y:5679 etc.
      const coordStr = coords
        .map((coord) => {
          let str = `x:${coord.x},y:${coord.y}`;
          if (coord.plane !== undefined && coord.plane !== 0) {
            str += `,plane:${coord.plane}`;
          }
          return str;
        })
        .join("|");
      template.add("", coordStr);
    } else if (this.params.x !== undefined && this.params.y !== undefined) {
      // Legacy single coordinate format
      const coordStr = `x:${this.params.x},y:${this.params.y}`;
      template.add("", coordStr);
    }

    // Add inherited Map parameters
    if (this.params.mapID !== undefined) {
      template.add("mapID", this.params.mapID.toString());
    }

    if (this.params.mtype !== undefined) {
      template.add("mtype", this.params.mtype);
    }

    if (this.params.spawns !== undefined) {
      template.add("spawns", this.params.spawns);
    }

    if (this.params.width !== undefined) {
      template.add("width", this.params.width.toString());
    }

    if (this.params.height !== undefined) {
      template.add("height", this.params.height.toString());
    }

    if (this.params.zoom !== undefined) {
      template.add("zoom", this.params.zoom.toString());
    }

    if (this.params.label !== undefined) {
      template.add("label", this.params.label);
    }

    if (this.params.link !== undefined) {
      template.add("link", this.params.link);
    }

    if (this.params.description !== undefined) {
      template.add("description", this.params.description);
    }

    return template;
  }
}
