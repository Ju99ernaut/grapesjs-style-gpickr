import loadColorLinear from "./styleColor";

const typeBgKey = "__bg-type";

const bgTypeStyle =
  'style="max-height: 16px; display: block" viewBox="0 0 24 24"';

const typeBg = {
  name: " ",
  property: typeBgKey,
  type: "radio",
  defaults: "img",
  options: [
    {
      value: "img",
      name: `<svg ${bgTypeStyle}><path fill="currentColor" d="M8.5 13.5l2.5 3 3.5-4.5 4.5 6H5m16 1V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z"/></svg>`,
    },
    {
      value: "color",
      name: `<svg ${bgTypeStyle}><path fill="currentColor" d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/></svg>`,
    },
    {
      value: "grad",
      name: `<svg ${bgTypeStyle}><path fill="currentColor" d="M11 9h2v2h-2V9m-2 2h2v2H9v-2m4 0h2v2h-2v-2m2-2h2v2h-2V9M7 9h2v2H7V9m12-6H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2M9 18H7v-2h2v2m4 0h-2v-2h2v2m4 0h-2v-2h2v2m2-7h-2v2h2v2h-2v-2h-2v2h-2v-2h-2v2H9v-2H7v2H5v-2h2v-2H5V5h14v6z"/></svg>`,
    },
  ],
};

const typeImage = {
  name: " ",
  property: "background-image",
  type: "file",
  functionName: "url",
  defaults: "none",
  value: "none",
};

const typeBgRepeat = {
  property: "background-repeat",
  type: "select",
  defaults: "repeat",
  value: "repeat",
  options: [
    { value: "repeat" },
    { value: "repeat-x" },
    { value: "repeat-y" },
    { value: "no-repeat" },
  ],
};

const typeBgPos = {
  property: "background-position",
  type: "select",
  defaults: "left top",
  value: "left top",
  options: [
    { value: "left top" },
    { value: "left center" },
    { value: "left bottom" },
    { value: "right top" },
    { value: "right center" },
    { value: "right bottom" },
    { value: "center top" },
    { value: "center center" },
    { value: "center bottom" },
  ],
};

const typeBgAttach = {
  property: "background-attachment",
  type: "select",
  defaults: "scroll",
  value: "scroll",
  options: [{ value: "scroll" }, { value: "fixed" }, { value: "local" }],
};

const typeBgSize = {
  property: "background-size",
  type: "select",
  defaults: "auto",
  value: "auto",
  options: [{ value: "auto" }, { value: "cover" }, { value: "contain" }],
};

// Linear color

const typeColorLin = {
  name: " ",
  property: "background-image",
  type: "color-linear",
  defaults: "none",
  value: "none",
  full: 1,
};

// Gradient type

const typeGradient = {
  name: "&nbsp;",
  property: "background-image",
  type: "gpickr",
  value:
    "linear-gradient(270deg, rgba(66, 68, 90, 1) 0%,rgba(32, 182, 221, 1) 100%)",
  defaults: "none",
  full: 1,
};

