export default (editor, sm) => {
  const typeColor = sm.getType("color");
  const propModel = typeColor.model;

  sm.addType("color-linear", {
    model: propModel.extend({
      __getFullValue() {
        const value = this.get("value");
        const def = this.get("defaults");
        return value
          ? value === def
            ? def
            : `linear-gradient(${value},${value})`
          : "";
      },
    }),
    view: typeColor.view.extend({
      onRender() {
        typeColor.view.prototype.onRender.apply(this, arguments);
        let val = this.model.getValue();
        const defVal = this.model.getDefaultValue();
        val = val || defVal;
        if (val && val !== "none") {
          const st = val.indexOf("(") + 1;
          const end = val.lastIndexOf(")");
          const colors = val.substring(st, end).split(",");
          console.log(colors[0].trim());
          this.setValue(colors[0].trim());
        }
      },
    }),
  });
};
