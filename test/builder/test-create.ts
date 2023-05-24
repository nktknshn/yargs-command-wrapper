import {
  addSubcommands,
  command,
  composeCommands,
  createHandlerFor,
} from "../../src";
import { handlerFor } from "../../src/handler";

describe("create handler", () => {
  test("create handler for", () => {
    const afn1 = jest.fn();

    const a = createHandlerFor(
      command("foo", "bar", _ => _.option("baz", { type: "string" })),
      ({ baz }) => {
        afn1(baz);
      },
    );

    a({ baz: "1" });
    expect(afn1.mock.calls.length).toBe(1);

    const bfn1 = jest.fn();
    const bfn2 = jest.fn();

    const b = createHandlerFor(
      composeCommands(
        command("foo", "bar", _ => _.option("baz", { type: "string" })),
        command("goo", "bar", _ => _.option("gooz", { type: "string" })),
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
    expect(bfn1.mock.calls.length).toBe(1);

    b({ command: "foo", argv: { baz: "baz" } });
    expect(bfn2.mock.calls.length).toBe(1);
  });

  test("create handler for with subcommands", () => {
    const afn1 = jest.fn();
    const afn2 = jest.fn();

    const handler = createHandlerFor(
      addSubcommands(
        command("foo", "bar"),
        [
          command("goo", "bar", _ => _.option("gooz", { type: "string" })),
          command("hoo", "bar", _ => _.option("hooz", { type: "string" })),
        ],
      ),
      {
        goo: async ({ gooz }) => {
          afn1(gooz);
        },
        hoo: async ({ hooz }) => {
          afn2(hooz);
        },
      },
    );

    handler({ command: "foo", subcommand: "goo", argv: { gooz: "gooz" } });
    expect(afn1.mock.calls.length).toBe(1);

    handler({ command: "foo", subcommand: "hoo", argv: { hooz: "gooz" } });
    expect(afn2.mock.calls.length).toBe(1);
  });

  test("create handler for mixed", () => {
    const subsubsubcommand = addSubcommands(
      command("subsubgoo", "bar"),
      [
        command("subsubhoo", "bar", _ => _.option("hooz", { type: "string" })),
        command("subsubboo", "bar", _ => _.option("booz", { type: "string" })),
      ],
    );

    const subsubcommand = addSubcommands(
      command("subgoo", "bar"),
      [
        command("subhoo", "bar", _ => _.option("hooz", { type: "string" })),
        command("subboo", "bar", _ => _.option("booz", { type: "string" })),
        subsubsubcommand,
      ],
    );

    const subcommand = addSubcommands(
      command("goo", "bar"),
      [
        command("hoo", "bar", _ => _.option("hooz", { type: "string" })),
        command("boo", "bar", _ => _.option("booz", { type: "string" })),
        subsubcommand,
      ],
    );

    const cmd = composeCommands(
      command("foo", "bar"),
      subcommand,
    );

    const h2 = handlerFor(subcommand, args => {
      args.command;
    });

    const gooHandler = createHandlerFor(subcommand, {
      hoo: async ({ hooz }) => {},
      boo: async ({ booz }) => {},
      subgoo: createHandlerFor(
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
      ),
    });

    const handler = createHandlerFor(cmd, {
      foo: (args) => {
        expect(args).toStrictEqual({});
      },
      goo: gooHandler,
    });

    handler({
      command: "foo",
      argv: {},
    });

    handler({
      command: "goo",
      subcommand: "hoo",
      argv: { hooz: "123" },
    });

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
});
