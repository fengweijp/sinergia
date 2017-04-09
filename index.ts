export interface IOptions {
  debug?: boolean;
}

const defaultOptions: IOptions = {
  debug: false,
};

export function* sinergia(
  iterable: Iterable<any>,
  task: (accumulator: any, item: any) => any,
  initialValue: any,
  options: IOptions = {},
) {
  const actualOptions = { ...defaultOptions, ...options };
  let accumulator: any = initialValue;
  let animToken: number;

  try {
    for (const item of iterable) {
      const itemIterator: IterableIterator<any> = task(accumulator, item);

      yield new Promise(resolve => {
        const step = (timestamp) => { // timestamp not used
          const iteration = itemIterator.next();

          if (!iteration.done) {
            window.requestAnimationFrame(step);
          }
          else {
            if (actualOptions.debug) console.log(`item task is done with latest iteration`, iteration);
            accumulator = iteration.value;
            window.cancelAnimationFrame(animToken);
            resolve();
          }
        };

        animToken = window.requestAnimationFrame(step);
      });
    }

    return { value: accumulator };
  } finally {
    // This block is called when sinergia is interrupted with `.return()`

    if (animToken) window.cancelAnimationFrame(animToken);
    yield { value: accumulator };
  }
}