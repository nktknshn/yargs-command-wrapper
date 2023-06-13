type StripSpaces<T extends string> = T extends ` ${infer U}` ? StripSpaces<U>
  : T;

/**
 * @description
 */
export type GetCommandNameString<TCommandDesc extends string> =
  StripSpaces<TCommandDesc> extends `${infer TCommandName} ${string}`
    ? TCommandName
    : TCommandDesc;

/**
 * @description
 */
export type GetCommandNameFromDesc<
  TCommandDesc extends readonly string[] | string,
> = TCommandDesc extends string ? GetCommandNameString<TCommandDesc>
  : GetCommandNameString<TCommandDesc[0]>;