export default (editor, opts = {}) => {
  const options = {
    ...{
      // Options for the `grapesjs-style-gradient` plugin
      styleGradientOpts: {},

      // Extend single style property definition of the plugin.
      // You can this, for example, to change the defauld gradient color
      propExtender: (p) => p,

      // Use this function to change/add/extend style properties for each BG type
      typeProps: (p) => p,
    },
    ...opts,
  };

  let styleTypes = {
    typeBg,
    typeImage,
    typeBgRepeat,
    typeBgPos,
    typeBgAttach,
    typeBgSize,
    typeColorLin,
    typeGradient,
  };
  const sm = editor.StyleManager;
  const stack = sm.getType("stack");
  const propModel = stack.model;
  styleTypes = Object.keys(styleTypes).reduce((acc, item) => {
    const prop = styleTypes[item];
    acc[item] = options.propExtender(prop) || prop;
    return acc;
  }, {});
  const toConf = (obj, key) =>
    obj && obj[key] ? { value: obj[key] } : undefined;
  const getPropsByType = (type, values) => {
    let result = [
      { ...typeImage, ...toConf(values, "background-image") },
      { ...typeBgRepeat, ...toConf(values, "background-repeat") },
      { ...typeBgPos, ...toConf(values, "background-position") },
      { ...typeBgAttach, ...toConf(values, "background-attachment") },
      { ...typeBgSize, ...toConf(values, "background-size") },
    ];

    switch (type) {
      case "color":
        result = [{ ...typeColorLin, ...toConf(values, "background-image") }];
        break;
      case "grad":
        result = [{ ...typeGradient, ...toConf(values, "background-image") }];
        break;
    }

    return options.typeProps(result, type) || result;
  };

  loadColorLinear(editor, sm);
  sm.addType("bg", {
    model: propModel.extend({
      defaults: () => ({
        ...propModel.prototype.defaults,
        detached: 1,
        preview: 1,
        full: 1,
        prepend: 1,
        properties: [styleTypes.typeBg, ...getPropsByType()],
      }),

      init() {
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.on("change:selectedLayer", this.onNewLayerAdd);
      },

      _updateLayerProps(layer, type) {
        const props = layer.collection.properties;
        props.remove(props.filter((it, id) => id !== 0));
        getPropsByType(type, layer.getValues()).forEach((item) =>
          props.push(item)
        );
      },

      /**
       * On new added layer we should listen to filter_type change
       */
      onNewLayerAdd() {
        const layer = this.getSelectedLayer();
        if (layer?.getValues) {
          const typeProp = layer.collection.properties.at(0);
          const vals = layer.getValues();
          this.handleTypeChange(typeProp, vals[typeBgKey], {});
          layer.listenTo(typeProp, "change:value", this.handleTypeChange);
        }
      },

      handleTypeChange(propType, type, opts) {
        const currLayer = this.getSelectedLayer();
        currLayer && this._updateLayerProps(currLayer, type);
        opts.fromInput && this.trigger("updateValue");
      },

      __parseValue(val) {
        const res = this.parseValue(val);
        res.__layers = val
          .split(/,(?![^\(]*\)|rgb| rgb)/)
          .map((v) => v.trim())
          .map((v) => this.__parseLayer(v))
          .filter(Boolean);

        return res;
      },

      __parseLayer(val) {
        let col = false;
        const img = val.indexOf("url") > -1 || val.indexOf("none") > -1;
        const values = img ? val.split(" ") : [val];
        if (!img) {
          const st = val.indexOf("(") + 1;
          const end = val.lastIndexOf(")");
          const colors = val.substring(st, end).split(",");
          col = colors.length === 2 && colors[0].trim() === colors[1].trim();
        }
        return {
          [typeBgKey]: img ? "img" : col ? "color" : "grad",
          "background-image": values[0] || "none",
          "background-repeat": values[5] || "repeat",
          "background-size": values[4] || "auto",
          "background-position":
            values[1] && values[2] ? `${values[1]} ${values[2]}` : "left top",
          "background-attachment": values[6] || "scroll",
        };
      },

      getStyleFromLayer(layer) {
        const join = this.__getJoin();
        const joinLayers = this.__getJoinLayers();
        const toStyle = this.get("toStyle");
        const name = this.getName();
        const values = layer.getValues();
        let style;

        if (toStyle) {
          delete values[typeBgKey];
          style = toStyle(values, {
            join,
            joinLayers,
            name,
            layer,
            property: this,
          });
        } else {
          let result;
          let value;
          switch (values[typeBgKey]) {
            case "img":
              value = `${values["background-image"] || "none"} ${
                values["background-position"] || "left top"
              } / ${values["background-size"] || "auto"} ${
                values["background-repeat"] || "repeat"
              } ${values["background-attachment"] || "scroll"}`;
              result = [{ name, value }];
              break;
            case "color":
              value = values["background-image"] || "none";
              result = [{ name, value }];
              break;
            case "grad":
              value = values["background-image"] || "none";
              result = [{ name, value }];
              break;
          }
          style = this.isDetached()
            ? result.reduce((acc, item) => {
                acc[item.name] = item.value;
                return acc;
              }, {})
            : {
                [this.getName()]: result.map((r) => r.value).join(join),
              };
        }
        return style;
      },
    }),
    view: stack.view,
  });

  sm.addBuiltIn("background", {
    id: "background-bg",
    property: "background",
    type: "bg",
    detached: false,
  });
};
