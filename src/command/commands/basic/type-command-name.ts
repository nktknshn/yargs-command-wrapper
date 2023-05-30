/**
 * @description
 */
export type GetCommandNameString<TCommandDesc extends string> =
  TCommandDesc extends `${infer TCommandName} ${string}` ? TCommandName
    : TCommandDesc;

/**
 * @description
 */
export type GetCommandNameFromDesc<
  TCommandDesc extends readonly string[] | string,
> = TCommandDesc extends string ? GetCommandNameString<TCommandDesc>
  : GetCommandNameString<TCommandDesc[0]>;
