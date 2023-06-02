import { EmptyRecord } from "../src/common/types";
import { ToList } from "../src/common/types-util";
import { Cast } from "../src/common/types-util";
import { ToUnion } from "../src/common/types-util";

export type CommandArgs<
  TArgv extends EmptyRecord = EmptyRecord,
  TName extends string = string,
> = {
  "command": TName;
  "argv": TArgv;
};

type Handler<
  TNames extends readonly string[] = readonly string[],
  TArgs extends CommandArgs = CommandArgs<never, never>,
> = {
  handle: (args: TArgs) => void;
  supports: TNames;
};

type ComposedHandler<
  THandlers extends readonly Handler[],
> = Handler<
  Cast<
    ToList<Cast<ToUnion<THandlers>, Handler>["supports"]>,
    readonly string[]
  >,
  Parameters<Cast<ToUnion<THandlers>, Handler>["handle"]>[0]
>;

type H1 = Handler<["a"], CommandArgs<{ a: number }, "a">>;
type H2 = Handler<["b"], CommandArgs<{ b: number }, "b">>;
type H3 = Handler<["c"], CommandArgs<{ c: number }, "c">>;

type A = H1 extends Handler ? true : false;

// type C1 = ComposedHandler<[H1, H2, H3]>;

// declare const h: C1;

// h.handle({ command: "a", argv: { a: 1 } });
// h.handle({ command: "b", argv: { b: 1 } });
// h.handle({ command: "c", argv: { c: 1 } });

function handler<
  TName extends string,
  TArgs extends CommandArgs<EmptyRecord, TName>,
>(
  name: TName,
  handle: Handler<[TName], TArgs>["handle"],
): Handler<[TName], TArgs> {
  return {
    supports: [name],
    handle,
  };
}

const h1 = handler("a", (args: CommandArgs<{ a: number }, "a">) => {
  console.log(`a: ${args.argv.a}`);
});
const h2 = handler("b", (args: CommandArgs<{ b: number }, "b">) => {
  console.log(`b: ${args.argv.b}`);
});
const h3 = handler("c", (args: CommandArgs<{ c: number }, "c">) => {
  console.log(`c: ${args.argv.c}`);
});

type HandlerGeneric = Handler<
  readonly string[],
  CommandArgs<EmptyRecord, string>
>;

function compose<
  THandlers extends readonly Handler[],
>(
  ...handlers: THandlers
): ComposedHandler<THandlers>;

function compose(
  ...handlers: HandlerGeneric[]
): ComposedHandler<HandlerGeneric[]> {
  const a: ComposedHandler<[HandlerGeneric]> = {
    supports: handlers.reduce(
      (acc, h) => [...acc, ...h.supports],
      <string[]> [],
    ),
    handle: (args) => {
      const h = handlers.find(_ => _.supports.includes(args.command));

      if (h == undefined) {
        throw new Error(`No handler found for command ${args.command}`);
      }

      return h.handle(args);
      // handlers.find((h) => h.handle(args));
    },
  };

  return a;
}

const h123 = compose(h1, h2, h3);
