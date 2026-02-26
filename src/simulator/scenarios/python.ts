import type { Scenario } from "./index.ts";

export const pythonScenario: Scenario = {
  id: "python",
  title: "Python",
  prompt: "❯",
  windowTitle: "bash — python3",
  commands: [
    {
      text: "python3",
      events: [
        {
          type: "output",
          delay: 400,
          tokens: [{ text: "Python 3.12.1 (main, Dec 15 2025)", class: "" }],
        },
        {
          type: "output",
          delay: 100,
          tokens: [
            {
              text: 'Type "help", "copyright" for more information.',
              class: "ansi-bright-black",
            },
          ],
        },
      ],
    },
    {
      prompt: ">>>",
      text: "import math; [math.factorial(n) for n in range(8)]",
      typeSpeed: 35,
      events: [
        {
          type: "output",
          delay: 300,
          tokens: [
            { text: "[1, 1, 2, 6, 24, 120, 720, 5040]", class: "ansi-cyan" },
          ],
        },
      ],
    },
    {
      prompt: ">>>",
      text: "sum(1/math.factorial(n) for n in range(20))",
      typeSpeed: 35,
      events: [
        {
          type: "output",
          delay: 300,
          tokens: [{ text: "2.718281828459045", class: "ansi-cyan" }],
        },
      ],
    },
    {
      prompt: ">>>",
      text: 'data = {"users": None}; data["users"].append("alice")',
      typeSpeed: 35,
      events: [
        {
          type: "output",
          delay: 300,
          tokens: [
            { text: "Traceback (most recent call last):", class: "ansi-red" },
          ],
        },
        {
          type: "output",
          delay: 150,
          tokens: [
            { text: '  File "<stdin>", line 1, in <module>', class: "" },
          ],
        },
        {
          type: "output",
          delay: 150,
          tokens: [
            { text: "AttributeError", class: "ansi-bright-red" },
            {
              text: ": 'NoneType' object has no attribute 'append'",
              class: "ansi-red",
            },
          ],
        },
      ],
    },
    {
      prompt: ">>>",
      text: "exit()",
      typeSpeed: 35,
      events: [
        {
          type: "output",
          delay: 200,
          tokens: [{ text: "exit", class: "ansi-bright-black" }],
        },
      ],
    },
  ],
};
