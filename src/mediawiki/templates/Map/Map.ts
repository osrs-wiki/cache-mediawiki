import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import { MapParams } from "./Map.types";
import { Template } from "../templates.types";

/**
 * Creates a {{Map}} template for displaying a single location on a map.
 * See: https://oldschool.runescape.wiki/w/Template:Map
 */
export class MapTemplate extends Template {
  params: MapParams;

  constructor(params: MapParams) {
    super("Map");
    this.params = params;
  }

  build(): MediaWikiTemplate {
    const template = new MediaWikiTemplate(this.name, { collapsed: true });

    // Add parameters in the order they appear in the template documentation
    if (this.params.name !== undefined) {
      template.add("name", this.params.name);
    }

    // Handle coordinates - support multiple formats
    if (this.params.coordinates !== undefined) {
      const coords = Array.isArray(this.params.coordinates)
        ? this.params.coordinates
        : [this.params.coordinates];

      if (coords.length === 1) {
        // Single coordinate: use x= and y= format
        template.add("x", coords[0].x.toString());
        template.add("y", coords[0].y.toString());
        if (coords[0].plane !== undefined) {
          template.add("plane", coords[0].plane.toString());
        }
      } else {
        // Multiple coordinates: use x:1234,y:5678|x:6789,y:1123 format
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
      }
    } else if (this.params.x !== undefined && this.params.y !== undefined) {
      // Legacy format support
      template.add("x", this.params.x.toString());
      template.add("y", this.params.y.toString());
      if (this.params.plane !== undefined) {
        template.add("plane", this.params.plane.toString());
      }
    }

    if (this.params.mapID !== undefined) {
      template.add("mapID", this.params.mapID.toString());
    }

    if (this.params.mtype !== undefined) {
      template.add("mtype", this.params.mtype);
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
