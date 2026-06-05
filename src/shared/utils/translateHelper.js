/**
 * Get namespace name from file path
 * Example: '../vi/branch.json' -> 'branch'
 */
export const getNamespaceNameFromPath = (path) => {
  const matched = path.match(/\/([^/]+)\.json$/);
  return matched ? matched[1] : null;
};

/**
 * Check if value is a plain object (not null, not array)
 */
export const isPlainObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

/**
 * Convert glob modules to namespace object
 * Handles both wrapped and unwrapped namespace formats
 */
export const toNamespaceObject = (modules) => {
  return Object.entries(modules).reduce((acc, [path, module]) => {
    const namespace = getNamespaceNameFromPath(path);
    if (!namespace) return acc;
    const rawContent = module.default || module;
    const hasWrappedNamespace =
      isPlainObject(rawContent) &&
      Object.keys(rawContent).length === 1 &&
      rawContent[namespace] !== undefined;

    acc[namespace] = hasWrappedNamespace ? rawContent[namespace] : rawContent;
    return acc;
  }, {});
};

/**
 * Replace parameters in translation string
 * @param {Function} translate - The translate function from useTranslate()
 * @param {string} key - Translation key (e.g., 'audio.confirm.createAudio')
 * @param {Object} params - Parameters to replace (e.g., {key: 'audio-123', type: 'background'})
 * @returns {string} Translated string with parameters replaced
 *
 * @example
 * // Translation: "Are you sure you want to create Audio Key \"{key}\" of type {type}{uploadStatus}?"
 * translateWithParams(translate, 'audio.confirm.createAudio', {
 *   key: 'audio-123',
 *   type: 'background',
 *   uploadStatus: ' (upload: 50%)'
 * })
 * // Output: "Are you sure you want to create Audio Key \"audio-123\" of type background (upload: 50%)?"
 */
export const translateWithParams = (translate, key, params = {}) => {
  let result = translate(key);

  // Replace each {paramName} with the corresponding value
  Object.entries(params).forEach(([paramKey, paramValue]) => {
    // Use global flag (g) to replace all occurrences
    result = result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), paramValue);
  });

  return result;
};
