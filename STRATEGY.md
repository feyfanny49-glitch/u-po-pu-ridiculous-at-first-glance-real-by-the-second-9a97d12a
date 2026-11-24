# Strategy

## What the kit actually asks for

- `program/v1`, no input data, no network, no environment secrets. The program's
  one job is to write a single UTF-8 text to `/output/entry.txt`.
- The sealed gate accepts 1–200 characters, not whitespace-only. Anything else
  is marked invalid and can never win a prize.
- The judge is a seed investor comparing two pitches pairwise, with the criteria
  in a strict priority order: a *bizarre startup idea* first, then genuine
  novelty (not a familiar trade with a strange adjective), then business logic
  that says who pays and why, then the one-sentence laugh-to-nod turn, then
  concrete naming of the thing and the buyer. A pair is decided at the first
  criterion where they differ unless a later difference is much larger.
- Final placement is a Bradley–Terry win rate over fresh final-heat games; exact
  ties go to more playoff wins, then the smaller text, then the earlier receipt.

## How the entrypoint is derived from that

`main.ts` does not fetch or hardcode someone else's answer. It encodes the five
judge criteria as an ordered score vector, holds four pitches worked up against
those criteria, and selects with a comparator that follows the judge's own
"first difference decides, unless a later gap is much larger" rule. The chosen
text is then put through the same caps the gate applies (character count,
non-blank, exactly one sentence ending) before it is written. Selection is
deterministic, so both grading runs produce byte-identical artifacts.

## Why this pitch

> We sell a stranger's emergency-contact slot to lonely people who pay to be
> needed, and to the stranger who pays us so that at 3am someone finally answers.

- Bizarre *startup*: the product is a slot in somebody else's emergency
  contacts — an absurd thing to put on a price tag.
- Genuinely novel: it is not "rent a friend" with a new adjective; the unit
  sold is a specific, useless-looking field on a phone that turns out to be a
  scarce social resource.
- The money is in the sentence, on both sides: lonely buyers pay for the role
  of being needed, and the person with no one to call pays for a number that
  answers. That is the "ridiculous at first glance, real by the second" turn.
- Concrete and one-sentence: the odd thing is named, both buyers are named, and
  `3am` supplies the vividness without spending characters on abstraction.
  It is comfortably inside the 200-character cap.

The runner-up (renting the empty chair at a stranger's dinner table) is a
strong pitch but is closer to the familiar rent-a-companion trade, so it loses
at criterion 2. The other candidates fail earlier: dust under the bed is a
business with a strange adjective, and naming a hurricane after an ex leans on
shock value with no clear payer.

## Revision record

The entrypoint was written, then revised in a second pass: the winning line was
shortened so it ends on "someone finally answers" rather than "answers the
phone", its pitch-landing score was updated, and the self-gate was extended to
check the one-sentence shape. No submission was made.
