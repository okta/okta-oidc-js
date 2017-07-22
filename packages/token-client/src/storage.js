import util from './util';

const storage = {};
export default storage;

storage.setJSON = (key, item) => {
  localStorage.setItem(key, JSON.stringify(item));
};

storage.getJSON = key => {
  const value = localStorage.getItem(key);
  if (util.isString(value)) {
    return JSON.parse(value);
  }
};

storage.removeItem = key => localStorage.removeItem(key);
