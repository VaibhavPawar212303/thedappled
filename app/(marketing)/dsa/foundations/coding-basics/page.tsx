import type { Metadata } from "next";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { CodeBlock } from "../../_components/code-block";
import { Cards, DataTable, KeyIdea, P, PlainSteps, Tip } from "../../_components/lesson-blocks";

// Design: Penpot "27 - DSA Learning Path", page "Foundations 3 – Coding basics in C".

export const metadata: Metadata = {
  title: "Coding basics in C: variables, if / else, loops, arrays and functions – DSA step 3",
  description:
    "DSA Foundations step 3: just enough C to read every example in the path. Your first program, variables and types, if / else, for loops with a trace table, arrays and functions, in plain English first, then C.",
  alternates: { canonical: "/dsa/foundations/coding-basics" },
};

const TOC = [
  { id: "first-program", label: "Your first program" },
  { id: "variables", label: "Variables" },
  { id: "decisions", label: "Making decisions" },
  { id: "loops", label: "Loops" },
  { id: "arrays", label: "Arrays" },
  { id: "functions", label: "Functions" },
];

const HELLO = `#include <stdio.h>

int main(void) {
  printf("Hello, DSA!\\n");
  return 0;
}`;

const VARS = `int count = 0;          // a box called count, holding 0
count = count + 1;      // take what's in it, add 1, put it back
printf("%d\\n", count);  // %d prints an int: 1`;

const IF_ELSE = `int score = 72;
if (score >= 50) {
  printf("pass\\n");
} else {
  printf("try again\\n");
}`;

const FOR = `for (int i = 0; i < 3; i++) {   // start at 0; keep going while i < 3; add 1
  printf("%d\\n", i);
}
// prints 0, 1, 2`;

const ARRAY = `int a[] = {5, 2, 9, 1};
int n = sizeof a / sizeof a[0];   // 4
for (int i = 0; i < n; i++) {
  printf("%d\\n", a[i]);          // visits every box once
}`;

const SUM = `#include <stdio.h>

int sum(int a[], int n) {      // inputs: the array and its size
  int total = 0;
  for (int i = 0; i < n; i++) {
    total = total + a[i];
  }
  return total;                // output: one number
}

int main(void) {
  int a[] = {5, 2, 9, 1};
  int total = sum(a, 4);        // runs sum, keeps its answer
  printf("%d\\n", total);        // 17
  return 0;
}`;

// Full programs for "Run in Compiler": each snippet above wrapped in main(). Every one was run in the
// Compiler step by step and prints what the lesson says.
const RUN_VARS = `#include <stdio.h>

int main(void) {
  int count = 0;
  count = count + 1;
  printf("%d\\n", count);
  int n = 5;
  double price = 9.5;
  char grade = 'A';
  printf("%d %f %c\\n", n, price, grade);
  return 0;
}`;

const RUN_IF = `#include <stdio.h>

int main(void) {
  int score = 72;
  if (score >= 50) {
    printf("pass\\n");
  } else {
    printf("try again\\n");
  }
  return 0;
}`;

const RUN_FOR = `#include <stdio.h>

int main(void) {
  for (int i = 0; i < 3; i++) {
    printf("%d\\n", i);
  }
  return 0;
}`;

const RUN_ARRAY = `#include <stdio.h>

int main(void) {
  int a[] = {5, 2, 9, 1};
  int n = sizeof a / sizeof a[0];
  for (int i = 0; i < n; i++) {
    printf("%d\\n", a[i]);
  }
  return 0;
}`;

const BOXES = [5, 2, 9, 1];

