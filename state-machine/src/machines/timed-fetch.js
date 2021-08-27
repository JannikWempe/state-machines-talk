import { actions, assign, createMachine } from 'xstate';
import { fetchPatents } from '../lib/nasa-client';
import { inspect } from '@xstate/inspect';

export const timedSearchMaschine = createMachine(
  {
    id: 'timed-search',
    type: 'parallel',
    context: {
      searchTerm: '',
      data: null,
      timer: null,
    },
    states: {
      search: {
        initial: 'idle',
        states: {
          idle: {},
          debouncing: {
            after: {
              DEBOUNCE_SEARCH_DELAY: 'searching',
            },
          },
          searching: {
            invoke: {
              src: 'fetcher',
              onDone: {
                target: 'success',
                actions: assign({ data: (context, event) => event.data }),
              },
              onError: {
                target: 'error',
                actions: 'resetData',
              },
            },
            entry: actions.raise('START'),
            exit: actions.raise('STOP'),
          },
          error: {},
          success: {},
        },
        on: {
          SEARCH: [
            {
              target: '.debouncing',
              // otherwise debouncing after will not restart
              internal: false,
              cond: 'hasMinTwoChars',
              actions: 'assignSearchTermToContext',
            },
            {
              target: '.idle',
              actions: 'assignSearchTermToContext',
            },
          ],
        },
      },
      timer: {
        initial: 'idle',
        states: {
          idle: {
            on: {
              START: {
                target: 'running',
                actions: 'startTimer',
              },
            },
          },
          running: {
            on: {
              STOP: {
                target: 'stopped',
                actions: 'stopTimer',
              },
            },
          },
          stopped: {
            on: {
              START: {
                target: 'running',
                actions: 'startTimer',
              },
            },
          },
        },
      },
    },
  },
  {
    guards: {
      hasMinTwoChars: (context, event) => (event?.searchTerm?.length ?? 0) >= 2,
    },
    actions: {
      assignSearchTermToContext: assign({ searchTerm: (context, event) => event.searchTerm }),
      resetData: assign({ data: null }),
      startTimer: assign({
        timer: () => ({
          start: Date.now(),
          stop: null,
          total: null,
        }),
      }),
      stopTimer: assign({
        timer: (context) => {
          const now = Date.now();
          return {
            start: context.timer.start,
            stop: now,
            total: now - context.timer.start,
          };
        },
      }),
    },
    services: {
      fetcher: (context, _) => (send) => fetchPatents(context.searchTerm),
    },
    delays: {
      DEBOUNCE_SEARCH_DELAY: 500,
    },
  },
);

const isBrowser = typeof window !== 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

// has to be executed before all machines and in the browser only
if (isBrowser && isDevelopment) {
  inspect({
    url: 'https://statecharts.io/inspect',
    iframe: false, // open in new window
  });
}
