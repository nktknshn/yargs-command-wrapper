const LoggingLevels = {
  TRACE: 25,
  DEBUG: 20,
  INFO: 15,
  WARN: 10,
  ERROR: 5,
  SILENT: 0,
} as const;

type LogMethodsObject<T extends Record<string, number>> = {
  [K in Extract<keyof T, string> as Lowercase<K>]: (
    message: string,
    ...args: unknown[]
  ) => void;
};

type LoggingLevel = keyof typeof LoggingLevels;
type LogFunction = (
  loggerName: string | undefined,
  level: LoggingLevel,
  message: string,
  ...args: unknown[]
) => void;

type LoggingOptions = {
  level: LoggingLevel;
  logFunction: LogFunction;
  filter: RegExp | string | undefined;
};

const setLevel = (level: LoggingLevel = "DEBUG") => {
  loggingOptions.level = level;
};

const setLogFunction = (logFunction: LogFunction) => {
  loggingOptions.logFunction = logFunction;
};

const setFilter = (filter: RegExp | string | undefined) => {
  loggingOptions.filter = filter;
};

const getRegExp = (filter: RegExp | string): RegExp => {
  return filter instanceof RegExp
    ? filter
    : new RegExp(filter);
};

const log = (
  loggerName: string | undefined,
  level: LoggingLevel,
  message: string,
  ...args: unknown[]
) => {
  if (
    loggingOptions.filter !== undefined && loggerName !== undefined
    && !getRegExp(loggingOptions.filter).test(loggerName)
  ) {
    return;
  }

  if (LoggingLevels[level] <= LoggingLevels[loggingOptions.level]) {
    loggingOptions.logFunction(loggerName, level, message, ...args);
  }
};

const logFunction = (
  loggerName: string | undefined,
  level: LoggingLevel,
  message: string,
  ...args: unknown[]
) => {
  if (loggerName !== undefined) {
    console.log(
      `\x1b[90m[${loggerName}] [${level}] ${message}\x1b[0m`,
      ...args,
    );
    return;
  }
  console.log(`\x1b[90m[${level}] ${message}\x1b[0m`, ...args);

  // console.log(`\x1b[90m[${level}] ${message}\x1b[0m`, ...args);
};

const loggingOptions: LoggingOptions = {
  level: "SILENT",
  logFunction,
  filter: undefined,
};

const createLoggerMethods = (
  { loggerName }: { loggerName?: string } = {},
): LogMethodsObject<typeof LoggingLevels> => {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(LoggingLevels)) {
    result[key.toLowerCase()] = (message: string, ...args: unknown[]) => {
      log(loggerName, key as LoggingLevel, message, ...args);
    };
  }
  return result as LogMethodsObject<typeof LoggingLevels>;
};

const methods: LogMethodsObject<typeof LoggingLevels> = createLoggerMethods();

const getLogger = (
  loggerName: string,
): LogMethodsObject<typeof LoggingLevels> => {
  return createLoggerMethods({ loggerName });
};

export default {
  ...methods,
  setLevel,
  setLogFunction,
  setFilter,
  getLogger,
};
