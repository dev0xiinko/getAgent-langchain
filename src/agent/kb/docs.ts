// AUTO-GENERATED from the Obsidian vault (Bitget-Builder/builderhub-knowledgebase).
// This is now the SOURCE OF TRUTH for the knowledge base — edit these objects directly.
import type { KbMeta } from "./frontmatter";

export interface KbDoc {
  /** Stable id (lowercased vault filename). Must match KB_ALWAYS slugs in config.ts. */
  id: string;
  /** Original vault path, kept for traceability. */
  source: string;
  meta: KbMeta;
  body: string;
}

export const KB_DOCS: KbDoc[] = [
  {
    id: "reddit-posting",
    source: "Auto-Posting/Reddit-Posting.md",
    meta: {"category":"auto-posting","type":"guide","intent":["content-creation","platform-questions"],"platform":"reddit","access":["reddit_team"]},
    body: `# Reddit Auto Posting

Reddit Auto Posting allows builders to submit a Reddit post request directly through BuilderHub. The system handles drafting, review, and publishing automatically via a script — the builder just provides the brief and approves the final post before it goes live.

---

## How It Works — Two-Gate Process (COR Model)

Every Reddit post request goes through two confirmation points before anything is published. Nothing is ever posted without the builder's explicit approval.

### Gate A — COR Brief Confirmation

Before any content is written, the system restates the brief back to the builder using the **COR format**:

| Field | What it covers |
|---|---|
| **C — Context** | What the post is about and the background |
| **O — Objective** | What the post should achieve |
| **R — Reference** *(optional)* | Links, stats, tone examples, or any material to base the post on |

The builder reviews the COR summary and confirms, corrects, or cancels. Drafting only begins after the builder confirms the COR is correct.

**Why COR matters:** It prevents wasted effort. If the system misunderstood the brief, catching it at Gate A costs nothing. Catching it after the post is drafted wastes time for everyone.

### Gate B — Final Approval

Once the draft is ready, the exact post (title and body) is shown to the builder for final approval through BuilderHub. The builder sees precisely what will be published before the script runs. Only after explicit approval does the post get published.

**No post is ever published without Gate B approval — no exceptions.**

---

## How to Request a Reddit Post

Submit your request directly through BuilderHub. Include as much detail as possible:

### Required Information
- **Topic** — what the post should be about
- **Subreddit** — the exact subreddit to post in (e.g. r/CryptoCurrency, r/BitgetReddit, r/CryptoMarkets)
- **Objective** — what you want the post to achieve (educate, drive sign-ups, share news, spark discussion)

### Optional Information
- **Tone** — conversational, informative, promotional, analytical (system will infer if not given)
- **Post count** — how many posts you want (defaults to 1 if not specified)
- **Reference material** — links, stats, or examples you want included or matched
- **Reddit account** — if posting from a specific account
- **Flair** — if you need a specific post flair

### Pass-Through Fast Path
If you already have the full post written (both title and body), you can submit the finished content directly. The system skips Gate A and the drafting step, and goes straight to Gate B for your final approval before the script runs.

---

## Subreddit Selection

**You must specify a subreddit.** The system will never pick one for you or infer it from the topic. If no subreddit is provided, you will be asked before any work begins.

### Recommended Subreddits for Bitget Content

| Subreddit          | Best for                                  |
| ------------------ | ----------------------------------------- |
| r/CryptoCurrency   | General crypto discussion, large audience |
| r/CryptoMarkets    | Market analysis, trading discussion       |
| r/BitgetReddit     | Official Bitget community                 |
| r/BitcoinMarkets   | Trading-focused, data-driven posts        |
| r/defi             | DeFi and yield topics                     |
| r/CryptoTechnology | Technology and product deep dives         |

Always check the subreddit's rules before requesting a post — each community has different self-promotion and disclosure rules.

---

## Content Rules & Limits

Every Reddit post must stay within Reddit's native limits:

| Field | Reddit Limit |
|---|---|
| Title | 300 characters maximum |
| Body | 40,000 characters maximum |

### Content Requirements
- Must comply with the target subreddit's rules
- Must follow Bitget brand voice guidelines — see the Brand Voice and Content Guidelines note
- No unverified claims or price predictions — see the Avoid AI-Sounding Writing note

---

## Workflow Phases

| Phase | What Happens |
|---|---|
| **Request submitted** | Builder submits brief through BuilderHub |
| **Gate A — COR Confirmation** | System sends COR summary (Context / Objective / Reference) for builder to confirm |
| **Drafting** | Content is produced based on the confirmed COR brief |
| **Gate B — Final Approval** | Builder sees exact title and body before publishing |
| **Published** | Auto-posting script runs and post goes live on Reddit |

---

## Changing or Cancelling a Request

### Before Gate A is confirmed
Anything can be changed — topic, subreddit, tone, post count.

### After Gate A, while drafting is in progress
You can still cancel or change the brief. If the brief changes after Gate A is confirmed, the draft is discarded and restarted with the updated COR.

### At Gate B — Final Approval
- **Approve** — script runs, post goes live as shown
- **Request changes** — ask for edits. The revised draft comes back for another Gate B before publishing.
- **Cancel** — post is discarded. Script does not run.

---

## What Makes a Good Request

The clearer the brief, the better the output. Good requests include:

- A specific angle ("why copy trading reduces emotional decision-making" rather than just "copy trading")
- Target audience in mind ("for beginners who have never tried crypto")
- Key facts or data to include ("mention Bitget has 150M+ users")
- An honest trade-off or limitation — Reddit rewards transparency over pure promotion
- A genuine question for the community at the end to drive engagement

---

## Common Questions

**Q: I submitted a request — what happens next?**
The system will send a COR summary for you to confirm through BuilderHub. Check for a pending confirmation request.

**Q: My post was removed by Reddit after publishing.**
Usually caused by the subreddit's self-promotion rules or spam filters. Review the subreddit rules and submit a revised request with a different angle.

**Q: Can I request multiple posts at once?**
Yes — specify the post count in your request. Each post has its own title and body, and all are shown at Gate B before any go live.

**Q: Can I post to multiple subreddits?**
Yes — request multiple posts and specify a different subreddit for each one in your brief.

---

---

## Trigger Format (Gate B Output)

After the builder approves at Gate B, the agent outputs the post in this exact format. The Post Now button appears only when this format is detected — which only happens after explicit builder approval.

### Single post format

\`\`\`
Mode: Reddit Post

Post 1 reddit post
Account: [only include if specified]
Subreddit: [only include if specified]
Flair: [only include if specified]
Title: [post title]
Use This Image [only include if image provided or requested]
Contents: [post body]
\`\`\`

### Multiple posts format

Each post is its own block starting with \`Post 1 reddit post\` — the Post Now button appears separately for each block.

\`\`\`
Mode: Reddit Post

Post 1 reddit post
Account: [only if specified]
Subreddit: [only if specified]
Flair: [only if specified]
Title: [title for post 1]
Use This Image [only if applicable]
Contents: [body for post 1]

Post 1 reddit post
Account: [only if specified]
Subreddit: [only if specified]
Flair: [only if specified]
Title: [title for post 2]
Use This Image [only if applicable]
Contents: [body for post 2]
\`\`\`

### Format rules
- Always start with \`Mode: Reddit Post\` — the Post Now button detects this line
- Each post block starts with \`Post 1 reddit post\`
- \`Account\`, \`Subreddit\`, \`Flair\` — only include these lines if the builder specified them. Omit entirely if not provided.
- \`Use This Image\` — only include if the builder provided an image or requested one to be generated
- \`Title\` and \`Contents\` are always required
- Never include internal references, agent names, or BuilderHub identifiers in the output

### Example — single post with subreddit only

\`\`\`
Mode: Reddit Post

Post 1 reddit post
Subreddit: r/CryptoCurrency
Title: I've been using Bitget Copy Trading for 3 months — honest take
Contents: Most people lose money in crypto by making emotional decisions. I started using Copy Trading on Bitget to take myself out of the equation.

After 3 months here's what I actually found:

What works well:
- Full P&L history visible before you copy anyone
- You set your own stop-loss — always in control of your risk
- No trading experience needed to start

What could be better:
- Takes time to find the right trader to copy — do your research first

Overall solid experience. Happy to answer questions.
\`\`\`

---

Related: [[Brand-Voice|Brand Voice and Content Guidelines]] · [[Reddit-Templates|Reddit Templates]] · [[Avoid-AI-Writing|Avoid AI-Sounding Writing]] · [[How-Campaigns-Work|How Campaigns Work]]`,
  },
  {
    id: "bitget-company-profile",
    source: "Bitget/Bitget-Company-Profile.md",
    meta: {"category":"bitget-info","type":"reference","intent":["product-info","content-creation"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# Bitget Company Profile

Core facts for creating accurate content about Bitget. Always cross-check against the latest official announcements before publishing specific figures.

## Company

- **Founded:** 2018
- **Headquarters:** Victoria, Seychelles
- **CEO:** Gracy Chen
- **Type:** Universal Exchange (UEX) — crypto, stocks, CFDs, forex, precious metals, commodities, and traditional finance assets
- **Website:** [bitget.com](https://www.bitget.com/)

## Scale

- **Registered users:** 150 million+ across 100+ countries
- **Top ranking:** Consistently top 3 globally by derivatives trading volume, with over 11% global derivatives market share
- **Copy Trading:** Largest copy trading platform by number of active copy traders
- **Supported assets:** 700+ cryptocurrencies on spot, 400+ on futures, plus stocks and CFDs

## Security & Trust

- **Protection Fund:** $451M+ Bitget Protection Fund as of March 2026 — maintained well above the $300M minimum commitment
- Proof of Reserves published regularly — verifiable on-chain
- 24/7 customer support

## Native Token

- **BGB (Bitget Token)** — Bitget's native utility token
- Used for: trading fee discounts, Launchpool participation, staking rewards, VIP tier benefits
- Listed on major exchanges

## Official Channels

- **X (Twitter):** [@bitget](https://x.com/bitget)
- **Reddit:** [r/BitgetReddit](https://www.reddit.com/r/BitgetReddit/)
- **Telegram:** [t.me/BitgetENOfficial](https://t.me/BitgetENOfficial)
- **Blog:** [bitget.com/blog](https://www.bitget.com/blog)
- Announcement Center: [bitget.com/support/announcement-center](https://www.bitget.com/support/announcement-center)

## Key Products (summary)

See the Bitget Trading Products note for full details on each product.

- Spot Trading — 700+ crypto pairs
- Futures — up to 150x leverage on major pairs, perpetual and delivery contracts
- Copy Trading — follow and auto-copy top traders
- Stocks 2.0 — tokenized stock spot with 1:1 economic mapping, USDT cash dividends, and collateral use
- CFDs — Contracts for Difference on stocks, indices, forex, and commodities
- TradFi Platform — stocks, forex, precious metals, oil, commodities, and indices under one account
- Bitget Earn — savings, staking, structured products
- Launchpool — early access to new token launches
- Trading Bots — grid, DCA, arbitrage automation
- Pre-market Trading — trade tokens before official listing
- BGB Token — native ecosystem token

## Content Note

When citing Bitget statistics in content, use phrases like "as of [current year]" and encourage readers to verify current figures on bitget.com. Do not state specific prices, APYs, or trading volumes as fixed facts — these change constantly.

---

Related: [[Bitget-Trading-Products|Bitget Trading Products]] · [[Brand-Voice|Brand Voice and Content Guidelines]] · [[Twitter-Templates|Twitter / X Templates]]`,
  },
  {
    id: "bitget-trading-products",
    source: "Bitget/Bitget-Trading-Products.md",
    meta: {"category":"bitget-info","type":"reference","intent":["product-info","content-creation"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# Bitget Trading Products

Reference for all major Bitget products. Use this when creating content to ensure accurate descriptions.

## Spot Trading

Buy and sell 700+ cryptocurrencies at live market prices. Bitget offers deep liquidity across major pairs (BTC, ETH, SOL, BNB, XRP) and emerging altcoins.

**Key points for content:**
- Deep liquidity, tight spreads on major pairs
- Fee discounts available with BGB
- Advanced order types: limit, market, stop-limit, trailing stop
- Simple and professional UI modes

---

## Futures & Derivatives

Trade perpetual and delivery futures contracts with leverage. Bitget is consistently top 3 globally by derivatives volume.

**Key points for content:**
- Up to 150x leverage on major pairs (BTC, ETH); up to 125x on other pairs
- USDT-margined and coin-margined contracts
- Perpetual contracts (no expiry) and fixed-date delivery contracts
- Stock perpetual futures — leveraged synthetic exposure to US stocks via USDT
- Advanced risk tools: TP/SL, trailing stop, isolated and cross margin modes

---

## Copy Trading

Bitget's flagship and most recognised product. Users can browse elite traders and automatically copy their trades in real time — no trading experience needed.

**Key points for content:**
- 190,000+ professional traders available to follow
- Full performance history, win rate, drawdown, and risk score visible before copying
- Profit-sharing model — traders earn from their copiers' profits
- Set your own copy amount, max drawdown, and stop-loss
- Works across spot and futures
- Suitable for beginners and passive investors

---

## Bitget Earn

Passive income products for holding crypto.

- **Flexible Savings** — deposit and withdraw anytime, earn daily interest
- **Fixed Savings** — lock funds for a set period (30, 60, or 90 days) at higher fixed APY
- **Staking** — stake proof-of-stake tokens and earn network rewards
- **Shark Fin** — principal-protected structured product with variable yield based on price range
- **HodlerYield** — interest-bearing tokens that earn a baseline APR, with additional yield available through promotions

**Key point:** Earn products are non-trading, lower-risk options suitable for holders.

---

## Launchpool (Launchpad)

Stake BGB or other supported tokens to earn allocations of new project tokens before they list publicly.

**Key points for content:**
- Early access to new listings at pre-market price
- Low risk — staked principal is returned after the pool ends
- High potential upside if the listed token performs well
- Only available while pool is active — time-limited

---

## Trading Bots

Automated trading tools that run 24/7 without manual input.

- **Grid Bot** — automatically buys low and sells high within a defined price range
- **DCA Bot** — dollar-cost averages into a position over time on a set schedule
- **Futures Grid Bot** — grid trading with leverage for advanced users
- **Arbitrage Bot** — exploits spread between spot prices on different pairs

**Key point:** Bots lower the barrier to strategy-based trading and reduce emotional decision-making.

---

## Pre-market Trading

Trade tokens before their official listing on Bitget's spot market — early price discovery on upcoming projects.

**Key points for content:**
- Buy and sell allocations of a token before it officially lists on spot
- Lets traders position early on anticipated listings, ahead of the crowd
- Price is discovered peer-to-peer between buyers and sellers pre-listing
- Higher risk — pre-listing prices are volatile, and positions settle when the token officially lists
- Strong angle for content around new and upcoming token launches

---

## Stocks 2.0

Bitget's upgraded tokenized stock spot product. Trade US stocks and ETFs using USDT with 1:1 economic mapping to the underlying asset — no separate brokerage account needed.

**Key points for content:**
- 1:1 economic mapping — dividends, stock splits, and corporate actions are reflected in token positions
- Cash dividends converted to USDT and credited directly to user accounts
- Stock tokens usable as collateral within Bitget's margin and yield ecosystem
- Same Bitget account — no brokerage setup required
- Trade major stocks 24/7 using USDT
- Zero maker fees; industry-low taker fees

---

## TradFi Platform

Launched January 5, 2026. Bitget's traditional finance trading platform bringing stocks, forex, precious metals, oil, commodities, and indices into one account alongside crypto.

**Key points for content:**
- Single account access to crypto and traditional markets
- Covers stock perpetual futures, tokenized stocks, forex, gold, silver, oil, indices
- Hit $2 billion daily trading volume within 3 days of launch
- Trade traditional assets using USDT — no separate fiat account needed

---

## CFDs (Contracts for Difference)

CFDs allow traders to speculate on the price movement of an asset — stocks, indices, forex, or commodities — without owning the underlying asset.

**Key points for content:**
- Trade price movements of stocks, indices, forex, and commodities
- Does not require owning the actual asset
- Leverage varies by asset — up to 500x on forex, stocks, and major commodities like gold and oil; lower on certain indices and other commodities. High leverage amplifies both gains and losses significantly
- Suitable for experienced traders who want broad market exposure with high leverage


---

## BGB — Bitget Token

Bitget's native ecosystem token with multiple utilities:

- **Fee discounts** — up to 80% off trading fees on spot and futures when paying with BGB
- **Launchpad** — BGB holders get early access to invest in new token launches before public listing
- **Launchpool** — stake BGB to earn new token allocations from upcoming projects
- **Staking rewards** — earn yield by staking BGB in Earn
- **VIP benefits** — BGB holdings count toward VIP tier calculation

---

Related: [[Bitget-Company-Profile|Bitget Company Profile]] · [[Brand-Voice|Brand Voice and Content Guidelines]] · [[Twitter-Templates|Twitter / X Templates]] · [[CoinMarketCap-Templates|CoinMarketCap Templates]]`,
  },
  {
    id: "builder-rewards-and-earnings",
    source: "BuilderHub/Builder-Rewards-and-Earnings.md",
    meta: {"category":"platform","type":"reference","intent":["platform-questions","campaign-help"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# Builder Rewards and Earnings

Builders earn rewards by getting content submissions approved in campaigns. Each campaign defines its own reward amount and structure.

## How Rewards Are Earned

1. Participate in an active campaign
2. Create and publish content on the required platform
3. Submit the post URL before the campaign deadline
4. Submission is reviewed and approved by the Bitget team
5. Approved submission earns the campaign reward

Only **approved** submissions earn rewards. Pending and rejected submissions do not count.

## Checking Your Earnings

Your reward history and current earnings are available in the **Achievement** section of your dashboard. This includes per-campaign breakdowns and total accumulated rewards.

## Payment

I don't have specific information on the payment schedule or method. Check the **Announcements** section on your dashboard for payment updates, or contact your manager directly for confirmed payout dates and payment details.

## Things That Affect Your Rewards

- Content must be posted on a **public account**
- Content must be posted on the **correct platform** specified by the campaign — submitting a Twitter link for a Reddit campaign will be rejected
- Content must go live **before the campaign deadline**
- Content must match the campaign brief — off-topic posts are rejected
- Duplicate submission links are not accepted
- Deleted or privatised posts after submission may affect approval
- Each campaign has a **max content per builder** limit — submissions beyond that limit do not count
- Campaigns operate on a **first come, first serve** basis — builders who submit early are prioritised. If a campaign reaches capacity, late submissions may not be accepted

## Reward Disputes

If you believe there is an error in your reward amount, contact your manager directly with the specific campaign name and submission details.

---

Related: [[BuilderHub-Campaign-Participation-Guide|BuilderHub Campaign Participation Guide]] · [[How-Campaigns-Work|How Campaigns Work]] · [[BuilderHub-Frequently-Asked-Questions|BuilderHub Frequently Asked Questions]]`,
  },
  {
    id: "builder-roles-and-access-levels",
    source: "BuilderHub/Builder-Roles-and-Access-Levels.md",
    meta: {"category":"platform","type":"reference","intent":["platform-questions"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# Builder Roles and Access Levels

BuilderHub has five membership levels. Each level has different access, responsibilities, and platform limits.

---

## Newjoiner

A pre-access status for people who have been invited but have not yet completed the onboarding bootcamp.

- **Cannot log into BuilderHub** — access is blocked until bootcamp is passed
- Once the bootcamp is completed, they are promoted to Trainee
- This is not an active role — it is a pending state

---

## Trainee

The entry-level active role. Trainees are new members who have passed the bootcamp and are in the learning and development phase.

- Full access to all standard BuilderHub features
- Can participate in campaigns they are eligible for
- Displayed with a **TRAINEE** badge on their profile
- Managed and guided by Lead Builders
- GetAgent: 20 chat messages and 10 image generations per 24-hour window
- Goal is to develop content skills and meet the standard required to become a Core Builder

---

## Core Builder

The standard active builder role. Core builders are established members who have proven their content quality and consistency.

- Full access to all standard BuilderHub features
- Can participate in all campaigns they are eligible for
- Displayed with a **CORE BUILDER** badge on their profile
- GetAgent: 20 chat messages and 10 image generations per 24-hour window
- Goal is to consistently produce high-quality content, grow their audience and engagement, and demonstrate the leadership potential needed to be promoted to Lead Builder

---

## Lead Builder

A senior leadership role. Lead builders are responsible for managing and mentoring both Trainees and Core Builders on their team. They are the bridge between the builder community and management.

- All Core Builder permissions, plus:
- **Manages Trainees and Core Builders** — responsible for the development, performance, and content quality of both groups on their team
- Displayed with a **LEAD BUILDER** badge on their profile
- GetAgent: **unlimited** chat and image generation — no daily cap
- First point of contact for their team — escalates issues to management when needed

---

## Manager

Internal Bitget team role. Not a content creator role — operational and administrative only.

- Displayed with a **MANAGER** badge on their profile
- Full platform access — can create, edit, and manage all campaigns and announcements
- Can view all builder and trainee data, analytics, and performance across all teams
- Can manage roles and builder approvals
- GetAgent: **unlimited** chat and image generation — no daily cap

---

## Access Summary

|              | Campaigns          | GetAgent         |
| ------------ | ------------------ | ---------------- |
| Newjoiner    | No access          | No               |
| Trainee      | Eligible campaigns | 20 chat / 10 img |
| Core Builder | Eligible campaigns | 20 chat / 10 img |
| Lead Builder | Eligible campaigns | Unlimited        |
| Manager      | All campaigns      | Unlimited        |

---

## GetAgent Daily Limits

Limits reset on a rolling 24-hour window from your first message of the day.

| Role | Chat | Image Generation |
|------|------|-----------------|
| Trainee | 20 / day | 10 / day |
| Core Builder | 20 / day | 10 / day |
| Lead Builder | Unlimited | Unlimited |
| Manager | Unlimited | Unlimited |

---

## Why a Builder Cannot See a Campaign

Campaign visibility depends on eligibility type — not all builders see all campaigns. If a builder cannot see a campaign others mention, it is because they are not in that campaign's target group. The How Campaigns Work note covers the full eligibility breakdown.

---

Related: [[BuilderHub-Website-Overview|BuilderHub Website Overview]] · [[How-Campaigns-Work|How Campaigns Work]] · [[Builder-Rewards-and-Earnings|Builder Rewards and Earnings]] · [[BuilderHub-Frequently-Asked-Questions|BuilderHub Frequently Asked Questions]]`,
  },
  {
    id: "builderhub-campaign-participation-guide",
    source: "BuilderHub/BuilderHub-Campaign-Participation-Guide.md",
    meta: {"category":"campaigns","type":"guide","intent":["campaign-help"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# BuilderHub Campaign Participation Guide

Step-by-step guide for builders on how to find, create, and submit campaign content successfully.

## Step 1 — Find a Campaign

Go to the **Campaigns** section. Only campaigns you are eligible for will appear. Before starting, check:
- Which platform is required (X, Reddit, CMC)
- The deadline
- The brief and any mandatory requirements
- Max content limit per builder

## Step 2 — Read the Brief Carefully

Read the full campaign details before writing anything. Note:
- The exact topic or angle required
- Any mandatory mentions (product name, hashtag, link)
- Any restrictions (no price predictions, no competitor mentions)
- Required format (single post, thread, article)

## Step 3 — Create Your Content

Use me to help draft your content. Tell me:
- The campaign topic
- Which platform it is for
- Any specific requirements from the brief

I will tailor the tone and format for the platform. Always review and personalise the output before posting — add your own voice and perspective.

- For X content: see the Twitter / X Templates note
- For Reddit content: see the Reddit Templates note
- For CMC content: see the CoinMarketCap Templates note
- For tone and rules: see the Brand Voice and Content Guidelines note

## Step 4 — Post on the Platform

Post your content on your own **public** account. Make sure:
- The account is set to public
- The post is live before the campaign deadline
- Copy the full post URL immediately after publishing

## Step 5 — Submit on BuilderHub

Go back to the campaign page on BuilderHub and submit your post URL. Keep the post live after submitting — deleting it may affect your approval.

## Step 6 — Wait for Review

The Bitget team reviews all submissions. You will be notified once your content is approved or rejected.

## Tips for Getting Approved

- **Be specific** — reference actual Bitget products, features, or data points
- **Be original** — each post needs a unique angle even within the same campaign
- **Match the platform** — a Reddit post that reads like a tweet will be rejected
- **Be informative, not just promotional** — content should provide value to the reader
- **No unverified claims** — do not state stats or facts you cannot confirm from official sources

## Common Rejection Reasons

- Content does not match the brief
- Submitted after the deadline
- Account is private or post was deleted
- Clearly AI-generated with no personalisation
- Contains factual errors about Bitget
- Missing required hashtags or mentions specified in the brief

---

Related: [[How-Campaigns-Work|How Campaigns Work]] · [[Builder-Rewards-and-Earnings|Builder Rewards and Earnings]] · [[Brand-Voice|Brand Voice and Content Guidelines]] · [[Writing-Guide|Writing Guide]] · [[Avoid-AI-Writing|Avoid AI-Sounding Writing]] · [[Twitter-Templates|Twitter / X Templates]] · [[Reddit-Templates|Reddit Templates]] · [[CoinMarketCap-Templates|CoinMarketCap Templates]]`,
  },
  {
    id: "builderhub-frequently-asked-questions",
    source: "BuilderHub/BuilderHub-Frequently-Asked-Questions.md",
    meta: {"category":"platform","type":"faq","intent":["platform-questions","campaign-help"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# BuilderHub Frequently Asked Questions

Answers to common questions from BuilderHub builders about the platform, campaigns, GetAgent, and rewards.

## Platform & Access

**Q: What is BuilderHub?**
BuilderHub is Bitget's official builder program. Builders earn rewards by creating content about Bitget on X, Reddit, and CMC through campaigns.

**Q: How do I join?**
BuilderHub is invite-only. The Bitget team selects builders based on audience size, content quality, and community presence. Contact your manager if you believe you should have access.

**Q: What is my role and what does it mean?**
There are five roles: Newjoiner, Trainee, Core Builder, Lead Builder, and Manager. Your role determines which features you can access and your daily GetAgent limits. Trainees and Core Builders get 20 chat messages and 10 image generations per day. Lead Builders and Managers have unlimited usage. See the Builder Roles and Access Levels note for full details on each role.

**Q: Why can I not see a campaign that another builder mentioned?**
Campaigns have eligibility types. Some are only visible to specific targeted builders or a manually selected group. If you are not in the target group, the campaign will not appear for you.

---

## Campaigns

**Q: Where do I find active campaigns?**
Go to the Content Campaigns section on your dashboard. Only campaigns you are eligible for will appear there.

**Q: How do I submit content for a campaign?**
Post your content on the required platform, copy the post URL, then submit it through the campaign page on BuilderHub. The Campaign Participation Guide covers the full step-by-step process.

**Q: How many submissions can I make per campaign?**
Each campaign has a maximum content limit per builder. Check the campaign detail page for the exact number.

**Q: What happens after I submit?**
Your submission goes to the Bitget review team. Once reviewed, it will be marked approved or rejected. Approved submissions count toward your campaign reward.

**Q: How does first come, first serve work for campaigns?**
Campaigns have a limited number of slots. Builders who submit earlier are prioritised — if a campaign reaches capacity, late submissions may not be accepted even if they are within the deadline. Submit as early as possible once a campaign goes live. Eligibility is also based on your past month's performance: follower count, average content score (impressions and engagement), trading volume, and product fans group tier. Your builder type and label assignment also determine which campaigns you qualify for.

**Q: Can I participate in multiple campaigns at the same time?**
Yes, as long as you are eligible for each campaign. Each campaign is independent — participating in one does not affect your eligibility for another.

**Q: Can I edit or update my submission after submitting?**
Submissions cannot be edited after they are submitted. If you submitted the wrong link or need to make a change, contact your leader or manager directly.

**Q: What are the common reasons a submission gets rejected?**
The most common reasons are: the account was private at the time of review, the content was posted on the wrong platform, the post went live after the campaign deadline, the content does not match the campaign brief, a duplicate submission link was used, the post was deleted or privatised after submission, the builder exceeded the maximum content limit for that campaign, or the campaign had already reached capacity before the submission was made (first come, first serve). Always review the campaign brief carefully and keep your post live and public after submitting.

**Q: Can I resubmit if my content is rejected?**
Contact your manager directly for resubmission queries — they can advise based on the specific campaign rules.

**Q: The campaign deadline passed — can I still submit?**
No. Submissions after the deadline are not accepted.

---

## GetAgent

**Q: What can GetAgent help me with?**
I can help you write content for X, Reddit, and CMC; research crypto, stocks, and market topics; generate images; answer questions about Bitget products and campaigns; and search the web for current news and prices.

**Q: How many messages can I send per day?**
Trainees and Core Builders get 20 chat messages and 10 image generations per 24-hour window. Lead Builders and Managers have unlimited usage.

**Q: How do I generate images?**
Switch to Image mode using the toggle below the chat input box, then describe the image you want. You can also edit a previously generated image by using it as a reference.

**Q: I reached my daily limit — when does it reset?**
Limits reset on a rolling 24-hour window from when you sent your first message. The exact reset time is shown in the chat header when you hit the limit.

---

## Rewards & Payments

**Q: How do I check my earnings?**
Your earnings and reward history are in the Achievement section of your dashboard.

**Q: When do I get paid?**
I don't have specific information on the payment schedule. Check the Announcements section on your dashboard or contact your manager directly for confirmed payout dates.

**Q: My reward amount looks wrong.**
Reach out to your manager directly — they can review and confirm your reward calculation.

---

Related: [[BuilderHub-Website-Overview|BuilderHub Website Overview]] · [[Builder-Roles-and-Access-Levels|Builder Roles and Access Levels]] · [[Builder-Rewards-and-Earnings|Builder Rewards and Earnings]] · [[BuilderHub-Campaign-Participation-Guide|BuilderHub Campaign Participation Guide]]`,
  },
  {
    id: "builderhub-website-overview",
    source: "BuilderHub/BuilderHub-Website-Overview.md",
    meta: {"category":"platform","type":"reference","intent":["platform-questions"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# BuilderHub Website Overview

BuilderHub is Bitget's official builder and ambassador program. It is a platform where selected community members — called builders — earn rewards by creating content that promotes Bitget across social media.

## What Builders Do

Builders create content on X (Twitter), Reddit, and CoinMarketCap (CMC) based on active campaign briefs. Each campaign specifies the topic, platform, deadline, and reward. Builders submit their published content links for review, and approved submissions earn rewards.

## Core Sections of the Platform

Available to all builders:
- **Announcements** — official updates from the Bitget team
- **Content Campaigns** — browse and participate in active content campaigns
- **Achievement** — track your content performance and earnings
- **Get Agent** — AI assistant for content creation, platform questions, and research
- **Community** — connect and interact with other builders in the BuilderHub community
- **Futures Market** — view all available Bitget futures pairs and navigate directly to their trading pages
- **Global** — a global map showing where builders are active around the world
- **Profile** — your personal profile, role badge, and account details

Lead Builder and Manager only:
- **Hall of Fame** — recognition for top-performing builders
- **Analytics** — full team performance data across all builders and trainees
- **Top Accounts** — ranking data by platform and content metrics

## Content Platforms

Builders publish content on:
- **X (Twitter)** — short-form posts, threads, engagement content
- **Reddit** — long-form educational posts, community discussions
- **CoinMarketCap (CMC)** — articles, project updates, market commentary

## How the Reward System Works

Builders earn by getting campaign submissions approved. Each campaign has its own reward structure. Rewards are tracked in the Achievement section.

## Who Can Join

BuilderHub is invite-only. Builders are selected by the Bitget team based on their audience, content quality, and community presence.

---

Related: [[Builder-Roles-and-Access-Levels|Builder Roles and Access Levels]] · [[Builder-Rewards-and-Earnings|Builder Rewards and Earnings]] · [[BuilderHub-Frequently-Asked-Questions|BuilderHub Frequently Asked Questions]] · [[How-Campaigns-Work|How Campaigns Work]]`,
  },
  {
    id: "campaign-planning-framework",
    source: "Campaigns/Campaign-Planning-Framework.md",
    meta: {"category":"campaigns","type":"guide","intent":["campaign-planning"],"platform":"—","access":["lead_builder","manager"]},
    body: `# Campaign Planning Framework

A planning framework for building content campaigns for Bitget Builders and similar creator communities. Use this when designing campaign structures, identifying content pillars, writing campaign briefs, or creating content calendar tables.

## Core Principle

This is not a fixed playbook. Reuse what works, adapt what does not, and change the structure, tone, pillar logic, and campaign count as needed — as long as the output clearly supports the campaign objective.

## Objective-First Approach

Always start by identifying:
- The campaign objective
- Who is posting
- Who needs to be influenced
- The desired action
- The main product, event, feature, or message USP
- Required tags, hashtags, links, or posting rules

Everything else should support that goal.

## Writing Style for Campaign Guidance

- Keep language simple, clean, and practical
- Write like a campaign manager supporting creators or community contributors
- Builders are contributors, not employees — use wording that is intentional and actionable, but not commanding
- Make titles and guidance clear enough to act on quickly
- Make sample content sound personal, natural, and experience-led rather than promotional

## Audience Lens

When the campaign is for Builders or creators:
- Treat them as community voices, not staff
- Avoid rigid or directive phrasing
- Use titles that signal the posting angle without sounding like orders
- Make content guidance easy to skim and easy to use

## Finding Content Pillars

Start by extracting raw themes from the brief:
- Discovery
- Turning point
- Opportunity
- Rewards
- Proof
- Growth
- Community
- Fun moments
- FOMO or urgency

Then decide whether the campaign needs broad or narrow pillars.

### Broad Pillar Examples

**3-pillar version:**
- **Wealth Opportunity** — rewards, profits, broader market access, UEX, outcomes, milestones
- **Real Moments, Memes & Fun** — relatable stories, humor, first experiences, creator personality
- **Growth & Community** — support, learning, identity, Builder/Fan Club journey, progress

**2-pillar version:**
- **Opportunity & Proof** — access, rewards, screenshots, milestones, outcomes
- **Stories & Vibes** — personal journey, emotion, community, fun, memorable moments

These are examples, not permanent rules.

## Combining Campaigns

If fewer campaigns are needed:
- Merge overlapping angles around the strongest shared USP
- Keep one main emotional angle and one main CTA
- Rewrite the title, pillar, key message, USP bullets, and sample post so the merged campaign feels intentional

Useful merges:
- Discovery + Turning Point
- Opportunity + Proof
- Growth + Community
- Mid-campaign + Final push

## Title Guidance

Good titles should:
- Be clear at a glance
- Feel creator-friendly
- Be actionable without sounding commanding
- Reflect the story angle, not just the task
- Stay concise

**Good examples:**
- \`Bitget Fan Story Launch: Looking Ahead to Your Bitget Story\`
- \`Telling How Bitget UEX Changed Your Journey\`
- \`UEX Wins, Community Growth\`

**Avoid:**
- Titles that sound like staff instructions
- Overly long titles
- Repeating "how" too often
- Mechanical wording

## Campaign Fields

Use these fields when building a campaign:
- **Campaign** — campaign name or number
- **Title** — creator-facing title
- **Content Pillar** — the thematic angle
- **Key Message** — one sentence, main story or value
- **Unique Selling Point + CTA** — short bullet phrases, not paragraphs
- **Example X Content** — short, personal, natural sample post
- **Timing** — when this campaign runs

Not every campaign needs every field — adjust to the task.

### Key Message
- One sentence when possible
- Focus on the main story or main value

### Unique Selling Point + CTA
Short bullet phrases, not long paragraphs:
- UEX opened new opportunities
- Real rewards or proof
- Community helped drive growth
- CTA: submit here [LINK]

### Example X Content
Keep it:
- Short
- Personal
- Natural
- Non-promotional
- Based on real user voice

Avoid: corporate copy, hard-sell language, too many hashtags, writing that sounds like an ad.

## Creator Must-Haves

When summarising content requirements for Builders, compress into a usable checklist:
- Real story only — not fully AI-written
- Use the required hashtag(s)
- Tag the required account(s)
- Add a CTA with [LINK] if needed
- Include one specific detail
- Add a visual when useful

## Guide Questions for Creators

When helping creators write posts, give only a few strong questions:
- What part of your story can you tease first?
- What real moment would make people want the full story?
- How can you keep it personal and simple?

## Table Format

For content calendars or campaign overviews, use a clean markdown table:

| Timing | Campaign | Title | Content Pillar | Key Message | Unique Selling Point + CTA | Example X Content |
|---|---|---|---|---|---|---|

**Table rules:**
- Keep cells concise
- Use phrase-based USP bullets
- Keep example posts short
- Make the table easy to paste into docs or sheets

## Links and Placeholders

If no real link is provided, use \`[LINK]\`. Do not invent URLs.

## Planning Workflow

1. Read the brief
2. Identify the objective, audience, desired action, and USP
3. Extract the strongest themes
4. Decide whether pillars should be broad or narrow
5. Build the campaign list around the strongest angles
6. Combine campaigns if needed
7. Tighten the titles
8. Shorten the USP into bullet phrases
9. Write concise sample posts
10. Format into a table if requested
11. Revise based on feedback

---

Related: [[How-Campaigns-Work|How Campaigns Work]] · [[Campaign-Strategy-and-Guidelines|Campaign Strategy and Guidelines]] · [[BuilderHub-Campaign-Participation-Guide|BuilderHub Campaign Participation Guide]] · [[Builder-Roles-and-Access-Levels|Builder Roles and Access Levels]] · [[Brand-Voice|Brand Voice and Content Guidelines]]`,
  },
  {
    id: "campaign-strategy-and-guidelines",
    source: "Campaigns/Campaign-Strategy-and-Guidelines.md",
    meta: {"category":"campaigns","type":"guide","intent":["campaign-planning"],"platform":"—","access":["lead_builder","manager"]},
    body: `# Campaign Strategy and Guidelines

Internal reference for planning and managing content campaigns on BuilderHub. Covers campaign structure, content policy, CTA frameworks, Bitget USPs, common content issues, and content pillar types.

---

## Campaign Flow

### Preparation Stage

- Build a Content Campaign Calendar from day 1 to the last day — maximum 2 campaigns per day
- Determine the key promotional message for each campaign (e.g. Bitget allowed retailers to buy SpaceX pre-IPO)
- Ensure alignment with other teams: Social Media, Product, Community
- Prepare all content narratives ahead of time — visuals need more lead time, prepare them earlier

### Pre-Heating Stage

**1. Rumours and Speculation — Create discussion and hype**
- Is Bitget the first or only exchange doing this?
- Align with Bitget's value: User's First
- Meme types: it's coming, can't wait, looking forward

**2. Competitor Comparison, Wealth Effect, and Countdown**
- Why users should choose Bitget: allocation amount, estimated returns, historical project comparisons, trustworthiness, compliance, Bitget's values
- Meme types: rich, wealthy

### Launch Day (T Day)

**1. Wealth Effect — promote participation before it's over**
- How much one will earn, upside potential

**2. Tutorial Guides, FAQs, and Visuals**
- Easy steps on how to participate (long banner image or short video)
- Step-by-step walkthrough (screen recording with voiceover)

**3. Builder-Led Participation**
- Share participation proof screenshot or video
- Share PnL screenshot
- Use wealth effect: Builders are users too — they want money opportunities
- Internal competitions: e.g. trading competition to promote trading activity so builders can produce better trading journal content
- Extra reward for first joiners
- If builders are convinced enough to join, promotional objectives are easier to achieve

---

## Content Policy

### Reward Mechanism

1. First Come First Serve basis — committed builders who submit early are rewarded
2. Past month benchmarks used for eligibility:
   - Followers
   - Average Content Score (Impression + Engagement)
   - Trading Volume
   - Product fans group tier
3. Builder type and eligibility determined by label assignment

### Campaign Objectives

1. Use Content Campaigns to encourage Builders to trade on Bitget Stock Futures or CFDs
   - Builders must incur trading volume on Stock Futures or CFDs
   - Builders extract PnL screenshots to use in their content
2. Create insightful content with a clear Call-To-Action
3. Influence users to trade on Bitget

---

## Strong Bitget CTA

A strong CTA drives more conversions. Use one of these five approaches in every campaign:

**1. Relate to Bitget Builder**
Credit the BuilderHub community as a resource for trading insight and invite users to join.
- *"Traded MSFT perpetuals and locked in some gains. Learned how to navigate the US market with the Bitget builder community. Credit to them for the key insight. Sending love to @bitget and its trading community. If you are interested in how to join, here's the website: [LINK] [attach PnL]."*

**2. Relate to Bitget Reference Materials**
Reference Bitget Academy, UEX Daily Report, or Bitget Blog as the source of trading insight.
- *"Bitget's UEX Daily Report was my go-to source each morning, guiding my TSLA trades, and my strategy worked perfectly." [Attach PnL]*
- *"The info that Bitget Academy provided has just made me $XXX USDT trading TSLA perps, here's how: ..." [Attach PnL]*

**3. Give Credit to a Bitget Feature**
Reference GetClaw, Gracy AI, GetAgent, or any other specific Bitget tool.
- *"GetClaw flagged $TSLA as a short-term 'Buy the rumour, sell the IPO' trade. I opened my stock futures position on Bitget to capture the quick move before the momentum faded!"*
- *"I traded $USO on Bitget CFD yesterday and netted $XXX thanks to GetClaw's insights. Here's how I did it: ..."*

**4. Relate to Bitget Stock Futures 24/7 Trading**
Highlight the ability to trade outside of standard market hours.
- *"I found out how to do early setups with Bitget Stock Futures 24/7 functions. Here's how I did it: ... [Attach PnL]"*
- *"24/7 access to Bitget Stock Futures means I never miss opportunities on companies reporting earnings outside market hours. [Attach PnL]"*

**5. Relate to Zero Fees or Low Fees**
Make the cost comparison concrete and personal.
- *"I traded $GOOGL on Bitget Stock Futures with zero fees, keeping more of my gains. If you are trading equities elsewhere, it's worth checking how much each position really costs you. [Attach PnL]"*
- *"Bitget's lower per-lot fees made a noticeable difference over time, and having access to high leverage of up to 500x is useful when used carefully."*

---

## Bitget Unique Selling Points (USPs)

| Pain Point | Unique Selling Point |
|---|---|
| Too many trading apps | Bitget offers crypto, stocks, ETFs, precious metals, forex, and commodities in a single app — Global Alpha in One |
| Earnings reports released after market close | Bitget Stock Futures trades 24/7, capturing the move as earnings release |
| Difficulty identifying similar setups across multiple stocks | GetClaw identifies comparable setups and automatically optimizes entry |
| High trading fees reduce profit on frequent trades | Bitget Stock Futures offers lower fees vs other platforms |
| Limited access to leverage for strategy scaling | Bitget Stock Futures up to 100x leverage; Bitget CFD up to 500x leverage |
| Lack of confidence executing complex strategies | Copy Trading on Bitget allows following top traders immediately |

### Stocks — Zero Fees
- Showcase low or no fees on Bitget transaction history
- Compare with other exchanges to prove Bitget is the cheapest option
- *"I traded MSFT on OKX and Bitget, and I was able to save more on Bitget." [Show screenshot comparing fees]*

### Stocks — 24/7 Trading
- Showcase a real case study: Weekend market news → trade setup on weekday → builder profits on Monday open
- Compare with other exchanges: are they also offering this, and across how many pairs?

### CFDs — 500x Leverage
- High profit trading experience and stories
- Compare with other exchanges: are they also offering this, and up to how much leverage?

---

## Builder Common Issues

Content that falls into any of these categories will be rejected:

1. **Compliance / Security** — Old logo, wrong brand color, wrong website or link, outdated compliance wording, incorrect risk disclaimer, or any content creating regulatory, security, or impersonation risk

2. **Wrong Facts / Timing** — Wrong product features, wrong market facts, wrong image, misleading comparisons, or information disclosed before it is allowed to be public

3. **Sensitive / Inappropriate Content** — NSFW, religion, politics, hate speech, discrimination, violence, or anything inappropriate for broad public communication

4. **Trust / Risk Misrepresentation** — Misleading profit claims, guaranteed returns, "risk-free" language, fake screenshots or testimonials, unclear leverage or liquidation risk, or any wording that overpromises

5. **Brand / Reputation Risk** — Offensive tone, insulting competitors or users, low-quality spammy copy, excessive shilling, or anything that makes Bitget look unprofessional, deceptive, or scammy

6. **Legal / IP Risk** — Unauthorized use of third-party logos, copyrighted images, celebrity or KOL likeness, event branding, partner assets, or trademarks without proper rights, approval, or attribution

7. **Channel / Audience Mismatch** — Content acceptable on one channel but high-risk in another — overly promotional or aggressive messaging placed in high-quality communities where it is more likely to be attacked, reported, or damage brand trust

---

## Content Pillars

### Key Selling Points by Product

| Product | Key Selling Point |
|---|---|
| Stocks | 24/7 trading; Zero fees |
| CFD | 500x leverage |
| UEX | "Global Alpha In One" |
| Bitget Fan Club | "Trade smarter, build together" |

### Speculation and Rumors

Builders do not need confirmed information to create speculation content. As long as there is a hint, a leak, or a pattern, content can be produced quickly and consistently, keeping builders relevant and active.

- Reference early signals or rumours about a market event
- Ask whether Bitget is the first or only exchange positioned for this
- Create discussion and anticipation before official confirmation

### GetClaw Content

**Educational — What GetClaw Does**
- Pulls live snapshot price
- Weekly price action review
- Provides 3-4 trading scenarios with a Best Read recommendation

**Practical Trading — How GetClaw Improves Trading**
- Use screen recording to explain how GetClaw helps with trading decisions
- Showcase how easy it is to set up GetClaw
- Always hide sensitive account information in recordings

**Myth-Busting — AI Trading Is Not Passive Income**
- You need to think of a good prompt
- Cite things GetClaw cannot do
- Builds authority and prevents content from sounding like hype

### CFD and Stock Futures Content Pillars

| Content Pillar | Angle |
|---|---|
| **Thematic Trading + Wealth Opportunity** | Time-sensitive market hot topics: technical analysis, strategies, news, economic data, smart money, whale watch, live trading execution |
| | Trading psychology and risk management: systematic position sizing, stop-loss logic, drawdown control |
| **Macro and Cross-Asset** | US dollar index, rate expectations, US stocks-crypto correlation, commodities. This type of content gets significantly more reach and discussion than evergreen product posts |
| **Bitget CFD Advantages vs Other Brokers** | Compare fees, leverage, slippage, deposit flow — pure conversion content |
| **Trading Journal** | Trade recaps, psychology and mindset, strategy and setup reviews, risk management, market conditions, mistakes and lessons, performance metrics, goals and accountability, pre-market prep, education and research |

---

Related: [[Campaign-Planning-Framework|Campaign Planning Framework]] · [[BuilderHub-Campaign-Participation-Guide|BuilderHub Campaign Participation Guide]] · [[How-Campaigns-Work|How Campaigns Work]] · [[Brand-Voice|Brand Voice and Content Guidelines]] · [[Bitget-Trading-Products|Bitget Trading Products]]`,
  },
  {
    id: "how-campaigns-work",
    source: "Campaigns/How-Campaigns-Work.md",
    meta: {"category":"campaigns","type":"reference","intent":["campaign-help"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# How Campaigns Work

Campaigns are time-limited content tasks. Each campaign has a topic, required platform, deadline, and eligibility rules.

## What a Campaign Contains

- **Title** — name and topic of the campaign
- **Platform** — where to post: X, Reddit, CMC, or a combination
- **Deadline** — last date to submit your content
- **Max content per builder** — how many submissions one builder can make (shown as ∞ if no limit)
- **FCFS Limit** — First Come First Serve limit. When set to a number (e.g. 10), it means the first 10 Trainees and the first 10 Core Builders to get their submission approved earn the reward — the quota applies per builder tier, not as a single combined pool. Once a tier's quota is filled, further submissions from that tier are not rewarded even if the deadline has not passed. When not set, the field shows — and there is no FCFS restriction.
- **Status** — Ongoing or Completed
- **Brief / Details** — exactly what the content should cover, tone, and requirements

Reward amounts are not displayed on the campaign page — builders should check announcements or ask their manager.

A submission earns a reward only when all of the following are met: it is approved by the review team, it passes the platform rules below, the builder has not exceeded their max content limit, the FCFS quota for their tier has not been filled (if FCFS is set), and the content does not fall into any rejection category.

## Campaign Eligibility Types

Not all builders see all campaigns. There are three eligibility types:

### Target Team
Only shown to builders assigned to a specific team. Builders on the correct team see it; others do not.

### Target Label
Only shown to builders who have been assigned a specific label by the Bitget team. Builders with the correct label see it; others do not.

### Manual Selection
The Bitget team hand-picks specific builders for this campaign. Only selected builders can see and submit.

**This is why some builders see campaigns others cannot — it is by design based on eligibility type.**

## Campaign Lifecycle

1. Bitget team creates the campaign with a brief, deadline, and eligibility rules
2. Campaign becomes visible to eligible builders
3. Builders read the brief, create content, post on the required platform
4. Builders submit their post URL through the campaign page on BuilderHub
5. Bitget review team approves or rejects each submission
6. Approved submissions earn the campaign reward

## Platform Rules

- **X (Twitter)** — account must be public, post must stay live
- **Reddit** — post in relevant crypto subreddits, must follow Reddit's self-promotion rules, account must be genuine
- **CMC** — articles must be informative and follow CoinMarketCap's content guidelines

## What Gets a Submission Rejected

- Content does not match the campaign brief
- Posted after the deadline
- Account is private or the post was deleted
- Off-topic, misleading, or contains unverified claims about Bitget
- Submission is a duplicate of another post with no original angle

---

Related: [[BuilderHub-Campaign-Participation-Guide|BuilderHub Campaign Participation Guide]] · [[Campaign-Strategy-and-Guidelines|Campaign Strategy and Guidelines]] · [[Builder-Rewards-and-Earnings|Builder Rewards and Earnings]] · [[Brand-Voice|Brand Voice and Content Guidelines]] · [[Builder-Roles-and-Access-Levels|Builder Roles and Access Levels]]`,
  },
  {
    id: "coinmarketcap-templates",
    source: "Content-Templates/CoinMarketCap-Templates.md",
    meta: {"category":"content-templates","type":"template","intent":["content-creation"],"platform":"cmc","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# CoinMarketCap (CMC) Templates

Ready-to-use templates for CoinMarketCap (CMC) campaign articles and posts. CMC content should be informative, data-driven, and written for a knowledgeable crypto audience.

---

## Planning Your Article — COR Brief

CMC articles go through editorial review and need a clear angle before drafting. Define your brief using the COR format before writing.

| Field | What it covers |
| --- | --- |
| **C — Context** | What the article is about and why it's relevant right now — product launch, market trend, new listing, or educational topic |
| **O — Objective** | What the article should achieve — educate readers, cover an announcement, rank on CMC search, or drive sign-ups |
| **R — Reference** *(optional)* | Official announcements, data sources, stats, product details, or previously published CMC articles to reference or avoid duplicating |

CMC rewards original angles — the more specific your context and objective, the better the final article.

---

## CMC Content Guidelines

- Tone is formal and informative — not casual like X
- Cite specific data points: user counts, dates, volume figures, product names
- Use clear headings and structured sections
- Aim for 400–700 words unless the campaign brief specifies otherwise
- Include a risk disclaimer at the end
- Avoid superlatives without evidence — "largest" and "best" need a source

---

## Template 1 — Product Feature Article

Use when covering a specific Bitget product or feature.

\`\`\`
Title: [Product Name]: [a specific angle — vary the format, don't reuse one fixed title for every article]

Introduction:
[2-3 sentences: what the product is and why it matters to traders now. Include one concrete detail or number.]

## What is [Product Name]?

[Clear definition. No jargon unless you explain it in the same sentence.]

## Key Features

- **[Feature name]:** [What it does and why it matters to the trader — be concrete, not generic]
- **[Feature name]:** [What it does and why it matters]
- **[Feature name]:** [What it does and why it matters]

## How to Get Started

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Who Should Use This

[The ideal user — beginner, active trader, passive holder — and who it is NOT for]

## Summary

[1-2 sentence takeaway + soft link to Bitget. No superlatives without evidence.]

*[Risk disclaimer — required on every CMC article.]*
\`\`\`

**Example — Bitget Earn:**

> **Bitget Earn: What It Is, How It Works, and Who It's For**
>
> Not every crypto holder wants to trade actively. For those who would rather put idle assets to work, Bitget Earn offers a range of products designed to generate yield on holdings without day-to-day trading.
>
> **What is Bitget Earn?**
> Bitget Earn is a suite of passive-income products that let users earn yield on the crypto they already hold. It groups several options — from flexible savings to staking — in one place.
>
> **Key Features**
> - **Flexible Savings:** deposit and withdraw at any time while earning daily interest — suited to users who want to keep access to their funds.
> - **Fixed Savings:** lock funds for a set term (for example 30, 60, or 90 days) in exchange for a higher fixed APY.
> - **Staking:** stake proof-of-stake tokens to earn network rewards directly through the platform.
>
> **How to Get Started**
> 1. Open the Earn section in your Bitget account.
> 2. Choose a product that matches how long you can commit your funds.
> 3. Confirm the amount and subscribe — accrued yield shows in your account.
>
> **Who Should Use This**
> Earn suits longer-term holders and lower-risk users who want assets to generate yield rather than sit idle. Rates and lock-up terms vary by product, so read them before subscribing.
>
> **Summary**
> Bitget Earn turns idle holdings into yield-generating positions, with options ranging from fully flexible to fixed-term. Current rates are listed in the Earn section on Bitget.
>
> *This article is for informational purposes only and is not financial advice. Yields vary and are not guaranteed. Crypto involves risk.*

---

## Template 2 — News / Announcement Article

Use when a campaign requires covering a new listing, partnership, or milestone.

\`\`\`
Title: Bitget [Lists/Launches/Announces] [SUBJECT]: Key Details

Introduction:
[What happened, when, and why it matters — 2 sentences. State only confirmed facts; never pre-announce unconfirmed details.]

## What Was Announced

[Key details in short bullets or paragraphs — confirmed information only]

## Key Details

| Detail | Info |
|--------|------|
| Date | [DATE] |
| Platform | [Spot / Futures / etc.] |
| [Other field] | [Value] |

## Why It Matters for Traders

[2-3 sentences on significance — concrete, not hype]

## How to Access

[Steps to find the feature or listing on Bitget]

*For official updates, follow Bitget's announcement channels.*
\`\`\`

**Example — Stocks 2.0:**

> **Bitget Launches Stocks 2.0: Key Details**
>
> Bitget has rolled out Stocks 2.0, an upgraded tokenized-stock product that lets users trade US equities and ETFs using USDT. The launch brings traditional equity exposure into the same account as crypto.
>
> **What Was Announced**
> Stocks 2.0 introduces tokenized stocks with 1:1 economic mapping to the underlying shares, including cash dividends paid out in USDT. The first batch covers major names such as Apple, Tesla, NVIDIA, and the QQQ ETF.
>
> **Key Details**
> | Detail | Info |
> |--------|------|
> | Product | Stocks 2.0 (tokenized stock spot) |
> | Settlement | USDT |
> | Dividends | Paid in USDT, 1:1 economic mapping |
> | First batch | Major US stocks and ETFs |
>
> **Why It Matters for Traders**
> It removes the need for a separate brokerage account to get equity exposure. The stock tokens can also be used within Bitget's wider ecosystem, and they trade outside standard US market hours.
>
> **How to Access**
> Open the relevant market on Bitget, select a tokenized stock, and trade it using USDT from your existing account.
>
> *For official updates and the full asset list, follow Bitget's announcement channels.*

---

## Template 3 — Educational Overview

Use for broader educational content with a natural Bitget reference.

\`\`\`
Title: What Is [TOPIC]? A Complete Guide

Introduction:
[Why this topic matters right now — open with a specific point, not a generic "In today's world…" line]

## Understanding [TOPIC]

[Explanation — start simple, build to intermediate level]

## Key Concepts

- **[Concept]:** [Brief, plain-language explanation]
- **[Concept]:** [Brief, plain-language explanation]

## Benefits and Risks

**Benefits:**
- [Benefit]
- [Benefit]

**Risks:**
- [Risk — be honest; balanced content reads as more credible]
- [Risk]

## How to Access [TOPIC] on Bitget

[Natural mention of the relevant Bitget feature with a link]

## Key Takeaway

[One clear point the reader walks away with — a concrete insight or next step, not a restatement of what you already covered]

*This article is for educational purposes only. Crypto trading involves risk.*
\`\`\`

**Example — Perpetual Futures:**

> **What Are Perpetual Futures? A Complete Guide**
>
> Perpetual futures are among the most traded instruments in crypto, yet many newer traders use them without fully understanding how they work. This guide breaks down the basics.
>
> **Understanding Perpetual Futures**
> A perpetual future is a contract that lets you trade the price of an asset without owning it — and unlike traditional futures, it has no expiry date, so you can hold the position as long as your margin supports it.
>
> **Key Concepts**
> - **Funding rate:** a periodic payment between long and short traders that keeps the contract price in line with the spot price.
> - **Leverage:** lets you control a larger position with less capital, which magnifies both gains and losses.
>
> **Benefits and Risks**
> **Benefits:**
> - Trade both rising and falling markets (long or short)
> - No expiry date to manage
>
> **Risks:**
> - Leverage can trigger liquidation if the market moves against you
> - Funding costs add up on positions held over time
>
> **How to Access Perpetual Futures on Bitget**
> Bitget offers perpetual contracts with up to 150x leverage on major pairs like BTC and ETH. Risk tools such as take-profit, stop-loss, and isolated margin are available in the futures interface.
>
> **Key Takeaway**
> Perpetual futures are flexible, but leverage cuts both ways — size positions conservatively and set a stop-loss before entering, not after.
>
> *This article is for educational purposes only. Crypto trading involves risk.*

---

## Template 4 — Market Commentary / Analysis

Use when a campaign calls for market analysis or commentary tied to Bitget. Explain what is happening and why — never predict prices.

\`\`\`
Title: [Asset or Theme]: [The Question or Angle the Article Answers]

Introduction:
[What is happening in the market right now and why it is worth reading — 2-3 sentences, specific and current]

## What's Driving the Market

[The key factors behind the current move — macro data, sentiment, on-chain activity, sector rotation. Cite specifics, not vague claims.]

## What to Watch

[Upcoming catalysts or levels traders are monitoring — frame as factors to watch, NOT price predictions]

## How Traders Are Positioning

[Practical context — approaches or tools traders use in this environment. Natural Bitget reference if relevant: futures for hedging, Copy Trading to follow experienced traders, risk tools]

## Key Takeaway

[One clear, useful insight the reader leaves with — not a price call]

*This article is for informational purposes only and is not financial advice. Crypto markets are volatile and involve risk.*
\`\`\`

**Example — Bitcoin Market Commentary:**

> **Bitcoin and the Macro Picture: What's Moving the Market**
>
> Bitcoin's moves rarely happen in isolation — they increasingly track macro events like interest-rate decisions and broader risk sentiment. Understanding that link helps explain the current price action.
>
> **What's Driving the Market**
> Recent volatility has lined up with shifts in rate expectations and equity-market sentiment. When risk appetite rises across stocks, crypto has often followed; when it cools, the same tends to apply. On-chain flows and ETF activity have added to the swings.
>
> **What to Watch**
> Traders are watching upcoming macro data and central-bank commentary, alongside funding rates and liquidation levels that can amplify short-term moves. These are factors to monitor — not signals of a guaranteed direction.
>
> **How Traders Are Positioning**
> In choppy conditions, some traders hedge with perpetual futures rather than selling spot, while others follow more experienced traders through Copy Trading instead of timing the market themselves. Risk tools like stop-loss orders matter more, not less, when volatility is high.
>
> **Key Takeaway**
> Bitcoin increasingly trades as a macro asset, not just a crypto one. Watching the same data the broader market watches — and managing risk tightly — tends to beat trying to predict the next move.
>
> *This article is for informational purposes only and is not financial advice. Crypto markets are volatile and involve risk.*

---

## CMC Tips

- Include at least one verifiable statistic — link to the source where possible
- Internal links to the Bitget listing on CMC are allowed and help with visibility
- CMC articles go through editorial review — submit early, not on the campaign deadline day
- Avoid duplicating content that is already published on CMC — original angles rank better

---

Related: [[Brand-Voice|Brand Voice and Content Guidelines]] · [[Writing-Guide|Writing Guide]] · [[Avoid-AI-Writing|Avoid AI-Sounding Writing]] · [[Bitget-Company-Profile|Bitget Company Profile]] · [[Bitget-Trading-Products|Bitget Trading Products]]`,
  },
  {
    id: "reddit-templates",
    source: "Content-Templates/Reddit-Templates.md",
    meta: {"category":"content-templates","type":"template","intent":["content-creation"],"platform":"reddit","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# Reddit Templates

Ready-to-use templates for Reddit posts. Reddit requires genuine value and transparency — posts that read like ads get downvoted or removed. Always personalise.

---

## Planning Your Post — COR Brief

Before writing, clarify your brief using the COR format. A clear brief before you start prevents wasted effort and produces better output — whether you're writing yourself or requesting a draft.

| Field | What it covers |
| --- | --- |
| **C — Context** | What the post is about and the background |
| **O — Objective** | What the post should achieve (educate, drive sign-ups, share news, spark discussion) |
| **R — Reference** *(optional)* | Links, stats, tone examples, or any material to base the post on |

The clearer the brief, the better the output. A specific angle ("why copy trading reduces emotional decision-making") always outperforms a broad topic ("copy trading").

---

## Recommended Subreddits

| Subreddit | Best for |
| --- | --- |
| r/CryptoCurrency | General crypto discussion, large audience |
| r/CryptoMarkets | Market analysis, trading discussion |
| r/BitcoinMarkets | Trading-focused, data-driven posts |
| r/defi | DeFi and yield topics |
| r/BitgetReddit | Official Bitget community |
| r/CryptoTechnology | Technology and product deep dives |

**Check each subreddit's rules before posting** — most have specific flair requirements and self-promotion limits.

---

## Content Limits

| Field | Reddit Limit |
| --- | --- |
| Title | 300 characters maximum |
| Body | 40,000 characters maximum |

---

## What Makes Reddit Content Work

Reddit readers are sceptical and experienced — they immediately spot promotional or AI-generated content. Every post should feel like a real person sharing a genuine experience.

- **Personal angle** — start from your own experience with a specific timeframe ("I've been using this for 3 months", "I put in $200 to test it")
- **Specific angle, not a broad topic** — "why copy trading reduces emotional decision-making" lands better than just "copy trading"
- **Target audience in mind** — know who you're writing for ("for beginners who have never tried crypto") and write to them directly
- **Include key facts or data** — concrete numbers build credibility ("Bitget has 150M+ users", "3-month win rate of X%")
- **Admit at least one weakness** — one-sided praise reads as an ad and gets flagged as spam. Reddit rewards transparency over pure promotion
- **End with a genuine question** — drives comments and signals you want real engagement, not just upvotes
- **No emojis in posts or titles** — Reddit is text-first. Emojis flag content as low-effort or bot-generated
- **Disclosure at the bottom** — add a brief, generic note that you use or trade on Bitget. Most subreddits require some disclosure for promotional content. Keep it simple and never mention BuilderHub or any program affiliation

---

## Template 1 — Educational / How-To

Best for explaining a concept or feature in depth.

\`\`\`
Subreddit: [pick the subreddit and check its self-promotion rule first]

Title: How [TOPIC] works — a guide for [AUDIENCE]

[Opening: your personal angle — why YOU looked into this, with a specific detail or timeframe. 2-3 sentences]

## What is [TOPIC]?

[Clear explanation — start simple]

## How it works

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Who it is best for

[The ideal user — beginner, active trader, passive holder — and who it is not for]

## Risks to be aware of

[Be honest — Reddit users respect transparency and distrust one-sided posts]

## My take

[Personal perspective — this is what makes it feel authentic vs promotional]

[Genuine question for the community — drives comments and signals you want real engagement, not just upvotes]

*Disclosure: [A brief, generic note that you use Bitget — e.g. "I trade on Bitget." Keep it simple; never mention BuilderHub or any program. Most subreddits require some disclosure for promotional content.]*
\`\`\`

**Example — How DCA bots work:**

> **Title: How DCA bots actually work — a guide for people tired of trying to time the market**
>
> I spent my first year in crypto buying tops and panic-selling bottoms. What finally helped was automating my entries with a DCA bot, so here's how they work for anyone considering one.
>
> **What is a DCA bot?**
> DCA stands for dollar-cost averaging — buying a fixed amount on a schedule instead of trying to pick the perfect moment. A DCA bot just automates that: it places the buys for you at set intervals.
>
> **How it works**
> 1. You pick the asset and how much to buy each interval.
> 2. You set the schedule (daily, weekly, or on a price condition).
> 3. The bot runs the buys automatically and you track the average entry over time.
>
> **Who it is best for**
> Mostly beginners and busy people who don't want to watch charts, plus anyone who knows they trade emotionally. It is not for people chasing fast short-term gains.
>
> **Risks to be aware of**
> A bot is not a profit guarantee. If the asset keeps falling, you keep buying into a downtrend — it removes emotion, not market risk. You still have to choose an asset you actually believe in.
>
> **My take**
> The biggest value for me wasn't returns, it was removing the daily decision I kept getting wrong. I run it on assets I plan to hold anyway and ignore the noise.
>
> I use the bot on Bitget, but the concept works anywhere. Anyone else automate their buys — do you DCA on a fixed schedule, or only when price drops a set percentage?
>
> *Disclosure: I use Bitget myself.*

---

## Template 2 — Market Analysis / Opinion

Best for connecting a market event to a Bitget feature naturally.

\`\`\`
Subreddit: [pick the subreddit and check its self-promotion rule first]

Title: [Market event or trend] — what it means for [TOPIC]

[Opening: brief summary of what is happening in the market right now]

## Why this matters

[2-3 paragraphs of genuine analysis — not just promotion. No price predictions.]

## How I'm approaching it

[Your strategy or tool — natural Bitget mention if it is relevant]

## TL;DR

- [Point 1]
- [Point 2]
- [Point 3]

[Genuine question for the community]

*Disclosure: [A brief, generic note that you use Bitget — never mention BuilderHub or any program. Required by most subreddits for promotional content.]*
\`\`\`

**Example — macro events + risk management:**

> **Title: Rate-decision weeks keep wrecking my spot bags — here's what I changed**
>
> Every time there's a big macro event (rate decisions, CPI prints), my portfolio goes on a rollercoaster and I used to just hold and hope. Here's how I started thinking about it differently.
>
> **Why this matters**
> Crypto increasingly moves with macro risk sentiment. Around scheduled events, volatility spikes and liquidations cluster — so the same move that wrecks an over-leveraged account barely touches someone who planned for it. The event matters less than how positioned you are going into it.
>
> **How I'm approaching it**
> I stopped trying to predict the outcome. I size down before known events, and when I want to stay exposed without selling spot, I'll hedge with a small perpetual futures position instead. For the parts of the market I don't follow closely, I lean on Copy Trading rather than guessing. None of this is about calling direction — it's about not being forced to sell at the worst moment.
>
> **TL;DR**
> - Volatility around macro events is predictable even when direction isn't
> - Position sizing matters more than the call
> - Hedging or copying beats panic-selling spot
>
> How does everyone else handle scheduled macro events — size down, hedge, or just hold through it?
>
> *Disclosure: I trade on Bitget.*

---

## Template 3 — Honest Review

Best for discussing a Bitget feature in a credible, balanced way.

\`\`\`
Subreddit: [pick the subreddit and check its self-promotion rule first]

Title: I've used [FEATURE] on Bitget for [X months] — honest review

[Opening: who you are and why you started using it — include a specific detail like a timeframe or amount]

## What works well

- [Genuine positive 1]
- [Genuine positive 2]

## What could be better

- [Honest criticism — this is what builds credibility]

## Who should use it

[The right user profile for this feature — and who it is not for]

## Verdict

[Balanced conclusion]

[Genuine question for the community — ask something readers can answer from their own experience]

*Disclosure: [A brief, generic note that you use Bitget — never mention BuilderHub or any program. Required by most subreddits for promotional content.]*
\`\`\`

**Example — Honest Review (Copy Trading):**

> **Title: I've used Bitget Copy Trading for 3 months — what I actually found**
>
> Started because I kept making the same mistake: entering positions on emotion, not analysis. A friend mentioned Copy Trading so I gave it a shot with a small amount to test it first.
>
> **What works well**
> - Full P&L history, win rate, and drawdown stats are visible before you copy anyone — you can actually evaluate a trader, not just trust a leaderboard number
> - You set your own stop-loss and max copy amount — you stay in control of your risk at all times
> - No trading experience needed to get started
>
> **What could be better**
> - Finding the right trader to copy takes real time. The filters help but you still need to do your homework — don't just copy whoever's sitting at the top of the list
>
> **Who should use it**
> Best for people who want crypto exposure without watching charts all day. Not a passive income machine — your results depend entirely on who you copy and how you manage your risk settings.
>
> **Verdict**
> Solid product. The transparency on trader stats is what sets it apart. Still use it alongside my own trades.
>
> Anyone else use copy trading? Curious how people approach picking a trader to follow — do you go by win rate, drawdown, or something else?
>
> *Disclosure: I use Bitget Copy Trading.*

---

## Reddit-Specific Rules

- Follow each subreddit's self-promotion rules before posting
- Reply to comments in the first hour — early engagement boosts post visibility significantly
- Post body must stand alone — do not just drop a link with no content
- Avoid all-caps headlines — they read as clickbait and get downvoted
- Flair your post correctly per each subreddit's requirements
- Avoid posting the same content across multiple subreddits on the same day — cross-posting is fine but space it out

---

Related: [[Brand-Voice|Brand Voice and Content Guidelines]] · [[Writing-Guide|Writing Guide]] · [[Avoid-AI-Writing|Avoid AI-Sounding Writing]] · [[Reddit-Posting|Reddit Auto Posting]] · [[Bitget-Company-Profile|Bitget Company Profile]] · [[Bitget-Trading-Products|Bitget Trading Products]]`,
  },
  {
    id: "twitter-templates",
    source: "Content-Templates/Twitter-Templates.md",
    meta: {"category":"content-templates","type":"template","intent":["content-creation"],"platform":"twitter","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# Twitter / X Templates

Ready-to-use templates for X (Twitter) posts. Replace \`[BRACKETS]\` with real details. Always personalise — add your own voice and perspective before posting.

---

## Planning Your Post — COR Brief

Before writing, define your brief using the COR format. Twitter is fast-moving — a clear brief before you start prevents drafts that miss the objective.

| Field | What it covers |
| --- | --- |
| **C — Context** | What the tweet or thread is about — the market moment, product angle, or news hook |
| **O — Objective** | What the content should achieve — engagement, education, clicks, awareness, or a reaction to a trend |
| **R — Reference** *(optional)* | Stats, price data, links, trending topics, or tone examples to match |

A single tweet needs a sharp objective. A thread needs context. Settle both before drafting.

---

## Content Limits

| Format | Limit |
| --- | --- |
| Single tweet | 280 characters |
| Thread | 280 characters per tweet, no cap on tweet count |

---

## Template 1 — Product Spotlight

\`\`\`
[Hook — a bold claim or question. Be specific, not "Bitget is great"]

[One line linking the hook to the product — vary the wording; don't always use "Here's why X traders use…"]

→ [Benefit 1 — concrete, e.g. "see a trader's win rate before you copy"]
→ [Benefit 2 — concrete]
→ [Benefit 3 — concrete]

[Optional proof point — a real number or stat]

[Link] #Bitget #[ProductHashtag] #Crypto
\`\`\`

**Example — Copy Trading:**
> 190,000+ traders on @bitget aren't trading alone.
>
> Here's why Copy Trading changed how people invest:
>
> → See full performance history before you copy anyone
> → Auto-copy trades with your own risk limits set
> → Start with any amount — no experience needed
>
> Passive investing in crypto finally makes sense.
>
> bitget.com #Bitget #CopyTrading #Crypto

---

## Template 2 — Market Commentary + Bitget Angle

Use when there is a notable market event, price move, or news cycle that connects naturally to a Bitget product. The hook must be a specific observation — not a vague market comment.

\`\`\`
[Hook: one specific market observation — a price level, a trend, or a news event. Be concrete, not vague. Never predict a price.]

[Why this is relevant to a named Bitget product — one or two sentences]

[What traders can actually do on Bitget in this environment — practical, not just promotional]

[Link]

#Bitget #Crypto #[RelevantTopic]
\`\`\`

**Example — volatility + futures angle:**
> BTC just had one of its sharpest weekly swings in months, and funding flipped negative.
>
> When volatility spikes like this, the over-leveraged get flushed first.
>
> This is exactly when risk tools earn their keep — set your stop-loss and size down before the move, not after it.
>
> Trade futures with proper risk controls on @bitget → bitget.com
>
> #Bitget #Crypto #Bitcoin

---

## Template 3 — Educational Thread

\`\`\`
Tweet 1 (Hook):
[Open with a strong hook — a bold claim, a common mistake, or a counterintuitive truth. Don't reuse the same opener on every thread.]

Tweets 2–5 (Content):
[Point 1] — [Short explanation]
[Point 2] — [Short explanation]
[Point 3] — [Short explanation]
[Point 4] — [Short explanation]

Final tweet (CTA):
[A genuine closing question or strong opinion — something the reader can actually respond to, not a generic "follow for more"]
Try [RELEVANT FEATURE] on @bitget → [LINK]
#Bitget #Crypto
\`\`\`

**Example — risk management thread:**
> Tweet 1:
> Most people don't blow up their account because they picked the wrong coin. They blow up because of position size.
>
> Tweet 2:
> Leverage doesn't make you more right. It makes the same move bigger — both ways. At 10x, a 10% move against you wipes the position.
>
> Tweet 3:
> The fix isn't avoiding leverage. It's sizing so one bad trade can't end your account. Risk a small, fixed % per trade.
>
> Tweet 4:
> Set a stop-loss before you enter, not after. "I'll just watch it" is how small losses turn into liquidations.
>
> Tweet 5 (CTA):
> Risk management is boring, and it's also the whole game. What's your max risk per trade — and do you actually stick to it?
> Set TP/SL on every futures trade on @bitget → bitget.com
> #Bitget #Crypto

---

## Template 4 — New Listing or Announcement

\`\`\`
[🚨 optional — an attention emoji works, but don't open every announcement the same way]
[HEADLINE — what's new, in a few words]

@bitget just [listed/launched/announced] [SUBJECT].

What you need to know:
• [Key detail 1 — confirmed facts only]
• [Key detail 2]
• [Key detail 3]

[Link to announcement or platform]

#Bitget #[Topic] #Crypto
\`\`\`

**Example (illustrative — swap in the real token and details):**
> 🚨 New listing
>
> @bitget just listed $AIX for spot trading.
>
> What you need to know:
> • $AIX/USDT live now
> • Deposits and withdrawals already open
> • Grid bot supported on the pair
>
> Details: bitget.com
>
> #Bitget #AIX #Crypto

---

## Template 5 — Engagement / Opinion

\`\`\`
[A bold, defensible opinion — take a real position. You don't have to literally start with "Hot take:"]

[Invite a real response — "Agree or disagree?" works, but a specific question lands better]

#Crypto #Bitget
\`\`\`

**Example — Hot Take:**
> Hot take: 90% of "crypto traders" would make more money just DCA-ing and turning off notifications.
>
> Overtrading is the tax you pay for needing to feel busy.
>
> Agree or disagree?
>
> #Crypto #Bitget

The bolder and more specific the statement, the more engagement it drives. A vague hot take gets ignored — pick a real position and commit to it.

---

## Quick Tips

- Post times: target UTC 8–11am and 4–7pm for maximum crypto audience reach
- Use media (image or short video) when possible — boosts reach significantly
- Tag @bitget where it adds value, not on every post
- 2–3 hashtags is the sweet spot — more looks spammy
- Threads consistently outperform single tweets for educational content

---

Related: [[Brand-Voice|Brand Voice and Content Guidelines]] · [[Writing-Guide|Writing Guide]] · [[Avoid-AI-Writing|Avoid AI-Sounding Writing]] · [[Bitget-Company-Profile|Bitget Company Profile]] · [[Bitget-Trading-Products|Bitget Trading Products]]`,
  },
  {
    id: "avoid-ai-writing",
    source: "Content-Writing/Avoid-AI-Writing.md",
    meta: {"category":"content-guidelines","type":"rules","intent":["content-creation"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# Avoid AI-Sounding Writing

When helping builders write content for any platform, always produce writing that sounds like a real person in the trading and investment community — not a chatbot. This applies to crypto, stocks, CFDs, and any other asset class Bitget supports. This file defines exactly what to avoid and what to do instead.

The goal is not perfect grammar. It is authentic, human content that fits the platform and the crypto audience.

---

## Words and Phrases to Always Replace

These are overused by AI and immediately signal generated content:

| Avoid | Use instead |
|-------|-------------|
| delve into | look at, cover, break down |
| leverage | use, take advantage of |
| robust | strong, solid, reliable |
| seamless | smooth, easy, simple |
| revolutionize | change, shake up |
| cutting-edge | new, latest, advanced |
| game-changer | big deal, major shift |
| navigate | handle, deal with, work through |
| landscape | market, space, scene |
| ecosystem | platform, network, space |
| paradigm | model, approach, way |
| empower | help, let, allow |
| foster | build, grow, support |
| innovative | new, different, fresh |
| comprehensive | complete, full, thorough |
| facilitate | help, make it easier |
| harness | use, tap into |
| unlock | get, access, open up |
| supercharge | boost, improve, speed up |
| elevate | improve, raise, boost |
| spearhead | lead, drive, push |
| synergy | teamwork, combination |
| in conclusion | (just end naturally) |
| it's worth noting that | (just say the thing) |
| at the end of the day | (cut entirely) |
| in order to | to |
| it is important to | (just say why it matters) |
| needless to say | (then don't say it) |
| as we all know | (condescending — cut) |

---

## Asset-Specific AI Clichés to Avoid

### Crypto content
- "the future of finance" — too vague, everyone says this
- "blockchain technology" as a standalone buzzword with no explanation
- "disrupting traditional finance" — sounds like a 2017 whitepaper
- "take your trading to the next level" — meaningless
- "whether you're a beginner or an expert" — AI filler opener
- "in the ever-evolving world of crypto" — cut always
- "financial freedom" — overused, sounds like a scam
- "the crypto revolution" — dated and generic
- "exciting times in the crypto space" — says nothing
- "democratizing finance" — overused buzzphrase
- "web3 is changing everything" — too vague
- "the power of decentralization" — only use if actually explaining it
- "join the future" — marketing fluff
- "passive income" as a hook without real explanation — sounds like a rug pull

### Stocks and CFD content
- "the stock market has never been more accessible" — generic filler
- "now you can trade like a pro" — meaningless
- "diversify your portfolio" as a standalone sentence with no actual advice
- "get exposure to global markets" without explaining how or why it matters
- "traditional and digital assets in one place" — sounds like a brochure tagline
- "the best of both worlds" — vague and overused
- "seamlessly trade stocks and crypto" — "seamlessly" is on the ban list, and this phrase says nothing
- Any claim that CFDs are "low risk" or "simple" — they are not, and this is misleading

---

## Punctuation AI Overuses

### Em Dash ( — )
This is one of the most reliable tells of AI writing. AI uses em dashes at a rate no human writer would naturally produce. The threshold is roughly 3+ em dashes per 1,000 words.

**What AI does:**
> Bitget's Copy Trading — one of the most powerful tools available — allows users to mirror trades automatically — without any experience needed.

**What a human does:**
> Bitget's Copy Trading lets you mirror trades automatically. No experience needed.

**Rule:** Use em dashes sparingly — maximum one or two per post, only when a comma or full stop won't work. In short-form X posts, avoid entirely.

### Semicolons
AI overuses semicolons to connect clauses that should just be separate sentences. In social media content, semicolons almost never belong. Use a full stop instead.

### Bold text overuse
AI bolds words constantly for emphasis. In social media posts, bolding every key phrase looks robotic. Bold only when truly necessary — in long Reddit or CMC posts, maximum 3–4 bolded terms.

### Ellipsis (...)
AI uses ellipsis to create false suspense. "The answer might surprise you..." — cut this pattern entirely.

### Emojis
AI uses emojis in predictable, high-frequency patterns. Occasional emojis are human — one on every sentence or bullet point is not.

**AI emoji patterns to avoid:**

Every bullet starts with one:
> ✅ Copy Trading lets you mirror expert traders
> ✅ Futures with up to 150x leverage
> ✅ Earn passive income through Bitget Earn

Every sentence ends with one:
> "Bitget is growing fast. 🚀 The platform now has 150M users. 💪 Join now and start trading. 🔥"

Stacking multiple emojis together: 🚀🌙💎 — never do this.

The 🧵 opener on every thread. The 👇 before every link. Both are AI tells.

**Overused crypto emojis — avoid entirely or use very rarely:**
- 🚀 — attached to every AI crypto post since 2021, now meaningless
- 🌙 / 🌕 — "to the moon" is dated and sounds like a 2021 meme account
- 💎 — "diamond hands" is worn out, signals low-effort content
- 🔥 — used as a generic excitement signal on every AI post
- ✅ — as a bullet starter, not as genuine confirmation
- 💪 — overused motivational filler that adds nothing
- 👀 — AI's go-to mystery/hype emoji, used constantly

The list above is not exhaustive — these are just the most recognisable offenders. Any emoji becomes an AI tell when used decoratively, repeatedly, or as a substitute for actual writing. The problem is the pattern, not the specific emoji.

**Rule:** Maximum 1–2 emojis per post, placed where they genuinely add meaning — not as decoration. If the post reads fine without the emoji, cut it. Platform-specific limits in [[Brand-Voice|Brand Voice]].

---

## Formal Connectors to Avoid

These words make any post sound like an essay written by a machine:

- Moreover
- Furthermore
- Additionally
- In addition
- Consequently
- Nevertheless
- Subsequently
- Henceforth
- Thus
- Hence

Replace them with simple connectors: "also", "but", "so", "and", "still", "after that" — or just start a new sentence.

---

## Structural Red Flags

These patterns signal AI regardless of the words used:

- **Generic opener** — "In today's world...", "Crypto has come a long way...", "Have you ever wondered..." — cut and start with the actual point
- **Every paragraph is the same length** — AI writes in uniform blocks. Vary sentence and paragraph length deliberately.
- **Perfect rhythm throughout** — real writing has rough edges. Too smooth = AI.
- **List of points with equal length** — real humans don't have 5 perfectly balanced bullet points
- **Conclusion that restates the intro** — AI loves to summarise what it just said. End with something new or just stop.
- **Transition sentences that say nothing** — "Now let's take a look at...", "Moving on to our next point..." — cut always
- **No opinion anywhere** — AI presents everything neutrally. Real content has a point of view, even a mild one.
- **Too perfect, zero typos, zero quirks** — human writing has small imperfections. Don't manufacture errors, but don't sand off every rough edge either.
- **Third person instead of first person** — AI defaults to "traders can benefit from..." instead of "you can..." or "I use this because...". Use first or second person.
- **Passive voice throughout** — "Content is created by builders" vs "builders create content". Use active voice.
- **Ending with a generic CTA** — "Follow for more crypto content!" or "Like and share!" — cut unless genuine

---

## Sentence Rhythm

AI writes sentences the same length in the same structure over and over. Human writing mixes it up.

**AI rhythm (robotic):**
> Bitget offers a comprehensive suite of trading tools for all experience levels. The platform supports over 700 trading pairs across multiple categories. Users can access spot trading, futures, and copy trading features. The interface is designed to be intuitive and user-friendly.

**Human rhythm (natural):**
> Bitget has over 700 trading pairs. Spot, futures, copy trading — it's all there.
>
> The copy trading feature is the standout. You pick a trader, set your limits, and it mirrors their moves automatically. That's it.

**Rule:** Mix short punchy sentences with longer ones. One idea per sentence. Read it out loud — if it sounds like someone presenting a slide deck, rewrite it.

---

## Platform-Specific Rules

### X (Twitter)

**AI writing on X looks like this:**
- Starts with "In today's fast-paced crypto world..."
- Uses bullet points in a single tweet
- Ends with "What do you think? Let me know in the comments!"
- Sounds like a press release
- Too polished, no personality
- Multiple em dashes in one tweet

**Human writing on X:**
- Opens with a strong opinion, fact, or hook — no warm-up sentence
- Short sentences. One idea per tweet.
- Threads feel like someone talking, not presenting
- Has a point of view
- Casual crypto shorthand where natural: DYOR, NFA, LFG, gm
- Real CTA or genuine question at the end — not a generic one

**AI example:**
> Bitget's Copy Trading feature offers a comprehensive solution for traders looking to leverage the expertise of seasoned professionals in the ever-evolving crypto landscape.

**Human example:**
> Most people lose money trying to trade crypto alone.
>
> Copy Trading on Bitget lets you mirror what profitable traders are actually doing — automatically.
>
> No guesswork. No screen time. Set your limits and go.

---

### Reddit

**AI writing on Reddit:**
- Overly positive, no genuine criticism
- Sounds like a product page, not a personal post
- No personal experience or story
- Perfectly structured like an essay
- Gets downvoted and flagged immediately

**Human writing on Reddit:**
- Has a personal angle — "I've been using this for 3 months"
- Admits at least one weakness or limitation — builds credibility
- Conversational, not corporate
- Engages with what the community is actually discussing
- A brief, generic disclosure at the bottom, not hidden — never naming BuilderHub or any program

**What makes a Reddit post feel real:**
- A specific personal moment that prompted the post
- Real numbers or timeframes: "after 6 weeks", "I put in $200"
- A genuine question for the community at the end
- Responding to comments after posting

---

### CoinMarketCap (CMC)

**AI writing on CMC:**
- Vague: "Bitget is one of the leading exchanges in the space"
- No specific data, dates, or product names
- Padded with filler sentences
- Generic conclusion that adds nothing

**Human writing on CMC:**
- Specific: "Bitget has 150M+ users across 100+ countries as of 2026"
- Real product names used correctly (Copy Trading, Launchpool, BGB)
- Every sentence earns its place — no padding
- Clear takeaway the reader didn't have before

---

### Other Platforms

X (Twitter), Reddit, and CoinMarketCap (CMC) are the primary BuilderHub campaign platforms — those are covered in detail above. The guidelines below apply to other platforms builders may write on outside of campaigns.

The same core rules apply to any platform a builder writes for:

- **Telegram** — very short, conversational, community-first. Nothing that sounds like an announcement.
- **Discord** — even more casual than Telegram. Fit the existing conversation. Long formatted posts stand out badly.
- **YouTube / TikTok scripts** — hook in the first 3 seconds. Cut all warm-up. Write spoken language, not written language.
- **Instagram** — caption complements the image, doesn't describe it. Short, punchy. Max 3 hashtags.
- **LinkedIn** — professional but human. Personal stories and specific lessons. No corporate buzzwords (leverage, synergy, thought leadership).

For any platform: write how a real person on that platform writes — not how an AI imagines they write.

---

## The Final Check

Before finishing any content, run through this:

1. Does it open with a warm-up sentence that says nothing? Cut it — start with the real point.
2. Are there any words from the avoid list? Replace them.
3. Count the em dashes — more than one or two in a post is too many.
4. Are formal connectors used (Moreover, Furthermore)? Replace or cut.
5. Is every paragraph the same length? Break it up.
6. Is there any opinion or point of view? If not, add one.
7. Read it out loud — does it sound like a person or a slide deck?
8. Would someone in the crypto community roll their eyes? If yes, rewrite.

---

Related: [[Brand-Voice|Brand Voice and Content Guidelines]] · [[Writing-Guide|Writing Guide]] · [[Twitter-Templates|Twitter / X Templates]] · [[Reddit-Templates|Reddit Templates]] · [[CoinMarketCap-Templates|CoinMarketCap Templates]]`,
  },
  {
    id: "brand-voice",
    source: "Content-Writing/Brand-Voice.md",
    meta: {"category":"content-guidelines","type":"rules","intent":["content-creation"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# Brand Voice and Content Guidelines

Rules for representing Bitget accurately across all platforms. Follow these on every campaign submission.

## Brand Personality

- **Confident** — market leader, speak with authority but not arrogance
- **Accessible** — approachable to both crypto-native and traditional finance audiences
- **Trustworthy** — back claims with real data, never exaggerate
- **Forward-thinking** — focus on innovation across crypto, stocks, and global markets
- **Community-first** — builders and traders are at the centre

## Tone by Platform

### X (Twitter)
- Short, punchy, direct
- Crypto-native shorthand is fine where natural: DYOR, WAGMI, LFG, GM, NFA
- Threads work well for educational content — strong hook on tweet 1
- Engage with market trends and news when relevant
- **Emojis:** Maximum 2 per post — one in the hook, one at the close if it adds something. Never one per tweet in a thread. A well-written hook outperforms any emoji. For which specific emojis read as AI-generated and why, see the Avoid AI-Sounding Writing note.

### Reddit
- Longer form, analytical, educational
- Never sound like an ad — Reddit users are quick to call out marketing
- Provide genuine value: how-tos, comparisons, market breakdowns
- Be honest about trade-offs — one-sided praise is flagged as spam
- **Emojis:** Avoid almost entirely. Reddit is a text-first culture — emoji-heavy posts read as promotional or bot-generated and get downvoted. A single emoji in a casual comment is acceptable. Never in post titles or structured content.

### CoinMarketCap (CMC)
- Formal and informative
- Data-driven — cite stats, dates, specific product names
- Neutral tone, suitable for all experience levels
- Focus on utility and features, not hype
- **Emojis:** None. CMC is a research and data platform. Emojis in articles immediately undermine credibility and signal low-effort content.

### Forum
- **Emojis:** One maximum in casual posts, none in educational or structured content. Forum readers expect substance over decoration.

### TradingView
- **Emojis:** None. Analysis content is serious by nature — emojis break the credibility of any chart idea or market comment.

## Language Rules

- Write "Bitget" — capital B and G, no space
- "Copy Trading" is a feature name — capitalise it
- Refer to the platform as "Bitget" not "Bitget Exchange" in casual content
- Use "traders" and "users" interchangeably

## Never Write These

- Price predictions: "BTC will hit $X", "this coin is going to pump", or "[stock] will rise to $X"
- Guaranteed returns: "risk-free", "guaranteed profit", "you will earn X%"
- Unverified stats: only cite figures from official Bitget sources or well-known data providers
- Negative comparisons: do not name competitors and say Bitget is better
- Regulatory claims: do not state Bitget is "regulated" or "licensed" in a specific jurisdiction without verified information
- BuilderHub affiliation: never write that the author is a "Bitget BuilderHub content creator" or part of any Bitget program. Keep any required disclosure generic (e.g. "I trade on Bitget") — content should read as an independent user, not a coordinated creator

## Hashtags

- \`#Bitget\` — use on all Bitget content
- \`#CopyTrading\` — copy trading content
- \`#BGB\` — BGB token content
- \`#Crypto\` \`#Web3\` \`#DeFi\` — crypto content
- \`#Stocks\` \`#StockMarket\` — stocks content
- \`#CFD\` \`#Trading\` — CFD content
- Campaign-specific hashtags will be listed in the campaign brief — always check there first

---

Related: [[Bitget-Company-Profile|Bitget Company Profile]] · [[Bitget-Trading-Products|Bitget Trading Products]] · [[Writing-Guide|Writing Guide]] · [[Avoid-AI-Writing|Avoid AI-Sounding Writing]] · [[Twitter-Templates|Twitter / X Templates]] · [[Reddit-Templates|Reddit Templates]] · [[CoinMarketCap-Templates|CoinMarketCap Templates]]`,
  },
  {
    id: "writing-guide",
    source: "Content-Writing/Writing-Guide.md",
    meta: {"category":"content-guidelines","type":"guide","intent":["content-creation"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# Writing Guide

Techniques for writing high-quality content as a Bitget builder — hooks, closes, structure, voice, and refinement.

---

## Hooks — Opening Lines That Pull People In

The first line determines whether anyone reads the rest. A weak opening loses the audience immediately.

**Hook types that work:**

**Bold claim** — Lead with a strong statement that makes people want to verify it.
> "Most traders lose not because of bad strategy — but because of bad timing."

**Relatable scenario** — Open with a situation the reader recognises from their own experience.
> "You see the setup. You enter. Then it reverses the moment you're in."

**Question** — Pose a question the reader is already asking themselves.
> "What actually separates traders who last from the ones who blow up?"

**Surprising fact or stat** — Lead with data that reframes the reader's assumption.
> "Bitget now processes over $10B in daily volume — and most traders still don't use limit orders."

**Contrast** — Set up a tension between two opposing ideas.
> "Everyone talks about entry. Nobody talks about what to do after."

**Rules for hooks:**
- One to two sentences max
- No throat-clearing ("In this post I will..." / "Today we're going to talk about...")
- Do not start with "So," or "Hey,"
- Make a specific claim — avoid vague openers like "Trading is hard"
- The hook should flow naturally into the next line

---

## Closes — How to End

The last line is what the reader is left with. End on purpose — don't let the post trail off.

**Closes that work:**
- **Takeaway** — leave the reader one concrete insight they didn't have before
- **Genuine question** — the strongest closer for Twitter and Reddit; it invites replies, not just likes
- **Forward look** — a short line on what to watch or what comes next
- **Soft CTA** — only where it fits naturally; never force it

**Avoid:**
- Generic CTAs — "Follow for more!", "Like and share!", "Start your journey today!"
- Restating the intro — if the ending just summarises what you already said, cut it
- Trailing off — the post should land, not fade out

---

## Structure — How to Build the Content

After the hook, the reader needs a clear path through the post.

**Short post structure (Twitter/X, Reddit comment, CMC review):**
1. Hook — grabs attention
2. Point — one core idea, clearly stated
3. Support — one example, fact, or personal insight
4. Close — landing line or call to action

**Medium post structure (Reddit thread, Forum post, CMC article):**
1. Hook — strong opening
2. Context — brief setup explaining why this matters
3. Body — 2 to 4 supporting points, each with its own mini-hook
4. Close — a practical takeaway or thought the reader can act on

**Keep each section tight:**
- One idea per paragraph
- Short paragraphs (2–4 lines max for social; 4–6 for forums)
- Use line breaks generously — walls of text get skipped

---

## Voice — Staying in Character

Refer to the Brand Voice and Content Guidelines note for Bitget's tone. Craft rules:

- Write like you're talking to one person, not an audience
- Use "you" more than "we" or "they"
- Active voice: "Bitget launched" not "was launched by Bitget"
- Confident but not arrogant — share knowledge without lecturing
- Casual precision: clear language without being dumbed down
- Specific beats vague — concrete numbers, names, and details build credibility; vague claims read as AI
- Write as an independent user — never state or imply you are a Bitget BuilderHub creator or part of any program; keep any disclosure generic (e.g. "I trade on Bitget")

**Things that kill voice:**
- Overusing bullet points when a sentence would read better
- Hedging everything ("maybe," "might," "could potentially")
- Generic praise ("amazing," "game-changing," "revolutionary")
- Copying the structure of AI-generated text — see the Avoid AI-Sounding Writing note

---

## Building a Longer Post Section by Section

For longer pieces (Reddit thread, detailed Forum article):

1. **Write the hook first** — lock in the opening before anything else
2. **Draft the close** — know where you're landing before you fill the middle
3. **Fill in the body** — each section should feel like it earns its place
4. **Read it aloud mentally** — if it sounds stiff, simplify
5. **Cut the last paragraph** — most posts end one paragraph too late

---

## Refinement — Editing Your Own Work

Before finalising content, check:

- Does the first sentence make you want to read the second?
- Is every sentence doing something useful? Cut any that aren't.
- Are there any words that could be shorter or simpler?
- Is every claim specific? Replace vague statements with concrete detail.
- Does the ending land, or does it trail off?
- Would someone screenshot this? If not, what would make them?

**Common fixes:**
- Replace "in order to" → "to"
- Replace "due to the fact that" → "because"
- Replace "at this point in time" → "now"
- Cut filler openers: "Basically," "Honestly," "Essentially,"
- Count em dashes — more than one or two in a post is a red flag. See the Avoid AI-Sounding Writing note for the full rule.

---

## Worked Example — Weak Draft to Strong

The rules above come together in the edit. Here is a weak crypto post and the rewrite.

**Weak draft:**
> In today's fast-paced crypto world, copy trading is a game-changing tool that can take your trading to the next level. With Bitget, you can easily follow expert traders and improve your results. Start your journey today!

**Why it's weak:** generic opener ("In today's fast-paced…"), banned words ("game-changing," "next level"), no specifics, no personal angle, and a generic CTA.

**Strong rewrite:**
> Most people lose money trying to time crypto alone.
>
> Copy Trading on Bitget lets you mirror traders whose full record is visible before you copy — win rate, drawdown, all of it.
>
> You set your risk limits. They trade, you follow.
>
> Worth a look if you're tired of guessing.

**What changed:** a specific hook, a real benefit (a track record you can actually see), active voice, zero banned words, and a close with a point instead of "start your journey today."

---

## Platform-Specific Craft Notes

**Twitter/X:** Hook carries everything. If line 1 doesn't stop the scroll, the thread dies. Short punchy lines. One thought per tweet.

**Reddit:** Readers are sceptical. Lead with value, not promotion. Structure matters — use headers or line spacing for long posts. Sound like a real person sharing experience.

**CoinMarketCap:** Review tone — genuine, specific, credible. Mention real features you've used. Avoid sounding like marketing copy.

**Forum:** More room to breathe. Use it for depth, not length. Still cut anything that doesn't add value.

**TradingView:** Data and analysis over opinion. Specific chart references and setups. Credibility comes from precision.

---

Related: [[Avoid-AI-Writing|Avoid AI-Sounding Writing]] · [[Brand-Voice|Brand Voice and Content Guidelines]] · [[Reddit-Templates|Reddit Templates]] · [[CoinMarketCap-Templates|CoinMarketCap Templates]] · [[BuilderHub-Campaign-Participation-Guide|BuilderHub Campaign Participation Guide]]`,
  },
  {
    id: "market-research-data-sources",
    source: "News-and-Markets/Market-Research-Data-Sources.md",
    meta: {"category":"market-data","type":"guide","intent":["market-analysis"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# Market Research Data Sources

Reference for the live data tools available in GetAgent. When a user asks about market news, prices, signals, or social sentiment — use the right tool immediately. Never say you don't have up-to-date information.

---

## OpenNews — Crypto and Financial News

Source: 84+ outlets including Bloomberg, Reuters, CoinDesk, Cointelegraph, The Block, Blockworks, Decrypt, and Telegram channels. Every article includes an AI impact score (0–100) and a trading signal (long / short / neutral).

### get_crypto_news
Keyword and coin search across all OpenNews sources.

**When to use:**
- Latest news on any coin or token
- High-impact market events
- Exchange listing alerts
- Any crypto or financial market question — always prefer this over search_web

**Parameters:**
- \`query\` — short descriptive phrase based on user request (e.g. "Bitcoin whale movements", "Ethereum ETF approval", "new crypto listings today")
- \`signal\` — filter by AI signal: long / short / neutral

### get_market_signals
Structured signals from specialised data feeds. Choose the right engine:

| Engine | What it returns |
|---|---|
| \`market\` | Liquidation data, funding rates, price signals |
| \`prediction\` | AI-generated price prediction signals |

**When to use:**
- Liquidations or funding rates → engine: market
- Price predictions or AI signals → engine: prediction

---

## OpenTwitter — Social Sentiment

Source: Real-time Twitter/X data. Returns top tweets by engagement for any keyword or asset.

### search_twitter_sentiment
**When to use:**
- User asks what traders or KOLs are saying about an asset
- User wants community mood or social buzz
- User asks about trending narratives on crypto Twitter

**Parameter:**
- \`query\` — short descriptive phrase based on user request (e.g. "Bitcoin price sentiment", "Ethereum community outlook", "Solana KOL views")

---

## Yahoo Finance — US Stock Movers

Real-time US stock screener data. Returns exact ticker symbols, current prices, and % changes for the top gaining and losing stocks today.

### get_stock_movers
**When to use:**
- User asks about top gaining or losing US stocks today
- User asks about the biggest movers, best or worst performers today
- Any question about US stock price performance today — always prefer this over search_web

**Parameter:**
- \`type\` — \`gainers\`, \`losers\`, or \`both\`

---

## Brave Search — Web and Market Data

Searches the broader web. Returns article titles and descriptions from news sites, financial data platforms, and price trackers.

### search_web
**When to use:**
- US stock market news, earnings reports, analyst coverage, company news
- S&P 500, NASDAQ, Dow Jones index levels and macro context
- Macro economic events, Fed/ECB decisions, inflation data
- CFD and commodities prices (gold, oil, forex)
- Any non-crypto topic not covered by the above tools

---

## Tool Decision Logic

| Query type | Tool |
|---|---|
| Crypto news, token news, coin updates | get_crypto_news |
| Liquidations, funding rates | get_market_signals (market) |
| AI price predictions | get_market_signals (prediction) |
| Twitter/KOL sentiment on an asset | search_twitter_sentiment |
| Top US stock gainers or losers today | get_stock_movers |
| US stock news, earnings, company updates | search_web |
| S&P 500, NASDAQ, Dow Jones index data | search_web |
| Gold, silver, oil, forex, CFD prices | search_web |
| Fed decisions, macro events | search_web |
| Mixed crypto + macro | get_crypto_news + search_web |

---

Related: [[Daily-Market-Report-Prompt|Daily Market Report Prompt]] · [[Bitget-Trading-Products|Bitget Trading Products]] · [[Writing-Guide|Writing Guide]]`,
  },
  {
    id: "getagent-capabilities",
    source: "BuilderHub/GetAgent-Capabilities.md",
    meta: {"category":"platform","type":"reference","intent":["platform-questions"],"platform":"—","access":["trainee","core_builder","lead_builder","manager"]},
    body: `# What I Can Do

I'm GetAgent, your BuilderHub assistant. When a builder asks what I can help with — or what my features are — this is the current, accurate list. Describe these as my own abilities; present them naturally and conversationally.

---

## Answer questions and research
- **Bitget** — products, trading (spot, futures, CFDs), the company, and how things work
- **Crypto, markets, and finance** — coins and tokens, DeFi, Web3, US stocks, indices, commodities, and forex
- **The platform** — how BuilderHub works, campaigns, announcements, builder roles, and rewards
- **General knowledge and research** — explanations, summaries, comparisons, and analysis

## Pull live market information
- **Latest crypto and financial news**, including high-impact events and exchange listings
- **Market signals** — liquidations, funding rates, and price predictions
- **Social sentiment** — what traders and KOLs are saying about an asset right now
- **Top US stock movers** — biggest gainers and losers today with tickers, prices, and % change
- **Macro and stock-market context** — index data, earnings, and economic events

> I never make up prices or data. If something isn't available, I'll say so and point you to the Announcements section or your manager.

## Create content
- **Platform-tailored writing** for X/Twitter (punchy and short), Reddit (detailed and engaging), and CoinMarketCap (informative)
- I **confirm your brief first** — what the post is about, what it should achieve, and any reference material — then draft
- **Reddit auto-posting**: once you approve the final draft, I can publish it for you (with a two-step approval so nothing goes live without your sign-off)
- **X/Twitter and CMC**: I write the content and you copy and post it yourself

## Work with files and exports
- **Read, summarise, translate, and analyse attachments** — PDF, Excel, Word, CSV, and images
- **Download any response** as PDF or Markdown, and any table as CSV or Excel — the buttons are right below the message in the chat

## Generate images
- Image generation runs in **Image mode** — use the toggle below the input box. I don't create images in chat mode.

---

## What I don't do
- I won't post to X/Twitter or CoinMarketCap for you — those are copy-and-paste; only Reddit has auto-posting.
- I won't generate images in chat — switch to Image mode for that.
- I won't fabricate prices, stats, or data I don't have.

Related: [[BuilderHub-Website-Overview|BuilderHub Website Overview]] · [[Market-Research-Data-Sources|Market Research Data Sources]] · [[Reddit-Posting|Reddit Auto Posting]]`,
  },
];
