# Basic Cloze Cards

!!! Question "Question For Ocimar"

    In your description you've got "simplified cloze" and "classic cloze" which I've grouped here under "basic cloze".

    This means that at the top level we have 3 items – (1) Basic Cloze (2) Advanced Cloze and (3) Custom Cloze Syntax – Which I think would be easy for a new user to navigate.

    I've removed the "simplified" and "classic" terms, as I think it might be confusing – also "classic" implies original functionality, but it includes the new syntax to support groups. I don't think anything is lost by removing those terms.



With [Single & Multiline Cards](../flashcards/qanda-cards.md) the text of both the front and back of each card is specified.

With `cloze` cards a single text is specified, together with an identification of which parts of the text should be obscured.

The front of the card is displayed as the text with (one or more) `cloze deletions` obscured.

## Cloze Deletions

A part of the card text is identified as a cloze deletion by surrounding it with the `cloze delimiter`.

### Single Cloze Deletion
By default, the cloze delimiter is `==`, and a simple cloze card would be:
```
The first female prime minister of Australia was ==Julia Gillard==
```

!!! note "Displayed when reviewed"
    <div class="grid" markdown>

    !!! tip "Initial View"

        The first female prime minister of Australia was [...]

    !!! tip "After `Show Answer` Clicked"

        The first female prime minister of Australia was Julia Gillard

    </div>

    

### Multiple Cloze Deletions
If the card text identifies multiple parts as cloze deletions, then multiple cards will be shown for review, each one occluding one deletion, while leaving the other deletions visible.

For instance, the following note:
```
The first female ==prime minister== of Australia was ==Julia Gillard==
```

!!! note "Initial View"
    <div class="grid" markdown>

    !!! tip "Card 1"

        The first female [...] of Australia was Julia Gillard

    !!! tip "Card 2"

        The first female prime minister of Australia was [...]

    </div>

!!! note "After `Show Answer` Clicked (same for both cards)"

    The first female prime minister of Australia was Julia Gillard

These two cards are considered sibling cards. See [sibling cards](flashcards-overview.md#sibling-cards) regarding the 
[Bury sibling cards until the next day](../user-options.md#flashcard-review) scheduling option.

## Cloze Delimiter

The cloze delimiter can be modified in [settings](../user-options.md#flashcard-review) to:

- `==` (the default)
- `**`, or 
- curly braces `{{text in curly braces}}`.


## Cloze Hints

Hints can be included for any of the cloze deletions, using the `^[text of hint]` syntax. For example:

```
Kaleida, funded to the tune of ==$40 million==^[USD]
by Apple Computer and IBM in ==1991==^[year]
```

!!! note "Initial View"
    <div class="grid" markdown>

    !!! tip "Card 1"

        Kaleida, funded to the tune of [USD] by Apple Computer and IBM in 1991

    !!! tip "Card 2"

        Kaleida, funded to the tune of $40 million by Apple Computer and IBM in [year]

    </div>

!!! note "After `Show Answer` Clicked (same for both cards)"

    Kaleida, funded to the tune of $40 million
    by Apple Computer and IBM in 1991
    
## Deletion Groups

!!! Question "Question For Ocimar"
    In your pull request you have used terms "Numbered Clozes" and "sequence number"
    and "... used to sort and group deletions".

    I'm thinking that we probably shouldn't use "sequence number" as I think it would imply that
    each number would be distinct... 1, 2, 3...

    

    Also, can you explain the "sort" aspect of this functionality

In the above examples, each card shown for review has one cloze deletion shown and all the others obscured.

!!! Question "Question For Ocimar"
    Which do you prefer?
    And is it technically correct to say `card number`? (Ignoring review randomization functionality)

    Option 1 - `Deletion groups` allow this to be tailored by specifying a `group number` for each cloze deletion.<br/>
    Option 2 - `Numbered clozes` allow this to be tailored by specifying a `group number` for each cloze deletion. <br/>
    Option 3 - `Deletion groups` allow this to be tailored by specifying a `card number` for each cloze deletion. <br/>
    Option 4 - `Numbered clozes` allow this to be tailored by specifying a `card number` for each cloze deletion.

For example:
```
This is ==in group 1==[^1], this ==in group 2==[^2] 
and this also ==in group 1==[^1]
```
!!! note "Initial View"
    <div class="grid" markdown>

    !!! tip "Card 1"

        This is  [...], this in group 2 and this also [...]

    !!! tip "Card 2"

        This is in group 1, this  [...] and this also in group 1

    </div>

!!! note "After `Show Answer` Clicked (same for both cards)"

    This is in group 1, this in group 2 and this also in group 1

!!! warning
    When using deletion groups, every cloze deletion must include the group number
    !!! Question "Question For Ocimar - Is that correct?"

### Anki style

Anki style syntax is supported, see [Custom Cloze Syntax](custom-cloze-patterns.md)


