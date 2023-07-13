import styleGpickr from "./styleGpickr";

export default (editor, opts = {}) => {
  const options = {
    ...{
      // default options
    },
    ...opts,
  };

  styleGpickr(editor, options);
};
