import data from '../../data/nasa-patents.json';

export const fetchPatents = (searchTerm, options) => {
  const signal = options?.signal;
  if (signal?.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }

  const resultsWithImages = data.results.filter((patent) => !!patent[10]);

  let results = resultsWithImages.map((patent) => ({
    id: patent[0],
    code: patent[1],
    title: patent[2],
    description: patent[3],
    category: patent[5],
    imageURL: patent[10],
  }));

  if (!!searchTerm) {
    results = results.filter((patent) => patent.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  return new Promise((resolve, reject) => {
    // make it randomly fail
    if (Math.random() > 0.9) reject();

    let timeout;

    const abortHandler = () => {
      clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    timeout = setTimeout(() => {
      resolve(results);
      signal?.removeEventListener('abort', abortHandler);
    }, results.length * 40 + 200);

    signal?.addEventListener('abort', abortHandler);
  });
};
