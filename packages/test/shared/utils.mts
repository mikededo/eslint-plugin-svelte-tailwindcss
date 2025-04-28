const parseStdOut = (value: string) => value.split('\n').map((l) => {
  const iof = l.search(/\/v\d/);
  if (iof === -1) {
    return l;
  }

  return l.slice(iof);
}).join('\n');

export default {
  parseStdOut
};
