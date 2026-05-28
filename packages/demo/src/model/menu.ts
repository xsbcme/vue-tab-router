import { StringUtil } from "@/utils";

interface IMenuProps extends Record<string, any> {
  _viewSingle?: boolean;
  _viewNoCache?: boolean;
  _outside?: boolean;
  _outsideProps?: {
    target?: string;
    features?: string;
  };
}

export class Menu {
  id?: string;
  name?: string;
  url?: string;
  icon?: string;
  props?: IMenuProps | string;
  children?: Menu[];

  constructor(options?: Partial<Menu>) {
    Object.assign(this, options);
    if (Array.isArray(options?.children)) {
      this.children = options.children.map(item => new Menu(item));
    }
  }

  getUUID?() {
    if (this.id) {
      return this.id;
    }
    if (!this.url) {
      return StringUtil.uuid();
    }
    if (typeof this.props === "string") {
      return this.url + "#" + this.props;
    } else {
      return this.url + "#" + (this.props ? JSON.stringify(this.props) : "");
    }
  }
}
