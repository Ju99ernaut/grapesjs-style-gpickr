export default (editor, opts = {}) => {
  const options = {
    ...{
      gpickrOpts: {},
    },
    ...opts,
  };

  const { $ } = editor;
  const gpickrEl = $(
    `<div class="gp" style="display:none"><div class="gpickr"></div></div>`
  );
  $("body").append(gpickrEl);
  const gp = new GPickr({
    el: ".gpickr",
    stops: [],
    ...options.gpickrOpts,
  });
  gp.on(
    "change",
    (pckr) => pckr.model && pckr.model.setValueFromInput(pckr.getGradient())
  );
  window.pckr = gp;

  const el = gpickrEl.find(".gpickr").get(0);

  const sm = editor.StyleManager;

  sm.addType("gpickr", {
    view: {
      events: {},

      templateInput() {
        return ``;
      },

      onRender() {
        const { ppfx, model } = this;
        let value = this.model.getValue();
        if (value && value !== "none") {
          pckr.setGradient(value);
        }
        // set instance model
        pckr.model = model;
        const fields = this.el.querySelector(`.${ppfx}fields`);
        fields.appendChild(el);
      },

      destroy() {
        //const { be } = this;
        //be && be.destroy();
      },
    },
  });
};
