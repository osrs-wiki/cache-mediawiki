import _ from "underscore";

// Helper for the call to _.mapObject/_.mapValues below.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const wrapAddedKey = (newValue: any) => ({ oldValue: undefined, newValue });

export const getJsonDifference = (oldCollection: any, newCollection: any) => {
  const diff = _.reduce(
    oldCollection,
    function (result: any, oldValue: any, key: any) {
      const newValue = newCollection[key];
      if (_.isObject(oldValue) && _.isObject(newValue)) {
        const diff = getJsonDifference(oldValue, newValue);
        if (!_.isEmpty(diff)) result[key] = diff;
      } else if (oldValue !== newValue) {
        result[key] = { oldValue, newValue };
      }
      return result;
    },
    _.isArray(oldCollection) ? [] : {}
  );
  const addedKeys = _.difference(_.keys(newCollection), _.keys(oldCollection));
  const additions = _.pick(newCollection, addedKeys);
  return _.extend(diff, _.mapObject(additions, wrapAddedKey));
};

export const getStringDifference = (a: string, b: string) => {
  let i = 0;
  let j = 0;
  let result = "";

  while (j < b.length) {
    if (a[i] != b[j] || i == a.length) result += b[j];
    else i++;
    j++;
  }
  return result;
};
