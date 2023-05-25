import {
  buildAndParse,
  comm,
  comp,
  compose,
  createHandlerFor,
  handlerFor,
  subs,
} from "../../../src";
import { InputRecordHandlerFor } from "../../../src/create-handler-for";
import { HandlerFunctionFor, popCommand } from "../../../src/handler";
import { opt } from "../../types/addOption";

describe("create handler", () => {
  test("create handler for", () => {
    // const afn1 = jest.fn();

    // const a = createHandlerFor(
    //   comm("foo", "bar", _ => _.option("baz", { type: "string" })),
    //   ({ baz }) => {
    //     afn1(baz);
    //   },
    // );

    // a({ baz: "1" });
    // expect(afn1.mock.calls.length).toBe(1);

    const bfn1 = jest.fn();
    const bfn2 = jest.fn();

    const b = createHandlerFor(
      comp(
        comm("foo", "bar", _ => _.option("baz", { type: "string" })),
        comm("goo", "bar", _ => _.option("gooz", { type: "string" })),
      ),
      {
        "foo": async ({ baz }) => {
          bfn1(baz);
        },
        "goo": async ({ gooz }) => {
          bfn2(gooz);
        },
      },
    );

    b({ command: "goo", argv: { gooz: "gooz" } });
    expect(bfn2.mock.calls.length).toBe(1);

    b({ command: "foo", argv: { baz: "baz" } });
    expect(bfn1.mock.calls.length).toBe(1);
  });

  test("create handler for with subcommands", () => {
    const afn1 = jest.fn();
    const afn2 = jest.fn();
    const command = subs(
      comm("foo", "bar"),
      [
        comm("goo", "bar", _ => _.option("gooz", { type: "string" })),
        comm("hoo", "bar", _ => _.option("hooz", { type: "string" })),
        subs(
          comm("subfoo", "subfoo"),
          [
            comm(
              "subgoo",
              "subgoo",
              _ => _.option("subgooz", { type: "string" }),
            ),
            comm(
              "subhoo",
              "subhoo",
              _ => _.option("subhooz", { type: "string" }),
            ),
          ],
        ),
      ],
    );

    const handler = createHandlerFor(
      command,
      {
        goo: async ({ gooz }) => {
          afn1(gooz);
        },
        hoo: async ({ hooz }) => {
          afn2(hooz);
        },
        subfoo: async (args) => {
          switch (args.subcommand) {
            case "subgoo":
              afn1(args.argv.subgooz);
              break;
            case "subhoo":
              afn2(args.argv.subhooz);
              break;
          }
        },
      },
    );

    handler({ command: "foo", subcommand: "goo", argv: { gooz: "gooz" } });
    expect(afn1.mock.calls.length).toBe(1);

    handler({ command: "foo", subcommand: "hoo", argv: { hooz: "gooz" } });
    expect(afn2.mock.calls.length).toBe(1);

    handler({
      command: "foo",
      subcommand: "subfoo",
      subsubcommand: "subgoo",
      argv: { subgooz: "gooz" },
    });

    expect(afn1.mock.calls.length).toBe(2);

    handler({
      command: "foo",
      subcommand: "subfoo",
      subsubcommand: "subhoo",
      argv: { subhooz: "gooz" },
    });

    expect(afn2.mock.calls.length).toBe(2);
  });

  test("create handler for mixed", () => {
    const subsubsubcommand = subs(
      comm("subsubgoo", "bar"),
      [
        comm("subsubhoo", "bar", _ => _.option("hooz", { type: "string" })),
        comm("subsubboo", "bar", _ => _.option("booz", { type: "string" })),
      ],
    );

    const subsubcommand = subs(
      comm("subgoo", "bar"),
      [
        comm("subhoo", "bar", _ => _.option("hooz", { type: "string" })),
        comm("subboo", "bar", _ => _.option("booz", { type: "string" })),
        subsubsubcommand,
      ],
    );

    const subcommand = subs(
      comm("goo", "bar"),
      [
        comm("hoo", "bar", _ => _.option("hooz", { type: "string" })),
        comm("boo", "bar", _ => _.option("booz", { type: "string" })),
        subsubcommand,
      ],
    );

    const cmd = comp(comm("foo", "bar"), subcommand);

    const fn1 = jest.fn();
    const subgoo = createHandlerFor(
      subsubcommand,
      {
        subboo: async ({ booz }) => {},
        subhoo: async (args) => {
          expect(args).toStrictEqual({
            hooz: "123",
          });
        },
        subsubgoo: createHandlerFor(
          subsubsubcommand,
          {
            subsubboo: async (args) => {
              expect(args).toStrictEqual({
                booz: "123",
              });
            },
            subsubhoo: async (args) => {},
          },
        ),
      },
    );

    const gooHandler = createHandlerFor(subcommand, {
      hoo: async ({ hooz }) => {},
      boo: async ({ booz }) => {},
      subgoo,
    });

    const handler = createHandlerFor(cmd, {
      foo: (args) => {
        expect(args).toStrictEqual({});
      },
      goo: gooHandler,
    });

    handler({ command: "foo", argv: {} });

    handler({ command: "goo", subcommand: "hoo", argv: { hooz: "123" } });

    handler({
      command: "goo",
      subcommand: "subgoo",
      subsubcommand: "subhoo",
      argv: { hooz: "123" },
    });

    handler({
      command: "goo",
      subcommand: "subgoo",
      subsubcommand: "subsubgoo",
      subsubsubcommand: "subsubboo",
      argv: { booz: "123" },
    });
  });

  test("create tree", async () => {
    const subcommand = subs(
      comm("goo", "bar"),
      [
        comm("hoo", "bar", _ => _.option("hooz", { type: "string" })),
        comm("boo", "bar", _ => _.option("booz", { type: "string" })),
      ],
    );

    const subcommand2 = subs(
      comm("zoo", "bar"),
      [
        comm("zoohoo", "bar", _ => _.option("hooz", { type: "string" })),
        comm("zooboo", "bar", _ => _.option("booz", { type: "string" })),
      ],
    );

    const cmd = comp(
      comm("foo", "bar", _ => _.option("gooz", { type: "string" })),
      subcommand,
      subcommand2,
    );

    const [fn1, fn2, fn3, fn4] = [jest.fn(), jest.fn(), jest.fn(), jest.fn()];

    const handler = createHandlerFor(cmd, {
      foo: async ({ gooz }) => {
        fn1(gooz);
      },
      goo: {
        boo: async ({ booz }) => {
          fn2(booz);
        },
        hoo: ({ hooz }) => {
          fn3(hooz);
        },
      },
      zoo: async (args) => {
        args.command;
      },
    });

    const res = await handler({
      command: "goo",
      subcommand: "hoo",
      argv: { hooz: "123" },
    });

    expect(fn3.mock.calls.length).toBe(1);
  });

  test("create handler for a single subcommand", async () => {
    const config = comp(
      comm("get", "get", opt("a")),
      comm("set", "set", opt("b")),
    );

    const [fn1, fn2] = [jest.fn(), jest.fn()];

    const configHandler = handlerFor(config, ({ argv, command }) => {
      switch (command) {
        case "get":
          fn1(argv.a);
          break;
        case "set":
          fn2(argv.b);
          break;
      }
    });

    const handler = createHandlerFor(
      subs(comm("config", "config"), config),
      args => {
        configHandler(popCommand(args));
      },
    );

    handler({ command: "config", subcommand: "get", argv: { a: "123" } });
    expect(fn1.mock.calls.length).toBe(1);

    handler({ command: "config", subcommand: "set", argv: { b: "123" } });
    expect(fn2.mock.calls.length).toBe(1);
  });

  test("empty composed", () => {
    const c = compose(
      comm("foo", "bar"),
    );

    const res = buildAndParse(c, []);

    console.log(
      res.result,
    );
  });
});
