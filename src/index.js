import styleBg from "./styleBg";
import styleGpickr from "./styleGpickr";

export default (editor, opts = {}) => {
  const options = {
    ...{
      // default options
    },
    ...opts,
  };

  window.GPickr && styleGpickr(editor, options); //opts.gpOpts);
  styleBg(editor, options); //opts.bgOpts);
};
