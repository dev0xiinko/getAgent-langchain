import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../web/lib/markdown";

describe("renderMarkdown", () => {
  it("renders headings, bold, italics, links and inline code", () => {
    const out = renderMarkdown("# Title\nsome **bold** and *it* and `code` and [x](https://a.com)");
    expect(out).toContain("<h1>Title</h1>");
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain("<em>it</em>");
    expect(out).toContain("<code>code</code>");
    expect(out).toContain('<a href="https://a.com" target="_blank" rel="noreferrer">x</a>');
  });

  it("renders GFM pipe tables with column alignment", () => {
    const out = renderMarkdown("| A | B |\n|---|--:|\n| 1 | 2 |");
    expect(out).toContain("<table>");
    expect(out).toContain("<th>A</th>");
    expect(out).toContain('<th style="text-align:right">B</th>');
    expect(out).toContain('<td style="text-align:right">2</td>');
  });

  it("renders fenced code blocks and escapes their contents", () => {
    const out = renderMarkdown("```ts\nconst x = 1 < 2 && a > b;\n```");
    expect(out).toContain('<pre><code class="lang-ts">');
    expect(out).toContain("1 &lt; 2 &amp;&amp; a &gt; b");
    // Code content must NOT be turned into inline markup.
    expect(out).not.toContain("<strong>");
  });

  it("renders ordered, unordered lists and blockquotes", () => {
    expect(renderMarkdown("- a\n- b")).toContain("<ul><li>a</li><li>b</li></ul>");
    expect(renderMarkdown("1. a\n2. b")).toContain("<ol><li>a</li><li>b</li></ol>");
    expect(renderMarkdown("> quoted")).toContain("<blockquote>quoted</blockquote>");
  });

  it("renders images only for http(s)/data URIs", () => {
    expect(renderMarkdown("![a](https://x/i.png)")).toContain('<img src="https://x/i.png" alt="" />');
    expect(renderMarkdown("![a](javascript:alert(1))")).not.toContain("<img");
  });

  it("escapes HTML so injected markup stays inert", () => {
    const out = renderMarkdown("<script>alert(1)</script>");
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
  });

  it("escapes a javascript: link target instead of linking it", () => {
    const out = renderMarkdown("[x](javascript:alert(1))");
    expect(out).not.toContain("<a ");
  });
});