export default function CodingBasicsLessonPage() {
  return (
    <DsaLessonLayout
      step="dsa-coding-basics"
      intro="Just enough C to read every example in this path: your first program, variables, if / else, loops, arrays and functions. Plain English first, then code. A Python version is coming later."
      minutes={20}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="first-program" title="Your first program" />
        <P>
          A program is a list of instructions the computer follows from top to bottom. Every C program starts in main. This one prints one line. Press Run in
          Compiler on any program in this chapter to step through it line by line.
        </P>
        <div className="mt-6">
          <CodeBlock file="hello.c · C" code={HELLO} copy run={HELLO} />
        </div>
        <Cards
          items={[
            { t: "#include <stdio.h>", d: "Brings in printf, so the program can print." },
            { t: "int main(void)", d: "Where the program starts. Everything runs inside { }." },
            { t: "printf(...)", d: "Prints text. \\n moves to the next line." },
          ]}
        />
        <PlainSteps title="How to run it" steps={["Save the code as hello.c.", "Compile it: gcc hello.c -o hello", "Run it: ./hello → Hello, DSA!"]} />
      </section>

      <section>
        <SectionHead n={2} id="variables" title="Variables" />
        <P>A variable is a labelled box that holds one value. You say what kind of value it holds:</P>
        <DataTable
          head={["Type", "Holds", "Example"]}
          rows={[
            ["int", "A whole number", "int n = 5;"],
            ["double", "A number with a decimal point", "double price = 9.5;"],
            ["char", "One letter or symbol", "char grade = 'A';"],
          ]}
        />
        <div className="mt-6">
          <CodeBlock file="variables.c · C" code={VARS} run={RUN_VARS} />
        </div>
        <Tip>
          <code className="font-mono">=</code> means &ldquo;store this value&rdquo;. <code className="font-mono">==</code> means &ldquo;are these equal?&rdquo;.
        </Tip>
      </section>

      <section>
        <SectionHead n={3} id="decisions" title="Making decisions: if / else" />
        <P>if runs a block only when its condition is true; else runs when it is false.</P>
        <div className="mt-6">
          <CodeBlock file="if_else.c · C" code={IF_ELSE} run={RUN_IF} />
        </div>
        <DataTable
          head={["Sign", "Means"]}
          rows={[
            ["<   >", "less than, greater than"],
            ["<=   >=", "less or equal, greater or equal"],
            ["==   !=", "equal, not equal"],
          ]}
        />
      </section>

      <section>
        <SectionHead n={4} id="loops" title="Loops: doing something again and again" />
        <P>A for loop has three parts: where to start, when to keep going, and how to move on.</P>
        <div className="mt-6">
          <CodeBlock file="for_loop.c · C" code={FOR} run={RUN_FOR} />
        </div>
        <DataTable
          caption="Trace it: what happens each time round"
          head={["i", "i < 3 ?", "What happens"]}
          rows={[
            ["0", "yes", "print 0, then i becomes 1"],
            ["1", "yes", "print 1, then i becomes 2"],
            ["2", "yes", "print 2, then i becomes 3"],
            ["3", "no", "stop: the body ran 3 times"],
          ]}
          hot={2}
        />
        <KeyIdea>Each time the body runs is one step. Next you&apos;ll trace loops row by row, then count those steps to get Big-O.</KeyIdea>
      </section>

      <section>
        <SectionHead n={5} id="arrays" title="Arrays: many values in one row" />
        <P>An array is a row of boxes of the same type. Each box has a number, its index, starting at 0.</P>
        <div data-testid="array-boxes" className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-4">
          <div className="flex gap-3">
            {BOXES.map((v, i) => (
              <div key={i} className="text-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 text-xl font-extrabold ${i === 0 ? "border-blue-500 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" : "border-slate-300 bg-card dark:border-slate-600"}`}
                >
                  {v}
                </div>
                <p className="mt-1.5 font-mono text-xs text-muted-foreground">a[{i}]</p>
              </div>
            ))}
          </div>
          <p className="pb-6 text-[15px] text-slate-700 dark:text-slate-300">
            n = 4 items: indexes 0 to 3, so the last one is <code className="font-mono">a[n - 1]</code>.
          </p>
        </div>
        <div className="mt-4">
          <CodeBlock file="array.c · C" code={ARRAY} run={RUN_ARRAY} />
        </div>
      </section>

      <section>
        <SectionHead n={6} id="functions" title="Functions: name a piece of work" />
        <P>A function takes inputs, does the work, and returns a result. Write it once, use it many times.</P>
        <div className="mt-6">
          <CodeBlock file="sum.c · C" code={SUM} copy run={SUM} />
        </div>
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-lg font-bold">Your turn: find the largest number</p>
          <ol className="m-0 mt-4 list-none space-y-3 p-0">
            {[
              "Open sum.c with Run in Compiler, or copy it into any C compiler.",
              "Add a function largest(a, n) that keeps the biggest value it has seen so far.",
              "For {5, 2, 9, 1} it should print 9.",
            ].map((s, i) => (
              <li key={s} className="flex items-start gap-3 text-[15px] text-slate-700 dark:text-slate-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[13px] text-muted-foreground">In the Compiler, press Next to run one line at a time and watch each variable change on the stack.</p>
        </div>
      </section>
    </DsaLessonLayout>
  );
}
