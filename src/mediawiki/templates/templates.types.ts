import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

export interface InfoboxTemplateOptions {
  collapsed?: boolean;
}

export abstract class Template {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract build(): MediaWikiTemplate;
}